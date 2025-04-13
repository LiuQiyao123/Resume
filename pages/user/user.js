// pages/user/user.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    points: 0,
    pointsRecords: [],
    resumeCount: 0,
    isLogin: false,
    loading: true,
    settingItems: [
      { id: 'account', name: '账号与安全', icon: 'lock.png', url: '/pages/account/account' },
      { id: 'feedback', name: '意见反馈', icon: 'feedback.png', url: '/pages/feedback/feedback' },
      { id: 'about', name: '关于我们', icon: 'about.png', url: '/pages/about/about' }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.checkLoginStatus();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (this.data.isLogin) {
      this.getUserInfo();
      this.getPointsInfo();
      this.getResumeCount();
    }
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus: function () {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (token && userInfo) {
      this.setData({
        isLogin: true,
        userInfo: userInfo,
        loading: false
      });
      
      this.getUserInfo();
      this.getPointsInfo();
      this.getResumeCount();
    } else {
      this.setData({
        isLogin: false,
        loading: false
      });
    }
  },

  /**
   * 获取用户信息
   */
  getUserInfo: function () {
    const self = this;
    wx.request({
      url: 'https://api.example.com/user/profile',
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: function(res) {
        if (res.statusCode === 200) {
          const userInfo = res.data;
          wx.setStorageSync('userInfo', userInfo);
          self.setData({
            userInfo: userInfo
          });
        }
      },
      fail: function() {
        wx.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 获取积分信息
   */
  getPointsInfo: function () {
    const self = this;
    wx.request({
      url: 'https://api.example.com/user/points',
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: function(res) {
        if (res.statusCode === 200) {
          self.setData({
            points: res.data.points,
            pointsRecords: res.data.records.slice(0, 3) // 只显示最近3条记录
          });
        }
      },
      fail: function() {
        wx.showToast({
          title: '获取积分信息失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 获取简历数量
   */
  getResumeCount: function () {
    const self = this;
    wx.request({
      url: 'https://api.example.com/resumes/count',
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: function(res) {
        if (res.statusCode === 200) {
          self.setData({
            resumeCount: res.data.count
          });
        }
      }
    });
  },

  /**
   * 去登录
   */
  goToLogin: function () {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  /**
   * 退出登录
   */
  logout: function () {
    const self = this;
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: function(res) {
        if (res.confirm) {
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          self.setData({
            isLogin: false,
            userInfo: null,
            points: 0,
            pointsRecords: [],
            resumeCount: 0
          });
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 查看积分记录
   */
  viewPointsRecords: function () {
    wx.navigateTo({
      url: '/pages/points-records/points-records'
    });
  },

  /**
   * 前往我的简历
   */
  goToMyResumes: function () {
    wx.navigateTo({
      url: '/pages/resume-list/resume-list'
    });
  },

  /**
   * 跳转到设置项
   */
  goToSetting: function (e) {
    const item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: item.url
    });
  },

  /**
   * 充值积分
   */
  rechargePoints: function () {
    wx.navigateTo({
      url: '/pages/points-recharge/points-recharge'
    });
  },

  /**
   * 前往客服
   */
  contactService: function () {
    // 微信小程序中可使用button的open-type="contact"实现客服功能
    // 这里仅作为补充
    wx.showToast({
      title: '正在跳转到客服会话',
      icon: 'none'
    });
  }
}) 