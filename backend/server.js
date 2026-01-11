const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// 中间件配置
const allowedOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: allowedOrigin }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 导入路由
const authRoutes = require('./routes/auth');
const coreRoutes = require('./routes/core');

// 使用路由
app.use('/api', authRoutes);
app.use('/api', coreRoutes);

// 轻量级连通性测试（用于排查超时）
app.get('/api/ping', (req, res) => {
    res.json({ status: 'OK', time: Date.now() });
});

// 健康检查端点
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: '服务器正常运行' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        error: process.env.NODE_ENV === 'development' ? err.message : ''
    });
});

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
});
