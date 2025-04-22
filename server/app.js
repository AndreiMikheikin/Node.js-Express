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

//обработка запроса для extraTask1
app.post('/api/proxy', (req, res) => {
  console.log(req.body); // Логируем тело запроса
  res.json({
    status: 'success',
    headers: req.headers,
    contentType: req.headers['content-type'],
    body: req.body,
  });
});

// Фоллбэк для React (если путь не найден среди вышеуказанных)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running at: http://178.250.247.67:${PORT}`);
});
