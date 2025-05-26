import {request} from '../utils/util.js'


export function getRecipes(data) {
  return request({
    url: `/api/recipes`,
    method: 'get',
    data
  })
}

export function getRecipe(id){
  return request({
    url: `/api/recipe/detail`,
    method: 'get',
    data: {
      id: id
  },
  })
}