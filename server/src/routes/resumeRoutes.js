const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { rules } = require('../middleware/validator');
const { cache, clearCache, CACHE_PREFIX, CACHE_TTL } = require('../middleware/cache');
const {
  getResumes,
  getResume,
  createResume,
  updateResume,
  deleteResume,
  customizeResume,
  uploadResumeFile,
  deleteResumeFile
} = require('../controllers/resumeController');

// 简历列表和详情（带缓存）
router.get('/', protect, cache(CACHE_PREFIX.RESUME, CACHE_TTL.RESUME), getResumes);
router.get('/:id', protect, cache(CACHE_PREFIX.RESUME, CACHE_TTL.RESUME), getResume);

// 简历管理（清除缓存）
router.post('/', protect, rules.createResume, clearCache(CACHE_PREFIX.RESUME), createResume);
router.put('/:id', protect, rules.updateResume, clearCache(CACHE_PREFIX.RESUME), updateResume);
router.delete('/:id', protect, clearCache(CACHE_PREFIX.RESUME), deleteResume);

// 简历优化（清除缓存）
router.post('/:id/customize', protect, rules.customizeResume, clearCache(CACHE_PREFIX.RESUME), customizeResume);

// 简历文件上传（清除缓存）
router.post('/:id/upload', protect, upload.single('resume'), clearCache(CACHE_PREFIX.RESUME), uploadResumeFile);
router.delete('/:id/file', protect, clearCache(CACHE_PREFIX.RESUME), deleteResumeFile);

module.exports = router; 