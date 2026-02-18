-- Kitobxon Database Schema (SQLite) v2 - Gamification, Notifications, Reading Plan

DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ism TEXT NOT NULL,
  familiya TEXT NOT NULL,
  email TEXT UNIQUE,
  student_id TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin', 'superadmin')),
  sinf TEXT,
  avatar TEXT DEFAULT NULL,
  streak_count INTEGER DEFAULT 0,
  last_activity_date TEXT DEFAULT NULL,
  level TEXT DEFAULT 'Yangi',
  xp INTEGER DEFAULT 0,
  theme TEXT DEFAULT 'dark',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS book_catalog (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nomi TEXT NOT NULL,
  muallif TEXT NOT NULL,
  janr TEXT,
  sahifalar_soni INTEGER,
  tavsif TEXT,
  cover_url TEXT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reading_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  kitob_nomi TEXT NOT NULL,
  muallif TEXT NOT NULL,
  sahifalar_soni INTEGER NOT NULL,
  oqilgan_sana DATE NOT NULL,
  xulosa TEXT NOT NULL,
  xulosa_tasdiqlangan INTEGER DEFAULT 0,
  tasdiqlagan_id INTEGER REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quizzes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reading_log_id INTEGER REFERENCES reading_logs(id) ON DELETE CASCADE,
  savollar TEXT NOT NULL,
  yaratilgan_sana DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  javoblar TEXT NOT NULL,
  ball REAL DEFAULT 0,
  topshirilgan_sana DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Gamification
CREATE TABLE IF NOT EXISTS badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  badge_key TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_icon TEXT NOT NULL,
  badge_desc TEXT NOT NULL,
  earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, badge_key)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  turi TEXT NOT NULL,
  xabar TEXT NOT NULL,
  oqilgan INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Reading Plan
CREATE TABLE IF NOT EXISTS reading_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  nomi TEXT NOT NULL,
  maqsad_kitoblar INTEGER DEFAULT 5,
  boshlanish_sana DATE NOT NULL,
  tugash_sana DATE NOT NULL,
  holat TEXT DEFAULT 'active' CHECK (holat IN ('active', 'completed', 'cancelled')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plan_books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id INTEGER REFERENCES reading_plans(id) ON DELETE CASCADE,
  kitob_nomi TEXT NOT NULL,
  muallif TEXT,
  oqilgan INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER,
    action TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(admin_id) REFERENCES users(id)
);
