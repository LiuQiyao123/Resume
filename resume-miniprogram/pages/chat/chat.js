const app = getApp();

Page({
  data: {
    conversationId: null,
    messages: [],
    inputValue: '',
    scrollTop: 0,
    isLoadingMore: false,
    hasMoreMessages: true,
    isProcessing: false,
    isRecording: false,
    recordingTime: 0,
    recordingTimer: null,
    isSendButtonEnabled: false,
    isNew: true, // 是否为新会话
    aiModes: [
      { id: 'career_advisor', name: '职业顾问', desc: '解答求职问题，提供职业建议' },
      { id: 'resume_improver', name: '简历优化', desc: '分析简历内容，提出改进建议' },
      { id: 'interview_coach', name: '面试教练', desc: '模拟面试场景，提供反馈' }
    ],
    selectedMode: 'career_advisor',
    showModeSelector: false
  },

  onLoad(options) {
    // 如果有会话ID参数，则加载现有会话
    if (options.id) {
      this.setData({
        conversationId: options.id,
        isNew: false
      });
      this.fetchMessages();
    } else {
      // 新会话显示模式选择器
      this.setData({
        showModeSelector: true
      });
    }

    // 获取系统信息计算安全区域
    const systemInfo = app.globalData.systemInfo || wx.getSystemInfoSync();
    const safeBottom = systemInfo.screenHeight - systemInfo.safeArea.bottom;
    
    this.setData({
      safeBottom: safeBottom > 0 ? safeBottom : 0
    });
  },

  onShow() {
    // 页面显示时滚动到底部
    this.scrollToBottom();
  },

  onUnload() {
    // 清除录音计时器
    if (this.data.recordingTimer) {
      clearInterval(this.data.recordingTimer);
    }
  },

  // 获取会话消息
  async fetchMessages() {
    if (!this.data.conversationId || this.data.isLoadingMore) return;
    
    try {
      this.setData({ isLoadingMore: true });
      
      const res = await app.request({
        url: `/api/conversations/${this.data.conversationId}/messages`,
        method: 'GET',
        data: {
          limit: 20,
          before: this.data.messages.length > 0 
            ? this.data.messages[0].timestamp 
            : undefined
        }
      });
      
      if (res.success) {
        // 预处理消息
        const newMessages = res.data.map(msg => this.processMessage(msg));
        
        // 添加消息到列表前端
        this.setData({
          messages: [...newMessages.reverse(), ...this.data.messages],
          hasMoreMessages: res.data.length === 20
        });
        
        // 如果是第一次加载，滚动到底部
        if (this.data.messages.length === newMessages.length) {
          this.scrollToBottom();
        }
      } else {
        wx.showToast({
          title: res.error.message || '获取消息失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('获取消息失败', error);
      wx.showToast({
        title: '获取消息失败',
        icon: 'none'
      });
    } finally {
      this.setData({ isLoadingMore: false });
    }
  },

  // 创建新会话
  async createConversation() {
    if (this.data.isProcessing) return;
    
    this.setData({ 
      isProcessing: true,
      showModeSelector: false 
    });
    
    try {
      const res = await app.request({
        url: '/api/conversations',
        method: 'POST',
        data: {
          mode: this.data.selectedMode
        }
      });
      
      if (res.success) {
        this.setData({
          conversationId: res.data.id,
          isNew: false,
          messages: [{
            id: 'welcome',
            role: 'ai',
            content: res.data.welcomeMessage || '你好，我是AI助手。我能帮你优化简历、提供职业建议或模拟面试。请问有什么可以帮到你的？',
            timestamp: new Date().getTime(),
            formattedTime: this.formatTime(new Date())
          }]
        });
        
        this.scrollToBottom();
      } else {
        wx.showToast({
          title: res.error.message || '创建会话失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('创建会话失败', error);
      wx.showToast({
        title: '创建会话失败',
        icon: 'none'
      });
    } finally {
      this.setData({ isProcessing: false });
    }
  },

  // 发送消息
  async sendMessage() {
    const content = this.data.inputValue.trim();
    if (!content || this.data.isProcessing) return;
    
    // 如果是新会话，先创建会话
    if (this.data.isNew) {
      await this.createConversation();
    }
    
    const tempId = `temp_${Date.now()}`;
    const timestamp = new Date().getTime();
    
    // 添加用户消息到列表
    const userMsg = {
      id: tempId,
      role: 'user',
      content: content,
      timestamp: timestamp,
      formattedTime: this.formatTime(new Date(timestamp)),
      pending: false
    };
    
    // 添加一个AI的空消息用于显示加载状态
    const aiMsg = {
      id: `ai_${tempId}`,
      role: 'ai',
      content: '',
      timestamp: timestamp + 1,
      formattedTime: this.formatTime(new Date(timestamp + 1)),
      pending: true
    };
    
    this.setData({
      messages: [...this.data.messages, userMsg, aiMsg],
      inputValue: '',
      isSendButtonEnabled: false,
      isProcessing: true
    });
    
    this.scrollToBottom();
    
    try {
      const res = await app.request({
        url: `/api/conversations/${this.data.conversationId}/messages`,
        method: 'POST',
        data: {
          content: content,
          role: 'user'
        }
      });
      
      if (res.success) {
        // 更新消息列表，替换临时消息
        const updatedMessages = this.data.messages.map(msg => {
          if (msg.id === tempId) {
            return {
              ...msg,
              id: res.data.userMessage.id
            };
          } else if (msg.id === aiMsg.id) {
            return this.processMessage(res.data.aiMessage);
          }
          return msg;
        });
        
        this.setData({
          messages: updatedMessages,
          isProcessing: false
        });
        
        this.scrollToBottom();
      } else {
        // 显示错误，并将AI消息标记为错误
        const updatedMessages = this.data.messages.map(msg => {
          if (msg.id === aiMsg.id) {
            return {
              ...msg,
              content: '消息发送失败，请重试',
              pending: false,
              error: true
            };
          }
          return msg;
        });
        
        this.setData({
          messages: updatedMessages,
          isProcessing: false
        });
        
        wx.showToast({
          title: res.error.message || '发送消息失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('发送消息失败', error);
      
      // 更新AI消息为错误状态
      const updatedMessages = this.data.messages.map(msg => {
        if (msg.id === aiMsg.id) {
          return {
            ...msg,
            content: '消息发送失败，请重试',
            pending: false,
            error: true
          };
        }
        return msg;
      });
      
      this.setData({
        messages: updatedMessages,
        isProcessing: false
      });
      
      wx.showToast({
        title: '发送消息失败',
        icon: 'none'
      });
    }
  },

  // 输入框内容变化
  onInputChange(e) {
    const value = e.detail.value.trim();
    this.setData({
      inputValue: e.detail.value,
      isSendButtonEnabled: value.length > 0
    });
  },

  // 处理消息格式
  processMessage(message) {
    return {
      id: message.id,
      role: message.role,
      content: message.content,
      timestamp: message.timestamp,
      formattedTime: this.formatTime(new Date(message.timestamp)),
      pending: false
    };
  },

  // 时间格式化
  formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  // 滚动到底部
  scrollToBottom() {
    setTimeout(() => {
      const query = wx.createSelectorQuery().in(this);
      query.select('.chat-messages').fields({
        size: true,
        scrollOffset: true,
      }, (res) => {
        if (res && res.scrollHeight) {
          this.setData({
            scrollTop: res.scrollHeight
          });
        }
      }).exec();
    }, 100);
  },

  // 加载更多消息
  loadMoreMessages() {
    if (this.data.hasMoreMessages && !this.data.isLoadingMore) {
      this.fetchMessages();
    }
  },

  // 开始录音
  startRecording() {
    if (this.data.isProcessing) return;
    
    // 创建录音管理器
    const recorderManager = wx.getRecorderManager();
    
    recorderManager.onStart(() => {
      console.log('录音开始');
      // 开始计时
      const timer = setInterval(() => {
        this.setData({
          recordingTime: this.data.recordingTime + 1
        });
      }, 1000);
      
      this.setData({
        isRecording: true,
        recordingTime: 0,
        recordingTimer: timer
      });
    });
    
    recorderManager.onStop((res) => {
      if (this.data.recordingTimer) {
        clearInterval(this.data.recordingTimer);
      }
      
      console.log('录音结束', res);
      
      // 停止录音状态
      this.setData({
        isRecording: false,
        recordingTime: 0,
        recordingTimer: null
      });
      
      if (res.duration < 1000) {
        wx.showToast({
          title: '录音时间过短',
          icon: 'none'
        });
        return;
      }
      
      // 开始处理语音转文字
      this.processVoice(res.tempFilePath);
    });
    
    // 监听录音错误
    recorderManager.onError((err) => {
      console.error('录音失败', err);
      
      if (this.data.recordingTimer) {
        clearInterval(this.data.recordingTimer);
      }
      
      this.setData({
        isRecording: false,
        recordingTime: 0,
        recordingTimer: null
      });
      
      wx.showToast({
        title: '录音失败',
        icon: 'none'
      });
    });
    
    // 开始录音
    recorderManager.start({
      duration: 60000, // 最长录音时间，单位ms
      sampleRate: 16000, // 采样率
      numberOfChannels: 1, // 录音通道数
      encodeBitRate: 64000, // 编码码率
      format: 'mp3' // 音频格式
    });
  },

  // 停止录音
  stopRecording() {
    const recorderManager = wx.getRecorderManager();
    recorderManager.stop();
  },

  // 取消录音
  cancelRecording() {
    const recorderManager = wx.getRecorderManager();
    recorderManager.stop();
    
    if (this.data.recordingTimer) {
      clearInterval(this.data.recordingTimer);
    }
    
    this.setData({
      isRecording: false,
      recordingTime: 0,
      recordingTimer: null
    });
  },

  // 处理语音文件
  async processVoice(filePath) {
    wx.showLoading({
      title: '语音识别中',
      mask: true
    });
    
    try {
      // 上传语音文件
      const uploadResult = await this.uploadVoiceFile(filePath);
      
      if (uploadResult.success) {
        // 处理识别结果
        const text = uploadResult.data.text;
        
        if (text && text.trim()) {
          this.setData({
            inputValue: text,
            isSendButtonEnabled: true
          });
          
          // 自动发送消息
          this.sendMessage();
        } else {
          wx.showToast({
            title: '未能识别语音内容',
            icon: 'none'
          });
        }
      } else {
        wx.showToast({
          title: uploadResult.error.message || '语音识别失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('语音处理失败', error);
      wx.showToast({
        title: '语音识别失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 上传语音文件
  uploadVoiceFile(filePath) {
    return new Promise((resolve, reject) => {
      const token = wx.getStorageSync('token');
      
      wx.uploadFile({
        url: `${app.globalData.apiBaseUrl}/api/ai/speech-to-text`,
        filePath: filePath,
        name: 'audio',
        header: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        success: (res) => {
          try {
            const data = JSON.parse(res.data);
            resolve(data);
          } catch (err) {
            reject(new Error('解析响应失败'));
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },

  // 选择AI模式
  selectMode(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({
      selectedMode: mode
    });
  },

  // 确认选择模式并创建会话
  confirmModeSelection() {
    this.createConversation();
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack({
      fail: () => {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }
    });
  }
}) 