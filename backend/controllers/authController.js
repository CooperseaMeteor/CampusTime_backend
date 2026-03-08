const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/database');
require('dotenv').config();

// 帮助函数：安全获取连接并释放
async function withConnection(handler) {
    const conn = await pool.getConnection();
    try {
        return await handler(conn);
    } finally {
        conn.release();
    }
}

// 注册用户
exports.register = async (req, res) => {
    try {
        const { 
            username, 
            password, 
            realName,
            studentId,
            school, // 新增的school参数
            college,
            major,
            grade,
            phone
        } = req.body; // 已删掉isAdmin解构

        // 验证输入
        if (!username || !password) {
            return res.status(400).json({
                code: 400,
                message: '用户名和密码不能为空'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                code: 400,
                message: '密码至少需要6位字符'
            });
        }

        const connection = await pool.getConnection();

        // 检查用户名是否已存在
        const [existingUser] = await connection.execute(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );

        if (existingUser.length > 0) {
            connection.release();
            return res.status(400).json({
                code: 400,
                message: '用户名已被注册'
            });
        }

        // 如果提供了学号,检查学号是否已存在
        if (studentId) {
            const [existingStudent] = await connection.execute(
                'SELECT id FROM users WHERE student_id = ?',
                [studentId]
            );
            
            if (existingStudent.length > 0) {
                connection.release();
                return res.status(400).json({
                    code: 400,
                    message: '该学号已被注册'
                });
            }
        }

        // 加密密码
        const passwordHash = await bcrypt.hash(password, 10);

        // 确定角色 - 只允许注册普通用户（固定为user，无管理员入口）
        const role = 'user'; // users.role 枚举仅支持 user/admin

        // 插入用户记录（含school+college，已和数据库对应）
        const [result] = await connection.execute(
            `INSERT INTO users (
                username, 
                password_hash, 
                role, 
                status,
                real_name,
                student_id,
                school,
                college,
                major,
                grade,
                phone
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                username, 
                passwordHash, 
                role, 
                'active',
                realName || null,
                studentId || null,
                school || null,
                college || null,
                major || null,
                grade || null,
                phone || null
            ]
        );

        connection.release();

        // 返回成功响应
        res.status(201).json({
            code: 201,
            message: '注册成功',
            data: {
                userId: result.insertId,
                username: username,
                role: role
            }
        });

    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({
            code: 500,
            message: '注册失败，请稍后重试'
        });
    }
};

// 用户登录
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 验证输入
        if (!username || !password) {
            return res.status(400).json({
                code: 400,
                message: '用户名和密码不能为空'
            });
        }

        const connection = await pool.getConnection();

        // 查询用户
        const [users] = await connection.execute(
            'SELECT id, username, password_hash, role, status FROM users WHERE username = ?',
            [username]
        );

        console.log('[login] db=', process.env.DB_NAME || 'campus_food', 'username=', username, 'found=', users.length);

        if (users.length === 0) {
            connection.release();
            console.warn('[login] user not found:', username);
            return res.status(401).json({
                code: 401,
                message: '用户名或密码错误'
            });
        }

        const user = users[0];

        // 检查用户状态
        if (user.status !== 'active') {
            connection.release();
            return res.status(403).json({
                code: 403,
                message: '账户已被禁用'
            });
        }

        // 验证密码
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            connection.release();
            console.warn('[login] password mismatch:', username);
            return res.status(401).json({
                code: 401,
                message: '用户名或密码错误'
            });
        }

        connection.release();

        // 生成 access token
        const accessToken = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // 生成 refresh token（随机字符串），有效期 30 天
        const refreshToken = crypto.randomBytes(64).toString('hex');
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

        // 存储 refresh token
        try {
            const conn2 = await pool.getConnection();
            await conn2.execute(
                'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
                [user.id, refreshToken, expiresAt]
            );
            conn2.release();
        } catch (err) {
            console.error('存储 refresh token 失败:', err);
        }

        // 返回成功响应（包含 access + refresh token）
        res.json({
            code: 200,
            message: '登录成功',
            data: {
                userId: user.id,
                username: user.username,
                role: user.role,
                accessToken: accessToken,
                refreshToken: refreshToken
            }
        });

    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({
            code: 500,
            message: '登录失败，请稍后重试'
        });
    }
};

// 更新用户资料
exports.updateUserProfile = async (req, res) => {
    try {
        const { realName, phone, major, avatar } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ code: 401, message: '未登录' });
        }

        const fields = [];
        const values = [];

        if (realName !== undefined) { fields.push('real_name = ?'); values.push(realName); }
        if (phone !== undefined) { fields.push('phone = ?'); values.push(phone); }
        if (major !== undefined) { fields.push('major = ?'); values.push(major); }
        if (avatar !== undefined) { fields.push('avatar = ?'); values.push(avatar); }

        if (fields.length === 0) {
            return res.status(400).json({ code: 400, message: '无可更新字段' });
        }

        values.push(userId);

        await withConnection(async (conn) => {
            const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
            await conn.execute(sql, values);
        });

        return res.json({ code: 200, message: '更新成功' });
    } catch (error) {
        console.error('更新用户资料错误:', error);
        return res.status(500).json({ code: 500, message: '更新失败，请稍后重试' });
    }
};

// 获取用户信息（需要认证）
exports.getUserInfo = async (req, res) => {
    try {
        const userId = req.user.userId;

        const connection = await pool.getConnection();

        const [users] = await connection.execute(
            `SELECT 
                id,
                username,
                role,
                status,
                real_name AS realName,
                student_id AS studentId,
                school,
                college,
                major,
                grade,
                phone,
                NULL AS email,
                avatar,
                created_at AS createdAt,
                updated_at AS updatedAt
             FROM users WHERE id = ?`,
            [userId]
        );

        connection.release();

        if (users.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '用户不存在'
            });
        }

        res.json({
            code: 200,
            message: '获取用户信息成功',
            data: users[0]
        });

    } catch (error) {
        console.error('获取用户信息错误:', error);
        res.status(500).json({
            code: 500,
            message: '获取用户信息失败'
        });
    }
};

// 刷新 access token
exports.refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ code: 400, message: '缺少 refreshToken' });

        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT id, user_id, expires_at FROM refresh_tokens WHERE token = ?',
            [refreshToken]
        );

        if (rows.length === 0) {
            connection.release();
            return res.status(401).json({ code: 401, message: '无效的 refreshToken' });
        }

        const rec = rows[0];
        const now = new Date();
        if (new Date(rec.expires_at) < now) {
            // 已过期，删除记录
            await connection.execute('DELETE FROM refresh_tokens WHERE id = ?', [rec.id]);
            connection.release();
            return res.status(401).json({ code: 401, message: 'refreshToken 已过期' });
        }

        // 查询用户信息
        const [users] = await connection.execute('SELECT id, username, role FROM users WHERE id = ?', [rec.user_id]);
        connection.release();
        if (users.length === 0) return res.status(404).json({ code: 404, message: '用户不存在' });

        const user = users[0];
        // 签发新的 access token
        const newAccessToken = jwt.sign({ userId: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.json({ code: 200, message: '刷新成功', data: { accessToken: newAccessToken } });
    } catch (error) {
        console.error('刷新 token 错误:', error);
        return res.status(500).json({ code: 500, message: '刷新失败' });
    }
};

// 注销（删除 refresh token）
exports.logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ code: 400, message: '缺少 refreshToken' });

        const connection = await pool.getConnection();
        await connection.execute('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);
        connection.release();

        return res.json({ code: 200, message: '已注销' });
    } catch (error) {
        console.error('注销错误:', error);
        return res.status(500).json({ code: 500, message: '注销失败' });
    }
};
