# 📚 Kitobxon — O'quvchilar Kitob Kuzatuvi Tizimi

> Maktab o'quvchilarining kitob o'qish faolligini kuzatish, gamification orqali rag'batlantirish va o'qituvchilar nazorati uchun zamonaviy veb-ilova.

---

## 🏗 Texnologiyalar

| Qism | Texnologiyalar |
|---|---|
| **Backend** | Node.js, Express.js, SQLite (better-sqlite3), JWT, bcryptjs, Joi |
| **Frontend** | React 18, Vite, React Router, Axios, Recharts, Tailwind CSS, Lucide React |
| **DB** | SQLite (kitobxon.db) — WAL rejimi |
| **Security** | JWT + bcrypt + RBAC (role-based access control) |

---

## 🚀 Ishga tushirish

```bash
# Backend
cd backend
npm install
npm run seed      # Boshlang'ich ma'lumotlarni kiritish
npm run dev       # Development server (port 5000)

# Frontend
cd frontend
npm install
npm run dev       # Vite dev server (port 5173)
```

### Boshlang'ich kirim ma'lumotlari:

| Rol | Login | Parol |
|---|---|---|
| � Super Admin | `super@admin.uz` | `super123` |
| � O'qituvchi | `teacher@kitobxon.uz` | `teacher123` |
| � O'quvchi | `AN1441` | `student123` |
| � O'quvchi | `BM1483` | `student123` |

---

## 📋 Rollar va huquqlar

| Funksiya | O'quvchi | O'qituvchi | Super Admin |
|---|:---:|:---:|:---:|
| Kitob qo'shish | ✅ | ❌ | ❌ |
| Xulosa yozish | ✅ | ❌ | ❌ |
| Test ishlash | ✅ | ❌ | ❌ |
| O'qish rejasi | ✅ | ❌ | ❌ |
| Reyting jadvali | ✅ | ❌ | ❌ |
| Nishonlar va XP | ✅ | ❌ | ❌ |
| Bildirishnoma olish | ✅ | ✅ | ❌ |
| Profil tahrirlash | ✅ | ✅ | ❌ |
| Xulosa tasdiqlash | ❌ | ✅ | ✅ (master key) |
| Sinf statistikasi | ❌ | ✅ | ✅ |
| Foydalanuvchilar boshqaruv | ❌ | ❌ | ✅ |
| Kitob katalogi | ❌ | ❌ | ✅ |
| Ommaviy xabar yuborish | ❌ | ❌ | ✅ |
| G'olib e'lon qilish | ❌ | ❌ | ✅ |
| XP mukofot berish | ❌ | ❌ | ✅ |
| Audit Log | ❌ | ❌ | ✅ |
| Tizim sozlamalari | ❌ | ❌ | ✅ |
| DB Backup | ❌ | ❌ | ✅ |
| CSV Import | ❌ | ❌ | ✅ |

---

## 🏛 Loyiha Arxitekturasi

```
School/
├── backend/
│   ├── src/
│   │   ├── config/       # DB ulanishi va migratsiya
│   │   ├── middleware/    # auth.js, rbac.js
│   │   ├── routes/        # auth, books, stats, admin, quizzes, notifications, profile, plans, gamification
│   │   ├── utils/         # aiQuiz, aiRating, aiRecommend, audit, gamification
│   │   ├── validation/    # Joi schemas
│   │   └── server.js      # Express server
│   ├── seed.js            # Boshlang'ich ma'lumotlar
│   └── kitobxon.db        # SQLite baza
├── frontend/
│   ├── src/
│   │   ├── api/           # Axios konfiguratsiya
│   │   ├── components/    # Layout, Sidebar
│   │   ├── context/       # AuthContext
│   │   └── pages/
│   │       ├── admin/     # Dashboard, ManageUsers, ManageBooks, AuditLogs, Settings
│   │       ├── student/   # Dashboard, AddBook, MyBooks, Quiz, Leaderboard, Badges, Notifications, Profile, ReadingPlan
│   │       └── teacher/   # Dashboard, ClassStats, ReviewSummaries
│   └── vite.config.js
└── README.md
```

---

## 🔒 Xavfsizlik modeli

