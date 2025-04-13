/**
 * @file 支付相关路由
 * @description 处理支付创建、回调等功能
 * @created 2023-06-01
 */

const express = require('express');
const router = express.Router();
// 暂时注释掉控制器引用，等控制器实现后再启用
// const paymentController = require('../controllers/payment.controller');

// 创建充值订单
router.post('/create', (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: '该功能尚未实现'
    }
  });
});

// 获取订单状态
router.get('/orders/:orderId', (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: '该功能尚未实现'
    }
  });
});

// 微信支付回调
router.post('/notify', (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: '该功能尚未实现'
    }
  });
});

// 获取用户支付历史
router.get('/history', (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: '该功能尚未实现'
    }
  });
});

module.exports = router; 