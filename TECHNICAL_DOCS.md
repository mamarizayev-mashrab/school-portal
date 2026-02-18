# 📘 Kitobxon — Texnik Hujjatlar (Technical Documentation)

Ushbu hujjat "Kitobxon" loyihasining to'liq texnik tuzilishi, ma'lumotlar bazasi sxemasi, API endpointlari va xavfsizlik protokollarini o'z ichiga oladi.

---

## 🏗️ 1. Tizim Arxitekturasi

Loyiha **Client-Server** arxitekturasida qurilgan:

*   **Frontend (SPA):** React.js (Vite) — Foydalanuvchi interfeysi. Barcha ma'lumotlar API orqali olinadi. Davlat boshqaruvi (State Management) uchun `Context API` ishlatilgan.
*   **Backend (REST API):** Node.js (Express) — Biznes logika va ma'lumotlarni qayta ishlash.
*   **Database:** SQLite (better-sqlite3) — Yengil va tezkor relyatsion ma'lumotlar bazasi. Fayl ko'rinishida (`kitobxon.db`) saqlanadi.

### Texnologiyalar Steki
| Qism | Texnologiya | Versiya | Izoh |
|------|-------------|---------|------|
| **Core** | Node.js | v18+ | JavaScript Runtime |
| **Backend** | Express.js | v4.21 | Web Framework |
| **Database** | SQLite3 | v12.6 | Serverless SQL DB |
| **Auth** | JWT + bcrypt | v9.0 | Token-based Auth |
| **Validation** | Joi | v17.13 | Input Validation |
| **Frontend** | React | v18.3 | UI Library |
| **Styling** | TailwindCSS | v3.4 | Utility-first CSS |
| **Charts** | Recharts | v2.15 | Data Visualization |

---

## 🗄️ 2. Ma'lumotlar Bazasi Sxemasi (Schema)

Ma'lumotlar bazasi fayli: `backend/kitobxon.db`.
Asosiy jadvallar va ularning tuzilishi:

### 2.1. `users` (Foydalanuvchilar)
Tizimdagi barcha rollar (o'quvchi, o'qituvchi, admin) shu jadvalda saqlanadi.

| Ustun | Turi | Izoh |
|-------|------|------|
| `id` | INTEGER PK | Avtomatik ID |
| `ism` | TEXT | Foydalanuvchi ismi |
| `familiya` | TEXT | Familiyasi |
| `email` | TEXT UNIQUE | Login uchun (takrorlanmas) |
| `password_hash` | TEXT | bcrypt bilan hashlangan parol |
| `role` | TEXT | `student`, `teacher`, `admin`, `superadmin` |
| `sinf` | TEXT | Masalan: '7-A' (faqat o'quvchilar uchun) |
| `xp` | INTEGER | To'plangan ball (Gamification) |
| `streak_count` | INTEGER | Ketma-ket kirishlar soni |

### 2.2. `system_settings` (Tizim Sozlamalari)
Dinamik sozlamalar uchun "Key-Value" jadvali. Admin panelidan boshqariladi.

| Key (Kalit) | Value (Qiymat) | Izoh |
|-------------|----------------|------|
| `xp_per_page` | "1" | Bir sahifa uchun beriladigan ball |
| `xp_per_book` | "50" | Kitob tugatganda bonus ball |
| `registration_open` | "true/false" | Ro'yxatdan o'tishni yopish/ochish |
| `theme_color` | "blue" | Saytning asosiy rangi |

### 2.3. `reading_logs` (O'qish Tarixi)
O'quvchilar o'qigan kitoblari haqidagi ma'lumotlar.

| Ustun | Turi | Izoh |
|-------|------|------|
| `id` | INTEGER PK | Log ID |
| `user_id` | FK (`users`) | Kim o'qidi? |
| `kitob_nomi` | TEXT | Kitob nomi |
| `sahifalar_soni` | INTEGER | O'qilgan sahifa |
| `xulosa` | TEXT | O'quvchi yozgan xulosa (min 100 so'z) |
| `xulosa_tasdiqlangan` | BOOLEAN | O'qituvchi tasdiqladimi? (0/1) |

---

