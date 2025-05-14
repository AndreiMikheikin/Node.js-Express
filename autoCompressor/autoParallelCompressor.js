const fs = require('fs').promises;
const path = require('path');
const zlib = require('zlib');
const readline = require('readline');
const { createReadStream, createWriteStream } = require('fs');

// Глобальная переменная для измерения времени
const timer = {
    start: 0,
    end: 0,
    get duration() {
        return (this.end - this.start) / 1000;
    }
};

async function getAllFiles(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    const files = await Promise.all(entries.map(async entry => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            return await getAllFiles(fullPath);
        } else {
            return fullPath;
        }
    }));

    return files.flat();
}

async function compressFile(filePath, slotIndex) {
    const gzPath = `${filePath}.gz`;

    try {
        const [originalStats, gzExists] = await Promise.all([
            fs.stat(filePath),
            fs.access(gzPath).then(() => true).catch(() => false),
        ]);

        if (gzExists) {
            const gzStats = await fs.stat(gzPath);
            if (gzStats.mtimeMs >= originalStats.mtimeMs) {
                console.log(`Слот #${slotIndex + 1}: Пропуск (актуально) — ${gzPath}`);
                return { success: false, filePath, reason: 'fresh_archive' };
            }
            console.log(`Слот #${slotIndex + 1}: Обновление архива — ${gzPath}`);
        } else {
            console.log(`Слот #${slotIndex + 1}: Создание архива — ${gzPath}`);
        }

        await new Promise((resolve, reject) => {
            const readStream = createReadStream(filePath);
            const writeStream = createWriteStream(gzPath);
            const gzip = zlib.createGzip();

            readStream
                .pipe(gzip)
                .pipe(writeStream)
                .on('finish', () => {
                    console.log(`Слот #${slotIndex + 1}: Готово — ${gzPath}`);
                    resolve();
                })
                .on('error', reject);
        });

        return { success: true, filePath };
    } catch (err) {
        console.error(`Слот #${slotIndex + 1}: Ошибка при обработке "${filePath}": ${err.message}`);
        return { success: false, filePath, reason: 'error', error: err.message };
    }
}

function askConfirmation(question) {
    return new Promise(resolve => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        rl.question(question, answer => {
            rl.close();
            resolve(answer.trim().toLowerCase());
        });
    });
}

async function runParallelCompression(tasks, maxFiles) {
    const results = [];
    const executing = new Set();
    const slotStats = Array.from({ length: maxFiles }, () => 0);

    let currentslotIndex = 0;

    for (const task of tasks) {
        const slotIndex = currentslotIndex;

        const promise = compressFile(task, slotIndex).then(result => {
            executing.delete(promise);
            if (result.success) {
                slotStats[slotIndex]++;
            }
            return { ...result, slotIndex };
        });

        executing.add(promise);
        results.push(promise);

        currentslotIndex = (currentslotIndex + 1) % maxFiles;

        if (executing.size >= maxFiles) {
            await Promise.race(executing);
        }
    }

    const finalResults = await Promise.all(results);
    finalResults.slotStats = slotStats;
    return finalResults;
}


