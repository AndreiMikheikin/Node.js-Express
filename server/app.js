const express = require('express');
const path = require('path');
const tasksRouter = require('./routes');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3333;

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../build')));

// API маршруты
app.use('/api', tasksRouter);

// Статические маршруты для заданий
app.get('/task2', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/task2/index.html'));
});

app.get('/task4', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/task4/index.html'));
});

app.get('/task4/success', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/task4/success.html'));
});

// Фоллбэк для React (если путь не найден среди вышеуказанных)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running at: http://178.250.247.67:${PORT}`);
});
