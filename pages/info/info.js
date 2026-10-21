// info.js
const app = getApp()
import { getRecipe } from '../../api/recipe.js'
import { addFavorite, removeFavorite, isUserFavorite } from '../../api/account.js'
const { normalizeRecipe } = require('../../utils/image.js')

Page({
  data: {
    recipe: { ingredients: [], directions: [] },
    isFavorite: false,
    id: null,
    loadError: false,
    cookingTime: '',
    difficulty: ''
  },

  onLoad: function (options) {
    this.id = options.id
    this.fetchRecipe()
  },

  fetchRecipe: function () {
    getRecipe(this.id).then(res => {
      if (res.data && res.data.id) {
        const recipe = normalizeRecipe(res.data)
        this.setData({
          recipe: recipe,
          cookingTime: recipe.cookingTime || '',
          difficulty: recipe.difficulty || ''
        })
        // 已登录时同步收藏状态
        if (wx.getStorageSync('token')) {
          isUserFavorite(this.id).then(favRes => {
            if (favRes && favRes.code === 0 && favRes.data) {
              this.setData({ isFavorite: !!favRes.data.isFavorite })
            }
          }).catch(() => {})
        }
      } else {
        this.setData({ loadError: true })
        wx.showToast({ title: '获取菜谱失败', icon: 'none' })
      }
    }).catch(() => {
      this.setData({ loadError: true })
      wx.showToast({ title: '获取菜谱失败', icon: 'none' })
    })
  },

  toggleFavorite: function () {
    if (!wx.getStorageSync('token')) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      setTimeout(() => wx.switchTab({ url: '/pages/profile/index' }), 1500)
      return
    }

    const id = this.id
    if (this.data.isFavorite) {
      removeFavorite(id).then(res => {
        if (res.code === 0) {
          this.setData({ isFavorite: false })
          wx.showToast({ title: '已取消收藏', icon: 'success' })
        } else {
          wx.showToast({ title: res.msg || '操作失败', icon: 'none' })
        }
      }).catch(() => wx.showToast({ title: '操作失败', icon: 'none' }))
    } else {
      addFavorite(id).then(res => {
        if (res.code === 0) {
          this.setData({ isFavorite: true })
          wx.showToast({ title: '收藏成功', icon: 'success' })
        } else {
          wx.showToast({ title: res.msg || '操作失败', icon: 'none' })
        }
      }).catch(() => wx.showToast({ title: '操作失败', icon: 'none' }))
    }
  },

  goBack: function () {
    wx.navigateBack({ delta: 1 })
  },

  onShareAppMessage: function () {
    return {
      title: (this.data.recipe && this.data.recipe.name) || '天龙菜谱',
      path: '/pages/info/info?id=' + this.id
    }
  }
})
