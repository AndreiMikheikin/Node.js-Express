const express = require('express');
const router = express.Router();

const variants = [
  { code: 1, text: "Вариант 1" },
  { code: 2, text: "Вариант 2" },
  { code: 3, text: "Вариант 3" }
];

let votes = { 1: 0, 2: 0, 3: 0 };

router.get('/variants', (req, res) => {
  res.json(variants);
});

router.get('/stat', (req, res) => {
  res.json(Object.entries(votes).map(([code, count]) => ({ code: parseInt(code), votes: count })));
});

router.post('/vote', (req, res) => {
  const { code } = req.body;
  if (votes[code] !== undefined) {
    votes[code]++;
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Неверный код варианта.' });
  }
});

module.exports = router;