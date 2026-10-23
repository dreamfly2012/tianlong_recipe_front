# 菜谱卡片信息密度提升 — PRD

## 1. 背景与目标

**观察到的问题：**
当前菜谱卡片（首页「热门菜谱」区、分类列表页、搜索页）仅展示封面图 + 菜名，用户必须点击进入详情页才能判断烹饪时长、难度等关键决策信息。这导致用户在浏览列表时完全依赖猜测，增加了无效点击，也降低了决策效率。

**目标用户：**
正在找"今晚做什么"的普通用户——他们浏览菜谱的速度很快，需要在列表页快速筛选出不符合自己时间/厨艺要求的选项。

**产品决策：**
在卡片上补充 烹饪时长 + 难度 两个高价值字段，让用户在不进入详情页的前提下完成第一轮筛选。

**预期结果：**
用户在列表页获得足够信息做出点击决策，减少点进去发现"时间太长做不了"再退回的低效行为。

---

## 2. 范围

**最小完整流程：**
- 入口：首页热门菜谱、分类列表页、搜索结果页（三个位置复用同一卡片组件）
- P0 操作：浏览列表 → 看到信息更丰富的卡片 → 决定是否点击
- 完成证据：卡片上可见烹饪时长和难度标签
- 恢复路径：后端未返回该字段时，卡片降级只显示菜名（与现有行为一致，不中断流程）

**P1 支持（本次包含）：**
- 卡片底部区域增加标签展示（如"快手菜""家常菜"等菜系标签），后端有数据时展示，无数据时隐藏

**明确排除：**
- 不改动详情页布局
- 不涉及收藏逻辑变更
- 不涉及后端 API 改造（前端仅消费现有字段）

---

## 3. 核心流程与交互

```
用户滑动列表
    ↓
卡片展示：封面图 + 菜名 + 烹饪时长(如有) + 难度(如有) + 菜系标签(如有)
    ↓
用户判断是否符合需求
    ↓
点击卡片 → 跳转详情页（流程不变）
```

---

## 4. 功能需求

### FR-01：卡片布局重构

**用途：** 让卡片在保持原有美感的同时，容纳更多信息层级。

**布局结构：**

```
┌─────────────────────┐
│                     │
│      封面图片        │  (高度 230rpx，不变)
│                     │
├─────────────────────┤
│  菜名（最多2行）      │
│  ⏱ 15分钟  🔥 简单   │  ← 新增 meta 区
│  # 快手菜  # 川菜     │  ← 新增 tags 区（可选）
└─────────────────────┘
```

**字段规则：**

| 字段 | 来源 | 展示条件 | 展示格式 |
|------|------|----------|----------|
| 菜名 | `recipe.name` | 始终展示 | 最多 2 行，超出省略 |
| 烹饪时长 | `recipe.cookingTime` | 字段存在且有值 | `⏱ {cookingTime} 分钟` |
| 难度 | `recipe.difficulty` | 字段存在且有值 | `🔥 {difficulty}` |
| 菜系标签 | `recipe.tags` | 数组非空 | 每个 tag 一个胶囊标签 |

**卡片内部结构（新增）：**
- `.meta-row`：行内展示 cookingTime 和 difficulty，使用分隔线区分
- `.tag-row`：行内横向展示 tags，单行超出时换行（最多显示 3 个，超出省略）

---

### FR-02：数据字段映射与容错

**用途：** 确保新字段在所有场景下都能安全展示。

**处理规则：**

| 场景 | 行为 |
|------|------|
| `cookingTime` 和 `difficulty` 均为空 | meta 区整行隐藏（与现状一致，不展示空白区域） |
| 仅 cookingTime 有值 | 只显示烹饪时长，无分隔线 |
| 仅 difficulty 有值 | 只显示难度，无分隔线 |
| 两者都有值 | 正常展示，中间用竖线分隔 |
| `tags` 数组为空或不存在 | tags 区整行隐藏 |
| `tags` 有值但为空字符串 | 视为不存在，隐藏 tags 区 |

