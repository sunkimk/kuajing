<script setup lang="ts">
import { computed, ref } from 'vue'
import { IconRefresh, IconSettings } from '@arco-design/web-vue/es/icon'
import type { ConfigurableTableColumn } from '../../data/configurableTable'
import MetricSummaryStrip from '../common/MetricSummaryStrip.vue'
import QueryActionBar from '../common/QueryActionBar.vue'
import QueryFilterItem from '../common/QueryFilterItem.vue'
import QueryFilterPanel from '../common/QueryFilterPanel.vue'
import ConfigurableDataTable from '../common/ConfigurableDataTable.vue'
import SalesSecondaryDetailDrawer from './SalesSecondaryDetailDrawer.vue'
import './salesWorkbench.css'
import {
  createDefaultSalesSecondaryFilters,
  createSalesSecondaryRows,
  createSalesSecondarySummaryCards,
  filterSalesSecondaryRows,
  getSalesSecondaryStatusClass,
  getSalesSecondaryStatusLabel,
  paginateSalesSecondaryRows,
  salesSecondaryBrandOptions,
  salesSecondaryCategoryOptions,
  salesSecondaryShopOptions,
  salesSecondaryStatusOptions,
  type SalesSecondaryFilters,
  type SalesSecondaryPagination,
  type SalesSecondaryRow,
} from '../../data/salesSecondary'

type SalesSecondaryColumnKey =
  | 'shkId'
  | 'product'
  | 'shopName'
  | 'barcode'
  | 'brand'
  | 'category'
  | 'saleCount'
  | 'firstOrderDate'
  | 'lastOrderDate'
  | 'deliveryFee'
  | 'finalStatus'

type SalesSecondaryTableColumnData = ConfigurableTableColumn<SalesSecondaryColumnKey> & { title: string }

const filters = ref<SalesSecondaryFilters>(createDefaultSalesSecondaryFilters())
const pagination = ref<SalesSecondaryPagination>({ page: 1, pageSize: 10 })
const loading = ref(false)
const detailVisible = ref(false)
const settingsVisible = ref(false)
const currentRow = ref<SalesSecondaryRow>()
const allRows = ref(createSalesSecondaryRows())

const filteredRows = computed(() => filterSalesSecondaryRows(allRows.value, filters.value))
const pagedRows = computed(() => paginateSalesSecondaryRows(filteredRows.value, pagination.value))
const summaryCards = computed(() => createSalesSecondarySummaryCards(filteredRows.value))

const currentPage = computed({
  get: () => pagination.value.page,
  set: (page: number) => {
    pagination.value = { ...pagination.value, page }
  },
})

const pageSize = computed({
  get: () => pagination.value.pageSize,
  set: (nextPageSize: number) => {
    pagination.value = { page: 1, pageSize: nextPageSize }
  },
})

const defaultVisibleKeys: SalesSecondaryColumnKey[] = [
  'shkId',
  'product',
  'shopName',
  'barcode',
  'brand',
  'category',
  'saleCount',
  'firstOrderDate',
  'lastOrderDate',
  'deliveryFee',
  'finalStatus',
]

const requiredKeys: SalesSecondaryColumnKey[] = ['shkId', 'product']
const pinnedColumnKeys: SalesSecondaryColumnKey[] = ['shkId']

