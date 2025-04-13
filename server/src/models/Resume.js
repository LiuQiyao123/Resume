const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, '请提供简历标题'],
      trim: true,
    },
    basicInfo: {
      name: {
        type: String,
        required: [true, '请提供姓名'],
        trim: true,
      },
      phone: {
        type: String,
        required: [true, '请提供手机号码'],
        match: [/^1[3456789]\d{9}$/, '请输入有效的手机号码'],
      },
      email: {
        type: String,
        required: [true, '请提供邮箱'],
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '请输入有效的邮箱'],
      },
      gender: {
        type: String,
        enum: ['男', '女', '保密'],
        default: '保密',
      },
      birth: {
        type: String,
      },
      location: {
        type: String,
      },
      avatar: {
        type: String,
      },
      jobTitle: {
        type: String,
      },
      jobYear: {
        type: String,
      },
    },
    education: [{
      school: {
        type: String,
        required: true,
      },
      degree: {
        type: String,
        required: true,
      },
      major: {
        type: String,
        required: true,
      },
      startDate: {
        type: String,
        required: true,
      },
      endDate: {
        type: String,
        required: true,
      },
      description: {
        type: String,
      },
    }],
    experience: [{
      company: {
        type: String,
        required: true,
      },
      position: {
        type: String,
        required: true,
      },
      startDate: {
        type: String,
        required: true,
      },
      endDate: {
        type: String,
        required: true,
      },
      description: {
        type: String,
      },
    }],
    projects: [{
      name: {
        type: String,
        required: true,
      },
      role: {
        type: String,
      },
      startDate: {
        type: String,
      },
      endDate: {
        type: String,
      },
      description: {
        type: String,
      },
    }],
    skills: [{
      name: {
        type: String,
        required: true,
      },
      level: {
        type: String,
        enum: ['入门', '熟练', '精通'],
        default: '熟练',
      },
    }],
    template: {
      type: String,
      enum: ['standard', 'professional', 'creative'],
      default: 'standard',
    },
    customizations: [{
      jobTitle: {
        type: String,
        required: true,
      },
      company: {
        type: String,
      },
      jobDescription: {
        type: String,
      },
      optimizedContent: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Resume', ResumeSchema);