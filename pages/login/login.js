import { api } from '../../services/api';
import store from '../../store/index';
import { showToast } from '../../utils/toast';
import config from '../../config';

const app = getApp();

Page({
  data: {
    isLoading: false,
    isTestMode: config.isTestMode // 添加测试模式标记
  },

  onLoad() {
    // 如果已经登录，直接跳转
    if (store.checkLoginStatus()) {
      this.navigateBack();
    }

    // 测试模式自动登录
    if (store.state.isTestMode) {
      this.handleTestModeLogin();
    }

    // 初始化store
    store.init();
    
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

    // 如果是测试模式，自动填充测试数据
    if (this.data.isTestMode) {
      console.log('当前处于测试模式');
    }
  },

  // 处理测试模式登录
  handleTestModeLogin() {
    console.log('执行测试模式登录');
    if (store.mockLogin()) {
      console.log('测试模式登录成功', store.state);
      this.navigateBack();
    }
  },

  // 登录按钮点击事件
  handleLogin() {
    if (this.data.isLoading) return;
    
    this.setData({ isLoading: true });
    wx.showLoading({ title: '登录中...' });

    // 直接使用测试登录
    store.init();
    
    wx.hideLoading();
    wx.showToast({
      title: '登录成功',
      icon: 'success',
      duration: 2000
    });

    // 延迟跳转，等待 toast 显示完成
    setTimeout(() => {
      this.navigateBack();
    }, 1500);
  },

  // 返回上一页或首页
  navigateBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
    } else {
      wx.switchTab({
        url: '/pages/index/index'
      });
    }
  }
}) 