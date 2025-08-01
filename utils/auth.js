/**
 * 认证相关工具函数
 */
const wechatApi = require('../api/wechat');

/**
 * 检查用户是否已登录
 * @returns {boolean} - 是否已登录
 */
const isLoggedIn = () => {
  return wechatApi.checkLoginStatus();
};

/**
 * 获取当前登录用户信息
 * @returns {Object|null} - 用户信息或 null
 */
const getCurrentUser = () => {
  return wechatApi.getUserInfo();
};

/**
 * 检查登录状态，如果未登录则跳转到登录页面
 * @param {Object} options - 选项
 * @param {boolean} options.showToast - 是否显示提示，默认为 true
 * @param {boolean} options.redirect - 是否跳转到登录页面，默认为 true
 * @returns {boolean} - 是否已登录
 */
const checkAuth = (options = {}) => {
  const { showToast = true, redirect = true } = options;
  
  const loggedIn = isLoggedIn();
  
  if (!loggedIn) {
    if (showToast) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000,
        position: 'top'  // 将提示框显示在顶部
      });
    }
    
    if (redirect) {
      // 记录当前页面路径，登录成功后可以跳回来
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const url = `/${currentPage.route}`;
      const options = currentPage.options;
      
      // 构建完整的页面路径，包括参数
      let fullPath = url;
      const params = [];
      for (const key in options) {
        params.push(`${key}=${options[key]}`);
      }
      if (params.length > 0) {
        fullPath += '?' + params.join('&');
      }
      
      // 保存当前页面路径
      wx.setStorageSync('auth_redirect_url', fullPath);
      
      // 跳转到个人中心页面
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/profile/index'
        });
      }, 1500);
    }
  }
  
  return loggedIn;
};

/**
 * 处理登录成功后的跳转
 */
const handleAuthRedirect = () => {
  const redirectUrl = wx.getStorageSync('auth_redirect_url');
  if (redirectUrl) {
    wx.removeStorageSync('auth_redirect_url');
    
    // 判断是否是 tabBar 页面
    const tabBarPages = [
      '/pages/index/index',
      '/pages/category/index',
      '/pages/search/index',
      '/pages/profile/index'
    ];
    
    if (tabBarPages.includes(redirectUrl)) {
      wx.switchTab({
        url: redirectUrl
      });
    } else {
      wx.navigateTo({
        url: redirectUrl
      });
    }
  }
};

/**
 * 页面认证装饰器，用于在页面 onLoad 或 onShow 方法中调用
 * @param {Object} pageObj - 页面对象
 * @param {Object} options - 选项
 * @param {boolean} options.onLoad - 是否在 onLoad 方法中检查，默认为 true
 * @param {boolean} options.onShow - 是否在 onShow 方法中检查，默认为 false
 * @returns {Object} - 修改后的页面对象
 */
const withAuth = (pageObj, options = {}) => {
  const { onLoad = true, onShow = false } = options;
  
  const originalOnLoad = pageObj.onLoad;
  const originalOnShow = pageObj.onShow;
  
  if (onLoad) {
    pageObj.onLoad = function(options) {
      const loggedIn = checkAuth();
      if (loggedIn && originalOnLoad) {
        originalOnLoad.call(this, options);
      }
    };
  }
  
  if (onShow) {
    pageObj.onShow = function() {
      const loggedIn = checkAuth();
      if (loggedIn && originalOnShow) {
        originalOnShow.call(this);
      }
    };
  }
  
  return pageObj;
};

module.exports = {
  isLoggedIn,
  getCurrentUser,
  checkAuth,
  handleAuthRedirect,
  withAuth
};