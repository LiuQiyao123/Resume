const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { rules } = require('../middleware/validator');
const { cache, clearCache, CACHE_PREFIX, CACHE_TTL } = require('../middleware/cache');
const {
  createApplication,
  getUserApplications,
  getApplication,
  withdrawApplication
} = require('../controllers/applicationController');

// 职位申请相关路由（清除缓存）
router.post('/', protect, rules.createApplication, clearCache(CACHE_PREFIX.APPLICATION), createApplication);
router.delete('/:id', protect, clearCache(CACHE_PREFIX.APPLICATION), withdrawApplication);

// 申请记录相关路由（带缓存）
router.get('/', protect, cache(CACHE_PREFIX.APPLICATION, CACHE_TTL.APPLICATION), getUserApplications);
router.get('/:id', protect, cache(CACHE_PREFIX.APPLICATION, CACHE_TTL.APPLICATION), getApplication);

module.exports = router; 