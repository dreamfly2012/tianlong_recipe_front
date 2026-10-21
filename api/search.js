const { request } = require('../utils/util.js')

// 搜索菜谱
function search(data) {
  return request({
    url: '/api/recipe.search',
    method: 'GET',
    data
  })
}

module.exports = {
  search
}
