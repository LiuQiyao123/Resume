const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { rules } = require('../middleware/validator');
const { cache, clearCache, CACHE_PREFIX, CACHE_TTL } = require('../middleware/cache');
const {
  login,
  getProfile,
  updateProfile,
  getPoints,
  getResumeCount,
  uploadAvatar,
  deleteAvatar
} = require('../controllers/userController');

// 用户认证相关路由
router.post('/login', rules.login, login);

// 用户资料相关路由（带缓存）
router.get('/profile', protect, cache(CACHE_PREFIX.USER, CACHE_TTL.USER), getProfile);
router.put('/profile', protect, rules.updateProfile, clearCache(CACHE_PREFIX.USER), updateProfile);

// 用户头像相关路由（清除缓存）
router.post('/avatar', protect, upload.single('avatar'), clearCache(CACHE_PREFIX.USER), uploadAvatar);
router.delete('/avatar', protect, clearCache(CACHE_PREFIX.USER), deleteAvatar);

// 用户积分相关路由（带缓存）
router.get('/points', protect, cache(CACHE_PREFIX.POINTS, CACHE_TTL.POINTS), getPoints);

// 用户简历相关路由（带缓存）
router.get('/resumes/count', protect, cache(CACHE_PREFIX.RESUME, CACHE_TTL.RESUME), getResumeCount);

module.exports = router; 