// 引入环境配置和 mock 数据
const { getEnvConfig } = require('../config/env');
const { getMockData } = require('../mock/index');

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 网络请求函数，支持 mock 数据
 * @param {Object} options - 请求选项
 * @param {string} options.url - 请求 URL
 * @param {string} options.method - 请求方法，如 'GET', 'POST'
 * @param {Object} options.data - 请求数据
 * @param {boolean} options.mock - 是否强制使用 mock 数据，覆盖环境配置
 * @returns {Promise} - 返回请求结果的 Promise
 */
const request = (options) => {
  return new Promise((resolve, reject) => {
    const { url, data, method, mock: forceMock } = options;
    const envConfig = getEnvConfig();
    
    // 判断是否使用 mock 数据
    const useMock = forceMock === true || (envConfig.useMock && forceMock !== false);
    
    // 如果使用 mock 数据，尝试获取 mock 数据
    if (useMock) {
      const mockData = getMockData(url, { data, method });
      if (mockData) {
        console.log('[Mock] 使用 mock 数据:', url, mockData);
        // 模拟网络延迟
        setTimeout(() => {
          resolve(mockData);
        }, 300);
        return;
      }
      // 如果没有找到对应的 mock 数据，继续发送真实请求
      console.log('[Mock] 未找到 mock 数据，使用真实请求:', url);
    }
    
    // 处理请求数据格式
    let requestOptions = { ...options };
    if (data && method !== 'GET' && method !== 'get') {
      requestOptions.data = JSON.stringify(data);
    }
    
    // 如果不是强制 mock 且环境配置了 baseUrl，则添加 baseUrl
    if (!forceMock && envConfig.baseUrl && !url.startsWith('http')) {
      requestOptions.url = envConfig.baseUrl + url;
    }
    
    // 发送真实请求
    wx.request({
      header: { 'Content-Type': 'application/json' },
      ...requestOptions,
      success: function(res) {
        resolve(res.data);
      },
      fail: function(res) {
        reject(res.data);
      }
    });
  });
}

module.exports = {
  formatTime,
  request,
  // 导出环境相关函数，方便在其他地方使用
  getEnvConfig
}