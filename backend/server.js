const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// 中间件配置
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 导入路由
const authRoutes = require('./routes/auth');

// 使用路由
app.use('/api', authRoutes);

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
