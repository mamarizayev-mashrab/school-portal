const db = require('./src/config/db');

try {
    console.log("Creating 'audit_logs' table...");
    db.prepare(`
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_id INTEGER,
            action TEXT NOT NULL,
            details TEXT,
            ip_address TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(admin_id) REFERENCES users(id)
        )
    `).run();
    console.log("Audit logs table created successfully.");
} catch (error) {
    console.error("Migration failed:", error.message);
}
