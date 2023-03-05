//index.js
//获取应用实例
const app = getApp()

import { getRecipe } from '../../api/recipe.js'

Page({
  data: {
    recipe: {}
  },

  onLoad: function () {
    let that = this;
    var id = getApp().requestid;

    getRecipe(id).then(res => {
      that.setData({
        recipe: res
      })


    }).catch(error => {
      console.log(error)
    })
  },
})