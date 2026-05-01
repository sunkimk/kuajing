# Sales Management Design

## Goal

为当前项目补齐销售管理模块的真实业务页面，替换现有占位页，并将页面设计、布局节奏和交互语言统一到当前项目“批次库存”页面的工作台风格。

本次只覆盖销售管理模块，不扩展到其他菜单分组。

## Scope

In scope:

- 实现销售管理模块下的 3 个真实业务页面：
  - `销售订单`
  - `二次销售`
  - `退货管理`
- 保持现有左侧菜单中的 `销售管理` 分组作为模块入口，不新增单独的销售首页。
- 用与“批次库存”一致的工作台结构重做销售模块页面：
  - 页头说明
  - 指标摘要条
  - 查询筛选区
  - 可配置表格
  - 抽屉详情
- 将页面业务状态、 mock 数据、筛选逻辑和格式化函数拆出到 `src/data/`。
- 为新增纯数据 helper 补充 Vitest 测试。

Out of scope:

- 接入真实后端接口。
- 改造销售模块之外的占位页。
- 新增销售模块总览首页。
- 持久化列配置、筛选配置或用户偏好。

## Information Architecture

继续使用现有左侧菜单结构，不增加新的模块首页。

销售管理下包含以下页面：

- `/sales/orders` 对应 `销售订单`
- `/sales/upsell` 对应 `二次销售`
- `/sales/return` 对应 `退货管理`

其中：

- `销售订单` 作为销售链路主工作台，承担订单检索、状态查看、履约跟踪和利润查看。
- `二次销售` 作为商品维度复购工作台，承担复购商品追踪和配送费用统计。
- `退货管理` 作为售后异常工作台，承担退货单查看、状态分流和退款信息跟踪。

## Route And View Boundaries

新增三个 route-level view，保持和 `BatchInventoryView` 一样的轻壳模式：

- `src/views/SalesOrderView.vue`
- `src/views/SalesSecondaryView.vue`
- `src/views/SalesReturnView.vue`

这些 view 只负责渲染对应 workbench 组件，不持有业务状态。

`src/router/index.ts` 需要将原本落到 `PlaceholderView` 的销售模块页面改成真实页面映射，并补充 `/sales/return` 的路由。

`src/data/navigation.ts` 需要将销售模块菜单扩展为：

- `销售订单`
- `二次销售`
- `退货管理`

## Component Boundaries

### `src/components/sales/SalesOrderWorkbench.vue`

- 销售订单完整工作台。
- 持有筛选条件、分页、当前选中详情、列表 loading、列设置弹窗状态。
- 渲染页头、指标摘要、筛选区、表格和详情抽屉。

### `src/components/sales/SalesOrderDetailDrawer.vue`

- 展示单个订单详情。
- 包含三个信息区：
  - 基础信息
  - 成本与利润
  - 物流/状态日志

### `src/components/sales/SalesSecondaryWorkbench.vue`

- 二次销售完整工作台。
- 持有筛选条件、分页、详情抽屉状态和列表数据。
- 重点呈现商品维度的复购记录与配送费用。

### `src/components/sales/SalesSecondaryDetailDrawer.vue`

- 展示单个商品的二销记录。
- 顶部为摘要信息，主体为销售记录表格。

### `src/components/sales/SalesReturnWorkbench.vue`

- 退货管理完整工作台。
- 持有筛选条件、分页、详情抽屉状态和状态标签映射。
- 强化售后异常处理语义。

### `src/components/sales/SalesReturnDetailDrawer.vue`

- 展示单个退货单详情。
- 主体分为两块：
  - 退货信息
  - 商品信息
- 额外补一条处理进度/状态时间线，提升相较原型的完整度。

## Shared UI Rules

销售管理的三个页面都遵循与“批次库存”相同的 UI 语言：

- 页面顶部使用紧凑页头，包含标题和一句说明文字。
- 指标摘要条使用 `MetricSummaryStrip`，保持统一边框、留白和数字层级。
- 查询区使用：
  - `QueryFilterPanel`
  - `QueryFilterItem`
  - `QueryActionBar`
- 表格使用 `ConfigurableDataTable`，统一支持：
  - 列显示/隐藏
  - 列顺序调整
  - 首列/末列冻结
  - 自动换行开关
  - 分页 footer
- 状态显示统一使用圆角 `status-pill`，颜色策略与仓储页面一致。
- 详情交互统一用右侧抽屉，不用跳详情页。

