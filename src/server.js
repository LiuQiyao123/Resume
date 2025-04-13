/**
 * @file 服务器启动入口
 * @description 启动Express服务器并连接数据库
 * @created 2023-06-01
 */

const app = require('./app');
const mongoose = require('mongoose');
const logger = require('./utils/logger');

// 加载环境变量
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_resume';

// 连接数据库
mongoose.connect(MONGODB_URI)
  .then(() => {
    logger.info('MongoDB连接成功');
    
    // 启动服务器
    app.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('MongoDB连接失败:', err);
    process.exit(1);
  });

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  logger.error('未捕获的异常:', err);
  process.exit(1);
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的Promise拒绝:', reason);
  // 不立即退出，记录错误后继续运行
}); 