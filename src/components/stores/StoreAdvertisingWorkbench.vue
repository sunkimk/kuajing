<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconPlus, IconRefresh, IconSettings } from '@arco-design/web-vue/es/icon'
import { useRouter } from 'vue-router'
import type { ConfigurableTableColumn } from '../../data/configurableTable'
import ConfigurableDataTable from '../common/ConfigurableDataTable.vue'
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
  getCampaignStatusClass,
  getCampaignStatusLabel,
  resolveAdvertisingScopeLabel,
  type AdvertisingCampaign,
  type AdvertisingCampaignType,
  type AdvertisingPlatform,
} from '../../data/storeAdvertising'
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

const router = useRouter()
const filters = ref(createDefaultAdvertisingFilters())
const allRows = ref(createAdvertisingCampaignRows())
const loading = ref(false)
const settingsVisible = ref(false)
const createVisible = ref(false)
const selectedRowKeys = ref<(string | number)[]>([])
const createForm = ref<{
  platform?: AdvertisingPlatform
  campaignType?: AdvertisingCampaignType
}>({})

const filteredRows = computed(() => filterAdvertisingCampaigns(allRows.value, filters.value))
const storeOptions = computed(() => getAdvertisingStoreOptions(filters.value.platforms))
const scopeLabel = computed(() => resolveAdvertisingScopeLabel(filters.value.platforms, filters.value.storeIds))

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
  { settingsKey: 'campaign', title: '活动', dataIndex: 'campaign', slotName: 'campaign', width: 280, minWidth: 260, align: 'left' },
  { settingsKey: 'platform', title: '平台', dataIndex: 'platform', width: 132, minWidth: 120, align: 'center' },
  { settingsKey: 'store', title: '店铺', dataIndex: 'store', slotName: 'store', width: 180, minWidth: 168, align: 'left' },
  { settingsKey: 'campaignType', title: '活动类型', dataIndex: 'campaignType', width: 104, minWidth: 96, align: 'center' },
  { settingsKey: 'budgetBalance', title: '预算余额', dataIndex: 'budgetBalance', slotName: 'budgetBalance', width: 132, minWidth: 124, align: 'right' },
  { settingsKey: 'todaySpend', title: '今日消耗', dataIndex: 'todaySpend', slotName: 'todaySpend', width: 132, minWidth: 124, align: 'right' },
  { settingsKey: 'impressions', title: '曝光', dataIndex: 'impressions', slotName: 'impressions', width: 124, minWidth: 116, align: 'right' },
  { settingsKey: 'ctr', title: 'CTR', dataIndex: 'ctr', slotName: 'ctr', width: 92, minWidth: 84, align: 'right' },
  { settingsKey: 'orders', title: '订单', dataIndex: 'orders', width: 88, minWidth: 80, align: 'right' },
  { settingsKey: 'spendRatio', title: '消耗占比', dataIndex: 'spendRatio', slotName: 'spendRatio', width: 112, minWidth: 104, align: 'right' },
  { title: '操作', slotName: 'operation', width: 112, align: 'center' },
]

const getBudgetBalance = (record: AdvertisingCampaign) =>
  Math.max(record.budget - record.spend, 0)

const getTodaySpend = (record: AdvertisingCampaign) =>
  record.statistics.at(-1)?.spend ?? 0

const getCtr = (record: AdvertisingCampaign) =>
  record.impressions > 0 ? `${(record.clicks / record.impressions * 100).toFixed(1)}%` : '0.0%'

const getSpendRatio = (record: AdvertisingCampaign) =>
  record.budget > 0 ? `${(record.spend / record.budget * 100).toFixed(1)}%` : '0.0%'

const handleSearch = () => {}

const resetFilters = () => {
  filters.value = createDefaultAdvertisingFilters()
  handleSearch()
}

const refreshData = () => {
  loading.value = true
  allRows.value = createAdvertisingCampaignRows()
  selectedRowKeys.value = []
  loading.value = false
}

const isCampaignStatusEditable = (status: AdvertisingCampaign['status']) =>
  status === 'active' || status === 'paused'

const toggleStatus = (record: AdvertisingCampaign) => {
  if (!isCampaignStatusEditable(record.status)) return

  allRows.value = allRows.value.map((row) =>
    row.id === record.id
      ? { ...row, status: row.status === 'active' ? 'paused' : 'active' }
      : row
  )
}

const filterActiveCampaigns = () => {
  filters.value = { ...filters.value, statuses: ['active'] }
  handleSearch()
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
  const rowKeySet = new Set(rows.map((row) => row.id))
  selectedRowKeys.value = selectedRowKeys.value.filter((rowKey) => rowKeySet.has(String(rowKey)))
})
</script>

