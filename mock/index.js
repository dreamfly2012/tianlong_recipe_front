/**
 * Mock 数据管理模块
 */

// 导入各个模块的 mock 数据
const recipeMock = require('./recipe');
const categoryMock = require('./category');
const searchMock = require('./search');
const aiMock = require('./ai');

// 合并所有 mock 数据
const mockDataMap = {
  ...recipeMock,
  ...categoryMock,
  ...searchMock,
  ...aiMock,
};

/**
 * 获取指定 URL 的 mock 数据
 * @param {string} url - 请求 URL
 * @param {Object} options - 请求选项
 * @param {Object} options.data - 请求数据
 * @param {string} options.method - 请求方法
 * @returns {Object|null} mock 数据或 null（如果没有找到）
 */
const getMockData = (url, options = {}) => {
  // 移除 URL 中的查询参数
  const baseUrl = url.split('?')[0];
  
  // 查找对应的 mock 处理函数
  const mockHandler = mockDataMap[baseUrl];
  
  if (typeof mockHandler === 'function') {
    // 如果是函数，调用函数获取 mock 数据
    return mockHandler(options);
  } else if (mockHandler) {
    // 如果是对象，直接返回
    return mockHandler;
  }
  
  // 没有找到对应的 mock 数据
  return null;
};

/**
 * 注册新的 mock 数据
 * @param {string} url - 请求 URL
 * @param {Function|Object} handler - mock 数据处理函数或对象
 */
const registerMock = (url, handler) => {
  mockDataMap[url] = handler;
  console.log(`[Mock] 注册 mock 数据: ${url}`);
};

module.exports = {
  getMockData,
  registerMock,
  mockDataMap
};