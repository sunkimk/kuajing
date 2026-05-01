<script setup lang="ts">
import { computed, ref } from 'vue'
import { IconDownload, IconRefresh, IconSettings } from '@arco-design/web-vue/es/icon'
import BatchInventoryDetailModal from './BatchInventoryDetailModal.vue'
import BatchInventoryLogModal from './BatchInventoryLogModal.vue'
import BatchInventoryTable from './BatchInventoryTable.vue'
import {
  createBatchRows,
  createDefaultBatchInventoryFilters,
  createOperateLogs,
  createSummaryCards,
  filterBatchRows,
  paginateBatchRows,
  statusOptions,
  warehouses,
  type BatchInventoryPagination,
  type BatchRow,
  type OperateLog,
} from '../../data/batchInventory'

const filters = ref(createDefaultBatchInventoryFilters())
const pagination = ref<BatchInventoryPagination>({
  page: 1,
  pageSize: 20,
})

const loading = ref(false)
const detailVisible = ref(false)
const columnSettingsVisible = ref(false)
const currentRow = ref<BatchRow>()
const logVisible = ref(false)
const operateLogs = ref<OperateLog[]>([])
const allRows = ref(createBatchRows(86))

const summaryCards = computed(() => createSummaryCards(allRows.value))
const filteredRows = computed(() => filterBatchRows(allRows.value, filters.value))
const pagedRows = computed(() => paginateBatchRows(filteredRows.value, pagination.value))

const handleSearch = () => {
  pagination.value = {
    ...pagination.value,
    page: 1,
  }
}

const resetFilters = () => {
  filters.value = createDefaultBatchInventoryFilters()
  handleSearch()
}

const refreshData = () => {
  loading.value = true
  allRows.value = createBatchRows(86)
  loading.value = false
}

const openDetail = (row: BatchRow) => {
  currentRow.value = row
  detailVisible.value = true
}

const closeDetail = () => {
  detailVisible.value = false
}

const openLogs = () => {
  operateLogs.value = createOperateLogs()
  logVisible.value = true
}

const closeLogs = () => {
  logVisible.value = false
}
</script>

<template>
  <div class="batch-inventory-page">
    <section class="page-header">
      <div class="header-left">
        <h1 class="page-title">批次库存</h1>
        <span class="page-desc">实时追踪各仓库批次商品的入库、库存与流转状态</span>
      </div>
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
          <div class="volc-design-search-item-wrap batch-filter-keyword">
            <div class="volc-design-search-item-label">
              <span>关键词</span>
            </div>
            <a-input-search
              v-model="filters.keyword"
              allow-clear
              placeholder="搜索批次号 / 商品名称 / SKU"
              class="volc-design-search-item filter-search"
              @search="handleSearch"
              @press-enter="handleSearch"
              @clear="handleSearch"
            />
          </div>

          <div class="volc-design-search-item-wrap">
            <div class="volc-design-search-item-label">
              <span>仓库</span>
            </div>
            <a-select v-model="filters.warehouse" placeholder="全部仓库" allow-clear class="volc-design-search-item" @change="handleSearch">
              <a-option v-for="warehouse in warehouses" :key="warehouse.value" :value="warehouse.value">
                {{ warehouse.label }}
              </a-option>
            </a-select>
          </div>

          <div class="volc-design-search-item-wrap">
            <div class="volc-design-search-item-label">
              <span>状态</span>
            </div>
            <a-select v-model="filters.status" placeholder="全部状态" allow-clear class="volc-design-search-item" @change="handleSearch">
              <a-option v-for="status in statusOptions" :key="status.value" :value="status.value">
                {{ status.label }}
              </a-option>
            </a-select>
          </div>

          <div class="volc-design-search-item-wrap batch-filter-date">
            <div class="volc-design-search-item-label">
              <span>日期范围</span>
            </div>
            <a-range-picker
              v-model="filters.dateRange"
              value-format="YYYY-MM-DD"
              :placeholder="['开始', '结束']"
              class="volc-design-search-item filter-date-picker"
              @change="handleSearch"
            />
          </div>

          <div class="filter-actions-bar">
            <a-button type="primary" class="volc-design-button" @click="handleSearch">查询</a-button>
            <a-button class="volc-design-button" @click="resetFilters">重置</a-button>
            <a-tooltip content="定制列">
              <a-button size="small" class="filter-icon-button" aria-label="定制列" @click="columnSettingsVisible = true">
                <template #icon>
                  <icon-settings />
                </template>
              </a-button>
            </a-tooltip>
            <a-tooltip content="刷新">
              <a-button size="small" class="filter-icon-button" aria-label="刷新" :loading="loading" @click="refreshData">
                <template #icon>
                  <icon-refresh />
                </template>
              </a-button>
            </a-tooltip>
            <a-tooltip content="导出数据">
              <a-button size="small" class="filter-icon-button" aria-label="导出数据">
                <template #icon>
                  <icon-download />
                </template>
              </a-button>
            </a-tooltip>
          </div>
        </div>
      </div>
    </section>

    <BatchInventoryTable
      v-model:pagination="pagination"
      v-model:settings-visible="columnSettingsVisible"
      :rows="pagedRows"
      :total="filteredRows.length"
      :loading="loading"
      @row-detail="openDetail"
      @open-logs="openLogs"
    />

    <BatchInventoryDetailModal
      v-model:visible="detailVisible"
      :row="currentRow"
      @close="closeDetail"
    />

    <BatchInventoryLogModal
      v-model:visible="logVisible"
      :logs="operateLogs"
      @close="closeLogs"
    />
  </div>
