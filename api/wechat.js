
const { request } = require('../utils/util');

/**
 * 微信登录
 * @param {Object} params - 登录参数
 * @param {string} params.code - 微信登录凭证
 * @param {Object} params.userInfo - 用户信息（可选）
 * @param {string} params.userInfo.nickName - 用户昵称
 * @param {string} params.userInfo.avatarUrl - 用户头像
 * @returns {Promise} - 返回登录结果的 Promise
 */
const login = (params) => {
  console.log('调用微信登录API，参数:', params);
  
  if (!params.code) {
    console.error('登录失败: 缺少code参数');
    return Promise.reject(new Error('登录失败: 缺少必要参数'));
  }
  
  // 构建请求数据
  const requestData = {
    code: params.code
  };
  
  // 如果有用户信息，添加到请求数据中
  if (params.userInfo) {
    requestData.user_info = {
      nickName: params.userInfo.nickName || '天龙用户',
      avatarUrl: params.userInfo.avatarUrl || '/image/profile.png',
      gender: params.userInfo.gender || 0
    };
  }
  
  return request({
    url: '/api/wechat/login',
    method: 'POST',
    data: requestData
  }).then(res => {
    console.log('微信登录API返回结果:', res);
    return res;
  }).catch(err => {
    console.error('微信登录API请求失败:', err);
    throw err;
  });
};

/**
 * 检查登录状态
 * @returns {boolean} - 是否已登录
 */
const checkLoginStatus = () => {
  return !!wx.getStorageSync('token');
};

/**
 * 获取存储的用户信息
 * @returns {Object|null} - 用户信息或 null
 */
const getUserInfo = () => {
  return wx.getStorageSync('userInfo') || null;
};

/**
 * 保存登录信息
 * @param {Object} data - 登录返回数据
 * @param {string} data.token - 用户 token
 * @param {Object} data.userInfo - 用户信息
 */
const saveLoginInfo = (data) => {
  if (data.token) {
    wx.setStorageSync('token', data.token);
  }
  if (data.userInfo) {
    wx.setStorageSync('userInfo', data.userInfo);
  }
};

/**
 * 清除登录信息
 */
const clearLoginInfo = () => {
  wx.removeStorageSync('token');
  wx.removeStorageSync('userInfo');
};

module.exports = {
  login,
  checkLoginStatus,
  getUserInfo,
  saveLoginInfo,
  clearLoginInfo
};