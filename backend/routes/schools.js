const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { adminAuthMiddleware, requirePermission } = require('../middleware/adminAuth');

/**
 * 获取学校列表（超级管理员）旧
 * GET /api/schools
 * 支持搜索和分页
 */
/*router.get('/', adminAuthMiddleware, async (req, res) => {
    try {
        // 检查权限：只有超级管理员可以查看所有学校
        if (!req.adminContext || req.adminContext.role !== 'super_admin') {
            return res.status(403).json({ code: 403, message: '权限不足' });
        }

        const { page = 1, limit = 10, keyword = '' } = req.query;
        const offset = (page - 1) * limit;

        let where = [];
        let params = [];

        // 搜索条件
        if (keyword) {
            where.push(`(name LIKE ? OR province LIKE ? OR city LIKE ?)`);
            params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
        }

        const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

        // 获取总数
        const countSql = `SELECT COUNT(*) as total FROM schools ${whereClause}`;
        const [countResult] = await pool.query(countSql, params);
        const total = countResult[0].total;

        // 获取列表数据
        const sql = `
            SELECT id, name, province, city, contact_name, contact_phone, 
                   address, description, created_at, updated_at
            FROM schools 
            ${whereClause}
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        `;
        params.push(parseInt(limit), offset);
        const [schools] = await pool.query(sql, params);

        return res.json({
            code: 200,
            message: '获取学校列表成功',
            data: {
                schools: schools,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('获取学校列表失败:', error);
        return res.status(500).json({ code: 500, message: '服务器错误' });
    }
});*/
/**
 * 获取学校列表（超级管理员）
 * GET /api/schools
 * 支持搜索和分页
 */
router.get('/', adminAuthMiddleware, async (req, res) => {
    try {
        if (!req.adminContext || req.adminContext.role !== 'super_admin') {
            return res.status(403).json({ code: 403, message: '权限不足' });
        }

        const { page = 1, limit = 10, keyword = '' } = req.query;
        const offset = (page - 1) * limit;

        let where = [];
        let params = [];

        if (keyword) {
            where.push(`(name LIKE ? OR province LIKE ? OR city LIKE ?)`);
            params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
        }

        const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

        // 总数查询：无需加status，不影响
        const countSql = `SELECT COUNT(*) as total FROM schools ${whereClause}`;
        const [countResult] = await pool.query(countSql, params);
        const total = countResult[0].total;

        // 列表查询：字段列表添加status ✅
        const sql = `
            SELECT id, name, province, city, contact_phone, 
                   address, status, created_at, updated_at  -- 新增status字段
            FROM schools 
            ${whereClause}
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        `;
        params.push(parseInt(limit), offset);
        const [schools] = await pool.query(sql, params);

        return res.json({
            code: 200,
            message: '获取学校列表成功',
            data: {
                schools: schools,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('获取学校列表失败:', error);
        return res.status(500).json({ code: 500, message: '服务器错误' });
    }
});


/**
 * 获取学校详情 旧
 * GET /api/schools/:id
 */
/*router.get('/:id', adminAuthMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // 检查权限
        if (!req.adminContext || req.adminContext.role !== 'super_admin') {
            return res.status(403).json({ code: 403, message: '权限不足' });
        }

        const [rows] = await pool.query(
            `SELECT id, name, province, city, contact_name, contact_phone, 
                    address, description, created_at, updated_at
             FROM schools WHERE id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ code: 404, message: '学校不存在' });
        }

        return res.json({
            code: 200,
            message: '获取学校详情成功',
            data: rows[0]
        });
    } catch (error) {
        console.error('获取学校详情失败:', error);
        return res.status(500).json({ code: 500, message: '服务器错误' });
    }
});*/

/**
 * 获取学校详情
 * GET /api/schools/:id
 */
router.get('/:id', adminAuthMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.adminContext || req.adminContext.role !== 'super_admin') {
            return res.status(403).json({ code: 403, message: '权限不足' });
        }

        // 字段列表添加status ✅
        const [rows] = await pool.query(
            `SELECT id, name, province, city, contact_phone, 
                    address, status, created_at, updated_at  -- 新增status字段
             FROM schools WHERE id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ code: 404, message: '学校不存在' });
        }

        return res.json({
            code: 200,
            message: '获取学校详情成功',
            data: rows[0]
        });
    } catch (error) {
        console.error('获取学校详情失败:', error);
        return res.status(500).json({ code: 500, message: '服务器错误' });
    }
});

/**
 * 创建学校
 * POST /api/schools
 */
router.post('/', adminAuthMiddleware, async (req, res) => {
    try {
        const { name, province = '', city = '', contact_phone = '', address = '' } = req.body;

        // 检查权限
        if (!req.adminContext || req.adminContext.role !== 'super_admin') {
            return res.status(403).json({ code: 403, message: '权限不足' });
        }

        // 验证必填字段
        if (!name) {
            return res.status(400).json({ code: 400, message: '学校名称为必填项' });
        }

                const [result] = await pool.query(
    `INSERT INTO schools (name, province, city, contact_phone, address, status)
     VALUES (?, ?, ?, ?, ?, 'pending')`,
    [name, province, city, contact_phone, address]
);

        return res.json({
            code: 200,
            message: '学校创建成功',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('创建学校失败:', error);
        return res.status(500).json({ code: 500, message: '服务器错误' });
    }
});

/**
 * 更新学校信息
 * PUT /api/schools/:id
 */
router.put('/:id', adminAuthMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, province, city, contact_phone, address } = req.body;

        // 检查权限
        if (!req.adminContext || req.adminContext.role !== 'super_admin') {
            return res.status(403).json({ code: 403, message: '权限不足' });
        }

        let updates = [];
        let values = [];

        if (name !== undefined) { updates.push('name = ?'); values.push(name); }
        if (province !== undefined) { updates.push('province = ?'); values.push(province); }
        if (city !== undefined) { updates.push('city = ?'); values.push(city); }
        if (contact_phone !== undefined) { updates.push('contact_phone = ?'); values.push(contact_phone); }
        if (address !== undefined) { updates.push('address = ?'); values.push(address); }

        if (updates.length === 0) {
            return res.status(400).json({ code: 400, message: '未提供可更新字段' });
        }

        updates.push('updated_at = NOW()');
        values.push(id);

        await pool.query(
            `UPDATE schools SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        return res.json({
            code: 200,
            message: '学校信息更新成功'
        });
    } catch (error) {
        console.error('更新学校信息失败:', error);
        return res.status(500).json({ code: 500, message: '服务器错误' });
    }
});

/**
 * 删除学校
 * DELETE /api/schools/:id
 */
router.delete('/:id', adminAuthMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // 检查权限
        if (!req.adminContext || req.adminContext.role !== 'super_admin') {
            return res.status(403).json({ code: 403, message: '权限不足' });
        }

        // 检查学校是否存在
        const [rows] = await pool.query('SELECT id FROM schools WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ code: 404, message: '学校不存在' });
        }

        // 检查是否有关联数据（商户、档口、用户）
        const [[merchant_count]] = await pool.query('SELECT COUNT(*) as count FROM merchants WHERE school_id = ?', [id]);
        if (merchant_count.count > 0) {
            return res.status(400).json({ code: 400, message: '学校下存在商户，无法删除' });
        }

        await pool.query('DELETE FROM schools WHERE id = ?', [id]);

        return res.json({
            code: 200,
            message: '学校已删除'
        });
    } catch (error) {
        console.error('删除学校失败:', error);
        return res.status(500).json({ code: 500, message: '服务器错误' });
    }
});

