const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'kitobxon.db');
const db = new Database(dbPath);

// WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log('SQLite bazasiga ulandi:', dbPath);

module.exports = db;
