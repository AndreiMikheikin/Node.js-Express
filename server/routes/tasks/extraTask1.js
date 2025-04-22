const express = require('express');
const router = express.Router();

// Используем встроенный fetch
const { fetch } = global;

router.post('/proxy', async (req, res) => {
  try {
    const { url, method, headers, body } = req.body;

    // Валидация
    if (!url || !/^https?:\/\/.+/.test(url)) {
      return res.status(400).json({ error: 'Некорректный URL' });
    }

    const fetchOptions = {
      method: method || 'GET',
      headers: headers || {}
    };

    if (body && method !== 'GET' && method !== 'HEAD') {
      fetchOptions.body = body;
    }

    // Выполняем запрос
    const response = await fetch(url, fetchOptions);

    const contentType = response.headers.get('content-type') || '';
    let responseBody;

    if (contentType.includes('application/json')) {
        responseBody = await response.json();
      } else if (contentType.startsWith('image/')) {
        const buffer = await response.arrayBuffer();
        responseBody = Buffer.from(buffer).toString('base64');
      } else {
        responseBody = await response.text();
      }

    res.json({
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      contentType,
      body: responseBody
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при выполнении запроса' });
  }
});

module.exports = router;
