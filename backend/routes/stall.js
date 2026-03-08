/**
 * 档口工作台 API
 */

const express = require('express');
const router = express.Router();
const { adminAuthMiddleware } = require('../middleware/adminAuth');

function ensureStallAccess(req, res) {
  const role = req.adminContext?.role;
  if (!role || !['stall_admin', 'merchant_admin', 'school_admin', 'super_admin'].includes(role)) {
    res.status(403).json({ code: 403, message: '权限不足' });
    return false;
  }
  return true;
}

/**
 * 获取档口统计
 * GET /api/stall/stats
 */
router.get('/stats', adminAuthMiddleware, (req, res) => {
  if (!ensureStallAccess(req, res)) return;

  return res.json({
    code: 200,
    message: '获取档口统计成功',
    data: {
      todaySupply: 15,
      todayReviews: 8,
      stockWarning: 3,
      todayViews: 126
    }
  });
});

/**
 * 获取档口菜品列表
 * GET /api/stall/dishes
 */
router.get('/dishes', adminAuthMiddleware, (req, res) => {
  if (!ensureStallAccess(req, res)) return;

  return res.json({
    code: 200,
    message: '获取档口菜品成功',
    data: {
      dishes: [
        {
          id: 1,
          name: '宫保鸡丁',
          price: 15,
          image: 'https://via.placeholder.com/80?text=宫保鸡丁',
          stockMode: 'limited',
          totalStock: 50,
          remainingStock: 12,
          isAvailable: true
        },
        {
          id: 2,
          name: '麻婆豆腐',
          price: 12,
          image: 'https://via.placeholder.com/80?text=麻婆豆腐',
          stockMode: 'unlimited',
          isAvailable: true
        },
        {
          id: 3,
          name: '番茄炒蛋',
          price: 10,
          image: 'https://via.placeholder.com/80?text=番茄炒蛋',
          stockMode: 'unlimited',
          isAvailable: true
        },
        {
          id: 4,
          name: '鱼香肉丝',
          price: 16,
          image: 'https://via.placeholder.com/80?text=鱼香肉丝',
          stockMode: 'limited',
          totalStock: 30,
          remainingStock: 3,
          isAvailable: true
        },
        {
          id: 5,
          name: '青椒肉丝',
          price: 14,
          image: 'https://via.placeholder.com/80?text=青椒肉丝',
          stockMode: 'unlimited',
          isAvailable: false
        }
      ]
    }
  });
});

/**
 * 获取库存预警列表
 * GET /api/stall/inventory/alerts
 */
router.get('/inventory/alerts', adminAuthMiddleware, (req, res) => {
  if (!ensureStallAccess(req, res)) return;

  return res.json({
    code: 200,
    message: '获取库存预警成功',
    data: {
      alerts: [
        { level: 'critical', title: '宫保鸡丁库存严重不足', desc: '剩余12份，建议及时补充', action: '去补充', itemName: '宫保鸡丁' },
        { level: 'warning', title: '鱼香肉丝库存偏低', desc: '剩余3份，建议准备', action: '去补充', itemName: '鱼香肉丝' },
        { level: 'info', title: '青椒肉丝已售罄', desc: '库存为0，请补货后重新上架', action: '重新上架', itemName: '青椒肉丝' }
      ]
    }
  });
});

/**
 * 口碑概览
 * GET /api/stall/reviews/summary
 */
router.get('/reviews/summary', adminAuthMiddleware, (req, res) => {
  if (!ensureStallAccess(req, res)) return;

  const reviews = [
    { id: 1, user: '学生A', rating: 5, comment: '宫保鸡丁超级好吃！', time: '今天 12:30', replied: true },
    { id: 2, user: '学生B', rating: 4, comment: '味道不错，就是有点辣', time: '今天 11:45', replied: false },
    { id: 3, user: '学生C', rating: 3, comment: '上菜速度有点慢', time: '昨天 18:20', replied: false },
    { id: 4, user: '学生D', rating: 5, comment: '鱼香肉丝很下饭', time: '昨天 17:50', replied: true },
    { id: 5, user: '学生E', rating: 2, comment: '青椒肉丝肉有点少', time: '昨天 13:15', replied: false }
  ];

  return res.json({
    code: 200,
    message: '获取口碑概览成功',
    data: {
      reviews,
      total: reviews.length,
      unreplied: reviews.filter(r => !r.replied).length
    }
  });
});

/**
 * 运营数据概览
 * GET /api/stall/reports/summary
 */
router.get('/reports/summary', adminAuthMiddleware, (req, res) => {
  if (!ensureStallAccess(req, res)) return;

  return res.json({
    code: 200,
    message: '获取运营数据成功',
    data: {
      todayOrders: 42,
      todayRevenue: '¥586',
      avgRating: 4.8,
      popularDish: '宫保鸡丁',
      conversionRate: '3.2%'
    }
  });
});

/**
 * 操作日志
 * GET /api/stall/logs
 */
router.get('/logs', adminAuthMiddleware, (req, res) => {
  if (!ensureStallAccess(req, res)) return;

  const logs = [
    { id: 1, action: '更新库存', target: '宫保鸡丁', user: '档口管理员', time: '今天 14:30' },
    { id: 2, action: '修改菜品状态', target: '青椒肉丝', user: '档口管理员', time: '今天 13:15' },
    { id: 3, action: '回复评价', target: '学生A的评价', user: '档口管理员', time: '今天 12:45' },
    { id: 4, action: '添加菜品', target: '新菜: 糖醋里脊', user: '档口管理员', time: '昨天 16:20' },
    { id: 5, action: '批量导入', target: '15个菜品数据', user: '档口管理员', time: '昨天 10:10' }
  ];

  return res.json({
    code: 200,
    message: '获取操作日志成功',
    data: { logs }
  });
});

/**
 * 库存补货
 * POST /api/stall/inventory/restock
 */
router.post('/inventory/restock', adminAuthMiddleware, (req, res) => {
  if (!ensureStallAccess(req, res)) return;

  const { itemName } = req.body || {};
  return res.json({
    code: 200,
    message: itemName ? `已提交补货: ${itemName}` : '补货请求已提交'
  });
});

module.exports = router;
