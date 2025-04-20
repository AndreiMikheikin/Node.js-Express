const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();

const HTML_FILE_PATH = path.join(__dirname, '../../../build/task4/index.html');

function escapeHtml(text) {
    return text.replace(/[&<>"']/g, function (m) {
        return ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
        })[m];
    });
}

router.post('/submit', (req, res) => {
    const { name = '', password = '' } = req.body;

    const hasBody = 'name' in req.body || 'password' in req.body;

    let errors = {
        name: '',
        password: '',
    };

    let isValid = true;

    // Только если параметры реально пришли — валидируем
    if (hasBody) {
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
    }

    fs.readFile(HTML_FILE_PATH, 'utf8', (err, html) => {
        if (err) return res.status(500).send('Ошибка чтения файла');

        // Первый заход — просто пустая форма
        const nameAttr = name ? `value="${escapeHtml(name)}"` : '';
        const passwordAttr = password ? `value="${escapeHtml(password)}"` : '';

        if (!hasQuery) {
            const cleanHtml = html
                .replace('{* NAME_VALUE *}', '')
                .replace('{* PASSWORD_VALUE *}', '')
                .replace('<!-- ERROR_NAME -->', '')
                .replace('<!-- ERROR_PASSWORD -->', '')
                .replace('<!-- SUCCES_BLOCK -->', '');

            return res.send(cleanHtml);
        }


        // Ошибки — вернуть с сохранёнными значениями и сообщениями
        if (!isValid) {
            const filledHtml = html
                .replace('{* NAME_VALUE *}', nameAttr)
                .replace('{* PASSWORD_VALUE *}', passwordAttr)
                .replace('<!-- ERROR_NAME -->', errors.name)
                .replace('<!-- ERROR_PASSWORD -->', errors.password)
                .replace('<!-- SUCCES_BLOCK -->', '');

            return res.send(filledHtml);
        }

        // Успешно — показать блок успеха
        const successBlock = `
        <h2 style="color: green;">Форма успешно отправлена</h2>
        <p>Логин: ${escapeHtml(name)}</p>
        <p>Пароль: ${escapeHtml(password)}</p>
        <hr/>
      `;

        const successHtml = html
            .replace('<!-- SUCCES_BLOCK -->', successBlock)
            .replace('{* NAME_VALUE *}', '')
            .replace('{* PASSWORD_VALUE *}', '')
            .replace('<!-- ERROR_NAME -->', '')
            .replace('<!-- ERROR_PASSWORD -->', '');

        res.send(successHtml);
    });
});

module.exports = router;
