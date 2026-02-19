const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

// Uploads papkasini yaratish
const uploadsDir = process.env.UPLOADS_DIR
    ? path.join(process.env.UPLOADS_DIR, 'library')
    : path.join(__dirname, '..', '..', 'uploads', 'library');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer konfiguratsiyasi — faqat PDF
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'book-' + uniqueSuffix + '.pdf');
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Faqat PDF formatdagi fayllar qabul qilinadi'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Jadval yaratish (agar mavjud bo'lmasa)
db.exec(`
    CREATE TABLE IF NOT EXISTS library_books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nomi TEXT NOT NULL,
        tavsif TEXT,
        kategoriya TEXT NOT NULL,
        fayl_nomi TEXT NOT NULL,
        fayl_hajmi INTEGER DEFAULT 0,
        yuklagan_id INTEGER REFERENCES users(id),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// ===================== GET — Barcha kitoblarni olish =====================
router.get('/', auth, (req, res) => {
    try {
        const { search, kategoriya } = req.query;
        let query = `
            SELECT lb.*, u.ism || ' ' || u.familiya as yuklagan_ism
            FROM library_books lb
            LEFT JOIN users u ON lb.yuklagan_id = u.id
        `;
        const conditions = [];
        const params = [];

        if (search) {
            conditions.push(`(lb.nomi LIKE ? OR lb.tavsif LIKE ?)`);
            params.push(`%${search}%`, `%${search}%`);
        }

        if (kategoriya && kategoriya !== 'all') {
            conditions.push(`lb.kategoriya = ?`);
            params.push(kategoriya);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY lb.created_at DESC';

        const books = db.prepare(query).all(...params);

        // Kategoriyalar ro'yxatini ham qaytarish
        const kategoriyalar = db.prepare(
            `SELECT DISTINCT kategoriya FROM library_books ORDER BY kategoriya`
        ).all().map(k => k.kategoriya);

        res.json({ kitoblar: books, kategoriyalar });
    } catch (error) {
        console.error('Kutubxona xatosi:', error);
        res.status(500).json({ xabar: "Kutubxona ma'lumotlarini olishda xato" });
    }
});

// ===================== GET — Bitta kitob ma'lumotlari =====================
router.get('/:id', auth, (req, res) => {
    try {
        const book = db.prepare(`
            SELECT lb.*, u.ism || ' ' || u.familiya as yuklagan_ism
            FROM library_books lb
            LEFT JOIN users u ON lb.yuklagan_id = u.id
            WHERE lb.id = ?
        `).get(req.params.id);

        if (!book) {
            return res.status(404).json({ xabar: 'Kitob topilmadi' });
        }

        res.json(book);
    } catch (error) {
        console.error('Kitob olish xatosi:', error);
        res.status(500).json({ xabar: "Kitob ma'lumotlarini olishda xato" });
    }
});

// ===================== GET — PDF faylni ko'rish/yuklab olish =====================
router.get('/:id/file', (req, res) => {
    try {
        // iframe uchun query param token ni qo'llab-quvvatlash
        const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies?.token || req.query.token;

        if (!token) {
            return res.status(401).json({ xabar: 'Avtorizatsiya talab qilinadi' });
        }

        const jwt = require('jsonwebtoken');
        try {
            jwt.verify(token, process.env.JWT_SECRET);
        } catch (e) {
            return res.status(401).json({ xabar: 'Yaroqsiz token' });
        }

        const book = db.prepare('SELECT * FROM library_books WHERE id = ?').get(req.params.id);

        if (!book) {
            return res.status(404).json({ xabar: 'Kitob topilmadi' });
        }

        const filePath = path.join(uploadsDir, book.fayl_nomi);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ xabar: 'PDF fayl topilmadi' });
        }

        const download = req.query.download === 'true';

        if (download) {
            res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(book.nomi)}.pdf"`);
        } else {
            res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(book.nomi)}.pdf"`);
        }

        res.setHeader('Content-Type', 'application/pdf');
        const stat = fs.statSync(filePath);
        res.setHeader('Content-Length', stat.size);

        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } catch (error) {
        console.error('PDF fayl xatosi:', error);
        res.status(500).json({ xabar: 'PDF faylni yuklashda xato' });
    }
});

