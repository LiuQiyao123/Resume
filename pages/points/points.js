const app = getApp();

Page({
  data: {
    balance: 0,
    history: [],
    loading: true,
    isEmpty: false,
    packages: [
      { id: 'basic', name: '基础套餐', points: 100, price: 9.9, originalPrice: 19.9 },
      { id: 'standard', name: '标准套餐', points: 300, price: 25.9, originalPrice: 39.9, popular: true },
      { id: 'premium', name: '高级套餐', points: 600, price: 45.9, originalPrice: 69.9 }
    ],
    currentPage: 0,
    totalPages: 1,
    dailyTask: {
      share: { completed: false, points: 5 },
      login: { completed: false, points: 2 },
      adView: { completed: false, points: 3, maxTimes: 3, currentTimes: 0 }
    },
    loadingMore: false,
    loadingTasks: true
  },

  onLoad() {
    this.fetchUserCredits();
    this.fetchCreditHistory();
    this.fetchDailyTasks();
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.fetchUserCredits();
    this.fetchDailyTasks();
  },

  onPullDownRefresh() {
    Promise.all([
      this.fetchUserCredits(),
      this.fetchCreditHistory(true),
      this.fetchDailyTasks()
    ]).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (this.data.currentPage < this.data.totalPages - 1 && !this.data.loadingMore) {
      this.loadMoreHistory();
    }
  },

  // 获取用户积分余额
  async fetchUserCredits() {
    if (!app.globalData.isLoggedIn) {
      this.setData({ balance: 0, loading: false });
      return;
    }
    
    try {
      const res = await app.request({
        url: '/api/credits',
        method: 'GET'
      });
      
      if (res.success) {
        this.setData({
          balance: res.data.balance,
          loading: false
        });
      } else {
        this.setData({ loading: false });
        wx.showToast({
          title: res.error.message || '获取积分信息失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('获取积分信息失败', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '获取积分信息失败',
        icon: 'none'
      });
    }
  },

  // 获取积分历史记录
  async fetchCreditHistory(reset = false) {
    if (!app.globalData.isLoggedIn) {
      this.setData({
        history: [],
        isEmpty: true,
        currentPage: 0,
        totalPages: 1,
        loading: false
      });
      return;
    }
    
    const page = reset ? 0 : this.data.currentPage;
    
    try {
      const res = await app.request({
        url: '/api/credits/history',
        method: 'GET',
        data: {
          page: page,
          limit: 20
        }
      });
      
      if (res.success) {
        // 处理日期格式
        const formattedHistory = res.data.records.map(item => ({
          ...item,
          formattedTime: this.formatDate(new Date(item.createdAt))
        }));
        
        this.setData({
          history: reset ? formattedHistory : [...this.data.history, ...formattedHistory],
          isEmpty: res.data.records.length === 0,
          totalPages: Math.ceil(res.data.total / 20),
          currentPage: page + 1,
          loading: false
        });
      } else {
        this.setData({
          isEmpty: true,
          loading: false
        });
        
        wx.showToast({
          title: res.error.message || '获取积分历史失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('获取积分历史失败', error);
      
      this.setData({
        isEmpty: true,
        loading: false
      });
      
      wx.showToast({
        title: '获取积分历史失败',
        icon: 'none'
      });
    }
  },

  // 加载更多历史记录
  async loadMoreHistory() {
    if (this.data.loadingMore || this.data.currentPage >= this.data.totalPages) return;
    
    this.setData({ loadingMore: true });
    
    try {
      const res = await app.request({
        url: '/api/credits/history',
        method: 'GET',
        data: {
          page: this.data.currentPage,
          limit: 20
        }
      });
      
      if (res.success) {
        // 处理日期格式
        const formattedHistory = res.data.records.map(item => ({
          ...item,
          formattedTime: this.formatDate(new Date(item.createdAt))
        }));
        
        this.setData({
          history: [...this.data.history, ...formattedHistory],
          currentPage: this.data.currentPage + 1
        });
      } else {
        wx.showToast({
          title: res.error.message || '加载更多记录失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('加载更多记录失败', error);
      
      wx.showToast({
        title: '加载更多记录失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loadingMore: false });
    }
  },

  // 获取每日任务
  async fetchDailyTasks() {
    if (!app.globalData.isLoggedIn) {
      this.setData({ loadingTasks: false });
      return;
    }
    
    try {
      this.setData({ loadingTasks: true });
      
      const res = await app.request({
        url: '/api/credits/daily-tasks',
        method: 'GET'
      });
      
      if (res.success) {
        this.setData({
          dailyTask: res.data,
          loadingTasks: false
        });
      } else {
        this.setData({ loadingTasks: false });
        // 静默失败，不显示错误提示
      }
    } catch (error) {
      console.error('获取每日任务失败', error);
      this.setData({ loadingTasks: false });
    }
  },

  // 完成分享任务
  async completeShareTask() {
    if (this.data.dailyTask.share.completed) return;
    
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage']
    });
  },

  // 完成广告观看任务
  async completeAdViewTask() {
    if (this.data.dailyTask.adView.completed || 
        this.data.dailyTask.adView.currentTimes >= this.data.dailyTask.adView.maxTimes) {
      return;
    }
    
    // 这里应该显示激励视频广告
    wx.showLoading({
      title: '加载广告中...',
      mask: true
    });
    
    try {
      // 模拟广告观看
      setTimeout(async () => {
        wx.hideLoading();
        
        try {
          const res = await app.request({
            url: '/api/credits/ad-view',
            method: 'POST'
          });
          
          if (res.success) {
            wx.showToast({
              title: `获得${this.data.dailyTask.adView.points}积分`,
              icon: 'success'
            });
            
            // 更新积分和任务状态
            this.fetchUserCredits();
            this.fetchDailyTasks();
            this.fetchCreditHistory(true);
          } else {
            wx.showToast({
              title: res.error.message || '领取积分失败',
              icon: 'none'
            });
          }
        } catch (error) {
          console.error('领取广告积分失败', error);
          
          wx.showToast({
            title: '领取积分失败',
            icon: 'none'
          });
        }
      }, 1500);
    } catch (error) {
      wx.hideLoading();
      
      wx.showToast({
        title: '广告加载失败',
        icon: 'none'
      });
      
      console.error('广告加载失败', error);
    }
  },

  // 创建支付
  createPayment(e) {
    const packageId = e.currentTarget.dataset.id;
    const selectedPackage = this.data.packages.find(item => item.id === packageId);
    
    if (!selectedPackage) return;
    
    if (!app.globalData.isLoggedIn) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login'
        });
      }, 1500);
      
      return;
    }
    
    wx.showLoading({
      title: '创建订单中...',
      mask: true
    });
    
    app.request({
      url: '/api/payments/create',
      method: 'POST',
      data: {
        packageId: packageId,
        amount: selectedPackage.price,
        description: `购买${selectedPackage.name}`
      }
    }).then(res => {
      wx.hideLoading();
      
      if (res.success) {
        const payParams = res.data.payParams;
        
        // 调用微信支付
        wx.requestPayment({
          ...payParams,
          success: () => {
            wx.showToast({
              title: '支付成功',
              icon: 'success'
            });
            
            // 更新积分余额
            setTimeout(() => {
              this.fetchUserCredits();
              this.fetchCreditHistory(true);
            }, 1500);
          },
          fail: (err) => {
            console.error('支付失败', err);
            
            wx.showToast({
              title: '支付已取消',
              icon: 'none'
            });
          }
        });
      } else {
        wx.showToast({
          title: res.error.message || '创建订单失败',
          icon: 'none'
        });
      }
    }).catch(error => {
      wx.hideLoading();
      
      console.error('创建订单失败', error);
      
      wx.showToast({
        title: '创建订单失败',
        icon: 'none'
      });
    });
  },

  // 导航到用户页面
  navigateToUser() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
  },

  // 分享配置
  onShareAppMessage() {
    // 分享成功后，更新任务状态
    setTimeout(() => {
      if (!this.data.dailyTask.share.completed) {
        app.request({
          url: '/api/credits/share',
          method: 'POST'
        }).then(res => {
          if (res.success) {
            wx.showToast({
              title: `获得${this.data.dailyTask.share.points}积分`,
              icon: 'success'
            });
            
            // 更新积分和任务状态
            this.fetchUserCredits();
            this.fetchDailyTasks();
            this.fetchCreditHistory(true);
          }
        }).catch(error => {
          console.error('领取分享积分失败', error);
        });
      }
    }, 1000);
    
    return {
      title: 'AI简历定制，让求职更轻松',
      path: '/pages/index/index',
      imageUrl: '/images/share.png'
    };
  }
}) 