const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

// O'qish rejalarini olish
router.get('/', auth, async (req, res) => {
    try {
        const rows = await db.query(
            'SELECT * FROM reading_plans WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        const plans = rows.rows || rows || [];

        const result = [];
        for (const plan of plans) {
            const booksRes = await db.query('SELECT * FROM plan_books WHERE plan_id = ?', [plan.id]);
            const books = booksRes.rows || booksRes || [];
            const oqilgan = books.filter(b => b.oqilgan === 1).length;
            result.push({
                ...plan,
                kitoblar: books,
                oqilgan_soni: oqilgan,
                progress: books.length > 0 ? ((oqilgan / books.length) * 100).toFixed(0) : 0
            });
        }

        res.json(result);
    } catch (error) {
        console.error('Plans xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

// Yangi reja yaratish
router.post('/', auth, async (req, res) => {
    try {
        const { nomi, maqsad_kitoblar, boshlanish_sana, tugash_sana, kitoblar } = req.body;

        if (!nomi || !boshlanish_sana || !tugash_sana) {
            return res.status(400).json({ xabar: "Reja nomi va sanalar kiritilishi shart" });
        }

        const result = await db.run(
            'INSERT INTO reading_plans (user_id, nomi, maqsad_kitoblar, boshlanish_sana, tugash_sana) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, nomi, maqsad_kitoblar || 5, boshlanish_sana, tugash_sana]
        );

        const planId = result.lastInsertRowid;

        if (kitoblar && kitoblar.length > 0) {
            for (const book of kitoblar) {
                await db.run(
                    'INSERT INTO plan_books (plan_id, kitob_nomi, muallif) VALUES (?, ?, ?)',
                    [planId, book.kitob_nomi, book.muallif || '']
                );
            }
        }

        const plan = await db.get('SELECT * FROM reading_plans WHERE id = ?', [planId]);
        const savedBooksRes = await db.query('SELECT * FROM plan_books WHERE plan_id = ?', [planId]);
        const savedBooks = savedBooksRes.rows || savedBooksRes || [];

        res.status(201).json({ xabar: "Reja yaratildi", plan: { ...plan, kitoblar: savedBooks } });
    } catch (error) {
        console.error('Plan create xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

// Reja kitobini o'qilgan deb belgilash
router.put('/books/:bookId/complete', auth, async (req, res) => {
    try {
        const book = await db.get(`
            SELECT pb.id FROM plan_books pb
            JOIN reading_plans rp ON pb.plan_id = rp.id
            WHERE pb.id = ? AND rp.user_id = ?
        `, [req.params.bookId, req.user.id]);

        if (!book) {
            return res.status(404).json({ xabar: "Kitob topilmadi yoki sizning rejangizga tegishli emas" });
        }

        await db.run('UPDATE plan_books SET oqilgan = 1 WHERE id = ?', [req.params.bookId]);
        res.json({ xabar: "Kitob o'qilgan deb belgilandi" });
    } catch (error) {
        console.error('Book complete xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

// Rejani o'chirish
router.delete('/:id', auth, async (req, res) => {
    try {
        const plan = await db.get('SELECT id FROM reading_plans WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        if (!plan) {
            return res.status(404).json({ xabar: "Reja topilmadi" });
        }

        await db.run('DELETE FROM plan_books WHERE plan_id = ?', [req.params.id]);
        await db.run('DELETE FROM reading_plans WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ xabar: "Reja o'chirildi" });
    } catch (error) {
        console.error('Plan delete xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

module.exports = router;
