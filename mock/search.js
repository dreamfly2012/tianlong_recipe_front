// 搜索相关的 mock 数据

// 从 recipe.js 中导入食谱列表数据（实际项目中可能需要调整）
const recipeList = [
  {
    id: 1,
    title: '红烧肉',
    description: '经典家常菜，肥而不腻',
    image: 'https://example.com/recipes/hongshaorou.jpg',
    likes: 1024,
    views: 5678,
    tags: ['家常菜', '肉类', '红烧']
  },
  {
    id: 2,
    title: '西红柿炒鸡蛋',
    description: '简单美味的家常菜',
    image: 'https://example.com/recipes/fanqiejidan.jpg',
    likes: 2048,
    views: 9876,
    tags: ['家常菜', '快手菜', '素菜']
  },
  {
    id: 3,
    title: '水煮鱼',
    description: '麻辣鲜香的川菜代表',
    image: 'https://example.com/recipes/shuizhuyu.jpg',
    likes: 1536,
    views: 7654,
    tags: ['川菜', '辣', '鱼']
  },
  {
    id: 4,
    title: '糖醋排骨',
    description: '酸甜可口，老少皆宜',
    image: 'https://example.com/recipes/tangcupaigu.jpg',
    likes: 896,
    views: 4321,
    tags: ['家常菜', '肉类', '酸甜']
  },
  {
    id: 5,
    title: '宫保鸡丁',
    description: '经典川菜，香辣可口',
    image: 'https://example.com/recipes/gongbaojiding.jpg',
    likes: 1792,
    views: 8765,
    tags: ['川菜', '辣', '鸡肉']
  },
  {
    id: 6,
    title: '鱼香肉丝',
    description: '川菜经典，咸甜酸辣',
    image: 'https://example.com/recipes/yuxiangrousi.jpg',
    likes: 1350,
    views: 6543,
    tags: ['川菜', '肉类', '酸辣']
  },
  {
    id: 7,
    title: '清蒸鲈鱼',
    description: '鲜嫩可口的粤式蒸鱼',
    image: 'https://example.com/recipes/qingzhengluyu.jpg',
    likes: 980,
    views: 5432,
    tags: ['粤菜', '海鲜', '清蒸']
  },
  {
    id: 8,
    title: '麻婆豆腐',
    description: '麻辣鲜香的川菜名品',
    image: 'https://example.com/recipes/mapodoufu.jpg',
    likes: 1680,
    views: 7890,
    tags: ['川菜', '豆腐', '辣']
  }
];

// 热门搜索关键词
const hotSearches = [
  '红烧肉',
  '家常菜',
  '川菜',
  '快手菜',
  '早餐',
  '减脂餐',
  '鸡肉',
  '蛋糕'
];

// 搜索历史（实际应用中应该是用户特定的）
const searchHistory = [
  '红烧肉',
  '西红柿炒鸡蛋',
  '水煮鱼',
  '糖醋排骨'
];

// 搜索建议
const getSearchSuggestions = (keyword) => {
  if (!keyword) return [];
  
  const suggestions = [];
  
  // 基于食谱标题的建议
  recipeList.forEach(recipe => {
    if (recipe.title.includes(keyword)) {
      suggestions.push({
        type: 'recipe',
        id: recipe.id,
        title: recipe.title
      });
    }
  });
  
  // 基于标签的建议
  const allTags = new Set();
  recipeList.forEach(recipe => {
    recipe.tags.forEach(tag => {
      if (tag.includes(keyword)) {
        allTags.add(tag);
      }
    });
  });
  
  allTags.forEach(tag => {
    suggestions.push({
      type: 'tag',
      title: tag
    });
  });
  
  // 限制返回数量
  return suggestions.slice(0, 10);
};

// Mock API 响应数据
const mockData = {
  // 搜索食谱
  '/api/search': (options) => {
    const { keyword, page = 1, pageSize = 10 } = options.data || {};
    
    if (!keyword) {
      return {
        code: 1,
        msg: '搜索关键词不能为空',
        data: null
      };
    }
    
    // 根据关键词搜索食谱
    const results = recipeList.filter(recipe => {
      // 匹配标题
      if (recipe.title.includes(keyword)) return true;
      
      // 匹配描述
      if (recipe.description.includes(keyword)) return true;
      
      // 匹配标签
      if (recipe.tags.some(tag => tag.includes(keyword))) return true;
      
      return false;
    });
    
    // 分页处理
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedResults = results.slice(start, end);
    
    return {
      code: 0,
      msg: 'success',
      data: {
        list: paginatedResults,
        total: results.length,
        page,
        pageSize,
        keyword
      }
    };
  },
  
  // 获取热门搜索
  '/api/search/hot': () => {
    return {
      code: 0,
      msg: 'success',
      data: hotSearches
    };
  },
  
  // 获取搜索历史
  '/api/search/history': () => {
    return {
      code: 0,
      msg: 'success',
      data: searchHistory
    };
  },
  
  // 清除搜索历史
  '/api/search/history/clear': () => {
    // 实际应用中应该清除用户的搜索历史
    return {
      code: 0,
      msg: 'success',
      data: null
    };
  },
  
  // 获取搜索建议
  '/api/search/suggestions': (options) => {
    const { keyword } = options.data || {};
    
    return {
      code: 0,
      msg: 'success',
      data: getSearchSuggestions(keyword)
    };
  }
};

module.exports = mockData;