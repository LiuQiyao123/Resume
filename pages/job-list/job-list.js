Page({
  /**
   * 页面的初始数据
   */
  data: {
    resumeId: '', // 用于投递简历的ID
    loading: true,
    jobs: [],
    searchText: '',
    filters: {
      city: '',
      experience: '',
      education: '',
      salary: ''
    },
    showFilterPanel: false,
    cityOptions: ['全部', '北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '西安'],
    experienceOptions: ['全部', '应届毕业生', '1-3年', '3-5年', '5-10年', '10年以上'],
    educationOptions: ['全部', '大专', '本科', '硕士', '博士'],
    salaryOptions: ['全部', '5k以下', '5-10k', '10-15k', '15-20k', '20-30k', '30k以上'],
    pageNum: 1,
    pageSize: 10,
    hasMore: true,
    isLoadingMore: false,
    applying: false, // 投递状态
    applyJobId: null // 正在投递的职位ID
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.resumeId) {
      this.setData({
        resumeId: options.resumeId
      });
    }
    
    this.loadJobs();
  },

  /**
   * 加载职位列表
   */
  loadJobs: function (isLoadMore = false) {
    if (isLoadMore) {
      if (!this.data.hasMore || this.data.isLoadingMore) {
        return;
      }
      this.setData({
        isLoadingMore: true
      });
    } else {
      this.setData({
        loading: true,
        pageNum: 1
      });
    }
    
    const { searchText, filters, pageNum, pageSize } = this.data;
    const self = this;
    
    wx.request({
      url: 'https://api.example.com/jobs',
      method: 'GET',
      data: {
        keyword: searchText,
        city: filters.city === '全部' ? '' : filters.city,
        experience: filters.experience === '全部' ? '' : filters.experience,
        education: filters.education === '全部' ? '' : filters.education,
        salary: filters.salary === '全部' ? '' : filters.salary,
        pageNum: pageNum,
        pageSize: pageSize
      },
      header: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: function(res) {
        if (res.statusCode === 200) {
          const newJobs = res.data.list || [];
          const hasMore = newJobs.length === pageSize;
          
          if (isLoadMore) {
            // 加载更多
            self.setData({
              jobs: [...self.data.jobs, ...newJobs],
              hasMore: hasMore,
              pageNum: pageNum + 1,
              isLoadingMore: false
            });
          } else {
            // 初次加载或刷新
            self.setData({
              jobs: newJobs,
              hasMore: hasMore,
              pageNum: pageNum + 1,
              loading: false
            });
          }
        } else {
          wx.showToast({
            title: '加载职位失败',
            icon: 'none'
          });
          
          self.setData({
            loading: false,
            isLoadingMore: false
          });
        }
      },
      fail: function() {
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
        
        self.setData({
          loading: false,
          isLoadingMore: false
        });
      }
    });
  },

  /**
   * 搜索职位
   */
  searchJobs: function (e) {
    this.setData({
      searchText: e.detail.value
    });
    
    this.loadJobs();
  },

  /**
   * 清除搜索
   */
  clearSearch: function () {
    this.setData({
      searchText: ''
    });
    
    this.loadJobs();
  },

  /**
   * 显示筛选面板
   */
  showFilter: function () {
    this.setData({
      showFilterPanel: true
    });
  },

  /**
   * 隐藏筛选面板
   */
  hideFilter: function () {
    this.setData({
      showFilterPanel: false
    });
  },

  /**
   * 选择筛选项
   */
  selectFilter: function (e) {
    const { type, value } = e.currentTarget.dataset;
    this.setData({
      [`filters.${type}`]: value
    });
  },

  /**
   * 应用筛选
   */
  applyFilter: function () {
    this.hideFilter();
    this.loadJobs();
  },

  /**
   * 重置筛选
   */
  resetFilter: function () {
    this.setData({
      filters: {
        city: '',
        experience: '',
        education: '',
        salary: ''
      }
    });
  },

  /**
   * 查看职位详情
   */
  viewJobDetail: function (e) {
    const jobId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/job-detail/job-detail?id=${jobId}`
    });
  },

  /**
   * 投递简历
   */
  applyJob: function (e) {
    const jobId = e.currentTarget.dataset.id;
    const resumeId = this.data.resumeId;
    
    if (!resumeId) {
      wx.showModal({
        title: '提示',
        content: '请先选择要投递的简历',
        confirmText: '去选择',
        success: function(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/resume-list/resume-list?selectMode=true'
            });
          }
        }
      });
      return;
    }
    
    this.setData({
      applying: true,
      applyJobId: jobId
    });
    
    const self = this;
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
          const jobs = self.data.jobs.map(job => {
            if (job.id === jobId) {
              job.applied = true;
            }
            return job;
          });
          
          self.setData({
            jobs: jobs
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
          applying: false,
          applyJobId: null
        });
      }
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.loadJobs();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.hasMore) {
      this.loadJobs(true);
    }
  }
}) 