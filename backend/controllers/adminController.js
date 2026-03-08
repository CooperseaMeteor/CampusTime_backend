const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
require('dotenv').config();

/**
 * 管理员登录控制器
 * 基于《校园食光》管理员权限与层级规范V1
 */

// 获取管理员所有职位
async function getAdminPositions(connection, adminId) {
    const [positions] = await connection.execute(`
        SELECT 
            ap.id,
            ap.role,
            ap.school_id,
            ap.merchant_node_id,
            ap.stall_id,
            s.name as school_name,
            COALESCE(mn.name, '') as merchant_name,
            COALESCE(st.name, '') as stall_name
        FROM admin_positions ap
        LEFT JOIN schools s ON ap.school_id = s.id
        LEFT JOIN merchants mn ON ap.merchant_node_id = mn.id
        LEFT JOIN stalls st ON ap.stall_id = st.id
        WHERE ap.admin_id = ? AND ap.unassigned_at IS NULL
        ORDER BY ap.assigned_at DESC
    `, [adminId]);

    return positions.map(p => ({
        id: p.id,
        role: p.role,
        label: buildPositionLabel(p),
        schoolId: p.school_id,
        schoolName: p.school_name,
        merchantNodeId: p.merchant_node_id,
        merchantName: p.merchant_name,
        stallId: p.stall_id,
        stallName: p.stall_name,
        target: getConsoleTarget(p.role),
        permissions: [] // 权限列表稍后加载
    }));
}

// 构建职位标签
function buildPositionLabel(position) {
    const parts = [];
    
    if (position.school_name) {
        parts.push(position.school_name);
    }
    
    if (position.merchant_name) {
        parts.push(position.merchant_name);
    }
    
    if (position.stall_name) {
        parts.push(position.stall_name);
    }
    
    // 添加角色名称
    const roleLabels = {
        'super_admin': '超级管理员',
        'school_admin': '学校管理员',
        'merchant_admin': '商户管理员',
        'stall_admin': '档口管理员'
    };
    
    parts.push(roleLabels[position.role] || position.role);
    
    return parts.join(' · ');
}

// 获取控制台目标页面
function getConsoleTarget(role) {
    const targets = {
        'super_admin': '/main/admin/super_admin_index.html',
        'school_admin': '/main/admin/school_admin_index.html',
        'merchant_admin': '/main/admin/merchant_admin_index.html',
        'stall_admin': '/main/admin/stall_dashboard.html'
    };
    return targets[role] || '/main/admin/admin_shell.html';
}

// 获取职位权限列表
async function getPositionPermissions(connection, positionId) {
    const [permissions] = await connection.execute(`
        SELECT permission
        FROM admin_permissions
        WHERE position_id = ? AND revoked_at IS NULL
    `, [positionId]);
    
    return permissions.map(p => p.permission);
}

/**
 * 管理员登录
 * POST /api/admin/login
 */
exports.adminLogin = async (req, res) => {
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

        try {
            // 查询管理员账号
            const [admins] = await connection.execute(
                `SELECT 
                    id, username, password_hash, real_name, phone, email,
                    identity_label, identity_suffix, identity_suffix_status,
                    status
                FROM admin_users 
                WHERE username = ?`,
                [username]
            );

            console.log('[adminLogin] db=', process.env.DB_NAME || 'campus_food', 'username=', username, 'found=', admins.length);

            if (admins.length === 0) {
                connection.release();
                console.warn('[adminLogin] user not found:', username);
                return res.status(401).json({
                    code: 401,
                    message: '用户名或密码错误'
                });
            }

            const admin = admins[0];

            // 检查账号状态
            if (admin.status === 'disabled') {
                connection.release();
                return res.status(403).json({
                    code: 403,
                    message: '账号已被禁用，请联系上级管理员'
                });
            }

            // 验证密码
            const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
            if (!isPasswordValid) {
                connection.release();
                console.warn('[adminLogin] password mismatch:', username);
                return res.status(401).json({
                    code: 401,
                    message: '用户名或密码错误'
                });
            }

            // 获取所有职位
            const positions = await getAdminPositions(connection, admin.id);

            // 为每个职位加载权限
            for (const position of positions) {
                position.permissions = await getPositionPermissions(connection, position.id);
                
                // 超级管理员拥有所有权限
                if (position.role === 'super_admin') {
                    position.permissions = ['*'];
                }
            }

            connection.release();

            // 生成JWT token
            const token = jwt.sign(
                { 
                    adminId: admin.id, 
                    username: admin.username,
                    type: 'admin'
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '7d' }
            );

            // 返回登录信息
            res.json({
                code: 200,
                message: '登录成功',
                data: {
                    token,
                    adminId: admin.id,
                    adminInfo: {
                        username: admin.username,
                        real_name: admin.real_name,
                        phone: admin.phone,
                        email: admin.email,
                        identity_label: admin.identity_label,
                        identity_suffix: admin.identity_suffix,
                        identity_suffix_status: admin.identity_suffix_status
                    },
                    positions
                }
            });

        } catch (error) {
            connection.release();
            throw error;
        }

    } catch (error) {
        console.error('管理员登录失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * 获取当前管理员信息
 * GET /api/admin/me
 */
exports.getAdminInfo = async (req, res) => {
    try {
        const adminId = req.admin.id; // 从middleware获取

        const connection = await pool.getConnection();

        const [admins] = await connection.execute(
            `SELECT 
                id, username, real_name, phone, email,
                identity_label, identity_suffix, identity_suffix_status
            FROM admin_users 
            WHERE id = ? AND status = 'active'`,
            [adminId]
        );

        connection.release();

        if (admins.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '管理员不存在'
            });
        }

        res.json({
            code: 200,
            data: admins[0]
        });

    } catch (error) {
        console.error('获取管理员信息失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误'
        });
    }
};

/**
 * 获取当前管理员的所有职位
 * GET /api/admin/positions
 */
exports.getAdminPositions = async (req, res) => {
    try {
        const adminId = req.admin.id;

        const connection = await pool.getConnection();
        const positions = await getAdminPositions(connection, adminId);
        
        // 为每个职位加载权限
        for (const position of positions) {
            position.permissions = await getPositionPermissions(connection, position.id);
            if (position.role === 'super_admin') {
                position.permissions = ['*'];
            }
        }

        connection.release();

        res.json({
            code: 200,
            data: positions
        });

    } catch (error) {
        console.error('获取职位列表失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误'
        });
    }
};
