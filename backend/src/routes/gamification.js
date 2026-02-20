const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const { getUserBadges, checkBadges, updateStreak, getLevel, LEVELS, BADGE_DEFINITIONS } = require('../utils/gamification');

const router = express.Router();

// O'z nishonlarimni olish
router.get('/badges', auth, async (req, res) => {
    try {
        // Streak yangilash
        await updateStreak(req.user.id);

        // Yangi nishonlarni tekshirish
        const newBadges = await checkBadges(req.user.id);
        const badges = await getUserBadges(req.user.id);

        const user = await db.get('SELECT xp, level, streak_count FROM users WHERE id = ?', [req.user.id]);
        const levelInfo = getLevel(user.xp);

        res.json({
            badges,
            newBadges,
            xp: user.xp,
            level: levelInfo.level,
            nextLevel: levelInfo.nextLevel,
            progress: levelInfo.progress,
            streak: user.streak_count,
            allBadges: BADGE_DEFINITIONS.map(b => ({
                key: b.key, name: b.name, icon: b.icon, desc: b.desc,
                earned: badges.some(ub => ub.badge_key === b.key),
            })),
        });
    } catch (error) {
        console.error('Badges xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

// Streak yangilash
router.post('/streak', auth, async (req, res) => {
    try {
        const streak = await updateStreak(req.user.id);
        res.json({ streak });
    } catch (error) {
        console.error('Streak xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

// Level ma'lumotlari
router.get('/level', auth, async (req, res) => {
    try {
        await updateStreak(req.user.id);

        const user = await db.get('SELECT xp, level, streak_count FROM users WHERE id = ?', [req.user.id]);
        const levelInfo = getLevel(user.xp);
        res.json({
            xp: user.xp,
            level: levelInfo.level,
            nextLevel: levelInfo.nextLevel,
            progress: levelInfo.progress,
            streak: user.streak_count,
            allLevels: LEVELS,
        });
    } catch (error) {
        console.error('Level xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

module.exports = router;
