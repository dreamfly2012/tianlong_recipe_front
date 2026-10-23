// search/index.js
import { search, suggest } from '../../api/search.js'
import { getHotRecipes } from '../../api/recipe.js'
const { normalizeRecipes, extractRecipeList } = require('../../utils/image.js')
const { getHistory, addHistory, clearHistory } = require('../../utils/searchHistory.js')

// 热门词兜底：后端未提供热门搜索接口时使用（均为实测可搜到结果的菜名）
const DEFAULT_HOT_WORDS = ['红烧肉', '宫保鸡丁', '鱼香肉丝', '水煮鱼', '西红柿炒鸡蛋', '清蒸鲈鱼', '排骨', '牛肉']
const MAX_SUGGESTIONS = 8
const SUGGEST_DELAY = 300
const BLUR_DELAY = 150

function dedupe(list) {
  const seen = Object.create(null)
  return list.filter((item) => {
    if (!item || seen[item]) return false
    seen[item] = true
    return true
  })
}

function containsKeyword(text, keyword) {
  return text.toLowerCase().indexOf(keyword.toLowerCase()) !== -1
}

// 拆成 前 / 命中 / 后 三段，交给 WXML 高亮命中片段
function buildSuggestion(text, keyword) {
  const index = text.toLowerCase().indexOf(keyword.toLowerCase())
  if (index === -1) return { text, before: text, hit: '', after: '' }
  return {
    text,
    before: text.slice(0, index),
    hit: text.slice(index, index + keyword.length),
    after: text.slice(index + keyword.length)
  }
}

