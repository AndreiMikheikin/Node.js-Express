const express = require('express');
const router = express.Router();

router.post('/proxy', async (req, res) => {
  try {
    // Валидация входных данных
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Ошибка в body запроса' });
    }

    const { url, method = 'GET', headers = {}, body } = req.body;

    // Логирование
    console.log('📡 Получен прокси-запрос:', {
      method,
      url,
      headers,
      body: body && typeof body === 'object' ? '[object]' : body
    });

    // Проверка URL
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL должен быть строкой' });
    }

    try {
      new URL(url); // Валидация URL
    } catch (e) {
      return res.status(400).json({ error: 'Неверный формат URL' });
    }

    // Подготовка запроса
    const fetchOptions = {
      method: method.toUpperCase(),
      headers: {
        'Accept': 'application/json',
        ...headers
      },
      timeout: 10000
    };

    if (body && !['GET', 'HEAD'].includes(method.toUpperCase())) {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    // Выполнение запроса
    const response = await fetch(url, fetchOptions);
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    // Обработка изображений
    if (contentType.startsWith('image/')) {
      const buffer = await response.arrayBuffer();
      return res.json({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        contentType,
        body: `data:${contentType};base64,${Buffer.from(buffer).toString('base64')}`
      });
    }

    // Обработка текстовых данных
    const responseBody = await response.text();

    // Логирование ответа
    console.log('✅ Ответ от сервера:', {
      status: response.status,
      contentType,
      body: responseBody.length > 100 ? `${responseBody.substring(0, 100)}...` : responseBody
    });

    // Отправка ответа
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

module.exports = router;