<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconPlus, IconSettings } from '@arco-design/web-vue/es/icon'
import { useRouter } from 'vue-router'
import type { ConfigurableTableColumn } from '../../data/configurableTable'
import ConfigurableDataTable from '../common/ConfigurableDataTable.vue'
import QueryActionBar from '../common/QueryActionBar.vue'
import QueryFilterItem from '../common/QueryFilterItem.vue'
import QueryFilterPanel from '../common/QueryFilterPanel.vue'
import {
  advertisingPlatformOptions,
  budgetStatusOptions,
  campaignStatusOptions,
  campaignTypeOptions,
  createAdvertisingCampaignRows,
  createDefaultAdvertisingFilters,
  filterAdvertisingCampaigns,
  formatAdvertisingMoney,
  formatAdvertisingNumber,
  getAdvertisingStoreOptions,
  getCampaignStatusLabel,
  getCampaignStatusTagColor,
  type AdvertisingCampaign,
  type AdvertisingCampaignProduct,
  type AdvertisingCampaignType,
  type AdvertisingPlatform,
} from '../../data/storeAdvertising'
import { useProductCatalogStore } from '../../data/productCatalog'
import './storeAdvertising.css'

type AdvertisingCampaignColumnKey =
  | 'campaign'
  | 'platform'
  | 'store'
  | 'campaignType'
  | 'budgetBalance'
  | 'todaySpend'
  | 'impressions'
  | 'ctr'
  | 'orders'
  | 'spendRatio'

type AdvertisingCampaignTableColumn = ConfigurableTableColumn<AdvertisingCampaignColumnKey> & { title: string }
type AdvertisingFilterSelectKey = 'storeIds' | 'statuses' | 'campaignTypes' | 'budgetStatuses'
type AdvertisingFilterOption = {
  label: string
  value: string
}

