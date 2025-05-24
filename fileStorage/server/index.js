import express from 'express';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import WebSocket, { WebSocketServer } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3335;
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const META_PATH = path.join(UPLOAD_DIR, 'meta.json');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.use('/uploads', express.static(UPLOAD_DIR));
app.use(express.json());

const uploadMap = new Map();

app.post('/upload', (req, res) => {
  const uploadId = req.headers['x-upload-id'];
  const rawFilename = req.headers['x-filename'];
  const totalSize = parseInt(req.headers['x-filesize'], 10);
  const comment = req.headers['x-comment'] || '';

  if (!uploadId || !rawFilename || !totalSize) {
    return res.status(400).json({ error: 'Missing upload headers' });
  }

  const filename = path.basename(rawFilename);
  const filePath = path.join(UPLOAD_DIR, filename);
  const stream = fs.createWriteStream(filePath, { flags: 'w' });

  const upload = uploadMap.get(uploadId) || {
    ws: null,
    received: 0,
    size: totalSize,
    comment,
    filePath,
    stream,
    status: 'uploading',
  };

  Object.assign(upload, { stream, filePath, size: totalSize, status: 'uploading', comment });
  uploadMap.set(uploadId, upload);

  // ==== Безопасная обработка ошибок записи ====
  stream.on('error', async (err) => {
    console.error('Ошибка записи в файл:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Write stream error' });
    }

    try {
      await fsPromises.unlink(filePath);
    } catch {}

    uploadMap.delete(uploadId);
  });

  req.on('data', chunk => {
    try {
      if (upload.status === 'cancelled' || !upload.stream || upload.stream.destroyed) return;

      upload.received += chunk.length;

      if (upload.ws?.readyState === WebSocket.OPEN) {
        upload.ws.send(JSON.stringify({
          type: 'progress',
          uploadId,
          progress: Math.floor((upload.received / upload.size) * 100),
          received: upload.received,
          total: upload.size,
          comment: upload.comment,
        }));
      }

      if (!upload.stream.write(chunk)) {
        req.pause();
        upload.stream.once('drain', () => req.resume());
      }
    } catch (err) {
      console.error('Ошибка при записи в поток:', err);
    }
  });

  req.on('aborted', async () => {
    console.log(`Загрузка ${uploadId} прервана (aborted)`);

    upload.status = 'aborted';

    try {
      upload.stream?.destroy();
    } catch (err) {
      console.error('Ошибка при destroy потока:', err);
    }

    try {
      await fsPromises.unlink(upload.filePath);
    } catch (err) {
      if (err.code !== 'ENOENT') console.error('Ошибка при удалении файла после aborted:', err);
    }

    if (upload.ws?.readyState === WebSocket.OPEN) {
      upload.ws.send(JSON.stringify({ type: 'aborted', uploadId }));
    }

    uploadMap.delete(uploadId);
    // Не вызываем res.status/res.end — клиент прервал соединение
  });

  req.on('end', async () => {
    if (upload.status === 'cancelled' || upload.status === 'aborted') {
      return; // Загрузка не завершалась корректно
    }

    if (!upload.stream || upload.stream.destroyed) {
      uploadMap.delete(uploadId);
      if (!res.headersSent) {
        return res.status(500).json({ error: 'Stream destroyed before finishing' });
      }
      return;
    }

    upload.stream.end(async () => {
      if (upload.received >= upload.size) {
        upload.status = 'completed';
        console.log(`Файл ${filename} успешно загружен`);

        try {
          let meta = {};
          if (fs.existsSync(META_PATH)) {
            const raw = await fsPromises.readFile(META_PATH, 'utf-8');
            meta = JSON.parse(raw);
          }

          meta[filename] = {
            comment: upload.comment,
            timestamp: Date.now(),
            size: upload.size,
          };

          await fsPromises.writeFile(META_PATH, JSON.stringify(meta, null, 2));

          if (upload.ws?.readyState === WebSocket.OPEN) {
            upload.ws.send(JSON.stringify({
              type: 'done',
              uploadId,
              filePath: `/uploads/${encodeURIComponent(filename)}`,
              comment: upload.comment,
            }));
          }
        } catch (err) {
          console.error('Ошибка при сохранении метаданных:', err);
        }
      }

      uploadMap.delete(uploadId);
      if (!res.headersSent) {
        res.status(200).json({ success: true });
      }
    });
  });

  req.on('error', async err => {
    console.error('Ошибка загрузки:', err);

    try {
      upload.stream?.destroy();
    } catch {}

    try {
      await fsPromises.unlink(filePath);
    } catch {}

    uploadMap.delete(uploadId);

    if (!res.headersSent) {
      res.status(500).json({ error: 'Upload failed' });
    }
  });
});

app.get('/files', async (req, res) => {
  try {
    const files = await fsPromises.readdir(UPLOAD_DIR);
    let meta = {};
    if (fs.existsSync(META_PATH)) {
      const raw = await fsPromises.readFile(META_PATH, 'utf-8');
      meta = JSON.parse(raw);
    }

    const fileList = await Promise.all(
      files.filter(f => f !== 'meta.json').map(async file => {
        const filePath = path.join(UPLOAD_DIR, file);
        const stats = await fsPromises.stat(filePath);
        const comment = meta[file]?.comment ? decodeURIComponent(meta[file].comment) : '';
        return {
          name: file,
          url: `/uploads/${encodeURIComponent(file)}`,
          size: stats.size,
          comment,
        };
      })
    );

    res.json(fileList);
  } catch (err) {
    console.error('Ошибка чтения папки uploads:', err);
    res.status(500).json({ error: 'Не удалось прочитать список файлов' });
  }
});

app.use(express.static(path.join(__dirname, '..', 'client')));

const server = app.listen(PORT, () => {
  console.log(`Сервер запущен: ${PORT}`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', ws => {
  console.log('[WS] Новое соединение');

  ws.on('message', async msg => {
    let data;
    try {
      data = JSON.parse(msg);
    } catch (e) {
      console.warn('Некорректное сообщение по WebSocket:', msg);
      return;
    }

    if (data.type === 'bind' && data.uploadId) {
      const upload = uploadMap.get(data.uploadId);
      if (!upload) {
        uploadMap.set(data.uploadId, {
          ws,
          stream: null,
          received: 0,
          size: 0,
          status: 'waiting',
          comment: '',
        });
      } else {
        upload.ws = ws;
      }
    }

    if (data.type === 'cancel' && data.uploadId) {
      const upload = uploadMap.get(data.uploadId);
      if (upload?.status === 'uploading') {
        upload.status = 'cancelled';
        upload.stream?.destroy();

        try {
          await fsPromises.unlink(upload.filePath);
        } catch (err) {
          if (err.code !== 'ENOENT') console.error('Ошибка при удалении файла после cancel:', err);
        }

        upload.ws?.readyState === WebSocket.OPEN &&
          upload.ws.send(JSON.stringify({ type: 'cancelled', uploadId: data.uploadId }));

        uploadMap.delete(data.uploadId);
        console.log(`Загрузка ${data.uploadId} отменена через WebSocket`);
      }
    }
  });

  ws.on('close', async () => {
    console.log('[WS] Соединение закрыто');
    for (const [id, upload] of uploadMap.entries()) {
      if (upload.ws === ws && upload.status !== 'completed') {
        upload.stream?.destroy();
        try {
          await fsPromises.unlink(upload.filePath);
        } catch { }
        uploadMap.delete(id);
        console.log(`Загрузка ${id} отменена (WebSocket закрыт)`);
      }
    }
  });
});