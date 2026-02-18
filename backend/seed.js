const db = require('./src/config/db');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function seed() {
    try {
        db.pragma('foreign_keys = OFF');
        const tables = ['users', 'book_catalog', 'reading_logs', 'quizzes', 'results', 'badges', 'notifications', 'reading_plans', 'plan_books', 'system_settings', 'audit_logs'];
        for (const table of tables) {
            db.exec(`DROP TABLE IF EXISTS ${table}`);
        }

        // Migratsiya
        console.log('Jadvallar yangilanmoqda...');
        const migrateSql = fs.readFileSync(path.join(__dirname, 'src/config/migrate.sql'), 'utf-8');
        db.exec(migrateSql);
        console.log('Jadvallar yaratildi.');

        const insertUser = db.prepare(
            `INSERT INTO users (ism, familiya, email, student_id, password_hash, role, sinf) VALUES (?, ?, ?, ?, ?, ?, ?)`
        );

        // Super Admin — barcha boshqaruv
        const superPassword = await bcrypt.hash('super123', 12);
        insertUser.run('Super', 'Admin', 'super@admin.uz', null, superPassword, 'superadmin', null);

        // O'qituvchi
        const teacherPassword = await bcrypt.hash('teacher123', 12);
        insertUser.run('Dilnoza', 'Rahimova', 'teacher@kitobxon.uz', null, teacherPassword, 'teacher', null);

        // O'quvchilar (ID orqali, email yo'q)
        const studentPassword = await bcrypt.hash('student123', 12);
        const students = [
            ['Alisher', 'Navoiy', 'AN1441', '7-A'],
            ['Bobur', 'Mirzo', 'BM1483', '8-B'],
            ['Gulnora', 'Karimova', 'GK1980', '7-A'],
            ['Jamshid', 'Toshmatov', 'JT2005', '9-A'],
            ['Malika', 'Usmonova', 'MU2008', '8-B'],
        ];

        for (const [ism, familiya, student_id, sinf] of students) {
            insertUser.run(ism, familiya, null, student_id, studentPassword, 'student', sinf);
        }

        // Kitoblar katalogi
        const insertCatalog = db.prepare(
            'INSERT OR IGNORE INTO book_catalog (nomi, muallif, janr, sahifalar_soni, tavsif) VALUES (?, ?, ?, ?, ?)'
        );

        const kitoblar = [
            ["O'tkan kunlar", 'Abdulla Qodiriy', 'Roman', 320, "O'zbek adabiyotining eng mashhur romanlaridan biri"],
            ['Mehrobdan chayon', 'Abdulla Qodiriy', 'Roman', 280, 'Tarixiy roman'],
            ['Shum bola', "G'afur G'ulom", 'Hikoya', 180, "O'zbek bolalar adabiyotining durdonasi"],
            ['Sarob', 'Abdulla Qahhor', 'Roman', 350, 'Ijtimoiy roman'],
            ['Kecha va kunduz', "Cho'lpon", 'Roman', 290, 'Tarixiy-romantik roman'],
            ['Ikki eshik orasi', "O'tkir Hoshimov", 'Roman', 260, "Zamonaviy o'zbek romani"],
            ['Dunyoning ishlari', "O'tkir Hoshimov", 'Roman', 240, 'Ijtimoiy mavzudagi roman'],
            ['Ufq', 'Said Ahmad', 'Roman', 300, "O'zbek qishloq hayoti"],
            ['Yulduzli tunlar', 'Pirimqul Qodirov', 'Tarixiy roman', 420, "Bobur hayotiga bag'ishlangan roman"],
            ['Bahor qaytmaydi', 'Hamid Olimjon', "She'riyat", 150, "O'zbek she'riyati namunasi"],
        ];

        for (const [nomi, muallif, janr, sahifalar_soni, tavsif] of kitoblar) {
            insertCatalog.run(nomi, muallif, janr, sahifalar_soni, tavsif);
        }

        // O'qilgan kitoblar (namuna)
        const userRow = db.prepare("SELECT id FROM users WHERE student_id = 'AN1441'").get();
        if (userRow) {
            const userId = userRow.id;
            const insertLog = db.prepare(
                'INSERT INTO reading_logs (user_id, kitob_nomi, muallif, sahifalar_soni, oqilgan_sana, xulosa) VALUES (?, ?, ?, ?, ?, ?)'
            );

            const sampleBooks = [
                ["O'tkan kunlar", 'Abdulla Qodiriy', 320, '2025-09-15',
                    "O'tkan kunlar romani O'zbekiston tarixining muhim davrlarini aks ettiradi. Asarda Otabek va Kumushbibi sevgi dostoni fonida milliy ong va istiqlol g'oyalari yoritiladi. Roman o'zbek adabiyotining eng yirik asarlaridan biri hisoblanadi va o'quvchilarga milliy qadriyatlarni anglatadi. Asarning har bir sahifasi o'tmish hayotning turli qirralarini ochib beradi. Qodiriy o'z davrining ijtimoiy muammolarini san'atkorona tasvirlagan. Bu roman nafaqat adabiy, balki tarixiy manba sifatida ham qimmatlidir. Romanoda sevgi, sodiqlik va vatan tuyg'ulari ifodalangan. Asar o'zbek xalqining milliy ruhini anglashda muhim ahamiyat kasb etadi."],
                ['Shum bola', "G'afur G'ulom", 180, '2025-10-20',
                    "Shum bola asari G'afur G'ulomning bolalik xotiralariga asoslangan. Asar qiziqarli voqealar orqali bolalardagi mehr-muhabbat, o'yin va sarguzashtlarni tasvirlaydi. Har bir bob o'quvchini bolalar olamiga olib kiradi. Asarning tili sodda va ravon bo'lib, bolalar uchun tushunarli. G'afur G'ulom bolalar psixologiyasini chuqur anglagan holda yozgan. Bu asar o'zbek bolalar adabiyotining oltin fondiga kiradi. Kitobda do'stlik, oila va tabiat mavzulari ham o'rin olgan. Har bir hikoya bolalar hayotining turli qirralarini ochib beradi."],
                ['Yulduzli tunlar', 'Pirimqul Qodirov', 420, '2025-11-10',
                    "Yulduzli tunlar romani Zahiriddin Muhammad Boburning hayoti va faoliyatini tasvirlaydi. Asar tarixiy dalillarga asoslangan holda yozilgan bo'lib, Bobur saltanatining qurilishi va qulashini aks ettiradi. Roman orqali biz buyuk temuriylar davri haqida ko'p ma'lumotlarni bilib olamiz. Pirimqul Qodirov tarixni badiiy adabiyot orqali jonlantirgan. Asarda harbiy yurushlar, siyosiy intriqalar va sevgi voqealari tasvirlangan. Bobur shaxsiyatining turli qirralari ochib berilgan. Bu roman o'zbek adabiyotining eng yirik tarixiy romanlari qatoriga kiradi. Kitob o'quvchilarga o'tmish tarix saboqlarini beradi."],
            ];

            for (const [kitob, muallif, sahifalar, sana, xulosa] of sampleBooks) {
                insertLog.run(userId, kitob, muallif, sahifalar, sana, xulosa);
            }
        }

        // Bobur uchun ham kitob qo'shamiz
        const boburRow = db.prepare("SELECT id FROM users WHERE student_id = 'BM1483'").get();
        if (boburRow) {
            const insertLog = db.prepare(
                'INSERT INTO reading_logs (user_id, kitob_nomi, muallif, sahifalar_soni, oqilgan_sana, xulosa) VALUES (?, ?, ?, ?, ?, ?)'
            );
            insertLog.run(boburRow.id, "O'tkan kunlar", 'Abdulla Qodiriy', 320, '2025-10-05',
                "O'tkan kunlar romani O'zbekiston tarixining muhim davrlarini aks ettiradi. Asarda Otabek va Kumushbibi sevgi dostoni fonida milliy ong va istiqlol g'oyalari yoritiladi. Roman o'zbek adabiyotining eng yirik asarlaridan biri hisoblanadi va o'quvchilarga milliy qadriyatlarni anglatadi. Asarning har bir sahifasi o'tmish hayotning turli qirralarini ochib beradi. Qodiriy o'z davrining ijtimoiy muammolarini san'atkorona tasvirlagan. Bu roman nafaqat adabiy, balki tarixiy manba sifatida ham qimmatlidir. Romanoda sevgi, sodiqlik va vatan tuyg'ulari ifodalangan. Asar o'zbek xalqining milliy ruhini anglashda muhim ahamiyat kasb etadi.");
            insertLog.run(boburRow.id, 'Sarob', 'Abdulla Qahhor', 350, '2025-11-15',
                "Sarob romani Abdulla Qahhorning eng yirik asarlaridan biridir. Romanda ijtimoiy hayotning turli qirralari ochib berilgan. Asarning bosh qahramoni hayotda o'z o'rnini topish uchun kurashadi. Qahhor o'z davrining ijtimoiy muammolarini chuqur tahlil qilgan. Roman o'quvchiga hayot haqiqatlarini ko'rsatadi. Asarda insoniy qadriyatlar va axloqiy mezonlar yoritilgan. Har bir sahifa o'quvchini fikrlashga undaydi. Bu roman o'zbek adabiyotining eng yaxshi namunalaridan biridir.");
        }

        console.log("✅ Seed ma'lumotlari muvaffaqiyatli qo'shildi!");
        console.log('---');
        console.log('🔴 Super Admin : super@admin.uz  / super123');
        console.log('🟡 O\'qituvchi : teacher@kitobxon.uz / teacher123');
        console.log('🟢 O\'quvchi   : AN1441 / student123');
        console.log('🟢 O\'quvchi   : BM1483 / student123');
        process.exit(0);
    } catch (error) {
        console.error('Seed xatosi:', error);
        process.exit(1);
    }
}

seed();
