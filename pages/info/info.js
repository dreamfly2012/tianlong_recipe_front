//index.js
//获取应用实例
const app = getApp()

import {
  getRecipe
} from '../../api/recipe.js'
import { getFavorites, addFavorite, removeFavorite } from '../../api/account.js'

Page({
  data: {
    recipe: {},
    isFavorite: false,
    videoInfo: null, // 视频信息
    isVideoLoading: false, // 视频加载状态
    videoError: null, // 视频错误信息
    id: null,
    hasUserInfo: false, // 假设添加了 hasUserInfo 字段
    loadError:false
  },

  onLoad: function (options) {
    let that = this;
    this.id = options.id;

    // 检查是否已收藏
    const favorites = wx.getStorageSync('favorites') || []
    const isFavorite = favorites.includes(this.id)

    // 从本地存储读取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true
      });
    } else {
      this.setData({
        hasUserInfo: false
      });
    }

    getRecipe(this.id).then(res => {
      if(res.data && res.data.id){ 
      that.setData({
        recipe: res.data,
        isFavorite
      })
    }else{
        this.setData({
          loadError:true
        })
        wx.showToast({
          title: '获取菜谱失败',
          icon: 'none'
        })
      }
      console.log('获取菜谱成功:', res.data)
    }).catch(error => {
      this.setData({
        loadError:true
      })
      wx.showToast({
        title: '获取菜谱失败',
        icon: 'none'
      })
    })
  },

  

  // 收藏/取消收藏
  toggleFavorite: function () {
    // 判断是否登录
    if (!this.data.hasUserInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return;
    }

    let favorites = wx.getStorageSync('favorites') || []
    const id = this.id; // 或 this.data.id，按你的实际变量名

    if (this.data.isFavorite) {
      // 取消收藏
      favorites = favorites.filter(item => item !== id)
      wx.showToast({
        title: '已取消收藏',
        icon: 'success'
      })
    } else {
      // 添加收藏
      favorites.push(id)
      wx.showToast({
        title: '收藏成功',
        icon: 'success'
      })
    }
    wx.setStorageSync('favorites', favorites)
    this.setData({ isFavorite: !this.data.isFavorite })
  }
})