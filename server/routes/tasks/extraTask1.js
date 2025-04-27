const express = require('express');
const router = express.Router();

router.post('/proxy', async (req, res) => {
  try {
    // Валидация входных данных
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Ошибка в body запроса' });
    }

    const { url, method = 'GET', headers = {}, body } = req.body;

    // 🔍 ЛОГИРУЕМ ПРИХОДЯЩИЙ ЗАПРОС (после деструктуризации!)
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
    const responseHeaders = Object.fromEntries(response.headers.entries());
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Обработка изображений и бинарных данных
    if (contentType.startsWith('image/')) {
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      return res.json({
        status: response.status,
        contentType,
        body: `data:${contentType};base64,${base64}`
      });
    }
    
    // 🔁 ЛОГИРУЕМ ОТВЕТ
    console.log('✅ Ответ от целевого сервера:');
    console.log('📥 Статус:', response.status, response.statusText);
    console.log('📦 Заголовки:', responseHeaders);
    console.log('📄 Content-Type:', contentType);

    // Отправляем ответ клиенту
    res.json({
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      contentType: contentType,
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