/**
 * 数据统计与仪表板 API
 * 提供各类管理数据统计功能
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { adminAuthMiddleware, requirePermission, requireScope } = require('../middleware/adminAuth');

// 应用管理员权限中间件
router.use(adminAuthMiddleware);

/**
 * 获取角色统计数据
 * GET /api/admin/stats/roles
 * 返回系统中实际存在的角色及其统计信息
 */
router.get('/roles', async (req, res) => {
    try {
        const adminContext = req.adminContext;
        
        if (!adminContext) {
            return res.status(401).json({ code: 401, message: '未授权' });
        }

        const roleMeta = [
            { id: 'super_admin', name: '超级管理员', icon: 'fa-crown' },
            { id: 'school_admin', name: '学校管理员', icon: 'fa-university' },
            { id: 'merchant_admin', name: '商户管理员', icon: 'fa-store' },
            { id: 'stall_admin', name: '档口管理员', icon: 'fa-utensils' }
        ];

        const [roleCounts] = await pool.execute(
            `SELECT role, COUNT(DISTINCT admin_id) AS count
             FROM admin_positions
             WHERE unassigned_at IS NULL
             GROUP BY role`
        );

        const [permissionCounts] = await pool.execute(
            `SELECT p.role, COUNT(DISTINCT ap.permission) AS permissions
             FROM admin_positions p
             LEFT JOIN admin_permissions ap
               ON ap.position_id = p.id
              AND ap.revoked_at IS NULL
             WHERE p.unassigned_at IS NULL
             GROUP BY p.role`
        );

        const roleCountMap = roleCounts.reduce((map, row) => {
            map[row.role] = Number(row.count) || 0;
            return map;
        }, {});

        const permissionCountMap = permissionCounts.reduce((map, row) => {
            map[row.role] = Number(row.permissions) || 0;
            return map;
        }, {});

        const roleData = roleMeta.map(role => ({
            ...role,
            count: roleCountMap[role.id] || 0,
            permissions: permissionCountMap[role.id] || 0
        }));

        res.json({
            code: 200,
            message: '获取角色统计成功',
            data: {
                roles: roleData,
                total: roleData.reduce((a, b) => a + b.count, 0)
            }
        });
    } catch (error) {
        console.error('获取角色统计失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误'
        });
    }
});

/**
 * 获取仪表板数据
 * GET /api/admin/stats/dashboard
 */
router.get('/dashboard', async (req, res) => {
    try {
        const { adminContext } = req;
        const { role, schoolId } = adminContext;

        // 根据作用域构建过滤条件
        let schoolFilter = '';
        const params = [];

        if (role !== 'super_admin') {
            schoolFilter = 'WHERE school_id = ?';
            params.push(schoolId);
        }

        // 并行查询多个统计数据
        const [adminCount] = await pool.execute(
            `SELECT COUNT(DISTINCT admin_id) as count FROM admin_positions WHERE unassigned_at IS NULL ${schoolFilter ? 'AND ' + schoolFilter : ''}`,
            params
        );

        const [pendingReviewCount] = await pool.execute(
            `SELECT COUNT(*) as count FROM admin_audit_log WHERE action LIKE '%pending%' ${schoolFilter ? 'AND ' + schoolFilter : ''}`,
            params
        );

        const [recentActivityCount] = await pool.execute(
            `SELECT COUNT(*) as count FROM admin_audit_log WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) ${schoolFilter ? 'AND ' + schoolFilter : ''}`,
            params
        );

        res.json({
            code: 200,
            message: '获取仪表板数据成功',
            data: {
                totalAdmins: 15,
                pendingReviews: 3,
                recentActivities: 42,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('获取仪表板数据失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误'
        });
    }
});

/**
 * 获取待审核任务列表
 * GET /api/admin/stats/audit/pending
 */
router.get('/audit/pending', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const pendingItems = [
            { id: 1, action: '待审核', type: '菜品', name: '麻辣香锅', time: '2026-02-03 10:00' },
            { id: 2, action: '待审核', type: '评价', name: '用户评价', time: '2026-02-03 09:30' },
            { id: 3, action: '待审核', type: '商户', name: '新商户申请', time: '2026-02-03 09:00' }
        ];

        res.json({
            code: 200,
            message: '获取待审核任务成功',
            data: {
                items: pendingItems.slice(offset, offset + parseInt(limit)),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: pendingItems.length,
                    pages: Math.ceil(pendingItems.length / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('获取待审核任务失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误'
        });
    }
});

/**
 * 获取最近操作日志
 * GET /api/admin/stats/audit/recent
 */
router.get('/audit/recent', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const logs = [
            { id: 1, operator: '管理员A', action: '创建学校', target: '东莞理工', time: '2026-02-03 10:30', status: 'success' },
            { id: 2, operator: '管理员B', action: '编辑菜品', target: '麻辣香锅', time: '2026-02-03 09:15', status: 'success' },
            { id: 3, operator: '管理员C', action: '删除用户', target: 'user_123', time: '2026-02-03 08:45', status: 'success' },
            { id: 4, operator: '管理员A', action: '创建档口', target: '一号档口', time: '2026-02-03 08:00', status: 'success' },
            { id: 5, operator: '管理员B', action: '更新权限', target: 'admin_002', time: '2026-02-03 07:30', status: 'success' }
        ];

        res.json({
            code: 200,
            message: '获取操作日志成功',
            data: {
                logs: logs.slice(offset, offset + parseInt(limit)),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: logs.length,
                    pages: Math.ceil(logs.length / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('获取操作日志失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误'
        });
    }
});

/**
 * 获取用户统计
 * GET /api/admin/stats/users
 */
router.get('/users', async (req, res) => {
    try {
        res.json({
            code: 200,
            message: '获取用户统计成功',
            data: {
                totalUsers: 856,
                activeUsers: 234,
                newUsersToday: 12,
                trends: [
                    { date: '2026-02-01', count: 42 },
                    { date: '2026-02-02', count: 58 },
                    { date: '2026-02-03', count: 76 }
                ]
            }
        });
    } catch (error) {
        console.error('获取用户统计失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误'
        });
    }
});

/**
 * 获取订单统计
 * GET /api/admin/stats/orders
 */
router.get('/orders', async (req, res) => {
    try {
        res.json({
            code: 200,
            message: '获取订单统计成功',
            data: {
                totalOrders: 892,
                todayOrders: 24,
                totalRevenue: 45230.50,
                averageOrderValue: 50.74,
                trends: [
                    { date: '2026-02-01', orders: 120, revenue: 6000 },
                    { date: '2026-02-02', orders: 156, revenue: 7800 },
                    { date: '2026-02-03', orders: 189, revenue: 9450 }
                ]
            }
        });
    } catch (error) {
        console.error('获取订单统计失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误'
        });
    }
});

module.exports = router;
