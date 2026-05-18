<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { IconRefresh, IconSettings } from '@arco-design/web-vue/es/icon'
import type { PurchaseFilterConfig, PurchasePageKey, PurchaseRow } from '../../data/purchase'
import ConfigurableDataTable from '../common/ConfigurableDataTable.vue'
import MetricSummaryStrip from '../common/MetricSummaryStrip.vue'
import QueryActionBar from '../common/QueryActionBar.vue'
import QueryFilterItem from '../common/QueryFilterItem.vue'
import QueryFilterPanel from '../common/QueryFilterPanel.vue'
import {
  createDefaultPurchaseFilters,
  createPurchaseRows,
  createPurchaseSummaryCards,
  filterPurchaseRows,
  getPurchaseStatusLabel,
  getPurchaseStatusTagColor,
  paginatePurchaseRows,
  purchasePageConfigs,
  type PurchaseFilters,
  type PurchasePagination,
} from '../../data/purchase'
import '../sales/salesWorkbench.css'
import './purchaseWorkbench.css'

const props = defineProps<{
  pageKey: PurchasePageKey
}>()

const filters = ref<PurchaseFilters>(createDefaultPurchaseFilters(props.pageKey))
const activeStatus = ref('all')
const pagination = ref<PurchasePagination>({ page: 1, pageSize: 10 })
const allRows = ref<PurchaseRow[]>(createPurchaseRows(props.pageKey))
const loading = ref(false)
const settingsVisible = ref(false)

const config = computed(() => purchasePageConfigs[props.pageKey])
const rowsWithoutStatusFilter = computed(() => filterPurchaseRows(allRows.value, props.pageKey, filters.value, 'all'))
const filteredRows = computed(() => filterPurchaseRows(allRows.value, props.pageKey, filters.value, activeStatus.value))
const pagedRows = computed(() => paginatePurchaseRows(filteredRows.value, pagination.value))
const summaryCards = computed(() => createPurchaseSummaryCards(filteredRows.value, props.pageKey))
const tableClass = computed(() => `purchase-table purchase-${props.pageKey}-table`)

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

const statusTabsWithCounts = computed(() =>
  config.value.statusTabs.map((tab) => ({
    ...tab,
    count: tab.value === 'all'
      ? rowsWithoutStatusFilter.value.length
      : rowsWithoutStatusFilter.value.filter((row) => row.status === tab.value).length,
  }))
)

const getStringFilterValue = (key: string) => {
  const value = filters.value[key]
  return typeof value === 'string' ? value : ''
}

const getArrayFilterValue = (key: string) => {
  const value = filters.value[key]
  return Array.isArray(value) ? value : []
}

const updateFilterValue = (key: string, value: unknown) => {
  const nextValue = Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : typeof value === 'string' && value.length > 0
      ? value
      : undefined

  filters.value = { ...filters.value, [key]: nextValue }
}

const handleSearch = () => {
  pagination.value = { ...pagination.value, page: 1 }
}

const handleFilterChange = (key: string, value: unknown) => {
  updateFilterValue(key, value)
  handleSearch()
}

const handleFilterInputUpdate = (key: string, value: unknown) => {
  updateFilterValue(key, value)
}

const resetFilters = () => {
  filters.value = createDefaultPurchaseFilters(props.pageKey)
  activeStatus.value = 'all'
  handleSearch()
}

const setStatus = (status: string) => {
  activeStatus.value = status
  handleSearch()
}

const refreshData = () => {
  loading.value = true
  allRows.value = createPurchaseRows(props.pageKey)
  loading.value = false
}

const getDocumentNo = (record: PurchaseRow) =>
  record.purchaseNo ?? record.deliveryNo ?? record.returnNo ?? record.documentNo ?? '-'

const renderFilter = (filter: PurchaseFilterConfig) => filter

watch(() => props.pageKey, (pageKey) => {
  filters.value = createDefaultPurchaseFilters(pageKey)
  activeStatus.value = 'all'
  allRows.value = createPurchaseRows(pageKey)
  pagination.value = { page: 1, pageSize: 10 }
})
</script>

