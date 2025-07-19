
const sqlite3 = require('sqlite3').verbose();
const config = require('../config/config');

const db = new sqlite3.Database(config.dbPath, (err) => {
    if (err) {
      console.error('Error opening database', err);
    } else {
      console.log('Database connected');
      // Создаем таблицы при подключении
      initializeDatabase();
    }
  });
  
  function initializeDatabase() {
    db.serialize(() => {
      // Таблица сообщений
      db.run(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          user_first_name TEXT,
          user_last_name TEXT,
          user_username TEXT,
          display_name TEXT,
          text TEXT NOT NULL,
          status TEXT DEFAULT 'pending',
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // ТАБЛИЦА СТОП-СЛОВ (добавлено)
      db.run(`
        CREATE TABLE IF NOT EXISTS stop_words (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          word TEXT UNIQUE NOT NULL COLLATE NOCASE
        )
      `);
    });
  }
  

// Insert a new message
function insertMessage(userId, firstName, lastName, username, displayName, text, callback) {
  db.run('INSERT INTO messages (user_id, user_first_name, user_last_name, user_username, display_name, text) VALUES (?, ?, ?, ?, ?, ?)', [userId, firstName, lastName, username, displayName, text], function(err) {
    if (err) console.error('DB insert error', err);
    callback(err, this.lastID);
  });
}

// Update message status
function updateStatus(msgId, status, callback) {
  db.run('UPDATE messages SET status = ? WHERE id = ?', [status, msgId], (err) => {
    if (err) console.error('DB update error', err);
    callback(err);
  });
}

// Get pending messages
function getPendingMessages(callback) {
  db.all('SELECT * FROM messages WHERE status = "pending"', (err, rows) => {
    if (err) console.error('DB get pending error', err);
    callback(err, rows);
  });
}

// Get message by ID
function getMessageById(msgId, callback) {
  db.get('SELECT * FROM messages WHERE id = ?', [msgId], (err, row) => {
    if (err) console.error('DB get by id error', err);
    callback(err, row);
  });
}
/**
 * Добавляет стоп-слова
 * @param {string[]} words - массив стоп-слов
 */
function addStopWords(words) {
    return new Promise((resolve, reject) => {
      // Фильтруем и очищаем слова
      const cleanedWords = words
        .map(word => word.trim())
        .filter(word => word.length > 0);
      
      if (cleanedWords.length === 0) {
        return resolve();
      }
  
      // Создаем плейсхолдеры для массовой вставки
      const placeholders = cleanedWords.map(() => '(?)').join(',');
      const sql = `INSERT OR IGNORE INTO stop_words (word) VALUES ${placeholders}`;
      
      db.run(sql, cleanedWords, function(err) {
        if (err) {
          console.error('Ошибка вставки стоп-слов:', err);
          reject(err);
        } else {
          console.log(`Добавлено ${this.changes} стоп-слов`);
          resolve();
        }
      });
    });
  }
  
  /**
   * Получает все стоп-слова
   * @returns {Promise<string[]>} - массив стоп-слов
   */
  function getStopWords() {
    return new Promise((resolve, reject) => {
      db.all("SELECT word FROM stop_words", (err, rows) => {
        if (err) {
          console.error('Ошибка получения стоп-слов:', err);
          reject(err);
        } else {
          resolve(rows.map(row => row.word));
        }
      });
    });
  }
  
module.exports = {
  addStopWords,
  getStopWords,
  insertMessage,
  updateStatus,
  getPendingMessages,
  getMessageById,
}; 