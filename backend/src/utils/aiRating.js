/**
 * AI Reyting Formulasi
 * Reyting = (Kitob soni × 30%) + (Sahifa soni × 20%) + (Test natijasi × 25%) + (Xulosa sifati × 25%)
 */

const db = require('../config/db');

function calculateRating(userId) {
    try {
        const books = db.prepare(
            'SELECT COUNT(*) as kitoblar, COALESCE(SUM(sahifalar_soni), 0) as sahifalar FROM reading_logs WHERE user_id = ?'
        ).get(userId);

        const kitobSoni = books.kitoblar;
        const sahifaSoni = books.sahifalar;

        const tests = db.prepare(
            'SELECT COALESCE(AVG(ball), 0) as ortacha FROM results WHERE user_id = ?'
        ).get(userId);
        const testBall = tests.ortacha;

        const xulosa = db.prepare(
            `SELECT COUNT(*) as jami,
        SUM(CASE WHEN xulosa_tasdiqlangan = 1 THEN 1 ELSE 0 END) as tasdiqlangan
       FROM reading_logs WHERE user_id = ?`
        ).get(userId);

        const jami = xulosa.jami;
        const tasdiqlangan = xulosa.tasdiqlangan;
        const xulosaSifati = jami > 0 ? (tasdiqlangan / jami) * 100 : 0;

        const kitobBall = Math.min(kitobSoni * 5, 100);
        const sahifaBall = Math.min(sahifaSoni * 0.02, 100);

        const reyting = (
            kitobBall * 0.30 +
            sahifaBall * 0.20 +
            testBall * 0.25 +
            xulosaSifati * 0.25
        ).toFixed(1);

        return {
            reyting: parseFloat(reyting),
            tafsilot: {
                kitob_ball: kitobBall.toFixed(1),
                sahifa_ball: sahifaBall.toFixed(1),
                test_ball: testBall.toFixed(1),
                xulosa_sifati: xulosaSifati.toFixed(1),
            },
        };
    } catch (error) {
        console.error('Rating xatosi:', error);
        return { reyting: 0, tafsilot: {} };
    }
}

module.exports = { calculateRating };
