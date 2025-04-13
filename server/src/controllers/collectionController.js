const Collection = require('../models/Collection');
const Job = require('../models/Job');
const { logger } = require('../utils/logger');

// @desc    获取用户的收藏列表
// @route   GET /api/collections
// @access  Private
exports.getUserCollections = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const collections = await Collection.find({ user: req.user.id })
      .populate('job', 'title company location salary description requirements')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Collection.countDocuments({ user: req.user.id });

    res.status(200).json({
      success: true,
      data: collections,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    logger.error('获取收藏列表失败:', err);
    res.status(500).json({
      success: false,
      message: '获取收藏列表失败'
    });
  }
};

// @desc    添加收藏
// @route   POST /api/collections
// @access  Private
exports.addCollection = async (req, res) => {
  try {
    const { jobId } = req.body;

    // 检查职位是否存在
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: '职位不存在'
      });
    }

    // 检查是否已经收藏
    const existingCollection = await Collection.findOne({
      user: req.user.id,
      job: jobId
    });
    if (existingCollection) {
      return res.status(400).json({
        success: false,
        message: '您已经收藏过这个职位'
      });
    }

    // 创建收藏
    const collection = await Collection.create({
      user: req.user.id,
      job: jobId
    });

    res.status(201).json({
      success: true,
      data: collection
    });
  } catch (err) {
    logger.error('添加收藏失败:', err);
    res.status(500).json({
      success: false,
      message: '添加收藏失败'
    });
  }
};

// @desc    取消收藏
// @route   DELETE /api/collections/:id
// @access  Private
exports.removeCollection = async (req, res) => {
  try {
    const collection = await Collection.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: '收藏记录不存在'
      });
    }

    res.status(200).json({
      success: true,
      message: '取消收藏成功'
    });
  } catch (err) {
    logger.error('取消收藏失败:', err);
    res.status(500).json({
      success: false,
      message: '取消收藏失败'
    });
  }
};

// @desc    检查是否已收藏
// @route   GET /api/collections/check/:jobId
// @access  Private
exports.checkCollection = async (req, res) => {
  try {
    const collection = await Collection.findOne({
      user: req.user.id,
      job: req.params.jobId
    });

    res.status(200).json({
      success: true,
      data: {
        isCollected: !!collection,
        collectionId: collection?._id
      }
    });
  } catch (err) {
    logger.error('检查收藏状态失败:', err);
    res.status(500).json({
      success: false,
      message: '检查收藏状态失败'
    });
  }
};

// @desc    获取收藏统计
// @route   GET /api/collections/stats
// @access  Private
exports.getCollectionStats = async (req, res) => {
  try {
    const total = await Collection.countDocuments({ user: req.user.id });

    res.status(200).json({
      success: true,
      data: {
        total
      }
    });
  } catch (err) {
    logger.error('获取收藏统计失败:', err);
    res.status(500).json({
      success: false,
      message: '获取收藏统计失败'
    });
  }
}; 