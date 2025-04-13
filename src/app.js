/**
 * @file Express应用入口
 * @description 配置Express应用，包括中间件、路由等
 * @created 2023-06-01
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const logger = require('./utils/logger');

// 创建Express应用
const app = express();

// 加载环境变量
require('dotenv').config();

// 安全相关中间件
app.use(helmet());
app.use(cors());

// 请求体解析中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 访问日志中间件
// 在生产环境下记录到文件，开发环境输出到控制台
if (process.env.NODE_ENV === 'production') {
  // 确保日志目录存在
  const logDir = process.env.LOG_DIR || 'logs';
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }
  
  const accessLogStream = fs.createWriteStream(
    path.join(logDir, 'access.log'), 
    { flags: 'a' }
  );
  app.use(morgan('combined', { stream: accessLogStream }));
} else {
  app.use(morgan('dev'));
}

// API路由
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/resumes', require('./routes/resume.routes'));
app.use('/api/templates', require('./routes/template.routes'));
app.use('/api/credits', require('./routes/credit.routes'));
app.use('/api/conversations', require('./routes/conversation.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/ai', require('./routes/ai.routes'));

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  logger.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || '服务器内部错误';
  
  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' && statusCode === 500 
        ? '服务器内部错误' 
        : message,
      details: process.env.NODE_ENV === 'production' ? undefined : err.details
    }
  });
});

// 处理404错误
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: '请求的资源不存在'
    }
  });
});

module.exports = app; 