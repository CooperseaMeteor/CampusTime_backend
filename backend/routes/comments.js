// 加载环境变量（可选，也可直接写死配置）
require('dotenv').config();
// 引入依赖
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors()); // 解决跨域
app.use(express.json()); // 解析JSON请求体
app.use(express.urlencoded({ extended: true })); // 解析表单请求体

// MySQL数据库连接配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'campus_food',
  charset: 'utf8mb4'
};

// 创建数据库连接池（性能更优）
const pool = mysql.createPool(dbConfig);

// ====================== 评论API接口 ======================
/**
 * 1. 获取某帖子的所有评论
 * 请求方式：GET
 * 请求地址：/api/comments?post_id=1
 */
app.get('/api/comments', async (req, res) => {
  try {
    const { post_id } = req.query;
    // 验证参数
    if (!post_id) {
      return res.status(400).json({
        code: 400,
        msg: '缺少post_id参数'
      });
    }

    // 查询评论（关联用户表获取用户名）
    const [comments] = await pool.execute(`
      SELECT c.*, u.username 
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `, [post_id]);

    // 整理评论结构（主评论+回复）
    const result = [];
    comments.forEach(comment => {
      if (comment.parent_id === 0) {
        // 主评论
        comment.replies = [];
        result.push(comment);
      } else {
        // 回复关联到主评论
        const mainComment = result.find(item => item.id === comment.parent_id);
        if (mainComment) {
          mainComment.replies.push(comment);
        }
      }
    });

    // 返回结果
    res.status(200).json({
      code: 200,
      msg: '查询成功',
      data: result
    });
  } catch (err) {
    console.error('获取评论失败：', err);
    res.status(500).json({
      code: 500,
      msg: '服务器内部错误：' + err.message
    });
  }
});

/**
 * 2. 发布新评论/回复
 * 请求方式：POST
 * 请求地址：/api/comments
 * 请求体：{ post_id, user_id, content, parent_id = 0 }
 */
app.post('/api/comments', async (req, res) => {
  try {
    const { post_id, user_id, content, parent_id = 0 } = req.body;

    // 验证必填参数
    if (!post_id || !user_id || !content) {
      return res.status(400).json({
        code: 400,
        msg: 'post_id、user_id、content为必填参数'
      });
    }

    // 插入评论
    const [result] = await pool.execute(`
      INSERT INTO comments (post_id, user_id, content, parent_id, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `, [post_id, user_id, content, parent_id]);

    // 返回结果
    res.status(200).json({
      code: 200,
      msg: '评论发布成功',
      data: {
        comment_id: result.insertId
      }
    });
  } catch (err) {
    console.error('发布评论失败：', err);
    res.status(500).json({
      code: 500,
      msg: '服务器内部错误：' + err.message
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`评论API服务已启动，地址：http://localhost:${PORT}`);
});