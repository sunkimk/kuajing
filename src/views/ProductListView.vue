<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { TableColumnData } from '@arco-design/web-vue'
import { IconPlus, IconRefresh } from '@arco-design/web-vue/es/icon'
import { useRouter } from 'vue-router'
import AppDataTable from '../components/common/AppDataTable.vue'
import {
  categoryOptions,
  filterProducts,
  productStatusOptions,
  purchasableOptions,
  useProductCatalogStore,
  type ProductFilters,
  type ProductRecord,
  type ProductStatus,
} from '../data/productCatalog'

type FilterFormState = {
  sku: string
  name: string
  category: string | undefined
  status: ProductStatus | undefined
  purchasable: boolean | undefined
}

const router = useRouter()
const catalogStore = useProductCatalogStore()

const createDefaultFilters = (): FilterFormState => ({
  sku: '',
  name: '',
  category: undefined,
  status: undefined,
  purchasable: undefined,
})

const filters = reactive<FilterFormState>(createDefaultFilters())
const appliedFilters = ref<ProductFilters>(createDefaultFilters())

const statusLabelMap: Record<ProductStatus, string> = {
  normal: '正常',
  disabled: '停用',
}

const getStatusLabel = (status: ProductStatus) => statusLabelMap[status]

const purchasableLabel = (value: boolean | undefined) => value ? '是' : value === false ? '否' : '-'

const summaryCards = computed(() => {
  const products = catalogStore.products.value

  return [
    { label: '商品总数', value: String(products.length), note: '内部 SKU 主数据' },
    { label: '正常商品', value: String(products.filter((item) => item.basicInfo.status === 'normal').length), note: '可在订单链路流转' },
    { label: '可采购商品', value: String(products.filter((item) => item.procurement.purchasable).length), note: '支持采购参考维护' },
    { label: '已绑定映射', value: String(products.reduce((total, item) => total + item.mappings.length, 0)), note: '平台店铺商品绑定数' },
  ]
})

const filteredRows = computed(() => filterProducts(catalogStore.products.value, appliedFilters.value))
const tableRows = computed(() => filteredRows.value.map((product) => ({
  ...product,
  id: product.basicInfo.sku,
})))

const columns: TableColumnData[] = [
  { title: 'SKU', slotName: 'sku', width: 160, fixed: 'left' },
  { title: '商品主图', slotName: 'image', width: 110 },
  { title: '商品中文名', slotName: 'name', width: 260 },
  { title: '类目', slotName: 'category', width: 140 },
  { title: '商品状态', slotName: 'status', width: 120 },
  { title: '是否可采购', slotName: 'purchasable', width: 120 },
  { title: '已绑定平台店铺数量', slotName: 'mappingCount', width: 180, align: 'center' },
  { title: '更新时间', dataIndex: 'updatedAt', width: 168 },
  { title: '操作', slotName: 'actions', width: 140, fixed: 'right' },
]

const applyFilters = () => {
  appliedFilters.value = {
    sku: filters.sku.trim(),
    name: filters.name.trim(),
    category: filters.category,
    status: filters.status,
    purchasable: filters.purchasable,
  }
}

const resetFilters = () => {
  Object.assign(filters, createDefaultFilters())
  applyFilters()
}

const goToCreate = () => {
  router.push('/products/core-library/create')
}

const goToEdit = (sku: string) => {
  router.push(`/products/core-library/${encodeURIComponent(sku)}/edit`)
}

const getPrimaryMapping = (record: ProductRecord) => record.mappings[0]

applyFilters()
</script>

