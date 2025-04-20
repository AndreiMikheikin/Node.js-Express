const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const router = express.Router();

const HTML_FILE_PATH = path.join(__dirname, '../../../build/task4/index.html');
const SUCCESS_FILE_PATH = path.join(__dirname, '../../../build/task4/success.html');
const TEMP_DATA_PATH = path.join(__dirname, '../data/temp.json');


// Функция экранирования HTML
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// GET /task4/submit - форма
router.get('/submit', async (req, res) => {
    try {
        const html = await fs.readFile(HTML_FILE_PATH, 'utf8');
        res.send(
            html
                .replace('{* NAME_VALUE *}', '')
                .replace('{* PASSWORD_VALUE *}', '')
                .replace('<!-- ERROR_NAME -->', '')
                .replace('<!-- ERROR_PASSWORD -->', '')
        );
    } catch (err) {
        res.status(500).send('Ошибка чтения файла формы');
    }
});

// POST /task4/submit - обработка формы
router.post('/submit', async (req, res) => {
    const { name = '', password = '' } = req.body;
    let errors = { name: '', password: '' };
    let isValid = true;

    // Валидация
    if (!name.trim()) {
        errors.name = '<p style="color:red;">Имя обязательно</p>';
        isValid = false;
    } else if (name.trim().length < 3) {
        errors.name = '<p style="color:red;">Минимум 3 символа</p>';
        isValid = false;
    }

    if (!password.trim()) {
        errors.password = '<p style="color:red;">Пароль обязателен</p>';
        isValid = false;
    } else if (password.trim().length < 6) {
        errors.password = '<p style="color:red;">Минимум 6 символов</p>';
        isValid = false;
    }

    if (!isValid) {
        try {
            const html = await fs.readFile(HTML_FILE_PATH, 'utf8');
            const filledHtml = html
                .replace('{* NAME_VALUE *}', `value="${escapeHtml(name)}"`)
                .replace('{* PASSWORD_VALUE *}', `value="${escapeHtml(password)}"`)
                .replace('<!-- ERROR_NAME -->', errors.name)
                .replace('<!-- ERROR_PASSWORD -->', errors.password);
            res.send(filledHtml);
        } catch (err) {
            res.status(500).send('Ошибка чтения файла формы');
        }
    } else {
        try {
            const successHtml = await fs.readFile(SUCCESS_FILE_PATH, 'utf8');
            const filledSuccess = successHtml
                .replace('<!-- NAME -->', escapeHtml(name))
                .replace('<!-- PASSWORD -->', escapeHtml(password));
    
            res.send(filledSuccess);
        } catch (err) {
            res.status(500).send('Ошибка чтения файла success.html');
        }
    }
});

// GET /task4/success - страница успеха
router.get('/success-data', async (req, res) => {
    const hash = req.query.hash;
    if (!hash) return res.status(400).json({ error: 'Hash is required' });

    try {
        const content = await fs.readFile(TEMP_DATA_PATH, 'utf8');
        const tempData = content ? JSON.parse(content) : {};
        const userData = tempData[hash];

        if (!userData) return res.status(404).json({ error: 'Data not found' });

        // Удаляем использованные данные
        delete tempData[hash];
        await fs.writeFile(TEMP_DATA_PATH, JSON.stringify(tempData, null, 2));

        res.json({ name: userData.name });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;