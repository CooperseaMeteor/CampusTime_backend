const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// 注册用户
exports.register = async (req, res) => {
    try {
        const { username, password, isAdmin } = req.body;

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

        // 加密密码
        const passwordHash = await bcrypt.hash(password, 10);

        // 确定角色
        const role = isAdmin ? 'admin' : 'user';

        // 插入用户记录
        const [result] = await connection.execute(
            'INSERT INTO users (username, password_hash, role, status) VALUES (?, ?, ?, ?)',
            [username, passwordHash, role, 'active']
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

        if (users.length === 0) {
            connection.release();
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
            return res.status(401).json({
                code: 401,
                message: '用户名或密码错误'
            });
        }

        connection.release();

        // 生成JWT Token
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 返回成功响应
        res.json({
            code: 200,
            message: '登录成功',
            data: {
                userId: user.id,
                username: user.username,
                role: user.role,
                token: token
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

// 获取用户信息（需要认证）
exports.getUserInfo = async (req, res) => {
    try {
        const userId = req.user.userId;

        const connection = await pool.getConnection();

        const [users] = await connection.execute(
            'SELECT id, username, role, status, created_at FROM users WHERE id = ?',
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
