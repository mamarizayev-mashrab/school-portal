const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const { bookSchema, validate } = require('../validation/schemas');
const { checkBadges, updateStreak, addXP, XP_AMOUNTS } = require('../utils/gamification');

const router = express.Router();

// O'qilgan kitoblarni olish
router.get('/', auth, (req, res) => {
    try {
        const rows = db.prepare(
            'SELECT * FROM reading_logs WHERE user_id = ? ORDER BY oqilgan_sana DESC'
        ).all(req.user.id);
        res.json(rows);
    } catch (error) {
        console.error('Kitoblar xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

// Yangi kitob qo'shish
router.post('/', auth, validate(bookSchema), (req, res) => {
    try {
        const { kitob_nomi, muallif, sahifalar_soni, oqilgan_sana, xulosa } = req.body;

        const stmt = db.prepare(
            `INSERT INTO reading_logs (user_id, kitob_nomi, muallif, sahifalar_soni, oqilgan_sana, xulosa)
       VALUES (?, ?, ?, ?, ?, ?)`
        );
        const result = stmt.run(req.user.id, kitob_nomi, muallif, sahifalar_soni, oqilgan_sana, xulosa);

        const kitob = db.prepare('SELECT * FROM reading_logs WHERE id = ?').get(result.lastInsertRowid);

        // Gamifikatsiya
        addXP(req.user.id, XP_AMOUNTS.ADD_BOOK);
        updateStreak(req.user.id);
        const newBadges = checkBadges(req.user.id);

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
router.put('/:id', auth, (req, res) => {
    try {
        const { kitob_nomi, muallif, sahifalar_soni, oqilgan_sana, xulosa } = req.body;

        const check = db.prepare('SELECT * FROM reading_logs WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
        if (!check) {
            return res.status(404).json({ xabar: 'Kitob topilmadi' });
        }

        db.prepare(
            `UPDATE reading_logs SET kitob_nomi = ?, muallif = ?, sahifalar_soni = ?,
       oqilgan_sana = ?, xulosa = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`
        ).run(kitob_nomi, muallif, sahifalar_soni, oqilgan_sana, xulosa, req.params.id, req.user.id);

        const kitob = db.prepare('SELECT * FROM reading_logs WHERE id = ?').get(req.params.id);
        res.json({ xabar: 'Kitob yangilandi', kitob });
    } catch (error) {
        console.error('Kitob yangilash xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

// Kitobni o'chirish
router.delete('/:id', auth, (req, res) => {
    try {
        const result = db.prepare('DELETE FROM reading_logs WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);

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
