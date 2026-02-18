const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { registerSchema, loginSchema, validate } = require('../validation/schemas');

const router = express.Router();

// Ro'yxatdan o'tish
router.post('/register', validate(registerSchema), async (req, res) => {
    try {
        const setting = db.prepare("SELECT value FROM system_settings WHERE key = 'registration_open'").get();
        if (setting && setting.value === 'false') {
            return res.status(403).json({ xabar: "Ro'yxatdan o'tish vaqtincha yopilgan" });
        }

        const { ism, familiya, email, student_id, password, sinf, role = 'student' } = req.body;

        // Unikal tekshiruv
        if (role === 'student') {
            const existingId = db.prepare('SELECT id FROM users WHERE student_id = ?').get(student_id);
            if (existingId) return res.status(400).json({ xabar: "Bu ID allaqachon mavjud" });
        } else {
            const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
            if (existingEmail) return res.status(400).json({ xabar: "Bu email allaqachon mavjud" });
        }

        const password_hash = await bcrypt.hash(password, 12);

        const stmt = db.prepare(
            'INSERT INTO users (ism, familiya, email, student_id, password_hash, role, sinf) VALUES (?, ?, ?, ?, ?, ?, ?)'
        );

        try {
            const result = stmt.run(ism, familiya, email || null, student_id || null, password_hash, role, sinf || null);
            const user = db.prepare('SELECT id, ism, familiya, email, student_id, role, sinf FROM users WHERE id = ?').get(result.lastInsertRowid);

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
            if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
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
        const user = db.prepare('SELECT * FROM users WHERE email = ? OR student_id = ?').get(identifier, identifier);

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
router.get('/me', require('../middleware/auth'), (req, res) => {
    try {
        const user = db.prepare(
            'SELECT id, ism, familiya, email, student_id, role, sinf, created_at FROM users WHERE id = ?'
        ).get(req.user.id);

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
