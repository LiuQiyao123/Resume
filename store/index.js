// 全局状态管理
const store = {
  state: {
    isLoggedIn: true,  // 直接设置为已登录
    userInfo: {
      openid: 'test_openid',
      nickname: '测试用户',
      avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
    }
  },

  init() {
    // 直接使用测试数据
    wx.setStorageSync('userInfo', this.state.userInfo);
  },

  checkLoginStatus() {
    return true;  // 始终返回已登录
  },

  // 更新用户信息
  updateUserInfo(userInfo) {
    this.state.userInfo = userInfo;
    wx.setStorageSync('userInfo', userInfo);
  }
};

export default store; 