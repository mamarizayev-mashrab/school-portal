/**
 * Gamifikatsiya tizimi — Nishonlar, XP, Level, Streak
 * (Async/PG compatible version)
 */

const db = require('../config/db');

// Barcha nishonlar ro'yxati
const BADGE_DEFINITIONS = [
    { key: 'first_book', name: 'Birinchi qadam', icon: '📖', desc: 'Birinchi kitobni o\'qidingiz', check: (s) => s.books >= 1 },
    { key: 'bookworm_5', name: 'Kitob qurchi', icon: '📚', desc: '5 ta kitob o\'qidingiz', check: (s) => s.books >= 5 },
    { key: 'bookworm_10', name: 'Kitobxon', icon: '🏆', desc: '10 ta kitob o\'qidingiz', check: (s) => s.books >= 10 },
    { key: 'bookworm_25', name: 'Super kitobxon', icon: '🌟', desc: '25 ta kitob o\'qidingiz', check: (s) => s.books >= 25 },
    { key: 'bookworm_50', name: 'Kitob ustasi', icon: '👑', desc: '50 ta kitob o\'qidingiz', check: (s) => s.books >= 50 },
    { key: 'pages_500', name: '500 sahifa', icon: '📄', desc: '500 sahifa o\'qidingiz', check: (s) => s.pages >= 500 },
    { key: 'pages_1000', name: 'Ming sahifa', icon: '📃', desc: '1000 sahifa o\'qidingiz', check: (s) => s.pages >= 1000 },
    { key: 'pages_5000', name: '5 ming sahifa', icon: '📜', desc: '5000 sahifa o\'qidingiz', check: (s) => s.pages >= 5000 },
    { key: 'first_test', name: 'Birinchi test', icon: '📝', desc: 'Birinchi testni topshirdingiz', check: (s) => s.tests >= 1 },
    { key: 'test_master', name: 'Test ustasi', icon: '🧠', desc: '10 ta testni topshirdingiz', check: (s) => s.tests >= 10 },
    { key: 'perfect_score', name: 'A\'lochi', icon: '💯', desc: 'Testdan 100% oldingiz', check: (s) => s.perfectTests >= 1 },
    { key: 'streak_3', name: '3 kunlik streak', icon: '🔥', desc: '3 kun ketma-ket kitob o\'qidingiz', check: (s) => s.streak >= 3 },
    { key: 'streak_7', name: 'Haftalik streak', icon: '⚡', desc: '7 kun ketma-ket kitob o\'qidingiz', check: (s) => s.streak >= 7 },
    { key: 'streak_30', name: 'Oylik streak', icon: '💎', desc: '30 kun ketma-ket kitob o\'qidingiz', check: (s) => s.streak >= 30 },
    { key: 'approved_1', name: 'Tasdiqlangan xulosa', icon: '✅', desc: 'Birinchi xulosa tasdiqlandi', check: (s) => s.approved >= 1 },
    { key: 'approved_10', name: 'Ishonchli yozuvchi', icon: '✍️', desc: '10 ta xulosa tasdiqlandi', check: (s) => s.approved >= 10 },
];

// Level tizimi
const LEVELS = [
    { name: 'Yangi', minXP: 0, icon: '🌱' },
    { name: 'O\'quvchi', minXP: 50, icon: '📖' },
    { name: 'Kitobxon', minXP: 150, icon: '📚' },
    { name: 'Bilimdon', minXP: 350, icon: '🧠' },
    { name: 'Ustoz', minXP: 600, icon: '🎓' },
    { name: 'Akademik', minXP: 1000, icon: '👑' },
    { name: 'Legenda', minXP: 2000, icon: '⭐' },
];

function getLevel(xp) {
    let current = LEVELS[0];
    let nextLevel = LEVELS[1];
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (xp >= LEVELS[i].minXP) {
            current = LEVELS[i];
            nextLevel = LEVELS[i + 1] || null;
            break;
        }
    }
    return {
        level: current,
        nextLevel,
        progress: nextLevel ? ((xp - current.minXP) / (nextLevel.minXP - current.minXP) * 100).toFixed(0) : 100,
    };
}

// XP miqdori — default qiymatlar
const XP_AMOUNTS_DEFAULT = {
    ADD_BOOK: 10,
    COMPLETE_TEST: 15,
    PERFECT_TEST: 30,
    SUMMARY_APPROVED: 20,
    DAILY_STREAK: 5,
    EARN_BADGE: 25,
};

