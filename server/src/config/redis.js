const Redis = require('ioredis');
const winston = require('winston');
require('dotenv').config();

// 创建日志实例
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(
      info => `${info.timestamp} ${info.level}: ${info.message}`
    )
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// 创建Redis客户端
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB || 0,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

// Redis连接事件处理
redis.on('connect', () => {
  logger.info('Redis连接成功');
});

redis.on('error', (err) => {
  logger.error('Redis连接错误:', err);
});

redis.on('ready', () => {
  logger.info('Redis准备就绪');
});

redis.on('close', () => {
  logger.warn('Redis连接关闭');
});

// 缓存键前缀
const CACHE_PREFIX = {
  USER: 'user:',
  RESUME: 'resume:',
  JOB: 'job:',
  COMPANY: 'company:',
  POINTS: 'points:',
  COLLECTION: 'collection:'
};

// 缓存过期时间（秒）
const CACHE_TTL = {
  USER: 3600, // 1小时
  RESUME: 3600,
  JOB: 1800, // 30分钟
  COMPANY: 3600,
  POINTS: 300, // 5分钟
  COLLECTION: 1800
};

module.exports = {
  redis,
  CACHE_PREFIX,
  CACHE_TTL
}; 