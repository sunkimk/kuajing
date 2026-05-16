<script setup lang="ts">
import { computed, ref } from 'vue'
import { IconRefresh, IconSettings } from '@arco-design/web-vue/es/icon'
import type { ConfigurableTableColumn } from '../../data/configurableTable'
import MetricSummaryStrip from '../common/MetricSummaryStrip.vue'
import QueryActionBar from '../common/QueryActionBar.vue'
import QueryFilterItem from '../common/QueryFilterItem.vue'
import QueryFilterPanel from '../common/QueryFilterPanel.vue'
import ConfigurableDataTable from '../common/ConfigurableDataTable.vue'
import SalesReturnDetailDrawer from './SalesReturnDetailDrawer.vue'
import './salesWorkbench.css'
import {
  createDefaultSalesReturnFilters,
  createSalesReturnRows,
  createSalesReturnSummaryCards,
  filterSalesReturns,
  getSalesReturnStatusClass,
  getSalesReturnStatusLabel,
  paginateSalesReturns,
  salesReturnReasonOptions,
  salesReturnShopOptions,
  salesReturnStatusOptions,
  type SalesReturnFilters,
  type SalesReturnPagination,
  type SalesReturnRow,
} from '../../data/salesReturns'

type SalesReturnColumnKey =
  | 'returnNo'
  | 'originalOrderNo'
  | 'product'
  | 'shopName'
  | 'quantity'
  | 'refundAmount'
  | 'reasonLabel'
  | 'status'
  | 'applyTime'

type SalesReturnTableColumnData = ConfigurableTableColumn<SalesReturnColumnKey> & { title: string }

const filters = ref<SalesReturnFilters>(createDefaultSalesReturnFilters())
const pagination = ref<SalesReturnPagination>({ page: 1, pageSize: 10 })
const loading = ref(false)
const detailVisible = ref(false)
const settingsVisible = ref(false)
const currentRow = ref<SalesReturnRow>()
const allRows = ref(createSalesReturnRows())

const filteredRows = computed(() => filterSalesReturns(allRows.value, filters.value))
const pagedRows = computed(() => paginateSalesReturns(filteredRows.value, pagination.value))
const summaryCards = computed(() => createSalesReturnSummaryCards(filteredRows.value))

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

const defaultVisibleKeys: SalesReturnColumnKey[] = [
  'returnNo',
  'originalOrderNo',
  'product',
  'shopName',
  'quantity',
  'refundAmount',
  'reasonLabel',
  'status',
  'applyTime',
]

const requiredKeys: SalesReturnColumnKey[] = ['returnNo', 'product']
const pinnedColumnKeys: SalesReturnColumnKey[] = ['returnNo']

const columns: SalesReturnTableColumnData[] = [
  { settingsKey: 'returnNo', title: '退货单号', dataIndex: 'returnNo', slotName: 'returnNo', width: 150, minWidth: 140 },
  { settingsKey: 'originalOrderNo', title: '原订单号', dataIndex: 'originalOrderNo', slotName: 'originalOrderNo', width: 150, minWidth: 140 },
  { settingsKey: 'product', title: '商品', dataIndex: 'product', slotName: 'product', width: 240, minWidth: 220, align: 'left' },
  { settingsKey: 'shopName', title: '店铺', dataIndex: 'shopName', width: 150, minWidth: 136, ellipsis: true, tooltip: true },
  { settingsKey: 'quantity', title: '数量', dataIndex: 'quantity', width: 76, minWidth: 68, align: 'center' },
  { settingsKey: 'refundAmount', title: '退款金额', dataIndex: 'refundAmount', slotName: 'refundAmount', width: 116, minWidth: 104, align: 'right' },
  { settingsKey: 'reasonLabel', title: '退货原因', dataIndex: 'reasonLabel', slotName: 'reasonLabel', width: 160, minWidth: 140 },
  { settingsKey: 'status', title: '状态', dataIndex: 'status', slotName: 'status', width: 96, minWidth: 88, align: 'center' },
  { settingsKey: 'applyTime', title: '申请时间', dataIndex: 'applyTime', slotName: 'applyTime', width: 148, minWidth: 138, align: 'center' },
  { title: '操作', slotName: 'operation', width: 82, align: 'center' },
]

