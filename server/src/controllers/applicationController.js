const Application = require('../models/Application');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const { logger } = require('../utils/logger');

// @desc    获取用户的申请列表
// @route   GET /api/applications
// @access  Private
exports.getUserApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { user: req.user.id };

    if (status) {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate('job', 'title company location salary')
      .populate('resume', 'title')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(query);

    res.status(200).json({
      success: true,
      data: applications,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    logger.error('获取申请列表失败:', err);
    res.status(500).json({
      success: false,
      message: '获取申请列表失败'
    });
  }
};

// @desc    获取申请详情
// @route   GET /api/applications/:id
// @access  Private
exports.getApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user.id
    })
    .populate('job', 'title company location salary description requirements')
    .populate('resume', 'title basicInfo education experience skills');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: '申请记录不存在'
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (err) {
    logger.error('获取申请详情失败:', err);
    res.status(500).json({
      success: false,
      message: '获取申请详情失败'
    });
  }
};

// @desc    创建职位申请
// @route   POST /api/applications
// @access  Private
exports.createApplication = async (req, res) => {
  try {
    const { job, resume, coverLetter } = req.body;

    // 检查职位是否存在
    const jobExists = await Job.findById(job);
    if (!jobExists) {
      return res.status(404).json({
        success: false,
        message: '职位不存在'
      });
    }

    // 检查简历是否存在
    const resumeExists = await Resume.findOne({
      _id: resume,
      user: req.user.id
    });
    if (!resumeExists) {
      return res.status(404).json({
        success: false,
        message: '简历不存在'
      });
    }

    // 检查是否已经申请过
    const existingApplication = await Application.findOne({
      user: req.user.id,
      job
    });
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: '您已经申请过这个职位了'
      });
    }

    // 创建申请记录
    const application = await Application.create({
      user: req.user.id,
      job,
      resume,
      coverLetter
    });

    res.status(201).json({
      success: true,
      data: application
    });
  } catch (err) {
    logger.error('创建申请失败:', err);
    res.status(500).json({
      success: false,
      message: '创建申请失败'
    });
  }
};

// @desc    更新申请状态
// @route   PUT /api/job-applications/:id/status
// @access  Private
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: '申请记录不存在'
      });
    }

    // 检查状态是否有效
    if (!['pending', 'reviewing', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: '无效的状态值'
      });
    }

    application.status = status;
    await application.save();

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (err) {
    logger.error('更新申请状态失败:', err);
    res.status(500).json({
      success: false,
      message: '更新申请状态失败'
    });
  }
};

// @desc    撤回申请
// @route   DELETE /api/applications/:id
// @access  Private
exports.withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
      status: 'pending'
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: '申请记录不存在或无法撤回'
      });
    }

    res.status(200).json({
      success: true,
      message: '撤回申请成功'
    });
  } catch (err) {
    logger.error('撤回申请失败:', err);
    res.status(500).json({
      success: false,
      message: '撤回申请失败'
    });
  }
};

// @desc    获取申请统计
// @route   GET /api/job-applications/stats
// @access  Private
exports.getApplicationStats = async (req, res) => {
  try {
    const stats = await Application.aggregate([
      {
        $match: { user: req.user.id }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      total: 0,
      pending: 0,
      reviewing: 0,
      accepted: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
    });

    res.status(200).json({
      success: true,
      data: formattedStats
    });
  } catch (err) {
    logger.error('获取申请统计失败:', err);
    res.status(500).json({
      success: false,
      message: '获取申请统计失败'
    });
  }
}; 