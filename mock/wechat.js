/**
 * 微信登录相关的 mock 数据
 */

const login = (req) => {
  console.log('Mock: 微信登录请求', req.body);
  
  // 模拟后端处理登录请求
  const { code, user_info } = req.body;
  
  // 检查必要参数
  if (!code) {
    console.log('Mock: 登录失败 - 缺少code参数');
    return {
      code: 400,
      msg: '参数错误: 缺少code',
      data: null
    };
  }
  
  // 模拟生成 token
  const token = 'mock_token_' + Math.random().toString(36).substring(2);
  
  // 模拟 openid
  const openid = 'mock_openid_' + Math.random().toString(36).substring(2);
  
  // 模拟用户信息
  let userInfo;
  
  if (user_info) {
    // 如果提供了用户信息，使用提供的信息
    userInfo = {
      id: 'user_' + Math.random().toString(36).substring(2),
      nickName: user_info.nickName,
      avatarUrl: user_info.avatarUrl,
      gender: user_info.gender || 0,
      openid: openid
    };
  } else {
    // 如果没有提供用户信息，使用默认信息
    userInfo = {
      id: 'user_' + Math.random().toString(36).substring(2),
      nickName: '天龙用户',
      avatarUrl: '/image/profile.png',
      gender: 0,
      openid: openid
    };
  }
  
  console.log('Mock: 登录成功', { token, userInfo });
  
  return {
    code: 0,
    msg: '登录成功',
    data: {
      token,
      userInfo
    }
  };
};

module.exports = {
  login
};