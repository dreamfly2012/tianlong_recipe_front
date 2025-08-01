

// Mock API 响应数据
const mockData = {
  // 获取收藏的菜谱
  '/api/recipe.favourites': (data) => {
    const page = data.data.page
    console.log("📦 mock 函数被触发，页数为:", page);
    // 从本地存储获取收藏列表
    const favorites = wx.getStorageSync('favorites') || []
    
    // 模拟分页，每页10条数据
    const pageSize = 10
    const start = (page - 1) * pageSize
    const end = start + pageSize
    console.log(start,end)
    const currentPageFavorites = favorites.slice(start, end)
    
    return {
      code: 0,
      msg: 'success',
      data: currentPageFavorites
    };
  },
  
  // 获取用户信息
  '/api/account/info': (req) => {
    // 从本地存储获取用户信息
    const userInfo = wx.getStorageSync('userInfo') || null;
    
    if (!userInfo) {
      return {
        code: 401,
        msg: '未登录',
        data: null
      };
    }
    
    return {
      code: 0,
      msg: 'success',
      data: {
        ...userInfo,
        id: 'user_' + Math.random().toString(36).substring(2),
        createdAt: new Date().toISOString()
      }
    };
  },
  
  // 更新用户信息
  '/api/account/info': (req) => {
    if (req.method === 'PUT') {
      const userInfo = wx.getStorageSync('userInfo') || {};
      const newUserInfo = {
        ...userInfo,
        ...req.data
      };
      
      // 更新本地存储
      wx.setStorageSync('userInfo', newUserInfo);
      
      return {
        code: 0,
        msg: '更新成功',
        data: newUserInfo
      };
    }
  },
  
  // 添加菜谱到收藏
  '/api/account/favorites': (req) => {
    if (req.method === 'POST') {
      const { recipeId } = req.data;
      const favorites = wx.getStorageSync('favorites') || [];
      
      // 检查是否已经收藏
      const isExist = favorites.some(item => item.id === recipeId);
      if (isExist) {
        return {
          code: 400,
          msg: '已经收藏过该菜谱',
          data: null
        };
      }
      
      // 模拟获取菜谱详情
      const recipe = {
        id: recipeId,
        name: '模拟菜谱 ' + recipeId,
        description: '这是一个模拟的菜谱描述',
        image: '/mock/images/10001.jpg'
      };
      
      // 添加到收藏
      favorites.push(recipe);
      wx.setStorageSync('favorites', favorites);
      
      return {
        code: 0,
        msg: '收藏成功',
        data: recipe
      };
    }
  },
  
  // 从收藏中移除菜谱
  '/api/account/favorites/{id}': (req) => {
    if (req.method === 'DELETE') {
      const recipeId = req.url.split('/').pop();
      const favorites = wx.getStorageSync('favorites') || [];
      
      // 移除收藏
      const newFavorites = favorites.filter(item => item.id !== recipeId);
      wx.setStorageSync('favorites', newFavorites);
      
      return {
        code: 0,
        msg: '取消收藏成功',
        data: null
      };
    }
  }
};

module.exports = mockData;