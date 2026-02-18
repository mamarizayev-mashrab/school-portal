const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

const router = express.Router();

// O'quvchi shaxsiy statistikasi
router.get('/student', auth, (req, res) => {
    try {
        const userId = req.user.id;

        const total = db.prepare(
            'SELECT COUNT(*) as jami_kitoblar, COALESCE(SUM(sahifalar_soni), 0) as jami_sahifalar FROM reading_logs WHERE user_id = ?'
        ).get(userId);

        const monthly = db.prepare(
            `SELECT strftime('%Y-%m', oqilgan_sana) as oy,
        COUNT(*) as kitoblar_soni,
        SUM(sahifalar_soni) as sahifalar
       FROM reading_logs
       WHERE user_id = ? AND oqilgan_sana >= date('now', '-12 months')
       GROUP BY strftime('%Y-%m', oqilgan_sana)
       ORDER BY oy`
        ).all(userId);

        const approved = db.prepare(
            'SELECT COUNT(*) as tasdiqlangan FROM reading_logs WHERE user_id = ? AND xulosa_tasdiqlangan = 1'
        ).get(userId);

        const tests = db.prepare(
            'SELECT COALESCE(AVG(ball), 0) as ortacha_ball, COUNT(*) as testlar_soni FROM results WHERE user_id = ?'
        ).get(userId);

        res.json({
            jami_kitoblar: total.jami_kitoblar,
            jami_sahifalar: total.jami_sahifalar,
            tasdiqlangan_xulosalar: approved.tasdiqlangan,
            ortacha_test_ball: parseFloat(tests.ortacha_ball).toFixed(1),
            testlar_soni: tests.testlar_soni,
            oylik_statistika: monthly,
        });
    } catch (error) {
        console.error('Student stats xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

// Sinf statistikasi (o'qituvchi)
router.get('/class/:sinf', auth, rbac('teacher', 'admin'), (req, res) => {
    try {
        const { sinf } = req.params;

        const students = db.prepare(
            `SELECT u.id, u.ism, u.familiya, u.sinf,
        COUNT(rl.id) as kitoblar_soni,
        COALESCE(SUM(rl.sahifalar_soni), 0) as sahifalar
       FROM users u
       LEFT JOIN reading_logs rl ON u.id = rl.user_id
       WHERE u.sinf = ? AND u.role = 'student'
       GROUP BY u.id, u.ism, u.familiya, u.sinf
       ORDER BY kitoblar_soni DESC`
        ).all(sinf);

        const total = db.prepare(
            `SELECT COUNT(DISTINCT rl.id) as jami_kitoblar,
        COALESCE(SUM(rl.sahifalar_soni), 0) as jami_sahifalar,
        COUNT(DISTINCT u.id) as oquvchilar_soni
       FROM users u
       LEFT JOIN reading_logs rl ON u.id = rl.user_id
       WHERE u.sinf = ? AND u.role = 'student'`
        ).get(sinf);

        const topBooks = db.prepare(
            `SELECT kitob_nomi, muallif, COUNT(*) as oqilgan_soni
       FROM reading_logs rl
       JOIN users u ON rl.user_id = u.id
       WHERE u.sinf = ?
       GROUP BY kitob_nomi, muallif
       ORDER BY oqilgan_soni DESC
       LIMIT 10`
        ).all(sinf);

        res.json({
            oquvchilar: students,
            umumiy: total,
            top_kitoblar: topBooks,
        });
    } catch (error) {
        console.error('Class stats xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

// Maktab umumiy statistikasi (admin/superadmin)
router.get('/school', auth, rbac('admin', 'superadmin'), (req, res) => {
    try {
        const total = db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'student') as jami_oquvchilar,
        (SELECT COUNT(*) FROM users WHERE role = 'teacher') as jami_oqituvchilar,
        (SELECT COUNT(*) FROM reading_logs) as jami_kitoblar,
        (SELECT COALESCE(SUM(sahifalar_soni), 0) FROM reading_logs) as jami_sahifalar
    `).get();

        const classStat = db.prepare(`
      SELECT u.sinf, COUNT(DISTINCT u.id) as oquvchilar,
        COUNT(rl.id) as kitoblar,
        COALESCE(SUM(rl.sahifalar_soni), 0) as sahifalar
      FROM users u
      LEFT JOIN reading_logs rl ON u.id = rl.user_id
      WHERE u.role = 'student' AND u.sinf IS NOT NULL AND u.sinf != ''
      GROUP BY u.sinf
      ORDER BY u.sinf
    `).all();

        const monthly = db.prepare(`
      SELECT strftime('%Y-%m', oqilgan_sana) as oy,
        COUNT(*) as kitoblar_soni
      FROM reading_logs
      WHERE oqilgan_sana >= date('now', '-12 months')
      GROUP BY strftime('%Y-%m', oqilgan_sana)
      ORDER BY oy
    `).all();

        const topBooks = db.prepare(`
      SELECT kitob_nomi, muallif, COUNT(*) as oqilgan_soni
      FROM reading_logs
      GROUP BY kitob_nomi, muallif
      ORDER BY oqilgan_soni DESC
      LIMIT 10
    `).all();

        res.json({
            umumiy: total,
            sinf_statistika: classStat,
            oylik_faollik: monthly,
            top_kitoblar: topBooks,
        });
    } catch (error) {
        console.error('School stats xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

// Reyting jadvali
router.get('/leaderboard', auth, (req, res) => {
    try {
        const rows = db.prepare(`
      SELECT u.id, u.ism, u.familiya, u.sinf,
        COUNT(rl.id) as kitoblar_soni,
        COALESCE(SUM(rl.sahifalar_soni), 0) as jami_sahifalar,
        COALESCE(AVG(r.ball), 0) as ortacha_ball,
        (COUNT(rl.id) * 0.3 + COALESCE(SUM(rl.sahifalar_soni), 0) * 0.0002 + COALESCE(AVG(r.ball), 0) * 0.25) as reyting
      FROM users u
      LEFT JOIN reading_logs rl ON u.id = rl.user_id
      LEFT JOIN results r ON u.id = r.user_id
      WHERE u.role = 'student'
      GROUP BY u.id, u.ism, u.familiya, u.sinf
      ORDER BY reyting DESC
      LIMIT 50
    `).all();

        res.json(rows);
    } catch (error) {
        console.error('Leaderboard xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

module.exports = router;
