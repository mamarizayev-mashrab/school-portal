const Database = require('better-sqlite3');
const path = require('path');

// Connect to DB
const dbPath = path.join(__dirname, 'kitobxon.db');
const db = new Database(dbPath);

console.log('Migrating database to support Super Admin...');

try {
    // 1. Rename old table
    db.prepare('ALTER TABLE users RENAME TO users_old').run();

    // 2. Fix #3: Create new table WITH student_id and email nullable
    db.exec(`
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ism TEXT NOT NULL,
          familiya TEXT NOT NULL,
          email TEXT UNIQUE,
          student_id TEXT UNIQUE,
          password_hash TEXT NOT NULL,
          role TEXT DEFAULT 'student',
          sinf TEXT,
          avatar TEXT DEFAULT NULL,
          streak_count INTEGER DEFAULT 0,
          last_activity_date TEXT DEFAULT NULL,
          level TEXT DEFAULT 'Yangi',
          xp INTEGER DEFAULT 0,
          theme TEXT DEFAULT 'dark',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // 3. Copy data
    db.exec(`
        INSERT INTO users (id, ism, familiya, email, student_id, password_hash, role, sinf, avatar, streak_count, last_activity_date, level, xp, theme, created_at, updated_at)
        SELECT id, ism, familiya, email, student_id, password_hash, role, sinf, avatar, streak_count, last_activity_date, level, xp, theme, created_at, updated_at
        FROM users_old;
    `);

    // 4. Update Admin to Super Admin
    const stmt = db.prepare("UPDATE users SET role = ? WHERE email = ?");
    const result = stmt.run('superadmin', 'super@admin.uz');

    if (result.changes > 0) {
        console.log('SUCCESS: super@admin.uz -> superadmin');
    } else {
        console.log('WARNING: super@admin.uz not found! Trying to find any admin...');
        const anyAdmin = db.prepare("SELECT * FROM users WHERE role = 'admin' LIMIT 1").get();
        if (anyAdmin) {
            console.log(`Found another admin: ${anyAdmin.email || anyAdmin.student_id}. Promoting...`);
            db.prepare("UPDATE users SET role = 'superadmin' WHERE id = ?").run(anyAdmin.id);
        } else {
            console.log('ERROR: No admin found to promote!');
        }
    }

    // 5. Cleanup
    db.prepare('DROP TABLE users_old').run();

    console.log('Migration completed successfully.');

} catch (error) {
    console.error('Migration failed:', error);
}
