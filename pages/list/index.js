// list/index.js
const app = getApp()
import { getRecipes } from '../../api/recipe.js'
const { normalizeRecipes } = require('../../utils/image.js')

Page({
  data: {
    recipes: [],
    categoryId: 0,
    categoryName: '',
    page: 1,
    pageSize: 10,
    loading: false,
    finished: false
  },

  onLoad: function (options) {
    const categoryId = options.category_id ? parseInt(options.category_id, 10) : 0
    const categoryName = options.name || '菜谱列表'
    wx.setNavigationBarTitle({ title: categoryName })
    this.setData({ categoryId, categoryName })
    this.fetchRecipes(1, true)
  },

  fetchRecipes: function (page, reset) {
    if (this.data.loading) return
    this.setData({ loading: true })

    const params = { page: page, page_size: this.data.pageSize }
    if (this.data.categoryId) params.category_id = this.data.categoryId

    getRecipes(params).then(res => {
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

  jumpDetail: function (e) {
    const id = e.currentTarget.dataset.id
    console.log('[list] jumpDetail 触发, id =', id)
    if (!id) {
      console.warn('[list] jumpDetail 失败：菜谱数据缺少 id 字段，请检查后端返回')
      wx.showToast({ title: '菜谱信息缺失', icon: 'none' })
      return
    }
    wx.navigateTo({
      url: '/pages/info/info?id=' + id,
      fail: (err) => {
        console.error('[list] 跳转详情页失败：', err)
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
  }
})
