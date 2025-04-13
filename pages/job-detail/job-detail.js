Page({
  /**
   * 页面的初始数据
   */
  data: {
    jobId: '',
    loading: true,
    errorMessage: '',
    jobDetail: null,
    companyInfo: null,
    similarJobs: [],
    isCollected: false,
    applying: false,
    showResumeList: false,
    resumeList: [],
    loadingResumes: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.id) {
      this.setData({
        jobId: options.id
      });
      this.loadJobDetail();
    } else {
      this.setData({
        loading: false,
        errorMessage: '职位ID不能为空'
      });
    }
  },

  /**
   * 加载职位详情
   */
  loadJobDetail: function () {
    const self = this;
    const jobId = this.data.jobId;
    
    wx.request({
      url: `https://api.example.com/jobs/${jobId}`,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: function(res) {
        if (res.statusCode === 200) {
          self.setData({
            jobDetail: res.data,
            loading: false
          });
          
          // 加载公司信息
          self.loadCompanyInfo(res.data.companyId);
          
          // 加载相似职位
          self.loadSimilarJobs(res.data.title, res.data.id);
          
          // 检查是否已收藏
          self.checkCollectionStatus();
        } else {
          self.setData({
            loading: false,
            errorMessage: res.data.message || '加载职位详情失败'
          });
        }
      },
      fail: function() {
        self.setData({
          loading: false,
          errorMessage: '网络错误，请重试'
        });
      }
    });
  },

  /**
   * 加载公司信息
   */
  loadCompanyInfo: function (companyId) {
    const self = this;
    
    wx.request({
      url: `https://api.example.com/companies/${companyId}`,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: function(res) {
        if (res.statusCode === 200) {
          self.setData({
            companyInfo: res.data
          });
        }
      }
    });
  },

  /**
   * 加载相似职位
   */
  loadSimilarJobs: function (jobTitle, currentJobId) {
    const self = this;
    
    wx.request({
      url: 'https://api.example.com/jobs/similar',
      method: 'GET',
      data: {
        keyword: jobTitle,
        excludeId: currentJobId,
        limit: 3
      },
      header: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: function(res) {
        if (res.statusCode === 200) {
          self.setData({
            similarJobs: res.data.list || []
          });
        }
      }
    });
  },

  /**
   * 检查收藏状态
   */
  checkCollectionStatus: function () {
    const self = this;
    const jobId = this.data.jobId;
    
    wx.request({
      url: `https://api.example.com/collections/check`,
      method: 'GET',
      data: {
        jobId: jobId
      },
      header: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: function(res) {
        if (res.statusCode === 200) {
          self.setData({
            isCollected: res.data.collected || false
          });
        }
      }
    });
  },

  /**
   * 收藏/取消收藏
   */
  toggleCollection: function () {
    const self = this;
    const jobId = this.data.jobId;
    const isCollected = this.data.isCollected;
    
    // 未登录时提示登录
    if (!wx.getStorageSync('token')) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再操作',
        confirmText: '去登录',
        success: function(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }
        }
      });
      return;
    }
    
    wx.request({
      url: `https://api.example.com/collections`,
      method: isCollected ? 'DELETE' : 'POST',
      data: {
        jobId: jobId
      },
      header: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: function(res) {
        if (res.statusCode === 200) {
          self.setData({
            isCollected: !isCollected
          });
          
          wx.showToast({
            title: isCollected ? '已取消收藏' : '收藏成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: res.data.message || '操作失败',
            icon: 'none'
          });
        }
      },
      fail: function() {
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 打开简历选择面板
   */
  showResumeSelector: function () {
    // 未登录时提示登录
    if (!wx.getStorageSync('token')) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再操作',
        confirmText: '去登录',
        success: function(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }
        }
      });
      return;
    }
    
    this.setData({
      showResumeList: true,
      loadingResumes: true
    });
    
    this.loadUserResumes();
  },

  /**
   * 加载用户简历列表
   */
  loadUserResumes: function () {
    const self = this;
    
    wx.request({
      url: 'https://api.example.com/resumes',
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: function(res) {
        if (res.statusCode === 200) {
          self.setData({
            resumeList: res.data.list || [],
            loadingResumes: false
          });
        } else {
          wx.showToast({
            title: res.data.message || '加载简历失败',
            icon: 'none'
          });
          
          self.setData({
            loadingResumes: false
          });
        }
      },
      fail: function() {
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
        
        self.setData({
          loadingResumes: false
        });
      }
    });
  },

  /**
   * 关闭简历选择面板
   */
  hideResumeSelector: function () {
    this.setData({
      showResumeList: false
    });
  },

  /**
   * 选择简历投递
   */
  selectResumeToApply: function (e) {
    const resumeId = e.currentTarget.dataset.id;
    this.applyJob(resumeId);
  },

  /**
   * 投递职位
   */
  applyJob: function (resumeId) {
    const self = this;
    const jobId = this.data.jobId;
    
    this.setData({
      applying: true,
      showResumeList: false
    });
    
    wx.request({
      url: 'https://api.example.com/job-applications',
      method: 'POST',
      data: {
        jobId: jobId,
        resumeId: resumeId
      },
      header: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: function(res) {
        if (res.statusCode === 200) {
          wx.showToast({
            title: '投递成功',
            icon: 'success'
          });
          
          // 更新职位状态为已投递
          const jobDetail = self.data.jobDetail;
          jobDetail.applied = true;
          
          self.setData({
            jobDetail: jobDetail
          });
        } else {
          wx.showToast({
            title: res.data.message || '投递失败',
            icon: 'none'
          });
        }
      },
      fail: function() {
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      },
      complete: function() {
        self.setData({
          applying: false
        });
      }
    });
  },

  /**
   * 查看公司详情
   */
  viewCompany: function () {
    const companyId = this.data.jobDetail.companyId;
    wx.navigateTo({
      url: `/pages/company-detail/company-detail?id=${companyId}`
    });
  },

  /**
   * 查看相似职位
   */
  viewSimilarJob: function (e) {
    const jobId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/job-detail/job-detail?id=${jobId}`
    });
  },

  /**
   * 创建简历
   */
  createResume: function () {
    wx.navigateTo({
      url: '/pages/resume-editor/resume-editor'
    });
  },

  /**
   * 分享
   */
  onShareAppMessage: function () {
    const jobDetail = this.data.jobDetail;
    return {
      title: `${jobDetail.title} - ${jobDetail.company}`,
      path: `/pages/job-detail/job-detail?id=${this.data.jobId}`
    };
  }
}) 