**数据来源说明：**
- 字段来自现有 `/api/recipe.lists` 接口返回值，前端复用 `normalizeRecipe()` 工具函数处理字段名不统一问题
- 若后端暂未下发 cookingTime/difficulty/tags 字段，前端不做降级请求，仅隐藏对应区域

---

### FR-03：UI 样式规范

**用途：** 与现有设计系统保持一致，避免风格割裂。

**样式规范：**

| 元素 | 样式规则 |
|------|----------|
| `.body`（卡片底部内容区） | padding 调整为 `16rpx 18rpx 18rpx`（底部增加 2rpx 给 meta 留空间） |
| `.name` | 最大高度由 2 行扩展为支持 2 行，增加 `margin-bottom: 8rpx` |
| `.meta-row` | 高度 36rpx，flex 横向排列，字体 22rpx，颜色 `var(--text-2)`，两项之间用 1rpx 灰色竖线分隔 |
| `.tag-row` | 高度 32rpx，flex 横向排列，overflow hidden；每个 tag 使用 `.tag` 全局样式类，最多显示 3 个 |
| `.tag-more` | 当 tags 超过 3 个时，第 4 个位置展示 `+N` 灰色文字 |

**颜色与间距约束：**
- meta 区文字颜色使用 `var(--text-2)`（次级文本色），与现有 `.meta` 类规范一致
- tags 区与 meta 区间距 6rpx
- 卡片总高度随内容自适应，不设固定高度上限

---

### FR-04：涉及页面范围

**用途：** 明确本次改动影响的代码位置，避免遗漏。

| 页面 | 文件 | 改动方式 |
|------|------|----------|
| 首页 | `pages/index/index.wxml` | 复用全局 `.recipe-card` 结构，扩展 `.body` 区域 |
| 分类列表 | `pages/list/index.wxml` | 复用全局 `.recipe-card` 结构，扩展 `.body` 区域 |
| 搜索页 | `pages/search/index.wxml` | 复用全局 `.recipe-card` 结构，扩展 `.body` 区域 |
| 个人中心收藏 | `pages/profile/index.wxml` | 复用全局 `.recipe-card` 结构，扩展 `.body` 区域 |

**注意：** 四个页面均引用同一套全局 `.recipe-card` 样式（定义在 `styles/theme.wxss`），因此只需修改一处全局样式 + 四处 WXML，无需新增组件。

---

## 5. 共享规则与边界条件

### 全局卡片样式规则（新增，放入 theme.wxss）

```
.recipe-card .body {
  padding: 16rpx 18rpx 18rpx;
}
.recipe-card .meta {
  display: flex;
  align-items: center;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: var(--text-2);
  height: 36rpx;
}
.recipe-card .meta-item {
  display: inline-flex;
  align-items: center;
}
.recipe-card .meta-sep {
  width: 1rpx;
  height: 20rpx;
  background: var(--border);
  margin: 0 12rpx;
  flex-shrink: 0;
}
.recipe-card .tags {
  display: flex;
  flex-wrap: nowrap;
  overflow: hidden;
  height: 32rpx;
  align-items: center;
  margin-top: 6rpx;
}
.recipe-card .tags .tag-more {
  font-size: 22rpx;
  color: var(--text-2);
  margin-left: 4rpx;
}
```

### 空状态规则
- 若 recipe 对象无任何扩展字段（cookingTime、difficulty、tags 均为空），卡片渲染结果与改动前完全一致，不影响任何现有布局。

### 图片加载失败
- 图片加载失败时仍显示灰色占位（现有行为不变），新增 meta/tags 区域正常展示。

---

## 6. 开放问题

| 问题 | 影响 | 建议假设 |
|------|------|----------|
| 后端 recipe.list 接口是否已下发 cookingTime / difficulty / tags 字段？ | 影响前端能否展示数据 | [Assumption, TBD] 假设后端已下发，前端按字段存在性容错处理 |
| 是否需要支持自定义排序（按时间/难度）？ | 影响列表页是否增加排序控件 | 本次不实现，留作 P2 |
| 卡片高度是否需要固定以避免列表错落？ | 影响视觉对齐 | [Assumption, TBD] 采用自适应高度，列表以卡片顶部对齐，底部错落可接受 |
