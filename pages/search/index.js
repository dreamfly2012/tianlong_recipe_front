// search/index.js
const app = getApp()
import { search } from '../../api/search.js'
const { normalizeRecipes } = require('../../utils/image.js')

Page({
  data: {
    keyword: '',
    recipes: [],
    page: 1,
    pageSize: 10,
    loading: false,
    finished: false,
    searched: false
  },

  onLoad: function (options) {
    const name = options.name ? decodeURIComponent(options.name) : ''
    this.setData({ keyword: name })
    if (name) this.fetchRecipes(1, true)
  },

  onSearchChange: function (e) {
    this.setData({ keyword: e.detail.value })
  },

  onSearch: function () {
    const kw = this.data.keyword.trim()
    if (!kw) {
      wx.showToast({ title: '请输入搜索内容', icon: 'none' })
      return
    }
    this.fetchRecipes(1, true)
  },

  onSearchConfirm: function (e) {
    const kw = e.detail.value.trim()
    if (!kw) return
    this.setData({ keyword: kw })
    this.fetchRecipes(1, true)
  },

  fetchRecipes: function (page, reset) {
    if (this.data.loading) return
    const kw = this.data.keyword.trim()
    if (!kw) return
    this.setData({ loading: true, searched: true })

    search({ name: kw, page: page, page_size: this.data.pageSize }).then(res => {
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
    console.log('[search] jumpDetail 触发, id =', id)
    if (!id) {
      console.warn('[search] jumpDetail 失败：菜谱数据缺少 id 字段，请检查后端返回')
      wx.showToast({ title: '菜谱信息缺失', icon: 'none' })
      return
    }
    wx.navigateTo({
      url: '/pages/info/info?id=' + id,
      fail: (err) => {
        console.error('[search] 跳转详情页失败：', err)
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