不额外抽象“销售通用 workbench 父组件”，避免为了复用而增加一层过度抽象。公共风格通过现有 common 组件和局部样式变量统一。

## Data Layer

新增以下数据文件：

- `src/data/salesOrders.ts`
- `src/data/salesSecondary.ts`
- `src/data/salesReturns.ts`

每个数据文件负责：

- 定义页面相关 TypeScript 类型
- 提供 mock 数据 factory
- 提供筛选、分页、统计、标签格式化等纯函数

不把三个页面的数据混在一个 `sales.ts` 中，避免类型和字段语义互相污染。

## Page-Level Designs

### Sales Orders

#### Header

- 标题：`销售订单`
- 描述：强调全链路订单管理、履约推进和利润查看。

#### Summary Cards

- 订单总数
- FBS 待推进
- FBW 待推进
- 同步异常或预计利润

指标文案以“订单推进节奏”为核心，而不是纯金额总览。

#### Filters

- 关键词
- 店铺
- 履约类型
- 订单状态
- 日期范围

关键词覆盖：

- 订单号
- 装配单号
- SKU
- 商品名

#### Table

本次实现列：

- 订单号
- 商品
- 装配单号
- 订单类型
- 配送方式
- 仓库
- 店铺
- 状态
- 下单时间
- 同步时间

表格主操作为 `详情`。

#### Detail Drawer

- 基础信息：订单、商品、客户、店铺、仓库
- 成本与利润：售价、总成本、预计利润、利润率、成本拆分
- 物流/状态日志：时间线或日志表

### Sales Secondary

#### Header

- 标题：`二次销售`
- 描述：强调复购商品追踪和配送费用分析。

#### Summary Cards

- 二销商品数
- 平均销售次数
- 配送费用合计
- 二销物流成本

#### Filters

- 店铺
- SHK ID / 关键词
- 品牌
- 品类
- 最终状态

#### Table

本次实现列：

- SHK ID
- 商品
- 店铺
- 条码
- 品牌
- 品类
- 销售次数
- 首次下单
- 末次下单
- 配送费用
- 最终状态

#### Detail Drawer

- 顶部摘要：条码、品牌/品类、销售次数、配送费用合计
- 主体：销售记录表格

这个页面不再使用过重的多 tab，而是保持“轻抽屉 + 明确主表”的结构。

### Sales Return

#### Header

- 标题：`退货管理`
- 描述：强调售后异常、退款链路和回仓处理。

#### Summary Cards

- 退货总量
- 待处理
- 已同意待回仓
- 已完成

#### Filters

- 关键词
- 店铺
- 退货状态
- 退货原因类型
- 申请时间

关键词覆盖：

- 退货单号
- 原订单号
- 商品名
- SKU

#### Table

本次实现列：

- 退货单号
- 原订单号
- 商品
- 店铺
- 数量
- 退款金额
- 退货原因
- 状态
- 申请时间

#### Detail Drawer

- 退货信息：退货单号、申请时间、退货数量、退款金额、处理状态
- 商品信息：商品名、SKU、店铺、退货原因
- 处理进度：状态时间线

相较原型，详情抽屉需要更像“处理工作台”，而不是简单信息复述。

## Styling

三个销售页面分别使用局部变量前缀：

- `--sales-order-*`
- `--sales-secondary-*`
- `--sales-return-*`

但都映射到统一的 workspace 变量：

- `--workspace-color-primary`
- `--workspace-color-text`
- `--workspace-color-border`
- `--workspace-control-height`
- `--workspace-radius`

这样既能和当前 common 组件对齐，又保留页面级微调空间。

视觉上保持和“批次库存”一致：

- 白底工作台
- 8px 外层圆角
- 紧凑 16px 模块间距
- 轻边框而非重阴影
- hover 以浅色填充为主

## Testing

新增测试文件：

- `tests/salesOrders.test.ts`
- `tests/salesSecondary.test.ts`
- `tests/salesReturns.test.ts`

重点测试纯函数：

- 统计卡片计算
- 筛选逻辑
- 状态标签和显示文案
- 分页切片

不对 Arco 组件行为做额外封装测试。

## Acceptance Criteria

- 销售管理菜单下不再出现通用占位页。
- `销售订单`、`二次销售`、`退货管理` 都具备完整工作台结构。
- 三个页面视觉风格与“批次库存”页面一致。
- 三个页面都支持筛选、重置、刷新、列设置、分页和详情抽屉。
- TypeScript build 通过。
- 新增与现有 Vitest 测试通过。
