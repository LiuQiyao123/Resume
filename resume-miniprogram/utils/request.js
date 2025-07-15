// 请求队列，用于存储 401 状态下的请求
let requestQueue = [];
// 是否正在刷新 token
let isRefreshing = false;

// 请求拦截器
const request = (options) => {
  // url 参数现在必须是一个完整的URL
  const { url, method = 'GET', data, header = {} } = options;
  
  // 添加token到请求头
  const token = wx.getStorageSync('token');
  if (token) {
    header['Authorization'] = `Bearer ${token}`;
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: url, // 核心修正：直接使用传入的完整url
      method,
      data,
      header,
      success: async (res) => {
        // 请求成功
        if (res.statusCode === 200) {
          resolve(res.data);
          return;
        }
        
        // token 过期
        if (res.statusCode === 401) {
          // 清空本地存储的token
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          
          // 跳转到登录页
          wx.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none'
          });
          
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/login/index'
            });
          }, 1500);
          
          reject(new Error('登录已过期'));
          return;
        }
        
        // 其他错误
        reject(new Error(res.data.message || '请求失败'));
      },
      fail: (error) => {
        reject(error);
      }
    });
  });
};

export default request; 