const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// 全局异常捕获：防止进程无日志退出，便于定位 PM2 重启根因
process.on('uncaughtException', (err) => {
    console.error('💥 uncaughtException:', err && err.stack ? err.stack : err);
});

process.on('unhandledRejection', (reason) => {
    console.error('💥 unhandledRejection:', reason && reason.stack ? reason.stack : reason);
});

const app = express();

// 中间件配置
const allowedOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: allowedOrigin }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 关键接口请求日志（头像上传/资料更新）
app.use((req, res, next) => {
    const watchPaths = ['/api/upload/image', '/api/user'];
    if (watchPaths.includes(req.path)) {
        console.log(`➡️  [${new Date().toISOString()}] ${req.method} ${req.path}`);
    }
    next();
});

// 导入数据库和路由
const pool = require('./config/database');
const authRoutes = require('./routes/auth');
const coreRoutes = require('./routes/core');
const adminRoutes = require('./routes/admin');
const adminManagementRoutes = require('./routes/admin-management');
const adminStatsRoutes = require('./routes/admin-stats');
const hierarchyRoutes = require('./routes/hierarchy');
const usersRoutes = require('./routes/users');
const schoolsRoutes = require('./routes/schools');
const contentRoutes = require('./routes/content');
const merchantRoutes = require('./routes/merchant');
const stallRoutes = require('./routes/stall');
const uploadRoutes = require('./routes/upload');
const aiRoutes = require('./routes/ai');

// 数据库初始化 - 添加缺失的字段
async function initializeDatabase() {
    try {
        // 初始化 schools 表
        const [columns] = await pool.query(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'schools' AND TABLE_SCHEMA = 'campus_food'
        `);
        
        const columnNames = columns.map(col => col.COLUMN_NAME);
        const requiredColumns = ['province', 'city', 'contact_name', 'contact_phone', 'address', 'description'];
        const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
        
        if (missingColumns.length > 0) {
            console.log('正在为 schools 表添加缺失的列...');
            for (const col of missingColumns) {
                let alterSql = '';
                switch(col) {
                    case 'province':
                        alterSql = `ALTER TABLE schools ADD COLUMN province varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '省份' AFTER name`;
                        break;
                    case 'city':
                        alterSql = `ALTER TABLE schools ADD COLUMN city varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '城市' AFTER province`;
                        break;
                    case 'contact_name':
                        alterSql = `ALTER TABLE schools ADD COLUMN contact_name varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '联系人'`;
                        break;
                    case 'contact_phone':
                        alterSql = `ALTER TABLE schools ADD COLUMN contact_phone varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '联系电话'`;
                        break;
                    case 'address':
                        alterSql = `ALTER TABLE schools ADD COLUMN address varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '学校地址'`;
                        break;
                    case 'description':
                        alterSql = `ALTER TABLE schools ADD COLUMN description text COLLATE utf8mb4_unicode_ci COMMENT '学校描述'`;
                        break;
                }
                if (alterSql) {
                    await pool.query(alterSql);
                    console.log(`✓ 添加列: ${col}`);
                }
            }
        }
        
        // 初始化 content_audit 表（如果不存在）
        const [tables] = await pool.query(`
            SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME = 'content_audit' AND TABLE_SCHEMA = 'campus_food'
        `);
        
        if (tables.length === 0) {
            console.log('正在创建 content_audit 表...');
            await pool.query(`
                CREATE TABLE IF NOT EXISTS content_audit (
                    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                    author VARCHAR(100) COLLATE utf8mb4_unicode_ci,
                    avatar VARCHAR(50) COLLATE utf8mb4_unicode_ci,
                    title VARCHAR(255) COLLATE utf8mb4_unicode_ci,
                    content TEXT COLLATE utf8mb4_unicode_ci,
                    content_type VARCHAR(50) COLLATE utf8mb4_unicode_ci DEFAULT 'post',
                    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                    images JSON,
                    sensitive_words JSON,
                    tags JSON,
                    reject_reason VARCHAR(255) COLLATE utf8mb4_unicode_ci,
                    reviewed_by INT,
                    reviewed_at DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
            console.log('✓ content_audit 表创建成功');
        }
        
        console.log('✓ 数据库初始化完成');
    } catch (error) {
        console.warn('数据库初始化警告:', error.message);
    }
}

// 使用路由
app.use('/api', authRoutes);
app.use('/api', coreRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/management', adminManagementRoutes);
app.use('/api/admin/stats', adminStatsRoutes);
app.use('/api/hierarchy', hierarchyRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/schools', schoolsRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/merchant', merchantRoutes);
app.use('/api/stall', stallRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);

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
    console.error('❌ Express错误中间件捕获:', err && err.stack ? err.stack : err);
    res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        error: process.env.NODE_ENV === 'development' ? err.message : ''
    });
});

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    // 在服务器启动时执行数据库初始化
    await initializeDatabase();
});

