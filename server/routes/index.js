const express = require('express');
const router = express.Router();

// Роуты для заданий
const task1Router = require('./tasks/task1');
const task2Router = require('./tasks/task2');

router.use('/task1', task1Router);
router.use('/task2', task2Router);

module.exports = router;