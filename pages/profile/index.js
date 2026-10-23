// pages/profile/index.js
const wechatApi = require('../../api/wechat');
const authUtils = require('../../utils/auth');
const accountApi = require("../../api/account")
const { normalizeRecipes } = require("../../utils/image")

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    hasUserInfo: false,
    isLoading: false,
    favorites: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 检查是否已登录
    this.checkLoginStatus();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 每次显示页面时检查登录状态
    this.checkLoginStatus();
    // 加载收藏的菜谱
    this.loadFavorites();
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus: function() {
    const isLoggedIn = wechatApi.checkLoginStatus();
    if (isLoggedIn) {
      const userInfo = wechatApi.getUserInfo();
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true
      });
    } else {
      this.setData({
        userInfo: {},
        hasUserInfo: false
      });
    }
  },

  /**
   * 加载收藏的菜谱
   */
  loadFavorites: function() {
    // 未登录时不调用需鉴权接口，避免触发强制登录循环跳转
    if (!wx.getStorageSync('token')) {
      this.setData({ favorites: [] });
      return;
    }
    accountApi.getFavorites(1).then(result => {
      // 兼容多种返回结构：{ data: { data: [] } } / { data: [] } / []
      let favorites = [];
      if (result && result.data) {
        if (Array.isArray(result.data)) {
          favorites = result.data;
        } else if (Array.isArray(result.data.data)) {
          favorites = result.data.data;
        } else if (Array.isArray(result.data.list)) {
          favorites = result.data.list;
        }
      }
      console.log("favorites", favorites);
      this.setData({ favorites: normalizeRecipes(favorites) });
    }).catch(err => {
      console.log("Error:", err);
    });
  },

  /**
   * 微信登录
   */
  handleLogin: function() {
    if (this.data.isLoading) return;
    
    this.setData({ isLoading: true });
    
    console.log('开始登录流程...');
    
    // 1. 直接获取用户信息（必须在用户点击事件中直接调用）
    wx.getUserProfile({
      desc: '获取您的昵称个性化用来推荐菜谱',
      lang: 'zh_CN',
      success: (profileRes) => {
        console.log('wx.getUserProfile 成功:', profileRes);
        
        // 2. 获取用户信息成功后，再获取微信登录凭证
        wx.login({
          success: (loginRes) => {
            console.log('wx.login 成功:', loginRes);
            
            if (loginRes.code) {
              // 3. 调用后端登录接口
              wechatApi.login({
                code: loginRes.code,
                userInfo: profileRes.userInfo
              }).then(res => {
                console.log('后端登录接口返回:', res);
                
                // 检查返回的数据结构：request 约定 resolve 出完整 res.data，
                // 后端 wechatLogin 返回 { code:0, data:{ token, user, ... }, msg }
                if (res.code === 0 || res.authenticated === true) {
                  // 4. 保存登录信息（token 与 user 都在 res.data 下）
                  const token = res.data?.token || res.token;
                  // 后端 user 对象头像字段为 wechat_avatar，前端统一为 avatarUrl
                  const rawUser = res.data?.user || res.user || profileRes.userInfo;
                  const userInfo = {
                    ...rawUser,
                    nickName: rawUser.wechat_nickname || rawUser.nickName || rawUser.name || profileRes.userInfo?.nickName || '',
                    avatarUrl: rawUser.wechat_avatar || rawUser.avatarUrl || profileRes.userInfo?.avatarUrl || '/image/profile.png',
                    gender: rawUser.gender || 0
                  };

                  if (!token) {
                    this.handleLoginError('登录失败: 未获取到有效的登录凭证');
                    return;
                  }

                  wechatApi.saveLoginInfo({
                    token: token,
                    userInfo: userInfo
                  });
                  
                  // 5. 更新页面状态
                  this.setData({
                    userInfo: userInfo,
                    hasUserInfo: true,
                    isLoading: false
                  });
                  
                  wx.showToast({
                    title: '登录成功',
                    icon: 'success'
                  });
                  
                  // 6. 处理登录成功后的跳转
                  setTimeout(() => {
                    authUtils.handleAuthRedirect();
                  }, 1500);
                } else {
                  this.handleLoginError('登录失败: ' + (res.msg || '未知错误'));
                }
              }).catch(err => {
                console.error('后端登录请求失败:', err);
                this.handleLoginError('登录请求失败: ' + (err.message || '网络错误'));
              });
            } else {
              this.handleLoginError('获取登录凭证失败');
            }
          },
          fail: (err) => {
            console.error('wx.login 失败:', err);
            this.handleLoginError('微信登录失败，请检查网络连接');
          }
        });
      },
      fail: (err) => {
        console.error('wx.getUserProfile 失败:', err);
        this.setData({ isLoading: false });
        
        // 用户拒绝授权的情况
        if (err.errMsg && err.errMsg.indexOf('auth deny') > -1) {
          this.handleLoginError('您已拒绝授权获取用户信息');
          wx.showModal({
            title: '提示',
            content: '需要您授权获取用户信息才能完成登录，是否重新授权？',
            success: (res) => {
              if (res.confirm) {
                // 用户点击确定，重新尝试登录
                setTimeout(() => {
                  this.handleLogin();
                }, 500);
              }
            }
          });
        } else {
          // 其他错误情况
          this.handleLoginError('获取用户信息失败，请稍后重试');
          
          // 尝试使用备用方案登录（仅使用code登录，不获取用户信息）
          wx.showModal({
            title: '提示',
            content: '是否使用简化登录方式继续？（将不会获取您的头像和昵称）',
            success: (res) => {
              if (res.confirm) {
                this.setData({ isLoading: true });
                
                // 获取登录凭证
                wx.login({
                  success: (loginRes) => {
                    if (loginRes.code) {
                      this.handleLoginWithoutUserInfo(loginRes.code);
                    } else {
                      this.handleLoginError('获取登录凭证失败');
                    }
                  },
                  fail: (err) => {
                    console.error('wx.login 失败:', err);
                    this.handleLoginError('微信登录失败，请检查网络连接');
                  }
                });
              }
            }
          });
        }
      }
    });
  },
  
  /**
   * 备用登录方案 - 仅使用code登录，不获取用户信息
   */
  handleLoginWithoutUserInfo: function(code) {
    console.log('尝试使用备用登录方案...');
    
    this.setData({ isLoading: true });
    
    // 使用默认用户信息
    const defaultUserInfo = {
      nickName: '天龙用户',
      avatarUrl: '/image/profile.png',
      gender: 0
    };
    
    // 调用后端登录接口
    wechatApi.login({
      code: code,
      userInfo: defaultUserInfo
    }).then(res => {
      console.log('备用方案登录返回:', res);
      
      // 检查返回的数据结构（token 与 user 都在 res.data 下）
      if (res.code === 0 || res.authenticated === true) {
        // 保存登录信息
        const token = res.data?.token || res.token;
        // 后端 user 对象头像字段为 wechat_avatar，前端统一为 avatarUrl
        const rawUser = res.data?.user || res.user || defaultUserInfo;
        const userInfo = {
          ...rawUser,
          nickName: rawUser.wechat_nickname || rawUser.nickName || rawUser.name || defaultUserInfo.nickName,
          avatarUrl: rawUser.wechat_avatar || rawUser.avatarUrl || defaultUserInfo.avatarUrl,
          gender: rawUser.gender || defaultUserInfo.gender || 0
        };

        if (!token) {
          this.handleLoginError('登录失败: 未获取到有效的登录凭证');
          return;
        }
        
        wechatApi.saveLoginInfo({
          token: token,
          userInfo: userInfo
        });
        
        // 更新页面状态
        this.setData({
          userInfo: userInfo,
          hasUserInfo: true,
          isLoading: false
        });
        
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });
        
        // 处理登录成功后的跳转
        setTimeout(() => {
          authUtils.handleAuthRedirect();
        }, 1500);
      } else {
        this.handleLoginError('登录失败: ' + (res.msg || '未知错误'));
      }
    }).catch(err => {
      console.error('备用方案登录请求失败:', err);
      this.handleLoginError('登录请求失败: ' + (err.message || '网络错误'));
    });
  },

  /**
   * 处理登录错误
   */
  handleLoginError: function(errorMsg) {
    console.error(errorMsg);
    this.setData({ isLoading: false });
    wx.showToast({
      title: errorMsg,
      icon: 'none'
    });
  },

  /**
   * 退出登录
   */
  handleLogout: function() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wechatApi.clearLoginInfo();
          this.setData({
            userInfo: {},
            hasUserInfo: false
          });
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 跳转到收藏的菜谱详情
   */
  goToRecipeDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    console.log('[profile] goToRecipeDetail 触发, id =', id)
    if (!id) {
      console.warn('[profile] goToRecipeDetail 失败：收藏数据缺少 id 字段')
      wx.showToast({ title: '菜谱信息缺失', icon: 'none' })
      return
    }
    wx.navigateTo({
      url: '/pages/info/info?id=' + id,
      fail: (err) => {
        console.error('[profile] 跳转详情页失败：', err)
        wx.showToast({ title: '跳转失败，请重试', icon: 'none' })
      }
    });
  },
  
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '天龙食谱 - 您的私人厨房助手',
      path: '/pages/index/index'
    };
  }
})