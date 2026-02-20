const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../config/db');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

// Storage: Memory (RAM) — faylni to'g'ridan-to'g'ri bazaga yozish uchun ushlab turadi
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit (Baza to'lib ketmasligi uchun)
});

// Helper: Multer promise wrapper
const uploadPdf = (req, res) => {
    return new Promise((resolve, reject) => {
        upload.single('pdf')(req, res, (err) => {
            if (err) return reject({ status: 400, xabar: err.message });
            resolve();
        });
    });
};

/* Schema Creation (Updated for Binary Storage) */
(async () => {
    try {
        const isPostgres = !!process.env.DATABASE_URL;
        const pk = isPostgres ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
        const blobType = isPostgres ? 'BYTEA' : 'BLOB'; // Binary type

        await db.exec(`
            CREATE TABLE IF NOT EXISTS library_books (
                id ${pk},
                nomi TEXT NOT NULL,
                tavsif TEXT,
                kategoriya TEXT NOT NULL,
                fayl_nomi TEXT NOT NULL,
                fayl_data ${blobType}, -- Faylning o'zi shu yerda saqlanadi
                fayl_hajmi INTEGER DEFAULT 0,
                yuklagan_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    } catch (e) {
        console.error("Library Schema Error:", e.message);
    }
})();

// ===================== GET — Kitoblar ro'yxati (Fayl datasiz) =====================
router.get('/', auth, async (req, res) => {
    try {
        const { search, kategoriya } = req.query;
        // Faylning o'zini (fayl_data) olib kelmaymiz, faqat info. Bu og'irlik qilmasligi uchun.
        let query = `
            SELECT lb.id, lb.nomi, lb.tavsif, lb.kategoriya, lb.fayl_nomi, lb.fayl_hajmi, lb.created_at, 
                   u.ism || ' ' || u.familiya as yuklagan_ism
            FROM library_books lb
            LEFT JOIN users u ON lb.yuklagan_id = u.id
        `;
        const params = [];
        const conditions = [];

        if (search) {
            conditions.push(`(lb.nomi LIKE ? OR lb.tavsif LIKE ?)`);
            params.push(`%${search}%`, `%${search}%`);
        }
        if (kategoriya && kategoriya !== 'all') {
            conditions.push(`lb.kategoriya = ?`);
            params.push(kategoriya);
        }
        if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
        query += ' ORDER BY lb.created_at DESC';

        const books = await db.query(query, params);

        const cats = await db.query('SELECT DISTINCT kategoriya FROM library_books ORDER BY kategoriya');
        const kategoriyalar = cats.map(c => c.kategoriya);

        res.json({ kitoblar: books, kategoriyalar });
    } catch (error) {
        console.error('Kutubxona xatosi:', error);
        res.status(500).json({ xabar: "Server xatosi" });
    }
});

// ===================== GET — Bitta kitob info =====================
router.get('/:id', auth, async (req, res) => {
    try {
        // Bu yerda ham fayl_data ni olib kelmaymiz
        const book = await db.get(`
            SELECT lb.id, lb.nomi, lb.tavsif, lb.kategoriya, lb.fayl_nomi, lb.fayl_hajmi, lb.created_at,
                   u.ism || ' ' || u.familiya as yuklagan_ism
            FROM library_books lb
            LEFT JOIN users u ON lb.yuklagan_id = u.id
            WHERE lb.id = ?
        `, [req.params.id]);

        if (!book) return res.status(404).json({ xabar: 'Kitob topilmadi' });
        res.json(book);
    } catch (error) {
        res.status(500).json({ xabar: 'Xato' });
    }
});

// ===================== GET — Faylni yuklab olish (DB dan) =====================
router.get('/:id/file', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '') || req.query.token;
        if (!token) return res.status(401).json({ xabar: 'Avtorizatsiya' });

        // Endi fayl_data ni so'raymiz
        const book = await db.get('SELECT fayl_nomi, fayl_data FROM library_books WHERE id = ?', [req.params.id]);

        if (!book || !book.fayl_data) {
            return res.status(404).json({ xabar: 'Fayl topilmadi yoki shikastlangan' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${book.fayl_nomi}"`);

        // Binary datani yuborish
        res.send(book.fayl_data);

    } catch (error) {
        console.error('File download error:', error);
        res.status(500).json({ xabar: 'Xato' });
    }
});

// ===================== POST — Kitob yuklash (DB ga) =====================
router.post('/', auth, rbac('superadmin'), async (req, res) => {
    try {
        await uploadPdf(req, res);
        const { nomi, tavsif, kategoriya } = req.body;

        if (!req.file) return res.status(400).json({ xabar: 'Fayl tanlang' });
        if (!nomi || !kategoriya) return res.status(400).json({ xabar: 'Malumotlar yetishmayapti' });

        // req.file.buffer -> bu faylning o'zi (binary)
        const result = await db.run(`
            INSERT INTO library_books (nomi, tavsif, kategoriya, fayl_nomi, fayl_data, fayl_hajmi, yuklagan_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [nomi, tavsif || '', kategoriya, req.file.originalname, req.file.buffer, req.file.size, req.user.id]);

        // Qaytarishda fayl_data ni yubormaymiz (katta bo'lgani uchun)
        res.status(201).json({
            xabar: 'Kitob bazaga yuklandi',
            kitobId: result.lastInsertRowid
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ xabar: 'Yuklashda xato' });
    }
});

// ===================== DELETE =====================
router.delete('/:id', auth, rbac('superadmin'), async (req, res) => {
    try {
        await db.run('DELETE FROM library_books WHERE id = ?', [req.params.id]);
        res.json({ xabar: "O'chirildi" });
    } catch (e) { res.status(500).json({ xabar: 'Xato' }); }
});

module.exports = router;
