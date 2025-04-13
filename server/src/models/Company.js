const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '公司名称不能为空'],
    trim: true
  },
  logo: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: [true, '公司简介不能为空']
  },
  industry: {
    type: String,
    required: [true, '所属行业不能为空']
  },
  size: {
    type: String,
    required: [true, '公司规模不能为空'],
    enum: ['1-50人', '51-200人', '201-500人', '501-1000人', '1000人以上']
  },
  location: {
    type: String,
    required: [true, '公司地址不能为空']
  },
  website: {
    type: String,
    match: [
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
      '请输入有效的网址'
    ]
  },
  welfares: [{
    type: String,
    trim: true
  }],
  contacts: {
    email: {
      type: String,
      match: [
        /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
        '请输入有效的邮箱地址'
      ]
    },
    phone: {
      type: String,
      match: [
        /^1[3-9]\d{9}$/,
        '请输入有效的手机号码'
      ]
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 虚拟字段：职位数量
companySchema.virtual('jobCount', {
  ref: 'Job',
  localField: '_id',
  foreignField: 'company',
  count: true
});

module.exports = mongoose.model('Company', companySchema); 