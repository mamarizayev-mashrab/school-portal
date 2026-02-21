# 📄 Kitobxon — To'liq Texnik Hujjatlar (Full Technical Documentation)

Ushbu hujjat "Kitobxon" platformasining arxitekturasi, ma'lumotlar bazasi sxemasi, mantiqiy jarayonlari va xavfsizlik protokollari haqida batafsil ma'lumot beradi.

---

## 1. Umumiy Tavsif (Overview)
**Kitobxon** — maktab o'quvchilarining mustaqil mutolaa faolligini oshirishga qaratilgan gamifikatsiyalashgan platforma. Tizim o'quvchilarga o'qigan kitoblarini qayd etish, xulosa yozish va bilimlarini test orqali tekshirish imkonini beradi. O'qituvchilar va adminlar jarayonni to'liq nazorat qilishlari mumkin.

---

## 2. Texnologiyalar Steki (Tech Stack)

### Frontend
- **Framework:** React 18 (Vite)
- **Styling:** TailwindCSS (Vercel uslubidagi Dark UI)
- **State Management:** React Context API
- **Charts:** Recharts (Analitika uchun)
- **Icons:** Lucide React
- **Notifications:** React Hot Toast

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** SQLite (better-sqlite3) — WAL (Write-Ahead Logging) rejimi bilan.
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Joi (Schema-based validation)
- **Security:** Bcryptjs (Parol hashlash)

---

## 3. Ma'lumotlar Bazasi Sxemasi (Database Schema)

Baza fayli: `backend/kitobxon.db` (Yoki PostgreSQL DATABASE_URL orqali).

