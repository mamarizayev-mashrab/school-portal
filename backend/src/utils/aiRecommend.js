/**
 * AI Kitob Tavsiya Algoritmi
 * O'qilgan janr, tezlik va o'xshash foydalanuvchilar asosida
 */

const db = require('../config/db');

function getRecommendations(userId) {
    try {
        const userBooks = db.prepare('SELECT kitob_nomi, muallif FROM reading_logs WHERE user_id = ?').all(userId);
        const readBookNames = userBooks.map(b => b.kitob_nomi);

        let recommendations = [];

        if (readBookNames.length > 0) {
            const mualliflar = [...new Set(userBooks.map(b => b.muallif))];

            for (const muallif of mualliflar) {
                const similar = db.prepare(
                    `SELECT DISTINCT kitob_nomi, muallif, COUNT(*) as oqilgan_soni
           FROM reading_logs
           WHERE muallif = ? AND kitob_nomi NOT IN (${readBookNames.map(() => '?').join(',')})
           GROUP BY kitob_nomi, muallif
           ORDER BY oqilgan_soni DESC
           LIMIT 3`
                ).all(muallif, ...readBookNames);

                recommendations.push(...similar.map(r => ({ ...r, sabab: "O'xshash muallif asosida" })));
            }
        }

        const popular = db.prepare(
            `SELECT kitob_nomi, muallif, COUNT(*) as oqilgan_soni
       FROM reading_logs
       GROUP BY kitob_nomi, muallif
       ORDER BY oqilgan_soni DESC
       LIMIT 5`
        ).all();
        recommendations.push(...popular.map(r => ({ ...r, sabab: 'Mashhur kitob' })));

        const catalog = db.prepare('SELECT nomi as kitob_nomi, muallif, janr, tavsif FROM book_catalog ORDER BY RANDOM() LIMIT 5').all();
        recommendations.push(...catalog.map(r => ({ ...r, sabab: 'Katalogdan tavsiya' })));

        const unique = [];
        const seen = new Set();
        for (const rec of recommendations) {
            const key = rec.kitob_nomi + rec.muallif;
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(rec);
            }
        }

        return unique.slice(0, 10);
    } catch (error) {
        console.error('Recommendation xatosi:', error);
        return [];
    }
}

module.exports = { getRecommendations };
