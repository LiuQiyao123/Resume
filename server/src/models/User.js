const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  openId: {
    type: String,
    required: true,
    unique: true
  },
  nickName: {
    type: String,
    required: true,
    trim: true
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    match: [/^1[3-9]\d{9}$/, '请输入有效的手机号码'],
    sparse: true
  },
  email: {
    type: String,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '请输入有效的邮箱地址'],
    sparse: true
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 更新时自动更新updatedAt字段
userSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('lastLoginAt')) {
    this.lastLoginAt = Date.now();
  }
  this.updatedAt = Date.now();
  next();
});

// 生成JWT令牌
userSchema.methods.generateToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

module.exports = mongoose.model('User', userSchema); 