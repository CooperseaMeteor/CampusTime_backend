/**
 * 管理员管理 API 路由
 * 包括：创建管理员、查询列表、调岗、权限审批等
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const {
  adminAuthMiddleware,
  requirePermission,
  requireScope,
  preventSelfModification,
  auditLog
} = require('../middleware/adminAuth');

router.use(adminAuthMiddleware);

const ROLE_LEVEL = {
  super_admin: 0,
  school_admin: 1,
  merchant_admin: 2,
  stall_admin: 3
};

const DEFAULT_ROLE_PERMISSIONS = {
  super_admin: [
    'org.school.create', 'org.school.update', 'org.school.disable',
    'org.merchant.create', 'org.merchant.update', 'org.merchant.move', 'org.merchant.disable',
    'org.stall.create', 'org.stall.update', 'org.stall.move', 'org.stall.disable',
    'admin.create', 'admin.update', 'admin.disable', 'admin.assign', 'admin.unassign',
    'admin.grant', 'admin.role', 'admin.manage_peer', 'admin.identity.approve', 'admin.audit',
    'content.announce.create', 'content.announce.update', 'content.announce.publish',
    'content.ai.generate', 'content.topic.manage',
    'review.audit', 'review.reject', 'review.delete', 'review.sensitive.manage', 'review.blacklist',
    'data.dashboard.view', 'data.report.view', 'data.export',
    'dish.create', 'dish.update', 'dish.delete',
    'stock.mode', 'stock.update', 'price.update'
  ],
  school_admin: [
    'org.school.update',
    'org.merchant.create', 'org.merchant.update', 'org.merchant.move', 'org.merchant.disable',
    'org.stall.create', 'org.stall.update', 'org.stall.move', 'org.stall.disable',
    'admin.create', 'admin.assign', 'admin.grant', 'admin.disable', 'admin.audit',
    'content.announce.create', 'content.announce.update', 'content.announce.publish',
    'review.audit', 'review.reject', 'review.delete', 'review.sensitive.manage', 'review.blacklist',
    'data.dashboard.view', 'data.report.view', 'data.export',
    'dish.create', 'dish.update', 'dish.delete',
    'stock.mode', 'stock.update', 'price.update'
  ],
  merchant_admin: [
    'org.merchant.create', 'org.merchant.update', 'org.merchant.move', 'org.merchant.disable',
    'org.stall.create', 'org.stall.update', 'org.stall.move', 'org.stall.disable',
    'admin.create', 'admin.assign', 'admin.grant', 'admin.disable', 'admin.audit',
    'content.announce.create', 'content.announce.update', 'content.announce.publish',
    'review.audit', 'review.reject', 'review.delete',
    'data.dashboard.view', 'data.report.view', 'data.export',
    'dish.create', 'dish.update', 'dish.delete',
    'stock.mode', 'stock.update', 'price.update'
  ],
  stall_admin: [
    'dish.create', 'dish.update', 'dish.delete',
    'stock.mode', 'stock.update', 'price.update',
    'review.audit', 'review.reject', 'review.delete',
    'data.dashboard.view', 'data.report.view'
  ]
};

async function getRoleTemplatePermissions(connection, role) {
  try {
    const [rows] = await connection.execute(
      'SELECT permission FROM role_template_permissions WHERE role = ? AND is_default = 1',
      [role]
    );
    if (rows.length > 0) {
      return rows.map(r => r.permission);
    }
  } catch (err) {
    // 忽略，使用默认模板
  }
  return DEFAULT_ROLE_PERMISSIONS[role] || [];
}

function canManageRole(operatorRole, targetRole, canManagePeer) {
  if (!ROLE_LEVEL.hasOwnProperty(operatorRole) || !ROLE_LEVEL.hasOwnProperty(targetRole)) {
    return false;
  }
  if (operatorRole === targetRole) {
    return !!canManagePeer;
  }
  return ROLE_LEVEL[operatorRole] < ROLE_LEVEL[targetRole];
}

function validateRoleScope(role, scope) {
  if (role === 'school_admin' && !scope.school_id) return '学校管理员必须指定 school_id';
  if (role === 'merchant_admin' && !scope.merchant_node_id) return '商户管理员必须指定 merchant_node_id';
  if (role === 'stall_admin' && !scope.stall_id) return '档口管理员必须指定 stall_id';
  return null;
}

function isScopeAllowed(context, role, scope) {
  if (!context || context.role === 'super_admin') return true;
  if (context.role === 'school_admin') {
    return scope.school_id && context.schoolId === scope.school_id;
  }
  if (context.role === 'merchant_admin') {
    return scope.merchant_node_id && context.merchantNodeId === scope.merchant_node_id;
  }
  if (context.role === 'stall_admin') {
    return scope.stall_id && context.stallId === scope.stall_id;
  }
  return false;
}

/**
 * GET /api/admin/management/list
 * 获取管理员列表（带职位和权限）
 */