<template>
  <div class="product-list-page">
    <section class="page-header">
      <div class="header-left">
        <h1 class="page-title">商品列表</h1>
        <span class="page-desc">统一维护商品主数据、采购参考和平台店铺映射，第一版只聚焦商品资料维护与 SKU 对应关系。</span>
      </div>

      <a-space wrap>
        <a-button type="primary" class="volc-design-button" @click="goToCreate">
          <template #icon>
            <icon-plus />
          </template>
          新增商品
        </a-button>
      </a-space>
    </section>

    <section class="summary-strip">
      <div class="summary-grid">
        <div v-for="card in summaryCards" :key="card.label" class="summary-metric">
          <span>{{ card.label }}</span>
          <strong>{{ card.value }}</strong>
          <small>{{ card.note }}</small>
        </div>
      </div>
    </section>

    <section class="filter-panel-shell volc-design-common-table-query">
      <div class="filter-panel">
        <div class="filter-row">
          <div class="volc-design-search-item-wrap">
            <div class="volc-design-search-item-label">
              <span>SKU</span>
            </div>
            <a-input
              v-model="filters.sku"
              allow-clear
              placeholder="输入内部 SKU"
              class="volc-design-search-item"
              @press-enter="applyFilters"
            />
          </div>

          <div class="volc-design-search-item-wrap product-filter-name">
            <div class="volc-design-search-item-label">
              <span>商品名</span>
            </div>
            <a-input-search
              v-model="filters.name"
              allow-clear
              placeholder="输入中文名 / 英文名 / 简称"
              class="volc-design-search-item filter-search"
              @search="applyFilters"
              @press-enter="applyFilters"
              @clear="applyFilters"
            />
          </div>

          <div class="volc-design-search-item-wrap">
            <div class="volc-design-search-item-label">
              <span>类目</span>
            </div>
            <a-select v-model="filters.category" allow-clear placeholder="全部类目" class="volc-design-search-item" @change="applyFilters">
              <a-option v-for="option in categoryOptions" :key="option.value" :value="option.value">{{ option.label }}</a-option>
            </a-select>
          </div>

          <div class="volc-design-search-item-wrap">
            <div class="volc-design-search-item-label">
              <span>商品状态</span>
            </div>
            <a-select v-model="filters.status" allow-clear placeholder="全部状态" class="volc-design-search-item" @change="applyFilters">
              <a-option v-for="option in productStatusOptions" :key="option.value" :value="option.value">{{ option.label }}</a-option>
            </a-select>
          </div>

          <div class="volc-design-search-item-wrap">
            <div class="volc-design-search-item-label">
              <span>是否可采购</span>
            </div>
            <a-select v-model="filters.purchasable" allow-clear placeholder="全部" class="volc-design-search-item" @change="applyFilters">
              <a-option v-for="option in purchasableOptions" :key="String(option.value)" :value="option.value">{{ option.label }}</a-option>
            </a-select>
          </div>

          <div class="filter-actions-bar">
            <a-button type="primary" class="volc-design-button" @click="applyFilters">查询</a-button>
            <a-button class="volc-design-button" @click="resetFilters">重置</a-button>
            <a-tooltip content="刷新">
              <a-button size="small" class="filter-icon-button" aria-label="刷新" @click="applyFilters">
                <template #icon>
                  <icon-refresh />
                </template>
              </a-button>
            </a-tooltip>
          </div>
        </div>
      </div>
    </section>

    <section class="table-wrapper">
      <AppDataTable
        :columns="columns"
        :data="tableRows"
        row-key="id"
        :pagination="{ pageSize: 8, total: filteredRows.length, showTotal: true }"
        :scroll="{ x: 1360 }"
        table-class="data-table"
      >
        <template #sku="{ record }">
          <button type="button" class="cell-link" @click="goToEdit(record.basicInfo.sku)">
            {{ record.basicInfo.sku }}
          </button>
        </template>

        <template #image="{ record }">
          <div class="thumb-box">
            <img :src="record.basicInfo.mainImage" :alt="record.basicInfo.chineseName" class="thumb-image" />
          </div>
        </template>

        <template #name="{ record }">
          <div class="name-cell">
            <strong>{{ record.basicInfo.chineseName }}</strong>
            <small>{{ record.basicInfo.brand || '未设置品牌' }} · {{ getPrimaryMapping(record)?.platform || '未绑定平台' }}</small>
          </div>
        </template>

        <template #category="{ record }">
          {{ record.basicInfo.category }}
        </template>

        <template #status="{ record }">
          <span class="status-pill" :class="record.basicInfo.status === 'normal' ? 'status-normal' : 'status-disabled'">
            {{ getStatusLabel(record.basicInfo.status) }}
          </span>
        </template>

        <template #purchasable="{ record }">
          <span class="status-pill" :class="record.procurement.purchasable ? 'status-purchasable' : 'status-not-purchasable'">
            {{ purchasableLabel(record.procurement.purchasable) }}
          </span>
        </template>

        <template #mappingCount="{ record }">
          <span class="mapping-count">{{ record.mappings.length }}</span>
        </template>

        <template #actions="{ record }">
          <a-space>
            <a-link @click="goToEdit(record.basicInfo.sku)">编辑</a-link>
          </a-space>
        </template>
      </AppDataTable>
    </section>
  </div>
