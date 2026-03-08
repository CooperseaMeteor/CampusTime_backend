const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { adminAuthMiddleware, requirePermission } = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');

// 🆕 管理员登录（不需要token）
router.post('/login', adminController.adminLogin);

// 以下需要管理员token验证
router.use(adminAuthMiddleware);

// 🆕 获取当前管理员信息
router.get('/me', adminController.getAdminInfo);

// 🆕 获取当前管理员的所有职位
router.get('/positions', adminController.getAdminPositions);

// 简单管理员角色校验
function requireAdmin(req, res, next) {
    if (!req.adminContext) {
        return res.status(403).json({ code: 403, message: '需要管理员权限' });
    }
    return next();
}

// 今日统计：示例统计，可按需替换为真实业务统计
router.get('/stats/today', requireAdmin, async (req, res) => {
    try {
        // 统计在售菜品数、今日评价数、库存预警等可根据实际业务调整
        const [dishRows] = await pool.query('SELECT COUNT(*) AS total, SUM(CASE WHEN is_available = 1 THEN 1 ELSE 0 END) AS available FROM dishes');
        const [lowStockRows] = await pool.query("SELECT COUNT(*) AS warning FROM dishes WHERE stock_mode = 'limited' AND remaining_stock IS NOT NULL AND remaining_stock <= 5");
        // 如果有评价表，可统计今日评价
        const [reviewRows] = await pool.query('SELECT COUNT(*) AS todayReviews FROM reviews WHERE DATE(created_at) = CURDATE()');

        const stats = {
            today_supply: dishRows[0]?.available || 0,
            todayReviews: reviewRows[0]?.todayReviews || 0,
            stockWarning: lowStockRows[0]?.warning || 0,
            todayViews: 0 // 如需曝光/浏览量，后续接入埋点表
        };

        return res.json({ code: 200, message: '获取今日统计成功', data: stats });
    } catch (err) {
        console.error('获取今日统计失败:', err);
        return res.status(500).json({ code: 500, message: '服务器错误' });
    }
});

