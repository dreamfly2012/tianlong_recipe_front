/**
 * 图片地址规整工具
 *
 * 背景：页面统一用 item.image_src 绑定封面图，但后端返回的字段名并不统一
 * （可能是 image_src / image / image_url / cover / pic ...），且部分图片返回的是
 * 相对路径（如 /uploads/xxx.jpg），需要补齐接口域名才能在小程序里加载。
 * 这里统一兜底，保证每个菜谱对象始终带上可用的 image_src。
 */

const { getEnvConfig } = require('../config/env')

// 候选图片字段，按优先级取第一个有值
const IMAGE_KEYS = [
  'image_src', 'image_url', 'image', 'cover',
  'pic', 'img', 'thumb', 'thumbnail', 'photo', 'picture'
]

// 卡片 meta 字段的候选键名（后端驼峰/下划线命名不统一）
const COOKING_TIME_KEYS = ['cookingTime', 'cooking_time', 'cook_time', 'duration']
const DIFFICULTY_KEYS = ['difficulty', 'difficulty_level', 'level']

// 卡片最多展示的标签数量，超出部分汇总为 +N
const MAX_CARD_TAGS = 3

function pickFirstValue(item, keys) {
  for (const k of keys) {
    const v = item[k]
    if (v !== undefined && v !== null && v !== '') return v
  }
  return ''
}

// 统一成卡片展示用的时长文案，已是“15分钟”这类带单位的文本则原样保留
function formatCookingTime(value) {
  if (value === undefined || value === null || value === '') return ''
  if (typeof value === 'number') {
    return value > 0 ? `${value} 分钟` : ''
  }
  const text = String(value).trim()
  if (!text) return ''
  if (/^\d+(\.\d+)?$/.test(text)) return `${text} 分钟`
  return text
}

function formatDifficulty(value) {
  if (value === undefined || value === null || value === '') return ''
  if (typeof value === 'object') {
    return String(value.name || value.label || '').trim()
  }
  return String(value).trim()
}

// 兼容数组 / 逗号分隔字符串 / 对象数组，去空去重
function normalizeTags(value) {
  let list = []
  if (Array.isArray(value)) {
    list = value.map(t => {
      if (typeof t === 'string') return t.trim()
      if (t && typeof t === 'object') return String(t.name || t.title || t.tag || '').trim()
      return ''
    })
  } else if (typeof value === 'string') {
    list = value.split(/[,，#\s]+/).map(t => t.trim())
  }
  return list.filter((t, i) => t && list.indexOf(t) === i)
}

// 把一个输入规整成完整图片地址（字符串）
function normalizeImageSrc(input) {
  let src = ''
  if (typeof input === 'string') {
    src = input
  } else if (input && typeof input === 'object') {
    for (const k of IMAGE_KEYS) {
      if (input[k]) { src = input[k]; break }
    }
  }
  if (!src || typeof src !== 'string') return ''
  src = src.trim()
  if (!src) return ''

  // 相对路径补齐域名：以 / 开头、不是协议相对 //、也不是 http(s)
  if (src.startsWith('/') && !src.startsWith('//') && !/^https?:\/\//i.test(src)) {
    const base = (getEnvConfig().baseUrl || '').replace(/\/+$/, '')
    if (base) src = base + src
  }
  return src
}

// 规整单个菜谱对象，保证始终带 image_src 和卡片展示用的 meta 字段
function normalizeRecipe(item) {
  if (!item || typeof item !== 'object') return item
  const src = normalizeImageSrc(item)
  const tags = normalizeTags(item.tags || item.tag)
  return Object.assign({}, item, {
    image_src: src,
    cookingTimeText: formatCookingTime(pickFirstValue(item, COOKING_TIME_KEYS)),
    difficultyText: formatDifficulty(pickFirstValue(item, DIFFICULTY_KEYS)),
    tagList: tags.slice(0, MAX_CARD_TAGS),
    tagMore: Math.max(tags.length - MAX_CARD_TAGS, 0)
  })
}

// 从接口返回体（{code,data}）里提取菜谱数组，兼容 data 直接为数组或 data.list / data.data
function extractRecipeList(res) {
  const d = res && res.data
  if (Array.isArray(d)) return d
  if (d && Array.isArray(d.list)) return d.list
  if (d && Array.isArray(d.data)) return d.data
  if (Array.isArray(res)) return res
  return []
}

// 规整菜谱列表（可传数组，也可直接传接口返回体 res）
function normalizeRecipes(list) {
  const arr = Array.isArray(list) ? list : extractRecipeList(list)
  return arr.map(normalizeRecipe)
}

module.exports = {
  normalizeImageSrc,
  normalizeRecipe,
  extractRecipeList,
  normalizeRecipes
}
