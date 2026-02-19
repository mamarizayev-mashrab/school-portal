const Database = require('better-sqlite3');
const path = require('path');

// Render da persistent disk /opt/render/project/src/ da bo'ladi
// Yoki DB_PATH env orqali boshqarish mumkin
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', '..', 'kitobxon.db');
const db = new Database(dbPath);

// WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log('SQLite bazasiga ulandi:', dbPath);

module.exports = db;
