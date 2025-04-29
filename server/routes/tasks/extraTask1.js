const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

router.post('/proxy', async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Ошибка в body запроса' });
    }

    const { url, method = 'GET', headers = {}, body } = req.body;

    console.log('📡 Получен прокси-запрос:', { method, url });

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL должен быть строкой' });
    }

    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ error: 'Неверный формат URL' });
    }

    const fetchOptions = {
      method: method.toUpperCase(),
      headers: {
        'Accept': 'application/json',
        ...headers
      },
      redirect: 'manual'
    };

    if (body && !['GET', 'HEAD'].includes(method.toUpperCase())) {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    const contentType = response.headers.get('content-type');

    if (contentType.startsWith('image/')) {
      if (contentType === 'image/svg+xml') {
        // SVG: читаем как текст
        const svgText = await response.text();

        return res.json({
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          contentType,
          body: svgText
        });
      } else {
        const buffer = await response.arrayBuffer();

        return res.json({
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          contentType,
          body: `data:${contentType};base64,${Buffer.from(buffer).toString('base64')}`
        });
      }
    }

    // Если не картинка — читаем как текст
    const responseBody = await response.text();

    console.log('✅ Ответ от сервера:', {
      status: response.status,
      contentType,
      body: responseBody.length > 100 ? `${responseBody.substring(0, 100)}...` : responseBody
    });

    res.json({
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      contentType,
      body: responseBody
    });

  } catch (err) {
    console.error('❌ Ошибка:', err);
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// CRUD
const SAVED_REQUESTS_DATA_PATH = path.join(__dirname, '../data/savedRequests.json');

// Create + Update
router.post('/saveRequest', async (req, res) => {
  const requestData = req.body;

  if (!requestData || typeof requestData !== 'object') {
    return res.status(400).send('Некорректные данные');
  }

  try {
    let requests = [];
    try {
      const data = await fs.readFile(SAVED_REQUESTS_DATA_PATH, 'utf-8');
      requests = JSON.parse(data);
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
    }

    if (requestData.id) {
      // Обновление по ID
      const index = requests.findIndex(item => item.id === requestData.id);
      if (index !== -1) {
        requests[index] = requestData;
        await fs.writeFile(SAVED_REQUESTS_DATA_PATH, JSON.stringify(requests, null, 2));
        return res.json({ updated: true, data: requestData });
      }
    }

    // Создание новой записи
    requestData.id = Date.now();
    requests.push(requestData);
    await fs.writeFile(SAVED_REQUESTS_DATA_PATH, JSON.stringify(requests, null, 2));
    res.json({ created: true, data: requestData });

  } catch (err) {
    console.error('❌ Ошибка при сохранении или обновлении:', err);
    res.status(500).json({ error: 'Ошибка при сохранении или обновлении', details: err.message });
  }
});

// Read
router.get('/savedRequests', async (req, res) => {
  try {
    const data = await fs.readFile(SAVED_REQUESTS_DATA_PATH, 'utf-8');
    const requests = JSON.parse(data);
    res.json(requests);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.json([]);
    }
    return res.status(500).send('Server error');
  }
});

// Update
/* router.put('/updateRequest/:id', async (req, res) => {
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

    updatedRequest.id = id;
    requests[index] = updatedRequest;

    await fs.writeFile(SAVED_REQUESTS_DATA_PATH, JSON.stringify(requests, null, 2));
    res.json(updatedRequest);
  } catch (err) {
    res.status(500).send('Ошибка при обновлении');
  }
}); */

// Delete
router.delete('/deleteRequest/:id', async (req, res) => {
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

module.exports = router;