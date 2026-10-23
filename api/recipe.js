const { request } = require('../utils/util.js')

// 菜谱列表（支持分类、分页）
function getRecipes(data) {
  return request({
    url: '/api/recipe.lists',
    method: 'GET',
    data
  })
}

// 热门菜谱（搜索页热门词数据源，失败静默降级）
function getHotRecipes(limit) {
  return request({
    url: '/api/recipe.lists',
    method: 'GET',
    data: { page: 1, page_size: limit || 8 },
    silent: true
  })
}

// 菜谱详情
function getRecipe(id) {
  return request({
    url: '/api/recipe.info',
    method: 'GET',
    data: { id }
  })
}

module.exports = {
  getRecipes,
  getHotRecipes,
  getRecipe
}