<template>
  <div class="sales-workbench purchase-workbench">
    <section class="page-header purchase-page-header">
      <div class="header-left">
        <h1 class="page-title">{{ config.title }}</h1>
        <span class="page-desc">{{ config.description }}</span>
      </div>

      <div class="purchase-header-actions">
        <a-button v-if="config.secondaryAction" class="action-button">{{ config.secondaryAction }}</a-button>
        <a-button v-if="config.primaryAction" type="primary" class="action-button">{{ config.primaryAction }}</a-button>
      </div>
    </section>

    <MetricSummaryStrip :cards="summaryCards" :columns="4" />

    <section
      class="purchase-status-tabs c-m-detail-header-tabs"
      data-testid="c-m-detail-header-tabs"
      aria-label="采购状态切换"
    >
      <div class="purchase-status-tabs-wrapper c-m-detail-header-tabs-wrapper">
        <a-tabs
          :active-key="activeStatus"
          type="card-gutter"
          hide-content
          @change="(key) => setStatus(String(key))"
        >
          <a-tab-pane
            v-for="tab in statusTabsWithCounts"
            :key="tab.value"
          >
            <template #title>
              <span class="purchase-status-tab-title">
                <span>{{ tab.label }}</span>
                <small class="purchase-status-tab-count">{{ tab.count }}</small>
              </span>
            </template>
          </a-tab-pane>
        </a-tabs>
      </div>
    </section>

    <QueryFilterPanel>
      <QueryFilterItem
        v-for="filter in config.filters"
        :key="filter.key"
        :label="filter.label"
        :width="filter.width ?? '300px'"
        :min-width="filter.minWidth ?? '300px'"
      >
        <template v-if="renderFilter(filter).kind === 'search'">
          <a-input-search
            :model-value="getStringFilterValue(filter.key)"
            allow-clear
            :placeholder="filter.placeholder"
            @update:model-value="handleFilterInputUpdate(filter.key, $event)"
            @search="handleSearch"
            @press-enter="handleSearch"
            @clear="() => handleFilterChange(filter.key, undefined)"
          />
        </template>

        <template v-else-if="filter.kind === 'select'">
          <a-select
            :model-value="getStringFilterValue(filter.key)"
            allow-clear
            :placeholder="filter.placeholder"
            @change="(value) => handleFilterChange(filter.key, value)"
            @clear="() => handleFilterChange(filter.key, undefined)"
          >
            <a-option v-for="option in filter.options" :key="option.value" :value="option.value">
              {{ option.label }}
            </a-option>
          </a-select>
        </template>

        <template v-else-if="filter.kind === 'multiSelect'">
          <a-select
            :model-value="getArrayFilterValue(filter.key)"
            multiple
            allow-clear
            :max-tag-count="1"
            :placeholder="filter.placeholder"
            @change="(value) => handleFilterChange(filter.key, value)"
            @clear="() => handleFilterChange(filter.key, [])"
          >
            <a-option v-for="option in filter.options" :key="option.value" :value="option.value">
              {{ option.label }}
            </a-option>
          </a-select>
        </template>

        <template v-else>
          <a-range-picker
            :model-value="getArrayFilterValue(filter.key)"
            value-format="YYYY-MM-DD"
            :placeholder="['开始日期', '结束日期']"
            @change="(value) => handleFilterChange(filter.key, value)"
          />
        </template>
      </QueryFilterItem>

      <QueryActionBar>
        <a-button type="primary" class="action-button" @click="handleSearch">查询</a-button>
        <a-button class="action-button" @click="resetFilters">重置</a-button>
        <a-button class="action-button">保存视图</a-button>
        <a-button v-if="config.secondaryAction === '导出'" class="action-button">导出</a-button>
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
      :columns="config.tableColumns"
      :default-visible-keys="config.defaultVisibleKeys"
      :required-keys="config.requiredKeys"
      :pinned-column-keys="config.pinnedColumnKeys"
      :default-freeze-last-column="true"
      :data="pagedRows"
      row-key="id"
      :pagination="false"
      :loading="loading"
      wrapper-class="purchase-workbench-table"
      :table-class="tableClass"
    >
      <template #documentNo="{ record }">
        <button type="button" class="sales-cell-link sales-mono">
          {{ getDocumentNo(record) }}
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

      <template #msku="{ record }">
        <div class="sales-stack-copy">
          <strong class="sales-mono">{{ record.msku }}</strong>
          <span class="sales-mono">{{ record.fnsku }}</span>
        </div>
      </template>

      <template #status="{ record }">
        <a-tag :color="getPurchaseStatusTagColor(props.pageKey, record.status)">
          {{ getPurchaseStatusLabel(props.pageKey, record.status) }}
        </a-tag>
      </template>

      <template #operation>
        <a-button type="text" size="small">详情</a-button>
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
  </div>
</template>
