const Resume = require('../models/Resume');
const User = require('../models/User');
const PointRecord = require('../models/PointRecord');
const { logger } = require('../utils/logger');
const FileUtils = require('../utils/fileUtils');
const path = require('path');

// @desc    获取用户简历列表
// @route   GET /api/resumes
// @access  Private
exports.getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user.id })
      .select('-content')
      .sort('-updatedAt');

    res.status(200).json({
      success: true,
      data: resumes
    });
  } catch (err) {
    logger.error('获取简历列表失败:', err);
    res.status(500).json({
      success: false,
      message: '获取简历列表失败'
    });
  }
};

// @desc    获取简历详情
// @route   GET /api/resumes/:id
// @access  Private
exports.getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: '简历不存在'
      });
    }

    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (err) {
    logger.error('获取简历详情失败:', err);
    res.status(500).json({
      success: false,
      message: '获取简历详情失败'
    });
  }
};

// @desc    创建简历
// @route   POST /api/resumes
// @access  Private
exports.createResume = async (req, res) => {
  try {
    const resume = await Resume.create({
      ...req.body,
      user: req.user.id
    });

    res.status(201).json({
      success: true,
      data: resume
    });
  } catch (err) {
    logger.error('创建简历失败:', err);
    res.status(500).json({
      success: false,
      message: '创建简历失败'
    });
  }
};

// @desc    更新简历
// @route   PUT /api/resumes/:id
// @access  Private
exports.updateResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: '简历不存在'
      });
    }

    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (err) {
    logger.error('更新简历失败:', err);
    res.status(500).json({
      success: false,
      message: '更新简历失败'
    });
  }
};

// @desc    删除简历
// @route   DELETE /api/resumes/:id
// @access  Private
exports.deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: '简历不存在'
      });
    }

    // 删除简历文件
    if (resume.fileUrl) {
      await FileUtils.deleteFile(path.join(__dirname, '../../uploads/resumes', resume.fileUrl));
    }

    res.status(200).json({
      success: true,
      message: '删除简历成功'
    });
  } catch (err) {
    logger.error('删除简历失败:', err);
    res.status(500).json({
      success: false,
      message: '删除简历失败'
    });
  }
};

// @desc    优化简历
// @route   POST /api/resumes/:id/customize
// @access  Private
exports.customizeResume = async (req, res) => {
  try {
    const { jobTitle, jobDescription, template } = req.body;
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: '简历不存在'
      });
    }

    // TODO: 调用AI服务优化简历
    // 这里需要集成AI服务，根据职位信息优化简历内容

    // 更新简历
    resume.jobTitle = jobTitle;
    resume.jobDescription = jobDescription;
    resume.template = template;
    await resume.save();

    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (err) {
    logger.error('优化简历失败:', err);
    res.status(500).json({
      success: false,
      message: '优化简历失败'
    });
  }
};

// @desc    上传简历文件
// @route   POST /api/resumes/:id/upload
// @access  Private
exports.uploadResumeFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的简历文件'
      });
    }

    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: '简历不存在'
      });
    }

    // 删除旧文件
    if (resume.fileUrl) {
      await FileUtils.deleteFile(path.join(__dirname, '../../uploads/resumes', resume.fileUrl));
    }

    // 更新简历文件
    resume.fileUrl = req.file.filename;
    await resume.save();

    res.status(200).json({
      success: true,
      data: {
        fileUrl: FileUtils.getFileUrl(req.file.path)
      }
    });
  } catch (err) {
    logger.error('上传简历文件失败:', err);
    res.status(500).json({
      success: false,
      message: '上传简历文件失败'
    });
  }
};

// @desc    删除简历文件
// @route   DELETE /api/resumes/:id/file
// @access  Private
exports.deleteResumeFile = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: '简历不存在'
      });
    }

    if (!resume.fileUrl) {
      return res.status(400).json({
        success: false,
        message: '简历没有附件'
      });
    }

    // 删除文件
    await FileUtils.deleteFile(path.join(__dirname, '../../uploads/resumes', resume.fileUrl));

    // 清除文件URL
    resume.fileUrl = '';
    await resume.save();

    res.status(200).json({
      success: true,
      message: '删除简历文件成功'
    });
  } catch (err) {
    logger.error('删除简历文件失败:', err);
    res.status(500).json({
      success: false,
      message: '删除简历文件失败'
    });
  }
}; 