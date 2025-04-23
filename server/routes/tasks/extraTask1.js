const express = require('express');
const router = express.Router();

// Для fetch в Node.js
const fetch = global //(...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

router.post('/proxy', async (req, res) => {
  try {
    const { url, method, headers, body } = req.body;

    // 🔍 ЛОГИРУЕМ ПРИХОДЯЩИЙ ЗАПРОС
    console.log('📡 Получен прокси-запрос:');
    console.log('➡️ Метод:', method);
    console.log('🌍 URL:', url);
    console.log('📬 Заголовки:', headers);
    console.log('📝 Тело:', body);

    // Валидация URL
    if (!url || !/^https?:\/\/.+/.test(url)) {
      return res.status(400).json({ error: 'Некорректный URL' });
    }

    // Формируем опции для fetch
    const fetchOptions = {
      method: method || 'GET',
      headers: headers || {},
    };

    if (body && method !== 'GET' && method !== 'HEAD') {
      // Проверка на Content-Type и сериализация при необходимости
      if (
        headers['Content-Type']?.includes('application/json') ||
        headers['content-type']?.includes('application/json')
      ) {
        fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
      } else {
        fetchOptions.body = body;
      }
    }

    // Выполняем прокси-запрос
    const response = await fetch(url, fetchOptions);
    const contentType = response.headers.get('content-type') || '';
    let responseBody;

    // Обработка типов контента
    if (contentType.includes('application/json')) {
      responseBody = await response.json();
    } else if (contentType.startsWith('image/')) {
      const buffer = await response.arrayBuffer();
      responseBody = Buffer.from(buffer).toString('base64');
    } else {
      responseBody = await response.text();
    }

    // 🔁 ЛОГИРУЕМ ОТВЕТ
    console.log('✅ Ответ от целевого сервера:');
    console.log('📥 Статус:', response.status, response.statusText);
    console.log('📦 Заголовки:', Object.fromEntries(response.headers.entries()));
    console.log('📄 Content-Type:', contentType);

    // Отправляем клиенту
    res.json({
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      contentType,
      body: responseBody,
      isBase64Encoded: contentType.startsWith('image/')
    });

  } catch (err) {
    console.error('❌ Ошибка при выполнении запроса:', err);
    res.status(500).json({ error: 'Ошибка при выполнении запроса' });
  }
});

module.exports = router;