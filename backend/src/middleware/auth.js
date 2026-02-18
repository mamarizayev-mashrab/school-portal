const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies?.token;

        if (!token) {
            return res.status(401).json({ xabar: 'Avtorizatsiya talab qilinadi' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ xabar: 'Yaroqsiz token' });
    }
};

module.exports = auth;
