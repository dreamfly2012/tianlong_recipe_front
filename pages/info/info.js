//index.js
//获取应用实例
const app = getApp()

const api_host = "https://bbs.80shihua.com/"

Page({
    data: {
        recipe: {}
    },

    onLoad: function () {
        let that = this;
        var id = getApp().requestid;
        wx.request({
            url: 'https://bbs.80shihua.com/api/recipe.info', //仅为示例，并非真实的接口地址
            data: {
                id: id
            },
            header: {
                'content-type': 'application/json' // 默认值
            },
            success: function (res) {
                
                console.log(res.data);
                that.setData({
                    recipe: res.data
                })
                
            }
        })
     
    }
})