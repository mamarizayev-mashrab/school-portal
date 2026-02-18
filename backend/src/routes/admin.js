const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const { catalogSchema, validate, adminCreateUserSchema } = require('../validation/schemas');
const { checkBadges, addXP, XP_AMOUNTS } = require('../utils/gamification');
const bcrypt = require('bcryptjs');

const router = express.Router();

// ===== Foydalanuvchilarni boshqarish =====

router.get('/users', auth, rbac('superadmin'), (req, res) => {
    try {
        const { role, sinf } = req.query;
        let query = 'SELECT id, ism, familiya, email, student_id, role, sinf, created_at FROM users WHERE 1=1';
        const params = [];

        if (role) {
            query += ' AND role = ?';
            params.push(role);
        }
        if (sinf) {
            query += ' AND sinf = ?';
            params.push(sinf);
        }
        query += ' ORDER BY created_at DESC';

        const rows = db.prepare(query).all(...params);
        res.json(rows);
    } catch (error) {
        console.error('Users xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

const logAudit = require('../utils/audit');

// Yangi user qo'shish (Faqat Super Admin admin qo'sha oladi)
router.post('/users', auth, rbac('superadmin'), validate(adminCreateUserSchema), async (req, res) => {
    try {
        const { ism, familiya, email, student_id, password, role, sinf } = req.body;

        // Role restriction
        if ((role === 'admin' || role === 'superadmin') && req.user.role !== 'superadmin') {
            return res.status(403).json({ xabar: 'Faqat Super Admin yangi admin/superadmin qo\'shishi mumkin' });
        }

        // Super Admin uniqueness check
        if (role === 'superadmin') {
            const superAdminCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'superadmin'").get().count;
            if (superAdminCount > 0) {
                return res.status(403).json({ xabar: "Tizimda faqat bitta Super Admin bo'lishi mumkin" });
            }
        }

        // Uniqueness check based on role
        if (role === 'student') {
            const existingId = db.prepare('SELECT id FROM users WHERE student_id = ?').get(student_id);
            if (existingId) return res.status(400).json({ xabar: 'Bu student ID allaqachon mavjud' });
        } else {
            const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
            if (existingEmail) return res.status(400).json({ xabar: 'Bu email allaqachon mavjud' });
        }

        const hash = await bcrypt.hash(password, 12);
        const result = db.prepare(
            'INSERT INTO users (ism, familiya, email, student_id, password_hash, role, sinf) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).run(ism, familiya, email || null, student_id || null, hash, role, sinf || null);

        logAudit(req.user.id, 'CREATE_USER', `Created user: ${role === 'student' ? student_id : email} (${role})`, req.ip);

        const newUser = db.prepare('SELECT id, ism, familiya, email, student_id, role, sinf, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json({ xabar: 'Foydalanuvchi yaratildi', user: newUser });
    } catch (error) {
        console.error('User create xatosi:', error);
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(400).json({ xabar: "Foydalanuvchi (Email yoki ID) allaqachon mavjud" });
        }
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

router.put('/users/:id', auth, rbac('superadmin'), (req, res) => {
    try {
        const { ism, familiya, role, sinf } = req.body;

        // Check target user
        const targetUser = db.prepare('SELECT role FROM users WHERE id = ?').get(req.params.id);
        if (!targetUser) return res.status(404).json({ xabar: 'Foydalanuvchi topilmadi' });

        // O'z rolini o'zgartirishni bloklash
        if (parseInt(req.params.id) === req.user.id && role !== targetUser.role) {
            return res.status(400).json({ xabar: "O'z rolingizni o'zgartira olmaysiz" });
        }

        // Permission check
        if ((targetUser.role === 'admin' || targetUser.role === 'superadmin') && req.user.role !== 'superadmin') {
            return res.status(403).json({ xabar: "Admin/Superadminni faqat Super Admin o'zgartirishi mumkin" });
        }
        if ((role === 'admin' || role === 'superadmin') && req.user.role !== 'superadmin') {
            return res.status(403).json({ xabar: "Adminlik huquqini faqat Super Admin berishi mumkin" });
        }

        // Fix #15: Superadmin soni tekshiruvi (PUT da ham)
        if (role === 'superadmin' && targetUser.role !== 'superadmin') {
            const superAdminCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'superadmin'").get().count;
            if (superAdminCount > 0) {
                return res.status(403).json({ xabar: "Tizimda faqat bitta Super Admin bo'lishi mumkin" });
            }
        }

        db.prepare(
            'UPDATE users SET ism = ?, familiya = ?, role = ?, sinf = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        ).run(ism, familiya, role, sinf, req.params.id);

        logAudit(req.user.id, 'UPDATE_USER', `Updated user ID: ${req.params.id} to role: ${role}`, req.ip);

        const updatedUser = db.prepare('SELECT id, ism, familiya, email, role, sinf FROM users WHERE id = ?').get(req.params.id);
        res.json({ xabar: 'Foydalanuvchi yangilandi', user: updatedUser });
    } catch (error) {
        console.error('User update xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

router.delete('/users/:id', auth, rbac('superadmin'), (req, res) => {
    try {
        if (parseInt(req.params.id) === req.user.id) {
            return res.status(400).json({ xabar: "O'z akkauntingizni o'chira olmaysiz" });
        }

        const targetUser = db.prepare('SELECT role FROM users WHERE id = ?').get(req.params.id);
        if (!targetUser) return res.status(404).json({ xabar: 'Foydalanuvchi topilmadi' });

        // Permission check
        if ((targetUser.role === 'admin' || targetUser.role === 'superadmin') && req.user.role !== 'superadmin') {
            return res.status(403).json({ xabar: "Admin/Superadminni faqat Super Admin o'chira oladi" });
        }

        const result = db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
        if (result.changes === 0) {
            return res.status(404).json({ xabar: 'Foydalanuvchi topilmadi' });
        }

        logAudit(req.user.id, 'DELETE_USER', `Deleted user ID: ${req.params.id}`, req.ip);

        res.json({ xabar: "Foydalanuvchi o'chirildi" });
    } catch (error) {
        console.error('User delete xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

// Audit Logs (Super Admin only)
router.get('/audit', auth, rbac('superadmin'), (req, res) => {
    try {
        const logs = db.prepare(`
            SELECT al.*, u.ism, u.familiya, u.email 
            FROM audit_logs al 
            LEFT JOIN users u ON al.admin_id = u.id 
            ORDER BY al.created_at DESC 
            LIMIT 100
        `).all();
        res.json(logs);
    } catch (error) {
        console.error('Audit logs error:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

// ===== Kitoblar katalogi =====

router.get('/catalog', auth, (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM book_catalog ORDER BY nomi').all();
        res.json(rows);
    } catch (error) {
        console.error('Catalog xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

router.post('/catalog', auth, rbac('superadmin'), validate(catalogSchema), (req, res) => {
    try {
        const { nomi, muallif, janr, sahifalar_soni, tavsif } = req.body;
        const result = db.prepare(
            'INSERT INTO book_catalog (nomi, muallif, janr, sahifalar_soni, tavsif) VALUES (?, ?, ?, ?, ?)'
        ).run(nomi, muallif, janr, sahifalar_soni, tavsif);

        const kitob = db.prepare('SELECT * FROM book_catalog WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json({ xabar: "Kitob katalogga qo'shildi", kitob });
    } catch (error) {
        console.error('Catalog add xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

router.put('/catalog/:id', auth, rbac('superadmin'), (req, res) => {
    try {
        const { nomi, muallif, janr, sahifalar_soni, tavsif } = req.body;
        db.prepare(
            'UPDATE book_catalog SET nomi = ?, muallif = ?, janr = ?, sahifalar_soni = ?, tavsif = ? WHERE id = ?'
        ).run(nomi, muallif, janr, sahifalar_soni, tavsif, req.params.id);

        const kitob = db.prepare('SELECT * FROM book_catalog WHERE id = ?').get(req.params.id);
        if (!kitob) return res.status(404).json({ xabar: 'Kitob topilmadi' });
        res.json({ xabar: 'Kitob yangilandi', kitob });
    } catch (error) {
        console.error('Catalog update xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

router.delete('/catalog/:id', auth, rbac('superadmin'), (req, res) => {
    try {
        const result = db.prepare('DELETE FROM book_catalog WHERE id = ?').run(req.params.id);
        if (result.changes === 0) return res.status(404).json({ xabar: 'Kitob topilmadi' });
        res.json({ xabar: "Kitob o'chirildi" });
    } catch (error) {
        console.error('Catalog delete xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

// ===== O'qituvchi funksiyalari =====

router.put('/summaries/:id/approve', auth, rbac('teacher'), (req, res) => {
    try {
        const result = db.prepare(
            'UPDATE reading_logs SET xulosa_tasdiqlangan = 1, tasdiqlagan_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        ).run(req.user.id, req.params.id);

        if (result.changes === 0) return res.status(404).json({ xabar: 'Xulosa topilmadi' });

        const kitob = db.prepare('SELECT * FROM reading_logs WHERE id = ?').get(req.params.id);

        // Gamification: XP + badge + notification
        if (kitob) {
            addXP(kitob.user_id, XP_AMOUNTS.SUMMARY_APPROVED);
            checkBadges(kitob.user_id);
            db.prepare(
                'INSERT INTO notifications (user_id, turi, xabar) VALUES (?, ?, ?)'
            ).run(kitob.user_id, 'approval', `✅ "${kitob.kitob_nomi}" xulosangiz tasdiqlandi!`);
        }

        res.json({ xabar: 'Xulosa tasdiqlandi', kitob });
    } catch (error) {
        console.error('Approve xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

router.get('/summaries/pending', auth, rbac('teacher'), (req, res) => {
    try {
        const rows = db.prepare(
            `SELECT rl.*, u.ism, u.familiya, u.sinf
       FROM reading_logs rl
       JOIN users u ON rl.user_id = u.id
       WHERE rl.xulosa_tasdiqlangan = 0
       ORDER BY rl.created_at DESC`
        ).all();
        res.json(rows);
    } catch (error) {
        console.error('Pending summaries xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

router.get('/classes', auth, rbac('teacher'), (req, res) => {
    try {
        const rows = db.prepare(
            "SELECT DISTINCT sinf FROM users WHERE sinf IS NOT NULL AND sinf != '' ORDER BY sinf"
        ).all();
        res.json(rows.map(r => r.sinf));
    } catch (error) {
        console.error('Classes xatosi:', error);
        res.status(500).json({ xabar: 'Server xatosi' });
    }
});

// ===== System & Tools =====

router.post('/broadcast', auth, rbac('superadmin'), (req, res) => {
    try {
        const { message, target, classId } = req.body;

        let users = [];
        if (target === 'all') {
            users = db.prepare("SELECT id FROM users WHERE role NOT IN ('admin', 'superadmin')").all();
        } else if (target === 'students') {
            users = db.prepare("SELECT id FROM users WHERE role = 'student'").all();
        } else if (target === 'teachers') {
            users = db.prepare("SELECT id FROM users WHERE role = 'teacher'").all();
        } else if (target === 'class' && classId) {
            users = db.prepare("SELECT id FROM users WHERE sinf = ?").all(classId);
        }

        if (users.length === 0) return res.json({ xabar: "Foydalanuvchilar topilmadi" });

        const stmt = db.prepare('INSERT INTO notifications (user_id, turi, xabar, oqilgan) VALUES (?, ?, ?, 0)');
        const insertMany = db.transaction((userList) => {
            for (const user of userList) {
                stmt.run(user.id, 'broadcast', message);
            }
        });
        insertMany(users);

        logAudit(req.user.id, 'BROADCAST_MSG', `Sent broadcast to ${target} (${users.length} users)`, req.ip);
        res.json({ xabar: `${users.length} ta foydalanuvchiga xabar yuborildi` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ xabar: "Xabar yuborishda xato" });
    }
});

router.post('/cleanup', auth, rbac('superadmin'), (req, res) => {
    try {
        const logRes = db.prepare("DELETE FROM audit_logs WHERE created_at < date('now', '-30 days')").run();
        const notifRes = db.prepare("DELETE FROM notifications WHERE created_at < date('now', '-30 days')").run();

        logAudit(req.user.id, 'SYSTEM_CLEANUP', `Deleted ${logRes.changes} logs, ${notifRes.changes} notifs`, req.ip);
        res.json({ xabar: `Tizim tozalandi: ${logRes.changes} ta audit log va ${notifRes.changes} ta bildirishnoma o'chirildi` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ xabar: "Tozalashda xato" });
    }
});

router.get('/export', auth, rbac('superadmin'), (req, res) => {
    try {
        const users = db.prepare("SELECT ism, familiya, email, student_id, role, sinf, created_at FROM users").all();
        const escapeCsv = (val) => {
            if (val == null) return '';
            const str = String(val);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return '"' + str.replace(/"/g, '""') + '"';
            }
            return str;
        };
        const header = "Ism,Familiya,Email,Student_ID,Rol,Sinf,Yaratilgan\n";
        const rows = users.map(u =>
            [u.ism, u.familiya, u.email, u.student_id, u.role, u.sinf, u.created_at]
                .map(escapeCsv).join(',')
        ).join("\n");
        const csv = header + rows;

        res.header('Content-Type', 'text/csv; charset=utf-8');
        res.attachment('users_export.csv');
        res.send(csv);
    } catch (err) {
        console.error(err);
        res.status(500).json({ xabar: "Eksport xatosi" });
    }
});

// ===== Gamification & Deep Analytics =====

router.post('/gamification/award', auth, rbac('superadmin'), (req, res) => {
    try {
        const { userId, amount, reason } = req.body;

        // Add XP (and Coins logic could be inside addXP)
        addXP(userId, parseInt(amount));

        // Notification
        db.prepare('INSERT INTO notifications (user_id, turi, xabar) VALUES (?, ?, ?)').run(
            userId, 'reward', `🎉 Sizga ${reason} uchun ${amount} XP berildi!`
        );

        logAudit(req.user.id, 'GIVE_REWARD', `Gave ${amount} XP to User ${userId}. Reason: ${reason}`, req.ip);
        res.json({ xabar: "Mukofot berildi" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ xabar: "Xatolik" });
    }
});

router.get('/stats/deep', auth, rbac('superadmin'), (req, res) => {
    try {
        // Genre Trends — Fix #2 + #21: kitob_nomi orqali book_catalog ga ulanish
        const genres = db.prepare(`
            SELECT b.janr, COUNT(rl.id) as value
            FROM reading_logs rl 
            JOIN book_catalog b ON rl.kitob_nomi = b.nomi 
            WHERE b.janr IS NOT NULL AND b.janr != ''
            GROUP BY b.janr 
            ORDER BY value DESC
            LIMIT 5
        `).all();

        // Weekly Winner — Fix #2: oqilgan_sana ishlatish
        const winner = db.prepare(`
            SELECT u.id, u.ism, u.familiya, u.sinf, COUNT(rl.id) as kitob_soni
            FROM reading_logs rl 
            JOIN users u ON rl.user_id = u.id 
            WHERE rl.oqilgan_sana >= date('now', '-7 days') 
            GROUP BY u.id 
            ORDER BY kitob_soni DESC 
            LIMIT 1
        `).get();

        res.json({ genres, winner });
    } catch (err) {
        console.error('Deep stats error:', err);
        res.status(500).json({ xabar: "Statistika xatosi" });
    }
});

router.post('/gamification/announce-winner', auth, rbac('superadmin'), (req, res) => {
    try {
        const { winnerId, ism, kitobSoni } = req.body;

        // Broadcast to all
        const message = `🏆 Hafta kitobxoni: ${ism}! (${kitobSoni} ta kitob). Tabriklaymiz!`;

        const users = db.prepare("SELECT id FROM users WHERE role NOT IN ('admin', 'superadmin')").all();
        const stmt = db.prepare('INSERT INTO notifications (user_id, turi, xabar, oqilgan) VALUES (?, ?, ?, 0)');

        const insertMany = db.transaction((userList) => {
            for (const user of userList) {
                stmt.run(user.id, 'broadcast', message);
            }
        });
        insertMany(users);

        // Give Bonus to Winner
        addXP(winnerId, 100); // 100 XP bonus

        logAudit(req.user.id, 'ANNOUNCE_WINNER', `Announced winner: ${ism}`, req.ip);
        res.json({ xabar: "G'olib e'lon qilindi va mukofotlandi!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ xabar: "Xatolik" });
    }
});

// ===== System Settings =====

const path = require('path');

// ===== New Settings: Backup, Import, Global Config =====

// 1. Settings (XP Config & General)
router.get('/settings', auth, rbac('superadmin'), (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM system_settings').all();
        const settings = rows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});
        res.json(settings);
    } catch (err) {
        res.status(500).json({ xabar: "Xato" });
    }
});

router.post('/settings/xp', auth, rbac('superadmin'), (req, res) => {
    try {
        const { xp_per_page, xp_per_book } = req.body;
        const upsert = db.prepare('INSERT OR REPLACE INTO system_settings (key, value) VALUES (?, ?)');

        if (xp_per_page) upsert.run('xp_per_page', String(xp_per_page));
        if (xp_per_book) upsert.run('xp_per_book', String(xp_per_book));

        logAudit(req.user.id, 'UPDATE_XP_CONFIG', `Updated XP settings: Page=${xp_per_page}, Book=${xp_per_book}`, req.ip);
        res.json({ xabar: "Gamification sozlamalari yangilandi" });
    } catch (err) {
        res.status(500).json({ xabar: "Saqlashda xato" });
    }
});

// 2. Backup Database
router.get('/backup', auth, rbac('superadmin'), (req, res) => {
    try {
        // Fix #4: to'g'ri fayl nomi — kitobxon.db
        const dbPath = path.resolve(__dirname, '../../kitobxon.db');
        logAudit(req.user.id, 'DOWNLOAD_BACKUP', 'Downloaded database backup', req.ip);
        res.download(dbPath, `kitobxon_backup_${new Date().toISOString().slice(0, 10)}.db`);
    } catch (err) {
        console.error(err);
        res.status(500).json({ xabar: "Backup olishda xato" });
    }
});

// 3. Import Users (CSV)
// Fix #5: Import users — student_id bilan import qilish
router.post('/import-users', auth, rbac('superadmin'), async (req, res) => {
    try {
        const { csvData } = req.body; // "ism,familiya,student_id,sinf\n..."
        if (!csvData) return res.status(400).json({ xabar: "CSV ma'lumot yo'q" });

        const lines = csvData.trim().split('\n');
        let addedCount = 0;
        let skippedCount = 0;
        const errors = [];

        const insertStudent = db.prepare("INSERT INTO users (ism, familiya, student_id, password_hash, role, sinf) VALUES (?, ?, ?, ?, 'student', ?)");
        const checkStudentId = db.prepare("SELECT id FROM users WHERE student_id = ?");

        // Default password hash for imported users (e.g. '123456')
        const defaultHash = await bcrypt.hash('123456', 10);

        const transaction = db.transaction((rows) => {
            for (const row of rows) {
                const parts = row.split(',');
                if (parts.length < 3) continue;

                const [ism, familiya, student_id, sinf] = parts.map(s => s.trim());
                if (!student_id || !/^[A-Z]{2}\d{4}$/.test(student_id)) {
                    skippedCount++;
                    continue;
                }

                if (checkStudentId.get(student_id)) {
                    skippedCount++;
                    continue;
                }

                insertStudent.run(ism, familiya, student_id, defaultHash, sinf || null);
                addedCount++;
            }
        });

        transaction(lines);

        logAudit(req.user.id, 'IMPORT_USERS', `Imported ${addedCount} users, Skipped ${skippedCount}`, req.ip);
        res.json({ xabar: `${addedCount} ta o'quvchi qo'shildi (${skippedCount} ta o'tkazib yuborildi)` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ xabar: "Import xatosi" });
    }
});

module.exports = router;
