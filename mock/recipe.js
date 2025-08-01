// 食谱相关的 mock 数据

// 食谱列表数据
const recipeList = [
  {
    id: 1,
    title: '红烧肉',
    description: '经典家常菜，肥而不腻',
    image: '/mock/images/10001.jpg',
    likes: 1024,
    views: 5678,
    tags: ['家常菜', '肉类', '红烧']
  },
  {
    id: 2,
    title: '西红柿炒鸡蛋',
    description: '简单美味的家常菜',
    image: '/mock/images/10002.jpeg',
    likes: 2048,
    views: 9876,
    tags: ['家常菜', '快手菜', '素菜']
  },
  {
    id: 3,
    title: '水煮鱼',
    description: '麻辣鲜香的川菜代表',
    image: '/mock/images/10003.jpeg',
    likes: 1536,
    views: 7654,
    tags: ['川菜', '辣', '鱼']
  },
  {
    id: 4,
    title: '糖醋排骨',
    description: '酸甜可口，老少皆宜',
    image: '/mock/images/10004.jpeg',
    likes: 896,
    views: 4321,
    tags: ['家常菜', '肉类', '酸甜']
  },
  {
    id: 5,
    title: '宫保鸡丁',
    description: '经典川菜，香辣可口',
    image: '/mock/images/10005.jpeg',
    likes: 1792,
    views: 8765,
    tags: ['川菜', '辣', '鸡肉']
  }
];

// 食谱详情数据
const recipeDetails = {
  1: {
    id: 1,
    title: '红烧肉',
    description: '经典家常菜，肥而不腻',
    image: '/mock/images/10001.jpg',
    ingredients: [
      { name: '五花肉', qty: '500g' },
      { name: '生姜', qty: '3片' },
      { name: '大葱', qty: '2段' },
      { name: '料酒', qty: '2勺' },
      { name: '生抽', qty: '3勺' },
      { name: '老抽', qty: '1勺' },
      { name: '冰糖', qty: '适量' }
    ],
    directions: [
      { step: 1, description: '五花肉切成大块，冷水下锅焯水，去除血水和杂质' },
      { step: 2, description: '锅中放入少量油，加入冰糖小火炒至融化呈棕色' },
      { step: 3, description: '放入焯好的五花肉翻炒上色' },
      { step: 4, description: '加入姜片、葱段、料酒、生抽、老抽' },
      { step: 5, description: '加入没过肉的热水，大火烧开后转小火慢炖1小时' },
      { step: 6, description: '最后大火收汁，使肉块裹上亮亮的酱汁即可' }
    ],
    cookingTime: 90,
    difficulty: '中等',
    tags: ['家常菜', '肉类', '红烧'],
    likes: 1024,
    views: 5678,
    comments: [
      { user: '美食爱好者', content: '做出来很好吃，全家都喜欢！', time: '2023-05-15' },
      { user: '厨房新手', content: '步骤清晰，一次就成功了', time: '2023-05-10' }
    ]
  },
  2: {
    id: 2,
    title: '西红柿炒鸡蛋',
    description: '简单美味的家常菜',
    image: '/mock/images/10002.jpeg',
    ingredients: [
      { name: '西红柿', qty: '2个' },
      { name: '鸡蛋', qty: '3个' },
      { name: '葱', qty: '适量' },
      { name: '盐', qty: '适量' },
      { name: '糖', qty: '少许' },
      { name: '食用油', qty: '适量' }
    ],
    directions: [
      { step: 1, description: '西红柿洗净切块，葱切段' },
      { step: 2, description: '鸡蛋打散，加少许盐调味' },
      { step: 3, description: '热锅倒油，倒入蛋液炒至金黄盛出' },
      { step: 4, description: '锅中再加少量油，放入西红柿翻炒出汁' },
      { step: 5, description: '加入盐和糖调味' },
      { step: 6, description: '倒入炒好的鸡蛋，翻炒均匀即可' }
    ],
    cookingTime: 15,
    difficulty: '简单',
    tags: ['家常菜', '快手菜', '素菜'],
    likes: 2048,
    views: 9876,
    comments: [
      { user: '懒人厨房', content: '真的很简单，味道还不错', time: '2023-06-01' },
      { user: '小白学做饭', content: '第一次做就成功了，谢谢分享', time: '2023-05-28' }
    ]
  },
  3: {
    id: 3,
    title: '鸡翅',
    description: '巨好吃的美食',
    image: '/mock/images/10003.jpeg',
    ingredients: [
      { name: '西红柿', qty: '2个' },
      { name: '鸡蛋', qty: '3个' },
      { name: '葱', qty: '适量' },
      { name: '盐', qty: '适量' },
      { name: '糖', qty: '少许' },
      { name: '食用油', qty: '适量' }
    ],
    directions: [
      { step: 1, description: '西红柿洗净切块，葱切段' },
      { step: 2, description: '鸡蛋打散，加少许盐调味' },
      { step: 3, description: '热锅倒油，倒入蛋液炒至金黄盛出' },
      { step: 4, description: '锅中再加少量油，放入西红柿翻炒出汁' },
      { step: 5, description: '加入盐和糖调味' },
      { step: 6, description: '倒入炒好的鸡蛋，翻炒均匀即可' }
    ],
    cookingTime: 15,
    difficulty: '简单',
    tags: ['家常菜', '快手菜', '素菜'],
    likes: 2048,
    views: 9876,
    comments: [
      { user: '懒人厨房', content: '真的很简单，味道还不错', time: '2023-06-01' },
      { user: '小白学做饭', content: '第一次做就成功了，谢谢分享', time: '2023-05-28' }
    ]
  },
  4: {
    id: 4,
    title: '西红柿炒鸡蛋',
    description: '简单美味的家常菜',
    image: '/mock/images/10004.jpeg',
    ingredients: [
      { name: '西红柿', qty: '2个' },
      { name: '鸡蛋', qty: '3个' },
      { name: '葱', qty: '适量' },
      { name: '盐', qty: '适量' },
      { name: '糖', qty: '少许' },
      { name: '食用油', qty: '适量' }
    ],
    directions: [
      { step: 1, description: '西红柿洗净切块，葱切段' },
      { step: 2, description: '鸡蛋打散，加少许盐调味' },
      { step: 3, description: '热锅倒油，倒入蛋液炒至金黄盛出' },
      { step: 4, description: '锅中再加少量油，放入西红柿翻炒出汁' },
      { step: 5, description: '加入盐和糖调味' },
      { step: 6, description: '倒入炒好的鸡蛋，翻炒均匀即可' }
    ],
    cookingTime: 15,
    difficulty: '简单',
    tags: ['家常菜', '快手菜', '素菜'],
    likes: 2048,
    views: 9876,
    comments: [
      { user: '懒人厨房', content: '真的很简单，味道还不错', time: '2023-06-01' },
      { user: '小白学做饭', content: '第一次做就成功了，谢谢分享', time: '2023-05-28' }
    ]
  },
  5: {
    id: 5,
    title: '西红柿炒鸡蛋',
    description: '简单美味的家常菜',
    image: '/mock/images/10005.jpeg',
    ingredients: [
      { name: '西红柿', qty: '2个' },
      { name: '鸡蛋', qty: '3个' },
      { name: '葱', qty: '适量' },
      { name: '盐', qty: '适量' },
      { name: '糖', qty: '少许' },
      { name: '食用油', qty: '适量' }
    ],
    directions: [
      { step: 1, description: '西红柿洗净切块，葱切段' },
      { step: 2, description: '鸡蛋打散，加少许盐调味' },
      { step: 3, description: '热锅倒油，倒入蛋液炒至金黄盛出' },
      { step: 4, description: '锅中再加少量油，放入西红柿翻炒出汁' },
      { step: 5, description: '加入盐和糖调味' },
      { step: 6, description: '倒入炒好的鸡蛋，翻炒均匀即可' }
    ],
    cookingTime: 15,
    difficulty: '简单',
    tags: ['家常菜', '快手菜', '素菜'],
    likes: 2048,
    views: 9876,
    comments: [
      { user: '懒人厨房', content: '真的很简单，味道还不错', time: '2023-06-01' },
      { user: '小白学做饭', content: '第一次做就成功了，谢谢分享', time: '2023-05-28' }
    ]
  }
  // 其他食谱详情可以按需添加
};