const columns: SalesSecondaryTableColumnData[] = [
  { settingsKey: 'shkId', title: 'SHK ID', dataIndex: 'shkId', slotName: 'shkId', width: 132, minWidth: 120 },
  { settingsKey: 'product', title: '商品', dataIndex: 'product', slotName: 'product', width: 230, minWidth: 210, align: 'left' },
  { settingsKey: 'shopName', title: '店铺', dataIndex: 'shopName', slotName: 'shopName', width: 180, minWidth: 160, align: 'left' },
  { settingsKey: 'barcode', title: '条码', dataIndex: 'barcode', slotName: 'barcode', width: 142, minWidth: 132 },
  { settingsKey: 'brand', title: '品牌', dataIndex: 'brand', width: 108, minWidth: 100, align: 'center' },
  { settingsKey: 'category', title: '品类', dataIndex: 'category', width: 108, minWidth: 100, align: 'center' },
  { settingsKey: 'saleCount', title: '销售次数', dataIndex: 'saleCount', width: 96, minWidth: 88, align: 'center' },
  { settingsKey: 'firstOrderDate', title: '首次下单', dataIndex: 'firstOrderDate', width: 118, minWidth: 108, align: 'center' },
  { settingsKey: 'lastOrderDate', title: '末次下单', dataIndex: 'lastOrderDate', width: 118, minWidth: 108, align: 'center' },
  { settingsKey: 'deliveryFee', title: '配送费用', dataIndex: 'deliveryFee', slotName: 'deliveryFee', width: 116, minWidth: 104, align: 'right' },
  { settingsKey: 'finalStatus', title: '最终状态', dataIndex: 'finalStatus', slotName: 'finalStatus', width: 104, minWidth: 96, align: 'center' },
  { title: '操作', slotName: 'operation', width: 82, align: 'center' },
]

const handleSearch = () => {
  pagination.value = { ...pagination.value, page: 1 }
}

const resetFilters = () => {
  filters.value = createDefaultSalesSecondaryFilters()
  handleSearch()
}

const refreshData = () => {
  loading.value = true
  allRows.value = createSalesSecondaryRows()
  loading.value = false
}

const openDetail = (row: SalesSecondaryRow) => {
  currentRow.value = row
  detailVisible.value = true
}

const formatMoney = (value = 0) => `${value.toLocaleString('zh-CN')} RUB`
</script>