const handleSearch = () => {
  pagination.value = { ...pagination.value, page: 1 }
}

const resetFilters = () => {
  filters.value = createDefaultSalesReturnFilters()
  handleSearch()
}

const refreshData = () => {
  loading.value = true
  allRows.value = createSalesReturnRows()
  loading.value = false
}

const openDetail = (row: SalesReturnRow) => {
  currentRow.value = row
  detailVisible.value = true
}

const formatMoney = (value = 0) => `${value.toLocaleString('zh-CN')} RUB`
</script>

<template>
  <div class="sales-workbench sales-return-workbench">
    <section class="page-header">
      <div class="header-left">
        <h1 class="page-title">退货管理</h1>
        <span class="page-desc">集中处理退货审核、退款状态和回仓进度，让售后异常也能在同一套工作台里闭环推进。</span>
      </div>
    </section>

    <MetricSummaryStrip :cards="summaryCards" :columns="4" />

    <QueryFilterPanel>
      <QueryFilterItem label="关键词" width="360px" min-width="360px">
        <a-input-search
          v-model="filters.keyword"
          allow-clear
          placeholder="搜索退货单号 / 原订单号 / SKU / 商品名"
          @search="handleSearch"
          @press-enter="handleSearch"
          @clear="handleSearch"
        />
      </QueryFilterItem>

      <QueryFilterItem label="店铺">
        <a-select v-model="filters.shopId" allow-clear placeholder="全部店铺" @change="handleSearch">
          <a-option v-for="shop in salesReturnShopOptions" :key="shop.value" :value="shop.value">
            {{ shop.label }}
          </a-option>
        </a-select>
      </QueryFilterItem>

      <QueryFilterItem label="退货状态">
        <a-select v-model="filters.status" allow-clear placeholder="全部状态" @change="handleSearch">
          <a-option v-for="option in salesReturnStatusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </a-option>
        </a-select>
      </QueryFilterItem>

      <QueryFilterItem label="原因类型">
        <a-select v-model="filters.reasonType" allow-clear placeholder="全部类型" @change="handleSearch">
          <a-option v-for="option in salesReturnReasonOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </a-option>
        </a-select>
      </QueryFilterItem>

      <QueryFilterItem label="申请时间" width="340px" min-width="340px">
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
      table-class="sales-return-table"
    >
      <template #returnNo="{ record }">
        <button type="button" class="sales-cell-link sales-mono" @click.stop="openDetail(record)">
          {{ record.returnNo }}
        </button>
      </template>

      <template #originalOrderNo="{ record }">
        <span class="sales-mono">{{ record.originalOrderNo }}</span>
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

      <template #refundAmount="{ record }">
        <span class="sales-money">{{ formatMoney(record.refundAmount) }}</span>
      </template>

      <template #reasonLabel="{ record }">
        <div class="sales-stack-copy">
          <strong>{{ record.reasonLabel }}</strong>
          <span>{{ salesReturnReasonOptions.find((item) => item.value === record.reasonType)?.label }}</span>
        </div>
      </template>

      <template #status="{ record }">
        <span class="sales-status-pill" :class="getSalesReturnStatusClass(record.status)">
          {{ getSalesReturnStatusLabel(record.status) }}
        </span>
      </template>

      <template #applyTime="{ record }">
        <span class="sales-mono">{{ record.applyTime }}</span>
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

    <SalesReturnDetailDrawer v-model:visible="detailVisible" :row="currentRow" />
  </div>
</template>

<style scoped>
.sales-return-workbench {
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

.sales-return-workbench :deep(.sales-return-table .arco-table-td) {
  vertical-align: middle;
}

.sales-return-workbench :deep(.sales-return-table .arco-btn-text) {
  padding: 0;
}
</style>
