const { request } = require('../utils/util.js')

// 获取收藏的菜谱
function getFavorites(page) {
  return request({
    url: '/api/recipe.favourites',
    method: 'GET',
    data: { page },
    requiresAuth: true
  })
}

// 判断用户是否已收藏某菜谱
function isUserFavorite(recipeId) {
  return request({
    url: '/api/recipe.isfavourite',
    method: 'GET',
    data: { recipe_id: recipeId },
    requiresAuth: true
  })
}

// 获取用户信息
function getUserInfo() {
  return request({
    url: '/api/account/info',
    method: 'GET',
    requiresAuth: true
  })
}

// 更新用户信息
function updateUserInfo(data) {
  return request({
    url: '/api/account/info',
    method: 'PUT',
    data: data,
    requiresAuth: true
  })
}

// 添加收藏
function addFavorite(recipeId) {
  return request({
    url: '/api/recipe.favourite',
    method: 'GET',
    data: { recipe_id: recipeId },
    requiresAuth: true
  })
}

// 取消收藏
function removeFavorite(recipeId) {
  return request({
    url: '/api/recipe.unfavourite',
    method: 'GET',
    data: { recipe_id: recipeId },
    requiresAuth: true
  })
}

module.exports = {
  getFavorites,
  isUserFavorite,
  getUserInfo,
  updateUserInfo,
  addFavorite,
  removeFavorite
}
