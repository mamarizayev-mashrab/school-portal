const rbac = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ xabar: 'Avtorizatsiya talab qilinadi' });
        }

        // Super Admin har doim o'tadi (Master Key)
        if (req.user.role === 'superadmin') {
            return next();
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ xabar: 'Sizda bu amalni bajarishga ruxsat yo\'q' });
        }

        next();
    };
};

module.exports = rbac;
