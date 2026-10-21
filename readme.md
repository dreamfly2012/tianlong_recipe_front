# 天龙菜谱

立志成为最全最靠谱的中华菜谱

微信小程序（原生 WXML/WXSS/JS）实现，覆盖首页、分类、列表、搜索、详情、AI 推荐与个人中心等功能。

## 功能概览

- 首页热门菜谱 + 分类快捷入口
- 多级分类浏览（支持语音搜索）
- 列表 / 搜索 / 收藏
- 菜谱详情（食材清单 + 做法步骤 + 收藏）
- AI 智能菜单规划（今日推荐 + 个性化推荐 + 自定义生成）
- 个人中心（微信一键登录、我的收藏、设置）

## 示例截图

|  |  |  |
|:-:|:-:|:-:|
| ![首页](docs/1.jpg) | ![详情](docs/2.png) | ![AI 推荐](docs/3.png) |

- `docs/1.jpg` —— 首页效果
- `docs/2.png` —— 菜谱详情
- `docs/3.png` —— AI 智能助手

## 目录结构

```
├── api/        接口封装（菜谱 / 分类 / 搜索 / AI / 账户 / 微信登录）
├── config/     环境配置（baseUrl 等）
├── image/      静态图标
├── mock/       Mock 数据（独立开发测试用）
├── pages/      各页面（index / category / list / search / info / ai / profile / settings / logs）
├── styles/     全局样式（主题、设计变量）
├── utils/      工具（请求封装、图片地址规整、鉴权）
└── app.js / app.json / app.wxss
```

## 运行

使用微信开发者工具导入本项目即可预览。接口地址在 `config/env.js` 中配置，`useMock: true` 可启用 mock 数据离线开发。
