
const sqlite3 = require('sqlite3').verbose();
const config = require('../config/config');

const db = new sqlite3.Database(config.dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Database connected');
  }
});

db.serialize(() => {
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
});

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

module.exports = {
  insertMessage,
  updateStatus,
  getPendingMessages,
  getMessageById,
}; 