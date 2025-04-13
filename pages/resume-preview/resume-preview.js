Page({
  /**
   * 页面的初始数据
   */
  data: {
    resumeId: null,
    resumeData: null,
    loading: true,
    errorMessage: '',
    templates: [
      { id: 1, name: '标准模板', thumbnail: '/images/template-standard.png' },
      { id: 2, name: '专业模板', thumbnail: '/images/template-professional.png' },
      { id: 3, name: '创意模板', thumbnail: '/images/template-creative.png' }
    ],
    selectedTemplate: 1,
    showTemplateSelector: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.id) {
      this.setData({
        resumeId: options.id,
        loading: true
      });
      this.loadResumeData(options.id);
    } else {
      this.setData({
        loading: false,
        errorMessage: '未找到简历ID'
      });
    }
  },

  /**
   * 加载简历数据
   */
  loadResumeData: function (resumeId) {
    const self = this;
    wx.request({
      url: `https://api.example.com/resumes/${resumeId}`,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: function(res) {
        if (res.statusCode === 200) {
          self.setData({
            resumeData: res.data,
            loading: false
          });
        } else {
          self.setData({
            errorMessage: '加载简历数据失败，请重试',
            loading: false
          });
        }
      },
      fail: function() {
        self.setData({
          errorMessage: '网络错误，请检查网络连接后重试',
          loading: false
        });
      }
    });
  },

  /**
   * 返回编辑页面
   */
  goToEdit: function () {
    wx.navigateBack();
  },

  /**
   * 显示模板选择器
   */
  showTemplateSelector: function () {
    this.setData({
      showTemplateSelector: true
    });
  },

  /**
   * 隐藏模板选择器
   */
  hideTemplateSelector: function () {
    this.setData({
      showTemplateSelector: false
    });
  },

  /**
   * 选择模板
   */
  selectTemplate: function (e) {
    const templateId = e.currentTarget.dataset.id;
    this.setData({
      selectedTemplate: templateId,
      showTemplateSelector: false
    });
  },

  /**
   * 下载简历
   */
  downloadResume: function () {
    wx.showToast({
      title: '正在生成PDF文件',
      icon: 'loading',
      duration: 2000
    });

    const self = this;
    wx.request({
      url: `https://api.example.com/resumes/${this.data.resumeId}/download`,
      method: 'POST',
      data: {
        templateId: this.data.selectedTemplate
      },
      header: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: function(res) {
        if (res.statusCode === 200 && res.data.downloadUrl) {
          wx.showToast({
            title: '已生成简历文件',
            icon: 'success',
            duration: 1500
          });
          
          // 在微信小程序中，不能直接下载文件，但可以复制下载链接或预览
          wx.showModal({
            title: '简历已生成',
            content: '由于小程序限制，请点击"复制链接"按钮，然后在浏览器中打开链接下载简历文件',
            confirmText: '复制链接',
            success: function (modalRes) {
              if (modalRes.confirm) {
                wx.setClipboardData({
                  data: res.data.downloadUrl,
                  success: function() {
                    wx.showToast({
                      title: '链接已复制',
                      icon: 'success'
                    });
                  }
                });
              }
            }
          });
        } else {
          wx.showToast({
            title: '生成简历失败',
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
   * 分享简历
   */
  shareResume: function () {
    // 注意：在小程序中，分享功能需要通过onShareAppMessage生命周期函数实现
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage']
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: this.data.resumeData ? `${this.data.resumeData.title} - 我的简历` : '我的简历',
      path: `/pages/resume-preview/resume-preview?id=${this.data.resumeId}`,
      imageUrl: '/images/share-resume.png'
    };
  },

  /**
   * 申请职位
   */
  applyJob: function () {
    wx.navigateTo({
      url: `/pages/job-list/job-list?resumeId=${this.data.resumeId}`
    });
  }
}) 