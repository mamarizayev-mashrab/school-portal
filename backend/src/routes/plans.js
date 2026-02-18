const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

// O'qish rejalarini olish
router.get('/', auth, (req, res) => {
    try {
        const plans = db.prepare(
            'SELECT * FROM reading_plans WHERE user_id = ? ORDER BY created_at DESC'
        ).all(req.user.id);

        const result = plans.map(plan => {
            const books = db.prepare('SELECT * FROM plan_books WHERE plan_id = ?').all(plan.id);
            const oqilgan = books.filter(b => b.oqilgan === 1).length;
            return { ...plan, kitoblar: books, oqilgan_soni: oqilgan, progress: books.length > 0 ? ((oqilgan / books.length) * 100).toFixed(0) : 0 };
        });

        res.json(result);
    } catch (error) {
        console.error('Plans xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

// Yangi reja yaratish
router.post('/', auth, (req, res) => {
    try {
        const { nomi, maqsad_kitoblar, boshlanish_sana, tugash_sana, kitoblar } = req.body;

        if (!nomi || !boshlanish_sana || !tugash_sana) {
            return res.status(400).json({ xabar: "Reja nomi va sanalar kiritilishi shart" });
        }

        const result = db.prepare(
            'INSERT INTO reading_plans (user_id, nomi, maqsad_kitoblar, boshlanish_sana, tugash_sana) VALUES (?, ?, ?, ?, ?)'
        ).run(req.user.id, nomi, maqsad_kitoblar || 5, boshlanish_sana, tugash_sana);

        const planId = result.lastInsertRowid;

        if (kitoblar && kitoblar.length > 0) {
            const insertBook = db.prepare('INSERT INTO plan_books (plan_id, kitob_nomi, muallif) VALUES (?, ?, ?)');
            for (const book of kitoblar) {
                insertBook.run(planId, book.kitob_nomi, book.muallif || '');
            }
        }

        const plan = db.prepare('SELECT * FROM reading_plans WHERE id = ?').get(planId);
        const savedBooks = db.prepare('SELECT * FROM plan_books WHERE plan_id = ?').all(planId);

        res.status(201).json({ xabar: "Reja yaratildi", plan: { ...plan, kitoblar: savedBooks } });
    } catch (error) {
        console.error('Plan create xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

// Fix #7: Reja kitobini o'qilgan deb belgilash — user_id tekshiruvi bilan
router.put('/books/:bookId/complete', auth, (req, res) => {
    try {
        // Kitobning egasini tekshirish
        const book = db.prepare(`
            SELECT pb.id FROM plan_books pb
            JOIN reading_plans rp ON pb.plan_id = rp.id
            WHERE pb.id = ? AND rp.user_id = ?
        `).get(req.params.bookId, req.user.id);

        if (!book) {
            return res.status(404).json({ xabar: "Kitob topilmadi yoki sizning rejangizga tegishli emas" });
        }

        db.prepare('UPDATE plan_books SET oqilgan = 1 WHERE id = ?').run(req.params.bookId);
        res.json({ xabar: "Kitob o'qilgan deb belgilandi" });
    } catch (error) {
        console.error('Book complete xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

// Fix #8: Rejani o'chirish — user_id orqali to'liq himoyalangan
router.delete('/:id', auth, (req, res) => {
    try {
        // Avval tekshirish — bu reja haqiqatan ham shu userniki
        const plan = db.prepare('SELECT id FROM reading_plans WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
        if (!plan) {
            return res.status(404).json({ xabar: "Reja topilmadi" });
        }

        db.prepare('DELETE FROM plan_books WHERE plan_id = ?').run(req.params.id);
        db.prepare('DELETE FROM reading_plans WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
        res.json({ xabar: "Reja o'chirildi" });
    } catch (error) {
        console.error('Plan delete xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

module.exports = router;
