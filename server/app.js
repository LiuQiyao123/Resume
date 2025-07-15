require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

const app = express();

// --- 核心中间件 ---
app.use(cors()); // 允许跨域
app.use(express.json()); // 解析JSON请求体
app.use(morgan('dev')); // 打印请求日志

// --- 数据库连接 ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

// --- 健康检查路由 ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

// --- 业务路由 ---
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// --- 启动服务器 ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

module.exports = app; 