</template>

<style scoped>
.batch-inventory-page {
  --batch-color-primary: rgb(var(--primary-6));
  --batch-color-text: var(--color-text-1);
  --batch-color-text-secondary: var(--color-text-2);
  --batch-color-text-tertiary: var(--color-text-3);
  --batch-color-bg: var(--color-bg-2);
  --batch-color-fill: var(--color-fill-1);
  --batch-color-border: var(--color-border-2);
  --batch-color-control-border: var(--color-border-2);
  --batch-color-hover-bg: var(--color-fill-2);
  --batch-control-height: var(--size-default, 32px);
  --batch-radius: var(--border-radius-medium);
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
  color: var(--batch-color-text);
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
}

.page-desc {
  color: var(--batch-color-text-secondary);
  font-size: 13px;
  line-height: 20px;
}

.summary-strip {
  overflow: hidden;
  padding: 18px 0;
  border: 1px solid var(--batch-color-border);
  border-radius: 8px;
  background: var(--batch-color-bg);
  box-shadow: none;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.summary-metric {
  display: flex;
  min-height: 86px;
  flex-direction: column;
  justify-content: center;
  padding: 0 28px;
}

.summary-metric + .summary-metric {
  border-left: 1px solid var(--batch-color-border);
}

.summary-metric span {
  margin-bottom: 8px;
  color: var(--batch-color-text-secondary);
  font-size: 13px;
  line-height: 20px;
}

.summary-metric strong {
  margin-bottom: 6px;
  color: var(--batch-color-text);
  font-size: 26px;
  font-weight: 600;
  line-height: 32px;
}

.summary-metric small {
  color: var(--batch-color-text-tertiary);
  font-size: 12px;
  line-height: 18px;
}

.filter-panel-shell {
  padding-top: 2px;
}

.filter-panel {
  padding: 0;
  background: var(--batch-color-bg);
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

.batch-filter-keyword {
  width: 300px;
  max-width: 300px;
}

.batch-filter-date {
  min-width: 360px;
  width: 380px;
  max-width: none;
}

.volc-design-search-item-wrap:hover :deep(.arco-select-view-single),
.volc-design-search-item-wrap:focus-within :deep(.arco-select-view-single),
.volc-design-search-item-wrap:hover :deep(.arco-input-wrapper),
.volc-design-search-item-wrap:focus-within :deep(.arco-input-wrapper),
.volc-design-search-item-wrap:hover :deep(.arco-picker),
.volc-design-search-item-wrap:focus-within :deep(.arco-picker) {
  border-color: var(--batch-color-primary);
  box-shadow: 0 4px 10px rgba(var(--primary-6), 0.12);
}

.volc-design-search-item-label {
  display: flex;
  height: var(--batch-control-height);
  align-items: center;
  flex-shrink: 0;
  padding: 0 16px;
  border: 1px solid var(--batch-color-control-border);
  border-right: 0;
  border-radius: var(--batch-radius) 0 0 var(--batch-radius);
  background: var(--batch-color-bg);
  color: var(--batch-color-text-secondary);
  font-size: 14px;
  line-height: var(--batch-control-height);
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
  height: var(--batch-control-height);
}

.filter-icon-button {
  width: var(--batch-control-height);
  height: var(--batch-control-height);
  padding: 0;
  border-color: var(--batch-color-control-border);
  background: var(--batch-color-bg);
  color: var(--batch-color-text-secondary);
  box-shadow: none;
}

.filter-icon-button:hover,
.filter-icon-button:focus-visible {
  border-color: var(--batch-color-primary);
  background: var(--batch-color-bg);
  color: var(--batch-color-text-secondary);
  box-shadow: 0 4px 10px rgba(var(--primary-6), 0.16);
}

.filter-panel :deep(.arco-select-view-single),
.filter-panel :deep(.arco-input-wrapper),
.filter-panel :deep(.arco-picker) {
  height: var(--batch-control-height);
  border-color: var(--batch-color-control-border);
  border-radius: 0 var(--batch-radius) var(--batch-radius) 0;
  background: var(--batch-color-bg);
  box-shadow: none;
}

.filter-panel :deep(.volc-design-search-item .arco-select-view-single),
.filter-panel :deep(.volc-design-search-item .arco-input-wrapper),
.filter-panel :deep(.volc-design-search-item.arco-picker) {
  margin-left: -1px;
}

.filter-panel :deep(.arco-select-view-value),
.filter-panel :deep(.arco-input) {
  font-size: 13px;
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
    border-top: 1px solid var(--batch-color-border);
  }

  .volc-design-search-item-wrap,
  .batch-filter-keyword,
  .batch-filter-date,
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
