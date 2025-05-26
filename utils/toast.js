export const showToast = (options) => {
  return wx.showToast({
    duration: 3000,  // 设置默认显示时间为3秒
    icon: 'none',    // 设置默认图标为none
    ...options       // 允许覆盖默认配置
  });
}; 