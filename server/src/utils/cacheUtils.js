const { redis, CACHE_PREFIX, CACHE_TTL } = require('../config/redis');

class CacheUtils {
  // 设置缓存
  static async set(key, value, ttl = null) {
    try {
      const stringValue = JSON.stringify(value);
      if (ttl) {
        await redis.setex(key, ttl, stringValue);
      } else {
        await redis.set(key, stringValue);
      }
      return true;
    } catch (error) {
      console.error('设置缓存失败:', error);
      return false;
    }
  }

  // 获取缓存
  static async get(key) {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('获取缓存失败:', error);
      return null;
    }
  }

  // 删除缓存
  static async del(key) {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('删除缓存失败:', error);
      return false;
    }
  }

  // 批量删除缓存
  static async delPattern(pattern) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(keys);
      }
      return true;
    } catch (error) {
      console.error('批量删除缓存失败:', error);
      return false;
    }
  }

  // 检查缓存是否存在
  static async exists(key) {
    try {
      return await redis.exists(key);
    } catch (error) {
      console.error('检查缓存失败:', error);
      return false;
    }
  }

  // 设置缓存并返回旧值
  static async getSet(key, value, ttl = null) {
    try {
      const stringValue = JSON.stringify(value);
      const oldValue = await redis.get(key);
      if (ttl) {
        await redis.setex(key, ttl, stringValue);
      } else {
        await redis.set(key, stringValue);
      }
      return oldValue ? JSON.parse(oldValue) : null;
    } catch (error) {
      console.error('设置并获取缓存失败:', error);
      return null;
    }
  }

  // 获取缓存剩余时间
  static async ttl(key) {
    try {
      return await redis.ttl(key);
    } catch (error) {
      console.error('获取缓存剩余时间失败:', error);
      return -1;
    }
  }

  // 清除所有缓存
  static async clear() {
    try {
      await redis.flushall();
      return true;
    } catch (error) {
      console.error('清除所有缓存失败:', error);
      return false;
    }
  }
}

module.exports = {
  CacheUtils,
  CACHE_PREFIX,
  CACHE_TTL
}; 