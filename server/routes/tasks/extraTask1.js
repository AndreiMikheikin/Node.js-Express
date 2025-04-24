const express = require('express');
const router = express.Router();

router.post('/proxy', async (req, res) => {
  try {
    // Валидация входных данных
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Ошибка в body запроса' });
    }

    const { url, method = 'GET', headers = {}, body } = req.body;

    // 🔍 ЛОГИРУЕМ ПРИХОДЯЩИЙ ЗАПРОС
    console.log('📡 Получен прокси-запрос:');
    console.log('➡️ Метод:', method);
    console.log('🌍 URL:', url);
    console.log('📬 Заголовки:', headers);
    console.log('📝 Тело:', body);

    // Проверка обязательных полей
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Нужен URL в формате string' });
    }

    // Проверка валидности URL
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch (e) {
      return res.status(400).json({ error: 'Не правильный формат URL' });
    }

    // Базовые заголовки
    const requestHeaders = {
      'Accept': 'application/json',
      ...headers
    };

    // Конфигурация запроса
    const fetchOptions = {
      method: method.toUpperCase(),
      headers: requestHeaders,
      timeout: 10000
    };

    // Добавляем тело запроса для не-GET методов
    if (body && !['GET', 'HEAD'].includes(method.toUpperCase())) {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    // Выполняем запрос
    const response = await fetch(url, fetchOptions);
    
    // Получаем ответ
    const responseBody = await response.text();
    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    // 🔁 ЛОГИРУЕМ ОТВЕТ
    console.log('✅ Ответ от целевого сервера:');
    console.log('📥 Статус:', response.status, response.statusText);
    console.log('📦 Заголовки:', Object.fromEntries(response.headers.entries()));
    console.log('📄 Content-Type:', contentType);

    // Отправляем ответ клиенту
    res.json({
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      contentType: response.headers.get('content-type') || 'application/octet-stream',
      body: responseBody
    });

  } catch (err) {
    console.error('❌ Ошибка при выполнении запроса:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;