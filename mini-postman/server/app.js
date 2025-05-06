const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');
require('dotenv').config();
const exphbs = require('express-handlebars');

const app = express();
const PORT = process.env.PORT || 3334;

// Настройка handlebars
const hbs = exphbs.create({
  helpers: {
    json: context => JSON.stringify(context, null, 2)
  }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Пути к файлам
const DATA_PATH = path.join(__dirname, 'data', 'savedRequests.json');

//
const postmanRoutes = require('./routes/postman');

// Middleware
app.use(express.json()); // для обработки JSON
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3335'
})); // для разрешения запросов с разных источников

// Маршрут: отдаем HTML-шаблон с сервера
app.get('/api/miniPostman/templates', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'data', 'savedRequests.json'), 'utf-8');
    const parsedData = JSON.parse(data);

    const requests = parsedData.map(r => ({
      ...r,
      headers: r.headers.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
      }, {})
    }));

    res.render('requestList', { requests, layout: false });
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

//
app.use('/api/miniPostman', postmanRoutes);

// API маршруты
app.get('/api/configs', async (req, res) => {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: 'Ошибка чтения данных' });
  }
});

app.post('/api/configs', async (req, res) => {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    const configs = JSON.parse(data);
    configs.push(req.body);
    await fs.writeFile(DATA_PATH, JSON.stringify(configs, null, 2));
    res.status(201).json({ message: 'Сохранено' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка записи данных' });
  }
});

app.delete('/api/configs/:index', async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    const configs = JSON.parse(data);
    if (index < 0 || index >= configs.length) {
      return res.status(400).json({ error: 'Неверный индекс' });
    }
    configs.splice(index, 1);
    await fs.writeFile(DATA_PATH, JSON.stringify(configs, null, 2));
    res.json({ message: 'Удалено' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка удаления' });
  }
});

// Статический файл для фронта
app.use(express.static(path.join(__dirname, '../dist/')));

// Фоллбэк для React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running at: http://178.250.247.67/:${PORT}`);
});
