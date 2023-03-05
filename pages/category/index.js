//index.js
//获取应用实例
const app = getApp()

import {
  getCategories
} from '../../api/category.js'

Page({
  data: {
    cateItems: [],
    children: [],
    inputValue: "",
    curNav: 1,
    curIndex: 0
  },

  onLoad: function (options) {
    var that = this;
    //获得分类筛选
    getCategories({

    }).then(res => {
      let recipes = res.data;
      let items = [];
      console.log(this.data.cateItems);
      for (let i = 0; i < recipes.length; i++) {
        let info = {};
        info.cate_id = recipes[i].category_id;
        info.cate_name = recipes[i].name;
        info.ishaveChild = false;
        info.children = [];
        items.push(info);
      }
      this.setData({
        'cateItems':items
      });

      getCategories({
        parent_id: 1
      }).then(res => {
        let categories = res.data;
        console.log(categories);
        
        this.setData({
          'children':categories
        });
      })

    })




  },

  search:function(e){
    let name = e.detail.value;
    wx.navigateTo({
      url:'../search/index?name=' + name,  //跳转页面的路径，可带参数 ？隔开，不同参数用 & 分隔；相对路径，不需要.wxml后缀
      success:function(){}        //成功后的回调；
      
    })
  },

  jumplist:function(e){
    let category_id = e.target.dataset.category_id;
    wx.navigateTo({
      url:'../list/index?category_id=' + category_id,  //跳转页面的路径，可带参数 ？隔开，不同参数用 & 分隔；相对路径，不需要.wxml后缀
      success:function(){}        //成功后的回调；
      
    })
  },

  navbarTap: function (e) {
    var that = this;
    console.log(e);
    this.setData({
      currentTab: e.currentTarget.id, //按钮CSS变化
      category: e.currentTarget.dataset.cate_id,
      scrollTop: 0, //切换导航后，控制右侧滚动视图回到顶部
    })
    //刷新右侧内容的数据
    var cate_id = this.data.category;
    getCategories({
      parent_id: cate_id
    }).then(res => {
      let categories = res.data;
      console.log(categories);
      
      this.setData({
        'children':categories
      });
    })



  },
})