router.get('/list', requirePermission('admin.audit'), async (req, res) => {
    try {
        const connection = await pool.getConnection();
    const context = req.adminContext || {};
    const { role, schoolId, merchantNodeId, stallId } = context;

    const scopeWhere = ["au.status IN ('active','disabled')", 'ap.unassigned_at IS NULL'];
    const scopeParams = [];
    if (role === 'school_admin') {
      scopeWhere.push(`(
        ap.school_id = ?
        OR ap.merchant_node_id IN (SELECT id FROM merchants WHERE school_id = ?)
        OR ap.stall_id IN (
          SELECT id FROM stalls
          WHERE merchant_id IN (SELECT id FROM merchants WHERE school_id = ?)
             OR merchant_node_id IN (SELECT id FROM merchants WHERE school_id = ?)
        )
      )`);
      scopeParams.push(schoolId || 0, schoolId || 0, schoolId || 0, schoolId || 0);
    } else if (role === 'merchant_admin') {
      scopeWhere.push(`(
        ap.merchant_node_id = ?
        OR ap.stall_id IN (
          SELECT id FROM stalls
          WHERE merchant_node_id = ? OR merchant_id = ?
        )
      )`);
      scopeParams.push(merchantNodeId || 0, merchantNodeId || 0, merchantNodeId || 0);
    } else if (role === 'stall_admin') {
      scopeWhere.push('ap.stall_id = ?');
      scopeParams.push(stallId || 0);
    }

        // 查询所有管理员及其职位
        const [admins] = await connection.execute(`
          SELECT DISTINCT
            au.id,
            au.username,
            au.real_name,
            au.phone,
            au.email,
            au.identity_label,
            au.identity_suffix,
            au.identity_suffix_status,
            au.status,
            au.created_at
          FROM admin_users au
          JOIN admin_positions ap ON ap.admin_id = au.id
          WHERE ${scopeWhere.join(' AND ')}
          ORDER BY au.created_at DESC
        `, scopeParams);

        // 为每个管理员查询职位
        for (const admin of admins) {
            const positionWhere = ['ap.admin_id = ?', 'ap.unassigned_at IS NULL'];
            const positionParams = [admin.id];
            if (role === 'school_admin') {
              positionWhere.push(`(
                ap.school_id = ?
                OR ap.merchant_node_id IN (SELECT id FROM merchants WHERE school_id = ?)
                OR ap.stall_id IN (
                  SELECT id FROM stalls
                  WHERE merchant_id IN (SELECT id FROM merchants WHERE school_id = ?)
                     OR merchant_node_id IN (SELECT id FROM merchants WHERE school_id = ?)
                )
              )`);
              positionParams.push(schoolId || 0, schoolId || 0, schoolId || 0, schoolId || 0);
            } else if (role === 'merchant_admin') {
              positionWhere.push(`(
                ap.merchant_node_id = ?
                OR ap.stall_id IN (
                  SELECT id FROM stalls
                  WHERE merchant_node_id = ? OR merchant_id = ?
                )
              )`);
              positionParams.push(merchantNodeId || 0, merchantNodeId || 0, merchantNodeId || 0);
            } else if (role === 'stall_admin') {
              positionWhere.push('ap.stall_id = ?');
              positionParams.push(stallId || 0);
            }

            const [positions] = await connection.execute(`
                SELECT 
                    ap.id,
                    ap.role,
                    ap.school_id,
                    ap.merchant_node_id,
                    ap.stall_id,
                    s.name as school_name
                FROM admin_positions ap
                LEFT JOIN schools s ON ap.school_id = s.id
                WHERE ${positionWhere.join(' AND ')}
            `, positionParams);

            admin.positions = positions;
        }

        connection.release();

        res.json({
            code: 200,
            data: admins
        });

    } catch (error) {
        console.error('获取管理员列表失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误'
        });
    }
});

