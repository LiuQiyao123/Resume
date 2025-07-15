// config.js

// 1. 基础配置
const baseConfig = {
  appId: 'wx772e456ae8f2cd6a',
  version: '1.0.1',
  api: {
    // API 路径，统一不带 /api 前缀
    login: '/auth/login',
    refreshToken: '/auth/refresh-token',
    bindPhone: '/user/phone',
    getUserInfo: '/user/info',
    health: '/health',
    config: '/system/config',
    resumeList: '/resume/list',
    resumeDetail: '/resume/detail',
    resumeCreate: '/resume/create',
    resumeUpdate: '/resume/update',
    resumeDelete: '/resume/delete'
  },
  debug: {
    logLevel: 'info',
    showApiLogs: true,
  },
};

// 2. 环境特定配置
const envConfig = {
  // 开发环境
  develop: {
    baseURL: 'http://localhost:3000',
    apiPrefix: '/api',
    cloudEnv: 'local-dev-env',
  },
  // 体验环境
  trial: {
    baseURL: 'https://express-d8id-152341-4-1348069598.sh.run.tcloudbase.com',
    apiPrefix: '/api', // 后端路由统一以 /api 开头
    cloudEnv: 'prod-2gn7vn8085ebc3d9',
  },
  // 生产环境
  release: {
    // 注意：生产环境URL可能与体验环境不同，请根据实际情况调整
    baseURL: 'https://express-d8id-152341-4-1348069598.sh.run.tcloudbase.com',
    apiPrefix: '/api', // 后端路由统一以 /api 开头
    cloudEnv: 'prod-2gn7vn8085ebc3d9',
  }
};

// 3. 获取当前运行环境
let wxEnv = 'release'; // 默认为生产环境
try {
  const envVersionInfo = __wxConfig.envVersion;
  if (['develop', 'trial', 'release'].includes(envVersionInfo)) {
    wxEnv = envVersionInfo;
  }
} catch (e) {
  // 在非微信环境下（如 Node.js），__wxConfig 不存在，这很正常
}
console.log(`[Config] 当前环境: ${wxEnv}`);


// 4. 合并配置，生成最终可用的配置对象
const currentEnvConfig = envConfig[wxEnv];

const finalConfig = {
  ...baseConfig,
  ...currentEnvConfig,
  currentEnv: wxEnv,

  /**
   * 核心函数：获取完整的 API 地址
   * @param {string} path - 在 baseConfig.api 中定义的路径，例如 '/auth/login'
   * @returns {string} 完整的可请求的 URL
   */
  getApiPath(path) {
    if (!path || typeof path !== 'string') {
      console.error(`[Config] getApiPath 需要一个字符串路径，但收到了: ${path}`);
      return '';
    }
    // 完整URL = baseURL + apiPrefix + path
    // 例如: 'http://localhost:3000' + '/api' + '/auth/login'
    return `${this.baseURL}${this.apiPrefix}${path}`;
  }
};

console.log(`[Config] baseURL 已设置为: ${finalConfig.baseURL}`);

export default finalConfig;