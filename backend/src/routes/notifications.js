const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

// Bildirishnomalarni olish
router.get('/', auth, (req, res) => {
    try {
        const rows = db.prepare(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
        ).all(req.user.id);
        const unread = db.prepare(
            'SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND oqilgan = 0'
        ).get(req.user.id);
        res.json({ notifications: rows, unreadCount: unread.c });
    } catch (error) {
        console.error('Notifications xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

// Barchasini o'qilgan deb belgilash
router.put('/read-all', auth, (req, res) => {
    try {
        db.prepare('UPDATE notifications SET oqilgan = 1 WHERE user_id = ?').run(req.user.id);
        res.json({ xabar: "Barcha bildirishnomalar o'qildi" });
    } catch (error) {
        console.error('Read all xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

// Bitta bildirishnomani o'qilgan deb belgilash
router.put('/:id/read', auth, (req, res) => {
    try {
        db.prepare('UPDATE notifications SET oqilgan = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
        res.json({ xabar: "Bildirishnoma o'qildi" });
    } catch (error) {
        console.error('Read notification xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

// Bildirishnomani o'chirish
router.delete('/:id', auth, (req, res) => {
    try {
        db.prepare('DELETE FROM notifications WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
        res.json({ xabar: "Bildirishnoma o'chirildi" });
    } catch (error) {
        console.error('Delete notification xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

module.exports = router;
