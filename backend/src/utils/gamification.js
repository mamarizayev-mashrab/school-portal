/**
 * Gamifikatsiya tizimi — Nishonlar, XP, Level, Streak
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

// XP berish
function addXP(userId, amount) {
    db.prepare('UPDATE users SET xp = xp + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(amount, userId);
    const user = db.prepare('SELECT xp FROM users WHERE id = ?').get(userId);
    const levelInfo = getLevel(user.xp);
    db.prepare('UPDATE users SET level = ? WHERE id = ?').run(levelInfo.level.name, userId);
    return user.xp;
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

// Fix #12: DB dan XP sozlamalarini o'qish
function getXPAmounts() {
    try {
        const xpPerBook = db.prepare("SELECT value FROM system_settings WHERE key = 'xp_per_book'").get();
        const xpPerPage = db.prepare("SELECT value FROM system_settings WHERE key = 'xp_per_page'").get();
        return {
            ...XP_AMOUNTS_DEFAULT,
            ADD_BOOK: xpPerBook ? parseInt(xpPerBook.value) || XP_AMOUNTS_DEFAULT.ADD_BOOK : XP_AMOUNTS_DEFAULT.ADD_BOOK,
        };
    } catch (e) {
        return XP_AMOUNTS_DEFAULT;
    }
}

// Backward compatibility uchun proxy
const XP_AMOUNTS = new Proxy(XP_AMOUNTS_DEFAULT, {
    get(target, prop) {
        const live = getXPAmounts();
        return live[prop] !== undefined ? live[prop] : target[prop];
    }
});

// Streak tekshirish va yangilash
function updateStreak(userId) {
    const user = db.prepare('SELECT streak_count, last_activity_date FROM users WHERE id = ?').get(userId);
    const today = new Date().toISOString().split('T')[0];

    if (user.last_activity_date === today) return user.streak_count;

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    let newStreak = 1;

    if (user.last_activity_date === yesterday) {
        newStreak = user.streak_count + 1;
        addXP(userId, XP_AMOUNTS.DAILY_STREAK);
    }

    db.prepare('UPDATE users SET streak_count = ?, last_activity_date = ? WHERE id = ?').run(newStreak, today, userId);
    return newStreak;
}

// Nishonlarni tekshirish
function checkBadges(userId) {
    const stats = getUserStats(userId);
    const existing = db.prepare('SELECT badge_key FROM badges WHERE user_id = ?').all(userId).map(b => b.badge_key);
    const newBadges = [];

    for (const badge of BADGE_DEFINITIONS) {
        if (!existing.includes(badge.key) && badge.check(stats)) {
            db.prepare(
                'INSERT OR IGNORE INTO badges (user_id, badge_key, badge_name, badge_icon, badge_desc) VALUES (?, ?, ?, ?, ?)'
            ).run(userId, badge.key, badge.name, badge.icon, badge.desc);

            addXP(userId, XP_AMOUNTS.EARN_BADGE);
            newBadges.push(badge);

            // Notification
            db.prepare(
                'INSERT INTO notifications (user_id, turi, xabar) VALUES (?, ?, ?)'
            ).run(userId, 'badge', `🏅 Yangi nishon: "${badge.name}" — ${badge.desc}`);
        }
    }

    return newBadges;
}

function getUserStats(userId) {
    const books = db.prepare('SELECT COUNT(*) as c, COALESCE(SUM(sahifalar_soni), 0) as p FROM reading_logs WHERE user_id = ?').get(userId);
    const tests = db.prepare('SELECT COUNT(*) as c FROM results WHERE user_id = ?').get(userId);
    const perfect = db.prepare('SELECT COUNT(*) as c FROM results WHERE user_id = ? AND ball >= 100').get(userId);
    const approved = db.prepare('SELECT COUNT(*) as c FROM reading_logs WHERE user_id = ? AND xulosa_tasdiqlangan = 1').get(userId);
    const user = db.prepare('SELECT streak_count FROM users WHERE id = ?').get(userId);

    return {
        books: books.c,
        pages: books.p,
        tests: tests.c,
        perfectTests: perfect.c,
        approved: approved.c,
        streak: user.streak_count,
    };
}

function getUserBadges(userId) {
    return db.prepare('SELECT * FROM badges WHERE user_id = ? ORDER BY earned_at DESC').all(userId);
}

module.exports = {
    checkBadges, getUserBadges, updateStreak, addXP, getLevel,
    XP_AMOUNTS, LEVELS, BADGE_DEFINITIONS,
};
