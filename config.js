// config.js
const config = {
  // 小程序配置
  appId: 'wx772e456ae8f2cd6a',
  
  // API接口配置
  api: {
    // 使用云托管的登录接口
    login: '/api/login'  // 登录接口路径
  }
};

// 根据环境选择基础URL
const env = __wxConfig.envVersion || 'release';
const envMap = {
  'develop': 'https://express-d8id-152341-4-1348069598.sh.run.tcloudbase.com',  // 开发环境
  'trial': 'https://express-d8id-152341-4-1348069598.sh.run.tcloudbase.com',    // 测试环境
  'release': 'https://express-d8id-152341-4-1348069598.sh.run.tcloudbase.com'   // 生产环境
};

export default {
  ...config,
  baseUrl: envMap[env] || envMap.release
};