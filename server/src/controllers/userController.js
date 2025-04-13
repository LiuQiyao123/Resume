const User = require('../models/User');
const PointRecord = require('../models/PointRecord');
const Resume = require('../models/Resume');
const { AppError } = require('../middleware/error');
const { generateToken } = require('../utils/jwt');
const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

// @desc    登录/注册用户（通过微信授权）
// @route   POST /api/users/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { code } = req.body;
    
    // TODO: 调用微信API获取openId
    const openId = 'test_openid'; // 测试用，实际应该调用微信API

    // 查找或创建用户
    let user = await User.findOne({ openId });
    if (!user) {
      user = await User.create({
        openId,
        nickName: '新用户',
        avatarUrl: ''
      });
    }

    // 生成token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          nickName: user.nickName,
          avatarUrl: user.avatarUrl,
          points: user.points
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    获取用户个人资料
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-openId');
    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    更新用户个人资料
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { nickName, phone, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { nickName, phone, email },
      { new: true, runValidators: true }
    ).select('-openId');

    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    获取用户积分
// @route   GET /api/users/points
// @access  Private
exports.getPoints = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('points');
    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    res.status(200).json({
      success: true,
      data: {
        points: user.points
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    获取用户简历数量
// @route   GET /api/users/resumes/count
// @access  Private
exports.getResumeCount = async (req, res, next) => {
  try {
    const count = await Resume.countDocuments({ user: req.user.id });

    res.status(200).json({
      success: true,
      data: {
        count
      }
    });
  } catch (error) {
    next(error);
  }
};

// 上传头像
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('请上传头像文件', 400);
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    // 如果用户已有头像，删除旧头像
    if (user.avatarUrl) {
      const oldAvatarPath = path.join(__dirname, '../../', user.avatarUrl);
      try {
        await fs.unlink(oldAvatarPath);
      } catch (error) {
        logger.error('删除旧头像失败:', error);
      }
    }

    // 更新用户头像URL
    user.avatarUrl = req.file.path.replace(/\\/g, '/');
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

// 删除头像
exports.deleteAvatar = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    if (!user.avatarUrl) {
      throw new AppError('用户没有头像', 400);
    }

    // 删除头像文件
    const avatarPath = path.join(__dirname, '../../', user.avatarUrl);
    try {
      await fs.unlink(avatarPath);
    } catch (error) {
      logger.error('删除头像文件失败:', error);
    }

    // 清除用户头像URL
    user.avatarUrl = '';
    await user.save();

    res.status(200).json({
      success: true,
      message: '头像已删除'
    });
  } catch (error) {
    next(error);
  }
}; 