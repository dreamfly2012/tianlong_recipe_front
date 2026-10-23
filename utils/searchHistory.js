/**
 * 搜索历史本地缓存
 * 最多保留 MAX_HISTORY 条，最新在前，重复关键词只保留一条。
 */

const HISTORY_KEY = 'search_history'
const MAX_HISTORY = 10

function normalize(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function getHistory() {
  try {
    const list = wx.getStorageSync(HISTORY_KEY)
    if (!Array.isArray(list)) return []
    return list.map(normalize).filter((kw) => kw).slice(0, MAX_HISTORY)
  } catch (e) {
    return []
  }
}

function addHistory(keyword) {
  const kw = normalize(keyword)
  if (!kw) return getHistory()
  const next = [kw].concat(getHistory().filter((item) => item !== kw)).slice(0, MAX_HISTORY)
  try {
    wx.setStorageSync(HISTORY_KEY, next)
  } catch (e) {}
  return next
}

function clearHistory() {
  try {
    wx.removeStorageSync(HISTORY_KEY)
  } catch (e) {}
}

module.exports = {
  HISTORY_KEY,
  MAX_HISTORY,
  getHistory,
  addHistory,
  clearHistory
}
