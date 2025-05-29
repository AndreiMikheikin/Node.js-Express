import express from 'express';
import mysql from 'mysql2/promise';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const app = express();
const port = process.env.PORT || 3336;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SQLite DB
let sqliteDB;
const connectToSQLite = async () => {
  sqliteDB = await open({
    filename: path.join(__dirname, 'db', 'main.sqlite'),
    driver: sqlite3.Database,
  });
  console.log('SQLite подключена');
};

// MySQL DB
let mysqlPool;
const connectToMySQL = async () => {
  mysqlPool = await mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // пароль, если есть
    database: 'learning_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  console.log('MySQL подключена');
};

// Получение списка SQLite баз (файлов .sqlite и .db в папке db)
const getSQLiteDatabases = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const dbDir = path.join(__dirname, 'db');
      const files = await fs.readdir(dbDir);

      const dbFiles = files.filter(file =>
        file.endsWith('.sqlite') || file.endsWith('.db')
      ).map(file => ({
        name: file,
        type: 'sqlite',
        path: path.join(dbDir, file)
      }));

      resolve(dbFiles);
    } catch (err) {
      console.error('Ошибка при чтении SQLite баз:', err);
      resolve([]); // Возвращаем пустой массив в случае ошибки
    }
  });
};

// Получение списка MySQL баз (исключая системные)
const getMySQLDatabases = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const [rows] = await mysqlPool.query('SHOW DATABASES');

      /* const userDatabases = rows
        .filter(row => ![
          'information_schema', 
          'mysql', 
          'performance_schema', 
          'sys'
        ].includes(row.Database))
        .map(row => ({
          name: row.Database,
          type: 'mysql'
        })); */
      // Убираем фильтр списка баз, может потом будет реализация через checkbox

      const userDatabases = rows.map(row => ({
        name: row.Database,
        type: 'mysql'
      }));

      resolve(userDatabases);
    } catch (err) {
      console.error('Ошибка при получении MySQL баз:', err);
      resolve([]); // Возвращаем пустой массив в случае ошибки
    }
  });
};

// Эндпоинт для получения списка всех баз
app.get('/api/databases', async (req, res) => {
  try {
    const [sqliteDBs, mysqlDBs] = await Promise.all([
      getSQLiteDatabases(),
      getMySQLDatabases()
    ]);

    res.json({
      success: true,
      sqlite: sqliteDBs,
      mysql: mysqlDBs,
      /* all: [...sqliteDBs, ...mysqlDBs] 
      * Объединенный список не нужен
      * Решил на фронте разделять тип БД 
      */

    });
  } catch (err) {
    console.error('Ошибка при получении списка баз:', err);
    res.status(500).json({
      success: false,
      error: 'Не удалось получить список баз данных'
    });
  }
});

// Остальные эндпоинты (из вашего оригинального кода)
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'client')));

app.post('/api/execute', async (req, res) => {
  const { sql, engine, database } = req.body;

  if (!sql || typeof sql !== 'string') {
    return res.status(400).json({ error: 'Некорректный SQL-запрос' });
  }

  const dbType = (engine || 'sqlite').toLowerCase();
  const trimmed = sql.trim().toLowerCase();
  const isSelect = trimmed.startsWith('select');

  console.log('SQL:', sql);
  console.log('isSelect:', isSelect);

  try {
    if (dbType === 'mysql') {
      const connection = await mysqlPool.getConnection();
      try {
        // Переключаемся на нужную базу, если указана
        if (database) {
          await connection.query(`USE \`${database}\``);
        }
        const [rows] = await connection.query(sql);

        if (Array.isArray(rows)) {
          return res.json({ rows });
        }
        if (rows && typeof rows.affectedRows === 'number') {
          return res.json({ affectedRows: rows.affectedRows });
        }
        return res.json({ rows: [] });
      } finally {
        connection.release();
      }
    } else {
      const dbPath = path.join(__dirname, 'db', database || 'main.sqlite');
      const tempDB = await open({ filename: dbPath, driver: sqlite3.Database });

      if (isSelect) {
        const rows = await tempDB.all(sql);
        await tempDB.close();
        return res.json({ rows });
      } else {
        const result = await tempDB.run(sql);
        await tempDB.close();
        return res.json({ affectedRows: result.changes });
      }
    }
  } catch (err) {
    return res.json({ error: err.message });
  }
});

// Запуск сервера
const startServer = async () => {
  try {
    await connectToSQLite();
    await connectToMySQL();

    app.listen(port, () => {
      console.log(`Сервер запущен на http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Ошибка при запуске сервера:', err);
    process.exit(1);
  }
};

startServer();