const fs = require('fs').promises;
const path = require('path');
const zlib = require('zlib');
const readline = require('readline');
const { createReadStream, createWriteStream } = require('fs');

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

async function compressFile(filePath) {
    const gzPath = `${filePath}.gz`;

    try {
        const [originalStats, gzExists] = await Promise.all([
            fs.stat(filePath),
            fs.access(gzPath).then(() => true).catch(() => false),
        ]);

        if (gzExists) {
            const gzStats = await fs.stat(gzPath);
            if (gzStats.mtimeMs >= originalStats.mtimeMs) {
                return false; // Архив свежий
            }
            console.log(`Обновление архива: ${gzPath}`);
        } else {
            console.log(`Создание архива: ${gzPath}`);
        }

        await new Promise((resolve, reject) => {
            const readStream = createReadStream(filePath);
            const writeStream = createWriteStream(gzPath);
            const gzip = zlib.createGzip();

            readStream
                .pipe(gzip)
                .pipe(writeStream)
                .on('finish', () => {
                    console.log(`Готово: ${gzPath}`);
                    resolve();
                })
                .on('error', reject);
        });

        return true;
    } catch (err) {
        console.error(`Ошибка при обработке файла "${filePath}":`, err.message);
        return false;
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

async function runAutoCompressor(inputPathRaw) {
    const inputPath = inputPathRaw || '.';
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

    for (const file of candidates) {
        const gzPath = `${file}.gz`;
        try {
            const [srcStats, gzStats] = await Promise.all([
                fs.stat(file),
                fs.stat(gzPath)
            ]);
            if (gzStats.mtimeMs < srcStats.mtimeMs) {
                toCompress.push(file);
            }
        } catch {
            // .gz не существует — добавляем в список
            toCompress.push(file);
        }
    }

    console.log(`Файлов, требующих сжатия: ${toCompress.length}`);

    if (toCompress.length === 0) {
        console.log('У всех файлов есть свежие архивы, сжатие не требуется. Выход, хорошего дня.');
        process.exit(0);
    }

    const answer = await askConfirmation('Продолжить сжатие? (y/n): ');
    if (answer !== 'y') {
        console.log('Вы отменили операцию.');
        return;
    }

    let compressedCount = 0;

    console.time('Время сжатия');
    for (const file of toCompress) {
        const changed = await compressFile(file);
        if (changed) compressedCount++;
    }
    console.timeEnd('Время сжатия');

    console.log(`Сжатие завершено. Всего обработано файлов: ${compressedCount}`);
}

const inputArg = process.argv[2] || null;
runAutoCompressor(inputArg);