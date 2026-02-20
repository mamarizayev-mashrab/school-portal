const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

// Bildirishnomalarni olish
router.get('/', auth, async (req, res) => {
    try {
        const rows = await db.query(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
            [req.user.id]
        );
        const unread = await db.get(
            'SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND oqilgan = 0',
            [req.user.id]
        );
        res.json({ notifications: rows.rows || rows, unreadCount: unread ? parseInt(unread.c) : 0 });
    } catch (error) {
        console.error('Notifications xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

// Barchasini o'qilgan deb belgilash
router.put('/read-all', auth, async (req, res) => {
    try {
        await db.run('UPDATE notifications SET oqilgan = 1 WHERE user_id = ?', [req.user.id]);
        res.json({ xabar: "Barcha bildirishnomalar o'qildi" });
    } catch (error) {
        console.error('Read all xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

// Bitta bildirishnomani o'qilgan deb belgilash
router.put('/:id/read', auth, async (req, res) => {
    try {
        await db.run('UPDATE notifications SET oqilgan = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ xabar: "Bildirishnoma o'qildi" });
    } catch (error) {
        console.error('Read notification xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

// Bildirishnomani o'chirish
router.delete('/:id', auth, async (req, res) => {
    try {
        await db.run('DELETE FROM notifications WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ xabar: "Bildirishnoma o'chirildi" });
    } catch (error) {
        console.error('Delete notification xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

module.exports = router;
