import store from '../store/index';

// 检查登录状态的中间件
export const checkLogin = (pageConfig) => {
  // 保存原始的 onLoad 函数
  const originalOnLoad = pageConfig.onLoad;

  // 重写 onLoad
  pageConfig.onLoad = function(options) {
    // 检查登录状态
    if (!store.checkLoginStatus()) {
      console.log('未登录，自动执行测试登录');
      if (store.state.isTestMode) {
        store.mockLogin();
      } else {
        wx.navigateTo({
          url: '/pages/login/login'
        });
        return;
      }
    }

    // 调用原始的 onLoad
    if (originalOnLoad) {
      originalOnLoad.call(this, options);
    }
  };

  return pageConfig;
}; 