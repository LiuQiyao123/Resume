const app = getApp();
import config from '../../config';

Page({
  data: {
    resumes: [],
    optimizedResumes: [],
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

  // 创建新简历
  createNewResume() {
    wx.navigateTo({
      url: '/pages/resume-editor/resume-editor'
    });
  },

  // 上传简历
  uploadResume() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['pdf', 'doc', 'docx'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].path;
        const fileName = res.tempFiles[0].name;
        
        wx.showLoading({
          title: '上传中...',
          mask: true
        });

        // 先上传到云存储
        wx.cloud.uploadFile({
          cloudPath: `resumes/${Date.now()}-${fileName}`,
          filePath: tempFilePath,
          config: {
            env: config.cloudEnv // 使用配置文件中的环境 ID
          },
          success: async (uploadRes) => {
            try {
              // 获取文件的临时访问链接
              const { fileID } = uploadRes;
              const { fileList } = await wx.cloud.getTempFileURL({
                fileList: [fileID]
              });
              
              const tempFileURL = fileList[0].tempFileURL;

              // 调用后端接口解析简历
              const result = await app.request({
                url: '/api/resumes/parse',
                method: 'POST',
                data: {
                  fileUrl: tempFileURL,
                  fileName: fileName,
                  fileType: fileName.split('.').pop().toLowerCase(),
                  fileID: fileID
                }
              });

              if (result.success) {
                wx.hideLoading();
                wx.showToast({
                  title: '上传成功',
                  icon: 'success'
                });
                
                // 跳转到简历编辑页面
                wx.navigateTo({
                  url: `/pages/resume-editor/resume-editor?id=${result.data.resumeId}`
                });
              } else {
                throw new Error(result.message || '解析失败');
              }
            } catch (error) {
              console.error('解析简历失败：', error);
              // 删除已上传的文件
              try {
                await wx.cloud.deleteFile({
                  fileList: [uploadRes.fileID]
                });
              } catch (e) {
                console.error('删除文件失败：', e);
              }
              
              wx.hideLoading();
              wx.showToast({
                title: error.message || '解析失败，请重试',
                icon: 'none',
                duration: 2000
              });
            }
          },
          fail: (error) => {
            console.error('上传失败：', error);
            wx.hideLoading();
            wx.showToast({
              title: '上传失败，请重试',
              icon: 'none',
              duration: 2000
            });
          }
        });
      },
      fail: (error) => {
        console.error('选择文件失败：', error);
        wx.showToast({
          title: '请选择正确的文件格式',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 获取简历列表
  async fetchResumes(callback) {
    if (!app.globalData.isLoggedIn) {
      this.setData({
        resumes: [],
        optimizedResumes: [],
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
          optimizedResumes,
          loading: false,
          isEmpty: resumes.length === 0
        });
      } else {
        this.setData({
          loading: false,
          isEmpty: true,
          optimizedResumes: []
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
        optimizedResumes: []
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

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.fetchResumes(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 显示操作菜单
  showActions(e) {
    const index = e.currentTarget.dataset.index;
    const resume = this.data.current === 0 ? this.data.resumes[index] : this.data.optimizedResumes[index];
    this.setData({
      showActionSheet: true,
      currentResume: resume
    });
  },

  // 关闭操作菜单
  closeActionSheet() {
    this.setData({
      showActionSheet: false,
      currentResume: null
    });
  },

  // 开始简历优化
  optimizeResume() {
    const resume = this.data.currentResume;
    if (!resume) return;

    // 关闭操作菜单
    this.closeActionSheet();

    // 检查剩余积分
    this.checkPoints().then(hasEnoughPoints => {
      if (!hasEnoughPoints) {
        wx.showModal({
          title: '积分不足',
          content: '您的积分不足，无法进行简历优化。是否前往购买积分？',
          confirmText: '购买积分',
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

      // 跳转到简历定制页面
      wx.navigateTo({
        url: `/pages/resume-customize/resume-customize?resumeId=${resume.id}`
      });
    });
  },

  // 检查用户积分
  async checkPoints() {
    try {
      const res = await app.request({
        url: '/api/user/points',
        method: 'GET'
      });

      if (res.success) {
        // 假设每次优化需要 1 点积分
        return res.data.points >= 1;
      }
      return false;
    } catch (error) {
      console.error('获取积分失败：', error);
      wx.showToast({
        title: '获取积分信息失败',
        icon: 'none'
      });
      return false;
    }
  },

  // 编辑简历
  editResume() {
    const resume = this.data.currentResume;
    if (!resume) return;

    this.closeActionSheet();
    wx.navigateTo({
      url: `/pages/resume-editor/resume-editor?id=${resume.id}`
    });
  },

  // 预览简历
  previewResume() {
    const resume = this.data.currentResume;
    if (!resume) return;

    this.closeActionSheet();
    wx.navigateTo({
      url: `/pages/resume-preview/resume-preview?id=${resume.id}`
    });
  },

  // 删除简历
  deleteResume() {
    const resume = this.data.currentResume;
    if (!resume) return;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这份简历吗？删除后无法恢复。',
      confirmText: '删除',
      confirmColor: '#ff4d4f',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await app.request({
              url: `/api/resumes/${resume.id}`,
              method: 'DELETE'
            });

            if (result.success) {
              this.closeActionSheet();
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              });
              // 刷新简历列表
              this.fetchResumes();
            } else {
              throw new Error(result.message || '删除失败');
            }
          } catch (error) {
            console.error('删除简历失败：', error);
            wx.showToast({
              title: '删除失败，请重试',
              icon: 'none'
            });
          }
        }
      }
    });
  }
});