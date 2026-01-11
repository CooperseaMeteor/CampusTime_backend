const mysql = require('mysql2/promise');
require('dotenv').config();

// 创建连接池
const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'campus_food',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
    connectTimeout: 10000
});

// 测试连接
pool.getConnection()
    .then(connection => {
        console.log('✅ 数据库连接成功');
        return connection.query('SELECT 1 AS ok')
            .then(([rows]) => {
                console.log('✅ 数据库查询可用:', rows[0]);
                connection.release();
            })
            .catch(err => {
                console.error('❌ 数据库查询失败:', err.message);
                connection.release();
            });
    })
    .catch(err => {
        console.error('❌ 数据库连接失败:', err.message);
    });

module.exports = pool;
