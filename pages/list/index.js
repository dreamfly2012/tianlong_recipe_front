//index.js
//获取应用实例
const app = getApp()

import { getRecipes } from '../../api/recipe.js'

Page({
  data: {
    recipes: [],
    page: 1,
  },

  onLoad: function (options) {
    this.getData(1,options.category_id)
  },

  getData: function (page,category_id) {
    this.loading = true

    getRecipes({
      category_id:category_id,
      page:page
    }).then(res => {
      let recipes = res.data;
      if(recipes.length==0){
        wx.showToast({
          title: '没有更多数据了',
        })
      }else{
        this.setData({
          page: page,     //当前的页号
          recipes: this.data.recipes.concat(recipes)
        })
      }
      
      this.loading = false
    }).catch(error => {
      console.log(error)
    })
  },

  jumpdetail: function (e) {
    console.log(e)
    let id = e.currentTarget.dataset.id;
    app.requestid = id;

    wx.navigateTo({
      url: '/pages/info/info?id=' + id
    })

  },

  onPullDownRefresh: function () {
    this.getData(1)
  },
  onReachBottom: function () {
    // 下拉触底，先判断是否有请求正在进行中
    // 以及检查当前请求页数是不是小于数据总页数，如符合条件，则发送请求
    if (!this.loading ) {
      this.getData(this.data.page + 1)
    }
  }
})