</template>

<style scoped>
.product-list-page {
  --product-color-primary: rgb(var(--primary-6));
  --product-color-text: var(--color-text-1);
  --product-color-text-secondary: var(--color-text-2);
  --product-color-text-tertiary: var(--color-text-3);
  --product-color-bg: var(--color-bg-2);
  --product-color-fill: var(--color-fill-1);
  --product-color-border: var(--color-border-2);
  --product-color-control-border: var(--color-border-2);
  --product-color-hover-bg: var(--color-fill-2);
  --product-control-height: var(--size-default, 32px);
  --product-radius: var(--border-radius-medium);
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 16px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 0 2px;
}

.header-left {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.page-title {
  margin: 0;
  color: var(--product-color-text);
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
}

.page-desc {
  color: var(--product-color-text-secondary);
  font-size: 13px;
  line-height: 20px;
}

.summary-strip,
.table-wrapper {
  border: 1px solid var(--product-color-border);
  border-radius: 8px;
  background: var(--product-color-bg);
  box-shadow: none;
}

.summary-strip {
  overflow: hidden;
  padding: 18px 0;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.summary-metric {
  display: flex;
  min-height: 86px;
  flex-direction: column;
  justify-content: center;
  padding: 0 28px;
}

.summary-metric + .summary-metric {
  border-left: 1px solid var(--product-color-border);
}

.summary-metric span {
  margin-bottom: 8px;
  color: var(--product-color-text-secondary);
  font-size: 13px;
  line-height: 20px;
}

.summary-metric strong {
  margin-bottom: 6px;
  color: var(--product-color-text);
  font-size: 26px;
  font-weight: 600;
  line-height: 32px;
}

.summary-metric small {
  color: var(--product-color-text-tertiary);
  font-size: 12px;
  line-height: 18px;
}

.filter-panel-shell {
  padding-top: 2px;
}

.filter-panel {
  padding: 0;
  background: var(--product-color-bg);
}

.filter-row {
  display: flex;
  align-items: flex-start;
  gap: 12px 16px;
  flex-wrap: wrap;
}

.volc-design-search-item-wrap {
  display: flex;
  min-width: 300px;
  width: 300px;
  max-width: none;
  align-items: stretch;
}

.product-filter-name {
  width: 360px;
}

.volc-design-search-item-wrap:hover :deep(.arco-select-view-single),
.volc-design-search-item-wrap:focus-within :deep(.arco-select-view-single),
.volc-design-search-item-wrap:hover :deep(.arco-input-wrapper),
.volc-design-search-item-wrap:focus-within :deep(.arco-input-wrapper) {
  border-color: var(--product-color-primary);
  box-shadow: 0 4px 10px rgba(var(--primary-6), 0.12);
}

.volc-design-search-item-label {
  display: flex;
  height: var(--product-control-height);
  align-items: center;
  flex-shrink: 0;
  padding: 0 16px;
  border: 1px solid var(--product-color-control-border);
  border-right: 0;
  border-radius: var(--product-radius) 0 0 var(--product-radius);
  background: var(--product-color-bg);
  color: var(--product-color-text-secondary);
  font-size: 14px;
  line-height: var(--product-control-height);
  white-space: nowrap;
}

.volc-design-search-item-label span {
  display: inline-flex;
  align-items: center;
}

.volc-design-search-item {
  min-width: 0;
  flex: 1;
  width: 100%;
}

.filter-actions-bar {
  display: flex;
  min-width: max-content;
  flex: 1 0 240px;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-left: auto;
}

.filter-actions-bar :deep(.arco-btn) {
  border-radius: 4px;
}

.volc-design-button {
  height: var(--product-control-height);
}

.filter-icon-button {
  width: var(--product-control-height);
  height: var(--product-control-height);
  padding: 0;
  border-color: var(--product-color-control-border);
  background: var(--product-color-bg);
  color: var(--product-color-text-secondary);
  box-shadow: none;
}

.filter-icon-button:hover,
.filter-icon-button:focus-visible {
  border-color: var(--product-color-primary);
  background: var(--product-color-bg);
  color: var(--product-color-text-secondary);
  box-shadow: 0 4px 10px rgba(var(--primary-6), 0.16);
}

.filter-panel :deep(.arco-select-view-single),
.filter-panel :deep(.arco-input-wrapper) {
  height: var(--product-control-height);
  border-color: var(--product-color-control-border);
  border-radius: 0 var(--product-radius) var(--product-radius) 0;
  background: var(--product-color-bg);
  box-shadow: none;
}

.filter-panel :deep(.volc-design-search-item .arco-select-view-single),
.filter-panel :deep(.volc-design-search-item .arco-input-wrapper) {
  margin-left: -1px;
}

.filter-panel :deep(.arco-select-view-value),
.filter-panel :deep(.arco-input) {
  font-size: 13px;
}

.filter-panel :deep(.arco-input-search-btn) {
  border-radius: 0 var(--product-radius) var(--product-radius) 0;
}

.table-wrapper {
  overflow: hidden;
}

.table-wrapper :deep(.data-table .arco-table-th) {
  background: var(--product-color-fill);
  color: var(--product-color-text-secondary);
  font-weight: 600;
}

.table-wrapper :deep(.data-table .arco-table-container) {
  border: 0;
}

.table-wrapper :deep(.data-table .arco-table-border .arco-table-container::before),
.table-wrapper :deep(.data-table .arco-table-border .arco-table-container::after),
.table-wrapper :deep(.data-table .arco-table-border .arco-table-container .arco-table),
.table-wrapper :deep(.data-table .arco-table-border .arco-table-tr::after),
.table-wrapper :deep(.data-table .arco-table-border .arco-table-th),
.table-wrapper :deep(.data-table .arco-table-border .arco-table-td) {
  border-color: #e9edf3;
}

.table-wrapper :deep(.data-table .arco-table-td) {
  background: var(--product-color-bg);
  white-space: nowrap;
}

.table-wrapper :deep(.data-table .arco-table-tr:hover .arco-table-td) {
  background: var(--product-color-hover-bg);
}

.table-wrapper :deep(.data-table .arco-pagination) {
  padding: 0 18px 18px;
  margin-top: 16px;
}

.cell-link {
  display: block;
  width: 100%;
  overflow: hidden;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--product-color-primary);
  cursor: pointer;
  font: inherit;
  font-weight: 500;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell-link:hover {
  text-decoration: underline;
}

.thumb-box {
  display: flex;
  width: 56px;
  height: 56px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 12px;
  background: var(--product-color-fill);
}

.thumb-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.name-cell {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}

.name-cell strong {
  color: var(--product-color-text);
  font-size: 14px;
  line-height: 1.5;
}

.name-cell small {
  color: var(--product-color-text-tertiary);
  font-size: 12px;
}

.mapping-count {
  display: inline-flex;
  min-width: 24px;
  justify-content: center;
  color: var(--product-color-primary);
  font-weight: 600;
}

.status-pill {
  display: inline-flex;
  height: 22px;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 12px;
  line-height: 22px;
}

.status-normal {
  background: rgba(0, 180, 42, 0.12);
  color: #00b42a;
}

.status-disabled {
  background: rgba(78, 89, 105, 0.12);
  color: #4e5969;
}

.status-purchasable {
  background: rgba(var(--primary-6), 0.08);
  color: var(--product-color-primary);
}

.status-not-purchasable {
  background: rgba(78, 89, 105, 0.08);
  color: var(--product-color-text-tertiary);
}

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .summary-metric:nth-child(4) {
    border-left: 0;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .summary-metric + .summary-metric {
    border-left: 0;
    border-top: 1px solid var(--product-color-border);
  }

  .volc-design-search-item-wrap,
  .product-filter-name,
  .filter-actions-bar {
    width: 100%;
    max-width: 100%;
  }

  .filter-actions-bar {
    justify-content: flex-start;
    margin-left: 0;
  }
}
</style>
