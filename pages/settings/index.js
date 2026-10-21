// pages/settings/index.js
const authUtils = require('../../utils/auth');
const accountApi = require('../../api/account');

// 使用 withAuth 装饰器，确保用户已登录
Page(authUtils.withAuth({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    isLoading: false,
    isSaving: false,
    formData: {
      nickName: '',
      gender: 0,
      region: '',
      signature: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadUserInfo();
  },

  /**
   * 加载用户信息
   */
  loadUserInfo: function() {
    // 先从本地缓存渲染，避免白屏
    const localUserInfo = authUtils.getCurrentUser();
    if (localUserInfo) {
      this.setData({
        userInfo: localUserInfo,
        formData: {
          nickName: localUserInfo.nickName || '',
          gender: localUserInfo.gender || 0,
          region: localUserInfo.region || '',
          signature: localUserInfo.signature || ''
        }
      });
    }

    // 先关闭 loading（避免请求异常时一直转圈）
    this.setData({ isLoading: false });

    // 从服务器获取最新的用户信息
    accountApi.getUserInfo().then(res => {
      // 关键：只有 code===0 且有数据才用服务器数据覆盖；
      // 其余情况保留本地缓存，且无论如何都已将 isLoading 收敛为 false
      if (res && res.code === 0 && res.data) {
        const serverUserInfo = res.data;
        this.setData({
          userInfo: serverUserInfo,
          formData: {
            nickName: serverUserInfo.nickName || '',
            gender: serverUserInfo.gender || 0,
            region: serverUserInfo.region || '',
            signature: serverUserInfo.signature || ''
          }
        });
      } else if (res && res.msg) {
        // 业务层错误（鉴权过期等），提示但不卡 loading
        wx.showToast({ title: res.msg, icon: 'none' });
      }
    }).catch(err => {
      console.error('获取用户信息失败:', err);
      // 网络错误：保留本地缓存渲染，loading 已关闭
      wx.showToast({
        title: '获取用户信息失败',
        icon: 'none'
      });
    });
  },

  /**
   * 表单输入事件处理
   */
  handleInput: function(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`formData.${field}`]: value
    });
  },

  /**
   * 性别选择事件处理
   */
  handleGenderChange: function(e) {
    this.setData({
      'formData.gender': parseInt(e.detail.value)
    });
  },

  /**
   * 地区选择事件处理
   */
  handleRegionChange: function(e) {
    this.setData({
      'formData.region': e.detail.value.join(' ')
    });
  },

  /**
   * 保存用户信息
   */
  handleSave: function() {
    if (this.data.isSaving) return;
    
    const { formData } = this.data;
    
    // 表单验证
    if (!formData.nickName) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ isSaving: true });
    
    // 调用更新用户信息 API
    accountApi.updateUserInfo(formData).then(res => {
      if (res.code === 0) {
        // 更新本地用户信息
        const newUserInfo = {
          ...this.data.userInfo,
          ...formData
        };
        
        wx.setStorageSync('userInfo', newUserInfo);
        
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
        
        // 返回上一页
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        throw new Error(res.msg || '保存失败');
      }
    }).catch(err => {
      console.error('保存用户信息失败:', err);
      
      wx.showToast({
        title: err.message || '保存失败',
        icon: 'none'
      });
    }).finally(() => {
      this.setData({ isSaving: false });
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '天龙食谱 - 个人设置',
      path: '/pages/index/index'
    };
  }
}));