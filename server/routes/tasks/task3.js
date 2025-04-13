const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { json2xml } = require('xml-js');

const DATA_FILE = path.join(__dirname, '../data/task1Data.json');

// Функция для чтения статистики голосов
const getStatistics = () => {
    try {
        const votes = JSON.parse(fs.readFileSync(DATA_FILE));
        return Object.entries(votes).map(([code, count]) => ({
            code: parseInt(code),
            votes: count
        }));
    } catch (err) {
        console.error('Error reading votes file:', err);
        return [];
    }
};

// Функция для генерации HTML таблицы
const generateHTML = (stats) => {
    let html = `
<!DOCTYPE html>
<html>
<head>
    <title>Статистика голосования</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        table { border-collapse: collapse; width: 50%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Статистика голосования</h1>
    <table>
        <tr>
            <th>Вариант</th>
            <th>Голоса</th>
        </tr>
`;

    stats.forEach(stat => {
        html += `
        <tr>
            <td>Вариант ${stat.code}</td>
            <td>${stat.votes}</td>
        </tr>`;
    });

    html += `
    </table>
    <p>Дата экспорта: ${new Date().toLocaleString()}</p>
</body>
</html>`;

    return html;
};

// Роут для экспорта статистики
router.post('/export', (req, res) => {
    const { format } = req.body;
    const stats = getStatistics();

    if (!format) {
        return res.status(400).json({ error: 'Формат не указан' });
    }

    try {
        switch (format.toLowerCase()) {
            case 'json':
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', 'attachment; filename=statistics.json');
                return res.json(stats);

            case 'xml':
                const xmlData = {
                    _declaration: { _attributes: { version: '1.0', encoding: 'UTF-8' } },
                    statistics: {
                        vote: stats.map(stat => ({
                            _attributes: { code: stat.code },
                            _text: stat.votes
                        }))
                    }
                };
                const xml = json2xml(JSON.stringify(xmlData), { compact: true, spaces: 4 });
                res.setHeader('Content-Type', 'application/xml');
                res.setHeader('Content-Disposition', 'attachment; filename=statistics.xml');
                return res.send(xml);

            case 'html':
                const html = generateHTML(stats);
                res.setHeader('Content-Type', 'text/html');
                res.setHeader('Content-Disposition', 'attachment; filename=statistics.html');
                return res.send(html);

            default:
                return res.status(400).json({ error: 'Неподдерживаемый формат' });
        }
    } catch (error) {
        console.error('Export error:', error);
        return res.status(500).json({ error: 'Ошибка при экспорте данных' });
    }
});

module.exports = router;