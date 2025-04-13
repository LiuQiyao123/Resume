const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { rules } = require('../middleware/validator');
const { cache, clearCache, CACHE_PREFIX, CACHE_TTL } = require('../middleware/cache');
const {
  getPointRecords,
  rechargePoints,
  dailySignIn,
  checkSignIn
} = require('../controllers/pointsController');

// 积分记录相关路由（带缓存）
router.get('/records', protect, rules.getPointRecords, cache(CACHE_PREFIX.POINTS, CACHE_TTL.POINTS), getPointRecords);

// 积分充值路由（清除缓存）
router.post('/recharge', protect, rules.rechargePoints, clearCache(CACHE_PREFIX.POINTS), rechargePoints);

// 每日签到相关路由（清除缓存）
router.post('/sign-in', protect, clearCache(CACHE_PREFIX.POINTS), dailySignIn);
router.get('/sign-in/check', protect, cache(CACHE_PREFIX.POINTS, CACHE_TTL.POINTS), checkSignIn);

module.exports = router; 