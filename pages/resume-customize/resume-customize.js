const app = getApp();

Page({
  data: {
    step: 1, // 1: 选择简历, 2: 输入求职信息, 3: 选择模板, 4: 优化结果
    resumeList: [],
    loadingResumes: true,
    selectedResumeId: '',
    selectedResume: null,
    position: '',
    company: '',
    jobDescription: '',
    templates: [
      { id: 'professional', name: '专业简洁', preview: '/images/template-professional.png', tags: ['专业', '通用'] },
      { id: 'modern', name: '现代风格', preview: '/images/template-modern.png', tags: ['时尚', '创意'] },
      { id: 'tech', name: '科技风格', preview: '/images/template-tech.png', tags: ['技术', 'IT'] },
      { id: 'elegant', name: '优雅格调', preview: '/images/template-elegant.png', tags: ['高级', '管理'] }
    ],
    selectedTemplateId: 'professional',
    optimizationResult: null,
    loading: false,
    error: null,
    optimizationCost: 20, // 默认消耗积分
    userCredits: 0,
    optimizationId: null
  },

  onLoad(options) {
    // 如果有传入简历ID，则直接选中
    if (options.resumeId) {
      this.setData({
        selectedResumeId: options.resumeId
      });
    }
    
    // 如果有传入职位，则填入
    if (options.position) {
      this.setData({
        position: options.position
      });
    }
    
    this.fetchResumes();
    this.fetchUserCredits();
  },

  // 获取用户简历列表
  async fetchResumes() {
    this.setData({ loadingResumes: true });
    
    try {
      const res = await app.request({
        url: '/api/resumes',
        method: 'GET'
      });
      
      if (res.success) {
        const resumeList = res.data.map(item => ({
          ...item,
          updateTime: this.formatDate(new Date(item.updateTime))
        }));
        
        this.setData({
          resumeList,
          loadingResumes: false
        });
        
        // 如果已经选择了简历ID，则查找并设置选中的简历
        if (this.data.selectedResumeId) {
          const selectedResume = resumeList.find(resume => resume.id === this.data.selectedResumeId);
          if (selectedResume) {
            this.setData({
              selectedResume
            });
          }
        }
      } else {
        this.setData({
          loadingResumes: false,
          error: res.error.message || '获取简历列表失败'
        });
        
        wx.showToast({
          title: res.error.message || '获取简历列表失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('获取简历列表失败', error);
      
      this.setData({
        loadingResumes: false,
        error: '获取简历列表失败'
      });
      
      wx.showToast({
        title: '获取简历列表失败',
        icon: 'none'
      });
    }
  },

  // 获取用户积分
  async fetchUserCredits() {
    try {
      const res = await app.request({
        url: '/api/credits',
        method: 'GET'
      });
      
      if (res.success) {
        this.setData({
          userCredits: res.data.balance
        });
      }
    } catch (error) {
      console.error('获取积分信息失败', error);
    }
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 选择简历
  selectResume(e) {
    const resumeId = e.currentTarget.dataset.id;
    const selectedResume = this.data.resumeList.find(resume => resume.id === resumeId);
    
    this.setData({
      selectedResumeId: resumeId,
      selectedResume: selectedResume
    });
  },

  // 选择模板
  selectTemplate(e) {
    const templateId = e.currentTarget.dataset.id;
    
    this.setData({
      selectedTemplateId: templateId
    });
  },

  // 处理输入变化
  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [field]: e.detail.value
    });
  },

  // 下一步
  nextStep() {
    const { step } = this.data;
    
    // 验证当前步骤
    if (step === 1) {
      if (!this.data.selectedResumeId) {
        wx.showToast({
          title: '请选择一份简历',
          icon: 'none'
        });
        return;
      }
    } else if (step === 2) {
      if (!this.data.position.trim()) {
        wx.showToast({
          title: '请输入目标职位',
          icon: 'none'
        });
        return;
      }
      
      if (!this.data.jobDescription.trim()) {
        wx.showToast({
          title: '请输入职位描述',
          icon: 'none'
        });
        return;
      }
    } else if (step === 3) {
      if (this.data.userCredits < this.data.optimizationCost) {
        wx.showModal({
          title: '积分不足',
          content: `您的积分余额不足，当前余额：${this.data.userCredits}，需要：${this.data.optimizationCost}。是否前往充值？`,
          confirmText: '去充值',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              wx.navigateTo({
                url: '/pages/points/points'
              });
            }
          }
        });
        return;
      }
      
      // 开始优化
      this.startOptimization();
      return;
    }
    
    this.setData({
      step: step + 1
    });
  },

  // 上一步
  prevStep() {
    const { step } = this.data;
    if (step <= 1) return;
    
    this.setData({
      step: step - 1
    });
  },

  // 开始简历优化
  async startOptimization() {
    this.setData({
      loading: true,
      error: null
    });
    
    try {
      const res = await app.request({
        url: '/api/resumes/optimize',
        method: 'POST',
        data: {
          resumeId: this.data.selectedResumeId,
          position: this.data.position,
          company: this.data.company,
          jobDescription: this.data.jobDescription,
          templateId: this.data.selectedTemplateId
        }
      });
      
      if (res.success) {
        this.setData({
          optimizationResult: res.data.result,
          optimizationId: res.data.optimizationId,
          step: 4,
          loading: false
        });
        
        // 刷新积分
        this.fetchUserCredits();
      } else {
        this.setData({
          loading: false,
          error: res.error.message || '简历优化失败'
        });
        
        wx.showToast({
          title: res.error.message || '简历优化失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('简历优化失败', error);
      
      this.setData({
        loading: false,
        error: '请求失败，请重试'
      });
      
      wx.showToast({
        title: '请求失败，请重试',
        icon: 'none'
      });
    }
  },

  // 查看优化后的简历
  viewOptimizedResume() {
    if (!this.data.optimizationId) return;
    
    wx.navigateTo({
      url: `/pages/resume-preview/resume-preview?id=${this.data.selectedResumeId}&optimizationId=${this.data.optimizationId}`
    });
  },

  // 应用优化结果
  async applyOptimization() {
    if (!this.data.optimizationId) return;
    
    this.setData({
      loading: true
    });
    
    try {
      const res = await app.request({
        url: `/api/resumes/optimize/${this.data.optimizationId}/apply`,
        method: 'POST'
      });
      
      if (res.success) {
        wx.showToast({
          title: '应用成功',
          icon: 'success'
        });
        
        // 延迟跳转，让用户能看到成功提示
        setTimeout(() => {
          wx.navigateTo({
            url: `/pages/resume-editor/resume-editor?id=${this.data.selectedResumeId}`
          });
        }, 1500);
      } else {
        this.setData({
          loading: false
        });
        
        wx.showToast({
          title: res.error.message || '应用优化失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('应用优化失败', error);
      
      this.setData({
        loading: false
      });
      
      wx.showToast({
        title: '应用优化失败',
        icon: 'none'
      });
    }
  },

  // 返回首页
  goHome() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  // 创建新的简历
  createNewResume() {
    wx.navigateTo({
      url: '/pages/resume-editor/resume-editor'
    });
  }
}) 