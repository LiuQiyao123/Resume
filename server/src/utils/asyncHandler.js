const { AppError } = require('../middleware/error');

// 异步处理包装器
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 错误处理包装器
const errorHandler = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        next(new AppError(error.message, 500));
      }
    }
  };
};

module.exports = {
  asyncHandler,
  errorHandler
}; 