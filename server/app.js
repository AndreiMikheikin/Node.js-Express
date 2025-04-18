const express = require('express');
const path = require('path');
const tasksRouter = require('./routes');

const app = express();
const PORT = 3333;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../build')));

// API Routes
app.use('/api', tasksRouter);

// Запрос для формы валидации
app.get('/task2', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/task2/index.html'));
});

// Все остальные запросы отправляем React приложению
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://178.250.247.67:${PORT}`);
});