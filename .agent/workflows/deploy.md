---
description: Deploy frontend to Vercel and backend to Render
---

# 🚀 Deployment Workflow

## Tayyorgarlik

Loyihani deploy qilishdan oldin GitHub ga push qilish kerak.

## 1️⃣ Backend — Render.com ga deploy

### A. GitHub ga push qiling
// turbo
```bash
cd c:\Users\Mashrab\Desktop\School
git add .
git commit -m "feat: prepare for deployment"
git push origin main
```

### B. Render Dashboard (https://dashboard.render.com)
1. **New** → **Web Service** bosing
2. GitHub reponi ulang
3. Sozlamalar:
   - **Name**: `kitobxon-backend`
   - **Region**: Frankfurt (EU)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && node seed.js`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Environment Variables** qo'shing (Render Dashboard → Environment):
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `JWT_SECRET` | `k1t0bx0n_pr0d_s3cur3_k3y_2026!@#$z9w` |
   | `JWT_EXPIRES_IN` | `7d` |
   | `FRONTEND_URL` | `https://your-frontend.vercel.app` (2-bosqichdan keyin yangilang) |

5. **Disk** qo'shing (agar SQLite va PDF fayllar saqlanishi kerak bo'lsa):
   - **Name**: `kitobxon-data`
   - **Mount Path**: `/opt/render/project/data`
   - **Size**: 1 GB
   
   Agar disk qo'shsangiz, bu env variablelarni ham qo'shing:
   | Key | Value |
   |-----|-------|
   | `DB_PATH` | `/opt/render/project/data/kitobxon.db` |
   | `UPLOADS_DIR` | `/opt/render/project/data/uploads` |

6. **Create Web Service** bosing
7. Deploy tugaguncha kuting va URL ni nusxalang (masalan: `https://kitobxon-backend.onrender.com`)

### C. Health Check
```
https://YOUR-BACKEND.onrender.com/api/health
```
Bu so'rov `{"holat":"ishlayapti","vaqt":"..."}` javobini qaytarishi kerak.

---

## 2️⃣ Frontend — Vercel ga deploy

### A. Vercel Dashboard (https://vercel.com)
1. **Add New** → **Project** bosing
2. GitHub reponi tanlang
3. Sozlamalar:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Environment Variables** qo'shing:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://YOUR-BACKEND.onrender.com/api` |
   
   ⚠️ `YOUR-BACKEND` ni 1-bosqichdagi Render URL ga almashtiring!

5. **Deploy** bosing

---

## 3️⃣ CORS yangilash

Frontend deploy bo'lgandan keyin:

1. Render Dashboard → Environment Variables ga qayting
2. `FRONTEND_URL` ni haqiqiy Vercel URL ga yangilang:
   ```
   FRONTEND_URL=https://your-project.vercel.app
   ```
3. **Manual Deploy** → **Clear build cache & deploy** bosing

---

## 🔍 Muammolarni bartaraf etish

### CORS xatosi
- Backend `FRONTEND_URL` to'g'ri sozlanganini tekshiring
- Vercel URL oxirida `/` bo'lmasligi kerak

### 401 Unauthorized
- `JWT_SECRET` backend va frontend bir xil ekanini tekshiring

### PDF yuklash ishlamayapti
- Render da Disk qo'shilganini tekshiring
- `UPLOADS_DIR` env variable to'g'ri sozlanganini tekshiring

### Ma'lumotlar yo'qoldi
- Free plan da disk qo'shmasangiz, har restart da DB tozalanadi
- Disk qo'shib, `DB_PATH` ni disk pathga yo'naltiring

---

## 📋 Hisob ma'lumotlari (Production)
| Rol | Login | Parol |
|-----|-------|-------|
| Super Admin | super@admin.uz | super123 |
| O'qituvchi | teacher@kitobxon.uz | teacher123 |
| O'quvchi | AN1441 | student123 |
