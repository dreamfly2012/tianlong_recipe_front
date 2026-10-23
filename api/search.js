const { request } = require('../utils/util.js')

// 搜索菜谱
function search(data) {
  return request({
    url: '/api/recipe.search',
    method: 'GET',
    data
  })
}

// 输入联想：复用搜索接口，失败静默降级
function suggest(data) {
  return request({
    url: '/api/recipe.search',
    method: 'GET',
    data,
    silent: true
  })
}

module.exports = {
  search,
  suggest
}
