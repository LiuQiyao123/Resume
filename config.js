// config.js
const config = {
  // 小程序配置
  appId: 'wx772e456ae8f2cd6a',
  appSecret: 'f5c32ffac324c7f594810b54543a263f',
  
  // API接口配置
  api: {
    // 微信官方接口
    wxLogin: 'https://api.weixin.qq.com/sns/jscode2session',
    // 其他接口...
  },

  // 开发环境配置
  development: {
    apiBaseUrl: 'http://localhost:3000',  // 开发环境API地址
  },
  // 生产环境配置
  production: {
    apiBaseUrl: 'https://your-api-domain.com',  // 生产环境API地址
  }
};

// 根据环境导出配置
const env = __wxConfig.envVersion || 'release';
const envMap = {
  'develop': 'development',
  'trial': 'production',
  'release': 'production'
};

export default config[envMap[env] || 'production'];