<template>
  <div class="sales-workbench sales-secondary-workbench">
    <section class="page-header">
      <div class="header-left">
        <h1 class="page-title">二次销售</h1>
        <span class="page-desc">按商品追踪复购节奏、配送费用和最终状态，把二销商品池做成一张可持续维护的工作台。</span>
      </div>
    </section>

    <MetricSummaryStrip :cards="summaryCards" :columns="4" />

    <QueryFilterPanel>
      <QueryFilterItem label="店铺">
        <a-select v-model="filters.shopId" allow-clear placeholder="全部店铺" @change="handleSearch">
          <a-option v-for="shop in salesSecondaryShopOptions" :key="shop.value" :value="shop.value">
            {{ shop.label }}
          </a-option>
        </a-select>
      </QueryFilterItem>

      <QueryFilterItem label="SHK / 关键词" width="360px" min-width="360px">
        <a-input-search
          v-model="filters.keyword"
          allow-clear
          placeholder="搜索 SHK ID / SKU / 条码 / 商品名"
          @search="handleSearch"
          @press-enter="handleSearch"
          @clear="handleSearch"
        />
      </QueryFilterItem>

      <QueryFilterItem label="品牌">
        <a-select v-model="filters.brand" allow-clear placeholder="全部品牌" @change="handleSearch">
          <a-option v-for="brand in salesSecondaryBrandOptions" :key="brand" :value="brand">
            {{ brand }}
          </a-option>
        </a-select>
      </QueryFilterItem>

      <QueryFilterItem label="品类">
        <a-select v-model="filters.category" allow-clear placeholder="全部品类" @change="handleSearch">
          <a-option v-for="category in salesSecondaryCategoryOptions" :key="category" :value="category">
            {{ category }}
          </a-option>
        </a-select>
      </QueryFilterItem>

      <QueryFilterItem label="最终状态">
        <a-select v-model="filters.finalStatus" allow-clear placeholder="全部状态" @change="handleSearch">
          <a-option v-for="option in salesSecondaryStatusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </a-option>
        </a-select>
      </QueryFilterItem>

      <QueryActionBar>
        <a-button type="primary" class="action-button" @click="handleSearch">查询</a-button>
        <a-button class="action-button" @click="resetFilters">重置</a-button>
        <a-tooltip content="定制列">
          <a-button class="icon-button" size="small" aria-label="定制列" @click="settingsVisible = true">
            <template #icon>
              <icon-settings />
            </template>
          </a-button>
        </a-tooltip>
        <a-tooltip content="刷新">
          <a-button class="icon-button" size="small" aria-label="刷新" :loading="loading" @click="refreshData">
            <template #icon>
              <icon-refresh />
            </template>
          </a-button>
        </a-tooltip>
      </QueryActionBar>
    </QueryFilterPanel>

    <ConfigurableDataTable
      v-model:settings-visible="settingsVisible"
      :columns="columns"
      :default-visible-keys="defaultVisibleKeys"
      :required-keys="requiredKeys"
      :pinned-column-keys="pinnedColumnKeys"
      :default-freeze-last-column="true"
      :data="pagedRows"
      row-key="id"
      :pagination="false"
      :loading="loading"
      wrapper-class="sales-workbench-table"
      table-class="sales-secondary-table"
    >
      <template #shkId="{ record }">
        <button type="button" class="sales-cell-link sales-mono" @click.stop="openDetail(record)">
          {{ record.shkId }}
        </button>
      </template>

      <template #product="{ record }">
        <div class="sales-product-cell">
          <span class="sales-product-media">
            <img :src="record.productImage" :alt="record.productName" class="sales-product-image" />
          </span>
          <div class="sales-product-copy">
            <strong>{{ record.productName }}</strong>
            <span class="sales-mono">{{ record.sku }}</span>
          </div>
        </div>
      </template>

      <template #shopName="{ record }">
        <div class="sales-shop-cell">
          <div class="sales-shop-copy">
            <strong>{{ record.shopName }}</strong>
            <span>{{ record.shopSite }}</span>
          </div>
        </div>
      </template>

      <template #barcode="{ record }">
        <span class="sales-mono">{{ record.barcode }}</span>
      </template>

      <template #deliveryFee="{ record }">
        <span class="sales-money">{{ formatMoney(record.deliveryFee) }}</span>
      </template>

      <template #finalStatus="{ record }">
        <span class="sales-status-pill" :class="getSalesSecondaryStatusClass(record.finalStatus)">
          {{ getSalesSecondaryStatusLabel(record.finalStatus) }}
        </span>
      </template>

      <template #operation="{ record }">
        <a-button type="text" size="small" @click.stop="openDetail(record)">详情</a-button>
      </template>

      <template #footer>
        <a-pagination
          v-model:current="currentPage"
          v-model:page-size="pageSize"
          :total="filteredRows.length"
          :page-size-options="[10, 20, 50]"
          show-total
          show-jumper
          show-page-size
        />
      </template>
    </ConfigurableDataTable>

    <SalesSecondaryDetailDrawer v-model:visible="detailVisible" :row="currentRow" />
  </div>
</template>

<style scoped>
.sales-secondary-workbench {
  --workspace-color-primary: rgb(var(--primary-6));
  --workspace-color-text: var(--color-text-1);
  --workspace-color-text-secondary: var(--color-text-2);
  --workspace-color-text-tertiary: var(--color-text-3);
  --workspace-color-bg: var(--color-bg-2);
  --workspace-color-fill: var(--color-fill-1);
  --workspace-color-border: var(--color-border-2);
  --workspace-color-control-border: var(--color-border-2);
  --workspace-control-height: var(--size-default, 32px);
  --workspace-radius: var(--border-radius-medium);
}

.sales-secondary-workbench :deep(.sales-secondary-table .arco-table-td) {
  vertical-align: middle;
}

.sales-secondary-workbench :deep(.sales-secondary-table .arco-btn-text) {
  padding: 0;
}
</style>
