const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const { adminAuthMiddleware } = require('../middleware/adminAuth');

// 防SQL注入：转义模糊查询的特殊字符
const escapeLike = (str) => str.replace(/%/g, '\\%').replace(/_/g, '\\_');
const ADMIN_ROLES = ['super_admin', 'school_admin', 'merchant_admin', 'stall_admin'];

async function getSchoolNameById(schoolId) {
  if (!schoolId) return null;
  const [rows] = await pool.query(`SELECT name FROM schools WHERE id = ? LIMIT 1`, [schoolId]);
  return rows[0]?.name || null;
}

async function getAdminActivePosition(adminId) {
  const [rows] = await pool.query(
    `SELECT ap.id, ap.role, ap.school_id, ap.merchant_node_id, ap.stall_id
     FROM admin_positions ap
     WHERE ap.admin_id = ? AND ap.unassigned_at IS NULL
     ORDER BY ap.assigned_at DESC LIMIT 1`,
    [adminId]
  );
  return rows[0] || null;
}

async function ensureAdminScope(operatorContext, targetAdminId) {
  const position = await getAdminActivePosition(targetAdminId);
  if (!position) return { allowed: false, reason: '管理员不存在或无有效职位' };
  if (position.role === 'super_admin') {
    return { allowed: false, reason: '不能操作平台管理员' };
  }

  const role = operatorContext?.role;
  if (role === 'super_admin') {
    return { allowed: true };
  }
  if (role === 'school_admin') {
    if (operatorContext.schoolId && operatorContext.schoolId === position.school_id) {
      return { allowed: true };
    }
    return { allowed: false, reason: '无权限操作该管理员' };
  }
  if (role === 'merchant_admin') {
    if (operatorContext.merchantNodeId && operatorContext.merchantNodeId === position.merchant_node_id) {
      return { allowed: true };
    }
    if (operatorContext.merchantNodeId && position.stall_id) {
      const [rows] = await pool.query(
        `SELECT id FROM stalls WHERE id = ? AND (merchant_node_id = ? OR merchant_id = ?)` ,
        [position.stall_id, operatorContext.merchantNodeId, operatorContext.merchantNodeId]
      );
      if (rows.length) {
        return { allowed: true };
      }
    }
    return { allowed: false, reason: '无权限操作该管理员' };
  }

  return { allowed: false, reason: '权限不足' };
}

function buildUserWhere({ status = '', role = '', keyword = '' }) {
  const where = [];
  const params = [];

  if (status) {
    where.push(`u.status = ?`);
    params.push(status);
  }

  if (role) {
    const mappedRole = role === 'student' || role === 'user' ? 'user' : null;
    if (!mappedRole) {
      where.push('1=0');
    } else {
      where.push(`u.role = ?`);
      params.push(mappedRole);
    }
  }

  if (keyword) {
    const escKeyword = escapeLike(keyword);
    where.push(`(u.username LIKE ? OR u.real_name LIKE ? OR u.student_id LIKE ? OR u.phone LIKE ?)`);
    params.push(`%${escKeyword}%`, `%${escKeyword}%`, `%${escKeyword}%`, `%${escKeyword}%`);
  }

  return { whereClause: where.length ? `WHERE ${where.join(' AND ')}` : '', params };
}

function buildAdminWhere({ status = '', role = '', keyword = '' }) {
  const where = [];
  const params = [];

  if (status) {
    const adminStatus = status === 'active' ? 'active' : 'disabled';
    where.push(`a.status = ?`);
    params.push(adminStatus);
  }

  if (role) {
    if (ADMIN_ROLES.includes(role)) {
      where.push(`ap.role = ?`);
      params.push(role);
    } else {
      where.push('1=0');
    }
  }

  if (keyword) {
    const escKeyword = escapeLike(keyword);
    where.push(`(a.username LIKE ? OR a.real_name LIKE ? OR a.email LIKE ? OR a.phone LIKE ?)`);
    params.push(`%${escKeyword}%`, `%${escKeyword}%`, `%${escKeyword}%`, `%${escKeyword}%`);
  }

  return { whereClause: where.length ? `AND ${where.join(' AND ')}` : '', params };
}

/**
 * 获取用户列表（按管理员角色范围）
 * GET /api/users?page=1&limit=10&status=&role=&keyword=
 */
