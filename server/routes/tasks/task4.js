const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const router = express.Router();
const HTML_FILE_PATH = path.join(__dirname, '../public/task4/index.html');
const SUCCESS_FILE_PATH = path.join(__dirname, '../public/task4/success.html');
const TEMP_DATA_PATH = path.join(__dirname, '../data/temp.json');

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

router.get('/submit', (req, res) => {
    fs.readFile(HTML_FILE_PATH, 'utf8', (err, html) => {
        if (err) return res.status(500).send('Ошибка чтения файла');

        res.send(
            html
                .replace('{* NAME_VALUE *}', '')
                .replace('{* PASSWORD_VALUE *}', '')
                .replace('<!-- ERROR_NAME -->', '')
                .replace('<!-- ERROR_PASSWORD -->', '')
        );
    });
});

router.post('/submit', (req, res) => {
    const { name = '', password = '' } = req.body;
    let errors = { name: '', password: '' };
    let isValid = true;

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
        fs.readFile(HTML_FILE_PATH, 'utf8', (err, html) => {
            if (err) return res.status(500).send('Ошибка чтения файла');

            const filledHtml = html
                .replace('{* NAME_VALUE *}', `value="${escapeHtml(name)}"`)
                .replace('{* PASSWORD_VALUE *}', `value="${escapeHtml(password)}"`)
                .replace('<!-- ERROR_NAME -->', errors.name)
                .replace('<!-- ERROR_PASSWORD -->', errors.password);

            res.send(filledHtml);
        });
    } else {
        const token = crypto.randomBytes(16).toString('hex');
        let tempData = {};

        if (fs.existsSync(TEMP_DATA_PATH)) {
            const content = fs.readFileSync(TEMP_DATA_PATH, 'utf8');
            tempData = content ? JSON.parse(content) : {};
        }

        tempData[token] = { name, password };
        fs.writeFileSync(TEMP_DATA_PATH, JSON.stringify(tempData, null, 2));

        res.redirect(`/success?token=${token}`);
    }
});

router.get('/success', (req, res) => {
    const token = req.query.token;
    if (!token) return res.redirect('/submit');

    let tempData = {};
    if (fs.existsSync(TEMP_DATA_PATH)) {
        const content = fs.readFileSync(TEMP_DATA_PATH, 'utf8');
        tempData = content ? JSON.parse(content) : {};
    }

    const data = tempData[token];
    if (!data) return res.redirect('/submit');

    // Удаляем после показа
    delete tempData[token];
    fs.writeFileSync(TEMP_DATA_PATH, JSON.stringify(tempData, null, 2));

    fs.readFile(SUCCESS_FILE_PATH, 'utf8', (err, html) => {
        if (err) return res.status(500).send('Ошибка чтения файла');

        const resultHtml = html
            .replace('{* NAME *}', escapeHtml(data.name))
            .replace('{* PASSWORD *}', escapeHtml(data.password));

        res.send(resultHtml);
    });
});

module.exports = router;
