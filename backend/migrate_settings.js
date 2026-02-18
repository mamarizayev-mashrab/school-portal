const db = require('./src/config/db');

try {
    console.log("Xozirgi settings jadvalini tekshirish...");

    db.prepare(`
        CREATE TABLE IF NOT EXISTS system_settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    `).run();

    // Default settings
    const defaults = [
        { key: 'registration_open', value: 'true' },
        { key: 'site_name', value: 'Kitobxon' },
        { key: 'theme_color', value: 'blue' }
    ];

    const insert = db.prepare('INSERT OR IGNORE INTO system_settings (key, value) VALUES (?, ?)');
    defaults.forEach(d => insert.run(d.key, d.value));

    console.log("Settings jadvali yaratildi va sozlandi.");
} catch (err) {
    console.error("Xatolik:", err.message);
}
