const mongoose = require('mongoose');

const PointRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['income', 'expense'],
    default: 'income'
  },
  category: {
    type: String,
    required: true,
    enum: ['每日签到', '简历优化', '充值', '其他'],
    default: '其他'
  },
  description: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PointRecord', PointRecordSchema); 