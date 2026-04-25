<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TableColumnData } from '@arco-design/web-vue'
import { IconRefresh, IconSettings } from '@arco-design/web-vue/es/icon'

type InventoryTab = 'product' | 'warehouse' | 'batch'

type InventoryRow = {
  id: string
  warehouse: string
  warehouseMeta: string
  productName: string
  sku: string
  storeName: string
  storePlatform: string
  brand: string
  stock: number
  deliveryType: 'FBS' | 'FBW'
  sellerCode: string
  barcode: string
  updatedAt: string
  nextUpdateAt: string
  thumbText: string
  thumbTone: string
}

const activeTab = ref<InventoryTab>('product')

const inventoryTabs: Array<{ key: InventoryTab; title: string }> = [
  { key: 'product', title: '产品库存' },
  { key: 'warehouse', title: '仓库库存' },
  { key: 'batch', title: '批次库存' },
]

const filters = ref({
  store: undefined,
  warehouse: undefined,
  deliveryType: undefined,
  brand: undefined,
  stockOperator: 'gte',
  stockValue: 0,
  keyword: '',
})

const summaryCards = [
  { label: '在库 SKU', value: '2,836', note: '产品库存已接入 12 个站点' },
  { label: '低库存预警', value: '128', note: '近 24 小时新增 19 个 SKU' },
  { label: '海外仓数量', value: '16', note: '覆盖俄区 / 欧区 / 中东仓' },
  { label: '下次同步', value: '10:30', note: '库存任务每 30 分钟刷新一次' },
]

const inventoryRows = ref<InventoryRow[]>([
  {
    id: '2050751433310',
    warehouse: '广州仓',
    warehouseMeta: '15-30 天 · 58 元/公斤+2 元',
    productName: 'Mechanical Keyboard PBT Keycap Set Asuka',
    sku: '2050751433310',
    storeName: '達焱國際有限公司',
    storePlatform: 'AliExpress',
    brand: 'KeyMood',
    stock: 90,
    deliveryType: 'FBS',
    sellerCode: 'JM0041',
    barcode: '2050751433310',
    updatedAt: '2026/04/25 10:00:20',
    nextUpdateAt: '2026/04/25 10:30',
    thumbText: 'AS',
    thumbTone: 'sunset',
  },
  {
    id: '2050751433280',
    warehouse: '广州仓',
    warehouseMeta: '15-30 天 · 58 元/公斤+2 元',
    productName: 'Mechanical Keyboard PBT Keycap Set Rei',
    sku: '2050751433280',
    storeName: '達焱國際有限公司',
    storePlatform: 'AliExpress',
    brand: 'KeyMood',
    stock: 90,
    deliveryType: 'FBS',
    sellerCode: 'JM0031',
    barcode: '2050751433280',
    updatedAt: '2026/04/25 10:00:20',
    nextUpdateAt: '2026/04/25 10:30',
    thumbText: 'RE',
    thumbTone: 'ice',
  },
  {
    id: '2050751433242',
    warehouse: '广州仓',
    warehouseMeta: '15-30 天 · 58 元/公斤+2 元',
    productName: 'Mechanical Keyboard PBT Keycap Set EVA',
    sku: '2050751433242',
    storeName: '達焱國際有限公司',
    storePlatform: 'AliExpress',
    brand: 'KeyMood',
    stock: 90,
    deliveryType: 'FBS',
    sellerCode: 'JM0021',
    barcode: '2050751433242',
    updatedAt: '2026/04/25 10:00:20',
    nextUpdateAt: '2026/04/25 10:30',
    thumbText: 'EV',
    thumbTone: 'violet',
  },
  {
    id: '2050691774191',
    warehouse: '莫斯科 CHI 仓库',
    warehouseMeta: '本地派送 · 核心补货仓',
    productName: 'SSD 1TB NV2 PCIe 3.0 NVMe M.2',
    sku: '020050000136',
    storeName: '達焱國際有限公司',
    storePlatform: 'CPU HOME',
    brand: 'Kingston',
    stock: 1,
    deliveryType: 'FBS',
    sellerCode: '020050000136',
    barcode: '020050000136',
    updatedAt: '2026/04/25 10:01:10',
    nextUpdateAt: '2026/04/25 10:30',
    thumbText: 'SD',
    thumbTone: 'slate',
  },
  {
    id: '2050691449136',
    warehouse: '华沙中转仓',
    warehouseMeta: '欧区快转 · 日均补货 2 次',
    productName: 'Foldable Storage Drawer Organizer Box',
    sku: '2050691449136',
    storeName: 'Nova Living',
    storePlatform: 'Ozon',
    brand: 'HomeEase',
    stock: 412,
    deliveryType: 'FBW',
    sellerCode: 'HZ-1184',
    barcode: '2050691449136',
    updatedAt: '2026/04/25 09:40:12',
    nextUpdateAt: '2026/04/25 10:30',
    thumbText: 'HB',
    thumbTone: 'mint',
  },
  {
    id: '2050691318661',
    warehouse: '迪拜海外仓',
    warehouseMeta: '中东专线 · 妥投率 98.2%',
    productName: 'Portable Blender Travel Cup',
    sku: '2050691318661',
    storeName: 'Nova Living',
    storePlatform: 'TikTok Shop',
    brand: 'BlendGo',
    stock: 56,
    deliveryType: 'FBW',
    sellerCode: 'DB-0192',
    barcode: '2050691318661',
    updatedAt: '2026/04/25 09:18:33',
    nextUpdateAt: '2026/04/25 10:30',
    thumbText: 'BL',
    thumbTone: 'coral',
  },
])

