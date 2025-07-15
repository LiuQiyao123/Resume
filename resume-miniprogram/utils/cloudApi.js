// utils/cloudApi.js
import config from '../config';
import { showToast } from './toast';

// 最大重试次数
const MAX_RETRIES = 3;
// 重试延迟（毫秒）
const RETRY_DELAY = 1000;

/**
 * 云托管API调用封装
 * @param {Object} options - 请求选项
 * @param {string} options.path - API路径
 * @param {string} options.method - 请求方法 GET/POST/PUT/DELETE
 * @param {Object} options.data - 请求数据
 * @param {Object} options.header - 额外请求头
 * @param {string} options.dataType - 返回数据类型，默认json
 * @param {number} options.timeout - 超时时间，默认10秒
 * @param {boolean} options.enableRetry - 是否启用重试，默认true
 * @returns {Promise} - 返回请求结果Promise
 */
export const callCloudApi = async (options) => {
  const { 
    path, 
    method = 'GET', 
    data = {}, 
    header = {}, 
    dataType,
    timeout = 10000,
    enableRetry = true
  } = options;

  // 确保云环境已初始化
  if (!wx.cloud) {
    console.error('云环境未初始化');
    return Promise.reject(new Error('云环境未初始化'));
  }

  const callApi = async (retryCount = 0) => {
    try {
      console.log(`请求云API: ${path}, 方法: ${method}, 重试次数: ${retryCount}`);
      
      const result = await wx.cloud.callContainer({
        config: {
          env: config.cloudEnv,
        },
        path,
        method,
        data,
        header: {
          'X-WX-SERVICE': config.serviceId,
          ...header
        },
        dataType,
        timeout
      });
      
      return result;
    } catch (error) {
      console.error(`云API调用失败: ${path}`, error);
      
      // 判断是否需要重试
      if (enableRetry && retryCount < MAX_RETRIES) {
        console.log(`准备重试 (${retryCount + 1}/${MAX_RETRIES})...`);
        
        // 延迟重试，避免立即重试可能导致的持续失败
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(callApi(retryCount + 1));
          }, RETRY_DELAY * Math.pow(2, retryCount)); // 指数退避策略
        });
      }
      
      // 超过最大重试次数，显示错误提示
      showToast({
        title: '网络请求失败，请稍后重试',
        icon: 'none'
      });
      
      return Promise.reject(error);
    }
  };

  return callApi();
};

/**
 * 检查云服务健康状态
 * @returns {Promise<boolean>} - 服务是否健康
 */
export const checkCloudHealth = async () => {
  try {
    const result = await callCloudApi({
      path: '/',
      method: 'GET',
      timeout: 5000,
      enableRetry: true
    });
    
    return result && result.statusCode === 200;
  } catch (error) {
    console.error('健康检查失败', error);
    return false;
  }
};

export default {
  callCloudApi,
  checkCloudHealth
};