/**
 * GET /api/admin/management/permissions/available
 * 获取可授予权限列表（角色模板 ∩ 操作员权限）
 */
router.get('/permissions/available', requirePermission('admin.grant'), async (req, res) => {
  try {
    const { role } = req.query;
    if (!role) {
      return res.status(400).json({ code: 400, message: '缺少 role 参数' });
    }

    const connection = await pool.getConnection();
    const templatePerms = await getRoleTemplatePermissions(connection, role);
    connection.release();

    const operatorPerms = req.adminContext?.permissions || [];
    const available = operatorPerms.includes('*')
      ? templatePerms
      : templatePerms.filter(p => operatorPerms.includes(p));

    res.json({ code: 200, data: { role, template: templatePerms, available, operator: operatorPerms } });
  } catch (err) {
    console.error('获取可用权限失败:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

/**
 * POST /api/admin/management/create
 * 创建新管理员
 */
router.post('/create', requirePermission('admin.create'), auditLog('create_admin', 'admin'), async (req, res) => {
    try {
        const {
            username,
            password,
            real_name,
            phone,
            email,
            identity_label,
            identity_suffix,
            role,
            school_id,
            merchant_node_id,
          stall_id,
          permissions
        } = req.body;

        // 验证必填字段
        if (!username || !password || !real_name || !identity_label || !role) {
            return res.status(400).json({
                code: 400,
                message: '缺少必填字段'
            });
        }

        const connection = await pool.getConnection();
        const context = req.adminContext || {};
        const operatorRole = context.role;
        const operatorPerms = context.permissions || [];
        const canManagePeer = operatorPerms.includes('admin.manage_peer') || operatorPerms.includes('*');

        if (!canManageRole(operatorRole, role, canManagePeer)) {
          connection.release();
          return res.status(403).json({
            code: 403,
            message: '无权限创建该角色管理员'
          });
        }

        const scopeError = validateRoleScope(role, { school_id, merchant_node_id, stall_id });
        if (scopeError) {
          connection.release();
          return res.status(400).json({ code: 400, message: scopeError });
        }

        if (!isScopeAllowed(context, role, { school_id, merchant_node_id, stall_id })) {
          connection.release();
          return res.status(403).json({ code: 403, message: '作用域不在可管理范围内' });
        }

        if (role === 'super_admin' && operatorRole !== 'super_admin') {
          connection.release();
          return res.status(403).json({
            code: 403,
            message: '无权限创建超级管理员'
          });
        }

        try {
            await connection.beginTransaction();

            // 检查用户名是否已存在
            const [existing] = await connection.execute(
                'SELECT id FROM admin_users WHERE username = ?',
                [username]
            );

            if (existing.length > 0) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    code: 400,
                    message: '用户名已存在'
                });
            }

            // 加密密码
            const password_hash = await bcrypt.hash(password, 10);

            // 创建管理员账号
            const [result] = await connection.execute(
                `INSERT INTO admin_users 
                (username, password_hash, real_name, phone, email, identity_label, identity_suffix, identity_suffix_status, status, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
                [username, password_hash, real_name, phone, email, identity_label, identity_suffix || null, 
               identity_suffix ? 'approved' : 'draft', req.admin?.id || 1]
            );

            const adminId = result.insertId;

            // 创建职位绑定
            const [posResult] = await connection.execute(
              `INSERT INTO admin_positions 
              (admin_id, role, school_id, merchant_node_id, stall_id, assigned_by)
              VALUES (?, ?, ?, ?, ?, ?)` ,
              [adminId, role, school_id || null, merchant_node_id || null, stall_id || null, req.admin?.id || 1]
            );

            const positionId = posResult.insertId;

            // 默认权限 = 操作者权限 ∩ 角色模板权限
            const templatePerms = await getRoleTemplatePermissions(connection, role);
            const basePerms = operatorPerms.includes('*')
              ? templatePerms
              : templatePerms.filter(p => operatorPerms.includes(p));
            const desiredPerms = Array.isArray(permissions) ? permissions : [];
            const allowedPerms = desiredPerms.length > 0
              ? basePerms.filter(p => desiredPerms.includes(p))
              : basePerms;

            if (allowedPerms.length > 0) {
              const values = allowedPerms.map(p => [positionId, p, req.admin?.id || 1]);
              await connection.query(
                'INSERT INTO admin_permissions (position_id, permission, granted_by) VALUES ?' ,
                [values]
              );
            }

            await connection.commit();
            connection.release();

            res.json({
                code: 200,
                message: '创建成功',
              data: { adminId, positionId }
            });

        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }

    } catch (error) {
        console.error('创建管理员失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * GET /api/admin/management/:id/detail
 * 获取管理员详情
 */
router.get('/:id/detail', requirePermission('admin.audit'), async (req, res) => {
  try {
    const adminId = parseInt(req.params.id);
    const [admins] = await pool.execute(
      `SELECT id, username, real_name, phone, email, identity_label, identity_suffix,
          identity_suffix_status, identity_suffix_approver_id, identity_suffix_approved_at,
          identity_suffix_rejected_reason, status, created_by, created_at, updated_at
       FROM admin_users WHERE id = ?`,
      [adminId]
    );

    if (!admins || admins.length === 0) {
      return res.status(404).json({ code: 404, message: '管理员不存在' });
    }

    const admin = admins[0];

    const [positions] = await pool.execute(
      `SELECT ap.id, ap.role, ap.school_id, ap.merchant_node_id, ap.stall_id, ap.assigned_at, ap.unassigned_at,
          s.name AS school_name, m.name AS merchant_name, st.name AS stall_name
       FROM admin_positions ap
       LEFT JOIN schools s ON ap.school_id = s.id
       LEFT JOIN merchants m ON ap.merchant_node_id = m.id
       LEFT JOIN stalls st ON ap.stall_id = st.id
       WHERE ap.admin_id = ?
       ORDER BY ap.assigned_at DESC`,
      [adminId]
    );

    const positionIds = positions.map(p => p.id);
    let permissionMap = {};
    if (positionIds.length > 0) {
      const [perms] = await pool.query(
          `SELECT position_id, permission FROM admin_permissions WHERE position_id IN (?) AND revoked_at IS NULL`,
          [positionIds]
        );
      perms.forEach(p => {
        if (!permissionMap[p.position_id]) permissionMap[p.position_id] = [];
        permissionMap[p.position_id].push(p.permission);
      });
    }

    const positionsWithPerms = positions.map(p => ({
      ...p,
      permissions: permissionMap[p.id] || []
    }));

    res.json({
      code: 200,
      data: {
        admin,
        positions: positionsWithPerms
      }
    });
  } catch (err) {
    console.error('获取管理员详情失败:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

/**
 * POST /api/admin/management/:id/disable
 * 禁用管理员
 */
router.post('/:id/disable', requirePermission('admin.disable'), preventSelfModification('id'), auditLog('disable_admin', 'admin'), async (req, res) => {
    try {
        const adminId = parseInt(req.params.id);

        // 不能禁用自己
    if (req.admin && req.admin.id === adminId) {
            return res.status(403).json({
                code: 403,
                message: '不能禁用自己的账号'
            });
        }

        const connection = await pool.getConnection();

        await connection.execute(
            'UPDATE admin_users SET status = ? WHERE id = ?',
            ['disabled', adminId]
        );

        connection.release();

        res.json({
            code: 200,
            message: '禁用成功'
        });

    } catch (error) {
        console.error('禁用管理员失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误'
        });
    }
});

/**
 * POST /api/admin/management/:id/assign
 * 调岗/分配职位
 */
router.post('/:id/assign', requirePermission('admin.assign'), preventSelfModification('id'), auditLog('assign_position', 'position'), async (req, res) => {
    try {
        const adminId = parseInt(req.params.id);
        const { role, school_id, merchant_node_id, stall_id, reason, permissions } = req.body;

        if (!role) {
            return res.status(400).json({
                code: 400,
                message: '角色不能为空'
            });
        }

        const connection = await pool.getConnection();
        const context = req.adminContext || {};
        const operatorRole = context.role;
        const operatorPerms = context.permissions || [];
        const canManagePeer = operatorPerms.includes('admin.manage_peer') || operatorPerms.includes('*');

        if (!canManageRole(operatorRole, role, canManagePeer)) {
          connection.release();
          return res.status(403).json({
            code: 403,
            message: '无权限分配该角色'
          });
        }

        const scopeError = validateRoleScope(role, { school_id, merchant_node_id, stall_id });
        if (scopeError) {
          connection.release();
          return res.status(400).json({ code: 400, message: scopeError });
        }

        if (!isScopeAllowed(context, role, { school_id, merchant_node_id, stall_id })) {
          connection.release();
          return res.status(403).json({ code: 403, message: '作用域不在可管理范围内' });
        }

        try {
            await connection.beginTransaction();

            // 创建新职位
            const [posResult] = await connection.execute(
                `INSERT INTO admin_positions 
                (admin_id, role, school_id, merchant_node_id, stall_id, assigned_by)
                VALUES (?, ?, ?, ?, ?, ?)`,
              [adminId, role, school_id || null, merchant_node_id || null, stall_id || null, req.admin?.id || 1]
            );

            const positionId = posResult.insertId;

            const templatePerms = await getRoleTemplatePermissions(connection, role);
            const basePerms = operatorPerms.includes('*')
              ? templatePerms
              : templatePerms.filter(p => operatorPerms.includes(p));
            const desiredPerms = Array.isArray(permissions) ? permissions : [];
            const allowedPerms = desiredPerms.length > 0
              ? basePerms.filter(p => desiredPerms.includes(p))
              : basePerms;

            if (allowedPerms.length > 0) {
              const values = allowedPerms.map(p => [positionId, p, req.admin?.id || 1]);
              await connection.query(
                'INSERT INTO admin_permissions (position_id, permission, granted_by) VALUES ?' ,
                [values]
              );
            }

            await connection.commit();
            connection.release();

            res.json({
                code: 200,
                message: '分配成功'
            });

        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }

    } catch (error) {
        console.error('分配职位失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误'
        });
    }
});

/**
 * GET /api/admin/management/my-created
 * 获取我创建的管理员
 */
router.get('/my-created', requirePermission('admin.create'), async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [admins] = await connection.execute(`
            SELECT 
                au.id,
                au.username,
                au.real_name,
                au.created_at
            FROM admin_users au
            WHERE au.created_by = ?
            ORDER BY au.created_at DESC
        `, [req.admin?.id || 1]);

        connection.release();

        res.json({
            code: 200,
            data: admins
        });

    } catch (error) {
        console.error('获取创建列表失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误'
        });
    }
});

// 解绑职位
router.post('/:id/unassign', requirePermission('admin.unassign'), preventSelfModification('id'), auditLog('unassign_position', 'position'), async (req, res) => {
    try {
        const { positionId, reason } = req.body;
        if (!positionId) {
            return res.status(400).json({ code: 400, message: '缺少 positionId' });
        }
        await pool.execute(
            `UPDATE admin_positions 
             SET unassigned_at = NOW(), unassigned_by = ?, unassign_reason = ?
             WHERE id = ? AND unassigned_at IS NULL`,
            [req.admin?.id || 1, reason || null, positionId]
        );
        res.json({ code: 200, message: '解绑成功' });
    } catch (err) {
        console.error('解绑职位失败:', err);
        res.status(500).json({ code: 500, message: '服务器错误' });
    }
});

// 授权权限
router.post('/:id/permissions/grant', requirePermission('admin.grant'), preventSelfModification('id'), auditLog('grant_permission', 'permission'), async (req, res) => {
    try {
        const { positionId, permissions = [] } = req.body;
        if (!positionId || permissions.length === 0) {
            return res.status(400).json({ code: 400, message: '缺少 positionId 或 permissions' });
        }

        const operatorPerms = req.adminContext?.permissions || [];
        const allowedPerms = operatorPerms.includes('*') ? permissions : permissions.filter(p => operatorPerms.includes(p));

        if (allowedPerms.length === 0) {
            return res.status(403).json({ code: 403, message: '无权限授予这些权限' });
        }

        const values = allowedPerms.map(p => [positionId, p, req.admin?.id || 1]);
        await pool.query(
            'INSERT INTO admin_permissions (position_id, permission, granted_by) VALUES ?'
            , [values]
        );

        res.json({ code: 200, message: '授权成功', data: { positionId, permissions: allowedPerms } });
    } catch (err) {
        console.error('授权失败:', err);
        res.status(500).json({ code: 500, message: '服务器错误' });
    }
});

// 撤销权限
router.post('/:id/permissions/revoke', requirePermission('admin.grant'), preventSelfModification('id'), auditLog('revoke_permission', 'permission'), async (req, res) => {
    try {
        const { positionId, permissions = [] } = req.body;
        if (!positionId || permissions.length === 0) {
            return res.status(400).json({ code: 400, message: '缺少 positionId 或 permissions' });
        }

        await pool.query(
            `UPDATE admin_permissions 
             SET revoked_at = NOW() 
             WHERE position_id = ? AND permission IN (?) AND revoked_at IS NULL`,
            [positionId, permissions]
        );

        res.json({ code: 200, message: '撤销成功' });
    } catch (err) {
        console.error('撤销权限失败:', err);
        res.status(500).json({ code: 500, message: '服务器错误' });
    }
});

// 身份后缀审核
router.post('/:id/approve-suffix', requirePermission('admin.identity.approve'), auditLog('approve_suffix', 'admin'), async (req, res) => {
    try {
        const adminId = parseInt(req.params.id, 10);
        const { approved, rejectReason } = req.body;
        if (approved === undefined) {
            return res.status(400).json({ code: 400, message: '缺少 approved 字段' });
        }

        await pool.execute(
            `UPDATE admin_users 
             SET identity_suffix_status = ?, 
                 identity_suffix_approver_id = ?,
                 identity_suffix_approved_at = ?,
                 identity_suffix_rejected_reason = ?
             WHERE id = ?`,
            [approved ? 'approved' : 'rejected', req.admin?.id || 1, approved ? new Date() : null, approved ? null : (rejectReason || null), adminId]
        );

        res.json({ code: 200, message: '审核完成' });
    } catch (err) {
        console.error('审核后缀失败:', err);
        res.status(500).json({ code: 500, message: '服务器错误' });
    }
});

// 审计日志
router.get('/audit-log', requirePermission('admin.audit'), async (req, res) => {
    try {
    const { action, targetType, targetId, operatorId, days = 30 } = req.query;
        const params = [];
        let where = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)';
        params.push(Number(days) || 30);
        if (action) {
            where += ' AND action = ?';
            params.push(action);
        }
        if (targetType) {
            where += ' AND target_type = ?';
            params.push(targetType);
        }
    if (targetId) {
      where += ' AND target_id = ?';
      params.push(Number(targetId));
    }
    if (operatorId) {
      where += ' AND operator_id = ?';
      params.push(Number(operatorId));
    }
        const [logs] = await pool.execute(
            `SELECT id, operator_id, operator_position_id, action, target_type, target_id, reason, created_at
             FROM admin_audit_log ${where} ORDER BY created_at DESC LIMIT 500`,
            params
        );
        res.json({ code: 200, data: logs });
    } catch (err) {
        console.error('获取审计日志失败:', err);
        res.status(500).json({ code: 500, message: '服务器错误' });
    }
});

// 管理员搜索（前缀）
router.get('/search', requirePermission('admin.audit'), async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json({ code: 200, data: [] });
        const [rows] = await pool.execute(
            `SELECT id, username, real_name, identity_label, identity_suffix FROM admin_users
             WHERE real_name LIKE ? OR username LIKE ? LIMIT 50`,
            [`${q}%`, `${q}%`]
        );
        res.json({ code: 200, data: rows });
    } catch (err) {
        console.error('搜索管理员失败:', err);
        res.status(500).json({ code: 500, message: '服务器错误' });
    }
});

module.exports = router;