// Mock API 响应数据
const mockData = {
  // 获取食谱列表
  '/api/recipes': (options) => {
    const { page = 1, pageSize = 10, category, tag } = options.data || {};
    
    let filteredRecipes = [...recipeList];
    
    // 根据分类筛选
    if (category) {
      filteredRecipes = filteredRecipes.filter(recipe => 
        recipe.tags.some(t => t.toLowerCase() === category.toLowerCase())
      );
    }
    
    // 根据标签筛选
    if (tag) {
      filteredRecipes = filteredRecipes.filter(recipe => 
        recipe.tags.some(t => t.toLowerCase() === tag.toLowerCase())
      );
    }
    
    // 分页处理
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedRecipes = filteredRecipes.slice(start, end);
    
    return {
      code: 0,
      msg: 'success',
      data: {
        list: paginatedRecipes,
        total: filteredRecipes.length,
        page,
        pageSize
      }
    };
  },
  
  // 获取食谱详情
  '/api/recipe/detail': (options) => {
    console.log("options",options)
    const { id } = options.data || {};
    
    if (!id || !recipeDetails[id]) {
      return {
        code: 1,
        msg: '食谱不存在',
        data: null
      };
    }
    
    return {
      code: 0,
      msg: 'success',
      data: recipeDetails[id]
    };
  },
  
  // 获取推荐食谱
  '/api/recipes/recommended': () => {
    // 随机选择3个食谱作为推荐
    const shuffled = [...recipeList].sort(() => 0.5 - Math.random());
    const recommended = shuffled.slice(0, 3);
    
    return {
      code: 0,
      msg: 'success',
      data: recommended
    };
  },
  
  // 获取热门食谱
  '/api/recipes/popular': () => {
    // 按点赞数排序，取前5个
    const popular = [...recipeList].sort((a, b) => b.likes - a.likes).slice(0, 5);
    
    return {
      code: 0,
      msg: 'success',
      data: popular
    };
  }
};

module.exports = mockData;