### 3.1. Foydalanuvchilar (`users`)
| Maydon | Turi | Tavsif |
| :--- | :--- | :--- |
| `id` | PK / SERIAL | Unikal identifikator |
| `ism`, `familiya` | TEXT | Foydalanuvchi ma'lumotlari |
| `email` | TEXT (Unique) | Login (O'qituvchi/Admin uchun) |
| `student_id` | TEXT (Unique) | Login (O'quvchi uchun, masalan: AN1441) |
| `role` | TEXT | `student`, `teacher`, `admin`, `superadmin` |
| `xp` | INTEGER | To'plangan ballar |
| `streak_count` | INTEGER | Ketma-ket kirishlar soni |
| `level` | TEXT | Hozirgi darajasi (Yangi, Bilimdon, va h.k.) |

### 3.2. O'qish Jurnali (`reading_logs`)
| Maydon | Turi | Tavsif |
| :--- | :--- | :--- |
| `id` | PK | Log ID |
| `user_id` | FK (`users`) | Foydalanuvchi bog'lanishi |
| `kitob_nomi` | TEXT | Kitob nomi |
| `xulosa` | TEXT | O'quvchi yozgan xulosa (min 100 so'z) |
| `xulosa_tasdiqlangan` | BOOLEAN | O'qituvchi tomonidan status |

### 3.3. Boshqa Jadvallar
- **`badges`**: O'quvchilar qo'lga kiritgan nishonlar.
- **`notifications`**: Tizim bildirishnomalari (Broadcast yoki shaxsiy).
- **`system_settings`**: Dinamik XP ballari va ro'yxatdan o'tish sozlamalari.
- **`audit_logs`**: Adminlarning barcha harakatlari (o'chirish, tahrirlash) tarixi.
- **`library_books`**: Yuklab olish uchun elektron kitoblar (BLOB/Binary).

---

## 4. Gamifikatsiya Mantig'i (Gamification Logic)

Tizimda ballar (`XP`) quyidagi harakatlar uchun beriladi:
1. **Kitob qo'shish:** 10 XP (sozlamalardan o'zgartirish mumkin).
2. **Testni yakunlash:** 15 XP.
3. **100% natija (Perfect Test):** +30 XP bonus.
4. **Xulosaning tasdiqlanishi:** 20 XP.
5. **Daily Streak:** Har kuni kirganlik uchun 5 XP.
6. **Nishon olish:** 25 XP bonus.

### Nishonlar (Badges):
- **Birinchi qadam**: 1-kitob qo'shilganda.
- **Kitob qurchi**: 5 ta kitob o'qilganda.
- **A'lochi**: Testdan 100 ball olganda.
- **Haftalik streak**: Ketma-ket 7 kun faollik uchun.

---

## 5. Rollar va Ruxsatlar (RBAC)

### 👑 Super Admin (Master Key)
- Tizimning to'liq sozlamalari (`system_settings`).
- Ma'lumotlar bazasini snapshot qilish (Backup).
- Audit loglarini (adminlar nima qilganini) ko'rish.
- Ommaviy foydalanuvchilarni CSV orqali import qilish.
- **Muhim:** Super Admin o'z rolini o'zgartira olmaydi va o'zini o'chira olmaydi.

### 👨‍🏫 O'qituvchi (Teacher)
- O'z sinfidagi o'quvchilar statistikasini ko'rish.
- O'quvchilar xulosalarini tekshirish va tasdiqlash.
- Sinf reytinggini kuzatish.

### 🎓 O'quvchi (Student)
- Kitoblar qo'shish, o'z kutubxonasini boshqarish.
- O'qish rejasi (Reading Plan) tuzish.
- Testlar topshirish va natijalarga qarab XP olish.
- Leaderboard da o'z o'rnini ko'rish.

---

## 6. Xavfsizlik Modeli (Security)

1. **Authentication:** Barcha so'rovlar JWT token orqali himoyalangan. Tokenlar 7 kun amal qiladi.
2. **Authorization:** Middleware (rbac.js) har bir so'rovda foydalanuvchi rolini tekshiradi.
3. **Input Validation:** Joi kutubxonasi yordamida har bir kiruvchi ma'lumot (Req Body) validatsiyadan o'tadi.
4. **CORS:** Faqat ruxsat etilgan domenlardan (localhost:5173, localhost:3000) so'rovlar qabul qilinadi.
5. **Sensitive Data:** Parollar Bcrypt (salt round: 12) bilan hashlangan holda saqlanadi.

---

## 7. API Dokumentatsiyasi (Asosiy Endpointlar)

### 🔐 Auth
- `POST /api/auth/login` — Login (Email yoki Student ID).
- `POST /api/auth/register` — Ro'yxatdan o'tish (Faqat `registration_open` true bo'lsa).
- `GET /api/auth/me` — Hozirgi foydalanuvchi ma'lumotlari.

### 📚 Books & Logs
- `GET /api/books` — O'qilgan kitoblar ro'yxati.
- `POST /api/books` — Yangi o'qilgan kitob/xulosa qo'shish.
- `PUT /api/books/:id` — Tahrirlash.

### 👮 Admin Tools
- `GET /api/admin/backup` — `.db` faylini yuklab olish.
- `POST /api/admin/import-users` — CSV orqali user yaratish.
- `GET /api/admin/audit-logs` — Tizimdagi o'zgarishlar tarixi.
- `POST /api/admin/broadcast` — Hammaga bildirishnoma yuborish.

---

## 8. Startup Readiness (Muammolar va Yechimlar)

Hujjat bo'yicha aniqlangan **Kritik Muammolar** va ularni bartaraf etish rejasidan ko'chirma:
1. **JWT_SECRET:** Kelajakda `.env` fayldan dinamik generatsiya qilinadi.
2. **Rate Limiting:** Login sahifasiga brute-force dan himoya qo'shish kerak.
3. **Database:** Kelajakda SQLite dan PostgreSQL ga o'tish tavsiya qilinadi (Massiv foydalanish uchun).

---

## 9. O'rnatish Yo'riqnomasi (Setup)

### Backend
1. `cd backend`
2. `npm install`
3. `npm run seed` (Baza va SuperAdmin yaratish)
4. `npm run dev` (Port: 5000)

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev` (Port: 5173)

---
*Tayyorladi: **Antigravity AI** (Mashrab so'rovi bilan)*
*Sana: 2026-02-20*
