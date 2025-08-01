// AI相关接口
import {request} from '../utils/util.js'

// 获取每日推荐菜谱
export function getDailyRecommend() {
  return request({
    url: `/api/recipe.daily`,
    method: 'GET'
  })
}

// 根据食材推荐菜谱
export function getRecipesByIngredients(ingredients) {
  return request({
    url: `/api/recipe.ai`,
    method: 'POST',
    data: {
      ingredients: ingredients
    }
  })
}

// 获取个性化推荐
export function getPersonalizedRecommend() {
  return request({
    url: `/api/ai/personalized-recommend`,
    method: 'GET'
  })
}

// 获取智能菜单规划
export function getGenerateRecipe(data) {
  return request({
    url: `/api/ai/generate-recipe`,
    method: 'POST',
    data: data
  })
}