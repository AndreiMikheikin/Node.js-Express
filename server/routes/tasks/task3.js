const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/task1Data.json');

// Чтение статистики из файла
const getVoteStatistics = () => {
    try {
        const data = fs.readFileSync(DATA_FILE);
        const votes = JSON.parse(data);
        return Object.entries(votes).map(([code, count]) => ({
            code: parseInt(code),
            votes: count
        }));
    } catch (err) {
        console.error('Ошибка чтения файла голосов:', err);
        return [];
    }
};

// Генерация XML
const generateXML = (stats) => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<statistics>\n';
    stats.forEach(stat => {
        xml += `  <vote code="${stat.code}">${stat.votes}</vote>\n`;
    });
    xml += '</statistics>';
    return xml;
};

// Генерация HTML
const generateHTML = (stats) => {
    let html = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Статистика голосования</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        table { border-collapse: collapse; width: 300px; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .footer { font-size: 0.8em; color: #666; }
    </style>
</head>
<body>
    <h1>Статистика голосования</h1>
    <table>
        <tr>
            <th>Вариант</th>
            <th>Голосов</th>
        </tr>`;

    stats.forEach(stat => {
        html += `
        <tr>
            <td>Вариант ${stat.code}</td>
            <td>${stat.votes}</td>
        </tr>`;
    });

    html += `
    </table>
    <div class="footer">Сгенерировано ${new Date().toLocaleString()}</div>
</body>
</html>`;

    return html;
};

// Обработка экспорта
router.post('/export', (req, res) => {
    const { format } = req.body;
    
    if (!format || !['json', 'xml', 'html'].includes(format)) {
        return res.status(400).json({ error: 'Неверный формат экспорта' });
    }

    const stats = getVoteStatistics();
    
    try {
        switch (format) {
            case 'json':
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', 'attachment; filename=statistics.json');
                return res.json(stats);
            
            case 'xml':
                res.setHeader('Content-Type', 'application/xml');
                res.setHeader('Content-Disposition', 'attachment; filename=statistics.xml');
                return res.send(generateXML(stats));
            
            case 'html':
                res.setHeader('Content-Type', 'text/html');
                res.setHeader('Content-Disposition', 'attachment; filename=statistics.html');
                return res.send(generateHTML(stats));
        }
    } catch (error) {
        console.error('Ошибка экспорта:', error);
        return res.status(500).json({ error: 'Ошибка сервера при экспорте' });
    }
});

module.exports = router;