const express = require('express');
const path = require('path');
const tasksRouter = require('./routes');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const cors = require('cors');

const app = express();
const PORT = 3333;

// Пути к файлам
const TEMP_DATA_PATH = path.join(__dirname, './routes/data/temp.json');
const SUCCESS_FILE_PATH = path.join(__dirname, '../build/task4/success.html');
const SAVED_REQUESTS_DATA_PATH = path.join(__dirname, './routes/data/savedRequests.json');

// Middleware
app.use(express.json({
  limit: '100kb', // Лимит для JSON
  verify: (req, res, buf) => {
    if (buf.length > 100 * 1024) {
      throw new Error('Слишком большой запрос');
    }
  }
}));

app.use(bodyParser.urlencoded({
  extended: true,
  limit: '50kb' // Лимит для urlencoded
}));
app.use(express.static(path.join(__dirname, '../build')));
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

// API маршруты
app.use('/api', tasksRouter);

// Защита от XSS и MIME-спуфинга
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

// Статические маршруты для заданий
app.get('/task2', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/task2/index.html'));
});

app.get('/task4', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/task4/index.html'));
});

// Динамическая обработка success страницы для Task4
app.get('/task4/success', async (req, res) => {
  const hash = req.query.hash;
  if (!hash) return res.status(400).send('Hash отсутствует.');

  try {
    const content = await fs.readFile(TEMP_DATA_PATH, 'utf8');
    const tempData = content ? JSON.parse(content) : {};
    const userData = tempData[hash];

    if (!userData) return res.status(404).send('Данные не найдены.');

    const successHtml = await fs.readFile(SUCCESS_FILE_PATH, 'utf8');
    const filledHtml = successHtml
      .replace('<!-- NAME -->', userData.name)
      .replace('<!-- PASSWORD -->', userData.password);

    // Удаляем использованные данные
    delete tempData[hash];
    await fs.writeFile(TEMP_DATA_PATH, JSON.stringify(tempData, null, 2));

    res.send(filledHtml);
  } catch (err) {
    res.status(500).send('Ошибка сервера при обработке success страницы.');
  }
});

// CRUD запросов ExtraTask1
//Create
app.post('/saveRequest', async (req, res) => {
  const newRequest = req.body;
  if (!newRequest || typeof newRequest !== 'object') {
    return res.status(400).send('Некорректные данные');
  }

  newRequest.id = Date.now();

  try {
    let requests = [];
    try {
      const data = await fs.readFile(SAVED_REQUESTS_DATA_PATH, 'utf-8');
      requests = JSON.parse(data);
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
    }

    requests.push(newRequest);
    await fs.writeFile(SAVED_REQUESTS_DATA_PATH, JSON.stringify(requests, null, 2));
    res.json(newRequest);
  } catch (err) {
    res.status(500).send('Ошибка сохранения');
  }
});

//Read
app.get('/savedRequests', (req, res) => {
  fs.readFile(SAVED_REQUESTS_DATA_PATH, 'utf-8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.json([]);
      }
      return res.status(500).send('Server error');
    }
    try {
      const requests = JSON.parse(data);
      res.json(requests);
    } catch (e) {
      res.status(500).send('Invalid data format');
    }
  });
});

// Update
app.put('/updateRequest/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const updatedRequest = req.body;

  if (!updatedRequest || typeof updatedRequest !== 'object') {
    return res.status(400).send('Некорректные данные');
  }

  try {
    const data = await fs.readFile(SAVED_REQUESTS_DATA_PATH, 'utf-8');
    let requests = JSON.parse(data);
    const index = requests.findIndex(item => item.id === id);

    if (index === -1) {
      return res.status(404).send('Запись не найдена');
    }

    updatedRequest.id = id; // сохраняем оригинальный ID
    requests[index] = updatedRequest;

    await fs.writeFile(SAVED_REQUESTS_DATA_PATH, JSON.stringify(requests, null, 2));
    res.json(updatedRequest);
  } catch (err) {
    res.status(500).send('Ошибка при обновлении');
  }
});

//Delete
app.delete('/deleteRequest/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).send('Некорректный ID');

  try {
    const data = await fs.readFile(SAVED_REQUESTS_DATA_PATH, 'utf-8');
    let requests = JSON.parse(data);
    const initialLength = requests.length;
    requests = requests.filter(req => req.id !== id);

    if (requests.length === initialLength) {
      return res.status(404).send('Request not found');
    }

    await fs.writeFile(SAVED_REQUESTS_DATA_PATH, JSON.stringify(requests, null, 2));
    res.send({ success: true });
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(404).send('No requests found');
    res.status(500).send('Ошибка при удалении');
  }
});


// Фоллбэк для React (если путь не найден среди вышеуказанных)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running at: http://178.250.247.67:${PORT}`);
});
