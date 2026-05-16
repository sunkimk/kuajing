<script setup lang="ts">
import { computed, ref } from 'vue'
import { IconRefresh, IconSettings } from '@arco-design/web-vue/es/icon'
import type { ConfigurableTableColumn } from '../../data/configurableTable'
import MetricSummaryStrip from '../common/MetricSummaryStrip.vue'
import QueryActionBar from '../common/QueryActionBar.vue'
import QueryFilterItem from '../common/QueryFilterItem.vue'
import QueryFilterPanel from '../common/QueryFilterPanel.vue'
import ConfigurableDataTable from '../common/ConfigurableDataTable.vue'
import SalesOrderDetailDrawer from './SalesOrderDetailDrawer.vue'
import './salesWorkbench.css'
import {
  createDefaultSalesOrderFilters,
  createSalesOrderRows,
  createSalesOrderSummaryCards,
  filterSalesOrders,
  getSalesOrderStatusClass,
  getSalesOrderStatusLabel,
  paginateSalesOrders,
  salesOrderFulfillmentOptions,
  salesOrderShopOptions,
  salesOrderStatusOptions,
  type SalesOrderFilters,
  type SalesOrderPagination,
  type SalesOrderRow,
} from '../../data/salesOrders'

type SalesOrderColumnKey =
  | 'orderNo'
  | 'product'
  | 'assemblyId'
  | 'fulfillmentType'
  | 'deliveryMethod'
  | 'warehouseName'
  | 'shopName'
  | 'status'
  | 'orderTime'
  | 'syncTime'

type SalesOrderTableColumnData = ConfigurableTableColumn<SalesOrderColumnKey> & { title: string }

const filters = ref<SalesOrderFilters>(createDefaultSalesOrderFilters())
const pagination = ref<SalesOrderPagination>({ page: 1, pageSize: 10 })
const loading = ref(false)
const detailVisible = ref(false)
const settingsVisible = ref(false)
const currentRow = ref<SalesOrderRow>()
const allRows = ref(createSalesOrderRows())

const summaryCards = computed(() => createSalesOrderSummaryCards(filterSalesOrders(allRows.value, filters.value)))
const filteredRows = computed(() => filterSalesOrders(allRows.value, filters.value))
const pagedRows = computed(() => paginateSalesOrders(filteredRows.value, pagination.value))

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

const defaultVisibleKeys: SalesOrderColumnKey[] = [
  'orderNo',
  'product',
  'assemblyId',
  'fulfillmentType',
  'deliveryMethod',
  'warehouseName',
  'shopName',
  'status',
  'orderTime',
  'syncTime',
]

const requiredKeys: SalesOrderColumnKey[] = ['orderNo', 'product']
const pinnedColumnKeys: SalesOrderColumnKey[] = ['orderNo']

const columns: SalesOrderTableColumnData[] = [
  { settingsKey: 'orderNo', title: '订单号', dataIndex: 'orderNo', slotName: 'orderNo', width: 156, minWidth: 144 },
  { settingsKey: 'product', title: '商品', dataIndex: 'product', slotName: 'product', width: 220, minWidth: 204, align: 'left' },
  { settingsKey: 'assemblyId', title: '装配单号', dataIndex: 'assemblyId', slotName: 'assemblyId', width: 148, minWidth: 136 },
  { settingsKey: 'fulfillmentType', title: '履约类型', dataIndex: 'fulfillmentType', width: 88, minWidth: 80, align: 'center' },
  { settingsKey: 'deliveryMethod', title: '配送方式', dataIndex: 'deliveryMethod', width: 96, minWidth: 88, align: 'center' },
  { settingsKey: 'warehouseName', title: '仓库', dataIndex: 'warehouseName', width: 128, minWidth: 118, ellipsis: true, tooltip: true },
  { settingsKey: 'shopName', title: '店铺', dataIndex: 'shopName', slotName: 'shopName', width: 160, minWidth: 148, align: 'left' },
  { settingsKey: 'status', title: '状态', dataIndex: 'status', slotName: 'status', width: 90, minWidth: 82, align: 'center' },
  { settingsKey: 'orderTime', title: '下单时间', dataIndex: 'orderTime', slotName: 'orderTime', width: 160, minWidth: 160, align: 'center' },
  { settingsKey: 'syncTime', title: '同步时间', dataIndex: 'syncTime', slotName: 'syncTime', width: 160, minWidth: 160, align: 'center' },
  { title: '操作', slotName: 'operation', width: 72, align: 'center' },
]

