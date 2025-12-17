require('dotenv').config();
const jwt = require('jsonwebtoken');

// 验证JWT Token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        return res.status(401).json({ code: 401, message: '未提供认证令牌' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        return next();
    } catch (error) {
        return res.status(401).json({ code: 401, message: '无效或已过期的令牌' });
    }
};

module.exports = { verifyToken };
