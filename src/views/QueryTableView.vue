<script setup lang="ts">
import { ref } from 'vue'
import type { TableColumnData } from '@arco-design/web-vue'

type ProductRow = {
  code: string
  name: string
  category: string
  supplier: string
  platform: string
  stock: number
  status: '在售' | '待上架' | '风险'
  updatedAt: string
}

const filters = ref({
  code: '',
  name: '',
  category: undefined,
  platform: undefined,
  supplier: undefined,
  dateRange: [],
  status: undefined,
})

const activeScope = ref('all')

const columns: TableColumnData[] = [
  { title: '产品编号', dataIndex: 'code', width: 140 },
  { title: '产品名称', dataIndex: 'name', ellipsis: true, tooltip: true, width: 220 },
  { title: '品类', dataIndex: 'category', width: 140 },
  { title: '供应商', dataIndex: 'supplier', ellipsis: true, tooltip: true, width: 160 },
  { title: '平台', dataIndex: 'platform', width: 140 },
  { title: '可售库存', dataIndex: 'stock', width: 120, sortable: { sortDirections: ['ascend', 'descend'] } },
  { title: '最近更新', dataIndex: 'updatedAt', width: 180 },
  { title: '状态', slotName: 'status', width: 120 },
  { title: '操作', slotName: 'actions', width: 160, fixed: 'right' },
]

const rows = ref<ProductRow[]>([
  {
    code: 'SKU-100231',
    name: '秋冬保暖加绒卫衣套装',
    category: '服饰',
    supplier: '杭州海川服饰',
    platform: 'Wildberries',
    stock: 238,
    status: '在售',
    updatedAt: '2026-04-24 18:20',
  },
  {
    code: 'SKU-100587',
    name: '婴童硅胶餐盘五件套',
    category: '母婴',
    supplier: '义乌鲸选日用品',
    platform: 'Ozon',
    stock: 56,
    status: '风险',
    updatedAt: '2026-04-24 17:52',
  },
  {
    code: 'SKU-100774',
    name: '桌面收纳抽屉盒',
    category: '家居',
    supplier: '宁波锦纳塑业',
    platform: 'TikTok Shop',
    stock: 412,
    status: '在售',
    updatedAt: '2026-04-24 16:33',
  },
  {
    code: 'SKU-100832',
    name: '无线便携果汁杯',
    category: '小家电',
    supplier: '深圳优越电器',
    platform: 'Wildberries',
    stock: 0,
    status: '待上架',
    updatedAt: '2026-04-24 15:06',
  },
  {
    code: 'SKU-101024',
    name: '运动压缩毛巾礼盒',
    category: '运动户外',
    supplier: '泉州轻量工坊',
    platform: 'Ozon',
    stock: 88,
    status: '风险',
    updatedAt: '2026-04-24 14:18',
  },
])

const getStatusColor = (status: ProductRow['status']) => {
  if (status === '在售') return 'green'
  if (status === '待上架') return 'arcoblue'
  return 'red'
}
</script>

