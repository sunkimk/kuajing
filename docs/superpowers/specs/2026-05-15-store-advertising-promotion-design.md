# Store Advertising Promotion Design

## Goal

在 `店铺管理 > 广告推广` 下制作一个可演示的广告活动工作台，覆盖多平台、多店铺的广告活动管理、活动详情和活动统计。

参考图来自 Wildberries 单平台单店广告后台。本项目需要吸收它的信息密度和交互层级，但不能复制其顶部平台导航。广告推广页面必须放回当前 ERP 的店铺管理体系中，让用户可以从多个平台和多个店铺统一查看广告活动，再下钻到单个活动。

核心目标：

- 首页统一管理多平台、多店铺广告活动
- 支持快速筛选平台、店铺、状态、广告类型和日期
- 从活动列表进入活动详情
- 在详情页查看预算、统计趋势和投放商品
- 在商品行内展开搜索词或集群表现
- 从详情页进入单活动统计页

## Scope

In scope:

- 将 `/stores/ads` 从占位页升级为真实广告推广首页
- 新增活动详情路由 `/stores/ads/:campaignId`
- 新增活动统计路由 `/stores/ads/:campaignId/statistics`
- 首页支持多平台、多店铺选择，不使用参考图的单公司/单店结构
- 使用 mock 数据完成完整 demo 状态
- 支持活动启停、筛选、搜索、分页、进入详情、进入统计等前端交互
- 支持详情页商品行展开，展示搜索词集群指标
- 支持统计页指标勾选切换图表线条
- 为数据处理、路由映射和关键源码结构补充 Vitest 测试

Out of scope:

- 接入真实广告平台 API
- 实现真实创建广告活动向导
- 实现真实上传商品文件、批量出价和预算扣费
- 持久化筛选条件或用户表格列偏好
- 完整改造 `/stores/ads-overview` 和 `/stores/wildberries-ads`
- 还原参考图顶部的 `活动 / 统计 / 财务 / 我的奖励` 外部产品导航

## Information Architecture

广告推广采用方案 A：列表页、详情页和统计页独立路由。

1. `/stores/ads`
   - 页面名称：`广告推广`
   - 定位：多平台多店铺广告活动总控台
   - 对应参考图 1

2. `/stores/ads/:campaignId`
   - 页面名称：`活动详情`
   - 定位：单个广告活动的预算、趋势和商品投放管理
   - 对应参考图 2

3. `/stores/ads/:campaignId/statistics`
   - 页面名称：`活动统计`
   - 定位：单个广告活动的深度数据报表
   - 对应参考图 4

4. 商品行展开态
   - 不单独开路由
   - 位于详情页商品列表内部
   - 对应参考图 3

## Multi-Platform And Multi-Store Model

首页顶部不使用参考图右上角单公司选择器。它改造成 ERP 语境下的广告范围控制区：

- 平台选择：`全部平台 / Wildberries / Ozon / AliExpress / TikTok Shop / Amazon`
- 店铺选择：支持多选，选项随平台联动
- 日期范围：默认近 7 天
- 状态筛选：`全部 / 投放中 / 已暂停 / 已结束 / 待启动`
- 广告类型：`全部 / CPM / CPC / 搜索推广 / 商品推广`

首页需要清楚表达当前范围，例如：

- `全部平台 · 全部店铺`
- `Wildberries · 3 家店铺`
- `Ozon + Wildberries · 6 家店铺`

多平台支持规则：

- 列表中的每条活动必须展示平台和店铺
- 平台字段影响广告类型、币种、素材缩略图和指标数据
- 店铺字段影响活动归属、筛选和活动详情页上下文
- 汇总指标按当前筛选范围实时计算
- 如果只选一个平台和一个店铺，页面仍保持同一套布局，不切回外部广告后台风格

## Route And Navigation

`src/data/navigation.ts` 已有以下店铺管理入口：

- `/stores/ads`：广告推广
- `/stores/ads-overview`：广告概述
- `/stores/wildberries-ads`：Wildberries 广告

本轮只实现 `/stores/ads` 以及它的下钻页面。`广告概述` 和 `Wildberries 广告` 暂时保持占位，后续可作为概览报表和平台专项页。

`src/router/index.ts` 需要：

- 引入广告推广首页 view
- 引入活动详情 view
- 引入活动统计 view
- 将 `/stores/ads` 从 placeholder route 中排除
- 增加 `/stores/ads/:campaignId`
- 增加 `/stores/ads/:campaignId/statistics`
- 路由 meta 使用：
  - `sectionKey: 'stores'`
  - `sectionTitle: '店铺管理'`
  - `hideBreadcrumb: true`

