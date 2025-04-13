const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { cache, clearCache, CACHE_PREFIX, CACHE_TTL } = require('../middleware/cache');
const {
  getJobs,
  getJob,
  getSimilarJobs,
  getCompany
} = require('../controllers/jobController');

// 职位列表和详情（带缓存）
router.get('/', cache(CACHE_PREFIX.JOB, CACHE_TTL.JOB), getJobs);
router.get('/:id', cache(CACHE_PREFIX.JOB, CACHE_TTL.JOB), getJob);

// 相似职位推荐（带缓存）
router.get('/:id/similar', cache(CACHE_PREFIX.JOB, CACHE_TTL.JOB), getSimilarJobs);

// 公司信息（带缓存）
router.get('/companies/:id', cache(CACHE_PREFIX.COMPANY, CACHE_TTL.COMPANY), getCompany);

// 清除职位缓存
router.post('/clear-cache', protect, clearCache(CACHE_PREFIX.JOB));

module.exports = router; 