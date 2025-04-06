const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const htmlPath = fs.readFileSync(path.join(__dirname, '../build/task2', 'index.html'));
const htmlTemplate = fs.readFileSync(htmlPath, 'utf8');

function renderForm({ name = '', password = '', errors = {} } = {}) {
    let errorHtml = '';
    if (errors.name || errors.password) {
        errorHtml += '<div class="error">';
        if (errors.name) errorHtml += `<p>${errors.name}</p>`;
        if (errors.password) errorHtml += `<p>${errors.password}</p>`;
        errorHtml += '</div>';
    }

    return htmlTemplate
        .replace('{* ERROR_BLOCK *}', errorHtml)
        .replace('{* NAME_VALUE *}', name)
        .replace('{* PASSWORD_VALUE *}', password);
}

// Страница формы
router.get('/', (req, res) => {
    res.send(renderForm());
});

// Обработка формы
router.get('/submit', (req, res) => {
    const { name = '', password = '' } = req.query;
    const errors = {};

    if (!name.trim()) errors.name = 'Введите логин';
    if (!password.trim()) errors.password = 'Введите пароль';

    if (Object.keys(errors).length > 0) {
        return res.send(renderForm({ name, password, errors }));
    }

    res.send(`
        <h1>С Вашего счета успешно списано 300 копеек!</h1>
        <p>Ваш логин: <strong>${name}</strong></p>
        <p>Ваш пароль: <strong>${password}</strong></p>
        <a href="/tasks/task2">Назад</a>
    `);
});

module.exports = router;