// Async XP sozlamalarini olish
async function getXPAmounts() {
    try {
        const xpPerBook = await db.get("SELECT value FROM system_settings WHERE key = 'xp_per_book'");
        const xpPerPage = await db.get("SELECT value FROM system_settings WHERE key = 'xp_per_page'");

        // Agar DB bo'sh bo'lsa yoki xato bo'lsa, default qaytaradi
        return {
            ...XP_AMOUNTS_DEFAULT,
            ADD_BOOK: xpPerBook ? (parseInt(xpPerBook.value) || XP_AMOUNTS_DEFAULT.ADD_BOOK) : XP_AMOUNTS_DEFAULT.ADD_BOOK,
        };
    } catch (e) {
        return XP_AMOUNTS_DEFAULT;
    }
}

// XP berish (Async)
async function addXP(userId, amount) {
    await db.run('UPDATE users SET xp = xp + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [amount, userId]);
    const user = await db.get('SELECT xp FROM users WHERE id = ?', [userId]);
    const levelInfo = getLevel(user.xp);
    await db.run('UPDATE users SET level = ? WHERE id = ?', [levelInfo.level.name, userId]);
    return user.xp;
}

// Streak tekshirish va yangilash (Async)
async function updateStreak(userId) {
    const user = await db.get('SELECT streak_count, last_activity_date FROM users WHERE id = ?', [userId]);
    if (!user) return 0;

    const today = new Date().toISOString().split('T')[0];
    if (user.last_activity_date === today) return user.streak_count;

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    let newStreak = 1;

    // Kecha faol bo'lgan bo'lsa, streak oshiriladi
    if (user.last_activity_date === yesterday) {
        newStreak = (user.streak_count || 0) + 1;
        const amounts = await getXPAmounts();
        await addXP(userId, amounts.DAILY_STREAK);
    }
    // Aks holda u 1 ga tushadi (chunki bugun kirdi)

    await db.run('UPDATE users SET streak_count = ?, last_activity_date = ? WHERE id = ?', [newStreak, today, userId]);
    return newStreak;
}

// Statistikani olish (Async helper)
async function getUserStats(userId) {
    const books = await db.get('SELECT COUNT(*) as c, COALESCE(SUM(sahifalar_soni), 0) as p FROM reading_logs WHERE user_id = ?', [userId]);
    const tests = await db.get('SELECT COUNT(*) as c FROM results WHERE user_id = ?', [userId]);
    const perfect = await db.get('SELECT COUNT(*) as c FROM results WHERE user_id = ? AND ball >= 100', [userId]);
    const approved = await db.get('SELECT COUNT(*) as c FROM reading_logs WHERE user_id = ? AND xulosa_tasdiqlangan = 1', [userId]);
    const user = await db.get('SELECT streak_count FROM users WHERE id = ?', [userId]);

    return {
        books: parseInt(books?.c || 0),
        pages: parseInt(books?.p || 0),
        tests: parseInt(tests?.c || 0),
        perfectTests: parseInt(perfect?.c || 0),
        approved: parseInt(approved?.c || 0),
        streak: user?.streak_count || 0,
    };
}

// Nishonlarni tekshirish (Async)
async function checkBadges(userId) {
    const stats = await getUserStats(userId);
    const existingRows = await db.query('SELECT badge_key FROM badges WHERE user_id = ?', [userId]);

    // db.query returns result object in PG, or array in SQLite wrapper. 
    // db.js wrapper unifies this: query returns { rows: [] } usually or array.
    // Let's assume db.query returns { rows: [] } based on previous usage or check wrapper.
    // Actually, my db.js wrapper for SQLite returns rows directly for query?
    // Wait, let's use db.get/all pattern if possible or handle both.
    // My db.js: query() returns res (PG) or matches PG structure. 
    // safely: use (res.rows || res)

    const rows = existingRows.rows || existingRows || [];
    const existing = rows.map(b => b.badge_key);

    const amounts = await getXPAmounts();
    const newBadges = [];

    for (const badge of BADGE_DEFINITIONS) {
        if (!existing.includes(badge.key) && badge.check(stats)) {
            // Nishon berish
            await db.run(
                'INSERT INTO badges (user_id, badge_key, badge_name, badge_icon, badge_desc) VALUES (?, ?, ?, ?, ?)',
                [userId, badge.key, badge.name, badge.icon, badge.desc]
            );

            await addXP(userId, amounts.EARN_BADGE);
            newBadges.push(badge);

            // Notification
            await db.run(
                'INSERT INTO notifications (user_id, turi, xabar) VALUES (?, ?, ?)',
                [userId, 'badge', `🏅 Yangi nishon: "${badge.name}" — ${badge.desc}`]
            );
        }
    }

    return newBadges;
}

// User nishonlarini olish (Async)
async function getUserBadges(userId) {
    const res = await db.query('SELECT * FROM badges WHERE user_id = ? ORDER BY earned_at DESC', [userId]);
    return res.rows || res || [];
}

module.exports = {
    checkBadges, getUserBadges, updateStreak, addXP, getLevel, getXPAmounts,
    LEVELS, BADGE_DEFINITIONS,
};