const columns: TableColumnData[] = [
  { title: '仓库', slotName: 'warehouse', width: 176, fixed: 'left' },
  { title: '图片', slotName: 'thumb', width: 86 },
  { title: '产品名称/SKU', slotName: 'product', width: 280 },
  { title: '店铺名称', slotName: 'store', width: 180 },
  { title: '品牌', dataIndex: 'brand', width: 120 },
  { title: '在库库存', slotName: 'stock', width: 120, sortable: { sortDirections: ['ascend', 'descend'] } },
  { title: '配送类型', dataIndex: 'deliveryType', width: 120 },
  { title: '卖家编码', dataIndex: 'sellerCode', width: 140 },
  { title: '条形码', dataIndex: 'barcode', width: 150 },
  { title: '更新时间', dataIndex: 'updatedAt', width: 168 },
  { title: '下次预计更新时间', slotName: 'nextUpdate', width: 176 },
]

const filteredRows = computed(() => {
  let rows = [...inventoryRows.value]

  if (filters.value.store) {
    rows = rows.filter((item) => item.storePlatform === filters.value.store)
  }

  if (filters.value.warehouse) {
    rows = rows.filter((item) => item.warehouse.includes(String(filters.value.warehouse)))
  }

  if (filters.value.deliveryType) {
    rows = rows.filter((item) => item.deliveryType === filters.value.deliveryType)
  }

  if (filters.value.brand) {
    rows = rows.filter((item) => item.brand === filters.value.brand)
  }

  const stockValue = Number(filters.value.stockValue ?? 0)
  if (stockValue > 0) {
    if (filters.value.stockOperator === 'lte') rows = rows.filter((item) => item.stock <= stockValue)
    if (filters.value.stockOperator === 'gte') rows = rows.filter((item) => item.stock >= stockValue)
  }

  if (filters.value.keyword.trim()) {
    const keyword = filters.value.keyword.trim().toLowerCase()
    rows = rows.filter((item) =>
      [item.sku, item.sellerCode, item.barcode, item.productName].some((field) =>
        field.toLowerCase().includes(keyword)
      )
    )
  }

  return rows
})

const stockStatusText = (stock: number) => {
  if (stock <= 10) return '紧张'
  if (stock <= 80) return '关注'
  return '健康'
}

const resetFilters = () => {
  filters.value = {
    store: undefined,
    warehouse: undefined,
    deliveryType: undefined,
    brand: undefined,
    stockOperator: 'gte',
    stockValue: 0,
    keyword: '',
  }
}
</script>

