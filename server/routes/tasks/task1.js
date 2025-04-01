const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Путь к файлу с данными
const DATA_FILE = path.join(__dirname, '../data/task1Data.json');

// Варианты ответов (не изменяются)
const variants = [
  { code: 1, text: "Вариант 1" },
  { code: 2, text: "Вариант 2" },
  { code: 3, text: "Вариант 3" }
];

// Инициализация файла данных
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ 1: 0, 2: 0, 3: 0 }, null, 2));
}

// Функции для работы с файлом
const readVotes = () => {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE));
  } catch (err) {
    console.error('Ошибка чтения файла подсчета голосов:', err);
    return { 1: 0, 2: 0, 3: 0 };
  }
};

const writeVotes = (votes) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(votes, null, 2));
};

// Роуты
router.get('/variants', (req, res) => {
  res.json(variants);
});

router.get('/stat', (req, res) => {
  const votes = readVotes();
  res.json(Object.entries(votes).map(([code, count]) => ({code: parseInt(code), votes: count})));
});

router.post('/vote', (req, res) => {
  const { code } = req.body;
  const votes = readVotes();

  if (votes[code] !== undefined) {
    votes[code]++;
    writeVotes(votes);
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Неверный код варианта.' });
  }
});

module.exports = router;