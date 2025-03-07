//index.js
const app = getApp()

import { getRecipes } from '../../api/recipe.js'

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    favorites: [],
    page: 1,
    loading: false
  },

  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
    this.loadFavorites(1)
  },

  getUserProfile(e) {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        // 保存用户信息到本地存储
        wx.setStorageSync('userInfo', res.userInfo)
      }
    })
  },

  loadFavorites(page) {
    if (this.data.loading) return
    
    this.setData({ loading: true })
    
    // 从本地存储获取收藏列表
    const favorites = wx.getStorageSync('favorites') || []
    
    // 模拟分页，每页10条数据
    const pageSize = 10
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const currentPageFavorites = favorites.slice(start, end)
    
    if (currentPageFavorites.length > 0) {
      // 获取收藏的菜谱详情
      const recipePromises = currentPageFavorites.map(id => getRecipes({ ids: [id] }))
      
      Promise.all(recipePromises)
        .then(results => {
          const recipes = results.map(res => res.data[0]).filter(Boolean)
          this.setData({
            page,
            favorites: page === 1 ? recipes : [...this.data.favorites, ...recipes],
            loading: false
          })
        })
        .catch(error => {
          console.error('获取收藏菜谱失败:', error)
          this.setData({ loading: false })
          wx.showToast({
            title: '获取收藏菜谱失败',
            icon: 'none'
          })
        })
    } else {
      if (page === 1) {
        this.setData({
          favorites: [],
          loading: false
        })
      } else {
        wx.showToast({
          title: '没有更多收藏了',
          icon: 'none'
        })
        this.setData({ loading: false })
      }
    }
  },

  jumpToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/info/info?id=' + id
    })
  },

  onPullDownRefresh() {
    this.loadFavorites(1)
    wx.stopPullDownRefresh()
  },

  onReachBottom() {
    if (!this.data.loading) {
      this.loadFavorites(this.data.page + 1)
    }
  }
})