<script setup lang="ts">
import { computed, ref } from 'vue'
import { IconRefresh, IconSettings } from '@arco-design/web-vue/es/icon'
import ConfigurableDataTable from '../components/common/ConfigurableDataTable.vue'
import MetricSummaryStrip from '../components/common/MetricSummaryStrip.vue'
import QueryActionBar from '../components/common/QueryActionBar.vue'
import QueryFilterItem from '../components/common/QueryFilterItem.vue'
import QueryFilterPanel from '../components/common/QueryFilterPanel.vue'
import type { ConfigurableTableColumn } from '../data/configurableTable'

type InventoryTab = 'product' | 'warehouse' | 'batch'
type InventoryColumnKey =
  | 'warehouse'
  | 'thumb'
  | 'product'
  | 'store'
  | 'brand'
  | 'stock'
  | 'deliveryType'
  | 'sellerCode'
  | 'barcode'
  | 'updatedAt'
  | 'nextUpdate'

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
  thumbUrl: string
  thumbText: string
  thumbTone: string
}

type InventoryTableColumnData = ConfigurableTableColumn<InventoryColumnKey> & { title: string }

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
const pagination = ref({
  page: 1,
  pageSize: 10,
})

const summaryCards = [
  { label: '在库 SKU', value: '2,836', note: '产品库存已接入 12 个站点' },
  { label: '低库存预警', value: '128', note: '近 24 小时新增 19 个 SKU' },
  { label: '海外仓数量', value: '16', note: '覆盖俄区 / 欧区 / 中东仓' },
  { label: '下次同步', value: '10:30', note: '库存任务每 30 分钟刷新一次' },
]

const createThumbUrl = (label: string, colors: [string, string], shape: 'keyboard' | 'ssd' | 'drawer' | 'blender') => {
  const [from, to] = colors
  const shapeMarkup = {
    keyboard: `
      <rect x="13" y="22" width="54" height="32" rx="7" fill="rgba(255,255,255,.92)"/>
      <g fill="rgba(30,41,59,.34)">
        <rect x="19" y="28" width="6" height="5" rx="1"/>
        <rect x="28" y="28" width="6" height="5" rx="1"/>
        <rect x="37" y="28" width="6" height="5" rx="1"/>
        <rect x="46" y="28" width="6" height="5" rx="1"/>
        <rect x="55" y="28" width="6" height="5" rx="1"/>
        <rect x="19" y="37" width="36" height="5" rx="1"/>
        <rect x="58" y="37" width="6" height="5" rx="1"/>
      </g>
    `,
    ssd: `
      <rect x="19" y="13" width="42" height="54" rx="7" fill="rgba(255,255,255,.92)"/>
      <rect x="27" y="23" width="26" height="8" rx="2" fill="rgba(30,41,59,.34)"/>
      <circle cx="31" cy="54" r="3" fill="rgba(30,41,59,.28)"/>
      <circle cx="49" cy="54" r="3" fill="rgba(30,41,59,.28)"/>
    `,
    drawer: `
      <rect x="17" y="18" width="46" height="45" rx="8" fill="rgba(255,255,255,.92)"/>
      <rect x="23" y="26" width="34" height="8" rx="2" fill="rgba(30,41,59,.24)"/>
      <rect x="23" y="39" width="34" height="8" rx="2" fill="rgba(30,41,59,.2)"/>
      <rect x="23" y="52" width="34" height="5" rx="2" fill="rgba(30,41,59,.18)"/>
    `,
    blender: `
      <path d="M29 18h22l-3 30H32L29 18Z" fill="rgba(255,255,255,.92)"/>
      <rect x="31" y="49" width="18" height="11" rx="3" fill="rgba(255,255,255,.88)"/>
      <path d="M35 37c4-4 8 4 12-1" stroke="rgba(30,41,59,.28)" stroke-width="3" stroke-linecap="round"/>
    `,
  }[shape]

  const svg = `
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="16" fill="url(#bg)"/>
      <circle cx="66" cy="15" r="18" fill="rgba(255,255,255,.16)"/>
      <circle cx="14" cy="68" r="20" fill="rgba(255,255,255,.12)"/>
      ${shapeMarkup}
      <text x="40" y="75" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" font-weight="700" fill="rgba(255,255,255,.76)">${label}</text>
      <defs>
        <linearGradient id="bg" x1="8" y1="8" x2="74" y2="76" gradientUnits="userSpaceOnUse">
          <stop stop-color="${from}"/>
          <stop offset="1" stop-color="${to}"/>
        </linearGradient>
      </defs>
    </svg>
  `

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

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
    thumbUrl: createThumbUrl('AS', ['#ff8a3d', '#ef4444'], 'keyboard'),
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
    thumbUrl: createThumbUrl('RE', ['#3c7eff', '#00b2ff'], 'keyboard'),
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
    thumbUrl: createThumbUrl('EV', ['#7b61ff', '#9f7aea'], 'keyboard'),
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
    thumbUrl: createThumbUrl('SD', ['#64748b', '#334155'], 'ssd'),
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
    thumbUrl: createThumbUrl('HB', ['#22c55e', '#65a30d'], 'drawer'),
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
    thumbUrl: createThumbUrl('BL', ['#ff7a45', '#f43f5e'], 'blender'),
    thumbText: 'BL',
    thumbTone: 'coral',
  },
])

