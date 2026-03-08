/**
 * 管理员权限校验中间件
 * 用于解析 token、加载职位信息、权限验证
 */

const jwt = require('jsonwebtoken');
const pool = require('../config/database');

async function getAdminById(adminId) {
  const [rows] = await pool.execute(
    'SELECT id, username, status FROM admin_users WHERE id = ? LIMIT 1',
    [adminId]
  );
  return rows[0] || null;
}

async function loadAdminPosition(positionId) {
  const [rows] = await pool.execute(
    `SELECT 
        ap.id AS positionId,
        ap.admin_id,
        ap.role,
        ap.school_id,
        ap.merchant_node_id,
        ap.stall_id,
        GROUP_CONCAT(aperm.permission) AS permissions
      FROM admin_positions ap
      LEFT JOIN admin_permissions aperm 
        ON ap.id = aperm.position_id AND aperm.revoked_at IS NULL
      WHERE ap.id = ? AND ap.unassigned_at IS NULL
      GROUP BY ap.id`,
    [positionId]
  );

  if (!rows.length) return null;
  const position = rows[0];
  return {
    adminId: position.admin_id,
    positionId: position.positionId,
    role: position.role,
    schoolId: position.school_id,
    merchantNodeId: position.merchant_node_id,
    stallId: position.stall_id,
    permissions: position.permissions ? position.permissions.split(',') : []
  };
}

async function loadLatestActivePosition(adminId) {
  const [rows] = await pool.execute(
    `SELECT id FROM admin_positions 
      WHERE admin_id = ? AND unassigned_at IS NULL 
      ORDER BY assigned_at DESC LIMIT 1`,
    [adminId]
  );
  return rows[0]?.id || null;
}

/**
 * 解析并验证管理员 token 和职位上下文
 */
async function adminAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '缺少认证 token' });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    if (decoded.type && decoded.type !== 'admin') {
      return res.status(401).json({ error: '非管理员 token' });
    }

    const adminId = decoded.adminId || decoded.id;
    if (!adminId) {
      return res.status(401).json({ error: '无效管理员 token' });
    }

    const admin = await getAdminById(adminId);
    if (!admin || admin.status !== 'active') {
      return res.status(403).json({ error: '管理员账号不存在或已禁用' });
    }

    req.admin = {
      id: adminId,
      username: decoded.username || admin.username
    };

    let activePositionId = req.headers['x-active-position-id'] || req.body.activePositionId;
    if (!activePositionId) {
      activePositionId = await loadLatestActivePosition(adminId);
    }

    if (activePositionId) {
      const position = await loadAdminPosition(activePositionId);
      if (!position || position.adminId !== adminId) {
        return res.status(403).json({ error: '职位信息加载失败' });
      }

      if (position.role === 'super_admin') {
        position.permissions = ['*'];
      }

      req.adminContext = position;
    }
    // ########## 仅修改这里：加2行代码 ##########
    else {
      req.adminContext = {}; // 防止未挂载导致后续判断报错
    }
    // ###########################################

    return next();
  } catch (error) {
    console.error('Token 验证失败:', error.message);
    return res.status(401).json({ error: '认证失败', message: error.message });
  }
}

/**
 * 权限检查中间件（可串联多个权限）
 * 用法: router.post('/api/...', requirePermission('admin.create'), handler)
 */
function requirePermission(...requiredPermissions) {
  return (req, res, next) => {
    if (!req.adminContext) {
      return res.status(401).json({ error: '缺少管理员上下文' });
    }

    const adminPerms = req.adminContext.permissions || [];
    if (adminPerms.includes('*')) {
      return next();
    }
    const hasPermission = requiredPermissions.some(perm => adminPerms.includes(perm));

    if (!hasPermission) {
      return res.status(403).json({ 
        error: '无权限操作',
        required: requiredPermissions,
        current: adminPerms
      });
    }

    next();
  };
}

/**
 * 作用域验证中间件
 * 确保操作的目标在管理员的权限范围内
 */
function requireScope(scopeType, idParam) {
  return (req, res, next) => {
    if (!req.adminContext) {
      return res.status(401).json({ error: '缺少管理员上下文' });
    }

    const targetId = req.params[idParam] || req.body[idParam];
    const { role, schoolId, merchantNodeId, stallId } = req.adminContext;

    // 根据角色和类型进行作用域检查
    switch (scopeType) {
      case 'school':
        if (role !== 'super_admin' && schoolId !== parseInt(targetId)) {
          return res.status(403).json({ error: '无权限操作其他学校' });
        }
        break;
      case 'merchant_node':
        if (role === 'super_admin') break;
        if (role === 'school_admin') break;
        if (role === 'merchant_admin' && merchantNodeId !== parseInt(targetId)) {
          return res.status(403).json({ error: '无权限操作其他商户节点' });
        }
        if (role === 'stall_admin') {
          return res.status(403).json({ error: '当前角色无权管理商户节点' });
        }
        break;
      case 'stall':
        if (role === 'stall_admin' && stallId !== parseInt(targetId)) {
          return res.status(403).json({ error: '无权限操作其他档口' });
        }
        break;
    }

    next();
  };
}

/**
 * 不可自我授权验证
 * 确保操作者不能改自己的权限
 */
function preventSelfModification(idParam = 'id') {
  return (req, res, next) => {
    const targetAdminId = parseInt(req.params[idParam] || req.body[idParam]);
    const operatorAdminId = req.adminContext?.adminId;

    if (targetAdminId === operatorAdminId) {
      return res.status(403).json({ error: '不能修改自己的权限' });
    }

    next();
  };
}

/**
 * 审计日志记录中间件
 * 记录所有管理员操作
 */
function auditLog(action, targetType) {
  return (req, res, next) => {
    // 保存原始 res.json 方法
    const originalJson = res.json.bind(res);

    // 重写 res.json 以在响应后记录日志
    res.json = function(data) {
      // 仅在成功时（status 2xx）记录日志
      if (res.statusCode >= 200 && res.statusCode < 300) {
        recordAudit({
          operator_id: req.adminContext?.adminId,
          operator_position_id: req.adminContext?.positionId,
          action,
          target_type: targetType,
          target_id: req.params.id || req.body.id,
          after_data: JSON.stringify(data),
          reason: req.body.reason,
          ip_address: req.ip,
          user_agent: req.headers['user-agent']
        });
      }
      return originalJson(data);
    };

    next();
  };
}

/**
 * 实际记录审计日志到数据库
 */
async function recordAudit(entry) {
  try {
    await pool.execute(
      `INSERT INTO admin_audit_log
        (operator_id, operator_position_id, action, target_type, target_id, before_data, after_data, reason, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ,[
        entry.operator_id || null,
        entry.operator_position_id || null,
        entry.action,
        entry.target_type,
        entry.target_id || null,
        entry.before_data || null,
        entry.after_data || null,
        entry.reason || null,
        entry.ip_address || null,
        entry.user_agent || null
      ]
    );
  } catch (err) {
    console.error('审计日志记录失败:', err.message);
  }
}

module.exports = {
  adminAuthMiddleware,
  loadAdminPosition,
  requirePermission,
  requireScope,
  preventSelfModification,
  auditLog
};