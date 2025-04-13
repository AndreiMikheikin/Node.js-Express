const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/task1Data.json');

const readVotes = () => {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE));
  } catch (err) {
    console.error('Ошибка чтения файла:', err);
    return { 1: 0, 2: 0, 3: 0 };
  }
};

router.get('/download', (req, res) => {
  const votes = readVotes();
  const format = req.accepts(['xml', 'html', 'json']);

  if (!format) {
    return res.status(406).send('Not Acceptable');
  }

  let data = '';
  let filename = '';

  switch (format) {
    case 'json':
      data = JSON.stringify(votes, null, 2);
      filename = 'votes.json';
      res.setHeader('Content-Type', 'application/json');
      break;
    case 'xml':
      data = `<?xml version="1.0" encoding="UTF-8"?>
<votes>
${Object.entries(votes).map(([code, count]) => `  <vote><code>${code}</code><count>${count}</count></vote>`).join('\n')}
</votes>`;
      filename = 'votes.xml';
      res.setHeader('Content-Type', 'application/xml');
      break;
    case 'html':
      data = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Голосование</title></head><body><ul>
${Object.entries(votes).map(([code, count]) => `<li>Вариант ${code}: ${count} голосов</li>`).join('\n')}
</ul></body></html>`;
      filename = 'votes.html';
      res.setHeader('Content-Type', 'text/html');
      break;
  }

  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(data);
});

module.exports = router;
