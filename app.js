// app.js
import config from './config';

App({
  onLaunch() {
    // 初始化云托管环境
    if (wx.cloud) {
      wx.cloud.init({
        env: config.cloudEnv
      });
    }
    
    // 检查用户登录状态
    this.checkLoginStatus();
    
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync();
    this.globalData.systemInfo = systemInfo;
    
    // 计算安全区域
    this.calculateSafeArea(systemInfo);
    const port = process.env.PORT || 80;
    app.listen(port, '0.0.0.0', () => {  // 必须监听 0.0.0.0 而不是 127.0.0.1
        console.log(`Server running on port ${port}`);
    });
  },
  
  // 检查登录状态
  async checkLoginStatus() {
    try {
      const token = wx.getStorageSync('token');
      
      if (token) {
        // 验证token有效性
        const result = await this.request({
          url: '/api/auth/verify',
          method: 'POST',
          data: { token }
        });
        
        if (result.success) {
          this.globalData.isLoggedIn = true;
          this.globalData.userInfo = result.data.userInfo;
        } else {
          // token无效，清除存储
          wx.removeStorageSync('token');
          this.globalData.isLoggedIn = false;
        }
      } else {
        this.globalData.isLoggedIn = false;
      }
    } catch (error) {
      console.error('检查登录状态失败', error);
      this.globalData.isLoggedIn = false;
    }
  },
  
  // 计算安全区域
  calculateSafeArea(systemInfo) {
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
        path: options.url,
        method: options.method,
        data: options.data,
        header: header
      });
      
      wx.cloud.callContainer({
        config: {
          env: config.cloudEnv
        },
        path: options.url,
        header: header,
        method: options.method || 'GET',
        data: options.data,
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
            reject(new Error(`请求失败: ${res.statusCode}`));
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
    userInfo: null,
    isLoggedIn: false,
    systemInfo: null,
    safeArea: null,
    apiBaseUrl: config.apiBaseUrl,
    version: '1.0.0'
  }
})