const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Profilni olish
router.get('/', auth, (req, res) => {
    try {
        const user = db.prepare(
            'SELECT id, ism, familiya, email, role, sinf, avatar, streak_count, level, xp, theme, created_at FROM users WHERE id = ?'
        ).get(req.user.id);
        if (!user) return res.status(404).json({ xabar: 'Foydalanuvchi topilmadi' });

        const books = db.prepare('SELECT COUNT(*) as c FROM reading_logs WHERE user_id = ?').get(req.user.id);
        const badges = db.prepare('SELECT COUNT(*) as c FROM badges WHERE user_id = ?').get(req.user.id);

        res.json({ ...user, kitoblar_soni: books.c, nishonlar_soni: badges.c });
    } catch (error) {
        console.error('Profile xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

// Profilni yangilash
router.put('/', auth, (req, res) => {
    try {
        const { ism, familiya, sinf, avatar, theme } = req.body;

        db.prepare(
            'UPDATE users SET ism = COALESCE(?, ism), familiya = COALESCE(?, familiya), sinf = COALESCE(?, sinf), avatar = COALESCE(?, avatar), theme = COALESCE(?, theme), updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        ).run(ism || null, familiya || null, sinf || null, avatar || null, theme || null, req.user.id);

        const user = db.prepare(
            'SELECT id, ism, familiya, email, role, sinf, avatar, theme FROM users WHERE id = ?'
        ).get(req.user.id);

        res.json({ xabar: 'Profil yangilandi', user });
    } catch (error) {
        console.error('Profile update xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

// Parolni o'zgartirish
router.put('/password', auth, async (req, res) => {
    try {
        const { eskiParol, yangiParol } = req.body;

        if (!eskiParol || !yangiParol) {
            return res.status(400).json({ xabar: 'Eski va yangi parol kiritilishi kerak' });
        }
        if (yangiParol.length < 6) {
            return res.status(400).json({ xabar: "Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak" });
        }

        const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
        const isMatch = await bcrypt.compare(eskiParol, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ xabar: "Eski parol noto'g'ri" });
        }

        const hash = await bcrypt.hash(yangiParol, 12);
        db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(hash, req.user.id);

        res.json({ xabar: "Parol muvaffaqiyatli o'zgartirildi" });
    } catch (error) {
        console.error('Password change xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

module.exports = router;
