const express = require('express');
const router = express.Router();

// Роуты для заданий
const task1Router = require('./tasks/task1');
const task2Router = require('./tasks/task2');
const task3Router = require('./tasks/task3');

router.use('/task1', task1Router);
router.use('/task2', task2Router);
router.use('/task3', task3Router);

module.exports = router;