<template>
  <div class="page-shell">
    <section class="page-head">
      <div class="page-copy">
        <h1>核心产品库</h1>
        <p class="page-text">
          统一管理商品档案、SKU 映射和库存状态，先把高频列表页做成控制台工作区，再往整站复制。
        </p>
      </div>

      <a-space wrap>
        <a-button>字段说明</a-button>
        <a-button>导入规范</a-button>
        <a-button type="primary">新建商品</a-button>
      </a-space>
    </section>

    <a-card class="guide-card" :bordered="false">
      <div class="guide-main">
        <div>
          <span class="guide-tag">商品治理工作台</span>
          <strong>这一页先对齐火山方舟的控制台感，减少模板装饰，强调筛选、操作和表格工作区。</strong>
          <p>后续商品列表、采购单、销售订单、库存管理都可以沿用这套骨架。</p>
        </div>
        <a-space wrap>
          <a-button size="small">批量导入</a-button>
          <a-button size="small" status="success">导出数据</a-button>
        </a-space>
      </div>
    </a-card>

    <a-card class="workspace-card control-card" :bordered="false">
      <div class="control-bar">
        <div class="control-left">
          <a-button type="primary">创建商品</a-button>
          <a-radio-group v-model="activeScope" type="button" size="small">
            <a-radio value="all">全部商品</a-radio>
            <a-radio value="focus">重点关注</a-radio>
            <a-radio value="draft">待完善档案</a-radio>
          </a-radio-group>
        </div>

        <div class="control-search">
          <a-select default-value="name" style="width: 160px">
            <a-option value="name">按产品名称</a-option>
            <a-option value="sku">按 SKU / 条码</a-option>
          </a-select>
          <a-input-search
            v-model="filters.name"
            placeholder="请输入搜索内容"
            allow-clear
            style="width: 240px"
          />
          <a-select v-model="filters.platform" placeholder="平台" allow-clear style="width: 150px">
            <a-option value="Wildberries">Wildberries</a-option>
            <a-option value="Ozon">Ozon</a-option>
            <a-option value="TikTok Shop">TikTok Shop</a-option>
          </a-select>
          <a-button>刷新</a-button>
        </div>
      </div>
    </a-card>

    <a-card class="workspace-card filter-card" :bordered="false">
      <template #title>
        <div class="section-title">
          <span>高级筛选</span>
          <small>支持 SKU、平台、供应商和更新时间组合检索</small>
        </div>
      </template>
      <a-form :model="filters" layout="vertical">
        <a-grid :cols="{ xs: 1, sm: 2, xl: 4 }" :col-gap="16" :row-gap="2">
          <a-grid-item>
            <a-form-item field="code" label="产品编号">
              <a-input v-model="filters.code" placeholder="输入 SKU / 条码" allow-clear />
            </a-form-item>
          </a-grid-item>
          <a-grid-item>
            <a-form-item field="name" label="产品名称">
              <a-input v-model="filters.name" placeholder="输入产品名称" allow-clear />
            </a-form-item>
          </a-grid-item>
          <a-grid-item>
            <a-form-item field="category" label="品类">
              <a-select v-model="filters.category" placeholder="选择品类" allow-clear>
                <a-option value="服饰">服饰</a-option>
                <a-option value="家居">家居</a-option>
                <a-option value="母婴">母婴</a-option>
                <a-option value="小家电">小家电</a-option>
              </a-select>
            </a-form-item>
          </a-grid-item>
          <a-grid-item>
            <a-form-item field="platform" label="平台">
              <a-select v-model="filters.platform" placeholder="选择平台" allow-clear>
                <a-option value="Wildberries">Wildberries</a-option>
                <a-option value="Ozon">Ozon</a-option>
                <a-option value="TikTok Shop">TikTok Shop</a-option>
              </a-select>
            </a-form-item>
          </a-grid-item>
          <a-grid-item>
            <a-form-item field="supplier" label="供应商">
              <a-select v-model="filters.supplier" placeholder="选择供应商" allow-clear>
                <a-option value="杭州海川服饰">杭州海川服饰</a-option>
                <a-option value="义乌鲸选日用品">义乌鲸选日用品</a-option>
                <a-option value="深圳优越电器">深圳优越电器</a-option>
              </a-select>
            </a-form-item>
          </a-grid-item>
          <a-grid-item>
            <a-form-item field="dateRange" label="更新时间">
              <a-range-picker v-model="filters.dateRange" style="width: 100%" />
            </a-form-item>
          </a-grid-item>
          <a-grid-item>
            <a-form-item field="status" label="状态">
              <a-select v-model="filters.status" placeholder="选择状态" allow-clear>
                <a-option value="在售">在售</a-option>
                <a-option value="待上架">待上架</a-option>
                <a-option value="风险">风险</a-option>
              </a-select>
            </a-form-item>
          </a-grid-item>
        </a-grid>

        <div class="filter-actions">
          <a-space>
            <a-button type="primary">查询</a-button>
            <a-button>重置</a-button>
          </a-space>
        </div>
      </a-form>
    </a-card>

    <a-card class="workspace-card table-card" :bordered="false">
      <template #title>
        <div class="table-title">
          <div class="section-title">
            <span>商品列表</span>
            <small>共 58 条数据，最近同步于 2 分钟前</small>
          </div>
          <a-space>
            <a-link>API 接入</a-link>
            <a-link>体验</a-link>
          </a-space>
        </div>
      </template>

      <a-table
        :columns="columns"
        :data="rows"
        row-key="code"
        :pagination="{ pageSize: 10, total: 58, showTotal: true }"
        :scroll="{ x: 1320 }"
      >
        <template #status="{ record }">
          <a-tag :color="getStatusColor(record.status)">{{ record.status }}</a-tag>
        </template>

        <template #actions>
          <a-space>
            <a-link>查看</a-link>
            <a-link>编辑</a-link>
          </a-space>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<style scoped>
