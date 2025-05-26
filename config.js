// config.js
const config = {
  // 小程序配置
  appId: 'wx772e456ae8f2cd6a',
  
  // 云开发环境配置
  cloudEnv: 'prod-2gn7vn8085ebc3d9',  // 云开发环境ID
  
  // 测试模式配置
  isTestMode: true,  // 添加测试模式开关
  testUser: {        // 测试用户数据
    token: 'test_token_123',
    userInfo: {
      openid: 'test_openid_123',
      nickname: '测试用户',
      avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
    }
  },
  
  // API接口配置
  api: {
    // 使用云托管的登录接口
    login: '/api/login'  // 登录接口路径
  }
};

// 根据环境选择基础URL和服务配置
const env = __wxConfig.envVersion || 'release';
const envConfig = {
  'develop': {
    baseUrl: 'https://prod-2gn7vn8085ebc3d9.service.tcloudbase.com',  // 开发环境
    serviceId: 'resume-backend-0'  // 开发环境服务ID
  },
  'trial': {
    baseUrl: 'https://prod-2gn7vn8085ebc3d9.service.tcloudbase.com',  // 测试环境
    serviceId: 'resume-backend-0'  // 测试环境服务ID
  },
  'release': {
    baseUrl: 'https://prod-2gn7vn8085ebc3d9.service.tcloudbase.com',  // 生产环境
    serviceId: 'resume-backend-0'  // 生产环境服务ID
  }
};

const currentEnv = envConfig[env] || envConfig.release;

export default {
  ...config,
  baseUrl: currentEnv.baseUrl,
  serviceId: currentEnv.serviceId
};