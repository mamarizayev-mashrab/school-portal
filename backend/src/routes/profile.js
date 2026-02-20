const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Profilni olish
router.get('/', auth, async (req, res) => {
    try {
        const user = await db.get(
            `SELECT id, ism, familiya, email, role, sinf, avatar, streak_count, level, xp, theme, created_at 
             FROM users WHERE id = ?`,
            [req.user.id]
        );

        if (!user) return res.status(404).json({ xabar: 'Foydalanuvchi topilmadi' });

        // Kitoblar soni (Count)
        const books = await db.get('SELECT COUNT(*) as c FROM reading_logs WHERE user_id = ?', [req.user.id]);

        // Nishonlar soni (Count)
        const badges = await db.get('SELECT COUNT(*) as c FROM badges WHERE user_id = ?', [req.user.id]);

        // Convert BigInt or String count to Number for safety
        const kitoblar_soni = books ? parseInt(books.c) : 0;
        const nishonlar_soni = badges ? parseInt(badges.c) : 0;

        res.json({ ...user, kitoblar_soni, nishonlar_soni });
    } catch (error) {
        console.error('Profile xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

// Profilni yangilash
router.put('/', auth, async (req, res) => {
    try {
        const { ism, familiya, sinf, avatar, theme, email } = req.body;

        const currentUser = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
        if (!currentUser) return res.status(404).json({ xabar: 'Topilmadi' });

        // Email uniqueness check if changed
        if (email && email !== currentUser.email) {
            const exists = await db.get('SELECT id FROM users WHERE email = ?', [email]);
            if (exists) return res.status(400).json({ xabar: "Bu email band" });
        }

        await db.run(
            `UPDATE users SET 
                ism = ?, 
                familiya = ?, 
                sinf = ?, 
                avatar = ?, 
                theme = ?, 
                email = ?, 
                updated_at = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [
                ism || currentUser.ism,
                familiya || currentUser.familiya,
                sinf || currentUser.sinf,
                avatar || currentUser.avatar,
                theme || currentUser.theme,
                email || currentUser.email,
                req.user.id
            ]
        );

        const updatedUser = await db.get(
            'SELECT id, ism, familiya, email, role, sinf, avatar, theme FROM users WHERE id = ?',
            [req.user.id]
        );

        res.json({ xabar: 'Profil yangilandi', user: updatedUser });
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

        const user = await db.get('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
        if (!user) return res.status(404).json({ xabar: 'Topilmadi' });

        const isMatch = await bcrypt.compare(eskiParol, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ xabar: "Eski parol noto'g'ri" });
        }

        const hash = await bcrypt.hash(yangiParol, 12);
        await db.run('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [hash, req.user.id]);

        res.json({ xabar: "Parol muvaffaqiyatli o'zgartirildi" });
    } catch (error) {
        console.error('Password change xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

module.exports = router;
