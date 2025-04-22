const express = require('express');
const router = express.Router();

// Роуты для заданий
const task1Router = require('./tasks/task1');
const task2Router = require('./tasks/task2');
const task3Router = require('./tasks/task3');
const task4Router = require('./tasks/task4');

// Роуты для контрольных заданий
const extraTask1Router = require('./tasks/extraTask1');

router.use('/task1', task1Router);
router.use('/task2', task2Router);
router.use('/task3', task3Router);
router.use('/task4', task4Router);

router.use('/extraTask1', extraTask1Router);

module.exports = router;