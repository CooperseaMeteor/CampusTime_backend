/**
 * 商户管理员工作台 API
 */

const express = require('express');
const router = express.Router();
const { adminAuthMiddleware } = require('../middleware/adminAuth');

function ensureMerchantAccess(req, res) {
  const role = req.adminContext?.role;
  if (!role || !['merchant_admin', 'school_admin', 'super_admin'].includes(role)) {
    res.status(403).json({ code: 403, message: '权限不足' });
    return false;
  }
  return true;
}

/**
 * 获取商户仪表盘统计
 * GET /api/merchant/dashboard
 */
router.get('/dashboard', adminAuthMiddleware, (req, res) => {
  if (!ensureMerchantAccess(req, res)) return;

  return res.json({
    code: 200,
    message: '获取商户统计成功',
    data: {
      todayOrders: 248,
      todayRevenue: '¥5,846',
      avgRating: 4.8,
      stockWarnings: 3
    }
  });
});

module.exports = router;
