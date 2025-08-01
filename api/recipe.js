import {request} from '../utils/util.js'


export function getRecipes(data) {
  return request({
    url: `/api/recipe.lists`,
    method: 'get',
    data
  })
}

export function getRecipe(id){
  return request({
    url: `/api/recipe.info`,
    method: 'get',
    data: {
      id: id
  },
  })
}