## Component Boundaries

### `src/views/StoreAdvertisingView.vue`

薄 route view，只承载 `StoreAdvertisingWorkbench`。

### `src/views/StoreAdvertisingDetailView.vue`

薄 route view，只承载 `StoreAdvertisingDetailWorkbench`，从路由读取 `campaignId`。

### `src/views/StoreAdvertisingStatisticsView.vue`

薄 route view，只承载 `StoreAdvertisingStatisticsWorkbench`，从路由读取 `campaignId`。

### `src/components/stores/StoreAdvertisingWorkbench.vue`

广告活动首页主组件，负责：

- 页头与范围选择
- 活动摘要指标
- 活动列表筛选
- 活动表格
- 活动启停 mock 状态
- 跳转详情和统计

### `src/components/stores/StoreAdvertisingDetailWorkbench.vue`

活动详情主组件，负责：

- 活动标题、状态、平台、店铺、广告类型
- 预算余额与自动补充预算开关
- 统计摘要卡片和趋势图
- 投放商品列表
- 商品行展开状态
- 跳转完整统计页

### `src/components/stores/StoreAdvertisingStatisticsWorkbench.vue`

活动统计主组件，负责：

- 统计筛选区
- 多指标折线图
- 指标勾选开关
- 商品维度统计表
- 表格分组展开展示商品明细

### `src/data/storeAdvertising.ts`

广告推广 mock 数据和纯函数，负责：

- 类型定义
- 平台、店铺、活动、商品、搜索词集群数据
- 默认筛选状态
- 活动筛选
- 活动详情查找
- 指标汇总
- 统计序列生成
- 状态和币种格式化

## Homepage Design

首页从上到下分为五层。

### Header

标题为 `广告推广`，说明文案强调统一查看多平台、多店铺广告活动、预算消耗与转化表现。

右侧主操作：

- `创建活动`
- `刷新`

`创建活动` 在 demo 阶段打开 modal，展示可选平台、店铺、广告类型和创建说明，不进入完整向导。

### Scope Bar

范围控制区放在首页主要筛选之前，承担参考图中单公司/单店选择器的职责。

字段：

- 平台
- 店铺
- 日期范围
- 更多筛选
- 列设置

交互：

- 平台变更后，店铺选项联动过滤
- 店铺支持多选
- 清空平台时恢复全部店铺
- 日期影响首页指标和活动列表
- 更多筛选打开右侧抽屉或 popover，包含状态、广告类型、预算状态

### Summary Strip

首页展示紧凑摘要，不做大卡片墙：

- 活动总数
- 投放中
- 总预算
- 今日消耗
- 展示次数
- 订单数
- 平均 CTR
- 花费比例

摘要按当前平台、店铺、日期范围实时计算。点击 `投放中`、`花费比例` 等指标可联动列表筛选。

### Campaign Table

活动表格对应参考图 1，但增加 ERP 所需归属字段。

建议列：

- 勾选
- 启停
- 活动
- 平台
- 店铺
- 广告类型
- 预算余额
- 费用
- 展示次数
- CTR
- 订单
- 花费比例
- 操作

活动列展示：

- 活动名称
- 状态标签
- 活动 ID
- 缩略图或商品数量

操作：

- 点击活动名进入详情
- 点击统计图标进入统计页
- 更多菜单包含 `复制活动`、`调整预算`、`结束活动`

## Detail Page Design

活动详情对应参考图 2。

页面层级：

1. 返回入口和活动标题
2. 活动状态、平台、店铺、广告类型、活动 ID、最近更新时间
3. 右侧操作：`暂停 / 继续`、`完成`
4. 预算余额区
5. 统计摘要与趋势图
6. 投放商品列表

详情页保留当前 ERP 的页面壳，不复制参考站顶部导航。

预算区：

- 预算余额
- 自动补充预算开关
- 修改预算按钮

统计区：

- 展示次数
- 点击次数
- 订单
- 花费比例
- CTR
- CPC
- CR
- CPO
- 订单金额
- 支出

趋势图使用 lightweight SVG 或简单图表实现，不新增重型依赖。

商品列表：

- 照片
- 品牌 / 商品编号 / 名称
- 出价
- 排位或投放位置
- 数据入口
- 更多操作
- 展开按钮

## Product Expanded Row

