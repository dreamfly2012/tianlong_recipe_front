// pages/profile/index.js
const wechatApi = require('../../api/wechat');
const authUtils = require('../../utils/auth');
const accountApi = require("../../api/account")
const { normalizeRecipes } = require("../../utils/image")
const { getEnvConfig } = require('../../config/env')

// 默认头像
const DEFAULT_AVATAR = '/image/profile.png';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    hasUserInfo: false,
    isLoading: false,
    favorites: [],
    // 已登录后编辑昵称相关状态
    editingNickname: false,
    nicknameDraft: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.checkLoginStatus();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.checkLoginStatus();
    this.loadFavorites();
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus: function () {
    const isLoggedIn = wechatApi.checkLoginStatus();
    if (isLoggedIn) {
      const userInfo = wechatApi.getUserInfo();
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true
      });
    } else {
      // 未登录，重置编辑状态
      this.setData({
        userInfo: {},
        hasUserInfo: false,
        editingNickname: false,
        nicknameDraft: ''
      });
    }
  },

  /**
   * 加载收藏的菜谱
   */
  loadFavorites: function () {
    if (!wx.getStorageSync('token')) {
      this.setData({ favorites: [] });
      return;
    }
    accountApi.getFavorites(1).then(result => {
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
   * 微信新规：头像选择回调（仅登录后“点击头像更换”会触发）
   */
  onChooseAvatar: function (e) {
    const { avatarUrl } = e.detail;
    console.log('[onChooseAvatar] 选中头像临时路径:', avatarUrl);
    if (!this.data.hasUserInfo) return;
    // 上传头像到服务端并更新后端用户资料
    this.uploadAndUpdateAvatar(avatarUrl);
  },

  /**
   * 已登录时上传头像并更新用户资料
   */
  uploadAndUpdateAvatar: function (tempFilePath) {
    wx.showLoading({ title: '头像上传中...' });
    this.uploadAvatarToServer(tempFilePath).then(url => {
      // 更新后端用户资料（同时传 avatarUrl 和 wechat_avatar，兼容后端不同字段命名）
      return accountApi.updateUserInfo({
        avatarUrl: url,
        wechat_avatar: url
      }).then(() => {
        // 更新本地存储
        const userInfo = { ...this.data.userInfo, avatarUrl: url, wechat_avatar: url };
        wechatApi.saveLoginInfo({ token: wx.getStorageSync('token'), userInfo });
        this.setData({ userInfo });
        wx.showToast({ title: '头像更新成功', icon: 'success' });
      });
    }).catch(err => {
      console.error('头像上传/更新失败:', err);
      wx.showToast({ title: err.message || '头像更新失败', icon: 'none' });
    }).finally(() => {
      wx.hideLoading();
    });
  },

  /**
   * 通用：上传临时头像文件到服务器，返回永久 URL
   * @param {string} tempFilePath - chooseAvatar 返回的 wxfile:// 临时路径
   * @returns {Promise<string>} 永久 https:// URL
   */
  uploadAvatarToServer: function (tempFilePath) {
    return new Promise((resolve, reject) => {
      const baseUrl = getEnvConfig().baseUrl;
      const uploadUrl = `${baseUrl}/api/upload/avatar`;
      const token = wx.getStorageSync('token');

      wx.uploadFile({
        url: uploadUrl,
        filePath: tempFilePath,
        name: 'file',
        header: token ? { 'Authorization': `Bearer ${token}` } : {},
        success: (res) => {
          console.log('[uploadAvatar] 原始返回:', res);
          try {
            const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
            // 兼容多种后端返回格式：{ url } / { data: { url } } / { data: 'xxx' }
            const url = data?.url
              || data?.data?.url
              || data?.data
              || data?.file_url
              || data?.fileUrl;
            if (!url) {
              reject(new Error('上传成功但未获取到图片地址'));
              return;
            }
            resolve(url);
          } catch (e) {
            console.error('上传响应解析失败:', e);
            reject(new Error('上传响应解析失败'));
          }
        },
        fail: (err) => {
          console.error('[uploadAvatar] wx.uploadFile 失败:', err);
          // 注意：如果后端还没实现 /api/upload/avatar 接口，这里会失败
          reject(new Error('头像上传失败，请检查网络或联系管理员配置上传接口'));
        }
      });
    });
  },

  /**
   * 进入昵称编辑态
   */
  startEditNickname: function () {
    this.setData({
      editingNickname: true,
      nicknameDraft: this.data.userInfo.nickName || ''
    });
  },

  /**
   * 昵称编辑输入回调（type="nickname" 可快捷使用微信昵称）
   */
  onNicknameDraftInput: function (e) {
    this.setData({ nicknameDraft: e.detail.value });
  },

  /**
   * 取消昵称编辑
   */
  cancelEditNickname: function () {
    this.setData({
      editingNickname: false,
      nicknameDraft: ''
    });
  },

  /**
   * 保存昵称到服务端
   */
  saveNickname: function () {
    const nickName = (this.data.nicknameDraft || '').trim();
    if (!nickName) {
      wx.showToast({ title: '昵称不能为空', icon: 'none' });
      return;
    }
    // 昵称未变化：直接退出编辑态
    if (nickName === (this.data.userInfo.nickName || '')) {
      this.setData({ editingNickname: false, nicknameDraft: '' });
      return;
    }

    wx.showLoading({ title: '保存中...' });
    // 同时传 nickName 和 wechat_nickname，兼容后端不同字段命名
    accountApi.updateUserInfo({
      nickName: nickName,
      wechat_nickname: nickName
    }).then(() => {
      const userInfo = {
        ...this.data.userInfo,
        nickName: nickName,
        wechat_nickname: nickName
      };
      wechatApi.saveLoginInfo({
        token: wx.getStorageSync('token'),
        userInfo: userInfo
      });
      this.setData({
        userInfo: userInfo,
        editingNickname: false,
        nicknameDraft: ''
      });
      wx.showToast({ title: '昵称已更新', icon: 'success' });
    }).catch(err => {
      console.error('昵称更新失败:', err);
      wx.showToast({ title: (err && err.message) || '昵称更新失败', icon: 'none' });
    }).finally(() => {
      wx.hideLoading();
    });
  },

  /**
   * 微信一键静默登录
   * 微信 2022 新规后 wx.getUserProfile 已无法弹窗获取头像昵称，
   * 因此登录时不再采集头像昵称，由后端赋默认值；用户可在登录后自行修改。
   */
  handleLogin: function () {
    if (this.data.isLoading) return;

    this.setData({ isLoading: true });
    console.log('开始微信静默登录...');

    // 1. 获取微信登录凭证
    wx.login({
      success: (loginRes) => {
        console.log('wx.login 成功:', loginRes);
        if (!loginRes.code) {
          this.handleLoginError('获取登录凭证失败');
          return;
        }

        // 2. 调用后端登录接口（传默认昵称头像占位，保持后端契约一致；用户登录后可修改）
        const defaultUserInfo = {
          nickName: '天龙用户',
          avatarUrl: DEFAULT_AVATAR,
          gender: 0
        };
        wechatApi.login({
          code: loginRes.code,
          userInfo: defaultUserInfo
        }).then(res => {
          console.log('后端登录接口返回:', res);

          if (res.code === 0 || res.authenticated === true) {
            const token = res.data?.token || res.token;
            const rawUser = res.data?.user || res.user || defaultUserInfo;
            const finalUserInfo = {
              ...rawUser,
              nickName: rawUser.wechat_nickname || rawUser.nickName || rawUser.name || defaultUserInfo.nickName,
              avatarUrl: rawUser.wechat_avatar || rawUser.avatarUrl || defaultUserInfo.avatarUrl,
              gender: rawUser.gender || 0
            };

            if (!token) {
              this.handleLoginError('登录失败: 未获取到有效的登录凭证');
              return;
            }

            wechatApi.saveLoginInfo({ token, userInfo: finalUserInfo });

            this.setData({
              userInfo: finalUserInfo,
              hasUserInfo: true,
              isLoading: false,
              editingNickname: false,
              nicknameDraft: ''
            });

            wx.showToast({ title: '登录成功', icon: 'success' });
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
      },
      fail: (err) => {
        console.error('wx.login 失败:', err);
        this.handleLoginError('微信登录失败，请检查网络连接');
      }
    });
  },

  /**
   * 处理登录错误
   */
  handleLoginError: function (errorMsg) {
    console.error(errorMsg);
    this.setData({ isLoading: false });
    wx.showToast({ title: errorMsg, icon: 'none' });
  },

  /**
   * 退出登录
   */
  handleLogout: function () {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wechatApi.clearLoginInfo();
          this.setData({
            userInfo: {},
            hasUserInfo: false,
            editingNickname: false,
            nicknameDraft: ''
          });
          wx.showToast({ title: '已退出登录', icon: 'success' });
        }
      }
    });
  },

  /**
   * 跳转到收藏的菜谱详情
   */
  goToRecipeDetail: function (e) {
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
