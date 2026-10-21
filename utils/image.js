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

// 规整单个菜谱对象，保证始终带 image_src
function normalizeRecipe(item) {
  if (!item || typeof item !== 'object') return item
  const src = normalizeImageSrc(item)
  return Object.assign({}, item, { image_src: src })
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
