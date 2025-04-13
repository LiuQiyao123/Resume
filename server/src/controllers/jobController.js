const Job = require('../models/Job');
const Application = require('../models/Application');
const Collection = require('../models/Collection');
const Company = require('../models/Company');
const { logger } = require('../utils/logger');

// @desc    获取职位列表
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10, keyword, category, location } = req.query;
    const query = {};

    // 搜索条件
    if (keyword) {
      query.$or = [
        { title: new RegExp(keyword, 'i') },
        { company: new RegExp(keyword, 'i') },
        { description: new RegExp(keyword, 'i') }
      ];
    }
    if (category) {
      query.category = category;
    }
    if (location) {
      query.location = new RegExp(location, 'i');
    }

    // 分页
    const jobs = await Job.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    res.status(200).json({
      success: true,
      data: jobs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    logger.error('获取职位列表失败:', err);
    res.status(500).json({
      success: false,
      message: '获取职位列表失败'
    });
  }
};

// @desc    获取职位详情
// @route   GET /api/jobs/:id
// @access  Public
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: '职位不存在'
      });
    }

    // 如果用户已登录，获取收藏状态
    let isCollected = false;
    if (req.user) {
      const collection = await Collection.findOne({
        user: req.user.id,
        job: job._id
      });
      isCollected = !!collection;
    }

    res.status(200).json({
      success: true,
      data: {
        ...job.toObject(),
        isCollected
      }
    });
  } catch (err) {
    logger.error('获取职位详情失败:', err);
    res.status(500).json({
      success: false,
      message: '获取职位详情失败'
    });
  }
};

// @desc    创建职位
// @route   POST /api/jobs
// @access  Private
exports.createJob = async (req, res) => {
  try {
    const job = await Job.create({
      ...req.body,
      publisher: req.user.id
    });

    res.status(201).json({
      success: true,
      data: job
    });
  } catch (err) {
    logger.error('创建职位失败:', err);
    res.status(500).json({
      success: false,
      message: '创建职位失败'
    });
  }
};

// @desc    更新职位
// @route   PUT /api/jobs/:id
// @access  Private
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, publisher: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: '职位不存在或无权限修改'
      });
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (err) {
    logger.error('更新职位失败:', err);
    res.status(500).json({
      success: false,
      message: '更新职位失败'
    });
  }
};

// @desc    删除职位
// @route   DELETE /api/jobs/:id
// @access  Private
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      publisher: req.user.id
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: '职位不存在或无权限删除'
      });
    }

    // 删除相关的申请记录
    await Application.deleteMany({ job: job._id });
    // 删除相关的收藏记录
    await Collection.deleteMany({ job: job._id });

    res.status(200).json({
      success: true,
      message: '删除职位成功'
    });
  } catch (err) {
    logger.error('删除职位失败:', err);
    res.status(500).json({
      success: false,
      message: '删除职位失败'
    });
  }
};

// @desc    获取职位申请列表
// @route   GET /api/jobs/:id/applications
// @access  Private
exports.getJobApplications = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      publisher: req.user.id
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: '职位不存在或无权限查看'
      });
    }

    const applications = await Application.find({ job: job._id })
      .populate('user', 'nickName avatarUrl')
      .populate('resume', 'title')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: applications
    });
  } catch (err) {
    logger.error('获取职位申请列表失败:', err);
    res.status(500).json({
      success: false,
      message: '获取职位申请列表失败'
    });
  }
};

// @desc    获取职位分类列表
// @route   GET /api/jobs/categories
// @access  Public
exports.getJobCategories = async (req, res) => {
  try {
    const categories = await Job.distinct('category');
    
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (err) {
    logger.error('获取职位分类列表失败:', err);
    res.status(500).json({
      success: false,
      message: '获取职位分类列表失败'
    });
  }
};

// @desc    获取职位地点列表
// @route   GET /api/jobs/locations
// @access  Public
exports.getJobLocations = async (req, res) => {
  try {
    const locations = await Job.distinct('location');
    
    res.status(200).json({
      success: true,
      data: locations
    });
  } catch (err) {
    logger.error('获取职位地点列表失败:', err);
    res.status(500).json({
      success: false,
      message: '获取职位地点列表失败'
    });
  }
};

// @desc    获取相似职位
// @route   GET /api/jobs/:id/similar
// @access  Public
exports.getSimilarJobs = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: '职位不存在'
      });
    }

    // 根据职位类别和地点查找相似职位
    const similarJobs = await Job.find({
      _id: { $ne: job._id },
      $or: [
        { category: job.category },
        { location: job.location }
      ]
    })
    .limit(5)
    .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: similarJobs
    });
  } catch (err) {
    logger.error('获取相似职位失败:', err);
    res.status(500).json({
      success: false,
      message: '获取相似职位失败'
    });
  }
};

// @desc    获取公司信息
// @route   GET /api/jobs/companies/:id
// @access  Public
exports.getCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: '公司不存在'
      });
    }

    // 获取该公司的职位数量
    const jobCount = await Job.countDocuments({ company: company._id });

    res.status(200).json({
      success: true,
      data: {
        ...company.toObject(),
        jobCount
      }
    });
  } catch (err) {
    logger.error('获取公司信息失败:', err);
    res.status(500).json({
      success: false,
      message: '获取公司信息失败'
    });
  }
}; 