async function runAutoCompressor(inputPathRaw, maxFilesRaw) {
    const inputPath = inputPathRaw || '.';
    const maxFiles = Math.max(1, parseInt(maxFilesRaw) || 1);
    const absolutePath = path.isAbsolute(inputPath)
        ? inputPath
        : path.resolve(process.cwd(), inputPath);

    if (!inputPathRaw) {
        console.log(`Путь не указан. Используем текущую директорию: ${absolutePath}`);
    } else if (!path.isAbsolute(inputPath)) {
        console.log(`Указан относительный путь: ${inputPath}`);
        console.log(`Преобразован в абсолютный путь: ${absolutePath}`);
    } else {
        console.log(`Указан абсолютный путь: ${absolutePath}`);
    }

    console.log(`Максимальное количество параллельных задач: ${maxFiles}`);

    let stats;
    try {
        stats = await fs.stat(absolutePath);
    } catch {
        console.error(`Ошибка: путь "${absolutePath}" не существует.`);
        process.exit(1);
    }

    if (!stats.isDirectory()) {
        console.error(`Ошибка: путь "${absolutePath}" не является директорией.`);
        process.exit(1);
    }

    console.log(`Сканирование папки: ${absolutePath}`);
    const allFiles = await getAllFiles(absolutePath);
    const candidates = allFiles.filter(f => !f.endsWith('.gz'));

    const toCompress = [];
    const freshArchives = [];

    for (const file of candidates) {
        const gzPath = `${file}.gz`;
        try {
            const [srcStats, gzStats] = await Promise.all([
                fs.stat(file),
                fs.stat(gzPath)
            ]);
            if (gzStats.mtimeMs < srcStats.mtimeMs) {
                toCompress.push(file);
            } else {
                freshArchives.push(file);
            }
        } catch {
            toCompress.push(file);
        }
    }

    console.log(`Файлов, требующих сжатия: ${toCompress.length}`);

    if (toCompress.length === 0) {
        console.log('У всех файлов есть свежие архивы, сжатие не требуется.');
        printStatsTable({
            totalFiles: allFiles.length,
            processedFiles: 0,
            compressedFiles: 0,
            skippedFiles: freshArchives.length,
            maxSlots: maxFiles,
            totalTimeSec: 0,
            filesPerSec: 0
        });
        process.exit(0);
    }

    const answer = await askConfirmation('Продолжить сжатие? (y/n): ');
    if (answer !== 'y') {
        console.log('Вы отменили операцию.');
        return;
    }

    timer.start = Date.now();
    const results = await runParallelCompression(toCompress, maxFiles);
    timer.end = Date.now();

    const compressedFiles = results.filter(r => r.success).length;
    const failedFiles = results.filter(r => !r.success && r.reason === 'error').length;
    const slotStats = results.slotStats;

    printStatsTable({
        totalFiles: allFiles.length,
        processedFiles: toCompress.length,
        compressedFiles,
        skippedFiles: freshArchives.length,
        failedFiles,
        maxSlots: maxFiles,
        totalTimeSec: timer.duration.toFixed(2),
        filesPerSec: (compressedFiles / timer.duration).toFixed(1),
        slotStats
    });
}

const printStatsTable = (stats) => {
    const {
        totalFiles,
        processedFiles,
        compressedFiles,
        skippedFiles,
        failedFiles = 0,
        maxSlots,
        totalTimeSec,
        filesPerSec,
        slotStats = []
    } = stats;

    const rows = [
        `▸ Всего файлов: ${totalFiles}`,
        `▸ Обработано: ${processedFiles}`,
        `▸ Успешно сжато: ${compressedFiles}`,
        `▸ Пропущено (свежие): ${skippedFiles}`,
        `▸ Ошибки: ${failedFiles}`,
        `▸ Слоты: ${maxSlots}`,
        `▸ Время: ${totalTimeSec} сек`,
        `▸ Скорость: ${filesPerSec} файл/сек`,
        ...(slotStats.length
            ? ['▸ Распределение по слотам:', ...slotStats.map((count, i) => `   └ Слот #${i + 1}: ${count}`)]
            : [])
    ];

    const maxLength = Math.max(...rows.map(row => row.length));
    const WIDTH = Math.max(maxLength + 4, 40);

    const top =    ` ╔${'═'.repeat(WIDTH - 2)}╗`;
    const bottom = ` ╚${'═'.repeat(WIDTH - 2)}╝`;
    const separator = ` ╟${'─'.repeat(WIDTH - 2)}╢`;
    const line = (text) => ` ║ ${text.padEnd(WIDTH - 4)} ║`;

    const output = [
        top,
        line('СТАТИСТИКА СЖАТИЯ'.padStart((WIDTH + 10) / 2)),
        separator,
        ...rows.flatMap((row, i) => [
            line(row),
            i < rows.length - 1 ? separator : null
        ]).filter(Boolean),
        bottom
    ];

    console.log('\n' + output.join('\n') + '\n');
}

const inputArg = process.argv[2] || null;
const maxFilesArg = process.argv[3] || null;
runAutoCompressor(inputArg, maxFilesArg);