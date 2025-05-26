import { showToast } from '../../utils/toast';
import config from '../../config';

const app = getApp();

Page({
  data: {
    isLoading: false
  },

  onLoad() {
    // 检查云开发是否初始化
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      return;
    }
    
    // 检查是否支持getUserProfile接口
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      });
    }
    
    // 打印环境配置信息
    console.log('当前登录页环境:', {
      cloudEnv: app.globalData.cloudEnv,
      serviceId: app.globalData.serviceId
    });
  },

  // 登录按钮点击事件
  async login() {
    if (this.data.isLoading) return;
    
    this.setData({ isLoading: true });
    wx.showLoading({ title: '登录中...' });

    try {
      // 1. 获取微信登录凭证
      const loginRes = await this.wxLogin();
      
      if (!loginRes.code) {
        throw new Error('获取登录凭证失败');
      }

      // 2. 发送 code 到服务器换取登录态
      const result = await this.serverLogin(loginRes.code);
      
      if (result.success) {
        // 保存登录信息
        wx.setStorageSync('token', result.token);
        wx.setStorageSync('userInfo', result.userInfo);

        showToast({
          title: '登录成功',
          icon: 'success'
        });

        // 跳转逻辑
        const pages = getCurrentPages();
        if (pages.length > 1) {
          wx.navigateBack();
        } else {
          wx.switchTab({
            url: '/pages/index/index'
          });
        }
      } else {
        throw new Error(result.message || '登录失败');
      }
      
    } catch (error) {
      console.error('登录失败：', error);
      showToast({
        title: error.message || '登录失败，请重试'
      });
    } finally {
      wx.hideLoading();
      this.setData({ isLoading: false });
    }
  },

  // 封装 wx.login 为 Promise
  wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: resolve,
        fail: (error) => {
          console.error('wx.login 失败：', error);
          reject(new Error('微信登录失败，请重试'));
        }
      });
    });
  },

  // 服务器登录
  async serverLogin(code) {
    try {
      if (!config.api || !config.api.login) {
        throw new Error('登录接口未配置');
      }

      const response = await wx.request({
        url: config.api.login,
        method: 'POST',
        data: {
          code,
          appId: config.appId
        }
      });

      if (!response.data) {
        throw new Error('服务器响应异常');
      }

      return response.data;
      
    } catch (error) {
      console.error('服务器登录失败：', error);
      throw new Error('服务器登录失败，请重试');
    }
  },

  // 返回上一页
  goBack() {
    wx.navigateBack({
      fail: () => {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }
    });
  }
}) 