const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { adminAuthMiddleware, requirePermission } = require('../middleware/adminAuth');

/**
 * 获取待审核内容列表（超级管理员）
 * GET /api/content/pending
 * 支持搜索和分页
 */
router.get('/pending', adminAuthMiddleware, async (req, res) => {
    try {
        // 检查权限：只有超级管理员可以查看所有内容
        if (!req.adminContext || req.adminContext.role !== 'super_admin') {
            return res.status(403).json({ code: 403, message: '权限不足' });
        }

        const { page = 1, limit = 10, keyword = '', type = '' } = req.query;
        const offset = (page - 1) * limit;

        let where = ['status = ?'];
        let params = ['pending'];

        // 搜索条件
        if (keyword) {
            where.push(`(title LIKE ? OR author LIKE ? OR content LIKE ?)`);
            params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
        }

        // 类型筛选
        if (type) {
            where.push('content_type = ?');
            params.push(type);
        }

        const whereClause = where.join(' AND ');

        // 获取总数
        const countSql = `SELECT COUNT(*) as total FROM content_audit WHERE ${whereClause}`;
        const [countResult] = await pool.query(countSql, params);
        const total = countResult[0].total;

        // 获取列表数据
        const sql = `
            SELECT id, author, avatar, title, content, content_type, status, 
                   images, sensitive_words, tags, created_at, updated_at
            FROM content_audit 
            WHERE ${whereClause}
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        `;
        const queryParams = [...params, parseInt(limit), offset];
        const [contents] = await pool.query(sql, queryParams);

        // 处理返回数据格式
        const formattedContents = contents.map(item => ({
            ...item,
            images: item.images ? JSON.parse(item.images) : [],
            tags: item.tags ? JSON.parse(item.tags) : [],
            sensitiveWords: item.sensitive_words ? JSON.parse(item.sensitive_words) : [],
            time: new Date(item.created_at).toLocaleString('zh-CN'),
            type: item.content_type
        }));

        return res.json({
            code: 200,
            message: '获取待审核内容列表成功',
            data: {
                contents: formattedContents,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('获取待审核内容列表失败:', error);
        return res.status(500).json({ code: 500, message: '服务器错误' });
    }
});

/**
 * 获取内容详情
 * GET /api/content/:id
 */
router.get('/:id', adminAuthMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // 检查权限
        if (!req.adminContext || req.adminContext.role !== 'super_admin') {
            return res.status(403).json({ code: 403, message: '权限不足' });
        }

        const [rows] = await pool.query(
            `SELECT id, author, avatar, title, content, content_type, status, 
                    images, sensitive_words, tags, created_at, updated_at
             FROM content_audit WHERE id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ code: 404, message: '内容不存在' });
        }

        const item = rows[0];
        const formattedContent = {
            ...item,
            images: item.images ? JSON.parse(item.images) : [],
            tags: item.tags ? JSON.parse(item.tags) : [],
            sensitiveWords: item.sensitive_words ? JSON.parse(item.sensitive_words) : [],
            time: new Date(item.created_at).toLocaleString('zh-CN'),
            type: item.content_type
        };

        return res.json({
            code: 200,
            message: '获取内容详情成功',
            data: formattedContent
        });
    } catch (error) {
        console.error('获取内容详情失败:', error);
        return res.status(500).json({ code: 500, message: '服务器错误' });
    }
});

/**
 * 审核通过内容
 * POST /api/content/:id/approve
 */
router.post('/:id/approve', adminAuthMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        // 检查权限
        if (!req.adminContext || req.adminContext.role !== 'super_admin') {
            return res.status(403).json({ code: 403, message: '权限不足' });
        }

        // 更新内容状态
        await pool.query(
            `UPDATE content_audit SET status = 'approved', reviewed_by = ?, reviewed_at = NOW() WHERE id = ?`,
            [req.adminContext.id, id]
        );

        return res.json({
            code: 200,
            message: '内容审核通过成功'
        });
    } catch (error) {
        console.error('审核通过内容失败:', error);
        return res.status(500).json({ code: 500, message: '服务器错误' });
    }
});

/**
 * 审核拒绝内容
 * POST /api/content/:id/reject
 */
router.post('/:id/reject', adminAuthMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        // 检查权限
        if (!req.adminContext || req.adminContext.role !== 'super_admin') {
            return res.status(403).json({ code: 403, message: '权限不足' });
        }

        // 验证拒绝理由
        if (!reason) {
            return res.status(400).json({ code: 400, message: '拒绝理由为必填项' });
        }

        // 更新内容状态
        await pool.query(
            `UPDATE content_audit SET status = 'rejected', reject_reason = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?`,
            [reason, req.adminContext.id, id]
        );

        return res.json({
            code: 200,
            message: '内容拒绝成功'
        });
    } catch (error) {
        console.error('拒绝内容失败:', error);
        return res.status(500).json({ code: 500, message: '服务器错误' });
    }
});

/**
 * 获取内容审核统计
 * GET /api/content/stats/summary
 */
router.get('/stats/summary', adminAuthMiddleware, async (req, res) => {
    try {
        // 检查权限
        if (!req.adminContext || req.adminContext.role !== 'super_admin') {
            return res.status(403).json({ code: 403, message: '权限不足' });
        }

        const [stats] = await pool.query(`
            SELECT 
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendingCount,
                COUNT(CASE WHEN status = 'approved' AND DATE(reviewed_at) = CURDATE() THEN 1 END) as approvedToday,
                COUNT(CASE WHEN status = 'rejected' AND DATE(reviewed_at) = CURDATE() THEN 1 END) as rejectedToday
            FROM content_audit
        `);

        return res.json({
            code: 200,
            message: '获取审核统计成功',
            data: {
                pendingCount: stats[0].pendingCount,
                approvedToday: stats[0].approvedToday,
                rejectedToday: stats[0].rejectedToday
            }
        });
    } catch (error) {
        console.error('获取审核统计失败:', error);
        return res.status(500).json({ code: 500, message: '服务器错误' });
    }
});

module.exports = router;
