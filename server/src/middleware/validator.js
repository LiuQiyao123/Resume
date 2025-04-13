const { validationResult, body, query, param } = require('express-validator');
const { AppError } = require('./error');

// 验证请求参数
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new AppError('验证失败', 400);
    error.errors = errors.array().map(err => ({
      field: err.param,
      message: err.msg
    }));
    return next(error);
  }
  next();
};

// 验证规则
exports.rules = {
  // 用户相关验证规则
  login: [
    body('code').notEmpty().withMessage('请提供微信授权码'),
  ],
  updateProfile: [
    body('nickName')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('昵称不能为空')
      .isLength({ min: 2, max: 20 })
      .withMessage('昵称长度应在2-20个字符之间'),
    body('phone')
      .optional()
      .matches(/^1[3-9]\d{9}$/)
      .withMessage('请输入有效的手机号码'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('请输入有效的邮箱地址')
  ],
  
  // 简历相关验证规则
  createResume: [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('简历标题不能为空')
      .isLength({ min: 2, max: 50 })
      .withMessage('简历标题长度应在2-50个字符之间'),
    body('basicInfo')
      .notEmpty()
      .withMessage('基本信息不能为空')
      .isObject()
      .withMessage('基本信息格式不正确'),
    body('basicInfo.name')
      .trim()
      .notEmpty()
      .withMessage('姓名不能为空')
      .isLength({ min: 2, max: 20 })
      .withMessage('姓名长度应在2-20个字符之间'),
    body('basicInfo.gender')
      .trim()
      .notEmpty()
      .withMessage('性别不能为空')
      .isIn(['男', '女'])
      .withMessage('性别只能是男或女'),
    body('basicInfo.age')
      .optional()
      .isInt({ min: 16, max: 100 })
      .withMessage('年龄应在16-100岁之间'),
    body('basicInfo.phone')
      .matches(/^1[3-9]\d{9}$/)
      .withMessage('请输入有效的手机号码'),
    body('basicInfo.email')
      .isEmail()
      .withMessage('请输入有效的邮箱地址'),
    body('education').isArray().withMessage('教育经历必须是数组'),
    body('education.*.school').notEmpty().withMessage('请提供学校名称'),
    body('education.*.degree').notEmpty().withMessage('请提供学位'),
    body('education.*.major').notEmpty().withMessage('请提供专业'),
    body('experience').isArray().withMessage('工作经历必须是数组'),
    body('experience.*.company').notEmpty().withMessage('请提供公司名称'),
    body('experience.*.position').notEmpty().withMessage('请提供职位名称'),
    body('projects').isArray().withMessage('项目经历必须是数组'),
    body('projects.*.name').notEmpty().withMessage('请提供项目名称'),
    body('projects.*.role').notEmpty().withMessage('请提供项目角色'),
  ],
  updateResume: [
    param('id').isMongoId().withMessage('无效的简历ID'),
    body('title').optional().notEmpty().withMessage('简历标题不能为空'),
    body('basicInfo.name').optional().notEmpty().withMessage('姓名不能为空'),
    body('basicInfo.phone').optional().matches(/^1[3456789]\d{9}$/).withMessage('请输入有效的手机号码'),
    body('basicInfo.email').optional().isEmail().withMessage('请输入有效的邮箱地址'),
  ],
  customizeResume: [
    param('id').isMongoId().withMessage('无效的简历ID'),
    body('jobTitle').notEmpty().withMessage('请提供目标职位'),
    body('jobDescription').optional().isLength({ max: 1000 }).withMessage('职位描述不能超过1000字'),
    body('template').optional().isIn(['standard', 'professional', 'creative']).withMessage('不支持的模板类型'),
  ],
  
  // 职位相关验证规则
  getJobs: [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('每页数量必须在1-50之间'),
    query('keyword').optional().trim().isLength({ min: 2 }).withMessage('搜索关键词至少2个字符'),
    query('location').optional().trim().notEmpty().withMessage('地区不能为空'),
    query('salary').optional().matches(/^\d+-\d+$/).withMessage('薪资范围格式不正确'),
  ],
  getSimilarJobs: [
    query('jobId').isMongoId().withMessage('无效的职位ID'),
    query('limit').optional().isInt({ min: 1, max: 10 }).withMessage('推荐数量必须在1-10之间'),
  ],
  
  // 职位申请相关验证规则
  createApplication: [
    body('job')
      .notEmpty()
      .withMessage('职位ID不能为空')
      .isMongoId()
      .withMessage('无效的职位ID'),
    body('resume')
      .notEmpty()
      .withMessage('简历ID不能为空')
      .isMongoId()
      .withMessage('无效的简历ID'),
    body('coverLetter')
      .optional()
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('求职信长度应在10-1000个字符之间')
  ],
  
  // 收藏相关验证规则
  addCollection: [
    body('jobId').isMongoId().withMessage('无效的职位ID'),
  ],
  removeCollection: [
    body('jobId').isMongoId().withMessage('无效的职位ID'),
  ],
  checkCollection: [
    query('jobId').isMongoId().withMessage('无效的职位ID'),
  ],
  
  // 积分相关验证规则
  rechargePoints: [
    body('amount').isInt({ min: 1 }).withMessage('请提供有效的充值金额'),
    body('paymentMethod').optional().isIn(['wechat', 'alipay']).withMessage('不支持的支付方式'),
  ],
  getPointRecords: [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('每页数量必须在1-50之间'),
    query('type').optional().isIn(['income', 'expense']).withMessage('无效的记录类型'),
    query('startDate').optional().isISO8601().withMessage('开始日期格式不正确'),
    query('endDate').optional().isISO8601().withMessage('结束日期格式不正确'),
  ],
}; 