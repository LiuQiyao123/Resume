const app = getApp();

Page({
  data: {
    resumes: [],
    optimizedResumes: [], // 新增
    loading: true,
    isEmpty: false,
    current: 0,
    showActionSheet: false,
    currentResume: null
  },

  onLoad() {
    this.fetchResumes();
  },

  onShow() {
    this.fetchResumes();
  },

  // 获取简历列表
  async fetchResumes(callback) {
    if (!app.globalData.isLoggedIn) {
      this.setData({
        resumes: [],
        optimizedResumes: [], // 新增
        loading: false,
        isEmpty: true
      });
      
      if (callback) callback();
      return;
    }
    
    try {
      this.setData({ loading: true });
      
      const res = await app.request({
        url: '/api/resumes',
        method: 'GET'
      });
      
      if (res.success) {
        const resumes = res.data.map(resume => ({
          ...resume,
          createTime: this.formatDate(new Date(resume.createTime)),
          updateTime: this.formatDate(new Date(resume.updateTime))
        }));

        // 处理优化过的简历
        const optimizedResumes = resumes.filter(r => r.isOptimized);
        
        this.setData({
          resumes,
          optimizedResumes, // 新增
          loading: false,
          isEmpty: resumes.length === 0
        });
      } else {
        this.setData({
          loading: false,
          isEmpty: true,
          optimizedResumes: [] // 新增
        });
        
        wx.showToast({
          title: res.error.message || '获取简历列表失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('获取简历列表失败', error);
      
      this.setData({
        loading: false,
        isEmpty: true,
        optimizedResumes: [] // 新增
      });
      
      wx.showToast({
        title: '获取简历列表失败',
        icon: 'none'
      });
    } finally {
      if (callback) callback();
    }
  },

  // 切换tab时更新数据
  switchTab(e) {
    const current = e.currentTarget.dataset.index;
    this.setData({ current });
  },

  // ... 其他代码保持不变 ...
});