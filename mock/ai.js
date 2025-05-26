// AI 相关的 mock 数据

// AI 生成的食谱示例
const aiGeneratedRecipes = [
  {
    id: 101,
    title: '香煎三文鱼配芦笋',
    description: 'AI 根据您的喜好生成的健康低脂食谱',
    image: 'https://example.com/ai-recipes/salmon.jpg',
    ingredients: ['三文鱼', '芦笋', '橄榄油', '柠檬', '盐', '黑胡椒'],
    steps: [
      '三文鱼洗净，用厨房纸吸干水分',
      '撒上盐和黑胡椒调味',
      '热锅倒入橄榄油，中火煎制三文鱼',
      '每面煎3-4分钟至金黄色',
      '同时烫煮芦笋2分钟',
      '装盘后挤上柠檬汁'
    ],
    cookingTime: 15,
    difficulty: '简单',
    tags: ['海鲜', '低脂', 'AI生成'],
    likes: 456,
    views: 1234
  },
  {
    id: 102,
    title: '藜麦蔬菜沙拉',
    description: 'AI 推荐的营养均衡素食料理',
    image: 'https://example.com/ai-recipes/quinoa-salad.jpg',
    ingredients: ['藜麦', '黄瓜', '番茄', '鳄梨', '柠檬汁', '橄榄油', '盐'],
    steps: [
      '藜麦煮熟，冷却',
      '黄瓜、番茄切丁，鳄梨切片',
      '混合所有食材',
      '调制柠檬汁和橄榄油的酱汁',
      '淋在沙拉上即可'
    ],
    cookingTime: 20,
    difficulty: '简单',
    tags: ['素食', '沙拉', '健康', 'AI生成'],
    likes: 345,
    views: 987
  }
];

// AI 食材推荐
const aiIngredientRecommendations = {
  '鸡胸肉': ['西兰花', '胡萝卜', '洋葱', '蒜', '姜', '酱油'],
  '牛肉': ['土豆', '胡萝卜', '洋葱', '番茄', '红酒', '迷迭香'],
  '三文鱼': ['柠檬', '芦笋', '土豆', '茴香', '橄榄油', '黑胡椒'],
  '豆腐': ['葱', '姜', '蒜', '辣椒', '豆瓣酱', '花椒']
};

// Mock API 响应数据
const mockData = {
  // AI 生成食谱
  '/api/ai/generate-recipe': (options) => {
    const { ingredients = [], preferences = [], excludes = [] } = options.data || {};
    
    // 模拟 AI 生成过程，随机选择一个预设的食谱
    const randomIndex = Math.floor(Math.random() * aiGeneratedRecipes.length);
    const recipe = { ...aiGeneratedRecipes[randomIndex] };
    
    // 添加一些根据用户输入的定制信息
    if (ingredients.length > 0) {
      recipe.description = `基于${ingredients.join('、')}生成的食谱`;
    }
    
    if (preferences.length > 0) {
      recipe.tags = [...recipe.tags, ...preferences];
    }
    
    return {
      code: 0,
      msg: 'success',
      data: recipe
    };
  },

  // AI 食材推荐
  '/api/ai/recommend-ingredients': (options) => {
    const { mainIngredient = '' } = options.data || {};
    
    let recommendations = [];
    if (aiIngredientRecommendations[mainIngredient]) {
      recommendations = aiIngredientRecommendations[mainIngredient];
    } else {
      // 如果没有特定推荐，返回一些通用食材
      recommendations = ['洋葱', '大蒜', '胡萝卜', '西红柿', '橄榄油', '盐', '黑胡椒'];
    }
    
    return {
      code: 0,
      msg: 'success',
      data: {
        mainIngredient,
        recommendations
      }
    };
  },

  // AI 膳食计划
  '/api/ai/meal-plan': (options) => {
    const { days = 3, preferences = [], excludes = [] } = options.data || {};
    
    // 生成膳食计划
    const mealPlan = [];
    for (let i = 0; i < days; i++) {
      mealPlan.push({
        day: i + 1,
        breakfast: {
          title: `第${i + 1}天早餐`,
          description: '营养均衡的早餐',
          image: `https://example.com/ai-meal-plan/day${i + 1}-breakfast.jpg`
        },
        lunch: {
          title: `第${i + 1}天午餐`,
          description: '能量充沛的午餐',
          image: `https://example.com/ai-meal-plan/day${i + 1}-lunch.jpg`
        },
        dinner: {
          title: `第${i + 1}天晚餐`,
          description: '健康轻盈的晚餐',
          image: `https://example.com/ai-meal-plan/day${i + 1}-dinner.jpg`
        }
      });
    }
    
    return {
      code: 0,
      msg: 'success',
      data: {
        plan: mealPlan,
        preferences,
        excludes
      }
    };
  }
};

module.exports = mockData;