const defaultVisibleColumnKeys: InventoryColumnKey[] = [
  'warehouse',
  'thumb',
  'product',
  'store',
  'brand',
  'stock',
  'deliveryType',
  'sellerCode',
  'barcode',
  'updatedAt',
  'nextUpdate',
]

const requiredColumnKeys: InventoryColumnKey[] = ['warehouse', 'product']
const columnSettingsVisible = ref(false)

const allColumns: InventoryTableColumnData[] = [
  { settingsKey: 'warehouse', title: '仓库', slotName: 'warehouse', width: 176, minWidth: 132 },
  { settingsKey: 'thumb', title: '图片', slotName: 'thumb', width: 86, minWidth: 72 },
  { settingsKey: 'product', title: '产品名称/SKU', slotName: 'product', width: 280, minWidth: 220 },
  { settingsKey: 'store', title: '店铺名称', slotName: 'store', width: 180, minWidth: 150 },
  { settingsKey: 'brand', title: '品牌', dataIndex: 'brand', width: 120, minWidth: 96 },
  { settingsKey: 'stock', title: '在库库存', slotName: 'stock', width: 120, minWidth: 104, align: 'right', sortable: { sortDirections: ['ascend', 'descend'] } },
  { settingsKey: 'deliveryType', title: '配送类型', dataIndex: 'deliveryType', width: 120, minWidth: 104 },
  { settingsKey: 'sellerCode', title: '卖家编码', dataIndex: 'sellerCode', width: 140, minWidth: 116 },
  { settingsKey: 'barcode', title: '条形码', dataIndex: 'barcode', width: 150, minWidth: 116 },
  { settingsKey: 'updatedAt', title: '更新时间', dataIndex: 'updatedAt', width: 168, minWidth: 132 },
  { settingsKey: 'nextUpdate', title: '下次预计更新时间', slotName: 'nextUpdate', width: 176, minWidth: 148 },
]

const openColumnSettings = () => {
  columnSettingsVisible.value = true
}

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

const pagedRows = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.pageSize
  return filteredRows.value.slice(start, start + pagination.value.pageSize)
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
  pagination.value = {
    ...pagination.value,
    page: 1,
  }
}

</script>

