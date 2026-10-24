// AI 相关的 mock 数据
const dailyRecipes= [{
  id: 1,
  name: '西班牙海鲜饭',
  image: '/mock/images/paella.jpeg',
  description: '西班牙美食'
},{
  id: 2,
  name: '清炒小白菜',
  image: '/mock/images/qingchaoxiaobaicai.jpeg',
  description: '营养健康的素菜'
}, {
  id: 3,
  name: '西班牙海鲜饭2',
  image: '/mock/images/paella.jpeg',
  description: '西班牙美食'
},{
  id:4,
  name: '红烧排骨',
  image: '/mock/images/hongshaopaigu.jpg',
  description: '美味可口的红烧排骨'
},{
  id: 5,
  name: '西班牙海鲜饭3',
  image: '/mock/images/paella.jpeg',
  description: '西班牙美食'
}];


const personalizedRecipes= [{
  id: 1,
  name: '糖醋里脊',
  image: '/mock/images/tangculiji.webp',
  description: '外酥里嫩，酸甜可口'
}, {
  id: 2,
  name: '水煮鱼',
  image: '/mock/images/hongshaopaigu.jpg',
  description: '麻辣鲜香的川菜代表'
}, {
  id: 3,
  name: '蒜蓉炒菜心',
  image: '/mock/images/suanrongchaocaixin.jpeg',
  description: '清淡爽口的快手菜'
}]



//图片采用绝对地址/开头
// 专属食谱示例
const aiGeneratedRecipes = [
  {
    id: 101,
    title: '香煎三文鱼配芦笋',
    description: '根据您的喜好搭配的健康低脂食谱',
    image: '/mock/images/xiangijansanwenyulusun.jpg',
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
    tags: ['海鲜', '低脂', '精选']
  },
  {
    id: 102,
    title: '藜麦蔬菜沙拉',
    description: '营养均衡素食料理',
    image: '/mock/images/limaishala.jpg',
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
    tags: ['素食', '沙拉', '健康', '轻食']
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
  // 每日推荐菜谱
  '/api/ai/daily-recommend': () => {
    return {
      code: 0,
      msg: 'success',
      data: dailyRecipes
    };
  },
  // 个性化推荐
  '/api/ai/personalized-recommend': () => {
    return {
      code: 0,
      msg: 'success',
      data: personalizedRecipes
    };
  },
  
  // 专属食谱
  '/api/ai/generate-recipe': (options) => {
    const { ingredients = [], preferences = [], excludes = [] } = options.data || {};
    
    // 随机选择一个预设的食谱
    const randomIndex = Math.floor(Math.random() * aiGeneratedRecipes.length);
    const recipe = { ...aiGeneratedRecipes[randomIndex] };
    
    // 添加一些根据用户输入的定制信息
    if (ingredients.length > 0) {
      recipe.description = `基于${ingredients.join('、')}搭配的食谱`;
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
    
    // 搭配膳食计划
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