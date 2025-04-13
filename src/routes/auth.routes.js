/**
 * @file 认证相关路由
 * @description 处理用户登录、注册、刷新令牌等认证相关功能
 * @created 2023-06-01
 */

const express = require('express');
const router = express.Router();
// 暂时注释掉控制器引用，等控制器实现后再启用
// const authController = require('../controllers/auth.controller');

// 微信小程序登录
router.post('/login', (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: '该功能尚未实现'
    }
  });
});

// 刷新访问令牌
router.post('/refresh-token', (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: '该功能尚未实现'
    }
  });
});

// 退出登录
router.post('/logout', (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: '该功能尚未实现'
    }
  });
});

module.exports = router; 