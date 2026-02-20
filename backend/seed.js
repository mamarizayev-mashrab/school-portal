const db = require('./src/config/db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seed() {
    try {
        console.log('🌱 Seeding process started...');

        const isPostgres = !!process.env.DATABASE_URL;
        const pk = isPostgres ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
        const blobType = isPostgres ? 'BYTEA' : 'BLOB';
        const now = 'CURRENT_TIMESTAMP';

        // 1. Reset Tables
        const tables = ['audit_logs', 'notifications', 'results', 'quizzes', 'reading_logs', 'plan_books', 'reading_plans', 'badges', 'system_settings', 'book_catalog', 'library_books', 'users'];
        for (const t of tables) {
            await db.exec(`DROP TABLE IF EXISTS ${t}`);
        }
        console.log('🧹 Old tables dropped.');

        // 2. Create Tables

        // Users
        await db.exec(`CREATE TABLE IF NOT EXISTS users (
            id ${pk},
            ism TEXT NOT NULL,
            familiya TEXT NOT NULL,
            email TEXT UNIQUE,
            student_id TEXT UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'student',
            sinf TEXT,
            avatar TEXT,
            streak_count INTEGER DEFAULT 0,
            last_activity_date TEXT,
            level TEXT DEFAULT 'Yangi',
            xp INTEGER DEFAULT 0,
            theme TEXT DEFAULT 'dark',
            created_at TIMESTAMP DEFAULT ${now},
            updated_at TIMESTAMP DEFAULT ${now}
        )`);

        // Old Book Catalog (Metadata only) - keeping for compatibility with existing functionality if any
        await db.exec(`CREATE TABLE IF NOT EXISTS book_catalog (
            id ${pk},
            nomi TEXT NOT NULL,
            muallif TEXT NOT NULL,
            janr TEXT,
            sahifalar_soni INTEGER,
            tavsif TEXT,
            cover_url TEXT,
            created_at TIMESTAMP DEFAULT ${now}
        )`);

        // NEW Library Books (With Binary File Data)
        await db.exec(`CREATE TABLE IF NOT EXISTS library_books (
            id ${pk},
            nomi TEXT NOT NULL,
            tavsif TEXT,
            kategoriya TEXT NOT NULL,
            fayl_nomi TEXT NOT NULL,
            fayl_data ${blobType}, 
            fayl_hajmi INTEGER DEFAULT 0,
            yuklagan_id INTEGER REFERENCES users(id),
            created_at TIMESTAMP DEFAULT ${now},
            updated_at TIMESTAMP DEFAULT ${now}
        )`);

        // Reading Logs
        await db.exec(`CREATE TABLE IF NOT EXISTS reading_logs (
            id ${pk},
            user_id INTEGER,
            kitob_nomi TEXT NOT NULL,
            muallif TEXT NOT NULL,
            sahifalar_soni INTEGER NOT NULL,
            oqilgan_sana DATE NOT NULL,
            xulosa TEXT NOT NULL,
            xulosa_tasdiqlangan INTEGER DEFAULT 0,
            tasdiqlagan_id INTEGER,
            created_at TIMESTAMP DEFAULT ${now},
            updated_at TIMESTAMP DEFAULT ${now},
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )`);

        await db.exec(`CREATE TABLE IF NOT EXISTS notifications (
            id ${pk},
            user_id INTEGER,
            turi TEXT NOT NULL,
            xabar TEXT NOT NULL,
            oqilgan INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT ${now},
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )`);

        await db.exec(`CREATE TABLE IF NOT EXISTS system_settings (key TEXT PRIMARY KEY, value TEXT)`);

        await db.exec(`CREATE TABLE IF NOT EXISTS audit_logs (
            id ${pk}, 
            admin_id INTEGER, 
            action TEXT NOT NULL, 
            details TEXT, 
            ip_address TEXT, 
            created_at TIMESTAMP DEFAULT ${now}
        )`);

        await db.exec(`CREATE TABLE IF NOT EXISTS badges (id ${pk}, user_id INTEGER, badge_key TEXT, badge_name TEXT, badge_icon TEXT, badge_desc TEXT, earned_at TIMESTAMP DEFAULT ${now})`);

        console.log('✅ Tables created.');

        // 3. Seed Users
        const superPass = await bcrypt.hash('super123', 10);
        await db.run("INSERT INTO users (ism, familiya, email, role, password_hash) VALUES (?, ?, ?, ?, ?)", ['Super', 'Admin', 'super@admin.uz', 'superadmin', superPass]);

        const teacherPass = await bcrypt.hash('teacher123', 10);
        await db.run("INSERT INTO users (ism, familiya, email, role, password_hash, sinf) VALUES (?, ?, ?, ?, ?, ?)", ['Dilnoza', 'Rahimova', 'teacher@kitobxon.uz', 'teacher', teacherPass, '7-B']);

        const studentPass = await bcrypt.hash('student123', 10);
        await db.run("INSERT INTO users (ism, familiya, student_id, role, password_hash, sinf) VALUES (?, ?, ?, ?, ?, ?)", ['Alisher', 'Navoiy', 'AN1441', 'student', studentPass, '7-B']);
        await db.run("INSERT INTO users (ism, familiya, student_id, role, password_hash, sinf) VALUES (?, ?, ?, ?, ?, ?)", ['Bobur', 'Mirzo', 'BM1483', 'student', studentPass, '8-B']);

        console.log('👥 Users seeded.');
        console.log('🎉 Seed Completed Successfully!');
        process.exit(0);
    } catch (e) {
        console.error('❌ SEED ERROR:', e);
        process.exit(1);
    }
}

seed();
