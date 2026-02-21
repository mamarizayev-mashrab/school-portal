const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const { bookSchema, validate } = require('../validation/schemas');
const { checkBadges, updateStreak, addXP, XP_AMOUNTS } = require('../utils/gamification');

const router = express.Router();

// O'qilgan kitoblarni olish
router.get('/', auth, async (req, res) => {
    try {
        const rows = await db.query(
            'SELECT * FROM reading_logs WHERE user_id = ? ORDER BY oqilgan_sana DESC',
            [req.user.id]
        );
        res.json(rows);
    } catch (error) {
        console.error('Kitoblar xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

// Yangi kitob qo'shish
router.post('/', auth, validate(bookSchema), async (req, res) => {
    try {
        const { kitob_nomi, muallif, sahifalar_soni, oqilgan_sana, xulosa } = req.body;

        const result = await db.run(
            `INSERT INTO reading_logs (user_id, kitob_nomi, muallif, sahifalar_soni, oqilgan_sana, xulosa)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [req.user.id, kitob_nomi, muallif, sahifalar_soni, oqilgan_sana, xulosa]
        );

        const kitob = await db.get('SELECT * FROM reading_logs WHERE id = ?', [result.lastInsertRowid]);

        // Gamifikatsiya
        await addXP(req.user.id, XP_AMOUNTS.ADD_BOOK);
        await updateStreak(req.user.id);
        const newBadges = await checkBadges(req.user.id);

        res.status(201).json({
            xabar: "Kitob muvaffaqiyatli qo'shildi",
            kitob,
            newBadges,
        });
    } catch (error) {
        console.error("Kitob qo'shish xatosi:", error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

// Kitobni tahrirlash
router.put('/:id', auth, async (req, res) => {
    try {
        const { kitob_nomi, muallif, sahifalar_soni, oqilgan_sana, xulosa } = req.body;

        const check = await db.get('SELECT * FROM reading_logs WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        if (!check) {
            return res.status(404).json({ xabar: 'Kitob topilmadi' });
        }

        await db.run(
            `UPDATE reading_logs SET kitob_nomi = ?, muallif = ?, sahifalar_soni = ?,
       oqilgan_sana = ?, xulosa = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
            [kitob_nomi, muallif, sahifalar_soni, oqilgan_sana, xulosa, req.params.id, req.user.id]
        );

        const kitob = await db.get('SELECT * FROM reading_logs WHERE id = ?', [req.params.id]);
        res.json({ xabar: 'Kitob yangilandi', kitob });
    } catch (error) {
        console.error('Kitob yangilash xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

// Kitobni o'chirish
router.delete('/:id', auth, async (req, res) => {
    try {
        const result = await db.run('DELETE FROM reading_logs WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);

        if (result.changes === 0) {
            return res.status(404).json({ xabar: 'Kitob topilmadi' });
        }

        res.json({ xabar: "Kitob o'chirildi" });
    } catch (error) {
        console.error("Kitob o'chirish xatosi:", error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

module.exports = router;
