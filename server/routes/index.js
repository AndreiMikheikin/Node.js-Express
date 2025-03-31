const express = require('express');
const router = express.Router();

// Роуты для заданий
const task1Router = require('./tasks/task1');

router.use('/task1', task1Router);

module.exports = router;