// app.js
import config from './config';
import { showToast } from './utils/toast';
import store from './store/index';

App({
  onLaunch() {
    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: config.cloudEnv,
        traceUser: true
      });
    }
    
    // 初始化存储
    store.init();
    
    // 初始化系统信息
    this.initSystemInfo();

    // 设置全局状态
    this.globalData.store = store;
    
    console.log('App启动，当前状态：', {
      isTestMode: store.state.isTestMode,
      isLoggedIn: store.checkLoginStatus(),
      userInfo: store.state.userInfo
    });

    // 添加全局错误处理
    wx.onError((error) => {
      console.error('全局错误：', error);
      showToast({
        title: '应用出现错误，请重试'
      });
    });
  },

  // 初始化系统信息
  initSystemInfo() {
    try {
      // 获取系统信息
      const systemInfo = wx.getSystemInfoSync();
      this.globalData.systemInfo = systemInfo;

      // 获取胶囊按钮信息
      const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
      
      // 设置状态栏和导航栏高度
      this.globalData.StatusBar = systemInfo.statusBarHeight;
      this.globalData.Custom = menuButtonInfo;
      this.globalData.CustomBar = menuButtonInfo.bottom + menuButtonInfo.top - systemInfo.statusBarHeight;

      // 计算安全区域
      this.calculateSafeArea(systemInfo);
    } catch (error) {
      console.error('初始化系统信息失败：', error);
      // 设置默认值
      this.globalData.StatusBar = 20;
      this.globalData.CustomBar = 60;
      this.globalData.safeArea = {
        top: 88,
        bottom: 34,
        left: 0,
        right: 0,
        width: 375,
        height: 555
      };
    }
  },
  
  // 计算安全区域
  calculateSafeArea(systemInfo) {
    if (!systemInfo || !systemInfo.safeArea) {
      console.warn('系统信息或安全区域信息不完整');
      return;
    }

    // 计算底部安全区域高度
    const safeBottom = systemInfo.screenHeight - systemInfo.safeArea.bottom;
    
    // 计算顶部安全区域高度（状态栏 + 导航栏）
    const safeTop = (systemInfo.statusBarHeight || 0) + 44; // 导航栏高度通常为44px
    
    this.globalData.safeArea = {
      top: safeTop,
      bottom: safeBottom,
      left: systemInfo.safeArea.left,
      right: systemInfo.screenWidth - systemInfo.safeArea.right,
      width: systemInfo.safeArea.width,
      height: systemInfo.safeArea.height
    };
  },
  
  // 修改请求方法以支持云托管
  request(options) {
    return new Promise((resolve, reject) => {
      const token = wx.getStorageSync('token');
      
      // 构建请求头
      const header = {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'X-WX-SERVICE': config.serviceId,
        ...(options.header || {})
      };
      
      console.log('发起请求:', {
        env: config.cloudEnv,
        service: config.serviceId,
        path: options.url,
        method: options.method,
        data: options.data,
        header: header
      });
      
      // 使用云托管服务
      wx.cloud.callContainer({
        config: {
          env: config.cloudEnv
        },
        path: options.url,
        header: header,
        method: options.method || 'GET',
        data: options.data,
        timeout: 20000,  // 增加超时时间到20秒
        success: (res) => {
          console.log('请求响应:', res);
          
          if (res.statusCode === 401) {
            // 未授权，跳转至登录页
            wx.removeStorageSync('token');
            this.globalData.isLoggedIn = false;
            
            wx.navigateTo({
              url: '/pages/login/login'
            });
            
            reject(new Error('未授权，请重新登录'));
          } else if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else {
            reject(new Error(`请求失败: ${res.statusCode} ${res.data ? JSON.stringify(res.data) : ''}`));
          }
        },
        fail: (err) => {
          console.error('请求失败:', err);
          reject(err);
        }
      });
    });
  },
  
  // 全局数据
  globalData: {
    store: null,
    systemInfo: null,
    safeArea: null,
    apiBaseUrl: config.apiBaseUrl,
    version: '1.0.0',
    isLoggedIn: false,
    userInfo: null,
    StatusBar: null,
    Custom: null,
    CustomBar: null
  }
});