商品行展开对应参考图 3，作为详情页内部交互。

展开内容分两栏或上下结构：

- 左侧：搜索词集群 / 推荐商品 tabs
- 顶部：活跃、不活跃、全部分段筛选
- 搜索框
- 右侧：日期范围、下载、集群管理按钮
- 表格：平均排名、展示次数、点击次数、购物车、订购商品数量、花费、CTR、CPM

交互：

- 点击商品行右侧箭头展开或收起
- 同一时间允许多个商品展开，但默认只展开用户刚点击的一个
- `搜索词集群 / 推荐商品` tab 只切换 mock 数据
- `活跃 / 不活跃 / 全部` 过滤当前展开表

## Statistics Page Design

活动统计对应参考图 4。

页面层级：

1. 标题区：`活动统计`
2. 活动上下文：活动名、ID、平台、店铺、状态、广告类型
3. 筛选区：日期范围、展示区域、刷新、扩展统计
4. 图表模式切换：`线性 / 漏斗`
5. 多指标趋势图
6. 指标勾选条
7. 商品维度统计表

指标勾选：

- 展示次数
- 点击次数
- 加入购物车
- 订购商品数量
- 花费

表格列：

- 照片
- 产品名称
- 平均排名
- 花费
- 订单金额
- 展示次数
- 点击次数
- 添加到购物车

统计页同样基于 mock 数据，优先保证信息层级和交互可信。

## Data And State

核心类型建议：

- `AdvertisingPlatform`
- `AdvertisingStore`
- `AdvertisingCampaignStatus`
- `AdvertisingCampaignType`
- `AdvertisingCampaign`
- `AdvertisingCampaignProduct`
- `AdvertisingSearchCluster`
- `AdvertisingMetricPoint`
- `AdvertisingFilterState`
- `AdvertisingStatisticsMetricKey`

mock 数据需要覆盖：

- 至少 5 个平台
- 至少 8 家店铺
- 至少 12 个广告活动
- 多种状态：投放中、已暂停、已结束、待启动
- 多种类型：CPM、CPC、搜索推广、商品推广
- 至少 1 个活动包含 8 个以上商品
- 至少 1 个商品包含 4 条以上搜索词集群

数据规则：

- 预算、费用和订单金额保留币种字段
- 不同平台允许不同币种，但首页列表统一展示原币种
- 汇总区使用人民币折算字段，避免跨币种汇总失真
- CTR、CR、花费比例由纯函数计算，不在模板里散落计算

## UI Rules

- 延续当前项目紧凑中文 ERP 风格
- 使用 Arco 组件实现 Select、DatePicker、Table、Modal、Switch、Drawer、Button
- 表格优先使用 `ConfigurableDataTable`
- 图表优先用本地 SVG 实现轻量 demo
- 不引入新的图表库
- 不使用营销式 hero
- 不复制参考图的紫色大横幅，除非后续明确要做平台广告素材提示
- 页面按钮、筛选、表格密度与店铺管理和销售管理页面保持一致

## Error And Empty States

首页：

- 无活动：展示空状态和 `创建活动`
- 无店铺：提示先接入店铺，提供跳转 `/stores/list`
- 筛选无结果：提示调整筛选条件

详情页：

- 找不到活动：展示返回广告推广首页按钮
- 活动无商品：展示 `添加商品`

统计页：

- 无统计数据：展示当前筛选范围暂无数据
- 指标全部取消：保留空图表提示，允许重新勾选

## Testing

新增或更新 Vitest 测试：

- 路由测试：`/stores/ads`、`/stores/ads/:campaignId`、`/stores/ads/:campaignId/statistics` 指向真实 view
- 导航测试：`广告推广` 仍位于店铺管理导航
- 数据测试：
  - 多平台多店铺筛选
  - 平台变更过滤店铺
  - 活动汇总统计
  - 活动详情查找
  - 商品搜索词集群过滤
- 源码结构测试：
  - 首页包含平台和店铺范围选择
  - 详情页包含预算、统计、商品列表和完整统计入口
  - 统计页包含指标勾选和商品统计表

## Implementation Notes

推荐按以下顺序实现：

1. 数据层和测试
2. 路由和薄 view
3. 首页工作台
4. 详情页工作台
5. 商品展开态
6. 统计页工作台
7. 样式整理
8. 浏览器验证

本轮 demo 的优先级是“层级可信、交互可走通、数据范围符合多平台多店”，不是追求真实广告 API 行为。
