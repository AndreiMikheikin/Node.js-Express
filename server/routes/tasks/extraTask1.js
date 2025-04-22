const express = require('express');
const router = express.Router();

router.post('/proxy', async (req, res) => {
  try {
    const { url, method, headers, body } = req.body;

    // Валидация URL
    if (!url || !/^https?:\/\/.+/.test(url)) {
      return res.status(400).json({ error: 'Некорректный URL' });
    }

    // Формируем опции для fetch
    const fetchOptions = {
      method: method || 'GET',  // Метод по умолчанию — GET
      headers: headers || {},   // Заголовки запроса
    };

    // Если передано тело, добавляем его в fetch
    if (body && method !== 'GET' && method !== 'HEAD') {
      fetchOptions.body = JSON.stringify(body);  // Сериализуем тело в JSON
    }

    // Выполняем запрос
    const response = await fetch(url, fetchOptions);

    const contentType = response.headers.get('content-type') || '';
    let responseBody;

    // Обрабатываем разные типы контента
    if (contentType.includes('application/json')) {
      responseBody = await response.json();
    } else if (contentType.startsWith('image/')) {
      const buffer = await response.arrayBuffer();
      responseBody = Buffer.from(buffer).toString('base64');
    } else {
      responseBody = await response.text();
    }

    // Возвращаем результат
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
