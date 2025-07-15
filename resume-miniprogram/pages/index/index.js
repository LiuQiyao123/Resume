const app = getApp();

Page({
  data: {
    userInfo: null,
    isLoggedIn: false,
    isAuthorized: false,
    loading: true,
    banners: [
      {
        id: 1,
        imageUrl: '/images/banner1.png',
        linkUrl: '/pages/resume-customize/resume-customize'
      },
      {
        id: 2,
        imageUrl: '/images/banner2.png',
        linkUrl: '/pages/resume-list/resume-list'
      },
      {
        id: 3,
        imageUrl: '/images/banner3.png',
        linkUrl: '/pages/points/points'
      }
    ],
    quickActions: [
      {
        id: 'newResume',
        name: '新建简历',
        icon: '/images/new-resume.png',
        url: '/pages/resume-editor/resume-editor'
      },
      {
        id: 'optimize',
        name: '简历优化',
        icon: '/images/optimize-resume.png',
        url: '/pages/resume-customize/resume-customize'
      },
      {
        id: 'aiChat',
        name: 'AI助手',
        icon: '/images/ai-chat.png',
        url: '/pages/chat/chat'
      },
      {
        id: 'myResumes',
        name: '我的简历',
        icon: '/images/my-resumes.png',
        url: '/pages/resume-list/resume-list'
      }
    ],
    resumeTips: [
      '专业字眼让雇主印象深刻，可用"开发"替代"编写"，用"实现"替代"做"',
      '量化你的成就，使用具体数字说明项目规模和成果',
      '针对职位调整简历内容，突出与职位要求匹配的技能和经验',
      '简历篇幅控制在1-2页，重点突出，内容精炼',
      '关注简历视觉结构，使用一致的格式和合理的留白'
    ],
    currentTipIndex: 0,
    recentResumes: [],
    loadingResumes: true
  },

  onLoad() {
    this.checkLoginStatus();
    this.startTipInterval();
  },

  onShow() {
    // 检查登录状态变化
    if (app.globalData.isLoggedIn !== this.data.isLoggedIn) {
      this.checkLoginStatus();
    }
    // 刷新最近简历
    if (app.globalData.isLoggedIn) {
      this.fetchRecentResumes();
    }
  },

  onHide() {
    // 清除定时器
    if (this.tipInterval) {
      clearInterval(this.tipInterval);
    }
  },

  onUnload() {
    // 清除定时器
    if (this.tipInterval) {
      clearInterval(this.tipInterval);
    }
  },

  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    const isLoggedIn = !!token && app.globalData.isLoggedIn;
    
    this.setData({
      isLoggedIn: isLoggedIn,
      userInfo: app.globalData.userInfo || null,
      loading: false
    });
    
    if (isLoggedIn) {
      this.fetchRecentResumes();
    } else {
      this.setData({
        recentResumes: [],
        loadingResumes: false
      });
    }
  },

  // 获取最近的简历
  async fetchRecentResumes() {
    if (!this.data.isLoggedIn) return;
    
    this.setData({ loadingResumes: true });
    
    try {
      const res = await app.request({
        url: '/api/resumes/recent',
        method: 'GET',
        data: { limit: 3 }
      });
      
      if (res.success) {
        this.setData({
          recentResumes: res.data.map(resume => ({
            ...resume,
            updateTime: this.formatDate(new Date(resume.updateTime))
          })),
          loadingResumes: false
        });
      } else {
        this.setData({ loadingResumes: false });
        console.error('获取最近简历失败', res.error);
      }
    } catch (error) {
      console.error('获取最近简历异常', error);
      this.setData({ loadingResumes: false });
    }
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 启动轮播提示定时器
  startTipInterval() {
    this.tipInterval = setInterval(() => {
      let nextIndex = this.data.currentTipIndex + 1;
      if (nextIndex >= this.data.resumeTips.length) {
        nextIndex = 0;
      }
      
      this.setData({
        currentTipIndex: nextIndex
      });
    }, 5000); // 每5秒切换一次
  },

  // 跳转到登录页
  navigateToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  // 跳转到指定页面
  navigateTo(e) {
    const url = e.currentTarget.dataset.url;
    
    // 检查是否需要登录
    const needLogin = e.currentTarget.dataset.needLogin !== false;
    
    if (needLogin && !this.data.isLoggedIn) {
      wx.navigateTo({
        url: '/pages/login/login'
      });
      return;
    }
    
    if (url.startsWith('/pages')) {
      if (url.includes('resume-list') || url.includes('points') || url.includes('index')) {
        wx.switchTab({
          url
        });
      } else {
        wx.navigateTo({
          url
        });
      }
    }
  },

  // 点击横幅
  onBannerTap(e) {
    const index = e.currentTarget.dataset.index;
    const banner = this.data.banners[index];
    
    if (banner && banner.linkUrl) {
      this.navigateTo({
        currentTarget: {
          dataset: {
            url: banner.linkUrl
          }
        }
      });
    }
  },

  // 快速操作点击
  onQuickActionTap(e) {
    const id = e.currentTarget.dataset.id;
    const action = this.data.quickActions.find(item => item.id === id);
    
    if (action && action.url) {
      this.navigateTo({
        currentTarget: {
          dataset: {
            url: action.url
          }
        }
      });
    }
  },

  // 点击简历项
  onResumeItemTap(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.navigateTo({
      url: `/pages/resume-editor/resume-editor?id=${id}`
    });
  },

  // 处理用户信息按钮点击
  onUserInfoTap() {
    if (this.data.isLoggedIn) {
      // 已登录，跳转到用户中心
      wx.navigateTo({
        url: '/pages/user/user'
      });
    } else {
      // 未登录，跳转到登录页
      this.navigateToLogin();
    }
  },

  // 处理上传简历按钮点击
  onUploadTap() {
    if (!this.data.isLoggedIn) {
      this.navigateToLogin();
      return;
    }
    
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['pdf', 'doc', 'docx'],
      success: (res) => {
        if (res.tempFiles && res.tempFiles.length > 0) {
          const tempFilePath = res.tempFiles[0].path;
          
          wx.navigateTo({
            url: `/pages/resume-upload/resume-upload?filePath=${encodeURIComponent(tempFilePath)}`
          });
        }
      }
    });
  }
}) 