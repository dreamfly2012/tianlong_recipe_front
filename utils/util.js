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
 * @param {boolean} options.requiresAuth - 是否需要认证，默认为false
 * @returns {Promise} - 返回请求结果的 Promise
 */
const request = (options) => {
  return new Promise((resolve, reject) => {
    const { url, data, method, mock: forceMock, requiresAuth = false } = options;
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
    
    // 构建请求头
    const header = { 'Content-Type': 'application/json' };
    
    // 如果需要认证，添加token到请求头
    if (requiresAuth) {
      const token = wx.getStorageSync('token');
      if (!token) {
        // 如果需要认证但没有token，提示用户登录
        wx.showToast({
          title: '请先登录',
          icon: 'none',
          duration: 2000
        });
        
        // 跳转到个人中心页面
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/profile/index'
          });
        }, 2000);
        
        reject(new Error('未登录'));
        return;
      }
      
      header['Authorization'] = `Bearer ${token}`;
    }
    
    console.log(`[Request] ${method || 'GET'} ${url}`, data || '');
    
    // 发送真实请求
    wx.request({
      ...requestOptions,
      header: header,
      success: function(res) {
        console.log(`[Response] ${method || 'GET'} ${url}`, res.statusCode, res.data);
        
        // 处理HTTP错误状态码
        if (res.statusCode < 200 || res.statusCode >= 300) {
          // 处理token过期情况
          if (res.statusCode === 401) {
            // 清除登录信息
            wx.removeStorageSync('token');
            wx.removeStorageSync('userInfo');
            
            // 更新全局状态
            const app = getApp();
            if (app) {
              app.globalData.isLoggedIn = false;
              app.globalData.userInfo = null;
            }
            
            // 提示用户重新登录
            wx.showToast({
              title: '登录已过期，请重新登录',
              icon: 'none',
              duration: 2000
            });
            
            // 跳转到个人中心页面
            setTimeout(() => {
              wx.switchTab({
                url: '/pages/profile/index'
              });
            }, 2000);
            
            reject(new Error('登录已过期'));
            return;
          } else if (res.statusCode === 403) {
            // 处理权限不足的情况
            wx.showToast({
              title: '您没有权限执行此操作',
              icon: 'none',
              duration: 2000
            });
            
            reject(new Error('权限不足'));
            return;
          } else if (res.statusCode === 404) {
            // 处理资源不存在的情况
            reject(new Error('请求的资源不存在'));
            return;
          } else if (res.statusCode >= 500) {
            // 处理服务器错误
            wx.showToast({
              title: '服务器错误，请稍后重试',
              icon: 'none',
              duration: 2000
            });
            
            reject(new Error('服务器错误'));
            return;
          } else {
            // 处理其他HTTP错误
            reject(new Error(`请求失败，状态码: ${res.statusCode}`));
            return;
          }
        }
        
        // 处理业务逻辑错误
        if (res.data && res.data.code !== undefined && res.data.code !== 0) {
          console.error('[Business Error]', res.data.code, res.data.msg);
          reject({
            code: res.data.code,
            message: res.data.msg || '请求失败'
          });
          return;
        }
        
        resolve(res.data);
      },
      fail: function(err) {
        console.error('[Request] 请求失败:', err);
        
        // 处理网络错误
        let errorMsg = '网络请求失败';
        if (err.errMsg) {
          if (err.errMsg.indexOf('timeout') > -1) {
            errorMsg = '请求超时，请检查网络';
          } else if (err.errMsg.indexOf('fail') > -1) {
            errorMsg = '网络连接失败，请检查网络设置';
          }
        }
        
        wx.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 2000
        });
        
        reject(new Error(errorMsg));
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