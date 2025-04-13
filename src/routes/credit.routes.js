/**
 * @file 积分相关路由
 * @description 处理积分获取、消费等功能
 * @created 2023-06-01
 */

const express = require('express');
const router = express.Router();
// 暂时注释掉控制器引用，等控制器实现后再启用
// const creditController = require('../controllers/credit.controller');

// 获取用户积分信息
router.get('/', (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: '该功能尚未实现'
    }
  });
});

// 获取积分历史记录
router.get('/history', (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: '该功能尚未实现'
    }
  });
});

// 通过分享获取积分
router.post('/share', (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: '该功能尚未实现'
    }
  });
});

// 观看广告获取积分
router.post('/ad-view', (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: '该功能尚未实现'
    }
  });
});

module.exports = router; 