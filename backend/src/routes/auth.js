const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { registerSchema, loginSchema, validate } = require('../validation/schemas');

const router = express.Router();

// Ro'yxatdan o'tish
router.post('/register', validate(registerSchema), async (req, res) => {
    try {
        const setting = await db.get("SELECT value FROM system_settings WHERE key = 'registration_open'");
        if (setting && setting.value === 'false') {
            return res.status(403).json({ xabar: "Ro'yxatdan o'tish vaqtincha yopilgan" });
        }

        const { ism, familiya, email, student_id, password, sinf, role = 'student' } = req.body;

        // Unikal tekshiruv
        let existing;
        if (role === 'student') {
            existing = await db.get('SELECT id FROM users WHERE student_id = ?', [student_id]);
            if (existing) return res.status(400).json({ xabar: "Bu ID allaqachon mavjud" });
        } else {
            existing = await db.get('SELECT id FROM users WHERE email = ?', [email]);
            if (existing) return res.status(400).json({ xabar: "Bu email allaqachon mavjud" });
        }

        const password_hash = await bcrypt.hash(password, 12);

        try {
            const result = await db.run(
                'INSERT INTO users (ism, familiya, email, student_id, password_hash, role, sinf) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [ism, familiya, email || null, student_id || null, password_hash, role, sinf || null]
            );

            const user = await db.get('SELECT id, ism, familiya, email, student_id, role, sinf FROM users WHERE id = ?', [result.lastInsertRowid]);

            const token = jwt.sign(
                { id: user.id, email: user.email, student_id: user.student_id, role: user.role, sinf: user.sinf },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            res.status(201).json({
                xabar: "Muvaffaqiyatli ro'yxatdan o'tdingiz",
                token,
                user,
            });
        } catch (err) {
            // Postgres (23505) & SQLite constraint codes
            if (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || err.code === '23505') {
                return res.status(400).json({ xabar: "Foydalanuvchi (Email yoki ID) allaqachon mavjud" });
            }
            throw err;
        }

    } catch (error) {
        console.error('Register xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

// Kirish
router.post('/login', validate(loginSchema), async (req, res) => {
    try {
        const { identifier, password } = req.body;

        // Email yoki Student ID orqali qidirish
        const user = await db.get('SELECT * FROM users WHERE email = ? OR student_id = ?', [identifier, identifier]);

        if (!user) {
            return res.status(401).json({ xabar: "Login yoki parol noto'g'ri" });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ xabar: "Login yoki parol noto'g'ri" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, student_id: user.student_id, role: user.role, sinf: user.sinf },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            xabar: 'Muvaffaqiyatli kirdingiz',
            token,
            user: {
                id: user.id,
                ism: user.ism,
                familiya: user.familiya,
                email: user.email,
                student_id: user.student_id,
                role: user.role,
                sinf: user.sinf,
            },
        });
    } catch (error) {
        console.error('Login xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

// Profil olish
router.get('/me', require('../middleware/auth'), async (req, res) => {
    try {
        const user = await db.get(
            'SELECT id, ism, familiya, email, student_id, role, sinf, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (!user) {
            return res.status(404).json({ xabar: 'Foydalanuvchi topilmadi' });
        }
        res.json(user);
    } catch (error) {
        console.error('Profile xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

module.exports = router;
