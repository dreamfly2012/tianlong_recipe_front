//index.js
//获取应用实例
const app = getApp()

import { getRecipes } from '../../api/recipe.js'

Page({
  data: {
    cateItems: [
      {
        cate_id: 1,
        cate_name: "鲁菜",
        ishaveChild: true,
        children:
        [
          {
            child_id: 1,
            name: '洁面皂',
            image: "http://mz.djmall.xmisp.cn/files/logo/20161208/148117972563.jpg"
          },
          {
            child_id: 2,
            name: '卸妆',
            image: "http://mz.djmall.xmisp.cn/files/logo/20161207/148110444480.jpg"
          },
          {
            child_id: 3,
            name: '洁面乳',
            image: "http://mz.djmall.xmisp.cn/files/logo/20161208/148117973270.jpg"
          },
          {
            child_id: 4,
            name: '面部祛角质',
            image: "http://mz.djmall.xmisp.cn/files/logo/20161208/148117981591.jpg"
          }
        ]
      },
      {
        cate_id: 2,
        cate_name: "川菜",
        ishaveChild: true,
        children:
        [
          {
            child_id: 1,
            name: '气垫bb',
            image: "http://mz.djmall.xmisp.cn/files/logo/20161212/14815381301.jpg"
          },
          {
            child_id: 2,
            name: '修容/高光',
            image: "http://mz.djmall.xmisp.cn/files/logo/20161212/14815381411.jpg"
          },
          {
            child_id: 3,
            name: '遮瑕',
            image: "http://mz.djmall.xmisp.cn/files/logo/20161212/148153815181.jpg"
          },
          {
            child_id: 4,
            name: '腮红',
            image: "http://mz.djmall.xmisp.cn/files/logo/20161212/148153815759.jpg"
          },
          {
            child_id: 5,
            name: '粉饼',
            image: "http://mz.djmall.xmisp.cn/files/logo/20161212/148153816983.jpg"
          },
          {
            child_id: 6,
            name: '粉底',
            image: "http://mz.djmall.xmisp.cn/files/logo/20161212/148153817721.jpg"
          },
          {
            child_id: 7,
            name: '蜜粉/散粉',
            image: "http://mz.djmall.xmisp.cn/files/logo/20161212/148153819354.jpg"
          },
          {
            child_id: 8,
            name: '隔离霜',
            image: "http://mz.djmall.xmisp.cn/files/logo/20161215/148179053369.jpg"
          }
        ]
      },
      {
        cate_id: 3,
        cate_name: "粤菜",
        ishaveChild: true,
        children:
        [
          {
            child_id: 1,
            name: '淡香水EDT',
            image: "http://mz.djmall.xmisp.cn/files/logo/20161213/14815978910.jpg"
          },
          {
            child_id: 2,
            name: '浓香水EDP',
            image: "http://mz.djmall.xmisp.cn/files/logo/20161213/148159789883.jpg"
          },
          {
            child_id: 3,
            name: '香体走珠',
            image: "http://mz.djmall.xmisp.cn/files/logo/20161213/14815979307.jpg"
          },
          {
            child_id: 4,
            name: '古龙香水男士的最爱',
            image: "http://mz.djmall.xmisp.cn/files/logo/20161213/148159765589.jpg"
          }
        ]
      },
      {
        cate_id: 4,
        cate_name: "闽菜",
        ishaveChild: false,
        children: [
          {
            child_id: 1,
            name: '淡香水EDT',
            image: "http://mz.djmall.xmisp.cn/files/logo/20161213/14815978910.jpg"
          }
        ]
      },
      {
        cate_id: 5,
        cate_name: "苏菜",
        ishaveChild: false,
        children: [
          {
            child_id: 1,
            name: '淡香水EDT',
            image: "http://mz.djmall.xmisp.cn/files/logo/20161213/14815978910.jpg"
          }
        ]
      },
      {
        cate_id: 6,
        cate_name: "浙菜",
        ishaveChild: false,
        children: [
          {
            child_id: 1,
            name: '淡香水EDT',
            image: "http://mz.djmall.xmisp.cn/files/logo/20161213/14815978910.jpg"
          }
        ]
      },
      {
        cate_id: 7,
        cate_name: "湘菜",
        ishaveChild: false,
        children: [
          {
            child_id: 1,
            name: '淡香水EDT',
            image: "http://mz.djmall.xmisp.cn/files/logo/20161213/14815978910.jpg"
          }
        ]
      },
      {
        cate_id: 8,
        cate_name: "徽菜",
        ishaveChild: false,
        children: [
          {
            child_id: 1,
            name: '淡香水EDT',
            image: "http://mz.djmall.xmisp.cn/files/logo/20161213/14815978910.jpg"
          }
        ]
      },
    ],
    curNav: 1,
    curIndex: 0
  },

  onLoad: function (options) {
    var that = this;
    //获得分类筛选
      



    
  },
 
  navbarTap:function(e){
    var that = this;
    console.log(e);
    this.setData({
      currentTab: e.currentTarget.id,   //按钮CSS变化
      category: e.currentTarget.dataset.cate_id,
      scrollTop: 0,   //切换导航后，控制右侧滚动视图回到顶部
    })
    //刷新右侧内容的数据
    var cate_id = this.data.category;
    getRecipes({
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
    })
    

    
  },
})  