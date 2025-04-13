const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// 导入路由
const userRoutes = require('./routes/userRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const collectionRoutes = require('./routes/collectionRoutes');

// 导入中间件
const { logger, requestLogger, errorLogger, performanceLogger } = require('./utils/logger');

// 创建Express应用
const app = express();

// 基本中间件
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 每个IP限制100个请求
});
app.use(limiter);

// 日志中间件
app.use(requestLogger);
app.use(performanceLogger);

// 路由
app.use('/api/users', userRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/collections', collectionRoutes);

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '未找到请求的资源'
  });
});

// 错误处理
app.use(errorLogger);
app.use((err, req, res, next) => {
  logger.error('应用错误:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '服务器内部错误'
  });
});

// 连接数据库
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info('MongoDB连接成功');
    // 启动服务器
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      logger.info(`服务器运行在端口 ${PORT}`);
    });
  })
  .catch(err => {
    logger.error('MongoDB连接失败:', err);
    process.exit(1);
  });

module.exports = app; 