.page-shell {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 4px 2px 0;
}

.page-copy {
  flex: 1;
  min-width: 0;
}

.page-head h1 {
  margin: 0 0 8px;
  color: #1d2129;
  font-size: 30px;
  line-height: 1.2;
}

.page-text {
  max-width: 760px;
  margin: 0;
  color: #4e5969;
  font-size: 14px;
  line-height: 1.65;
}

.guide-card,
.workspace-card {
  overflow: hidden;
  border: 1px solid #ebedf0;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: none;
}

.guide-card {
  background: linear-gradient(90deg, #f7faff 0%, #ffffff 65%);
}

.guide-card :deep(.arco-card-body) {
  padding: 16px 20px;
}

.guide-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.guide-tag {
  display: inline-flex;
  align-items: center;
  margin-bottom: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #edf3ff;
  color: #1664ff;
  font-size: 12px;
  font-weight: 600;
}

.guide-main strong {
  display: block;
  color: #1d2129;
  font-size: 15px;
  line-height: 1.5;
}

.guide-main p {
  margin: 8px 0 0;
  color: #4e5969;
  font-size: 13px;
  line-height: 1.65;
}

.control-card :deep(.arco-card-body) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
}

.control-bar {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.control-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.control-search {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.control-card :deep(.arco-radio-group-button .arco-radio-button) {
  border-color: #e5e6eb;
  background: #f7f8fa;
}

.control-card :deep(.arco-radio-group-button .arco-radio-button-checked) {
  border-color: #165dff;
  background: #eef4ff;
  color: #165dff;
}

.filter-card,
.table-card {
  overflow: hidden;
}

.filter-card :deep(.arco-card-header),
.table-card :deep(.arco-card-header) {
  padding: 14px 18px 0;
  padding-bottom: 0;
  border-bottom: 1px solid #f2f3f5;
}

.filter-card :deep(.arco-card-body) {
  padding: 18px;
}

.table-card :deep(.arco-card-body) {
  padding: 12px 0 16px;
}

.section-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section-title span {
  color: #1d2129;
  font-size: 16px;
  font-weight: 600;
}

.section-title small {
  color: #86909c;
  font-size: 12px;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
}

.table-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.table-card :deep(.arco-table-th) {
  background: #f7f8fa;
  color: #4e5969;
  font-weight: 600;
}

.table-card :deep(.arco-table-td) {
  background: #ffffff;
}

.table-card :deep(.arco-table-tr:hover .arco-table-td) {
  background: #f9fbff;
}

.table-card :deep(.arco-pagination) {
  padding: 0 18px;
  margin-top: 18px;
}

@media (max-width: 768px) {
  .page-head,
  .guide-main,
  .control-bar {
    align-items: flex-start;
    flex-direction: column;
  }

  .control-left,
  .control-search {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .control-search :deep(.arco-input-search),
  .control-search :deep(.arco-select) {
    width: 100% !important;
  }

  .filter-actions,
  .table-title {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