## 🔐 3. Xavfsizlik va Ruxsatlar (RBAC)

Tizimda 4 xil darajadagi ruxsatlar mavjud:

1.  **Student (O'quvchi):**
    *   Faqat o'z ma'lumotlarini ko'ra oladi.
    *   Kitob qo'shish, test ishlash huquqiga ega.
2.  **Teacher (O'qituvchi):**
    *   O'z sinfidagi o'quvchilar statistikasini ko'radi.
    *   Xulosalarni tasdiqlaydi/rad etadi.
3.  **Admin (Ma'mur):**
    *   Foydalanuvchilarni boshqaradi (CRUD).
    *   Kitoblar katalogini to'ldiradi.
4.  **Super Admin (Boshqaruvchi):**
    *   **To'liq nazorat (Master Key).**
    *   `system_settings` ni o'zgartirish.
    *   Ma'lumotlar bazasini yuklab olish (Backup).
    *   Ommaviy import qilish (CSV).
    *   Audit loglarni ko'rish.

**Middleware:** `backend/src/middleware/rbac.js` fayli har bir so'rovda foydalanuvchi rolini tekshiradi.

---

## 📡 4. Asosiy API Endpointlar

### Autentifikatsiya (`/api/auth`)
*   `POST /register` — Yangi o'quvchi ro'yxatdan o'tishi.
*   `POST /login` — Tizimga kirish (JWT token qaytaradi).
*   `GET /me` — Foydalanuvchi profilini olish.

### Admin Panel (`/api/admin`) - *Faqat `superadmin` talab qiladi*
*   `GET /backup` — `kitobxon.db` faylini yuklab olish oqimi (Stream).
*   `POST /import-users` — CSV matnidan ommaviy user yaratish.
    *   *Format:* `Ism,Familiya,Email,Sinf`
    *   *Parol:* Avtomatik `123456` qo'yiladi.
*   `GET /settings` — Tizim sozlamalarini olish.
*   `POST /settings/xp` — Gamification ballarini o'zgartirish.
*   `POST /broadcast` — Barcha foydalanuvchilarga xabar yuborish.

---

## 🚀 5. O'rnatish va Ishga Tushirish

### Talablar
*   Node.js (v18 yoki yuqori)
*   npm (paket menejeri)

### Qadamlar

1.  **Backendni sozlash:**
    ```bash
    cd backend
    npm install
    # .env faylini yarating va JWT_SECRET yozing
    npm run seed   # Bazani yaratish va Super Admin qo'shish
    npm run dev    # Serverni yoqish (Port: 5000)
    ```

2.  **Frontendni sozlash:**
    ```bash
    cd frontend
    npm install
    npm run dev    # Interfeysni yoqish (Port: 5173)
    ```

### Kirish Ma'lumotlari (Default)

| Rol | Email | Parol |
|-----|-------|-------|
| 👑 **Super Admin** | `super@admin.uz` | `super123` |
| 👨‍💼 **Admin** | `admin@kitobxon.uz` | `admin123` |
| 👨‍🎓 **Student** | `alisher@kitobxon.uz` | `student123` |

---

## ✨ 6. Yangi Qo'shilgan Imkoniyatlar

### 💾 Database Backup
Super admin istalgan vaqtda bazani "Snapshot" qilib yuklab olishi mumkin. Bu fayl `sqlite3` formatida bo'lib, uni istalgan joyda tiklash mumkin.

### 📥 Bulk Import
Yuzlab o'quvchilarni qo'lda kiritish o'rniga, Exceldan "CSV" qilib nusxalab, admin panelga tashlash kifoya. Tizim avtomatik ravishda email duplikatlarini tekshiradi va yangi userlarni yaratadi.

### 🎯 Dinamik Gamification
Oldin ballar qattiq kodlangan (hardcoded) edi. Endi admin panel orqali:
*   Bir sahifa uchun qancha ball (XP) berishni,
*   Kitob tugatganda qancha bonus berishni o'zgartirish mumkin.
*   Bu o'zgarishlar darhol barcha yangi harakatlar uchun qo'llaniladi.

---

*Hujjat yangilandi: 2026-02-17*
Mashrab tomonidan tayyorlandi.
