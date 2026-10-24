// 引入环境配置和 mock 数据
const { getEnvConfig } = require('../config/env');
//const { getMockData } = require('../mock/index');

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
 * 网络请求函数
 * @param {Object} options - 请求选项
 * @param {string} options.url - 请求 URL（相对路径以 / 开头，如 /api/recipe.lists）
 * @param {string} options.method - 请求方法，'GET' | 'POST' | 'PUT' | 'DELETE'
 * @param {Object} options.data - 请求数据
 * @param {boolean} options.requiresAuth - 是否需要认证，默认为 false
 * @param {boolean} options.silent - 失败时是否静默（不弹 toast），默认为 false
 * @returns {Promise} - 成功时 resolve(res.data)，失败时 reject(error)
 */
const request = (options) => {
  return new Promise((resolve, reject) => {
    const { url, data, method, requiresAuth = false, silent = false } = options;
    const envConfig = getEnvConfig();

    // 静默请求用于联想、热门词等后台补全场景，失败时不打扰用户
    const notify = (opts) => {
      if (!silent) wx.showToast(opts);
    };

    // 规范化 method 为大写，避免 wx.request 不识别小写
    const upperMethod = (method || 'GET').toUpperCase();

    // 拼接 baseUrl（仅当未带协议前缀时）
    let finalUrl = url;
    if (envConfig.baseUrl && !/^https?:\/\//.test(url)) {
      finalUrl = envConfig.baseUrl + url;
    }

    // 组装请求头
    const header = { 'Content-Type': 'application/json' };
    if (requiresAuth) {
      const token = wx.getStorageSync('token');
      if (!token) {
        wx.showToast({ title: '请先登录', icon: 'none', duration: 2000 });
        setTimeout(() => wx.switchTab({ url: '/pages/profile/index' }), 1800);
        reject(new Error('未登录'));
        return;
      }
      header['Authorization'] = `Bearer ${token}`;
    }

    console.log(`[Request] ${upperMethod} ${finalUrl}`, data || '');

    wx.request({
      url: finalUrl,
      method: upperMethod,
      data: data || {},
      header,
      // 兜底超时：避免后端无响应时请求无限挂起（前端一直转圈、像“半天才跳转”）
      timeout: options.timeout || 20000,
      success: function (res) {
        console.log(`[Response] ${upperMethod} ${finalUrl}`, res.statusCode, res.data);

        // HTTP 状态码错误
        if (res.statusCode < 200 || res.statusCode >= 300) {
          if (res.statusCode === 401) {
            wx.removeStorageSync('token');
            wx.removeStorageSync('userInfo');
            const app = getApp();
            if (app) {
              app.globalData.isLoggedIn = false;
              app.globalData.userInfo = null;
            }
            // 仅当该请求本身需要鉴权时才提示并跳登录；匿名接口 401 不劫持页面
            if (requiresAuth) {
              notify({ title: '登录已过期，请重新登录', icon: 'none', duration: 2000 });
              if (!silent) setTimeout(() => wx.switchTab({ url: '/pages/profile/index' }), 1800);
            }
            reject(new Error('登录已过期'));
            return;
          }
          if (res.statusCode === 403) {
            notify({ title: '您没有权限执行此操作', icon: 'none', duration: 2000 });
            reject(new Error('权限不足'));
            return;
          }
          if (res.statusCode === 404) {
            reject(new Error('请求的资源不存在'));
            return;
          }
          if (res.statusCode >= 500) {
            notify({ title: '服务器错误，请稍后重试', icon: 'none', duration: 2000 });
            reject(new Error('服务器错误'));
            return;
          }
          reject(new Error(`请求失败，状态码: ${res.statusCode}`));
          return;
        }

        // 业务错误
        if (res.data && res.data.code !== undefined && res.data.code !== 0) {
          console.error('[Business Error]', res.data.code, res.data.msg);
          reject({ code: res.data.code, message: res.data.msg || '请求失败' });
          return;
        }

        // 约定：resolve 出完整响应体（含 code / data / msg），由页面自行读取 res.data
        resolve(res.data);
      },
      fail: function (err) {
        console.error('[Request] 请求失败:', err);
        let errorMsg = '网络请求失败';
        if (err && err.errMsg) {
          if (err.errMsg.indexOf('timeout') > -1) errorMsg = '请求超时，请检查网络';
          else if (err.errMsg.indexOf('fail') > -1) errorMsg = '网络连接失败，请检查网络设置';
        }
        notify({ title: errorMsg, icon: 'none', duration: 2000 });
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