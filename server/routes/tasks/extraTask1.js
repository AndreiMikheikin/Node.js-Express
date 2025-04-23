const express = require('express');
const router = express.Router();

// Для fetch в Node.js
const fetch = global //(...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

router.post('/proxy', async (req, res) => {
  try {
    const { url, method = 'GET', headers = {}, body } = req.body;

    // Валидация URL
    if (!url || !url.startsWith('http')) {
      return res.status(400).json({ error: 'Invalid URL' });
    }

    // Добавляем обязательные заголовки
    const finalHeaders = {
      'Accept': 'application/json',
      ...headers
    };

    const options = {
      method,
      headers: finalHeaders,
      timeout: 10000 // 10 секунд таймаут
    };

    if (body && method !== 'GET' && method !== 'HEAD') {
      options.body = JSON.stringify(body);
    }

    // Выполняем запрос
    const response = await fetch(url, options);
    
    // Получаем все заголовки ответа
    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    // Определяем Content-Type
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    res.json({
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      contentType,
      body: await response.text()
    });

  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ 
      error: 'Proxy failed',
      details: err.message
    });
  }
});

module.exports = router;