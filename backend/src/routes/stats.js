const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

const router = express.Router();
const isPostgres = !!process.env.DATABASE_URL;

// Helper SQL fragments
const SQL = {
    month: isPostgres ? "TO_CHAR(oqilgan_sana, 'YYYY-MM')" : "strftime('%Y-%m', oqilgan_sana)",
    lastYear: isPostgres ? "oqilgan_sana >= NOW() - INTERVAL '1 year'" : "oqilgan_sana >= date('now', '-12 months')",
};

// O'quvchi shaxsiy statistikasi
router.get('/student', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        const total = await db.get(
            'SELECT COUNT(*) as jami_kitoblar, COALESCE(SUM(sahifalar_soni), 0) as jami_sahifalar FROM reading_logs WHERE user_id = ?',
            [userId]
        );

        const monthlyRes = await db.query(
            `SELECT ${SQL.month} as oy,
            COUNT(*) as kitoblar_soni,
            SUM(sahifalar_soni) as sahifalar
            FROM reading_logs
            WHERE user_id = ? AND ${SQL.lastYear}
            GROUP BY ${SQL.month}
            ORDER BY oy`,
            [userId]
        );
        const monthly = monthlyRes.rows || monthlyRes || [];

        const approved = await db.get(
            'SELECT COUNT(*) as tasdiqlangan FROM reading_logs WHERE user_id = ? AND xulosa_tasdiqlangan = 1',
            [userId]
        );

        const tests = await db.get(
            'SELECT COALESCE(AVG(ball), 0) as ortacha_ball, COUNT(*) as testlar_soni FROM results WHERE user_id = ?',
            [userId]
        );

        res.json({
            jami_kitoblar: parseInt(total?.jami_kitoblar || 0),
            jami_sahifalar: parseInt(total?.jami_sahifalar || 0),
            tasdiqlangan_xulosalar: parseInt(approved?.tasdiqlangan || 0),
            ortacha_test_ball: parseFloat(tests?.ortacha_ball || 0).toFixed(1),
            testlar_soni: parseInt(tests?.testlar_soni || 0),
            oylik_statistika: monthly,
        });
    } catch (error) {
        console.error('Student stats xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

// Sinf statistikasi (o'qituvchi)
router.get('/class/:sinf', auth, rbac('teacher', 'admin'), async (req, res) => {
    try {
        const { sinf } = req.params;

        const studentsRes = await db.query(
            `SELECT u.id, u.ism, u.familiya, u.sinf,
            COUNT(rl.id) as kitoblar_soni,
            COALESCE(SUM(rl.sahifalar_soni), 0) as sahifalar
            FROM users u
            LEFT JOIN reading_logs rl ON u.id = rl.user_id
            WHERE u.sinf = ? AND u.role = 'student'
            GROUP BY u.id, u.ism, u.familiya, u.sinf
            ORDER BY kitoblar_soni DESC`,
            [sinf]
        );
        const students = studentsRes.rows || studentsRes || [];

        const total = await db.get(
            `SELECT COUNT(DISTINCT rl.id) as jami_kitoblar,
            COALESCE(SUM(rl.sahifalar_soni), 0) as jami_sahifalar,
            COUNT(DISTINCT u.id) as oquvchilar_soni
            FROM users u
            LEFT JOIN reading_logs rl ON u.id = rl.user_id
            WHERE u.sinf = ? AND u.role = 'student'`,
            [sinf]
        );

        const topBooksRes = await db.query(
            `SELECT kitob_nomi, muallif, COUNT(*) as oqilgan_soni
            FROM reading_logs rl
            JOIN users u ON rl.user_id = u.id
            WHERE u.sinf = ?
            GROUP BY kitob_nomi, muallif
            ORDER BY oqilgan_soni DESC
            LIMIT 10`,
            [sinf]
        );
        const topBooks = topBooksRes.rows || topBooksRes || [];

        res.json({
            oquvchilar: students,
            umumiy: {
                jami_kitoblar: parseInt(total?.jami_kitoblar || 0),
                jami_sahifalar: parseInt(total?.jami_sahifalar || 0),
                oquvchilar_soni: parseInt(total?.oquvchilar_soni || 0)
            },
            top_kitoblar: topBooks,
        });
    } catch (error) {
        console.error('Class stats xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

// Maktab umumiy statistikasi (admin/superadmin)
router.get('/school', auth, rbac('admin', 'superadmin'), async (req, res) => {
    try {
        const total = await db.get(`
            SELECT
                (SELECT COUNT(*) FROM users WHERE role = 'student') as jami_oquvchilar,
                (SELECT COUNT(*) FROM users WHERE role = 'teacher') as jami_oqituvchilar,
                (SELECT COUNT(*) FROM reading_logs) as jami_kitoblar,
                (SELECT COALESCE(SUM(sahifalar_soni), 0) FROM reading_logs) as jami_sahifalar
        `);

        const classStatRes = await db.query(`
            SELECT u.sinf, COUNT(DISTINCT u.id) as oquvchilar,
                COUNT(rl.id) as kitoblar,
                COALESCE(SUM(rl.sahifalar_soni), 0) as sahifalar
            FROM users u
            LEFT JOIN reading_logs rl ON u.id = rl.user_id
            WHERE u.role = 'student' AND u.sinf IS NOT NULL AND u.sinf != ''
            GROUP BY u.sinf
            ORDER BY u.sinf
        `);
        const classStat = classStatRes.rows || classStatRes || [];

        const monthlyRes = await db.query(`
            SELECT ${SQL.month} as oy,
                COUNT(*) as kitoblar_soni
            FROM reading_logs
            WHERE ${SQL.lastYear}
            GROUP BY ${SQL.month}
            ORDER BY oy
        `);
        const monthly = monthlyRes.rows || monthlyRes || [];

        const topBooksRes = await db.query(`
            SELECT kitob_nomi, muallif, COUNT(*) as oqilgan_soni
            FROM reading_logs
            GROUP BY kitob_nomi, muallif
            ORDER BY oqilgan_soni DESC
            LIMIT 10
        `);
        const topBooks = topBooksRes.rows || topBooksRes || [];

        res.json({
            umumiy: {
                jami_oquvchilar: parseInt(total?.jami_oquvchilar || 0),
                jami_oqituvchilar: parseInt(total?.jami_oqituvchilar || 0),
                jami_kitoblar: parseInt(total?.jami_kitoblar || 0),
                jami_sahifalar: parseInt(total?.jami_sahifalar || 0)
            },
            sinf_statistika: classStat,
            oylik_faollik: monthly,
            top_kitoblar: topBooks,
        });
    } catch (error) {
        console.error('School stats xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

module.exports = router;
