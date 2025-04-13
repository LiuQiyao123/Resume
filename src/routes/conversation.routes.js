/**
 * @file 会话相关路由
 * @description 处理会话创建、查询、消息获取等功能
 * @created 2023-06-01
 */

const express = require('express');
const router = express.Router();
// 暂时注释掉控制器引用，等控制器实现后再启用
// const conversationController = require('../controllers/conversation.controller');

// 获取用户会话列表
router.get('/', (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: '该功能尚未实现'
    }
  });
});

// 创建新会话
router.post('/', (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: '该功能尚未实现'
    }
  });
});

// 获取单个会话详情
router.get('/:id', (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: '该功能尚未实现'
    }
  });
});

// 获取会话消息列表
router.get('/:id/messages', (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: '该功能尚未实现'
    }
  });
});

// 发送消息
router.post('/:id/messages', (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: '该功能尚未实现'
    }
  });
});

// 关闭会话
router.post('/:id/close', (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: '该功能尚未实现'
    }
  });
});

module.exports = router; 