<template>
  <div class="inventory-page">
    <section class="page-head">
      <div class="page-title">
        <span>库存管理</span>
      </div>
      <p class="page-description">统一查看产品库存、仓库库存和批次库存状态，按店铺、仓库、配送类型和品牌快速筛选，作为仓储库存模块的核心工作台。</p>
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
                <MetricSummaryStrip class="inventory-summary" :cards="summaryCards" />

                <QueryFilterPanel class="inventory-filter-panel">
                  <QueryFilterItem label="店铺">
                    <a-select v-model="filters.store" placeholder="请选择店铺" allow-clear class="volc-design-search-item">
                      <a-option value="AliExpress">AliExpress</a-option>
                      <a-option value="Ozon">Ozon</a-option>
                      <a-option value="TikTok Shop">TikTok Shop</a-option>
                      <a-option value="CPU HOME">CPU HOME</a-option>
                    </a-select>
                  </QueryFilterItem>

                  <QueryFilterItem label="仓库">
                    <a-select v-model="filters.warehouse" placeholder="请选择仓库" allow-clear class="volc-design-search-item">
                      <a-option value="广州仓">广州仓</a-option>
                      <a-option value="莫斯科">莫斯科 CHI 仓库</a-option>
                      <a-option value="华沙">华沙中转仓</a-option>
                      <a-option value="迪拜">迪拜海外仓</a-option>
                    </a-select>
                  </QueryFilterItem>

                  <QueryFilterItem label="配送类型">
                    <a-select v-model="filters.deliveryType" placeholder="请选择配送类型" allow-clear class="volc-design-search-item">
                      <a-option value="FBS">FBS</a-option>
                      <a-option value="FBW">FBW</a-option>
                    </a-select>
                  </QueryFilterItem>

                  <QueryFilterItem label="品牌">
                    <a-select v-model="filters.brand" placeholder="请选择品牌" allow-clear class="volc-design-search-item">
                      <a-option value="KeyMood">KeyMood</a-option>
                      <a-option value="Kingston">Kingston</a-option>
                      <a-option value="HomeEase">HomeEase</a-option>
                      <a-option value="BlendGo">BlendGo</a-option>
                    </a-select>
                  </QueryFilterItem>

                  <QueryFilterItem label="在库库存" class="filter-stock-range">
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
                  </QueryFilterItem>

                  <QueryFilterItem label="关键词">
                    <a-input-search
                      v-model="filters.keyword"
                      allow-clear
                      placeholder="搜索 sku / 卖家编号 / 条形码"
                      class="volc-design-search-item filter-search"
                    />
                  </QueryFilterItem>

                  <QueryActionBar>
                    <a-button type="primary" class="volc-design-button">查询</a-button>
                    <a-button class="volc-design-button" @click="resetFilters">重置</a-button>
                    <a-tooltip content="定制列">
                      <a-button size="small" class="filter-icon-button" aria-label="定制列" @click="openColumnSettings">
                        <template #icon>
                          <icon-settings />
                        </template>
                      </a-button>
                    </a-tooltip>
                    <a-tooltip content="刷新">
                      <a-button size="small" class="filter-icon-button" aria-label="刷新">
                        <template #icon>
                          <icon-refresh />
                        </template>
                      </a-button>
                    </a-tooltip>
                  </QueryActionBar>
                </QueryFilterPanel>

                <ConfigurableDataTable
                  v-model:settings-visible="columnSettingsVisible"
                  :columns="allColumns"
                  :default-visible-keys="defaultVisibleColumnKeys"
                  :required-keys="requiredColumnKeys"
                  :data="pagedRows"
                  row-key="id"
                  :pagination="false"
                  table-class="inventory-table"
                >
                  <template #warehouse="{ record }">
                    <div class="warehouse-cell">
                      <strong>{{ record.warehouse }}</strong>
                      <span>{{ record.warehouseMeta }}</span>
                    </div>
                  </template>

                  <template #thumb="{ record }">
                    <div class="thumb-card" :class="`tone-${record.thumbTone}`">
                      <img
                        v-if="record.thumbUrl"
                        class="thumb-image"
                        :src="record.thumbUrl"
                        :alt="record.productName"
                        loading="lazy"
                        @error="record.thumbUrl = ''"
                      />
                      <span v-else>{{ record.thumbText }}</span>
                    </div>
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

                  <template #footer>
                    <a-pagination
                      v-model:current="pagination.page"
                      v-model:page-size="pagination.pageSize"
                      :total="filteredRows.length"
                      :page-size-options="[10, 20, 50, 100]"
                      show-total
                      show-jumper
                      show-page-size
                    />
                  </template>
                </ConfigurableDataTable>
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
  --workspace-color-primary: var(--inventory-color-primary);
  --workspace-color-text: var(--inventory-color-text);
  --workspace-color-text-secondary: var(--inventory-color-text-secondary);
  --workspace-color-text-tertiary: var(--inventory-color-text-tertiary);
  --workspace-color-bg: var(--inventory-color-bg);
  --workspace-color-fill: var(--inventory-color-fill);
  --workspace-color-border: var(--inventory-color-border);
  --workspace-color-control-border: var(--inventory-color-control-border);
  --workspace-control-height: var(--inventory-control-height);
  --workspace-radius: var(--inventory-radius);
  display: flex;
  flex-direction: column;
  gap: 0;
}

.page-head {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 16px 2px 10px;
}

.page-title {
  display: flex;
  min-width: 0;
  align-items: center;
}

.page-title span {
  color: var(--inventory-color-text);
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
}

.page-description {
  margin: 2px 0 0;
  color: var(--inventory-color-text-secondary);
  font-size: 13px;
  line-height: 20px;
}

.inventory-summary,
.inventory-filter-panel {
  margin-bottom: 16px;
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
    inset 0 2px 0 var(--inventory-color-primary),
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

.volc-design-button {
  height: var(--inventory-control-height);
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

.inventory-table:not(.is-auto-wrap) :deep(.arco-table-td) {
  white-space: nowrap;
}

.inventory-table:not(.is-auto-wrap) :deep(.product-cell a),
.inventory-table:not(.is-auto-wrap) :deep(.product-cell span) {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  display: flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 10px;
  color: var(--inventory-color-bg);
  font-size: 12px;
  font-weight: 700;
}

.thumb-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  justify-content: flex-end;
  gap: 8px;
  text-align: right;
}

.stock-cell strong {
  color: var(--inventory-color-text);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  min-width: 32px;
  text-align: right;
}

.next-update {
  color: #ff7d00;
  font-weight: 500;
}
</style>
