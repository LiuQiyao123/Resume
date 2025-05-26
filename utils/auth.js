import config from '../config';

// 检查登录状态
export const checkLogin = () => {
  // 测试模式下始终返回已登录
  if (config.isTestMode) {
    return true;
  }
  
  const token = wx.getStorageSync('token');
  const userInfo = wx.getStorageSync('userInfo');
  return !!(token && userInfo);
};

// 获取用户信息
export const getUserInfo = () => {
  // 测试模式下返回测试用户信息
  if (config.isTestMode) {
    return config.testUser.userInfo;
  }
  
  return wx.getStorageSync('userInfo');
};

// 获取token
export const getToken = () => {
  // 测试模式下返回测试token
  if (config.isTestMode) {
    return config.testUser.token;
  }
  
  return wx.getStorageSync('token');
}; 