const router = useRouter()
const catalogStore = useProductCatalogStore()
const filters = ref(createDefaultAdvertisingFilters())
const allRows = ref(createAdvertisingCampaignRows())
const loading = ref(false)
const settingsVisible = ref(false)
const createVisible = ref(false)
const selectedRowKeys = ref<(string | number)[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const createForm = ref<{
  platform?: AdvertisingPlatform
  campaignType?: AdvertisingCampaignType
}>({})

const isCampaignStatusEditable = (status: AdvertisingCampaign['status']) =>
  status === 'active' || status === 'paused'

const filteredRows = computed(() => filterAdvertisingCampaigns(allRows.value, filters.value))
const productBySku = computed(() =>
  new Map(catalogStore.products.value.map((product) => [product.basicInfo.sku, product]))
)
const pagedRows = computed(() =>
  filteredRows.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
)
const selectablePagedRows = computed(() =>
  pagedRows.value.map((row) => ({
    ...row,
    disabled: !isCampaignStatusEditable(row.status),
  }))
)
const storeOptions = computed(() => getAdvertisingStoreOptions(filters.value.platforms))
const filterSelectKeys: AdvertisingFilterSelectKey[] = ['storeIds', 'statuses', 'campaignTypes', 'budgetStatuses']
const filterSelectWidths = ref<Record<AdvertisingFilterSelectKey, number>>({
  storeIds: 0,
  statuses: 0,
  campaignTypes: 0,
  budgetStatuses: 0,
})
let filterResizeObserver: ResizeObserver | undefined
let textMeasureContext: CanvasRenderingContext2D | null | undefined

const measureFilterTextWidth = (text: string) => {
  if (typeof document === 'undefined') return text.length * 12

  if (textMeasureContext === undefined) {
    textMeasureContext = document.createElement('canvas').getContext('2d')
  }

  if (!textMeasureContext) return text.length * 12

  textMeasureContext.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif'
  return Math.ceil(textMeasureContext.measureText(text).width)
}

const getFilterTagWidth = (label: string) =>
  Math.min(120, Math.max(42, measureFilterTextWidth(label) + 30))

const getFilterOverflowTagWidth = (overflowCount: number) =>
  Math.max(42, measureFilterTextWidth(`+${overflowCount}...`) + 22)

const resolveFilterMaxTagCount = (selectedLabels: string[], availableWidth: number) => {
  if (selectedLabels.length <= 1) return 1
  if (availableWidth <= 0) return 1

  const visibleLabels = selectedLabels.slice(0, 2)
  const overflowCount = Math.max(selectedLabels.length - visibleLabels.length, 0)
  const gapWidth = 4
  const twoTagWidth = visibleLabels.reduce((total, label) => total + getFilterTagWidth(label), 0)
    + (visibleLabels.length - 1) * gapWidth
    + (overflowCount > 0 ? getFilterOverflowTagWidth(overflowCount) + gapWidth : 0)

  return twoTagWidth <= availableWidth - 8 ? 2 : 1
}

const getSelectedOptionLabels = (values: string[], options: AdvertisingFilterOption[]) => {
  const labelByValue = new Map(options.map((option) => [option.value, option.label]))
  return values.map((value) => labelByValue.get(value) ?? value)
}

const storeFilterMaxTagCount = computed(() =>
  resolveFilterMaxTagCount(
    getSelectedOptionLabels(filters.value.storeIds, storeOptions.value),
    filterSelectWidths.value.storeIds
  )
)

const statusFilterMaxTagCount = computed(() =>
  resolveFilterMaxTagCount(
    getSelectedOptionLabels(filters.value.statuses, campaignStatusOptions),
    filterSelectWidths.value.statuses
  )
)

const campaignTypeFilterMaxTagCount = computed(() =>
  resolveFilterMaxTagCount(
    getSelectedOptionLabels(filters.value.campaignTypes, campaignTypeOptions),
    filterSelectWidths.value.campaignTypes
  )
)

const budgetStatusFilterMaxTagCount = computed(() =>
  resolveFilterMaxTagCount(
    getSelectedOptionLabels(filters.value.budgetStatuses, budgetStatusOptions),
    filterSelectWidths.value.budgetStatuses
  )
)

const updateFilterSelectWidths = () => {
  if (typeof document === 'undefined') return

  const nextWidths = { ...filterSelectWidths.value }
  filterSelectKeys.forEach((key) => {
    const selectInner = document.querySelector<HTMLElement>(
      `.advertising-filter-panel [data-filter-key="${key}"] .arco-select-view-multiple .arco-select-view-inner`
    )
    nextWidths[key] = Math.floor(selectInner?.getBoundingClientRect().width ?? 0)
  })
  filterSelectWidths.value = nextWidths
}

onMounted(() => {
  nextTick(() => {
    updateFilterSelectWidths()

    if (typeof ResizeObserver === 'undefined') return

    filterResizeObserver = new ResizeObserver(updateFilterSelectWidths)
    filterSelectKeys.forEach((key) => {
      const selectInner = document.querySelector<HTMLElement>(
        `.advertising-filter-panel [data-filter-key="${key}"] .arco-select-view-multiple .arco-select-view-inner`
      )
      if (selectInner) filterResizeObserver?.observe(selectInner)
    })
  })
})

onBeforeUnmount(() => {
  filterResizeObserver?.disconnect()
})

const defaultVisibleKeys: AdvertisingCampaignColumnKey[] = [
  'campaign',
  'platform',
  'store',
  'campaignType',
  'budgetBalance',
  'todaySpend',
  'impressions',
  'ctr',
  'orders',
  'spendRatio',
]

const requiredKeys: AdvertisingCampaignColumnKey[] = ['campaign']
const pinnedColumnKeys: AdvertisingCampaignColumnKey[] = ['campaign']

const campaignRowSelection = {
  type: 'checkbox' as const,
  showCheckedAll: true,
  onlyCurrent: true,
  fixed: true,
  width: 48,
}

const columns: AdvertisingCampaignTableColumn[] = [
  { title: '', slotName: 'statusToggle', width: 64, minWidth: 56, align: 'center', fixed: 'left' },
  { settingsKey: 'campaign', title: '活动', dataIndex: 'campaign', slotName: 'campaign', width: 320, minWidth: 300, align: 'left' },
  { settingsKey: 'platform', title: '平台', dataIndex: 'platform', width: 132, minWidth: 120, align: 'center' },
  { settingsKey: 'store', title: '店铺', dataIndex: 'store', slotName: 'store', width: 180, minWidth: 168, align: 'left' },
  { settingsKey: 'campaignType', title: '活动类型', dataIndex: 'campaignType', width: 104, minWidth: 96, align: 'center' },
  { settingsKey: 'budgetBalance', title: '预算余额', dataIndex: 'budgetBalance', slotName: 'budgetBalance', width: 132, minWidth: 124, align: 'right' },
  { settingsKey: 'todaySpend', title: '今日消耗', dataIndex: 'todaySpend', slotName: 'todaySpend', width: 132, minWidth: 124, align: 'right' },
  { settingsKey: 'impressions', title: '曝光', dataIndex: 'impressions', slotName: 'impressions', width: 124, minWidth: 116, align: 'right' },
  { settingsKey: 'ctr', title: 'CTR', dataIndex: 'ctr', slotName: 'ctr', width: 92, minWidth: 84, align: 'right' },
  { settingsKey: 'orders', title: '订单', dataIndex: 'orders', width: 88, minWidth: 80, align: 'right' },
  { settingsKey: 'spendRatio', title: '消耗占比', dataIndex: 'spendRatio', slotName: 'spendRatio', width: 112, minWidth: 104, align: 'right' },
  { title: '操作', slotName: 'operation', width: 160, minWidth: 148, align: 'center' },
]

const getBudgetBalance = (record: AdvertisingCampaign) =>
  Math.max(record.budget - record.spend, 0)

const getTodaySpend = (record: AdvertisingCampaign) =>
  record.statistics.at(-1)?.spend ?? 0

const getCtr = (record: AdvertisingCampaign) =>
  record.impressions > 0 ? `${(record.clicks / record.impressions * 100).toFixed(1)}%` : '0.0%'

const getSpendRatio = (record: AdvertisingCampaign) =>
  record.budget > 0 ? `${(record.spend / record.budget * 100).toFixed(1)}%` : '0.0%'

const getCatalogProduct = (product?: AdvertisingCampaignProduct) =>
  product ? productBySku.value.get(product.sku) : undefined

const getAdvertisingProductName = (product?: AdvertisingCampaignProduct) =>
  getCatalogProduct(product)?.basicInfo.chineseName ?? product?.sku ?? ''

const getAdvertisingProductImage = (product?: AdvertisingCampaignProduct) =>
  getCatalogProduct(product)?.basicInfo.mainImage

const handleSearch = () => {
  currentPage.value = 1
}

const resetFilters = () => {
  filters.value = createDefaultAdvertisingFilters()
  handleSearch()
}

const toggleStatus = (record: AdvertisingCampaign) => {
  if (!isCampaignStatusEditable(record.status)) return

  allRows.value = allRows.value.map((row) =>
    row.id === record.id
      ? { ...row, status: row.status === 'active' ? 'paused' : 'active' }
      : row
  )
}

const clearCampaignSelection = () => {
  selectedRowKeys.value = []
}

const bulkUpdateSelectedCampaigns = (status: Extract<AdvertisingCampaign['status'], 'active' | 'paused'>) => {
  const selectedKeys = new Set(selectedRowKeys.value.map(String))
  if (selectedKeys.size === 0) return

  let updatedCount = 0
  allRows.value = allRows.value.map((row) => {
    if (!selectedKeys.has(row.id) || !isCampaignStatusEditable(row.status) || row.status === status) {
      return row
    }

    updatedCount += 1
    return { ...row, status }
  })

  if (updatedCount > 0) {
    Message.success(`已${status === 'active' ? '开启' : '关闭'} ${updatedCount} 个活动`)
  } else {
    Message.info('所选活动无需调整')
  }

  clearCampaignSelection()
}

const openDetail = (record: AdvertisingCampaign) => {
  router.push(`/stores/ads/${record.id}`)
}

const openStatistics = (record: AdvertisingCampaign) => {
  router.push(`/stores/ads/${record.id}/statistics`)
}

const confirmCreate = () => {
  createVisible.value = false
}

watch(() => filters.value.platforms, () => {
  const allowedStoreIds = new Set(storeOptions.value.map((option) => option.value))
  const nextStoreIds = filters.value.storeIds.filter((storeId) => allowedStoreIds.has(storeId))

  if (nextStoreIds.length !== filters.value.storeIds.length) {
    filters.value = { ...filters.value, storeIds: nextStoreIds }
  }
})

watch(filteredRows, (rows) => {
  const selectableRowKeySet = new Set(rows.filter((row) => isCampaignStatusEditable(row.status)).map((row) => row.id))
  selectedRowKeys.value = selectedRowKeys.value.filter((rowKey) => selectableRowKeySet.has(String(rowKey)))
  currentPage.value = Math.min(currentPage.value, Math.max(1, Math.ceil(rows.length / pageSize.value)))
})

watch(pageSize, () => {
  currentPage.value = 1
})
</script>

<template>
  <div class="store-advertising-workbench">
    <section class="advertising-page-header">
      <div class="advertising-page-header-copy">
        <h1>广告推广</h1>
      </div>

      <div class="advertising-page-header-actions">
        <a-button type="primary" class="advertising-create-button" @click="createVisible = true">
          <template #icon>
            <icon-plus />
          </template>
          创建活动
        </a-button>
      </div>
    </section>

    <QueryFilterPanel class="advertising-filter-panel">
      <QueryFilterItem label="关键词" width="420px" min-width="320px">
        <a-input-search
          v-model="filters.keyword"
          allow-clear
          placeholder="通过活动ID或名称搜索"
          @search="handleSearch"
          @press-enter="handleSearch"
          @clear="handleSearch"
        />
      </QueryFilterItem>

      <QueryFilterItem label="店铺" width="320px" min-width="300px" data-filter-key="storeIds">
        <a-select
          v-model="filters.storeIds"
          multiple
          allow-clear
          :max-tag-count="storeFilterMaxTagCount"
          placeholder="全部店铺"
          @change="handleSearch"
        >
          <a-option v-for="option in storeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </a-option>
        </a-select>
      </QueryFilterItem>

      <QueryFilterItem label="活动状态" width="280px" min-width="260px" data-filter-key="statuses">
        <a-select
          v-model="filters.statuses"
          multiple
          allow-clear
          :max-tag-count="statusFilterMaxTagCount"
          placeholder="全部状态"
          @change="handleSearch"
        >
          <a-option v-for="option in campaignStatusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </a-option>
        </a-select>
      </QueryFilterItem>

      <QueryFilterItem label="活动类型" width="260px" min-width="240px" data-filter-key="campaignTypes">
        <a-select
          v-model="filters.campaignTypes"
          multiple
          allow-clear
          :max-tag-count="campaignTypeFilterMaxTagCount"
          placeholder="全部类型"
          @change="handleSearch"
        >
          <a-option v-for="option in campaignTypeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </a-option>
        </a-select>
      </QueryFilterItem>

      <QueryFilterItem label="预算状态" width="320px" min-width="300px" data-filter-key="budgetStatuses">
        <a-select
          v-model="filters.budgetStatuses"
          multiple
          allow-clear
          :max-tag-count="budgetStatusFilterMaxTagCount"
          placeholder="全部预算"
          @change="handleSearch"
        >
          <a-option v-for="option in budgetStatusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </a-option>
        </a-select>
      </QueryFilterItem>

      <QueryFilterItem label="日期" width="300px" min-width="260px">
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
          <a-button size="small" class="icon-button" aria-label="定制列" @click="settingsVisible = true">
            <template #icon>
              <icon-settings />
            </template>
          </a-button>
        </a-tooltip>
      </QueryActionBar>
    </QueryFilterPanel>

    <ConfigurableDataTable
      v-model:selected-keys="selectedRowKeys"
      v-model:settings-visible="settingsVisible"
      :columns="columns"
      :default-visible-keys="defaultVisibleKeys"
      :required-keys="requiredKeys"
      :pinned-column-keys="pinnedColumnKeys"
      :default-freeze-last-column="true"
      :data="selectablePagedRows"
      :row-selection="campaignRowSelection"
      row-key="id"
      :pagination="false"
      :loading="loading"
      wrapper-class="store-advertising-table"
      table-class="store-advertising-campaign-table"
    >
      <template #statusToggle="{ record }">
        <div class="advertising-status-toggle-cell">
          <a-switch
            size="small"
            :model-value="record.status === 'active'"
            :disabled="!isCampaignStatusEditable(record.status)"
            @change="() => toggleStatus(record)"
          />
        </div>
      </template>

      <template #campaign="{ record }">
        <div class="advertising-campaign-cell">
          <span class="advertising-campaign-main">
            <a-badge :count="record.products.length" class="advertising-campaign-thumb-badge">
              <span class="advertising-campaign-thumb">
                <img
                  v-if="getAdvertisingProductImage(record.products[0])"
                  :src="getAdvertisingProductImage(record.products[0])"
                  :alt="getAdvertisingProductName(record.products[0]) || record.campaignName"
                  class="advertising-campaign-image"
                />
                <span v-else>{{ (getAdvertisingProductName(record.products[0]) || record.campaignName).slice(0, 1) }}</span>
              </span>
            </a-badge>
            <span class="advertising-campaign-copy">
              <button type="button" class="advertising-link-button" @click="openDetail(record)">
                {{ record.campaignName }}
              </button>
              <span class="advertising-campaign-meta">
                <a-tag :color="getCampaignStatusTagColor(record.status)">
                  {{ getCampaignStatusLabel(record.status) }}
                </a-tag>
                <span class="advertising-campaign-id">{{ record.id }}</span>
              </span>
            </span>
          </span>
        </div>
      </template>

      <template #store="{ record }">
        <div class="advertising-store-cell">
          <strong>{{ record.storeName }}</strong>
          <span>{{ record.region }}</span>
        </div>
      </template>

      <template #budgetBalance="{ record }">
        <span class="advertising-number-cell">
          {{ formatAdvertisingMoney(getBudgetBalance(record), record.currencySymbol) }}
        </span>
      </template>

      <template #todaySpend="{ record }">
        <span class="advertising-number-cell">
          {{ formatAdvertisingMoney(getTodaySpend(record), record.currencySymbol) }}
        </span>
      </template>

      <template #impressions="{ record }">
        <span class="advertising-number-cell">{{ formatAdvertisingNumber(record.impressions) }}</span>
      </template>

      <template #ctr="{ record }">
        <span class="advertising-number-cell">{{ getCtr(record) }}</span>
      </template>

      <template #spendRatio="{ record }">
        <span class="advertising-number-cell">{{ getSpendRatio(record) }}</span>
      </template>

      <template #operation="{ record }">
        <a-space class="advertising-operation-actions">
          <a-button type="text" size="small" @click="openStatistics(record)">统计</a-button>
          <a-button type="text" size="small" @click="openDetail(record)">详情</a-button>
        </a-space>
      </template>

      <template #footer>
        <div class="advertising-table-footer-row">
          <div v-if="selectedRowKeys.length" class="advertising-bulk-action-bar">
            <span class="advertising-bulk-selected-count">
              已选 <span>{{ selectedRowKeys.length }}</span> / {{ filteredRows.length }} 条
            </span>
            <span
              class="arco-link advertising-bulk-cancel"
              role="button"
              tabindex="0"
              @click="clearCampaignSelection"
              @keydown.enter.prevent="clearCampaignSelection"
              @keydown.space.prevent="clearCampaignSelection"
            >
              取消选择
            </span>
            <a-button @click="bulkUpdateSelectedCampaigns('paused')">批量关闭</a-button>
            <a-button @click="bulkUpdateSelectedCampaigns('active')">批量开启</a-button>
          </div>
          <span v-else class="advertising-bulk-action-placeholder" aria-hidden="true" />

          <a-pagination
            v-model:current="currentPage"
            v-model:page-size="pageSize"
            class="advertising-pagination"
            :total="filteredRows.length"
            :page-size-options="[10, 20, 50]"
            show-total
            show-jumper
            show-page-size
          />
        </div>
      </template>
    </ConfigurableDataTable>

    <a-modal
      v-model:visible="createVisible"
      title="创建活动"
      width="600px"
      simple
      align-center
      title-align="start"
    >
      <a-form :model="createForm" layout="vertical" class="advertising-create-form">
        <a-form-item label="平台">
          <a-select v-model="createForm.platform" placeholder="请选择平台">
            <a-option v-for="option in advertisingPlatformOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="活动类型">
          <a-select v-model="createForm.campaignType" placeholder="请选择活动类型">
            <a-option v-for="option in campaignTypeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </a-option>
          </a-select>
        </a-form-item>
      </a-form>

      <template #footer>
        <div class="advertising-create-modal-footer">
          <a-space>
            <a-button @click="createVisible = false">取消</a-button>
            <a-button type="primary" @click="confirmCreate">确认</a-button>
          </a-space>
        </div>
      </template>
    </a-modal>
  </div>
</template>
