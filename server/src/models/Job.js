const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, '请提供职位标题'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, '请提供公司名称'],
      trim: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    salary: {
      type: String,
      required: [true, '请提供薪资范围'],
    },
    city: {
      type: String,
      required: [true, '请提供工作城市'],
    },
    experience: {
      type: String,
      required: [true, '请提供经验要求'],
    },
    education: {
      type: String,
      required: [true, '请提供学历要求'],
    },
    description: {
      type: String,
      required: [true, '请提供职位描述'],
    },
    requirement: {
      type: String,
      required: [true, '请提供任职要求'],
    },
    address: {
      type: String,
      required: [true, '请提供工作地址'],
    },
    keywords: [String],
    pubDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    applications: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// 创建文本索引用于搜索
JobSchema.index({
  title: 'text',
  company: 'text',
  description: 'text',
  requirement: 'text',
  keywords: 'text',
});

module.exports = mongoose.model('Job', JobSchema); 