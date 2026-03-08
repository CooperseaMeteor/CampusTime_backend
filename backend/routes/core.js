const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// --- 社区帖子 ---
router.get('/posts', async (req, res) => {
  try {
    const { tab = 'latest', page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const orderBy = tab === 'recommend' ? 'p.like_count DESC, p.comment_count DESC, p.created_at DESC' : 'p.created_at DESC';

    const [rows] = await pool.query(
      `SELECT p.*, u.username AS authorName, u.avatar AS authorAvatar
       FROM posts p
       LEFT JOIN users u ON p.user_id = u.id
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [Number(limit), Number(offset)]
    );

    return res.json({ code: 200, message: '获取帖子成功', data: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

router.post('/posts', verifyToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { title, content, tags, image } = req.body;
    if (!title) return res.status(400).json({ code: 400, message: '标题必填' });

    const [result] = await pool.query(
      'INSERT INTO posts (user_id, title, content, tags, image) VALUES (?, ?, ?, ?, ?)',
      [userId, title, content || '', tags ? JSON.stringify(tags) : null, image || null]
    );

    return res.json({ code: 200, message: '发表成功', data: { id: result.insertId } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// --- 评论 ---
router.get('/posts/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const [rows] = await pool.query(
      `SELECT c.*, u.username AS authorName, u.avatar AS authorAvatar
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC
       LIMIT ? OFFSET ?`,
      [id, Number(limit), Number(offset)]
    );
    return res.json({ code: 200, message: '获取评论成功', data: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

router.post('/posts/:id/comments', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const { content, parentId } = req.body;
    if (!content) return res.status(400).json({ code: 400, message: '内容必填' });

    const [result] = await pool.query(
      'INSERT INTO comments (post_id, user_id, content, parent_id) VALUES (?, ?, ?, ?)',
      [id, userId, content, parentId || null]
    );

    // 更新帖子评论数
    await pool.query('UPDATE posts SET comment_count = (SELECT COUNT(*) FROM comments WHERE post_id = ?) WHERE id = ?', [id, id]);

    return res.json({ code: 200, message: '评论成功', data: { id: result.insertId } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 点赞/取消点赞
router.post('/posts/:id/like', verifyToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  try {
    // 尝试插入，若已存在则删除（切换）
    const [result] = await pool.query('INSERT IGNORE INTO post_likes (post_id, user_id) VALUES (?, ?)', [id, userId]);
    if (result.affectedRows === 0) {
      await pool.query('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?', [id, userId]);
    }
    const [[countRow]] = await pool.query('SELECT COUNT(*) AS cnt FROM post_likes WHERE post_id = ?', [id]);
    await pool.query('UPDATE posts SET like_count = ? WHERE id = ?', [countRow.cnt, id]);
    return res.json({ code: 200, message: '操作成功', data: { liked: result.affectedRows > 0, likeCount: countRow.cnt } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// --- 打卡 / 想去 ---
router.post('/merchants/:id/checkin', verifyToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  try {
    await pool.query('INSERT IGNORE INTO checkins (user_id, merchant_id) VALUES (?, ?)', [userId, id]);
    return res.json({ code: 200, message: '打卡成功' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

router.post('/merchants/:id/wish', verifyToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  try {
    await pool.query('INSERT IGNORE INTO wish_merchants (user_id, merchant_id) VALUES (?, ?)', [userId, id]);
    return res.json({ code: 200, message: '已加入想去' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// --- 订单列表（个人中心） ---
router.get('/orders', verifyToken, async (req, res) => {
  const userId = req.user?.userId;
  const { page = 1, limit = 50 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  try {
    const [rows] = await pool.query(
      `SELECT o.id, o.status, o.total_amount AS totalAmount, o.created_at AS createdAt,
              IFNULL(JSON_ARRAYAGG(d.name), JSON_ARRAY()) AS dishNames
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN dishes d ON d.id = oi.dish_id
       WHERE o.user_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, Number(limit), Number(offset)]
    );
    return res.json({ code: 200, message: '获取订单成功', data: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 获取所有商户列表
router.get('/merchants', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM merchants');
    res.json({ code: 200, message: '获取商户列表成功', data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 获取商户信息
router.get('/merchants/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM merchants WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '商户不存在' });
    }
    res.json({ code: 200, message: '获取商户成功', data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 获取商户的档口列表
router.get('/merchants/:id/stalls', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM stalls WHERE merchant_id = ?', [id]);
    res.json({ code: 200, message: '获取档口成功', data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 获取档口详情
router.get('/stalls/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM stalls WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '档口不存在' });
    }
    res.json({ code: 200, message: '获取档口成功', data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 获取档口的菜品列表
router.get('/stalls/:id/dishes', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM dishes WHERE stall_id = ?', [id]);
    res.json({ code: 200, message: '获取菜品成功', data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 获取全部菜品列表
router.get('/dishes', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM dishes');
    res.json({ code: 200, message: '获取菜品成功', data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 获取全部评价列表
router.get('/reviews', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM reviews');
    res.json({ code: 200, message: '获取评价成功', data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 获取菜品详情
router.get('/dishes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM dishes WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '菜品不存在' });
    }
    res.json({ code: 200, message: '获取菜品成功', data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 创建菜品评价
router.post('/dishes/:id/reviews', verifyToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  const { rating, content, tags, images, anonymous = 0 } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ code: 400, message: '评分需在1-5之间' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO reviews (dish_id, user_id, rating, tags, content, images, anonymous) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, userId, rating, tags ? JSON.stringify(tags) : null, content || null, images ? JSON.stringify(images) : null, anonymous ? 1 : 0]
    );
    return res.json({ code: 200, message: '评价成功', data: { id: result.insertId } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router;
