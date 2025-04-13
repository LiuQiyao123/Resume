const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { rules } = require('../middleware/validator');
const { cache, clearCache, CACHE_PREFIX, CACHE_TTL } = require('../middleware/cache');
const {
  addCollection,
  removeCollection,
  getUserCollections,
  checkCollection
} = require('../controllers/collectionController');

// 职位收藏相关路由（清除缓存）
router.post('/', protect, rules.addCollection, clearCache(CACHE_PREFIX.COLLECTION), addCollection);
router.delete('/', protect, rules.removeCollection, clearCache(CACHE_PREFIX.COLLECTION), removeCollection);

// 收藏列表和检查（带缓存）
router.get('/', protect, cache(CACHE_PREFIX.COLLECTION, CACHE_TTL.COLLECTION), getUserCollections);
router.get('/check', protect, rules.checkCollection, cache(CACHE_PREFIX.COLLECTION, CACHE_TTL.COLLECTION), checkCollection);

module.exports = router; 