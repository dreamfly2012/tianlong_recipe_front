/**
 * 环境配置管理模块
 */

// 环境配置存储
let envConfig = {
  env: 'trail', // 默认为开发环境
  baseUrl: 'https://recipe.80shihua.com/api/', // API 基础 URL
  useMock: false, // 是否使用 mock 数据
};

/**
 * 初始化环境配置
 * @param {Object} options - 配置选项
 * @param {string} options.env - 环境名称，如 'develop', 'trial', 'release'
 * @param {Object} options.config - 各环境的配置对象
 */
const initEnv = (options) => {
  const { env, config } = options;
  
  // 设置当前环境
  envConfig.env = env;
  
  // 如果存在对应环境的配置，则应用该配置
  if (config && config[env]) {
    envConfig = {
      ...envConfig,
      ...config[env],
      env
    };
  }
  
  console.log('[Env] 环境配置初始化完成:', envConfig);
};

/**
 * 获取当前环境配置
 * @returns {Object} 当前环境配置
 */
const getEnvConfig = () => {
  return { ...envConfig };
};

/**
 * 更新环境配置
 * @param {Object} newConfig - 新的配置项
 */
const updateEnvConfig = (newConfig) => {
  envConfig = {
    ...envConfig,
    ...newConfig
  };
  console.log('[Env] 环境配置已更新:', envConfig);
};

/**
 * 判断当前是否为开发环境
 * @returns {boolean} 是否为开发环境
 */
const isDev = () => {
  return envConfig.env === 'develop';
};

/**
 * 判断当前是否为生产环境
 * @returns {boolean} 是否为生产环境
 */
const isProd = () => {
  return envConfig.env === 'release';
};

module.exports = {
  initEnv,
  getEnvConfig,
  updateEnvConfig,
  isDev,
  isProd
};