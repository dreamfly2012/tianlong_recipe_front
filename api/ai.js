const { request } = require('../utils/util.js')

// 获取每日推荐菜谱
function getDailyRecommend() {
  return request({
    url: '/api/recipe.daily',
    method: 'GET'
  })
}

// 根据食材推荐菜谱
function getRecipesByIngredients(ingredients) {
  return request({
    url: '/api/recipe.ai',
    method: 'POST',
    data: { ingredients }
  })
}

// 获取个性化推荐
function getPersonalizedRecommend() {
  return request({
    url: '/api/recipe.personalized',
    method: 'GET'
  })
}

// 获取专属菜单规划
function getGenerateRecipe(data) {
  return request({
    url: '/api/recipe.generate',
    method: 'POST',
    data: data,
    // 专属菜单接口较慢，给足 60s，但绝不会无限挂起
    timeout: 60000
  })
}

module.exports = {
  getDailyRecommend,
  getRecipesByIngredients,
  getPersonalizedRecommend,
  getGenerateRecipe
}