/**
 * 获取学校统计
 * GET /api/schools/:id/stats
 */
router.get('/:id/stats', adminAuthMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // 检查权限（超级管理员或该学校的管理员）
        if (!req.adminContext) {
            return res.status(403).json({ code: 403, message: '权限不足' });
        }

        const [schoolRows] = await pool.query('SELECT id FROM schools WHERE id = ?', [id]);
        if (schoolRows.length === 0) {
            return res.status(404).json({ code: 404, message: '学校不存在' });
        }

        const [[merchantCount]] = await pool.query('SELECT COUNT(*) as count FROM merchants WHERE school_id = ?', [id]);
        const [[stallCount]] = await pool.query('SELECT COUNT(*) as count FROM stalls WHERE school_id = ?', [id]);
        const [[userCount]] = await pool.query('SELECT COUNT(*) as count FROM users WHERE college LIKE ?', [`%${id}%`]);

        return res.json({
            code: 200,
            message: '获取学校统计成功',
            data: {
                merchantCount: merchantCount?.count || 0,
                stallCount: stallCount?.count || 0,
                userCount: userCount?.count || 0
            }
        });
    } catch (error) {
        console.error('获取学校统计失败:', error);
        return res.status(500).json({ code: 500, message: '服务器错误' });
    }
});


/**
 * 切换学校状态（核心新增：前端调用的/status接口）
 * PATCH /api/schools/:id/status
 * 超级管理员专属，支持pending/active/disabled三种状态互切
 */
router.patch('/:id/status', adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 接收前端传递的新状态（pending/active/disabled）

    // 1. 权限校验：仅超级管理员可操作
    if (!req.adminContext || req.adminContext.role !== 'super_admin') {
      return res.status(403).json({ code: 403, message: '权限不足，仅超级管理员可切换学校状态' });
    }

    // 2. 验证状态合法性：仅允许指定的三种状态
    const validStatus = ['pending', 'active', 'disabled'];
    if (!status || !validStatus.includes(status)) {
      return res.status(400).json({ code: 400, message: '状态值不合法，仅支持pending/active/disabled' });
    }

    // 3. 检查学校是否存在
    const [schoolRows] = await pool.query('SELECT id FROM schools WHERE id = ?', [id]);
    if (schoolRows.length === 0) {
      return res.status(404).json({ code: 404, message: '学校不存在，无法切换状态' });
    }

    // 4. 更新学校状态+更新时间
    await pool.query(
      'UPDATE schools SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    // 5. 返回前端预期的JSON响应（与其他接口格式保持一致）
    return res.json({
      code: 200,
      message: '学校状态切换成功',
      data: { newStatus: status } // 可选：返回新状态，方便前端校验
    });

  } catch (error) {
    console.error('切换学校状态失败:', error);
    return res.status(500).json({ code: 500, message: '服务器错误，切换状态失败' });
  }
});

module.exports = router;