<template>
  <div class="inventory-page">
    <section class="page-head">
      <div class="page-copy">
        <h1>库存管理</h1>
        <p class="page-text">
          统一查看产品库存、仓库库存和批次库存状态，按店铺、仓库、配送类型和品牌快速筛选，作为仓储库存模块的核心工作台。
        </p>
      </div>
    </section>
    <div class="inventory-tabs-shell arco-tabs arco-tabs-horizontal arco-tabs-card-gutter arco-tabs-top arco-tabs-size-default finance-page-tabs">
      <div
        class="inventory-tabs arco-tabs-header-nav arco-tabs-header-nav-horizontal arco-tabs-header-nav-top arco-tabs-header-size-default arco-tabs-header-nav-card-gutter"
        role="tablist"
      >
        <div class="arco-tabs-header-scroll">
          <div class="arco-tabs-header-wrapper">
            <div class="arco-tabs-header">
              <div
                v-for="tab in inventoryTabs"
                :id="`inventory-tab-${tab.key}`"
                :key="tab.key"
                class="arco-tabs-header-title"
                :class="{ 'arco-tabs-header-title-active': activeTab === tab.key }"
                role="tab"
                :aria-selected="activeTab === tab.key"
                :aria-controls="`inventory-panel-${tab.key}`"
                tabindex="0"
                @click="activeTab = tab.key"
                @keydown.enter.prevent="activeTab = tab.key"
                @keydown.space.prevent="activeTab = tab.key"
              >
                <span class="arco-tabs-header-title-text">{{ tab.title }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="arco-tabs-content arco-tabs-content-horizontal inventory-tabs-content">
        <div class="arco-tabs-content-inner">
          <div
            :id="`inventory-panel-${activeTab}`"
            class="arco-tabs-content-item arco-tabs-content-item-active"
            role="tabpanel"
            tabindex="0"
            :aria-labelledby="`inventory-tab-${activeTab}`"
          >
            <div class="arco-tabs-pane">
              <div class="volc-design-common-table inventory-table-workspace">
                <section class="summary-strip">
                  <div class="summary-grid">
                    <div v-for="card in summaryCards" :key="card.label" class="summary-metric">
                      <span>{{ card.label }}</span>
                      <strong>{{ card.value }}</strong>
                      <small>{{ card.note }}</small>
                    </div>
                  </div>
                </section>

                <div class="filter-panel-shell volc-design-common-table-query">
                  <div class="filter-panel">
                    <div class="filter-row">
                      <div class="volc-design-search-item-wrap volc-design-auto-height-wrap">
                        <div class="volc-design-search-item-label volc-design-search-item-custom-label">
                          <span>店铺</span>
                        </div>
                        <a-select v-model="filters.store" placeholder="请选择店铺" allow-clear class="volc-design-search-item">
                          <a-option value="AliExpress">AliExpress</a-option>
                          <a-option value="Ozon">Ozon</a-option>
                          <a-option value="TikTok Shop">TikTok Shop</a-option>
                          <a-option value="CPU HOME">CPU HOME</a-option>
                        </a-select>
                      </div>

                      <div class="volc-design-search-item-wrap volc-design-auto-height-wrap">
                        <div class="volc-design-search-item-label volc-design-search-item-custom-label">
                          <span>仓库</span>
                        </div>
                        <a-select v-model="filters.warehouse" placeholder="请选择仓库" allow-clear class="volc-design-search-item">
                          <a-option value="广州仓">广州仓</a-option>
                          <a-option value="莫斯科">莫斯科 CHI 仓库</a-option>
                          <a-option value="华沙">华沙中转仓</a-option>
                          <a-option value="迪拜">迪拜海外仓</a-option>
                        </a-select>
                      </div>

                      <div class="volc-design-search-item-wrap volc-design-auto-height-wrap">
                        <div class="volc-design-search-item-label volc-design-search-item-custom-label">
                          <span>配送类型</span>
                        </div>
                        <a-select v-model="filters.deliveryType" placeholder="请选择配送类型" allow-clear class="volc-design-search-item">
                          <a-option value="FBS">FBS</a-option>
                          <a-option value="FBW">FBW</a-option>
                        </a-select>
                      </div>

                      <div class="volc-design-search-item-wrap volc-design-auto-height-wrap">
                        <div class="volc-design-search-item-label volc-design-search-item-custom-label">
                          <span>品牌</span>
                        </div>
                        <a-select v-model="filters.brand" placeholder="请选择品牌" allow-clear class="volc-design-search-item">
                          <a-option value="KeyMood">KeyMood</a-option>
                          <a-option value="Kingston">Kingston</a-option>
                          <a-option value="HomeEase">HomeEase</a-option>
                          <a-option value="BlendGo">BlendGo</a-option>
                        </a-select>
                      </div>

                      <div class="volc-design-search-item-wrap volc-design-auto-height-wrap filter-stock-range">
                        <div class="volc-design-search-item-label volc-design-search-item-custom-label">
                          <span>在库库存</span>
                        </div>
                        <div class="stock-filter-combo">
                          <a-select v-model="filters.stockOperator" class="stock-operator" :style="{ width: '112px' }">
                            <a-option value="gte">≥</a-option>
                            <a-option value="lte">≤</a-option>
                          </a-select>
                          <a-input-number
                            v-model="filters.stockValue"
                            :min="0"
                            hide-button
                            class="stock-value"
                            placeholder="请输入"
                            :style="{ width: '100%' }"
                          />
                        </div>
                      </div>

                      <div class="volc-design-search-item-wrap volc-design-auto-height-wrap">
                        <div class="volc-design-search-item-label">
                          <span>关键词</span>
                        </div>
                        <a-input-search
                          v-model="filters.keyword"
                          allow-clear
                          placeholder="搜索 sku / 卖家编号 / 条形码"
                          class="volc-design-search-item filter-search"
                        />
                      </div>

                      <div class="filter-actions-bar">
                        <a-button type="primary" class="volc-design-button">查询</a-button>
                        <a-button class="volc-design-button" @click="resetFilters">重置</a-button>
                        <a-button size="small" class="filter-icon-button" aria-label="筛选字段">
                          <template #icon>
                            <icon-settings />
                          </template>
                        </a-button>
                        <a-button size="small" class="filter-icon-button" aria-label="刷新">
                          <template #icon>
                            <icon-refresh />
                          </template>
                        </a-button>
                      </div>
                    </div>
                  </div>
                </div>

                <a-card class="workspace-card inventory-card" :bordered="false">
      <a-table
        :columns="columns"
        :data="filteredRows"
        row-key="id"
        :pagination="{ total: 2836, pageSize: 10, showTotal: true, showJumper: true, showPageSize: true }"
        :scroll="{ x: 1660 }"
        class="inventory-table"
      >
        <template #warehouse="{ record }">
          <div class="warehouse-cell">
            <strong>{{ record.warehouse }}</strong>
            <span>{{ record.warehouseMeta }}</span>
          </div>
        </template>

        <template #thumb="{ record }">
          <div class="thumb-card" :class="`tone-${record.thumbTone}`">{{ record.thumbText }}</div>
        </template>

        <template #product="{ record }">
          <div class="product-cell">
            <a-link>{{ record.productName }}</a-link>
            <span>{{ record.sku }}</span>
          </div>
        </template>

        <template #store="{ record }">
          <div class="store-cell">
            <strong>{{ record.storeName }}</strong>
            <span>{{ record.storePlatform }}</span>
          </div>
        </template>

        <template #stock="{ record }">
          <div class="stock-cell">
            <strong>{{ record.stock }}</strong>
            <a-tag :color="record.stock <= 10 ? 'red' : record.stock <= 80 ? 'orange' : 'green'">
              {{ stockStatusText(record.stock) }}
            </a-tag>
          </div>
        </template>

        <template #nextUpdate="{ record }">
          <span class="next-update">{{ record.nextUpdateAt }}</span>
        </template>
      </a-table>
                </a-card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inventory-page {
  --inventory-color-primary: rgb(var(--primary-6));
  --inventory-color-primary-strong: rgb(var(--primary-7));
  --inventory-color-text: var(--color-text-1);
  --inventory-color-text-secondary: var(--color-text-2);
  --inventory-color-text-tertiary: var(--color-text-3);
  --inventory-color-bg: var(--color-bg-2);
  --inventory-color-fill: var(--color-fill-1);
  --inventory-color-border: var(--color-border-2);
  --inventory-color-control-border: var(--color-border-2);
  --inventory-control-height: var(--size-default, 32px);
  --inventory-radius: var(--border-radius-medium);
  --inventory-radius-small: var(--border-radius-small);
  display: flex;
  flex-direction: column;
  gap: 14px;
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

.eyebrow {
  margin: 0 0 8px;
  color: var(--inventory-color-primary);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.page-head h1 {
  margin: 0 0 8px;
  color: var(--inventory-color-text);
  font-size: 30px;
  line-height: 1.2;
}

.page-text {
  max-width: 860px;
  margin: 0;
  color: var(--inventory-color-text-secondary);
  font-size: 14px;
  line-height: 1.7;
}

.summary-strip,
.workspace-card {
  overflow: hidden;
  border: 1px solid var(--inventory-color-border);
  border-radius: 8px;
  background: var(--inventory-color-bg);
  box-shadow: none;
}

.summary-strip {
  margin-bottom: 16px;
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
  border-left: 1px solid var(--inventory-color-border);
}

.summary-metric span {
  margin-bottom: 8px;
  color: var(--inventory-color-text-secondary);
  font-size: 13px;
  line-height: 20px;
}

.summary-metric strong {
  margin-bottom: 6px;
  color: var(--inventory-color-text);
  font-size: 26px;
  font-weight: 600;
  line-height: 32px;
}

.summary-metric small {
  color: var(--inventory-color-text-tertiary);
  font-size: 12px;
  line-height: 18px;
}

.inventory-tabs-shell {
  border-bottom: 0;
  position: relative;
  overflow: visible;
}

.inventory-tabs {
  position: relative;
  z-index: 1;
  margin: 0;
  width: 100%;
}

.finance-page-tabs .arco-tabs-header-nav::before {
  position: absolute;
  right: -32px;
  bottom: 0;
  left: -32px;
  z-index: 0;
  height: 1px;
  background: var(--inventory-color-border);
  content: '';
}

.inventory-tabs .arco-tabs-header-scroll,
.inventory-tabs .arco-tabs-header-wrapper {
  overflow: visible;
}

.inventory-tabs .arco-tabs-header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-end;
}

.inventory-tabs .arco-tabs-header-title {
  position: relative;
  z-index: 1;
  margin: 0 0 0 4px;
  padding: 7px 16px;
  border-radius: var(--inventory-radius-small) var(--inventory-radius-small) 0 0;
  box-shadow:
    inset 0 1px 0 var(--inventory-color-border),
    inset -1px 0 0 var(--inventory-color-border),
    inset 1px 0 0 var(--inventory-color-border);
  background: var(--inventory-color-fill);
  color: var(--inventory-color-text-secondary);
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  cursor: pointer;
  user-select: none;
  transition: none;
}

.inventory-tabs .arco-tabs-header-title:hover,
.inventory-tabs .arco-tabs-header-title:active,
.inventory-tabs .arco-tabs-header-title:focus,
.inventory-tabs .arco-tabs-header-title:focus-visible {
  background: var(--inventory-color-fill);
  outline: none;
}

.inventory-tabs .arco-tabs-header-title-text {
  position: relative;
  z-index: 1;
  padding: 0;
}

.inventory-tabs .arco-tabs-header-title:first-child {
  margin-left: 0;
}

.inventory-tabs .arco-tabs-header-title::after {
  position: absolute;
  bottom: 0;
  left: 1px;
  width: calc(100% - 2px);
  height: 1px;
  background: var(--inventory-color-border);
  content: '';
}

.inventory-tabs .arco-tabs-header-title-active {
  position: relative;
  z-index: 2;
  color: var(--inventory-color-primary);
  box-shadow:
    inset 0 2px 0 var(--inventory-color-primary-strong),
    inset -1px 0 0 var(--inventory-color-border),
    inset 1px 0 0 var(--inventory-color-border);
  background: var(--inventory-color-bg);
}

.inventory-tabs .arco-tabs-header-title-active:hover,
.inventory-tabs .arco-tabs-header-title-active:active,
.inventory-tabs .arco-tabs-header-title-active:focus,
.inventory-tabs .arco-tabs-header-title-active:focus-visible {
  background: var(--inventory-color-bg);
}

.inventory-tabs .arco-tabs-header-title-active::after {
  background: var(--inventory-color-bg);
}

.filter-panel-shell {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.inventory-card {
  overflow: hidden;
  border: 0;
  border-radius: 0;
  background: var(--inventory-color-bg);
}

.inventory-card :deep(.arco-card-body) {
  padding: 0;
}

.filter-panel {
  padding: 4px 0 0;
  background: var(--inventory-color-bg);
}

.filter-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
}

.volc-design-search-item-wrap {
  display: flex;
  width: 320px;
  max-width: 320px;
  align-items: stretch;
}

.volc-design-search-item-wrap:hover :deep(.arco-select-view-single),
.volc-design-search-item-wrap:focus-within :deep(.arco-select-view-single),
.volc-design-search-item-wrap:hover :deep(.arco-input-wrapper),
.volc-design-search-item-wrap:focus-within :deep(.arco-input-wrapper),
.volc-design-search-item-wrap:hover :deep(.arco-input-number),
.volc-design-search-item-wrap:focus-within :deep(.arco-input-number) {
  border-color: var(--inventory-color-primary);
}

.volc-design-search-item-wrap:hover :deep(.arco-select-view-single),
.volc-design-search-item-wrap:focus-within :deep(.arco-select-view-single),
.volc-design-search-item-wrap:hover :deep(.arco-input-wrapper),
.volc-design-search-item-wrap:focus-within :deep(.arco-input-wrapper),
.volc-design-search-item-wrap:hover :deep(.arco-input-number),
.volc-design-search-item-wrap:focus-within :deep(.arco-input-number) {
  box-shadow: 0 4px 10px rgba(var(--primary-6), 0.12);
}

.volc-design-search-item-label {
  display: flex;
  height: var(--inventory-control-height);
  align-items: center;
  flex-shrink: 0;
  padding: 0 16px;
  border: 1px solid var(--inventory-color-control-border);
  border-right: 0;
  border-radius: var(--inventory-radius) 0 0 var(--inventory-radius);
  background: var(--inventory-color-bg);
  color: var(--inventory-color-text-secondary);
  font-size: 14px;
  line-height: var(--inventory-control-height);
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
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.volc-design-button {
  height: var(--inventory-control-height);
}

.filter-icon-button {
  width: var(--inventory-control-height);
  height: var(--inventory-control-height);
  padding: 0;
  border-color: var(--inventory-color-control-border);
  border-radius: var(--inventory-radius);
  background: var(--inventory-color-bg);
  color: var(--inventory-color-text-secondary);
  box-shadow: none;
}

.filter-icon-button:hover,
.filter-icon-button:focus-visible {
  border-color: var(--inventory-color-primary);
  background: var(--inventory-color-bg);
  color: var(--inventory-color-text-secondary);
  box-shadow: 0 4px 10px rgba(var(--primary-6), 0.16);
}

.stock-filter-combo {
  display: flex;
  min-width: 0;
  flex: 1;
}

.stock-operator {
  width: 112px !important;
  min-width: 112px;
  flex: 0 0 112px;
}

.stock-value {
  width: auto !important;
  display: block;
  min-width: 0;
  flex: 1;
  margin-left: -1px;
}

.stock-filter-combo :deep(.stock-operator) {
  width: 112px !important;
  min-width: 112px;
  flex: 0 0 112px;
}

.stock-filter-combo :deep(.stock-value) {
  width: auto !important;
  min-width: 0;
  flex: 1 1 auto;
}

.stock-value :deep(.arco-input-number-step) {
  display: none;
}

.toolbar-actions :deep(.arco-btn),
.filter-actions :deep(.arco-btn) {
  border-color: var(--inventory-color-border);
  background: var(--inventory-color-bg);
  box-shadow: none;
  height: var(--inventory-control-height);
  padding: 0 12px;
  color: var(--inventory-color-text-secondary);
}

.filter-actions :deep(.arco-btn-primary) {
  border-color: var(--inventory-color-primary);
  background: var(--inventory-color-primary);
  color: var(--inventory-color-bg);
}

.filter-panel :deep(.arco-select-view-single),
.filter-panel :deep(.arco-input-wrapper),
.filter-panel :deep(.arco-input-number),
.filter-panel :deep(.arco-picker) {
  height: var(--inventory-control-height);
  border-color: var(--inventory-color-control-border);
  border-radius: 0 var(--inventory-radius) var(--inventory-radius) 0;
  background: var(--inventory-color-bg);
  box-shadow: none;
}

.filter-panel :deep(.volc-design-search-item .arco-select-view-single),
.filter-panel :deep(.volc-design-search-item .arco-input-wrapper) {
  margin-left: -1px;
}

.stock-filter-combo :deep(.arco-select-view-single) {
  border-radius: 0;
}

.stock-value :deep(.arco-input-number) {
  display: flex;
  width: 100%;
  border-radius: 0 var(--inventory-radius) var(--inventory-radius) 0;
}

.stock-value :deep(.arco-input-number-input) {
  width: 100%;
}

.filter-panel :deep(.arco-select-view-value),
.filter-panel :deep(.arco-input),
.filter-panel :deep(.arco-input-number-input) {
  font-size: 13px;
}

.inventory-table :deep(.arco-table-th) {
  background: var(--inventory-color-fill);
  color: var(--inventory-color-text-secondary);
  font-weight: 600;
}

.inventory-table :deep(.arco-table-container) {
  overflow: hidden;
  border: 1px solid #e9edf3;
  border-radius: var(--inventory-radius);
}

.inventory-table :deep(.arco-table-border .arco-table-container::before),
.inventory-table :deep(.arco-table-border .arco-table-container::after),
.inventory-table :deep(.arco-table-border .arco-table-container .arco-table),
.inventory-table :deep(.arco-table-border .arco-table-tr::after),
.inventory-table :deep(.arco-table-border .arco-table-th),
.inventory-table :deep(.arco-table-border .arco-table-td) {
  border-color: #e9edf3;
}

.inventory-table :deep(.arco-table-border .arco-table-container::before),
.inventory-table :deep(.arco-table-border .arco-table-container::after) {
  display: none;
}

.inventory-table :deep(.arco-table-td) {
  background: var(--inventory-color-bg);
  vertical-align: top;
}

.inventory-table :deep(.arco-table-tr:hover .arco-table-td) {
  background: #fbfcff;
}

.inventory-table :deep(.arco-pagination) {
  padding: 16px 18px 18px;
}

.warehouse-cell,
.product-cell,
.store-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.warehouse-cell strong,
.store-cell strong {
  color: var(--inventory-color-text);
  font-size: 13px;
}

.warehouse-cell span,
.product-cell span,
.store-cell span {
  color: var(--inventory-color-text-tertiary);
  font-size: 12px;
  line-height: 1.5;
}

.thumb-card {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 10px;
  color: var(--inventory-color-bg);
  font-size: 12px;
  font-weight: 700;
}

.tone-sunset {
  background: linear-gradient(135deg, #ff7d00, #f53f3f);
}

.tone-ice {
  background: linear-gradient(135deg, #3c7eff, #00b2ff);
}

.tone-violet {
  background: linear-gradient(135deg, #7b61ff, #9f7aea);
}

.tone-slate {
  background: linear-gradient(135deg, var(--inventory-color-text-secondary), var(--inventory-color-text-tertiary));
}

.tone-mint {
  background: linear-gradient(135deg, #00b42a, #7bc616);
}

.tone-coral {
  background: linear-gradient(135deg, #ff5722, #ff9a62);
}

.stock-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stock-cell strong {
  color: var(--inventory-color-text);
  font-size: 13px;
}

.next-update {
  color: #ff7d00;
  font-weight: 500;
}

@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: 1fr 1fr;
  }

  .filter-search {
    width: 100%;
    margin-left: 0;
  }

  .toolbar-actions,
  .filter-row,
  .filter-actions {
    align-items: stretch;
    flex-direction: column;
    width: 100%;
  }

  .filter-row :deep(.arco-select),
  .filter-row :deep(.arco-input-number),
  .filter-row :deep(.arco-input-search) {
    width: 100% !important;
  }

  .filter-actions {
    margin-left: 0;
  }
}
</style>
