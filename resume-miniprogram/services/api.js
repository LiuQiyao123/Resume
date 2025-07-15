import config from '../config';
import store from '../store/index';
import { callCloudApi } from '../utils/cloudApi';

// API 请求封装 - 使用云托管环境
const request = async (options) => {
  const { url, method = 'GET', data, needAuth = true } = options;
  
  console.log(`[API请求] ${method} ${url}`, data);
  
  // 构建请求头
  const header = {
    'Content-Type': 'application/json'
  };

  // 添加认证令牌
  if (needAuth) {
    const token = wx.getStorageSync('token');
    if (token) {
      header.Authorization = `Bearer ${token}`;
    } else {
      console.warn('需要授权但未找到token');
    }
  }

  try {
    // 使用新的云托管API调用
    const response = await callCloudApi({
      path: url,  // 这里直接传入路径，不需要添加baseUrl
      method,
      data,
      header,
      timeout: 10000,  // 增加超时时间，登录请求可能较慢
      enableRetry: true  // 启用重试
    });
    
    console.log(`[API响应] ${method} ${url}`, response);

    // 处理响应
    if (response.statusCode === 401) {
      console.warn('认证失败，清除登录状态');
      store.logout();  // 使用store的logout方法替代clearLoginState
      wx.navigateTo({ url: '/pages/login/login' });
      throw new Error('登录已过期');
    }

    if (response.statusCode !== 200) {
      console.error(`请求失败: ${response.statusCode}`, response.data);
      throw new Error(`请求失败: ${response.statusCode} - ${response.data?.message || '未知错误'}`);
    }

    return response.data;
  } catch (error) {
    console.error(`[API错误] ${method} ${url}:`, error);
    
    // 为登录失败提供更详细的错误信息
    if (url.includes('/api/login')) {
      console.error('登录失败详情:', {
        url,
        method,
        error: error.message,
        stack: error.stack,
        config: {
          cloudEnv: config.cloudEnv,
          serviceId: config.serviceId
        }
      });
    }
    
    throw error;
  }
};

// API 接口定义
export const api = {
  get: (url, data, needAuth = true) => request({ url, method: 'GET', data, needAuth }),
  post: (url, data, needAuth = true) => request({ url, method: 'POST', data, needAuth }),
  put: (url, data, needAuth = true) => request({ url, method: 'PUT', data, needAuth }),
  delete: (url, data, needAuth = true) => request({ url, method: 'DELETE', data, needAuth }),
  
  // 专门的登录方法 - 带有多服务ID和多路径自动探测
  login: async (code, pageEnvInfo = {}) => {
    console.log('开始登录流程，code:', code);
    
    try {
      // 使用页面传递的环境配置或默认配置
      const envConfig = {
        cloudEnv: pageEnvInfo.cloudEnv || config.cloudEnv,
        serviceId: pageEnvInfo.serviceId || config.serviceId,
        diagnosticMode: config.diagnosticMode
      };
      
      console.log('登录使用环境配置:', envConfig);
      
      // 确保云环境已初始化
      if (!wx.cloud) {
        await wx.cloud.init({
          env: envConfig.cloudEnv,
          traceUser: true
        });
      }
      
      // 记录详细的请求信息用于调试
      console.log('登录请求详细信息:', {
        cloudEnv: envConfig.cloudEnv,
        serviceId: envConfig.serviceId,
        loginPath: config.api.login,
        诊断模式: config.diagnosticMode
      });
      
      // 尝试不同的API路径格式
      const paths = [
        '/api/login',                // 标准REST API路径
        '/login',                    // 无api前缀
        '/auth/login',               // 替代auth前缀
        '/weapp/login',              // 小程序专用前缀
        config.api.login,            // 配置中定义的路径
        '/api/user/login',           // 其他可能路径
        '/api/auth/login'            // 其他可能路径
      ];
      
      // 要尝试的服务ID列表
      const serviceIds = config.diagnosticMode
        ? [envConfig.serviceId, ...config.possibleServiceIds]  // 诊断模式下首先尝试传入的服务ID，然后是可能的服务ID
        : [envConfig.serviceId];                             // 正常模式只使用传入的服务ID
      
      // 去重
      const uniqueServiceIds = [...new Set(serviceIds)];
      
      console.log(`诊断模式: ${config.diagnosticMode}, 将尝试 ${paths.length} 种路径和 ${uniqueServiceIds.length} 种服务ID组合`);
      
      let lastError = null;
      let bestStatusCode = 500;
      let attemptCount = 0;
      let foundValidEndpoint = false;
      
      // 记录成功的组合，用于后续配置更新
      let successfulConfig = null;
      
      // 依次尝试不同的服务ID和路径组合
      for (const serviceId of serviceIds) {
        for (const path of paths) {
          attemptCount++;
          try {
            console.log(`尝试组合 [${attemptCount}]: 服务ID=${serviceId}, 路径=${path}`);
            
            // 直接使用云函数调用，绕过可能的路径问题
            const result = await wx.cloud.callContainer({
              config: {
                env: envConfig.cloudEnv
              },
              path: path,
              method: 'POST',
              data: { code },
              header: {
                'X-WX-SERVICE': serviceId,
                'Content-Type': 'application/json'
              },
              timeout: 10000  // 增加超时时间
            });
            
            // 记录状态码，用于选择最佳错误
            if (result.statusCode < bestStatusCode) {
              bestStatusCode = result.statusCode;
            }
            
            console.log(`组合 [${attemptCount}] 返回状态码: ${result.statusCode}`);
            
            // 检查响应是否成功
            if (result.statusCode === 200 && result.data) {
              console.log('找到有效端点! 登录成功:', result.data);
              
              // 记录成功的配置
              successfulConfig = { serviceId, path };
              foundValidEndpoint = true;
              
              // 如果在诊断模式下找到了有效配置，建议更新config
              if (config.diagnosticMode && (serviceId !== config.serviceId || path !== config.api.login)) {
                console.log('📝 建议更新配置为:', {
                  serviceId,
                  loginPath: path
                });
              }
              
              return result.data;
            } else if (result.statusCode === 404) {
              console.warn(`组合 [${attemptCount}] 返回404 - 端点不存在`);
            } else {
              console.warn(`组合 [${attemptCount}] 返回非200状态码:`, result.statusCode, result.data);
              
              // 如果不是404，可能是其他问题，如参数格式错误
              if (result.data && typeof result.data === 'object') {
                console.log('响应数据:', result.data);
              }
            }
          } catch (e) {
            console.warn(`组合 [${attemptCount}] 请求失败:`, e.message);
            lastError = e;
          }
        }
      }
      
      // 根据是否找到有效端点决定返回什么
      if (foundValidEndpoint) {
        throw new Error(`找到有效端点但返回了错误响应，状态码: ${bestStatusCode}`);
      } else {
        throw lastError || new Error(`尝试了 ${attemptCount} 种组合，所有登录尝试均失败`);
      }
    } catch (error) {
      console.error('登录请求最终失败:', error);
      throw error;
    }
  }
};