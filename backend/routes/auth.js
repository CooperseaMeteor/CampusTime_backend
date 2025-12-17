const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// 注册路由
router.post('/register', authController.register);

// 登录路由
router.post('/login', authController.login);

// 刷新 access token
router.post('/refresh', authController.refresh);

// 注销（删除 refresh token）
router.post('/logout', authController.logout);

// 获取用户信息（需要认证）
router.get('/user', verifyToken, authController.getUserInfo);

module.exports = router;
