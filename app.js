// app.js
const { initEnv } = require('./config/env.js')
const wechatApi = require('./api/wechat.js')

App({
  onLaunch: function () {
    // 初始化环境配置
    const env =  'develop' // 获取小程序环境
    initEnv({
      env,
      config: {
        develop: {
          // 开发环境配置
          baseUrl: 'http://127.0.0.1:8000',
          useMock: false // 修改为false，使用真实API而不是mock数据
        },
        trial: {
          // 体验版环境配置
          baseUrl: 'https://recipe.80shihua.com',
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

    // 检查登录状态
    this.checkLoginStatus()

    // 打印当前环境信息
    console.log('[App] 当前环境:', env)
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus: function() {
    // 检查是否有登录态
    const isLoggedIn = wechatApi.checkLoginStatus()
    if (isLoggedIn) {
      // 获取用户信息
      const userInfo = wechatApi.getUserInfo()
      this.globalData.userInfo = userInfo
      this.globalData.isLoggedIn = true
      
      // 如果有回调函数，执行回调
      if (this.userInfoReadyCallback) {
        this.userInfoReadyCallback(userInfo)
      }
    } else {
      this.globalData.isLoggedIn = false
    }
  },

  /**
   * 全局登录方法
   */
  login: function() {
    return new Promise((resolve, reject) => {
      // 获取微信登录凭证
      wx.login({
        success: (loginRes) => {
          if (loginRes.code) {
            // 获取用户信息
            wx.getUserProfile({
              desc: '用于完善会员资料',
              success: (profileRes) => {
                // 调用后端登录接口
                wechatApi.login({
                  code: loginRes.code,
                  userInfo: profileRes.userInfo
                }).then(res => {
                  if (res.code === 0) {
                    // 保存登录信息
                    wechatApi.saveLoginInfo({
                      token: res.data.token,
                      userInfo: profileRes.userInfo
                    })
                    
                    // 更新全局状态
                    this.globalData.userInfo = profileRes.userInfo
                    this.globalData.isLoggedIn = true
                    
                    resolve(profileRes.userInfo)
                  } else {
                    reject(new Error(res.msg || '登录失败'))
                  }
                }).catch(err => {
                  reject(err)
                })
              },
              fail: (err) => {
                reject(new Error('获取用户信息失败'))
              }
            })
          } else {
            reject(new Error('获取登录凭证失败'))
          }
        },
        fail: (err) => {
          reject(new Error('微信登录失败'))
        }
      })
    })
  },

  globalData: {
    userInfo: null,
    isLoggedIn: false
  }
})