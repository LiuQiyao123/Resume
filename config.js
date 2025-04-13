// config.js
const env = __wxConfig.envVersion || 'release';

const config = {
  development: {
    cloudEnv: 'prod-2gn7vn8085ebc3d9',  // 云托管环境ID
    serviceId: 'express-d8id',           // 服务ID
    apiBaseUrl: 'http://localhost:3000',  // 本地开发环境
    wsBaseUrl: 'ws://localhost:3000',     // WebSocket地址（如果需要）
    uploadUrl: 'http://localhost:3000/upload',  // 上传文件地址
    cdnBaseUrl: 'http://localhost:3000/static'  // 静态资源地址
  },
  production: {
    cloudEnv: 'prod-2gn7vn8085ebc3d9',  // 云托管环境ID
    serviceId: 'express-d8id',           // 服务ID
    apiBaseUrl: 'https://api.yoursite.com',     // 生产环境
    wsBaseUrl: 'wss://api.yoursite.com',        // WebSocket地址
    uploadUrl: 'https://api.yoursite.com/upload',
    cdnBaseUrl: 'https://cdn.yoursite.com'
  }
};

// 环境映射
const envMap = {
  'develop': 'development',  // 开发版
  'trial': 'production',     // 体验版
  'release': 'production'    // 正式版
};

const currentEnv = envMap[env] || 'production';

// 导出配置
export default {
  ...config[currentEnv],
  env: currentEnv
};