// AI功能页面
const app = getApp()

import { getDailyRecommend, getPersonalizedRecommend } from '../../api/ai.js'

Page({
  data: {
    dailyRecipes: [],
    personalizedRecipes: [],
    mealPlan: null
  },

  onLoad: function () {
    // 模拟每日推荐数据
    this.loadDailyRecommend();
    this.loadPersonalizedRecommend();
  },

  // 加载每日推荐
  loadDailyRecommend: function() {
    getDailyRecommend().then(res => {
      this.setData({
        dailyRecipes: res.data
      })
    }).catch(error => {
      console.error('获取每日推荐失败:', error)
      wx.showToast({
        title: '获取推荐失败',
        icon: 'none'
      })
    })
  },

  // 加载个性化推荐
  loadPersonalizedRecommend: function() {
    getPersonalizedRecommend().then(res => {
      this.setData({
        personalizedRecipes: res.data
      })
    }).catch(error => {
      console.error('获取个性化推荐失败:', error)
    })
  },

  // 生成智能菜单
  generateMealPlan: function() {
    // const preferences = {
    //   goal: 'healthy', // 可以通过用户设置获取
    //   restrictions: [] // 可以通过用户设置获取
    // }

    // getMealPlan(preferences).then(res => {
    //   this.setData({
    //     mealPlan: res.data
    //   })
    // }).catch(error => {
    //   console.error('生成菜单失败:', error)
    //   wx.showToast({
    //     title: '生成失败',
    //     icon: 'none'
    //   })
    // })
    wx.navigateTo({
      url: '/pages/ai/menu'
    })
  },

  // 输入框内容变化
  onIngredientInput: function(e) {
    this.setData({
      ingredientInput: e.detail.value
    })
  },

  // 跳转到菜品详情
  jumpToDetail: function(e) {
    const id = e.currentTarget.dataset.id
    console.log(id)
    wx.navigateTo({
      url: '/pages/info/info?id=' + id
    })
  }
});