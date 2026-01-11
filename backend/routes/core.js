const express = require('express');
const router = express.Router();
const pool = require('../config/database');

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

module.exports = router;
