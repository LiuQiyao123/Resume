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

  // 上传简历 - 模拟实现
  uploadResume() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['pdf', 'doc', 'docx'],
      success: (res) => {
        const fileName = res.tempFiles[0].name;
        
        wx.showLoading({
          title: '上传中...',
          mask: true
        });

        // 模拟上传延迟
        setTimeout(() => {
          wx.hideLoading();
          
          // 模拟解析成功，创建新简历
          const resumeId = Date.now().toString();
          
          wx.showToast({
            title: '上传成功',
            icon: 'success'
          });
          
          // 跳转到简历编辑页面
          wx.navigateTo({
            url: `/pages/resume-editor/resume-editor?id=${resumeId}`
          });
        }, 1500);
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

  // 获取简历列表 - 使用模拟数据
  async fetchResumes(callback) {
    try {
      this.setData({ loading: true });
      
      // 模拟数据
      const mockResumes = [
        {
          id: '1',
          title: '前端开发简历',
          createTime: '2024-03-20',
          updateTime: '2024-03-20',
          isOptimized: false
        },
        {
          id: '2',
          title: 'AI优化简历',
          createTime: '2024-03-19',
          updateTime: '2024-03-19',
          isOptimized: true
        }
      ];

      // 处理优化过的简历
      const optimizedResumes = mockResumes.filter(r => r.isOptimized);
      
      this.setData({
        resumes: mockResumes,
        optimizedResumes,
        loading: false,
        isEmpty: mockResumes.length === 0
      });
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

  // 切换tab
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

    // 模拟检查积分
    wx.showModal({
      title: '开始优化',
      content: '确定要开始优化简历吗？',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({
            url: `/pages/resume-customize/resume-customize?resumeId=${resume.id}`
          });
        }
      }
    });
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
      success: (res) => {
        if (res.confirm) {
          // 模拟删除成功
          this.closeActionSheet();
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
          // 刷新简历列表
          this.fetchResumes();
        }
      }
    });
  }
});