// 管理员树状列表（用于前端管理页）
router.get('/list', requireAdmin, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const context = req.adminContext || {};
        const { role, schoolId, merchantNodeId, stallId } = context;

        let whereSql = 'WHERE ap.unassigned_at IS NULL';
        const params = [];
        if (role === 'school_admin') {
            whereSql += ' AND ap.school_id = ?';
            params.push(schoolId || 0);
        } else if (role === 'merchant_admin') {
            whereSql += ' AND (ap.merchant_node_id = ? OR ap.stall_id IN (SELECT id FROM stalls WHERE merchant_id = ?))';
            params.push(merchantNodeId || 0, merchantNodeId || 0);
        } else if (role === 'stall_admin') {
            whereSql += ' AND ap.stall_id = ?';
            params.push(stallId || 0);
        }

        const [rows] = await connection.execute(`
            SELECT 
                au.id AS admin_id,
                au.username,
                au.real_name,
                au.identity_label,
                au.identity_suffix,
                au.identity_suffix_status,
                au.status,
                ap.id AS position_id,
                ap.role,
                ap.school_id,
                ap.merchant_node_id,
                ap.stall_id,
                s.name AS school_name,
                m.name AS merchant_name,
                st.name AS stall_name,
                st.merchant_id AS stall_merchant_id
            FROM admin_users au
            LEFT JOIN admin_positions ap ON au.id = ap.admin_id AND ap.unassigned_at IS NULL
            LEFT JOIN schools s ON ap.school_id = s.id
            LEFT JOIN merchants m ON ap.merchant_node_id = m.id
            LEFT JOIN stalls st ON ap.stall_id = st.id
            ${whereSql}
            ORDER BY au.created_at DESC
        `, params);

        connection.release();

        const adminsById = new Map();
        rows.forEach(r => {
            if (!adminsById.has(r.admin_id)) {
                adminsById.set(r.admin_id, {
                    id: r.admin_id,
                    name: r.real_name || r.username,
                    username: r.username,
                    identityLabel: r.identity_label,
                    identitySuffix: r.identity_suffix,
                    identitySuffixStatus: r.identity_suffix_status,
                    status: r.status,
                    positions: []
                });
            }
            if (r.position_id) {
                adminsById.get(r.admin_id).positions.push({
                    id: r.position_id,
                    role: r.role,
                    school_id: r.school_id,
                    merchant_node_id: r.merchant_node_id,
                    stall_id: r.stall_id,
                    school_name: r.school_name,
                    merchant_name: r.merchant_name,
                    stall_name: r.stall_name,
                    stall_merchant_id: r.stall_merchant_id
                });
            }
        });

        const tree = [];
        // 未分配职位
        adminsById.forEach(admin => {
            if (!admin.positions || admin.positions.length === 0) {
                tree.push({
                    type: 'unassigned',
                    ...admin,
                    position: '未分配'
                });
            }
        });

        const schoolsMap = new Map();
        const getSchoolNode = (id, name) => {
            const key = id || 0;
            if (!schoolsMap.has(key)) {
                schoolsMap.set(key, {
                    type: 'school',
                    id: key,
                    name: name || (key === 0 ? '平台' : `学校${key}`),
                    children: [],
                    admins: []
                });
            }
            return schoolsMap.get(key);
        };

        const merchantsMap = new Map();
        const getMerchantNode = (schoolNode, id, name) => {
            const key = `${schoolNode.id}_${id}`;
            if (!merchantsMap.has(key)) {
                const node = {
                    type: 'merchant',
                    id,
                    name: name || `商户${id}`,
                    children: [],
                    admins: [],
                    stallCount: 0
                };
                schoolNode.children.push(node);
                merchantsMap.set(key, node);
            }
            return merchantsMap.get(key);
        };

        const stallsMap = new Map();
        const getStallNode = (merchantNode, id, name) => {
            const key = `${merchantNode.id}_${id}`;
            if (!stallsMap.has(key)) {
                const node = {
                    type: 'stall',
                    id,
                    name: name || `档口${id}`,
                    admins: [],
                    adminCount: 0
                };
                merchantNode.children.push(node);
                merchantNode.stallCount = merchantNode.children.length;
                stallsMap.set(key, node);
            }
            return stallsMap.get(key);
        };

        adminsById.forEach(admin => {
            (admin.positions || []).forEach(pos => {
                const schoolNode = getSchoolNode(pos.school_id, pos.school_name);
                const positionLabel = pos.role === 'super_admin'
                    ? '平台超级管理员'
                    : pos.role === 'school_admin'
                        ? '学校管理员'
                        : pos.role === 'merchant_admin'
                            ? '商户管理员'
                            : '档口管理员';

                const adminNode = {
                    type: 'admin',
                    id: admin.id,
                    name: admin.name,
                    identityLabel: admin.identityLabel,
                    identitySuffix: admin.identitySuffix,
                    identitySuffixStatus: admin.identitySuffixStatus,
                    position: positionLabel,
                    status: admin.status
                };

                if (pos.role === 'super_admin' || pos.role === 'school_admin') {
                    schoolNode.admins.push(adminNode);
                    return;
                }

                const merchantId = pos.merchant_node_id || pos.stall_merchant_id || 0;
                const merchantNode = getMerchantNode(schoolNode, merchantId, pos.merchant_name);

                if (pos.role === 'merchant_admin') {
                    merchantNode.admins.push(adminNode);
                    return;
                }

                if (pos.role === 'stall_admin') {
                    const stallNode = getStallNode(merchantNode, pos.stall_id, pos.stall_name);
                    stallNode.admins.push(adminNode);
                    stallNode.adminCount = stallNode.admins.length;
                }
            });
        });

        Array.from(schoolsMap.values()).forEach(school => {
            school.merchantCount = school.children.length;
        });

        tree.push(...Array.from(schoolsMap.values()));

        res.json({ success: true, data: tree });
    } catch (err) {
        console.error('获取管理员树失败:', err);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 禁用管理员（兼容旧前端）
router.post('/:id/disable', requirePermission('admin.disable'), async (req, res) => {
    try {
        const adminId = parseInt(req.params.id);
        if (req.admin && req.admin.id === adminId) {
            return res.status(403).json({ success: false, message: '不能禁用自己的账号' });
        }

        const connection = await pool.getConnection();
        await connection.execute('UPDATE admin_users SET status = ? WHERE id = ?', ['disabled', adminId]);
        connection.release();

        res.json({ success: true, message: '禁用成功' });
    } catch (err) {
        console.error('禁用管理员失败:', err);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 我的创建列表（兼容旧前端）
router.get('/created-by-me', requireAdmin, async (req, res) => {
    try {
        const adminId = req.admin?.id || req.adminContext?.adminId;
        if (!adminId) {
            return res.status(403).json({ success: false, message: '需要管理员权限' });
        }

        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            `SELECT id, username, real_name, created_at
             FROM admin_users
             WHERE created_by = ?
             ORDER BY created_at DESC`,
            [adminId]
        );
        connection.release();

        const data = rows.map(r => ({
            id: r.id,
            name: r.real_name || r.username,
            createdAt: r.created_at
        }));

        res.json({ success: true, data });
    } catch (err) {
        console.error('获取我的创建列表失败:', err);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 菜品列表（可带查询参数）
router.get('/dishes', requireAdmin, async (req, res) => {
    try {
        const { stallId, page = 1, limit = 100 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const params = [];
        let where = '';
        if (stallId) {
            where = 'WHERE stall_id = ?';
            params.push(stallId);
        }
        const [rows] = await pool.query(`SELECT * FROM dishes ${where} ORDER BY id DESC LIMIT ?, ?`, [...params, Number(offset), Number(limit)]);
        return res.json({ code: 200, message: '获取菜品成功', data: rows });
    } catch (err) {
        console.error('获取菜品失败:', err);
        return res.status(500).json({ code: 500, message: '服务器错误' });
    }
});

// 更新菜品（部分字段）
router.patch('/dishes/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const {
        name,
        price,
        image,
        stock_mode,
        stockMode,
        total_stock,
        totalStock,
        remaining_stock,
        remainingStock,
        is_available,
        isAvailable,
        tags
    } = req.body;

    // 允许的字段
    const updates = [];
    const values = [];

    const resolvedStockMode = stock_mode || stockMode;
    const resolvedTotalStock = total_stock ?? totalStock;
    const resolvedRemainingStock = remaining_stock ?? remainingStock;
    const resolvedIsAvailable = is_available ?? isAvailable;

    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (price !== undefined) { updates.push('price = ?'); values.push(price); }
    if (image !== undefined) { updates.push('image = ?'); values.push(image); }
    if (resolvedStockMode !== undefined) { updates.push('stock_mode = ?'); values.push(resolvedStockMode); }
    if (resolvedTotalStock !== undefined) { updates.push('total_stock = ?'); values.push(resolvedTotalStock); }
    if (resolvedRemainingStock !== undefined) { updates.push('remaining_stock = ?'); values.push(resolvedRemainingStock); }
    if (resolvedIsAvailable !== undefined) { updates.push('is_available = ?'); values.push(resolvedIsAvailable ? 1 : 0); }
    if (tags !== undefined) { updates.push('tags = ?'); values.push(JSON.stringify(tags)); }

    if (updates.length === 0) {
        return res.status(400).json({ code: 400, message: '未提供可更新字段' });
    }

    try {
        const sql = `UPDATE dishes SET ${updates.join(', ')} WHERE id = ?`;
        values.push(id);
        await pool.query(sql, values);
        return res.json({ code: 200, message: '更新成功' });
    } catch (err) {
        console.error('更新菜品失败:', err);
        return res.status(500).json({ code: 500, message: '服务器错误' });
    }
});

// 获取操作审计日志（最近）
router.get('/audit/recent', requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const logs = [
            { id: 1, operator: '管理员A', action: '创建学校', target: '东莞理工', time: '2026-02-03 10:30', status: 'success' },
            { id: 2, operator: '管理员B', action: '编辑菜品', target: '麻辣香锅', time: '2026-02-03 09:15', status: 'success' },
            { id: 3, operator: '管理员C', action: '删除用户', target: 'user_123', time: '2026-02-03 08:45', status: 'success' }
        ];

        return res.json({
            code: 200,
            message: '获取操作日志成功',
            data: {
                logs: logs.slice(offset, offset + limit),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: logs.length,
                    pages: Math.ceil(logs.length / limit)
                }
            }
        });
    } catch (error) {
        console.error('获取操作日志失败:', error);
        return res.status(500).json({ code: 500, message: '服务器错误' });
    }
});

// 获取待审核内容列表
router.get('/audit/pending', requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const pendingItems = [
            { id: 1, title: '新菜品待审核', type: 'dish', author: '商户A', time: '2026-02-03 10:00' },
            { id: 2, title: '用户评价待审核', type: 'review', author: 'user_123', time: '2026-02-03 09:30' }
        ];

        return res.json({
            code: 200,
            message: '获取待审核列表成功',
            data: {
                items: pendingItems.slice(0, limit),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: pendingItems.length,
                    pages: Math.ceil(pendingItems.length / limit)
                }
            }
        });
    } catch (error) {
        console.error('获取待审核列表失败:', error);
        return res.status(500).json({ code: 500, message: '服务器错误' });
    }
});

module.exports = router;
