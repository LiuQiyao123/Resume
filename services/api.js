import config from '../config';
import store from '../store/index';

// API 请求封装
const request = async (options) => {
  const { url, method = 'GET', data, needAuth = true } = options;

  const header = {
    'Content-Type': 'application/json'
  };

  if (needAuth) {
    const token = store.state.token;
    if (token) {
      header.Authorization = `Bearer ${token}`;
    }
  }

  try {
    const response = await wx.request({
      url: `${config.baseUrl}${url}`,
      method,
      data,
      header
    });

    if (response.statusCode === 401) {
      store.clearLoginState();
      wx.navigateTo({ url: '/pages/login/login' });
      throw new Error('登录已过期');
    }

    if (response.statusCode !== 200) {
      throw new Error(`请求失败: ${response.statusCode}`);
    }

    return response.data;
  } catch (error) {
    console.error('请求失败：', error);
    throw error;
  }
};

// API 接口定义
export const api = {
  // 用户相关接口
  user: {
    // 登录
    login: async (code) => {
      if (store.state.isTestMode) {
        return {
          success: true,
          data: {
            token: 'test_token_123',
            userInfo: store.testData.userInfo
          }
        };
      }
      return request({
        url: '/api/login',
        method: 'POST',
        data: { code },
        needAuth: false
      });
    },

    // 获取用户信息
    getUserInfo: async () => {
      if (store.state.isTestMode) {
        return {
          success: true,
          data: store.testData.userInfo
        };
      }
      return request({
        url: '/api/user/info',
        method: 'GET'
      });
    }
  },

  // 简历相关接口
  resume: {
    // 获取简历数据
    getResumeData: async () => {
      if (store.state.isTestMode) {
        return {
          success: true,
          data: store.testData.resumeData
        };
      }
      return request({
        url: '/api/resume',
        method: 'GET'
      });
    },

    // 更新简历数据
    updateResumeData: async (data) => {
      if (store.state.isTestMode) {
        store.updateResumeData(data);
        return {
          success: true,
          data: store.state.resumeData
        };
      }
      return request({
        url: '/api/resume',
        method: 'PUT',
        data
      });
    }
  }
}; 