<template>
  <div class="store-advertising-workbench">
    <section class="advertising-page-header">
      <div class="advertising-page-header-copy">
        <h1>广告推广</h1>
        <p>统一查看多平台、多店铺广告活动、预算消耗与转化表现。</p>
      </div>

      <div class="advertising-page-header-actions">
        <label class="advertising-scope-picker">
          <span>广告范围</span>
          <a-select
            v-model="filters.storeIds"
            multiple
            allow-clear
            :max-tag-count="1"
            :placeholder="scopeLabel"
            class="advertising-scope-select"
            @change="handleSearch"
          >
            <a-option v-for="option in storeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </a-option>
          </a-select>
        </label>
        <a-button type="primary" class="advertising-create-button" @click="createVisible = true">
          <template #icon>
            <icon-plus />
          </template>
          创建活动
        </a-button>
        <a-button :loading="loading" @click="refreshData">
          <template #icon>
            <icon-refresh />
          </template>
          刷新
        </a-button>
      </div>
    </section>

    <section class="advertising-activity-toolbar">
      <div class="advertising-toolbar-primary">
        <a-input-search
          v-model="filters.keyword"
          allow-clear
          class="advertising-toolbar-search"
          placeholder="通过活动ID或名称搜索"
          @search="handleSearch"
          @press-enter="handleSearch"
          @clear="handleSearch"
        />
      </div>

      <div class="advertising-toolbar-actions">
        <a-range-picker
          v-model="filters.dateRange"
          value-format="YYYY-MM-DD"
          :placeholder="['开始日期', '结束日期']"
          class="advertising-toolbar-date"
          @change="handleSearch"
        />
        <a-tooltip content="定制列">
          <a-button class="icon-button" size="small" aria-label="定制列" @click="settingsVisible = true">
            <template #icon>
              <icon-settings />
            </template>
          </a-button>
        </a-tooltip>
      </div>
    </section>

    <section class="advertising-filter-row">
      <label class="advertising-filter-field">
        <span>活动状态</span>
        <a-select
          v-model="filters.statuses"
          multiple
          allow-clear
          :max-tag-count="1"
          placeholder="全部状态"
          @change="handleSearch"
        >
          <a-option v-for="option in campaignStatusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </a-option>
        </a-select>
      </label>

      <label class="advertising-filter-field">
        <span>活动类型</span>
        <a-select
          v-model="filters.campaignTypes"
          multiple
          allow-clear
          :max-tag-count="1"
          placeholder="全部类型"
          @change="handleSearch"
        >
          <a-option v-for="option in campaignTypeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </a-option>
        </a-select>
      </label>

      <label class="advertising-filter-field">
        <span>预算状态</span>
        <a-select
          v-model="filters.budgetStatuses"
          multiple
          allow-clear
          :max-tag-count="1"
          placeholder="全部预算"
          @change="handleSearch"
        >
          <a-option v-for="option in budgetStatusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </a-option>
        </a-select>
      </label>

      <div class="advertising-filter-actions">
        <a-button type="primary" class="action-button" @click="handleSearch">查询</a-button>
        <a-button class="action-button" @click="resetFilters">重置</a-button>
        <a-button class="action-button" @click="filterActiveCampaigns">投放中</a-button>
      </div>
    </section>

    <section v-if="selectedRowKeys.length" class="advertising-bulk-action-bar">
      <span class="advertising-bulk-selected-count">
        已选 <span>{{ selectedRowKeys.length }}</span> / {{ filteredRows.length }} 条
      </span>
      <div class="advertising-bulk-actions">
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
        <a-button status="danger" @click="bulkUpdateSelectedCampaigns('paused')">批量关闭</a-button>
        <a-button type="primary" @click="bulkUpdateSelectedCampaigns('active')">批量开启</a-button>
      </div>
    </section>

    <ConfigurableDataTable
      v-model:selected-keys="selectedRowKeys"
      v-model:settings-visible="settingsVisible"
      :columns="columns"
      :default-visible-keys="defaultVisibleKeys"
      :required-keys="requiredKeys"
      :pinned-column-keys="pinnedColumnKeys"
      :default-freeze-last-column="true"
      :data="filteredRows"
      :row-selection="campaignRowSelection"
      row-key="id"
      :pagination="false"
      :loading="loading"
      wrapper-class="store-advertising-table"
      table-class="store-advertising-campaign-table"
    >
      <template #campaign="{ record }">
        <div class="advertising-campaign-cell">
          <a-switch
            size="small"
            :model-value="record.status === 'active'"
            :disabled="!isCampaignStatusEditable(record.status)"
            @change="() => toggleStatus(record)"
          />
          <span class="advertising-campaign-thumb">
            <img
              v-if="record.products[0]?.image"
              :src="record.products[0].image"
              :alt="record.products[0].name"
              class="advertising-campaign-image"
            />
            <span v-else>{{ record.platform.slice(0, 2) }}</span>
          </span>
          <span class="advertising-campaign-copy">
            <button type="button" class="advertising-link-button" @click="openDetail(record)">
              {{ record.campaignName }}
            </button>
            <span class="advertising-campaign-meta">
              <span class="advertising-status-pill" :class="getCampaignStatusClass(record.status)">
                {{ getCampaignStatusLabel(record.status) }}
              </span>
              <span class="advertising-campaign-id">{{ record.id }}</span>
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
        <a-space>
          <a-button type="text" size="small" @click="openStatistics(record)">统计</a-button>
          <a-button type="text" size="small" @click="openDetail(record)">详情</a-button>
        </a-space>
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
        <a-space>
          <a-button @click="createVisible = false">取消</a-button>
          <a-button type="primary" @click="confirmCreate">确认</a-button>
        </a-space>
      </template>
    </a-modal>
  </div>
</template>
