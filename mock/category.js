// 分类相关的 mock 数据

// 主分类数据
const categories = [
  {
    id: 1,
    name: '家常菜',
    icon: 'https://example.com/icons/home-cooking.png',
    description: '简单易做的家常美味',
    count: 150
  },
  {
    id: 2,
    name: '川菜',
    icon: 'https://example.com/icons/sichuan.png',
    description: '麻辣鲜香的川味美食',
    count: 89
  },
  {
    id: 3,
    name: '粤菜',
    icon: 'https://example.com/icons/cantonese.png',
    description: '清淡鲜美的粤式料理',
    count: 76
  },
  {
    id: 4,
    name: '快手菜',
    icon: 'https://example.com/icons/quick.png',
    description: '10分钟快速上菜',
    count: 120
  },
  {
    id: 5,
    name: '素菜',
    icon: 'https://example.com/icons/vegetarian.png',
    description: '健康美味的素食料理',
    count: 95
  },
  {
    id: 6,
    name: '早餐',
    icon: 'https://example.com/icons/breakfast.png',
    description: '美味营养的早餐食谱',
    count: 68
  }
];

// 标签数据
const tags = [
  { id: 1, name: '家常菜', count: 150 },
  { id: 2, name: '快手菜', count: 120 },
  { id: 3, name: '下饭菜', count: 98 },
  { id: 4, name: '素菜', count: 95 },
  { id: 5, name: '川菜', count: 89 },
  { id: 6, name: '粤菜', count: 76 },
  { id: 7, name: '早餐', count: 68 },
  { id: 8, name: '午餐', count: 82 },
  { id: 9, name: '晚餐', count: 79 },
  { id: 10, name: '汤', count: 45 },
  { id: 11, name: '小吃', count: 67 },
  { id: 12, name: '烘焙', count: 38 },
  { id: 13, name: '凉菜', count: 42 },
  { id: 14, name: '热菜', count: 128 },
  { id: 15, name: '主食', count: 56 }
];

// 食材分类
const ingredients = [
  {
    id: 1,
    name: '肉类',
    items: [
      { id: 101, name: '猪肉', count: 45 },
      { id: 102, name: '牛肉', count: 32 },
      { id: 103, name: '鸡肉', count: 38 },
      { id: 104, name: '羊肉', count: 15 }
    ]
  },
  {
    id: 2,
    name: '蔬菜',
    items: [
      { id: 201, name: '青菜', count: 56 },
      { id: 202, name: '茄子', count: 23 },
      { id: 203, name: '土豆', count: 34 },
      { id: 204, name: '胡萝卜', count: 28 }
    ]
  },
  {
    id: 3,
    name: '海鲜',
    items: [
      { id: 301, name: '鱼', count: 42 },
      { id: 302, name: '虾', count: 29 },
      { id: 303, name: '蟹', count: 12 },
      { id: 304, name: '贝类', count: 18 }
    ]
  }
];

// Mock API 响应数据
const mockData = {
  // 获取所有分类
  '/api/categories': () => {
    return {
      code: 0,
      msg: 'success',
      data: categories
    };
  },

  // 获取分类详情
  '/api/category/detail': (options) => {
    const { id } = options.data || {};
    const category = categories.find(c => c.id === id);
    
    if (!category) {
      return {
        code: 1,
        msg: '分类不存在',
        data: null
      };
    }
    
    return {
      code: 0,
      msg: 'success',
      data: category
    };
  },

  // 获取所有标签
  '/api/tags': () => {
    return {
      code: 0,
      msg: 'success',
      data: tags
    };
  },

  // 获取食材分类
  '/api/ingredients/categories': () => {
    return {
      code: 0,
      msg: 'success',
      data: ingredients
    };
  },

  // 获取热门分类
  '/api/categories/popular': () => {
    // 按食谱数量排序，取前4个
    const popular = [...categories]
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
    
    return {
      code: 0,
      msg: 'success',
      data: popular
    };
  },

  // 获取热门标签
  '/api/tags/popular': () => {
    // 按食谱数量排序，取前10个
    const popular = [...tags]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    return {
      code: 0,
      msg: 'success',
      data: popular
    };
  }
};

module.exports = mockData;