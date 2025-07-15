const app = getApp();

Page({
  data: {
    resumeId: '',
    resume: null,
    loading: true,
    targetJob: '',
    targetCompany: '',
    jobDescription: '',
    customRequirements: '',
    chatHistory: [],
    sending: false,
    optimizing: false,
    showPreview: false,
    optimizedContent: null
  },

  onLoad(options) {
    if (options.resumeId) {
      this.setData({ resumeId: options.resumeId });
      this.fetchResumeDetail();
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      });
      wx.navigateBack();
    }
  },

  // 获取简历详情
  async fetchResumeDetail() {
    try {
      const res = await app.request({
        url: `/api/resumes/${this.data.resumeId}`,
        method: 'GET'
      });

      if (res.success) {
        this.setData({
          resume: res.data,
          loading: false
        });
      } else {
        throw new Error(res.message || '获取简历失败');
      }
    } catch (error) {
      console.error('获取简历失败：', error);
      wx.showToast({
        title: '获取简历失败',
        icon: 'none'
      });
      wx.navigateBack();
    }
  },

  // 输入目标职位
  onJobInput(e) {
    this.setData({
      targetJob: e.detail.value
    });
  },

  // 输入目标公司
  onCompanyInput(e) {
    this.setData({
      targetCompany: e.detail.value
    });
  },

  // 输入职位描述
  onJDInput(e) {
    this.setData({
      jobDescription: e.detail.value
    });
  },

  // 输入自定义要求
  onRequirementsInput(e) {
    this.setData({
      customRequirements: e.detail.value
    });
  },

  // 开始优化
  async startOptimize() {
    if (!this.validateInputs()) return;

    this.setData({ optimizing: true });

    try {
      // 初始化对话
      const initMessage = this.generateInitialPrompt();
      await this.sendMessage(initMessage, true);

      // 开始与 AI 的对话循环
      await this.optimizationLoop();

    } catch (error) {
      console.error('优化失败：', error);
      wx.showToast({
        title: '优化失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ optimizing: false });
    }
  },

  // 生成初始提示语
  generateInitialPrompt() {
    const { resume, targetJob, targetCompany, jobDescription, customRequirements } = this.data;
    
    let prompt = `请帮我优化以下简历，使其更适合应聘 ${targetJob}`;
    if (targetCompany) {
      prompt += ` 在 ${targetCompany}`;
    }
    prompt += ' 的职位。\n\n';

    if (jobDescription) {
      prompt += `职位描述：\n${jobDescription}\n\n`;
    }

    if (customRequirements) {
      prompt += `具体要求：\n${customRequirements}\n\n`;
    }

    prompt += `我的简历内容：\n${JSON.stringify(resume.content, null, 2)}`;

    return prompt;
  },

  // 优化循环
  async optimizationLoop() {
    let optimizationComplete = false;
    let retryCount = 0;
    const MAX_RETRIES = 3;

    while (!optimizationComplete && retryCount < MAX_RETRIES) {
      try {
        // 调用 AI 服务
        const response = await app.request({
          url: '/api/ai/chat',
          method: 'POST',
          data: {
            resumeId: this.data.resumeId,
            messages: this.data.chatHistory
          }
        });

        if (response.success) {
          // 添加 AI 回复到对话历史
          this.addMessage(response.data.message, false);

          if (response.data.optimizedContent) {
            // AI 已完成优化
            this.setData({
              optimizedContent: response.data.optimizedContent,
              showPreview: true
            });
            optimizationComplete = true;
          } else {
            // 需要继续对话
            await this.handleFollowUpQuestions(response.data.suggestions);
          }
        } else {
          throw new Error(response.message || '优化失败');
        }
      } catch (error) {
        console.error('优化过程出错：', error);
        retryCount++;
        
        if (retryCount >= MAX_RETRIES) {
          wx.showToast({
            title: '优化失败，请重试',
            icon: 'none'
          });
          break;
        }
      }
    }
  },

  // 处理后续问题
  async handleFollowUpQuestions(suggestions) {
    if (!Array.isArray(suggestions) || suggestions.length === 0) return;

    // 显示建议给用户
    const res = await wx.showModal({
      title: '优化建议',
      content: suggestions[0],
      showCancel: true,
      confirmText: '接受',
      cancelText: '拒绝'
    });

    if (res.confirm) {
      // 用户接受建议
      await this.sendMessage('好的，请继续优化。', true);
    } else {
      // 用户拒绝建议
      await this.sendMessage('不需要这个修改，请继续优化其他部分。', true);
    }
  },

  // 发送消息
  async sendMessage(content, isUser = true) {
    this.setData({ sending: true });

    try {
      // 添加消息到对话历史
      this.addMessage(content, isUser);

      if (!isUser) return; // 如果是 AI 的消息，不需要发送请求

      // 发送消息到后端
      const response = await app.request({
        url: '/api/ai/chat',
        method: 'POST',
        data: {
          resumeId: this.data.resumeId,
          messages: this.data.chatHistory
        }
      });

      if (response.success) {
        // 添加 AI 的回复
        this.addMessage(response.data.message, false);
      } else {
        throw new Error(response.message || '发送失败');
      }
    } catch (error) {
      console.error('发送消息失败：', error);
      wx.showToast({
        title: '发送失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ sending: false });
    }
  },

  // 添加消息到对话历史
  addMessage(content, isUser) {
    const message = {
      content,
      isUser,
      timestamp: new Date().toISOString()
    };

    this.setData({
      chatHistory: [...this.data.chatHistory, message]
    });
  },

  // 验证输入
  validateInputs() {
    const { targetJob, jobDescription } = this.data;

    if (!targetJob.trim()) {
      wx.showToast({
        title: '请输入目标职位',
        icon: 'none'
      });
      return false;
    }

    if (!jobDescription.trim()) {
      wx.showToast({
        title: '请输入职位描述',
        icon: 'none'
      });
      return false;
    }

    return true;
  },

  // 应用优化结果
  async applyOptimization() {
    if (!this.data.optimizedContent) return;

    try {
      const res = await app.request({
        url: `/api/resumes/${this.data.resumeId}/optimize`,
        method: 'POST',
        data: {
          content: this.data.optimizedContent,
          targetJob: this.data.targetJob,
          targetCompany: this.data.targetCompany
        }
      });

      if (res.success) {
        wx.showToast({
          title: '优化成功',
          icon: 'success'
        });

        // 扣除积分
        await this.deductPoints();

        // 返回上一页
        wx.navigateBack();
      } else {
        throw new Error(res.message || '应用优化失败');
      }
    } catch (error) {
      console.error('应用优化失败：', error);
      wx.showToast({
        title: '应用失败，请重试',
        icon: 'none'
      });
    }
  },

  // 扣除积分
  async deductPoints() {
    try {
      await app.request({
        url: '/api/user/points/deduct',
        method: 'POST',
        data: {
          points: 1,
          reason: '简历优化'
        }
      });
    } catch (error) {
      console.error('扣除积分失败：', error);
    }
  },

  // 取消优化
  cancelOptimization() {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消本次优化吗？',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    });
  }
}); 