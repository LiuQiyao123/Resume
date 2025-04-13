const User = require('../models/User');
const PointRecord = require('../models/PointRecord');

// @desc    获取积分记录列表
// @route   GET /api/points/records
// @access  Private
exports.getPointRecords = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const total = await PointRecord.countDocuments({ user: req.user.id });
    const records = await PointRecord.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    // 格式化记录
    const formattedRecords = records.map(record => ({
      id: record._id,
      title: record.title,
      amount: record.amount,
      type: record.type,
      category: record.category,
      description: record.description,
      time: record.createdAt.toLocaleString(),
    }));

    res.status(200).json({
      success: true,
      count: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      records: formattedRecords,
    });
  } catch (err) {
    console.error('获取积分记录错误:', err);
    res.status(500).json({
      success: false,
      message: '服务器错误',
    });
  }
};

// @desc    积分充值
// @route   POST /api/points/recharge
// @access  Private
exports.rechargePoints = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: '请提供有效的充值金额',
      });
    }

    // 假设充值成功，这里应该有支付处理的代码
    // 实际应用中需要接入微信支付等支付接口

    // 更新用户积分
    const user = await User.findById(req.user.id);
    user.points += parseInt(amount);
    await user.save();

    // 创建积分记录
    const pointRecord = await PointRecord.create({
      user: req.user.id,
      title: '积分充值',
      amount: parseInt(amount),
      type: 'income',
      category: '充值',
      description: `通过${paymentMethod || '支付'}充值${amount}积分`,
    });

    res.status(200).json({
      success: true,
      data: {
        points: user.points,
        record: {
          id: pointRecord._id,
          title: pointRecord.title,
          amount: pointRecord.amount,
          type: pointRecord.type,
          category: pointRecord.category,
          time: pointRecord.createdAt.toLocaleString(),
        },
      },
    });
  } catch (err) {
    console.error('积分充值错误:', err);
    res.status(500).json({
      success: false,
      message: '服务器错误',
    });
  }
};

// @desc    每日签到
// @route   POST /api/points/sign-in
// @access  Private
exports.dailySignIn = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // 检查是否已经签到
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingSignIn = await PointRecord.findOne({
      user: req.user.id,
      category: '每日签到',
      createdAt: { $gte: today },
    });

    if (existingSignIn) {
      return res.status(400).json({
        success: false,
        message: '今日已签到',
      });
    }

    // 签到奖励积分
    const signInPoints = 10;
    user.points += signInPoints;
    await user.save();

    // 创建积分记录
    const pointRecord = await PointRecord.create({
      user: req.user.id,
      title: '每日签到',
      amount: signInPoints,
      type: 'income',
      category: '每日签到',
      description: '完成每日签到获得积分奖励',
    });

    res.status(200).json({
      success: true,
      data: {
        points: user.points,
        signInPoints,
        record: {
          id: pointRecord._id,
          title: pointRecord.title,
          amount: pointRecord.amount,
          type: pointRecord.type,
          category: pointRecord.category,
          time: pointRecord.createdAt.toLocaleString(),
        },
      },
    });
  } catch (err) {
    console.error('每日签到错误:', err);
    res.status(500).json({
      success: false,
      message: '服务器错误',
    });
  }
};

// @desc    检查今日是否已签到
// @route   GET /api/points/sign-in/check
// @access  Private
exports.checkSignIn = async (req, res) => {
  try {
    // 获取今日开始时间
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 查询今日是否已签到
    const existingSignIn = await PointRecord.findOne({
      user: req.user.id,
      category: '每日签到',
      createdAt: { $gte: today },
    });

    res.status(200).json({
      success: true,
      signed: !!existingSignIn,
    });
  } catch (err) {
    console.error('检查签到状态错误:', err);
    res.status(500).json({
      success: false,
      message: '服务器错误',
    });
  }
}; 