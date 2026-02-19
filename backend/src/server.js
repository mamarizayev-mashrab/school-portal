require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

// CORS — production va development uchun
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
];

// Production da Vercel URL ni qo'shish
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
    origin: function (origin, callback) {
        // Server-to-server yoki same-origin so'rovlarga ruxsat
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`CORS bloklandi: ${origin}`);
            callback(new Error('CORS policy tomonidan bloklandi'));
        }
    },
    credentials: true
}));
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/gamification', require('./routes/gamification'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/library', require('./routes/library'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ holat: 'ishlayapti', vaqt: new Date().toISOString() });
});

// Xatoliklarni ushlash
app.use((err, req, res, next) => {
    console.error('Server xatosi:', err);
    res.status(500).json({ xabar: 'Ichki server xatosi' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kitobxon server ${PORT}-portda ishlayapti`);
    console.log(`Muhit: ${process.env.NODE_ENV || 'development'}`);
});
