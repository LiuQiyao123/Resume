// config.js
const env = __wxConfig.envVersion || 'release';

const config = {
  development: {
    cloudEnv: 'prod-2gn7vn8085ebc3d9',  // 云托管环境ID
    serviceId: 'express-d8id'           // 服务ID
  },
  production: {
    cloudEnv: 'prod-2gn7vn8085ebc3d9',  // 云托管环境ID
    serviceId: 'express-d8id'           // 服务ID
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