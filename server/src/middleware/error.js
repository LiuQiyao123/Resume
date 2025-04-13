const logger = require('../utils/logger');

// 自定义错误类
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // 开发环境返回详细错误信息
  if (process.env.NODE_ENV === 'development') {
    logger.error('错误详情:', {
      message: err.message,
      stack: err.stack,
      status: err.status,
      statusCode: err.statusCode
    });

    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        stack: err.stack,
        status: err.status,
        statusCode: err.statusCode,
        errors: err.errors
      }
    });
  } 
  // 生产环境返回简洁错误信息
  else {
    // 记录错误日志
    logger.error('错误:', {
      message: err.message,
      status: err.status,
      statusCode: err.statusCode
    });

    // 操作型错误：发送错误消息
    if (err.isOperational) {
      res.status(err.statusCode).json({
        success: false,
        message: err.message,
        errors: err.errors
      });
    }
    // 编程错误：发送通用错误消息
    else {
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }
};

module.exports = {
  AppError,
  errorHandler
}; 