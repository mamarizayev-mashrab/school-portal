const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const { generateQuiz } = require('../utils/aiQuiz');
const { checkBadges, addXP, XP_AMOUNTS } = require('../utils/gamification');

const router = express.Router();

// Fix #18: /results/my routeni /:id dan OLDIN joylashtirish
// O'quvchining test natijalari
router.get('/results/my', auth, async (req, res) => {
    try {
        const rows = await db.query(
            `SELECT r.*, q.reading_log_id, rl.kitob_nomi
       FROM results r
       JOIN quizzes q ON r.quiz_id = q.id
       JOIN reading_logs rl ON q.reading_log_id = rl.id
       WHERE r.user_id = ?
       ORDER BY r.topshirilgan_sana DESC`,
            [req.user.id]
        );

        res.json(rows);
    } catch (error) {
        console.error('Results xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

// Xulosa asosida test yaratish
router.post('/generate/:logId', auth, async (req, res) => {
    try {
        const { logId } = req.params;

        const log = await db.get('SELECT * FROM reading_logs WHERE id = ? AND user_id = ?', [logId, req.user.id]);
        if (!log) {
            return res.status(404).json({ xabar: 'Kitob topilmadi' });
        }

        const existingQuiz = await db.get('SELECT * FROM quizzes WHERE reading_log_id = ?', [logId]);
        if (existingQuiz) {
            return res.json({
                xabar: 'Test allaqachon yaratilgan',
                quiz: { ...existingQuiz, savollar: JSON.parse(existingQuiz.savollar) },
            });
        }

        const savollar = generateQuiz(log.xulosa, log.kitob_nomi, log.muallif);

        // JSON.stringify(savollar) ensures we store valid JSON text
        const result = await db.run(
            'INSERT INTO quizzes (reading_log_id, savollar) VALUES (?, ?)',
            [logId, JSON.stringify(savollar)]
        );

        const quiz = await db.get('SELECT * FROM quizzes WHERE id = ?', [result.lastInsertRowid]);

        res.status(201).json({
            xabar: 'Test muvaffaqiyatli yaratildi',
            quiz: { ...quiz, savollar },
        });
    } catch (error) {
        console.error('Quiz generate xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

// Testni olish
router.get('/:id', auth, async (req, res) => {
    try {
        const quiz = await db.get('SELECT * FROM quizzes WHERE id = ?', [req.params.id]);
        if (!quiz) {
            return res.status(404).json({ xabar: 'Test topilmadi' });
        }
        res.json({ ...quiz, savollar: JSON.parse(quiz.savollar) });
    } catch (error) {
        console.error('Quiz fetch xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

// Javob topshirish
router.post('/:id/submit', auth, async (req, res) => {
    try {
        const { javoblar } = req.body;

        const quiz = await db.get('SELECT * FROM quizzes WHERE id = ?', [req.params.id]);
        if (!quiz) {
            return res.status(404).json({ xabar: 'Test topilmadi' });
        }

        const savollar = JSON.parse(quiz.savollar);

        let togri = 0;
        let jami = savollar.length;

        savollar.forEach((savol, index) => {
            const userJavob = javoblar[index];
            if (userJavob !== undefined && userJavob !== null) {
                if (savol.turi === 'mcq' || savol.turi === 'tf') {
                    if (String(userJavob).toLowerCase() === String(savol.togri_javob).toLowerCase()) {
                        togri++;
                    }
                } else if (savol.turi === 'short') {
                    const userAnswer = String(userJavob).toLowerCase().trim();
                    const correctAnswer = String(savol.togri_javob).toLowerCase().trim();
                    if (userAnswer.includes(correctAnswer) || correctAnswer.includes(userAnswer)) {
                        togri++;
                    }
                }
            }
        });

        const ball = jami > 0 ? (togri / jami) * 100 : 0;

        const result = await db.run(
            'INSERT INTO results (quiz_id, user_id, javoblar, ball) VALUES (?, ?, ?, ?)',
            [req.params.id, req.user.id, JSON.stringify(javoblar), ball]
        );

        const natija = await db.get('SELECT * FROM results WHERE id = ?', [result.lastInsertRowid]);

        // Gamifikatsiya
        await addXP(req.user.id, XP_AMOUNTS.COMPLETE_TEST);
        if (ball >= 100) await addXP(req.user.id, XP_AMOUNTS.PERFECT_TEST);
        await checkBadges(req.user.id);
        await db.run(
            'INSERT INTO notifications (user_id, turi, xabar) VALUES (?, ?, ?)',
            [req.user.id, 'test', `📝 Test natijangiz: ${ball.toFixed(0)}% (${togri}/${jami})`]
        );

        res.json({
            xabar: 'Test natijasi saqlandi',
            natija: {
                ...natija,
                togri_javoblar: togri,
                jami_savollar: jami,
            },
        });
    } catch (error) {
        console.error('Quiz submit xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

module.exports = router;
