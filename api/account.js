// 账户相关接口
import {request} from '../utils/util.js'

// 获取收藏的菜谱
export function getFavorites(page) {
  return request({
    url: `/api/recipe.favourites`,
    method: 'GET',
    data: {
      page: page
    },
    requiresAuth: true
  })
}

// 获取用户信息
export function getUserInfo() {
  return request({
    url: '/api/account/info',
    method: 'GET',
    requiresAuth: true
  })
}

// 更新用户信息
export function updateUserInfo(data) {
  return request({
    url: '/api/account/info',
    method: 'PUT',
    data: data,
    requiresAuth: true
  })
}

// 添加菜谱到收藏
export function addFavorite(recipeId) {
  return request({
    url: '/api/recipe.favourite',
    method: 'GET',
    data:{recipe_id,recipeId},
    requiresAuth: true
  })
}

// 从收藏中移除菜谱
export function removeFavorite(recipeId) {
  return request({
    url: `/api/recipe.unfavourite`,
    method: 'GET',
    data:{recipe_id,recipeId},
    requiresAuth: true
  })
}