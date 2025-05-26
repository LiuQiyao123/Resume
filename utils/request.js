import { showToast } from './toast';
import config from '../config';

export const request = async (options) => {
  try {
    const token = wx.getStorageSync('token');
    
    const response = await wx.request({
      ...options,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      }
    });

    if (!response.data) {
      throw new Error('服务器响应异常');
    }

    return response.data;
    
  } catch (error) {
    console.error('请求失败：', error);
    showToast({
      title: error.message || '网络请求失败，请重试'
    });
    throw error;
  }
}; 