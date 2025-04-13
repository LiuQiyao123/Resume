const jwt = require('jsonwebtoken');
const { AppError } = require('./error');
const User = require('../models/User');

// 保护路由中间件
exports.protect = async (req, res, next) => {
  try {
    let token;

    // 从请求头获取token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 检查token是否存在
    if (!token) {
      throw new AppError('未授权访问', 401);
    }

    try {
      // 验证token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 检查用户是否存在
      const user = await User.findById(decoded.id);
      if (!user) {
        throw new AppError('用户不存在', 401);
      }

      // 将用户信息添加到请求对象
      req.user = user;
      next();
    } catch (error) {
      throw new AppError('无效的token', 401);
    }
  } catch (error) {
    next(error);
  }
};

// 角色授权
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user.role || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `用户角色 ${req.user.role} 无权限访问此资源`,
      });
    }
    next();
  };
}; 