// 全局状态管理
const store = {
  state: {
    isLoggedIn: false,
    userInfo: null
  },

  init() {
    const userInfo = wx.getStorageSync('userInfo');
    const token = wx.getStorageSync('token');
    
    console.log('初始化存储状态检查:', { hasUserInfo: !!userInfo, hasToken: !!token });
    
    // 只有同时存在token和用户信息才认为是已登录
    if (userInfo && token) {
      this.state.isLoggedIn = true;
      this.state.userInfo = userInfo;
      this.state.token = token;
      console.log('用户已登录，恢复会话状态');
    } else {
      // 信息不完整，清理存储
      if (userInfo || token) {
        console.warn('登录状态不完整，清理会话数据');
        this.logout();
      }
    }
  },

  checkLoginStatus() {
    // 检查内存状态和存储状态
    const hasToken = !!wx.getStorageSync('token');
    return this.state.isLoggedIn && hasToken;
  },

  login(data) {
    console.log('保存登录信息:', data);
    
    // 确保数据完整性
    if (!data || !data.token || !data.user) {
      console.error('登录数据不完整:', data);
      wx.showToast({
        title: '登录失败：数据不完整',
        icon: 'none'
      });
      return false;
    }
    
    try {
      // 更新内存状态
      this.state.isLoggedIn = true;
      this.state.userInfo = data.user;
      this.state.token = data.token;
      
      // 存储到本地
      wx.setStorageSync('userInfo', data.user);
      wx.setStorageSync('token', data.token);
      
      // 记录登录时间
      const loginTime = new Date().getTime();
      wx.setStorageSync('loginTime', loginTime);
      
      console.log('登录信息保存成功');
      return true;
    } catch (error) {
      console.error('保存登录信息失败:', error);
      return false;
    }
  },

  logout() {
    console.log('执行登出操作');
    
    // 更新内存状态
    this.state.isLoggedIn = false;
    this.state.userInfo = null;
    this.state.token = null;
    
    // 清理存储
    try {
      wx.removeStorageSync('userInfo');
      wx.removeStorageSync('token');
      wx.removeStorageSync('loginTime');
      console.log('登出完成，会话数据已清理');
    } catch (error) {
      console.error('清理登录数据失败:', error);
    }
  },

  // 更新用户信息
  updateUserInfo(userInfo) {
    this.state.userInfo = { ...this.state.userInfo, ...userInfo };
    wx.setStorageSync('userInfo', this.state.userInfo);
  }
};

export default store; 