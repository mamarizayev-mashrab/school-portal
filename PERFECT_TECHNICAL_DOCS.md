# 💎 Kitobxon — Mukammal Texnik Arxitektura (Enterprise Technical Documentation)

Ushbu hujjat "Kitobxon" platformasining ichki mantiqiy tuzilishi, algoritmlari va xavfsizlik protokollarini eng oxirgi detallarigacha yoritadi. Ushbu hujjat dasturchilar, tizim arxitektorlari va ma'murlar uchun asosiy qo'llanma hisoblanadi.

---

## 🏗️ 1. Tizim Arxitekturasi (Architecture Breakdown)

Loyiha **Micro-services ready Monolith** arxitekturasida qurilgan.

### 1.1. Hybrid Database Strategy
Tizim ikki xil muhitda ishlash qobiliyatiga ega:
- **Local/Development:** `better-sqlite3` (WAL mode). Faylga asoslangan, nol konfiguratsiya, yuqori tezlik.
- **Production/Cloud:** `PostgreSQL`. Massiv so'rovlar va ma'lumotlar yaxlitligi uchun.
- **Abstraktsiya qatlami:** `backend/src/config/db.js` dagi universal wrapper har ikki bazaga ham bir xil interfeys (`query`, `get`, `run`) orqali murojaat qilish imkonini beradi.

### 1.2. Frontend & Logic Flow
- **SPA (Single Page Application):** React 18 + Vite.
- **State Flow:** AuthContext orqali global foydalanuvchi holati boshqariladi.
- **UI System:** Tailwind CSS 3.4 asosidagi Vercel-style Dark mode interfeysi.

---

## 🗄️ 2. Ma'lumotlar Strukturasi (Relational Mapping)

### 2.1. Asosiy Entitierlar
1. **Users (Foydalanuvchilar):** Markaziy obyekt. `role` ustuni orqali RBAC boshqariladi. Gamifikatsiya ma'lumotlari (`xp`, `level`, `streak_count`) ham shu yerda saqlanadi.
2. **Reading Logs (O'qish Jurnallari):** O'quvchi faolligining asosi. `user_id` bilan bog'langan. Har bir yozuv xulosa va tasdiqlash statusiga ega.
3. **Quizzes & Results:** O'qilgan kitoblar yuzasidan testlar va ularning natijalari (`ball` 0-100 oralig'ida).
4. **Audit Logs:** Tizimdagi har bir o'zgarish (User yaratish, o'chirish, sozlamalarni o'zgartirish) ma'murning IDsi va Ipsi bilan qayd etiladi.

---

## 🧠 3. Intellektual Algoritmlar (Core Logic)

### 3.1. AI Quiz Generation (`aiQuiz.js`)
Testlar dinamik ravishda o'quvchi yozgan xulosa matnidan generatsiya qilinadi:
- **Pattern Matching:** Matndagi jumlalar segmentatsiyalanadi.
- **MCQ (5 ta):** Matndan kalit so'zlar olinib, "distractors" (noto'g'ri variantlar) generatsiya qilinadi.
- **True/False (3 ta):** Matndagi jumlalar mantiqiy o'zgartirilib yoki o'z holicha savolga aylantiriladi.
- **Short Answer (2 ta):** Kitob nomi va muallifi haqida aniq bilim tekshiriladi.

### 3.2. AI Rating Formula (`aiRating.js`)
O'quvchining umumiy reytingi quyidagi formula asosida hisoblanadi:
$$Reyting = (B \times 0.3) + (S \times 0.2) + (T \times 0.25) + (Q \times 0.25)$$
- **B (Kitob soni):** Har bir kitob uchun ball.
- **S (Sahifa soni):** Har bir sahifa uchun ball.
- **T (Test natijasi):** O'rtacha test ballari.
- **Q (Xulosa sifati):** Tasdiqlangan xulosalarning umumiy xulosalarga nisbati.

### 3.3. Gamifikatsiya Tizimi (`gamification.js`)
- **XP Progression:** Har bir harakat (`ADD_BOOK`, `TEST_COMPLETED`) uchun xp beriladi.
- **Dynamic Levels:** XP ko'payishi bilan `Yangi` → `Legenda` gacha bo'lgan 7 ta bosqich.
- **Streak Logic:** Ketma-ket 24 soat ichida faollik bo'lmasa, `streak_count` nolga tushadi.

---

## 🔐 4. Xavfsizlik va Ruxsatlar (Security Protocol)

### 4.1. RBAC Hierarchy
- **Level 0 (Student):** Faqat Read/Write (o'zining logs).
- **Level 1 (Teacher):** O'z sinfidagi ma'lumotlarni Read/Update (tasdiqlash).
- **Level 2 (Admin):** Foydalanuvchi boshqaruvi.
- **Level 3 (Super Admin):** Tizim "Master Key". Hech qanday middleware uni bloklay olmaydi (`rbac.js` dagi maxsus shart).

### 4.2. Ma'lumotlar Himoyasi
- **JWT Authentication:** Tokenlar faqat backend tomonidan beriladi, `7d` (7 kun) amal qiladi.
- **Password Strength:** Bcrypt (Factor 12) bilan hashlash.
- **Constraint Safety:** `ON DELETE CASCADE` orqali bazada "orphan" (egasi yo'q) yozuvlar qolmasligi ta'minlangan.

---

## 📡 5. Tizim Integratsiyasi (API & DevOps)

### 5.1. Tashqi Servislar
- **Cloudinary:** Kitob muqovalari va profil rasmlarini bulutda saqlash.
- **BetterStack/Render Logs:** Server barqarorligini kuzatish.

### 5.2. Konfiguratsiya (Environment)
Tizim ishlashi uchun quyidagi o'zgaruvchilar shart:
- `JWT_SECRET`: Shifrlash kaliti.
- `DATABASE_URL`: PostgreSQL uchun (ixtiyoriy).
- `CLOUDINARY_URL`: Media assetlar uchun.
- `PORT`: Server porti (Default 5000).

---

## 🚀 6. Masshtablash va Kelajak (Scalability)

1. **Caching:** Tez-tez so'raladigan Leaderboard ma'lumotlarini `Redis` ga ko'chirish imkoniyati.
2. **Real-time:** Bildirishnomalarni `Socket.io` orqali lahzali yetkazish.
3. **Analytics:** O'qituvchilar uchun oylik CSV/PDF hisobotlar generatsiyasi.

---
*Ushbu hujjat loyihaning texnik mukammalligini va barqarorligini ta'minlash uchun xizmat qiladi.*
**Antigravity AI tomonidan generatsiya qilingan.**
