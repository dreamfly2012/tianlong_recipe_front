const { request } = require('../utils/util.js')

// 分类列表（parent_id=0 为一级分类）
function getCategories(data) {
  return request({
    url: '/api/recipe.category',
    method: 'GET',
    data
  })
}

module.exports = {
  getCategories
}
