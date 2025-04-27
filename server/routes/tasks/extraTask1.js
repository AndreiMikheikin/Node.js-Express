const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

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
      }
    };

    if (body && !['GET', 'HEAD'].includes(method.toUpperCase())) {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

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
        // Остальные картинки: читаем как буфер и кодируем в base64
        const buffer = await response.buffer();
        const base64 = buffer.toString('base64');

        return res.json({
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          contentType,
          body: `data:${contentType};base64,${base64}`
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

module.exports = router;
