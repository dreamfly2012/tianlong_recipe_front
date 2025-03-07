// AI相关接口

const baseUrl = 'http://localhost:3000/api';

// 获取每日推荐菜谱
export function getDailyRecommend() {
  return wx.request({
    url: `${baseUrl}/ai/daily-recommend`,
    method: 'GET'
  })
}

// 根据食材推荐菜谱
export function getRecipesByIngredients(ingredients) {
  return wx.request({
    url: `${baseUrl}/ai/ingredients-recommend`,
    method: 'POST',
    data: {
      ingredients: ingredients
    }
  })
}

// 获取个性化推荐
export function getPersonalizedRecommend() {
  return wx.request({
    url: `${baseUrl}/ai/personalized-recommend`,
    method: 'GET'
  })
}

// 获取智能菜单规划
export function getMealPlan(preferences) {
  return wx.request({
    url: `${baseUrl}/ai/meal-plan`,
    method: 'POST',
    data: preferences
  })
}