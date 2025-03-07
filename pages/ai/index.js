// AI功能页面
const app = getApp()

import { getDailyRecommend, getRecipesByIngredients, getPersonalizedRecommend, getMealPlan } from '../../api/ai.js'

Page({
  data: {
    dailyRecipes: [],
    personalizedRecipes: [],
    mealPlan: null
  },

  onLoad: function () {
    // 模拟每日推荐数据
    this.setData({
      dailyRecipes: [{
        id: 1,
        name: '红烧排骨',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947',
        description: '美味可口的红烧排骨'
      }, {
        id: 2,
        name: '清炒小白菜',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
        description: '营养健康的素菜'
      }, {
        id: 3,
        name: '麻婆豆腐',
        image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19',
        description: '川菜经典名菜'
      }]
    })

    // 模拟个性化推荐数据
    this.setData({
      personalizedRecipes: [{
        id: 4,
        name: '糖醋里脊',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
        description: '外酥里嫩，酸甜可口'
      }, {
        id: 5,
        name: '水煮鱼',
        image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327',
        description: '麻辣鲜香的川菜代表'
      }, {
        id: 6,
        name: '蒜蓉炒菜心',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999',
        description: '清淡爽口的快手菜'
      }]
    })
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
    const preferences = {
      goal: 'healthy', // 可以通过用户设置获取
      restrictions: [] // 可以通过用户设置获取
    }

    getMealPlan(preferences).then(res => {
      this.setData({
        mealPlan: res.data
      })
    }).catch(error => {
      console.error('生成菜单失败:', error)
      wx.showToast({
        title: '生成失败',
        icon: 'none'
      })
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
    app.requestid = id
    wx.navigateTo({
      url: '/pages/info/info?id=' + id
    })
  }
});