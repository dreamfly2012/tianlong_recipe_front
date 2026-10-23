# 搜索体验增强 — 后端接口需求

> 对应前端 PRD：[prd-search-experience.md](./prd-search-experience.md)
> 现状：前端已可独立工作（热门词暂用 `/api/recipe.lists`、联想暂用 `/api/recipe.search`）。下面两个接口用于替换现有"借用"方案，接口就绪后前端只需切换数据源，交互不用改。
> 搜索历史为本地缓存，**不需要后端接口**。

---

## 通用约定

- Base URL：`https://recipe.80shihua.com`
- 协议：HTTPS + JSON（UTF-8）
- 鉴权：两个接口均为公开接口，**不需要 token**
- 成功：`{"code": 0, "message": "success", "data": ...}`
- 业务失败：`{"code": 非0, "message": "错误说明", "data": null}`
- 数据范围：只返回已发布/上架的菜谱
- 空结果不是错误：返回 `code: 0` + `data: []`

---

## 接口一：热门搜索词

### 基本信息

| 项目 | 内容 |
|------|------|
| 方法 | `GET` |
| 路径 | `/api/recipe.hotSearch` |
| 用途 | 搜索页冷启动展示"热门搜索"，点击直接搜索 |
| 鉴权 | 无 |

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `limit` | int | 否 | 返回条数，默认 8，范围 1～20 |

### 响应示例

```json
{
  "code": 0,
  "message": "success",
  "data": [
    "红烧肉",
    "宫保鸡丁",
    "鱼香肉丝",
    "水煮鱼",
    "西红柿炒鸡蛋",
    "清蒸鲈鱼",
    "排骨",
    "牛肉"
  ]
}
```

### 字段与规则

- `data` 必须是**字符串数组**（前端直接渲染为胶囊词），不要包一层对象/paginator。
- 顺序即展示顺序（热度从高到低）；前端会给前 3 个词加序号。
- 去重、去空，长度不超过 `limit`。
- **每个热门词必须能被 `/api/recipe.search?name=该词` 搜到结果**。当前搜索接口按菜名匹配，因此热门词应为真实存在的菜名；不要下发"川菜""快手菜""早餐"这类标签词（实测搜索结果为 0）。
- 关键词长度建议 ≤ 20 字，避免胶囊溢出。
- 无数据时返回 `data: []`，前端会自动降级为内置词库。

### 数据来源建议

二选一，按后端现状决定：

1. **有搜索日志时（推荐）**：取最近 7 天搜索次数 Top N 的关键词，过滤掉搜索结果为 0 的词；
2. **没有搜索日志时**：取浏览量/收藏量最高的 N 个已发布菜谱的名称。

### 缓存建议

结果与用户无关，可整段缓存 10～30 分钟，避免每次进搜索页都查库。

---

## 接口二：搜索联想（Autocomplete）

### 基本信息

| 项目 | 内容 |
|------|------|
| 方法 | `GET` |
| 路径 | `/api/recipe.suggest` |
| 用途 | 用户输入部分菜名时，实时补全候选菜名 |
| 鉴权 | 无 |

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `keyword` | string | 是 | 用户已输入内容，前端已 `trim`，长度 1～30 |
| `limit` | int | 否 | 返回条数，默认 8，范围 1～20 |

### 响应示例

```json
{
  "code": 0,
  "message": "success",
  "data": [
    { "name": "宫保鸡丁" },
    { "name": "宫保虾球" }
  ]
}
```

### 字段与规则

- `data` 直接是数组，**不要分页包装**；每项至少包含 `name`（前端按 `item.name` 读取）。
- 只返回已发布菜谱，按菜名模糊匹配（`LIKE %keyword%`）。
- 排序：**前缀匹配优先**，其次包含匹配；同组内按浏览量/热度降序。
- 去重（同名菜谱只保留一条）、去空，最多 `limit` 条。
- `keyword` 为空或只有空格时返回 `data: []`，`code: 0`，不报错。
- 对 `LIKE` 中的 `%`、`_` 做转义，避免用户输入通配符导致全表结果。
- 不要返回完整菜谱对象（不要图片、步骤等），保持响应轻量。
- 性能目标：单次响应 < 200ms；可按 `keyword` 维度缓存 1～5 分钟。

### 实现参考（Laravel）

```php
$keyword = trim($request->input('keyword', ''));
$limit = min(max((int) $request->input('limit', 8), 1), 20);

if ($keyword === '') {
    return response()->json(['code' => 0, 'message' => 'success', 'data' => []]);
}

$escaped = addcslashes($keyword, '%_\\');

$names = Recipe::query()
    ->where('status', 1) // 按项目实际字段调整
    ->where('name', 'like', "%{$escaped}%")
    ->orderByRaw('name like ? desc', ["{$escaped}%"])
    ->orderByDesc('views')
    ->limit($limit)
    ->pluck('name')
    ->unique()
    ->values();

return response()->json([
    'code' => 0,
    'message' => 'success',
    'data' => $names->map(fn ($name) => ['name' => $name])->all(),
]);
```

---

## 联调用例

```bash
# 热门搜索词
curl "https://recipe.80shihua.com/api/recipe.hotSearch?limit=8"

# 输入联想
curl --get --data-urlencode "keyword=宫保" --data-urlencode "limit=8" \
  "https://recipe.80shihua.com/api/recipe.suggest"
```

预期：

- 两个接口均无需登录即可返回；
- `hotSearch` 返回的每个词，用 `/api/recipe.search?name=<词>` 都能搜到至少 1 条菜谱；
- `suggest?keyword=宫保` 返回的每个 `name` 都包含"宫保"，且"宫保"前缀的菜名排在前面；
- `keyword` 传空或纯空格：`{"code":0,"message":"success","data":[]}`。

---

## 前端接入点（后端就绪后由前端切换）

| 位置 | 现在的做法 | 切换后 |
|------|------------|--------|
| `api/recipe.js` → `getHotRecipes` | 调 `/api/recipe.lists` 取菜名 | 调 `/api/recipe.hotSearch` |
| `api/search.js` → `suggest` | 调 `/api/recipe.search` 取整页数据 | 调 `/api/recipe.suggest` |
| `pages/search/index.js` → `fetchHotWords` | 从列表结果中提取 `name` | 直接读取字符串数组 |
| `pages/search/index.js` → `fetchSuggestions` | 从搜索结果中提取 `name` | 读取 `data[].name`（字段已对齐，无需改解析逻辑） |

接口未就绪期间前端继续走现有降级方案，不影响上线。

---

## 可选（P2，本期不要求）

如果希望热门词完全由真实搜索行为驱动，后续可增加埋点接口：

```
POST /api/recipe.searchLog
{ "keyword": "红烧肉", "scene": "search", "result_count": 3 }
```

用于统计搜索词热度；本期热门词可由后端用访问日志或菜谱热度计算，无需该接口。
