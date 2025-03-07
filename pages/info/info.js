//index.js
//获取应用实例
const app = getApp()

import { getRecipe } from '../../api/recipe.js'

Page({
  data: {
    recipe: {},
    isFavorite: false
  },

  onLoad: function () {
    let that = this;
    var id = getApp().requestid;

    // 检查是否已收藏
    const favorites = wx.getStorageSync('favorites') || []
    const isFavorite = favorites.includes(id)

    getRecipe(id).then(res => {
      that.setData({
        recipe: res,
        isFavorite
      })
    }).catch(error => {
      console.log(error)
      wx.showToast({
        title: '获取菜谱失败',
        icon: 'none'
      })
    })
  },

  // 收藏/取消收藏
  toggleFavorite: function() {
    const id = getApp().requestid
    let favorites = wx.getStorageSync('favorites') || []
    
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
    this.setData({
      isFavorite: !this.data.isFavorite
    })
  }
})