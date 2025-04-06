const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.urlencoded({ extended: true }));

// Загружаем HTML как строку
const htmlTemplate = fs.readFileSync(
    path.join(__dirname, 'public', 'index.html'),
    'utf8'
);

// Валидация (простая проверка полей)
function validateForm(data) {
    const errors = {};

    if (!data.name) errors.name = 'Введите логин';
    if (!data.password) errors.password = 'Введите пароль';

    return errors;
}

// Главная страница (GET)
app.get('/', (req, res) => {
    const html = htmlTemplate
        .replace('{* SUCCESS_MESSAGE *}', '')
        .replace('{* LOGIN_ERROR *}', '')
        .replace('{* PASSWORD_ERROR *}', '');

    res.send(html);
});

// Обработка формы (POST)
app.post('/submit', (req, res) => {
    const errors = validateForm(req.body);

    if (Object.keys(errors).length > 0) {
        // Если есть ошибки — вставляем их в HTML
        const htmlWithErrors = htmlTemplate
            .replace('{* SUCCESS_MESSAGE *}', '')
            .replace('{* LOGIN_ERROR *}',
                errors.name ? `<div class="error">${errors.name}</div>` : '')
            .replace('{* PASSWORD_ERROR *}',
                errors.password ? `<div class="error">${errors.password}</div>` : '');

        return res.send(htmlWithErrors);
    }

    // Если форма успешна — показываем сообщение
    const successHtml = htmlTemplate
        .replace('{* SUCCESS_MESSAGE *}',
            '<div class="success">С вашего счета успешано списано 300 копеек!</div>')
        .replace('{* LOGIN_ERROR *}', '')
        .replace('{* PASSWORD_ERROR *}', '');

    res.send(successHtml);
});