const handleSearch = () => {
  pagination.value = { ...pagination.value, page: 1 }
}

const resetFilters = () => {
  filters.value = createDefaultSalesOrderFilters()
  handleSearch()
}

const refreshData = () => {
  loading.value = true
  allRows.value = createSalesOrderRows()
  loading.value = false
}

const openDetail = (row: SalesOrderRow) => {
  currentRow.value = row
  detailVisible.value = true
}
</script>

<template>
  <div class="sales-workbench sales-order-workbench">
    <section class="page-header">
      <div class="header-left">
        <h1 class="page-title">销售订单</h1>
        <span class="page-desc">统一查看订单推进、履约状态与利润表现，优先把待跟进和同步异常集中到一个工作台里。</span>
      </div>
    </section>

    <MetricSummaryStrip :cards="summaryCards" :columns="4" />

    <QueryFilterPanel>
      <QueryFilterItem label="关键词" width="360px" min-width="360px">
        <a-input-search
          v-model="filters.keyword"
          allow-clear
          placeholder="搜索订单号 / 装配单号 / SKU / 商品名"
          @search="handleSearch"
          @press-enter="handleSearch"
          @clear="handleSearch"
        />
      </QueryFilterItem>

      <QueryFilterItem label="店铺">
        <a-select v-model="filters.shopId" allow-clear placeholder="全部店铺" @change="handleSearch">
          <a-option v-for="shop in salesOrderShopOptions" :key="shop.value" :value="shop.value">
            {{ shop.label }}
          </a-option>
        </a-select>
      </QueryFilterItem>

      <QueryFilterItem label="履约类型">
        <a-select v-model="filters.fulfillmentType" allow-clear placeholder="全部类型" @change="handleSearch">
          <a-option v-for="option in salesOrderFulfillmentOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </a-option>
        </a-select>
      </QueryFilterItem>

      <QueryFilterItem label="订单状态">
        <a-select v-model="filters.status" allow-clear placeholder="全部状态" @change="handleSearch">
          <a-option v-for="option in salesOrderStatusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </a-option>
        </a-select>
      </QueryFilterItem>

      <QueryFilterItem label="日期范围" width="340px" min-width="340px">
        <a-range-picker
          v-model="filters.dateRange"
          value-format="YYYY-MM-DD"
          :placeholder="['开始日期', '结束日期']"
          @change="handleSearch"
        />
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
      table-class="sales-orders-table"
    >
      <template #orderNo="{ record }">
        <button type="button" class="sales-cell-link sales-mono" @click.stop="openDetail(record)">
          {{ record.orderNo }}
        </button>
      </template>

      <template #product="{ record }">
        <div class="configurable-table-media-cell">
          <span class="configurable-table-media-frame">
            <img :src="record.productImage" :alt="record.productName" class="configurable-table-media-image" />
          </span>
          <div class="configurable-table-media-copy">
            <strong class="configurable-table-media-title">{{ record.productName }}</strong>
            <span class="configurable-table-media-description sales-mono">{{ record.sku }}</span>
          </div>
        </div>
      </template>

      <template #assemblyId="{ record }">
        <span class="sales-mono">{{ record.assemblyId }}</span>
      </template>

      <template #shopName="{ record }">
        <div class="sales-shop-cell">
          <div class="sales-shop-copy">
            <strong>{{ record.shopName }}</strong>
            <span>{{ record.shopSite }}</span>
          </div>
        </div>
      </template>

      <template #status="{ record }">
        <span class="sales-status-pill" :class="getSalesOrderStatusClass(record.status)">
          {{ getSalesOrderStatusLabel(record.status) }}
        </span>
      </template>

      <template #orderTime="{ record }">
        <span class="sales-mono">{{ record.orderTime }}</span>
      </template>

      <template #syncTime="{ record }">
        <span class="sales-mono">{{ record.syncTime }}</span>
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

    <SalesOrderDetailDrawer v-model:visible="detailVisible" :row="currentRow" />
  </div>
</template>

<style scoped>
.sales-order-workbench {
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

.sales-order-workbench :deep(.sales-orders-table .arco-table-td) {
  vertical-align: middle;
}

.sales-order-workbench :deep(.sales-orders-table .arco-btn-text) {
  padding: 0;
}

.sales-order-workbench :deep(.sales-orders-table .arco-table-th) {
  font-size: 13px;
}
</style>
