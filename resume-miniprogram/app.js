// app.js
import config from './config';
import { showToast } from './utils/toast';
import store from './store/index';
import { checkCloudHealth } from './utils/cloudApi';
import loginService from './services/loginService';

App({
  async onLaunch() {
    console.log('应用启动 - 版本:', this.globalData.version);
    
    // 检查登录状态
    if (loginService.checkLoginStatus()) {
      console.log('用户已登录，直接进入首页');
      wx.switchTab({
        url: '/pages/index/index',
      });
    } else {
      console.log('用户未登录，停留在登录页');
    }
    
    // 初始化云环境 - 尽早初始化以便后续API调用
    this.initCloudEnv();
    
    // 初始化存储
    store.init();
    
    // 初始化系统信息
    this.initSystemInfo();

    // 设置全局状态
    this.globalData.store = store;
    this.globalData.isLoggedIn = store.checkLoginStatus();
    
    // 将关键配置传递到 globalData 以便页面访问
    this.globalData.cloudEnv = config.cloudEnv;
    this.globalData.serviceId = config.serviceId;
    this.globalData.baseUrl = config.baseUrl;
    this.globalData.version = config.version;
    this.globalData.currentEnv = config.currentEnv;
    this.globalData.isLocal = config.isLocal;
    
    console.log('已将环境配置加载到全局:', {
      cloudEnv: this.globalData.cloudEnv,
      serviceId: this.globalData.serviceId,
      currentEnv: this.globalData.currentEnv
    });
    
    // 如果不是本地开发环境，才进行云相关的初始化和检查
    if (!this.globalData.isLocal) {
      // 监听网络状态变化
      this.setupNetworkListener();
      
      // 检查云服务健康状态
      this.checkServiceHealth();
    }
    
    // 添加全局错误处理
    this.setupErrorHandler();
    
    console.log('App启动完成，当前状态：', {
      isLoggedIn: this.globalData.isLoggedIn,
      userInfo: store.state.userInfo,
      networkType: this.globalData.networkType
    });
  },
  
  // 初始化云环境
  initCloudEnv() {
    try {
      wx.cloud.init({
        env: config.cloudEnv,
        traceUser: true
      });
      console.log('云环境初始化完成，环境ID:', config.cloudEnv);
    } catch (error) {
      console.error('云环境初始化失败:', error);
      showToast({
        title: '初始化云环境失败',
        icon: 'none'
      });
    }
  },
  
  // 检查云服务健康状态
  async checkServiceHealth() {
    try {
      const isHealthy = await checkCloudHealth();
      this.globalData.isCloudServiceHealthy = isHealthy;
      console.log('云服务健康状态:', isHealthy ? '正常' : '异常');
      
      if (!isHealthy) {
        showToast({
          title: '云服务连接异常，部分功能可能受限',
          icon: 'none',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('健康检查执行失败:', error);
      this.globalData.isCloudServiceHealthy = false;
    }
  },
  
  // 设置网络监听器
  setupNetworkListener() {
    // 获取当前网络状态
    wx.getNetworkType({
      success: (res) => {
        this.globalData.networkType = res.networkType;
        console.log('当前网络类型:', res.networkType);
      }
    });
    
    // 监听网络状态变化
    wx.onNetworkStatusChange((res) => {
      this.globalData.networkType = res.networkType;
      this.globalData.isConnected = res.isConnected;
      
      console.log('网络状态变化:', res);
      
      // 网络恢复时重新检查云服务健康状态
      if (res.isConnected) {
        this.checkServiceHealth();
      }
    });
  },
  
  // 设置全局错误处理
  setupErrorHandler() {
    wx.onError((error) => {
      console.error('全局错误：', error);
      // 记录错误日志
      this.logError(error);
      
      showToast({
        title: '应用出现错误，请重试',
        icon: 'none'
      });
    });
  },
  
  // 记录错误日志（可以发送到服务端）
  logError(error) {
    // TODO: 可以添加发送错误日志到服务端的逻辑
    console.error('错误日志:', error);
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
  
  // 全局数据
  globalData: {
    store: null,
    systemInfo: null,
    safeArea: null,
    version: '1.0.1',  // 更新版本号
    isLoggedIn: false,
    userInfo: null,
    StatusBar: null,
    Custom: null,
    CustomBar: null,
    
    // 网络相关状态
    networkType: 'unknown',  // 网络类型
    isConnected: true,       // 是否有网络连接
    
    // 云服务状态
    isCloudServiceHealthy: false,  // 云服务是否健康
    isLocal: false,               // 是否为本地开发环境
    cloudEnv: null,               // 云环境
    serviceId: null,              // 服务ID
    baseUrl: null,                // 基础URL
    currentEnv: null              // 当前环境
  }
});