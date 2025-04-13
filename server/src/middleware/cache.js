const { redis } = require('../config/redis');
const logger = require('../utils/logger');

// 缓存前缀
const CACHE_PREFIX = {
  USER: 'user:',
  RESUME: 'resume:',
  JOB: 'job:',
  APPLICATION: 'application:',
  COLLECTION: 'collection:',
  POINTS: 'points:'
};

// 缓存时间（秒）
const CACHE_TTL = {
  USER: 3600, // 1小时
  RESUME: 3600,
  JOB: 1800, // 30分钟
  APPLICATION: 1800,
  COLLECTION: 1800,
  POINTS: 300 // 5分钟
};

// 缓存中间件
const cache = (prefix, ttl) => async (req, res, next) => {
  try {
    // 生成缓存键
    const key = `${prefix}${req.user?.id || ''}:${req.originalUrl}`;

    // 尝试从缓存获取数据
    const cachedData = await redis.get(key);
    if (cachedData) {
      logger.debug(`Cache hit: ${key}`);
      return res.json(JSON.parse(cachedData));
    }

    // 如果没有缓存，修改res.json方法以在发送响应前缓存数据
    const originalJson = res.json;
    res.json = function(data) {
      if (data.success) {
        redis.setex(key, ttl, JSON.stringify(data))
          .catch(err => logger.error('缓存设置失败:', err));
      }
      return originalJson.call(this, data);
    };

    next();
  } catch (error) {
    logger.error('缓存中间件错误:', error);
    next();
  }
};

// 清除缓存中间件
const clearCache = (prefix) => async (req, res, next) => {
  try {
    const pattern = `${prefix}${req.user?.id || ''}:*`;
    const keys = await redis.keys(pattern);
    
    if (keys.length > 0) {
      await redis.del(keys);
      logger.debug(`Cleared cache for pattern: ${pattern}`);
    }
    
    next();
  } catch (error) {
    logger.error('清除缓存错误:', error);
    next();
  }
};

module.exports = {
  cache,
  clearCache,
  CACHE_PREFIX,
  CACHE_TTL
}; 