Page({
  data: {
    keyword: '',
    inputFocus: false,
    suppressSuggest: false,
    history: [],
    hotWords: DEFAULT_HOT_WORDS,
    suggestions: [],
    suggesting: false,
    showPanel: false,
    showSuggest: false,
    recipes: [],
    page: 1,
    pageSize: 10,
    loading: false,
    finished: false,
    searched: false
  },

  onLoad: function (options) {
    const name = options.name ? decodeURIComponent(options.name) : ''
    this.suggestTimer = null
    this.blurTimer = null
    this.suggestSeq = 0
    this.resultSeq = 0

    this.setData({ history: getHistory() })
    this.fetchHotWords()

    if (name) {
      this.runSearch(name)
    } else {
      this.setData({ inputFocus: true, showPanel: true })
    }
  },

  onUnload: function () {
    this.clearSuggestTimer()
    clearTimeout(this.blurTimer)
  },

  /* ---------------- 输入区 ---------------- */

  onSearchChange: function (e) {
    const keyword = e.detail.value
    const kw = keyword.trim()
    this.clearSuggestTimer()
    this.setData({ keyword, suppressSuggest: false })

    if (!kw) {
      this.suggestSeq++
      this.resultSeq++
      this.setData({
        suggestions: [],
        suggesting: false,
        showPanel: true,
        showSuggest: false,
        searched: false,
        recipes: [],
        page: 1,
        finished: false,
        loading: false
      })
      return
    }

    this.setData({ showPanel: false, showSuggest: this.data.inputFocus })
    this.scheduleSuggest(kw)
  },

  onInputFocus: function () {
    clearTimeout(this.blurTimer)
    this.setData({ inputFocus: true, suppressSuggest: false })
    const kw = this.data.keyword.trim()
    if (kw) {
      this.setData({ showSuggest: true })
      this.scheduleSuggest(kw)
    }
  },

  onInputBlur: function () {
    clearTimeout(this.blurTimer)
    this.blurTimer = setTimeout(() => {
      this.setData({ inputFocus: false, showSuggest: false })
    }, BLUR_DELAY)
  },

  // 搜索后再次点输入框：重新展开联想
  onInputTap: function () {
    if (!this.data.suppressSuggest) return
    const kw = this.data.keyword.trim()
    if (!kw) return
    this.setData({ suppressSuggest: false, showSuggest: true, inputFocus: true })
    this.scheduleSuggest(kw)
  },

  onClearInput: function () {
    this.clearSuggestTimer()
    clearTimeout(this.blurTimer)
    this.suggestSeq++
    this.resultSeq++
    this.setData({
      keyword: '',
      suggestions: [],
      suggesting: false,
      searched: false,
      recipes: [],
      page: 1,
      finished: false,
      loading: false,
      showPanel: true,
      showSuggest: false,
      suppressSuggest: false,
      inputFocus: true
    })
  },

  /* ---------------- 联想 ---------------- */

  scheduleSuggest: function (kw) {
    const seq = ++this.suggestSeq
    const local = this.buildSuggestions(kw, [])
    this.setData({ suggestions: local, suggesting: !local.length })

    this.clearSuggestTimer()
    this.suggestTimer = setTimeout(() => this.fetchSuggestions(kw, seq), SUGGEST_DELAY)
  },

  fetchSuggestions: function (kw, seq) {
    suggest({ name: kw, page: 1 }).then((res) => {
      if (seq !== this.suggestSeq || this.data.keyword.trim() !== kw) return
      const names = extractRecipeList(res)
        .map((item) => (item && item.name ? String(item.name).trim() : ''))
        .filter(Boolean)
      this.setData({
        suggestions: this.buildSuggestions(kw, names),
        suggesting: false
      })
    }).catch(() => {
      if (seq !== this.suggestSeq) return
      this.setData({ suggesting: false })
    })
  },

  buildSuggestions: function (kw, remoteNames) {
    const local = this.data.history
      .concat(this.data.hotWords)
      .filter((text) => containsKeyword(text, kw))
    const remote = remoteNames.filter((text) => containsKeyword(text, kw))
    return dedupe(local.concat(remote))
      .slice(0, MAX_SUGGESTIONS)
      .map((text) => buildSuggestion(text, kw))
  },

  clearSuggestTimer: function () {
    if (this.suggestTimer) {
      clearTimeout(this.suggestTimer)
      this.suggestTimer = null
    }
  },

  /* ---------------- 搜索 ---------------- */

  onSearch: function () {
    this.runSearch(this.data.keyword)
  },

  onSearchConfirm: function (e) {
    this.runSearch(e.detail.value)
  },

  onTapKeyword: function (e) {
    const kw = e.currentTarget.dataset.kw
    if (!kw) return
    this.runSearch(kw)
  },

  runSearch: function (rawKeyword) {
    const kw = String(rawKeyword || '').trim()
    if (!kw) {
      wx.showToast({ title: '请输入搜索内容', icon: 'none' })
      return
    }

    this.clearSuggestTimer()
    clearTimeout(this.blurTimer)
    this.suggestSeq++
    this.setData({
      keyword: kw,
      history: addHistory(kw),
      suppressSuggest: true,
      suggestions: [],
      suggesting: false,
      showPanel: false,
      showSuggest: false
    })

    if (typeof wx.hideKeyboard === 'function') {
      wx.hideKeyboard({ fail: () => {} })
    }
    this.fetchRecipes(1, true)
  },

  fetchRecipes: function (page, reset) {
    const kw = this.data.keyword.trim()
    if (!kw) return

    const seq = ++this.resultSeq
    this.setData(reset
      ? { loading: true, searched: true, recipes: [], page: 1, finished: false }
      : { loading: true, searched: true })

    search({ name: kw, page: page, page_size: this.data.pageSize }).then((res) => {
      if (seq !== this.resultSeq) return
      const list = normalizeRecipes(res)
      this.setData({
        recipes: reset ? list : this.data.recipes.concat(list),
        page: page,
        loading: false,
        finished: list.length < this.data.pageSize
      })
    }).catch(() => {
      if (seq !== this.resultSeq) return
      this.setData({ loading: false })
    })
  },

  /* ---------------- 热门词 ---------------- */

  fetchHotWords: function () {
    getHotRecipes(8).then((res) => {
      const names = extractRecipeList(res)
        .map((item) => (item && item.name ? String(item.name).trim() : ''))
        .filter(Boolean)
      const words = dedupe(names).slice(0, 8)
      if (words.length) this.setData({ hotWords: words })
    }).catch(() => {
      // 静默降级为默认热门词
    })
  },

  onClearHistory: function () {
    if (!this.data.history.length) return
    wx.showModal({
      title: '清空搜索历史',
      content: '确定清空全部搜索历史吗？',
      confirmColor: '#FF6B00',
      success: (res) => {
        if (!res.confirm) return
        clearHistory()
        this.setData({ history: [] })
      }
    })
  },

  /* ---------------- 结果与分页 ---------------- */

  jumpDetail: function (e) {
    const id = e.currentTarget.dataset.id
    if (!id) {
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
    if (this.data.searched) this.fetchRecipes(1, true)
    wx.stopPullDownRefresh()
  },

  onReachBottom: function () {
    if (this.data.searched && !this.data.finished && !this.data.loading && !this.data.showSuggest) {
      this.fetchRecipes(this.data.page + 1, false)
    }
  }
})
