// app.js
const { initEnv } = require('./config/env.js')

App({
  onLaunch: function () {
    // 初始化环境配置
    const env = __wxConfig.envVersion || 'develop' // 获取小程序环境
    initEnv({
      env,
      config: {
        develop: {
          // 开发环境配置
          baseUrl: 'http://127.0.0.1:8000/',
          useMock: true // 开发环境默认使用 mock 数据
        },
        trial: {
          // 体验版环境配置
          baseUrl: 'https://recipe.80shihua.com/',
          useMock: false
        },
        release: {
          // 正式环境配置
          baseUrl: 'https://recipe.80shihua.com/',
          useMock: false
        }
      }
    })

    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 打印当前环境信息
    console.log('[App] 当前环境:', env)
  },

  globalData: {
    userInfo: null
  }
})