- **JWT Token** — 7 kunlik, cookie yoki header orqali
- **Bcrypt** — salt round: 12
- **RBAC middleware** — rolga asoslangan ruxsat. Super Admin "master key"
- **Input Validation** — Joi bilan barcha request body validatsiyalanadi
- **CORS** — Allowlist (localhost:5173, localhost:3000, 127.0.0.1:5173)
- **Foreign Keys** — ON DELETE CASCADE himoyalangan
- **Audit Log** — Barcha admin harakatlari qayd qilinadi

---

# � STARTUP READINESS HISOBOTI

**Tekshiruv sanasi:** 2026-02-18

## ✅ KUCHLI TOMONLAR (Ishlayotgan funksiyalar)

### 1. To'liq Role-Based Access Control
- 3 ta rol: `student`, `teacher`, `superadmin`
- Super Admin = master key (barcha yo'llarga kira oladi)
- Super Admin faqat 1 ta bo'lishi mumkin (uniqueness check)
- O'z rolini o'zgartira olmaydi (self-role change bloklangan)
- O'z akkauntini o'chira olmaydi

### 2. Gamification tizimi
- XP, Level, Nishonlar (Badges), Streak
- Avtomatik badge tekshiruvi
- Admin tomonidan manual mukofot berish
- Hafta kitobxoni tizimi

### 3. Bildirishnomalar
- Broadcast (ommaviy xabar)
- Tasdiqlash xabarlari
- Test natijalari xabarlari
- Aniq vaqt formati (Bugun/Kecha/sana)

### 4. Ma'lumotlar bazasi
- SQLite WAL rejimida — tez va barqaror
- 11 ta jadval — to'liq normalized
- Foreign keys + CASCADE o'chirish
- System settings jadvali

### 5. Frontend
- Professional dark theme (Vercel stilida)
- Recharts bilan interaktiv grafiklar
- Responsive dizayn
- Shimmer loading effektlari
- Toast bildirishnomalari

### 6. Admin panel
- Analitika dashboard
- Foydalanuvchilarni CRUD
- Kitob katalogi boshqaruvi
- XP sozlamalari
- Backup/Export
- CSV orqali import
- Audit log

---

## 🔴 KRITIK MUAMMOLAR (Startup uchun tuzatish shart)

### 1. ⚠️ JWT_SECRET `.env` faylda hardcoded
**Muammo:** `.env` da `JWT_SECRET=k1t0bx0n_pr0d_s3cur3_k3y_2026!@#$z9w` — bu production uchun xavfli.
**Tavsiya:**
- `crypto.randomBytes(64).toString('hex')` bilan yangi secret yaratish
- Har bir muhitda (dev/staging/prod) alohida secret ishlatish

### 2. ⚠️ Debug fayllari production da qolgan
**Muammo:** `debug_auth.js`, `migrate_audit.js`, `migrate_settings.js`, `migrate_superadmin.js` — bular development vositasi, productiondan olib tashlash kerak.
**Tavsiya:** `.gitignore`ga qo'shish yoki o'chirish.

### 3. ⚠️ Rate Limiting yo'q
**Muammo:** Login yoki register endpointida rate limit yo'q. Brute-force hujumga ochiq.
**Tavsiya:**
```bash
npm install express-rate-limit
```
```js
const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { xabar: "Juda ko'p urinishlar. 15 daqiqa kuting." } });
app.use('/api/auth/login', loginLimiter);
```

### 4. ⚠️ Helmet (HTTP Headers Security) yo'q
**Muammo:** XSS, clickjacking, MIME sniffing va boshqa headerlardan himoya yo'q.
**Tavsiya:**
```bash
npm install helmet
```
```js
const helmet = require('helmet');
app.use(helmet());
```

### 5. ⚠️ `announce-winner` Super Admin ga ham notification jo'natadi
**Muammo:** `admin.js` 417-qator — `SELECT id FROM users` (hammasiga), `WHERE role != 'superadmin'` filtri yo'q. Super Admin o'ziga ham xabar yuboradi.
**Tavsiya:** `WHERE role != 'superadmin'` qo'shish.

### 6. ⚠️ `debug_auth.js` — noto'g'ri API request
**Muammo:** 34-qatorda `email` maydoni yuboriladi, lekin backend `identifier` kutadi. Bu fayl noto'g'ri va productiondan o'chirilishi kerak.

---

## 🟡 O'RTA DARAJALI MUAMMOLAR (Yaxshilash tavsiya etiladi)

### 7. Test (Unit/Integration) umuman yo'q
**Tavsiya:** Jest + Supertest bilan backend API testlari yozish. Eng muhim: auth, RBAC, books CRUD.

### 8. Error logging tizimi yo'q
**Muammo:** Faqat `console.error()` ishlatilgan. Production uchun yetarli emas.
**Tavsiya:** Winston yoki Pino loggerdan foydalanish.

### 9. Parol kuchliligi tekshiruvi yo'q
**Muammo:** Faqat `min(6)` tekshiriladi. `123456` — yaroqli parol.
**Tavsiya:** Kattaharf + kichik harf + raqam enforce qilish.

### 10. Database migratsiya tizimi yo'q
**Muammo:** `migrate.sql` `DROP TABLE IF EXISTS users` bilan boshlanadi — barcha ma'lumotlarni o'chiradi! Production uchun juda xavfli.
**Tavsiya:** `knex` yoki `umzug` migratsiya tizimini joriy etish.

### 11. Input sanitization yo'q
**Muammo:** Joi faqat tipni tekshiradi, ammo XSS hujum uchun HTML/JS taglarni tozalamaydi.
**Tavsiya:** `DOMPurify` yoki `sanitize-html` qo'shish.

### 12. API versioning yo'q
**Muammo:** `/api/auth/login` — versiya yo'q. Kelajakda incompatible o'zgarishlar qiyinlashadi.
**Tavsiya:** `/api/v1/auth/login` formatga o'tish.

### 13. Pagination yo'q
**Muammo:** `/admin/users`, `/books`, `/notifications` — barcha ma'lumotlar bir vaqtda qaytadi. 1000+ yozuvda sekinlashadi.
**Tavsiya:** `LIMIT ? OFFSET ?` va frontend pagination qo'shish.

### 14. Frontend error boundary yo'q
**Muammo:** Agar React componentda xato bo'lsa, butun ilova crash bo'ladi.
**Tavsiya:** `ErrorBoundary` component qo'shish.

---

## 🟢 KICHIK TAVSIYALAR (Nice to have)

### 15. `.env` da `NODE_ENV=development` — production uchun o'zgartirish kerak
### 16. `package.json` da `author` bo'sh — to'ldirish kerak
### 17. Frontend `<title>` tag statik — sahifaga qarab o'zgarmaydi
### 18. PWA (Progressive Web App) qo'llash — offline ishlash uchun
### 19. Multilingual (i18n) support — hozir faqat o'zbekcha
### 20. Dark/Light theme toggle — hozir faqat dark
### 21. Password reset / "Parolni unutdim" funksiyasi yo'q
### 22. O'qituvchi uchun xulosa tasdiqlash vaqtida izoh qoldirish (comment) imkoniyati yo'q

---

## 📊 UMUMIY BAL

| Kategoriya | Baho (10 dan) | Izoh |
|---|:---:|---|
| **Funksionallik** | 9/10 | Barcha asosiy funksiyalar to'liq ishlaydi |
| **Xavfsizlik** | 6/10 | JWT + bcrypt yaxshi, lekin rate limit, helmet, sanitization yo'q |
| **Kod sifati** | 7/10 | Toza tuzilma, lekin testlar va error handling yetishmaydi |
| **UI/UX** | 8/10 | Professional dark theme, responsive, animatsiyalar bor |
| **Deployment readiness** | 5/10 | SQLite prod uchun cheklangan, .env hardcoded, test yo'q |
| **Scalability** | 5/10 | SQLite + pagination yo'q = katta hajmda muammo |

### 📌 Umumiy: **6.7 / 10** — MVP uchun yaxshi, Startup uchun qo'shimcha ish kerak

---

## 🎯 Startup uchun birinchi 5 ta qadam

1. **`helmet` + `rate-limit` o'rnatish** (30 daqiqa) — xavfsizlik
2. **Test yozish** (2-3 soat) — auth va CRUD testlari
3. **Pagination qo'shish** (1 soat) — performance
4. **PostgreSQL ga o'tish** (2-3 soat) — production DB
5. **Docker + CI/CD** (2-3 soat) — deployment

---

## � Litsenziya

ISC

---

*Kitobxon — O'qish kuzatuvi tizimi © 2026*
