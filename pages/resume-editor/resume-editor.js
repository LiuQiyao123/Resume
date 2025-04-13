const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    resumeId: null, // 简历ID，用于编辑现有简历
    isNewResume: true,
    resumeData: {
      title: '我的简历',
      basicInfo: {
        name: '',
        phone: '',
        email: '',
        location: '',
        position: '',
        summary: ''
      },
      education: [],
      experience: [],
      projects: [],
      skills: []
    },
    currentSection: 'basic', // 当前激活的部分
    loading: false,
    saving: false,
    errorMessage: '',
    showEducationForm: false,
    showExperienceForm: false,
    showProjectForm: false,
    formData: {}, // 弹窗表单数据
    formErrors: {}, // 表单错误信息
    currentEditIndex: -1 // 正在编辑的项目索引，-1表示新增
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
        isNewResume: true
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
   * 切换不同的部分
   */
  switchSection: function (e) {
    const section = e.currentTarget.dataset.section;
    this.setData({
      currentSection: section
    });
  },

  /**
   * 返回上一页
   */
  navigateBack: function () {
    wx.navigateBack();
  },

  /**
   * 处理简历标题修改
   */
  onTitleChange: function (e) {
    this.setData({
      'resumeData.title': e.detail.value
    });
  },

  /**
   * 处理基本信息修改
   */
  onBasicInfoChange: function (e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    const key = `resumeData.basicInfo.${field}`;
    this.setData({
      [key]: value
    });
  },

  /**
   * 处理技能修改
   */
  onSkillsChange: function (e) {
    const skillsStr = e.detail.value;
    // 将输入的技能字符串分割成数组
    let skills = skillsStr.split(',').map(skill => skill.trim()).filter(skill => skill);
    this.setData({
      'resumeData.skills': skills
    });
  },

  /**
   * 获取技能字符串
   */
  getSkillsString: function () {
    return this.data.resumeData.skills.join(', ');
  },

  /**
   * 显示教育经历表单
   */
  showEducationForm: function (e) {
    let index = -1;
    let formData = {
      school: '',
      degree: '',
      major: '',
      startDate: '',
      endDate: '',
      description: ''
    };

    if (e.currentTarget.dataset.index !== undefined) {
      index = e.currentTarget.dataset.index;
      formData = { ...this.data.resumeData.education[index] };
    }

    this.setData({
      showEducationForm: true,
      formData: formData,
      currentEditIndex: index,
      formErrors: {}
    });
  },

  /**
   * 隐藏教育经历表单
   */
  hideEducationForm: function () {
    this.setData({
      showEducationForm: false,
      formData: {},
      formErrors: {}
    });
  },

  /**
   * 显示工作经验表单
   */
  showExperienceForm: function (e) {
    let index = -1;
    let formData = {
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      description: ''
    };

    if (e.currentTarget.dataset.index !== undefined) {
      index = e.currentTarget.dataset.index;
      formData = { ...this.data.resumeData.experience[index] };
    }

    this.setData({
      showExperienceForm: true,
      formData: formData,
      currentEditIndex: index,
      formErrors: {}
    });
  },

  /**
   * 隐藏工作经验表单
   */
  hideExperienceForm: function () {
    this.setData({
      showExperienceForm: false,
      formData: {},
      formErrors: {}
    });
  },

  /**
   * 显示项目经验表单
   */
  showProjectForm: function (e) {
    let index = -1;
    let formData = {
      name: '',
      role: '',
      startDate: '',
      endDate: '',
      technologies: '',
      description: ''
    };

    if (e.currentTarget.dataset.index !== undefined) {
      index = e.currentTarget.dataset.index;
      formData = { ...this.data.resumeData.projects[index] };
    }

    this.setData({
      showProjectForm: true,
      formData: formData,
      currentEditIndex: index,
      formErrors: {}
    });
  },

  /**
   * 隐藏项目经验表单
   */
  hideProjectForm: function () {
    this.setData({
      showProjectForm: false,
      formData: {},
      formErrors: {}
    });
  },

  /**
   * 处理表单输入变化
   */
  onFormInputChange: function (e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`formData.${field}`]: value,
      [`formErrors.${field}`]: '' // 清除对应的错误信息
    });
  },

  /**
   * 验证表单
   */
  validateEducationForm: function () {
    let formErrors = {};
    let isValid = true;

    if (!this.data.formData.school) {
      formErrors.school = '请输入学校名称';
      isValid = false;
    }

    if (!this.data.formData.degree) {
      formErrors.degree = '请输入学历或学位';
      isValid = false;
    }

    if (!this.data.formData.major) {
      formErrors.major = '请输入专业';
      isValid = false;
    }

    if (!this.data.formData.startDate) {
      formErrors.startDate = '请输入开始时间';
      isValid = false;
    }

    this.setData({ formErrors });
    return isValid;
  },

  /**
   * 验证工作经验表单
   */
  validateExperienceForm: function () {
    let formErrors = {};
    let isValid = true;

    if (!this.data.formData.company) {
      formErrors.company = '请输入公司名称';
      isValid = false;
    }

    if (!this.data.formData.position) {
      formErrors.position = '请输入职位';
      isValid = false;
    }

    if (!this.data.formData.startDate) {
      formErrors.startDate = '请输入开始时间';
      isValid = false;
    }

    this.setData({ formErrors });
    return isValid;
  },

  /**
   * 验证项目经验表单
   */
  validateProjectForm: function () {
    let formErrors = {};
    let isValid = true;

    if (!this.data.formData.name) {
      formErrors.name = '请输入项目名称';
      isValid = false;
    }

    if (!this.data.formData.role) {
      formErrors.role = '请输入担任角色';
      isValid = false;
    }

    this.setData({ formErrors });
    return isValid;
  },

  /**
   * 保存教育经历
   */
  saveEducationForm: function () {
    if (!this.validateEducationForm()) {
      return;
    }

    let education = [...this.data.resumeData.education];
    
    if (this.data.currentEditIndex >= 0) {
      // 编辑现有项
      education[this.data.currentEditIndex] = this.data.formData;
    } else {
      // 添加新项
      education.push(this.data.formData);
    }

    this.setData({
      'resumeData.education': education,
      showEducationForm: false,
      formData: {},
      formErrors: {}
    });
  },

  /**
   * 保存工作经验
   */
  saveExperienceForm: function () {
    if (!this.validateExperienceForm()) {
      return;
    }

    let experience = [...this.data.resumeData.experience];
    
    if (this.data.currentEditIndex >= 0) {
      // 编辑现有项
      experience[this.data.currentEditIndex] = this.data.formData;
    } else {
      // 添加新项
      experience.push(this.data.formData);
    }

    this.setData({
      'resumeData.experience': experience,
      showExperienceForm: false,
      formData: {},
      formErrors: {}
    });
  },

  /**
   * 保存项目经验
   */
  saveProjectForm: function () {
    if (!this.validateProjectForm()) {
      return;
    }

    let projects = [...this.data.resumeData.projects];
    
    if (this.data.currentEditIndex >= 0) {
      // 编辑现有项
      projects[this.data.currentEditIndex] = this.data.formData;
    } else {
      // 添加新项
      projects.push(this.data.formData);
    }

    this.setData({
      'resumeData.projects': projects,
      showProjectForm: false,
      formData: {},
      formErrors: {}
    });
  },

  /**
   * 删除教育经历
   */
  deleteEducation: function (e) {
    const index = e.currentTarget.dataset.index;
    let education = [...this.data.resumeData.education];
    education.splice(index, 1);

    this.setData({
      'resumeData.education': education
    });
  },

  /**
   * 删除工作经验
   */
  deleteExperience: function (e) {
    const index = e.currentTarget.dataset.index;
    let experience = [...this.data.resumeData.experience];
    experience.splice(index, 1);

    this.setData({
      'resumeData.experience': experience
    });
  },

  /**
   * 删除项目经验
   */
  deleteProject: function (e) {
    const index = e.currentTarget.dataset.index;
    let projects = [...this.data.resumeData.projects];
    projects.splice(index, 1);

    this.setData({
      'resumeData.projects': projects
    });
  },

  /**
   * 保存简历
   */
  saveResume: function () {
    const self = this;
    const resumeData = this.data.resumeData;
    
    // 验证基本信息
    if (!resumeData.basicInfo.name) {
      wx.showToast({
        title: '请填写姓名',
        icon: 'none'
      });
      this.setData({
        currentSection: 'basic',
        formErrors: { name: '请填写姓名' }
      });
      return;
    }
    
    this.setData({ saving: true });
    
    const url = this.data.resumeId 
      ? `https://api.example.com/resumes/${this.data.resumeId}`
      : 'https://api.example.com/resumes';
    
    const method = this.data.resumeId ? 'PUT' : 'POST';
    
    wx.request({
      url: url,
      method: method,
      data: resumeData,
      header: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: function(res) {
        self.setData({ saving: false });
        
        if (res.statusCode === 200 || res.statusCode === 201) {
          wx.showToast({
            title: '保存成功',
            icon: 'success'
          });
          
          // 如果是新建的简历，更新resumeId
          if (!self.data.resumeId && res.data.id) {
            self.setData({
              resumeId: res.data.id
            });
          }
          
          // 延迟返回上一页
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        } else {
          wx.showToast({
            title: '保存失败，请重试',
            icon: 'none'
          });
        }
      },
      fail: function() {
        self.setData({ saving: false });
        wx.showToast({
          title: '网络错误，请检查网络连接后重试',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 预览简历
   */
  previewResume: function () {
    if (!this.data.resumeId) {
      wx.showToast({
        title: '请先保存简历',
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: `/pages/resume-preview/resume-preview?id=${this.data.resumeId}`
    });
  }
}) 