/**
 * @file 模板相关路由
 * @description 处理简历模板查询、购买等功能
 * @created 2023-06-01
 */

const express = require('express');
const router = express.Router();
// 暂时注释掉控制器引用，等控制器实现后再启用
// const templateController = require('../controllers/template.controller');

// 获取所有模板
router.get('/', (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: '该功能尚未实现'
    }
  });
});

// 获取单个模板详情
router.get('/:id', (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: '该功能尚未实现'
    }
  });
});

// 购买模板
router.post('/:id/purchase', (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: '该功能尚未实现'
    }
  });
});

// 获取用户已购买的模板
router.get('/user/purchased', (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: '该功能尚未实现'
    }
  });
});

module.exports = router; 