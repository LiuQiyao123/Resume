import config from '../config';
import request from '../utils/request';

class LoginService {
  constructor() {
    this.config = config;
  }

  // 执行微信登录
  async login(userInfo) {
    if (!userInfo) {
      throw new Error('获取用户信息失败');
    }

    try {
      // 获取微信登录凭证
      const { code } = await wx.login();
      
      // 调用后端登录接口
      const loginResult = await this.requestLogin(code, userInfo);
      
      // 保存登录信息
      this.saveLoginInfo(loginResult);
      
      return loginResult;
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  }

  // 获取用户信息
  // async getUserProfile() { ... } // 这个函数不再需要，我们可以注释或删除它

  // 调用后端登录接口
  async requestLogin(code, userInfo) {
    return request({
      url: config.getApiPath(config.api.login),
      method: 'POST',
      data: {
        code,
        userInfo
      }
    });
  }

  // 保存登录信息
  saveLoginInfo(loginResult) {
    try {
      const data = loginResult.data || loginResult;
      wx.setStorageSync('token', data.token);
      wx.setStorageSync('userInfo', data.user);
    } catch (error) {
      console.error('保存登录信息失败:', error);
      throw error;
    }
  }

  // 检查是否已登录
  checkLoginStatus() {
    try {
      const token = wx.getStorageSync('token');
      return !!token;
    } catch (error) {
      console.error('检查登录状态失败:', error);
      return false;
    }
  }

  // 刷新登录态
  async refreshToken() {
    const oldToken = wx.getStorageSync('token');
    if (!oldToken) {
      throw new Error('本地没有token，无需刷新');
    }
    const response = await request({
      url: config.getApiPath(config.api.refreshToken),
      method: 'POST',
      data: {
        token: oldToken
      }
    });
    const data = response.data || response;
    wx.setStorageSync('token', data.token);
    return data.token;
  }

  // 退出登录
  logout() {
    try {
      wx.removeStorageSync('token');
      wx.removeStorageSync('userInfo');
    } catch (error) {
      console.error('退出登录失败:', error);
      throw error;
    }
  }

  // 绑定手机号
  async bindPhoneNumber(codeOrEncryptedData, iv) {
    if (!codeOrEncryptedData) {
      throw new Error('缺少手机号验证数据');
    }
    
    // 判断是使用新的code方式还是旧的encryptedData方式
    const requestData = iv ? {
      // 旧方式：encryptedData + iv
      encryptedData: codeOrEncryptedData,
      iv
    } : {
      // 新方式：code
      code: codeOrEncryptedData
    };
    
    return request({
      url: config.getApiPath(config.api.bindPhone),
      method: 'POST',
      data: requestData
    });
  }
}

export default new LoginService(); 