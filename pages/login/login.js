const app = getApp();

Page({
  data: {
    canIUseGetUserProfile: false,
    isLoading: false
  },

  onLoad() {
    // 检查是否支持getUserProfile接口
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      });
    }
  },

  // 获取用户信息并登录
  login() {
    if (this.data.isLoading) return;
    
    this.setData({ isLoading: true });
    
    if (this.data.canIUseGetUserProfile) {
      this.getUserProfileAndLogin();
    } else {
      // 低版本基础库不支持getUserProfile，使用旧接口
      this.getWxCodeAndLogin();
    }
  },
  
  // 使用getUserProfile获取用户信息并登录
  getUserProfileAndLogin() {
    wx.getUserProfile({
      desc: '用于完善简历信息',
      success: (userInfo) => {
        // 获取微信登录凭证
        wx.login({
          success: (loginRes) => {
            if (loginRes.code) {
              // 发送code和用户信息到后端
              this.sendLoginRequest(loginRes.code, userInfo.userInfo);
            } else {
              wx.showToast({
                title: '微信登录失败',
                icon: 'none'
              });
              this.setData({ isLoading: false });
            }
          },
          fail: () => {
            wx.showToast({
              title: '微信登录失败',
              icon: 'none'
            });
            this.setData({ isLoading: false });
          }
        });
      },
      fail: (err) => {
        console.error('获取用户信息失败', err);
        this.setData({ isLoading: false });
      }
    });
  },
  
  // 仅获取微信code并登录（用于不支持getUserProfile的情况）
  getWxCodeAndLogin() {
    wx.login({
      success: (loginRes) => {
        if (loginRes.code) {
          // 仅发送code到后端
          this.sendLoginRequest(loginRes.code);
        } else {
          wx.showToast({
            title: '微信登录失败',
            icon: 'none'
          });
          this.setData({ isLoading: false });
        }
      },
      fail: () => {
        wx.showToast({
          title: '微信登录失败',
          icon: 'none'
        });
        this.setData({ isLoading: false });
      }
    });
  },
  
  // 发送登录请求到后端
  async sendLoginRequest(code, userInfo = null) {
    try {
      const res = await app.request({
        url: '/api/auth/login',
        method: 'POST',
        data: {
          code,
          userInfo
        }
      });
      
      if (res.success) {
        // 保存token
        wx.setStorageSync('token', res.data.token);
        
        // 更新全局数据
        app.globalData.isLoggedIn = true;
        app.globalData.userInfo = res.data.userInfo;
        
        // 返回上一页或首页
        const pages = getCurrentPages();
        if (pages.length > 1) {
          wx.navigateBack();
        } else {
          wx.switchTab({
            url: '/pages/index/index'
          });
        }
        
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });
      } else {
        wx.showToast({
          title: res.error.message || '登录失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('登录请求失败', error);
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ isLoading: false });
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