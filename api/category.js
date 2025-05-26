import {request} from '../utils/util.js'
// baseUrl也可拼接在request.js中，当有多个鉴权模块，放在这里更灵活

export function getCategories(data) {
  return request({
    url: `/api/categories`,
    method: 'get',
    data
  })
}