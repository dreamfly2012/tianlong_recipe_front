// index.js
const app = getApp()
import { getRecipes } from '../../api/recipe.js'
import { getCategories } from '../../api/category.js'
const { normalizeRecipes } = require('../../utils/image.js')

Page({
  data: {
    categories: [],
    recipes: [],
    page: 1,
    pageSize: 10,
    loading: false,
    finished: false
  },

  onLoad: function () {
    this.fetchCategories()
    this.fetchRecipes(1, true)
  },

  // 获取一级分类，作为快捷入口
  fetchCategories: function () {
    getCategories({ parent_id: 0 }).then(res => {
      const list = (res.data || []).slice(0, 8)
      this.setData({ categories: list })
    }).catch(() => {
      // 分类加载失败不影响首页主体
    })
  },

  // 获取菜谱列表
  fetchRecipes: function (page, reset) {
    if (this.data.loading) return
    this.setData({ loading: true })

    getRecipes({ page: page, page_size: this.data.pageSize }).then(res => {
      const list = normalizeRecipes(res)
      this.setData({
        recipes: reset ? list : this.data.recipes.concat(list),
        page: page,
        loading: false,
        finished: list.length < this.data.pageSize
      })
    }).catch(() => {
      this.setData({ loading: false })
    })
  },

  onSearchTap: function () {
    wx.navigateTo({ url: '/pages/search/index' })
  },

  goCategory: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/list/index?category_id=' + id })
  },

  jumpDetail: function (e) {
    const id = e.currentTarget.dataset.id
    console.log('[index] jumpDetail 触发, id =', id)
    if (!id) {
      console.warn('[index] jumpDetail 失败：菜谱数据缺少 id 字段，请检查后端返回')
      wx.showToast({ title: '菜谱信息缺失', icon: 'none' })
      return
    }
    wx.navigateTo({
      url: '/pages/info/info?id=' + id,
      fail: (err) => {
        console.error('[index] 跳转详情页失败：', err)
        wx.showToast({ title: '跳转失败，请重试', icon: 'none' })
      }
    })
  },

  onPullDownRefresh: function () {
    this.fetchRecipes(1, true)
    wx.stopPullDownRefresh()
  },

  onReachBottom: function () {
    if (!this.data.finished && !this.data.loading) {
      this.fetchRecipes(this.data.page + 1, false)
    }
  },

  onShareAppMessage: function () {
    return {
      title: '天龙菜谱 - 最全最靠谱的中华菜谱',
      path: '/pages/index/index'
    }
  }
})