// Multer ni promise sifatida ishlatish uchun wrapper
const uploadPdf = (req, res) => {
    return new Promise((resolve, reject) => {
        upload.single('pdf')(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return reject({ status: 400, xabar: 'Fayl hajmi 50MB dan oshmasligi kerak' });
                }
                return reject({ status: 400, xabar: `Fayl yuklash xatosi: ${err.message}` });
            }
            if (err) {
                return reject({ status: 400, xabar: err.message });
            }
            resolve();
        });
    });
};

// ===================== POST — Yangi kitob yuklash (faqat superadmin) =====================
router.post('/', auth, rbac('superadmin'), async (req, res) => {
    try {
        await uploadPdf(req, res);

        const { nomi, tavsif, kategoriya } = req.body;

        if (!nomi || !kategoriya) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ xabar: 'Kitob nomi va kategoriya majburiy' });
        }

        if (!req.file) {
            return res.status(400).json({ xabar: 'PDF fayl yuklanishi shart' });
        }

        const result = db.prepare(`
            INSERT INTO library_books (nomi, tavsif, kategoriya, fayl_nomi, fayl_hajmi, yuklagan_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(nomi, tavsif || '', kategoriya, req.file.filename, req.file.size, req.user.id);

        const newBook = db.prepare('SELECT * FROM library_books WHERE id = ?').get(result.lastInsertRowid);

        res.status(201).json({ xabar: 'Kitob muvaffaqiyatli yuklandi', kitob: newBook });
    } catch (error) {
        if (req.file) {
            try { fs.unlinkSync(req.file.path); } catch (e) { }
        }
        if (error.status) {
            return res.status(error.status).json({ xabar: error.xabar });
        }
        console.error('Kitob yuklash xatosi:', error);
        res.status(500).json({ xabar: 'Kitob yuklashda xato' });
    }
});

// ===================== PUT — Kitobni tahrirlash (faqat superadmin) =====================
router.put('/:id', auth, rbac('superadmin'), async (req, res) => {
    try {
        await uploadPdf(req, res);

        const { nomi, tavsif, kategoriya } = req.body;
        const bookId = req.params.id;

        const existing = db.prepare('SELECT * FROM library_books WHERE id = ?').get(bookId);
        if (!existing) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ xabar: 'Kitob topilmadi' });
        }

        if (!nomi || !kategoriya) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ xabar: 'Kitob nomi va kategoriya majburiy' });
        }

        let fayl_nomi = existing.fayl_nomi;
        let fayl_hajmi = existing.fayl_hajmi;

        if (req.file) {
            const oldPath = path.join(uploadsDir, existing.fayl_nomi);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
            fayl_nomi = req.file.filename;
            fayl_hajmi = req.file.size;
        }

        db.prepare(`
            UPDATE library_books
            SET nomi = ?, tavsif = ?, kategoriya = ?, fayl_nomi = ?, fayl_hajmi = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(nomi, tavsif || '', kategoriya, fayl_nomi, fayl_hajmi, bookId);

        const updated = db.prepare('SELECT * FROM library_books WHERE id = ?').get(bookId);
        res.json({ xabar: 'Kitob yangilandi', kitob: updated });
    } catch (error) {
        if (req.file) {
            try { fs.unlinkSync(req.file.path); } catch (e) { }
        }
        if (error.status) {
            return res.status(error.status).json({ xabar: error.xabar });
        }
        console.error('Kitob yangilash xatosi:', error);
        res.status(500).json({ xabar: 'Kitob yangilashda xato' });
    }
});

// ===================== DELETE — Kitobni o'chirish (faqat superadmin) =====================
router.delete('/:id', auth, rbac('superadmin'), (req, res) => {
    try {
        const book = db.prepare('SELECT * FROM library_books WHERE id = ?').get(req.params.id);

        if (!book) {
            return res.status(404).json({ xabar: 'Kitob topilmadi' });
        }

        // PDF faylni o'chirish
        const filePath = path.join(uploadsDir, book.fayl_nomi);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        db.prepare('DELETE FROM library_books WHERE id = ?').run(req.params.id);

        res.json({ xabar: 'Kitob o\'chirildi' });
    } catch (error) {
        console.error('Kitob o\'chirish xatosi:', error);
        res.status(500).json({ xabar: 'Kitob o\'chirishda xato' });
    }
});

module.exports = router;
