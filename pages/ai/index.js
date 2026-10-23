// AI 功能页
const app = getApp()
import { getDailyRecommend, getPersonalizedRecommend } from '../../api/ai.js'
const { normalizeRecipes } = require('../../utils/image.js')

Page({
  data: {
    dailyRecipes: [],
    personalizedRecipes: [],
    loadingDaily: true,
    loadingPersonal: true,
    needLogin: false
  },

  onLoad: function () {
    this.syncLoginAndLoad()
  },

  onShow: function () {
    // 每次进入刷新（登录态可能变化）
    this.syncLoginAndLoad()
  },

  // 同步登录态：未登录展示登录引导，已登录加载推荐
  syncLoginAndLoad: function () {
    const needLogin = !this.isLoggedIn()
    this.setData({ needLogin })
    if (needLogin) {
      this.setData({ dailyRecipes: [], personalizedRecipes: [], loadingDaily: false, loadingPersonal: false })
      return
    }
    this.loadDailyRecommend()
    this.loadPersonalizedRecommend()
  },

  // 是否已登录（避免未登录时反复触发强制登录跳转）
  isLoggedIn: function () {
    return !!wx.getStorageSync('token')
  },

  loadDailyRecommend: function () {
    this.setData({ loadingDaily: true })
    // 未登录时直接显示空态，不调用需鉴权接口
    if (!this.isLoggedIn()) {
      this.setData({ dailyRecipes: [], loadingDaily: false })
      return
    }
    getDailyRecommend().then(res => {
      this.setData({ dailyRecipes: normalizeRecipes(res), loadingDaily: false })
    }).catch(() => {
      this.setData({ dailyRecipes: [], loadingDaily: false })
    })
  },

  loadPersonalizedRecommend: function () {
    this.setData({ loadingPersonal: true })
    if (!this.isLoggedIn()) {
      this.setData({ personalizedRecipes: [], loadingPersonal: false })
      return
    }
    getPersonalizedRecommend().then(res => {
      this.setData({ personalizedRecipes: normalizeRecipes(res), loadingPersonal: false })
    }).catch(() => {
      this.setData({ personalizedRecipes: [], loadingPersonal: false })
    })
  },

  goMenu: function () {
    if (!this.isLoggedIn()) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      setTimeout(() => wx.switchTab({ url: '/pages/profile/index' }), 1200)
      return
    }
    wx.navigateTo({ url: '/pages/ai/menu' })
  },

  // 跳转「我的」页去登录
  goLogin: function () {
    wx.switchTab({ url: '/pages/profile/index' })
  },

  jumpDetail: function (e) {
    const id = e.currentTarget.dataset.id
    console.log('[ai] jumpDetail 触发, id =', id)
    if (!id) {
      console.warn('[ai] jumpDetail 失败：菜谱数据缺少 id 字段')
      wx.showToast({ title: '菜谱信息缺失', icon: 'none' })
      return
    }
    wx.navigateTo({
      url: '/pages/info/info?id=' + id,
      fail: (err) => {
        console.error('[ai] 跳转详情页失败：', err)
        wx.showToast({ title: '跳转失败，请重试', icon: 'none' })
      }
    })
  }
});