router.get('/', adminAuthMiddleware, async (req, res) => {
  try {
    if (!req.adminContext || !req.adminContext.role) {
      return res.status(403).json({ code: 403, message: '权限不足' });
    }

    const { page = 1, limit = 10, status = '', role = '', keyword = '' } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
    const offset = (pageNum - 1) * limitNum;
    const scopeRole = req.adminContext.role;

    let total = 0;
    let users = [];

    if (scopeRole === 'super_admin') {
      const userFilter = buildUserWhere({ status, role, keyword });
      const adminFilter = buildAdminWhere({ status, role, keyword });

            const usersQuery = `
         SELECT u.id, u.username, u.real_name, NULL AS email, u.phone, u.student_id, u.college, u.school,
           NULL AS identity_label, NULL AS identity_suffix,
           'student' AS role, u.status, u.created_at, u.updated_at, 'user' AS user_type
         FROM users u ${userFilter.whereClause}
            `;

            const adminsQuery = `
         SELECT a.id, a.username, a.real_name, a.email, a.phone, NULL AS student_id, NULL AS college,
           s.name AS school, COALESCE(ap.role, 'admin') AS role,
           a.identity_label, a.identity_suffix,
               CASE WHEN a.status = 'disabled' THEN 'inactive' ELSE 'active' END AS status,
               a.created_at, a.updated_at, 'admin' AS user_type
        FROM admin_users a
        LEFT JOIN admin_positions ap ON ap.id = (
          SELECT ap2.id FROM admin_positions ap2
          WHERE ap2.admin_id = a.id AND ap2.unassigned_at IS NULL
          ORDER BY ap2.assigned_at DESC LIMIT 1
        )
        LEFT JOIN schools s ON s.id = ap.school_id
        WHERE a.deleted_at IS NULL ${adminFilter.whereClause}
      `;

      const baseQuery = `${usersQuery} UNION ALL ${adminsQuery}`;
      const baseParams = [...userFilter.params, ...adminFilter.params];

      const [countRes] = await pool.query(`SELECT COUNT(*) as total FROM (${baseQuery}) AS t`, baseParams);
      total = countRes[0]?.total || 0;

      const [rows] = await pool.query(
        `SELECT * FROM (${baseQuery}) AS t ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...baseParams, limitNum, offset]
      );
      users = rows;
    } else if (scopeRole === 'school_admin') {
      const schoolName = await getSchoolNameById(req.adminContext.schoolId);
      if (!schoolName) {
        return res.json({
          code: 200,
          message: '获取成功',
          data: { users: [], pagination: { page: pageNum, limit: limitNum, total: 0, pages: 0 } }
        });
      }

      const userFilter = buildUserWhere({ status, role, keyword });
      const schoolClause = userFilter.whereClause ? `${userFilter.whereClause} AND u.school = ?` : 'WHERE u.school = ?';
      const params = [...userFilter.params, schoolName];

      const [countRes] = await pool.query(`SELECT COUNT(*) as total FROM users u ${schoolClause}`, params);
      total = countRes[0]?.total || 0;
      const [rows] = await pool.query(
        `SELECT u.id, u.username, u.real_name, NULL AS email, u.phone, u.student_id, u.college, u.school,
                NULL AS identity_label, NULL AS identity_suffix,
                'student' AS role, u.status, u.created_at, u.updated_at, 'user' AS user_type
         FROM users u ${schoolClause} ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
        [...params, limitNum, offset]
      );
      users = rows;
    } else if (scopeRole === 'merchant_admin' || scopeRole === 'stall_admin') {
      const scopeField = scopeRole === 'merchant_admin' ? 'merchant_node_id' : 'stall_id';
      const scopeValue = scopeRole === 'merchant_admin' ? req.adminContext.merchantNodeId : req.adminContext.stallId;

      if (!scopeValue) {
        return res.json({
          code: 200,
          message: '获取成功',
          data: { users: [], pagination: { page: pageNum, limit: limitNum, total: 0, pages: 0 } }
        });
      }

      const adminFilter = buildAdminWhere({ status, role, keyword });
      const [countRes] = await pool.query(
        `SELECT COUNT(DISTINCT a.id) as total
         FROM admin_users a
         JOIN admin_positions ap ON ap.admin_id = a.id AND ap.unassigned_at IS NULL AND ap.${scopeField} = ?
         WHERE a.deleted_at IS NULL ${adminFilter.whereClause}`,
        [scopeValue, ...adminFilter.params]
      );
      total = countRes[0]?.total || 0;

      const [rows] = await pool.query(
        `SELECT a.id, a.username, a.real_name, a.email, a.phone, NULL AS student_id, NULL AS college,
                s.name AS school, COALESCE(ap.role, 'admin') AS role,
                a.identity_label, a.identity_suffix,
                CASE WHEN a.status = 'disabled' THEN 'inactive' ELSE 'active' END AS status,
                a.created_at, a.updated_at, 'admin' AS user_type
         FROM admin_users a
         JOIN admin_positions ap ON ap.admin_id = a.id AND ap.unassigned_at IS NULL AND ap.${scopeField} = ?
         LEFT JOIN schools s ON s.id = ap.school_id
         WHERE a.deleted_at IS NULL ${adminFilter.whereClause}
         GROUP BY a.id
         ORDER BY a.created_at DESC LIMIT ? OFFSET ?`,
        [scopeValue, ...adminFilter.params, limitNum, offset]
      );
      users = rows;
    } else {
      return res.status(403).json({ code: 403, message: '权限不足' });
    }

    const formatUsers = users.map(u => ({
      ...u,
      registerDate: u.created_at ? new Date(u.created_at).toISOString().split('T')[0] : '-',
      lastLogin: u.updated_at ? new Date(u.updated_at).toISOString().replace('T', ' ').slice(0,16) : '-'
    }));

    res.json({
      code: 200,
      message: '获取成功',
      data: { users: formatUsers, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total/limitNum) } }
    });
  } catch (err) {
    console.error('获取用户列表失败:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

/**
 * 获取普通用户详情（超级管理员/学校管理员）
 * GET /api/users/:id
 */
router.get('/:id', adminAuthMiddleware, async (req, res) => {
  try {
    if (!req.adminContext || !req.adminContext.role) {
      return res.status(403).json({ code: 403, message: '权限不足' });
    }
    const { id } = req.params;
    if (!/^\d+$/.test(id)) return res.status(400).json({ code: 400, message: 'ID必须为数字' });

    if (req.adminContext.role !== 'super_admin') {
      if (req.adminContext.role !== 'school_admin') {
        return res.status(403).json({ code: 403, message: '权限不足' });
      }
      const schoolName = await getSchoolNameById(req.adminContext.schoolId);
      if (!schoolName) {
        return res.status(403).json({ code: 403, message: '权限不足' });
      }
      const [scopeRows] = await pool.query(`SELECT id FROM users WHERE id = ? AND school = ?`, [id, schoolName]);
      if (!scopeRows.length) return res.status(403).json({ code: 403, message: '无权限查看该用户' });
    }

    const [rows] = await pool.query(`
      SELECT id, username, real_name, phone, student_id, college, major, grade, class_name, role, status, created_at, updated_at
      FROM users WHERE id = ?
    `, [id]);
    if (!rows.length) return res.status(404).json({ code: 404, message: '用户不存在' });

    res.json({ code: 200, message: '获取成功', data: rows[0] });
  } catch (err) {
    console.error('获取用户详情失败:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

/**
 * 更新普通用户状态（超级管理员/学校管理员）
 * PUT /api/users/:id/status { status: 'active/inactive/banned' }
 */
router.put('/:id/status', adminAuthMiddleware, async (req, res) => {
  try {
    if (!req.adminContext || !req.adminContext.role) {
      return res.status(403).json({ code: 403, message: '权限不足' });
    }
    const { id } = req.params;
    const { status, userType } = req.body;
    if (!/^\d+$/.test(id)) return res.status(400).json({ code: 400, message: 'ID必须为数字' });
    if (!['active', 'inactive', 'banned'].includes(status)) {
      return res.status(400).json({ code: 400, message: '状态仅支持active/inactive/banned' });
    }

    if (userType === 'admin') {
      const scope = await ensureAdminScope(req.adminContext, parseInt(id));
      if (!scope.allowed) {
        return res.status(403).json({ code: 403, message: scope.reason || '权限不足' });
      }

      const [adminRes] = await pool.query(`SELECT id FROM admin_users WHERE id = ? AND deleted_at IS NULL`, [id]);
      if (!adminRes.length) return res.status(404).json({ code: 404, message: '管理员不存在' });

      const adminStatus = status === 'active' ? 'active' : 'disabled';
      await pool.query(`UPDATE admin_users SET status = ?, updated_at = NOW() WHERE id = ?`, [adminStatus, id]);
      return res.json({ code: 200, message: '状态更新成功' });
    }

    if (req.adminContext.role !== 'super_admin') {
      if (req.adminContext.role !== 'school_admin') {
        return res.status(403).json({ code: 403, message: '权限不足' });
      }
      const schoolName = await getSchoolNameById(req.adminContext.schoolId);
      if (!schoolName) {
        return res.status(403).json({ code: 403, message: '权限不足' });
      }
      const [scopeRows] = await pool.query(`SELECT id FROM users WHERE id = ? AND school = ?`, [id, schoolName]);
      if (!scopeRows.length) return res.status(403).json({ code: 403, message: '无权限操作该用户' });
    }

    const [userRes] = await pool.query(`SELECT id FROM users WHERE id = ?`, [id]);
    if (!userRes.length) return res.status(404).json({ code: 404, message: '用户不存在' });

    await pool.query(`UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?`, [status, id]);
    res.json({ code: 200, message: '状态更新成功' });
  } catch (err) {
    console.error('更新用户状态失败:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

/**
 * 批量禁用普通用户（仅超级管理员）
 * POST /api/users/batch/disable { ids: [1,2,3] }
 */
router.post('/batch/disable', adminAuthMiddleware, async (req, res) => {
  try {
    if (!req.adminContext || req.adminContext.role !== 'super_admin') {
      return res.status(403).json({ code: 403, message: '权限不足' });
    }
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ code: 400, message: 'ID列表不能为空' });
    }
    const validIds = [...new Set(ids.filter(id => /^\d+$/.test(id) && parseInt(id) > 0))];
    if (validIds.length === 0) return res.status(400).json({ code: 400, message: '无有效ID' });

    // 筛选存在的ID
    const [existRes] = await pool.query(`SELECT id FROM users WHERE id IN (${validIds.map(() => '?').join(',')})`, validIds);
    const existIds = existRes.map(r => r.id);
    if (existIds.length === 0) return res.status(404).json({ code: 404, message: '所选用户均不存在' });

    await pool.query(`UPDATE users SET status = 'banned', updated_at = NOW() WHERE id IN (${existIds.map(() => '?').join(',')})`, existIds);
    res.json({ code: 200, message: `已禁用${existIds.length}个用户`, data: { successIds: existIds } });
  } catch (err) {
    console.error('批量禁用用户失败:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

/**
 * 重置普通用户密码（超级管理员/学校管理员）
 * POST /api/users/:id/reset-password
 */
router.post('/:id/reset-password', adminAuthMiddleware, async (req, res) => {
  try {
    if (!req.adminContext || !req.adminContext.role) {
      return res.status(403).json({ code: 403, message: '权限不足' });
    }
    const { id } = req.params;
    const { userType } = req.body;
    if (!/^\d+$/.test(id)) return res.status(400).json({ code: 400, message: 'ID必须为数字' });

    if (userType === 'admin') {
      const scope = await ensureAdminScope(req.adminContext, parseInt(id));
      if (!scope.allowed) {
        return res.status(403).json({ code: 403, message: scope.reason || '权限不足' });
      }

      const [adminRes] = await pool.query(`SELECT id FROM admin_users WHERE id = ? AND deleted_at IS NULL`, [id]);
      if (!adminRes.length) return res.status(404).json({ code: 404, message: '管理员不存在' });

      const defaultPwd = '123456';
      const hashPwd = await bcrypt.hash(defaultPwd, 10);
      await pool.query(`UPDATE admin_users SET password_hash = ?, updated_at = NOW() WHERE id = ?`, [hashPwd, id]);

      return res.json({ code: 200, message: '密码已重置为默认密码，请提醒用户及时修改' });
    }

    if (req.adminContext.role !== 'super_admin') {
      if (req.adminContext.role !== 'school_admin') {
        return res.status(403).json({ code: 403, message: '权限不足' });
      }
      const schoolName = await getSchoolNameById(req.adminContext.schoolId);
      if (!schoolName) {
        return res.status(403).json({ code: 403, message: '权限不足' });
      }
      const [scopeRows] = await pool.query(`SELECT id FROM users WHERE id = ? AND school = ?`, [id, schoolName]);
      if (!scopeRows.length) return res.status(403).json({ code: 403, message: '无权限操作该用户' });
    }

    const [userRes] = await pool.query(`SELECT id FROM users WHERE id = ?`, [id]);
    if (!userRes.length) return res.status(404).json({ code: 404, message: '用户不存在' });

    const defaultPwd = '123456';
    const hashPwd = await bcrypt.hash(defaultPwd, 10);
    await pool.query(`UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?`, [hashPwd, id]);

    res.json({ code: 200, message: '密码已重置为默认密码，请提醒用户及时修改' });
  } catch (err) {
    console.error('重置密码失败:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

/**
 * 获取用户统计（按管理员角色范围）
 * GET /api/users/stats/summary
 */
router.get('/stats/summary', adminAuthMiddleware, async (req, res) => {
  try {
    if (!req.adminContext || !req.adminContext.role) {
      return res.status(403).json({ code: 403, message: '权限不足' });
    }

    const scopeRole = req.adminContext.role;
    let totalUsers = 0;
    let activeUsers = 0;
    let newUsers = 0;
    let bannedUsers = 0;

    if (scopeRole === 'super_admin') {
      const [userTotal] = await pool.query(`SELECT COUNT(*) as total FROM users`);
      const [userActive] = await pool.query(`SELECT COUNT(*) as active FROM users WHERE status = 'active'`);
      const [userNew] = await pool.query(`SELECT COUNT(*) as new FROM users WHERE DATE(created_at) = CURDATE()`);
      const [userBanned] = await pool.query(`SELECT COUNT(*) as banned FROM users WHERE status = 'banned'`);
      const [adminTotal] = await pool.query(`SELECT COUNT(*) as total FROM admin_users WHERE deleted_at IS NULL`);
      const [adminActive] = await pool.query(`SELECT COUNT(*) as active FROM admin_users WHERE status = 'active' AND deleted_at IS NULL`);
      const [adminNew] = await pool.query(`SELECT COUNT(*) as new FROM admin_users WHERE DATE(created_at) = CURDATE() AND deleted_at IS NULL`);

      totalUsers = (userTotal[0]?.total || 0) + (adminTotal[0]?.total || 0);
      activeUsers = (userActive[0]?.active || 0) + (adminActive[0]?.active || 0);
      newUsers = (userNew[0]?.new || 0) + (adminNew[0]?.new || 0);
      bannedUsers = userBanned[0]?.banned || 0;
    } else if (scopeRole === 'school_admin') {
      const schoolName = await getSchoolNameById(req.adminContext.schoolId);
      if (schoolName) {
        const [totalRes] = await pool.query(`SELECT COUNT(*) as total FROM users WHERE school = ?`, [schoolName]);
        const [activeRes] = await pool.query(`SELECT COUNT(*) as active FROM users WHERE school = ? AND status = 'active'`, [schoolName]);
        const [newRes] = await pool.query(`SELECT COUNT(*) as new FROM users WHERE school = ? AND DATE(created_at) = CURDATE()`, [schoolName]);
        const [bannedRes] = await pool.query(`SELECT COUNT(*) as banned FROM users WHERE school = ? AND status = 'banned'`, [schoolName]);

        totalUsers = totalRes[0]?.total || 0;
        activeUsers = activeRes[0]?.active || 0;
        newUsers = newRes[0]?.new || 0;
        bannedUsers = bannedRes[0]?.banned || 0;
      }
    } else if (scopeRole === 'merchant_admin' || scopeRole === 'stall_admin') {
      const scopeField = scopeRole === 'merchant_admin' ? 'merchant_node_id' : 'stall_id';
      const scopeValue = scopeRole === 'merchant_admin' ? req.adminContext.merchantNodeId : req.adminContext.stallId;
      if (scopeValue) {
        const [totalRes] = await pool.query(
          `SELECT COUNT(DISTINCT a.id) as total
           FROM admin_users a
           JOIN admin_positions ap ON ap.admin_id = a.id AND ap.unassigned_at IS NULL AND ap.${scopeField} = ?
           WHERE a.deleted_at IS NULL`,
          [scopeValue]
        );
        const [activeRes] = await pool.query(
          `SELECT COUNT(DISTINCT a.id) as active
           FROM admin_users a
           JOIN admin_positions ap ON ap.admin_id = a.id AND ap.unassigned_at IS NULL AND ap.${scopeField} = ?
           WHERE a.deleted_at IS NULL AND a.status = 'active'`,
          [scopeValue]
        );
        const [newRes] = await pool.query(
          `SELECT COUNT(DISTINCT a.id) as new
           FROM admin_users a
           JOIN admin_positions ap ON ap.admin_id = a.id AND ap.unassigned_at IS NULL AND ap.${scopeField} = ?
           WHERE a.deleted_at IS NULL AND DATE(a.created_at) = CURDATE()`,
          [scopeValue]
        );

        totalUsers = totalRes[0]?.total || 0;
        activeUsers = activeRes[0]?.active || 0;
        newUsers = newRes[0]?.new || 0;
        bannedUsers = 0;
      }
    } else {
      return res.status(403).json({ code: 403, message: '权限不足' });
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        totalUsers,
        activeUsers,
        newUsers,
        bannedUsers
      }
    });
  } catch (err) {
    console.error('获取用户统计失败:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router;