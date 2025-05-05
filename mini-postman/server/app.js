const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3334;

// Пути к файлам
const DATA_PATH = path.join(__dirname, process.env.DATA_FILE_PATH);

//
const postmanRoutes = require('./routes/postman');

// Middleware
app.use(express.json()); // для обработки JSON
app.use(cors({ 
  origin: process.env.CORS_ORIGIN || 'http://localhost:3335' 
})); // для разрешения запросов с разных источников

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
app.use(express.static(path.join(__dirname, '../client/dist')));

// Фоллбэк для React (если путь не найден среди вышеуказанных)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running at: http://localhost:${PORT}`);
});
