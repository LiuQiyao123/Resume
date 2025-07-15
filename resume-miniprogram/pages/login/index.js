// pages/login/index.js
import loginService from '../../services/loginService';

Page({
  data: {
    isLoggedIn: false,
    userInfo: null,
    isLoading: false,
  },

  onLoad(options) {
    // 检查本地是否已有登录态
    this.checkLoginState();
  },

  checkLoginState() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    if (token && userInfo) {
      this.setData({
        isLoggedIn: true,
        userInfo: userInfo,
      });
      // 如果已登录且已绑定手机号，直接跳转到首页
      if (userInfo.phone) { 
        wx.switchTab({ 
          url: '/pages/index/index',
          fail: () => {
            wx.redirectTo({ url: '/pages/index/index' });
          }
        }); 
      }
      // 如果已登录但没有手机号，停留在本页引导授权
    }
  },

  // 处理微信授权登录
  async handleLogin() {
    if (this.data.isLoading) return;
    this.setData({ isLoading: true });

    try {
      const { userInfo } = await wx.getUserProfile({
        desc: '用于完善会员资料',
      });

      const loginResult = await loginService.login(userInfo);
      console.log('登录成功', loginResult);
      
      this.setData({ 
        isLoading: false,
        isLoggedIn: true, // 切换到手机号授权界面
        userInfo: loginResult.user 
      });

    } catch (error) {
      this.setData({ isLoading: false });
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none',
      });
      console.error('登录流程失败', error);
    }
  },

  // 处理获取手机号
  async handleGetPhoneNumber(e) {
    this.setData({ isLoading: true });

    try {
      // 检查用户是否授权（支持两种组件）
      const isSuccess = e.detail.errMsg === "getPhoneNumber:ok" || e.detail.errMsg === "getRealtimePhoneNumber:ok";
      
      if (!isSuccess) {
        wx.showToast({ title: '您已拒绝授权', icon: 'none' });
        this.setData({ isLoading: false });
        return;
      }

      // 获取数据（实时验证组件返回code，普通组件返回encryptedData）
      const { code, encryptedData, iv } = e.detail;
      
      // 将数据传递给 service
      const result = await loginService.bindPhoneNumber(
        code || encryptedData,
        iv
      );

      wx.showToast({ title: '手机号绑定成功！', icon: 'success' });

      // 绑定成功后可以跳转到首页或个人中心页
      // 这里假设你有一个tabBar页面叫 'profile'
      wx.switchTab({ 
        url: '/pages/profile/index',
        fail: () => {
          // 如果没有tabBar页面，则跳转到普通页面
          wx.redirectTo({ url: '/pages/profile/index' });
        }
      });

    } catch (error) {
      wx.showToast({ title: '绑定失败，请稍后重试', icon: 'none' });
      console.error('绑定手机号失败', error);
    } finally {
      this.setData({ isLoading: false });
    }
  },
  
  // 用户选择跳过
  handleSkip() {
    wx.showToast({
      title: '操作成功',
      icon: 'success',
      duration: 1500
    });
    // 跳转到首页
    wx.switchTab({
      url: '/pages/index/index',
       fail: () => {
          wx.redirectTo({ url: '/pages/index/index' });
        }
    });
  }
});
