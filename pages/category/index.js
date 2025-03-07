//index.js
//获取应用实例
const app = getApp()

import { getCategories } from '../../api/category.js'
import { getVoiceRecommend } from '../../api/ai.js'

Page({
  data: {
    cateItems: [],
    children: [],
    inputValue: "",
    curNav: 1,
    curIndex: 0,
    isRecording: false
  },

  onLoad: function (options) {
    //获得分类筛选
    getCategories({
      parent_id: 0
    }).then(res => {
      let categories = res.data;
      let items = [];
      for (let i = 0; i < categories.length; i++) {
        let info = {};
        info.cate_id = categories[i].category_id;
        info.cate_name = categories[i].name;
        info.ishaveChild = false;
        info.children = [];
        items.push(info);
      }
      this.setData({
        cateItems: items
      })
    }).catch(error => {
      console.error('获取分类失败:', error)
      wx.showToast({
        title: '获取分类失败',
        icon: 'none'
      })
    })
  },

  // 开始语音输入
  startVoiceInput: function() {
    this.setData({ isRecording: true })
    const plugin = requirePlugin("WechatSI")
    const manager = plugin.getRecordRecognitionManager()
    
    manager.onStart = (res) => {
      console.log('录音开始')
      wx.showToast({
        title: '请说话...',
        icon: 'none',
        duration: 60000
      })
    }
    
    manager.onStop = (res) => {
      this.setData({ isRecording: false })
      wx.hideToast()
      if (res.result) {
        console.log(res.result)
        this.searchByVoice(res.result)
      } else {
        wx.showToast({
          title: '未能识别，请重试',
          icon: 'none'
        })
      }
    }
    
    manager.onError = (res) => {
      this.setData({ isRecording: false })
      wx.hideToast()
      console.error('语音识别错误:', res)
      wx.showToast({
        title: '语音识别失败，请重试',
        icon: 'none'
      })
    }
    
    manager.start({ duration: 60000, lang: "zh_CN" })
  },

  // 停止语音输入
  stopVoiceInput: function() {
    const plugin = requirePlugin("WechatSI")
    const manager = plugin.getRecordRecognitionManager()
    manager.stop()
  },

  // 语音搜索
  searchByVoice: function(voiceText) {
    this.setData({
      inputValue: voiceText
    })
  },

  // 文字搜索
  search: function() {
    if (!this.data.inputValue.trim()) {
      wx.showToast({
        title: '请输入搜索内容',
        icon: 'none'
      })
      return
    }
    wx.navigateTo({
      url: '/pages/search/index?name=' + encodeURIComponent(this.data.inputValue)
    })
  },

  // 搜索框输入事件
  searchChange: function(e) {
    this.setData({
      inputValue: e.detail.value
    })
  },

  // 点击分类项
  switchRightTab: function(e) {
    let id = e.currentTarget.dataset.id;
    let index = e.currentTarget.dataset.index;
    this.setData({
      curNav: id,
      curIndex: index
    })

    // 获取子分类
    getCategories({
      parent_id: id
    }).then(res => {
      let categories = res.data;
      if (categories && categories.length > 0) {
        this.setData({
          children: categories
        })
      } else {
        this.setData({
          children: []
        })
        wx.showToast({
          title: '暂无子分类',
          icon: 'none'
        })
      }
    }).catch(error => {
      console.error('获取子分类失败:', error)
      wx.showToast({
        title: '获取子分类失败',
        icon: 'none'
      })
    })
  },

  // 跳转到分类列表页
  jumplist: function(e) {
    let category_id = e.currentTarget.dataset.category_id;
    wx.navigateTo({
      url: '/pages/list/index?category_id=' + category_id
    })
  }
})