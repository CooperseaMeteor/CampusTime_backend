const jwt = require('jsonwebtoken');

// 验证JWT Token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            code: 401,
            message: '未提供认证令牌'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            code: 401,
            message: '令牌无效或已过期'
        });
    }
};

module.exports = { verifyToken };
