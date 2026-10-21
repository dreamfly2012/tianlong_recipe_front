// category/index.js
const app = getApp()
import { getCategories } from '../../api/category.js'

// 本地缓存 key：一级分类 + 各父分类的子分类
const TOP_KEY = 'cat_top_cache'
const childKey = (id) => 'cat_children_' + id
const readCache = (key) => {
  try { return wx.getStorageSync(key) || [] } catch (e) { return [] }
}
const writeCache = (key, data) => {
  try { wx.setStorageSync(key, data) } catch (e) {}
}

Page({
  data: {
    categories: [],   // 一级分类
    children: [],     // 当前选中的子分类
    curNav: 0,
    curName: '',
    inputValue: '',
    isRecording: false,
    loadingTop: false,        // 左侧一级分类加载中（无缓存时）
    loadingChildren: false    // 右侧子分类加载中（无缓存时）
  },

  onLoad: function () {
    this.loadTopCategories()
  },

  onShow: function () {
    // 页面被销毁重建时兜底：无数据则重载（正常切 tab 不会走到这里）
    if (!this.data.categories.length) this.loadTopCategories()
  },

  // 一级分类：缓存优先即时渲染，再后台刷新
  loadTopCategories: function () {
    // 1) 缓存即时出左侧导航，避免空白卡顿
    const cached = readCache(TOP_KEY)
    if (cached.length) {
      const first = cached[0]
      this.setData({
        categories: cached,
        curNav: first.id,
        curName: first.name,
        loadingTop: false
      })
      // 子分类由下方后台刷新统一拉取，避免重复请求
    } else {
      this.setData({ loadingTop: true })
    }

    // 2) 后台请求刷新（无论有无缓存都拉一次，保持最新）
    getCategories({ parent_id: 0 }).then(res => {
      const cats = res.data || []
      writeCache(TOP_KEY, cats)
      const first = cats[0]
      this.setData({ categories: cats, loadingTop: false })
      if (first) {
        // 若选中项变化则切换子分类；否则仅刷新名称
        if (this.data.curNav !== first.id) {
          this.setData({ curNav: first.id, curName: first.name })
        } else {
          this.setData({ curName: first.name })
        }
        this.loadChildren(first.id)
      }
    }).catch(() => {
      this.setData({ loadingTop: false })
      if (!this.data.categories.length) {
        wx.showToast({ title: '获取分类失败', icon: 'none' })
      }
    })
  },

  // 子分类：缓存优先即时出，再后台刷新；仅当仍是当前选中项才写入，避免快速切换串数据
  loadChildren: function (parentId) {
    const key = childKey(parentId)
    const cached = readCache(key)
    const hasCache = cached.length > 0

    this.setData({
      children: hasCache ? cached : [],
      loadingChildren: !hasCache
    })

    getCategories({ parent_id: parentId }).then(res => {
      const list = res.data || []
      writeCache(key, list)
      if (this.data.curNav === parentId) {
        this.setData({ children: list, loadingChildren: false })
      }
    }).catch(() => {
      if (this.data.curNav === parentId) {
        this.setData({ loadingChildren: false })
      }
    })
  },

  // 切换左侧分类
  switchNav: function (e) {
    const id = e.currentTarget.dataset.id
    if (id === this.data.curNav) return
    const name = (this.data.categories.find(c => c.id === id) || {}).name || ''
    this.setData({ curNav: id, curName: name, children: [], loadingChildren: true })
    this.loadChildren(id)
  },

  // 搜索输入
  onSearchChange: function (e) {
    this.setData({ inputValue: e.detail.value })
  },

  // 点击搜索按钮 / 回车
  onSearch: function () {
    this.goSearch(this.data.inputValue)
  },
  onSearchConfirm: function (e) {
    this.goSearch(e.detail.value)
  },
  goSearch: function (kw) {
    kw = (kw || '').trim()
    if (!kw) {
      wx.showToast({ title: '请输入搜索内容', icon: 'none' })
      return
    }
    wx.navigateTo({ url: '/pages/search/index?name=' + encodeURIComponent(kw) })
  },

  // 点击子分类跳转列表
  jumplist: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/list/index?category_id=' + id })
  },

  /* ---------------- 语音输入（可选） ---------------- */
  startVoiceInput: function () {
    this.setData({ isRecording: true })
    try {
      const plugin = requirePlugin('WechatSI')
      const manager = plugin.getRecordRecognitionManager()
      manager.onStart = () => {
        wx.showToast({ title: '请说话…', icon: 'none', duration: 60000 })
      }
      manager.onStop = (res) => {
        this.setData({ isRecording: false })
        wx.hideToast()
        if (res && res.result) {
          this.setData({ inputValue: res.result })
        } else {
          wx.showToast({ title: '未能识别，请重试', icon: 'none' })
        }
      }
      manager.onError = () => {
        this.setData({ isRecording: false })
        wx.hideToast()
        wx.showToast({ title: '语音识别失败', icon: 'none' })
      }
      manager.start({ duration: 60000, lang: 'zh_CN' })
    } catch (err) {
      this.setData({ isRecording: false })
      wx.showToast({ title: '当前环境不支持语音', icon: 'none' })
    }
  },

  stopVoiceInput: function () {
    try {
      const plugin = requirePlugin('WechatSI')
      plugin.getRecordRecognitionManager().stop()
    } catch (err) {}
  }
})
