// app.js
const { initEnv, getEnvConfig } = require('./config/env.js')
const wechatApi = require('./api/wechat.js')
const categoryApi = require('./api/category.js')

App({
  onLaunch: function () {
    // 初始化环境配置（默认 release，可改为 develop / trial）
    const env = 'release'
    initEnv({
      env,
      config: {
        develop: {
          baseUrl: 'http://127.0.0.1:8000',
          useMock: false
        },
        trial: {
          baseUrl: 'https://recipe.80shihua.com',
          useMock: false
        },
        release: {
          baseUrl: 'https://recipe.80shihua.com',
          useMock: false
        }
      }
    })

    // 将 baseUrl 同步到 globalData，供页面/接口复用
    const envConfig = getEnvConfig()
    this.globalData.baseUrl = envConfig.baseUrl

    // 展示本地存储能力（用于 logs 页面）
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 检查登录状态
    this.checkLoginStatus()

    // 预加载分类数据（写入本地缓存），让用户点「分类」tab 时秒出
    this.preloadCategories()

    console.log('[App] 当前环境:', env, 'baseUrl:', envConfig.baseUrl)
  },

  /**
   * 预加载分类并写入本地缓存：一级分类 + 首个分类的子分类
   * 失败静默忽略，不影响启动
   */
  preloadCategories: function () {
    const TOP_KEY = 'cat_top_cache'
    categoryApi.getCategories({ parent_id: 0 }).then(res => {
      const cats = (res && res.data) || []
      try { wx.setStorageSync(TOP_KEY, cats) } catch (e) {}
      const first = cats[0]
      if (first) {
        categoryApi.getCategories({ parent_id: first.id }).then(r2 => {
          try { wx.setStorageSync('cat_children_' + first.id, (r2 && r2.data) || []) } catch (e) {}
        }).catch(() => {})
      }
    }).catch(() => {})
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus: function () {
    const isLoggedIn = wechatApi.checkLoginStatus()
    if (isLoggedIn) {
      const userInfo = wechatApi.getUserInfo()
      this.globalData.userInfo = userInfo
      this.globalData.isLoggedIn = true
      if (this.userInfoReadyCallback) {
        this.userInfoReadyCallback(userInfo)
      }
    } else {
      this.globalData.isLoggedIn = false
    }
  },

  /**
   * 全局登录方法（code-only 静默登录，用户头像昵称通过「头像昵称填写」组件由 profile 页单独处理）
   */
  login: function () {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (loginRes) => {
          if (!loginRes.code) {
            reject(new Error('获取登录凭证失败'))
            return
          }
          const defaultUserInfo = {
            nickName: '天龙用户',
            avatarUrl: '/image/profile.png',
            gender: 0
          }
          wechatApi.login({ code: loginRes.code, userInfo: defaultUserInfo })
            .then(res => {
              if (res.code === 0 || res.authenticated === true) {
                const token = (res.data && res.data.token) || res.token
                const info = (res.data && res.data.user) || defaultUserInfo
                if (!token) {
                  reject(new Error('登录失败：未获取到有效凭证'))
                  return
                }
                wechatApi.saveLoginInfo({ token, userInfo: info })
                this.globalData.userInfo = info
                this.globalData.isLoggedIn = true
                resolve(info)
              } else {
                reject(new Error(res.msg || '登录失败'))
              }
            })
            .catch(reject)
        },
        fail: () => reject(new Error('微信登录失败'))
      })
    })
  },

  globalData: {
    userInfo: null,
    isLoggedIn: false,
    baseUrl: 'https://recipe.80shihua.com'
  }
})
