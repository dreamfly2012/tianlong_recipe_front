import {request} from '../utils/util.js'
// baseUrl也可拼接在request.js中，当有多个鉴权模块，放在这里更灵活
const baseUrl = getApp().globalData.baseUrl

export function search(data) {
  return request({
    url: `${baseUrl}/api/recipe.search`,
    method: 'get',
    data
  })
}