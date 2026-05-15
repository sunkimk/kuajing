<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import ConfigurableDataTable from '../common/ConfigurableDataTable.vue'
import type { ConfigurableTableColumn } from '../../data/configurableTable'
import type { AdvertisingCampaign } from '../../data/storeAdvertising'
import {
  createAdvertisingCampaignRows,
  createAdvertisingSummaryCards,
  formatAdvertisingMoney,
  getCampaignStatusLabel,
  resolveAdvertisingScopeLabel,
} from '../../data/storeAdvertising'
import './storeAdvertising.css'

const router = useRouter()
const rows = ref(createAdvertisingCampaignRows())
const selectedPlatforms = ref([])
const selectedStoreIds = ref([])
const summaryCards = computed(() => createAdvertisingSummaryCards(rows.value))
const scopeLabel = computed(() => resolveAdvertisingScopeLabel(selectedPlatforms.value, selectedStoreIds.value))

const columns: ConfigurableTableColumn[] = [
  { title: '活动名称', dataIndex: 'campaignName', settingsKey: 'campaignName', slotName: 'campaignName', width: 220 },
  { title: '平台', dataIndex: 'platform', settingsKey: 'platform', width: 140 },
  { title: '店铺', dataIndex: 'storeName', settingsKey: 'storeName', width: 180 },
  { title: '状态', dataIndex: 'status', settingsKey: 'status', slotName: 'status', width: 120 },
  { title: '预算', dataIndex: 'budget', settingsKey: 'budget', slotName: 'budget', width: 140 },
  { title: '操作', dataIndex: 'operations', settingsKey: 'operations', slotName: 'operations', width: 180 },
]

const defaultVisibleKeys = ['campaignName', 'platform', 'storeName', 'status', 'budget', 'operations']

const handleCreateCampaign = () => {}

const openCampaignDetail = (record: AdvertisingCampaign) => {
  router.push(`/stores/ads/${record.id}`)
}

const openCampaignStatistics = (record: AdvertisingCampaign) => {
  router.push(`/stores/ads/${record.id}/statistics`)
}
</script>

<template>
  <div class="store-advertising-workbench">
    <section class="advertising-page-header">
      <div>
        <h1>广告推广</h1>
        <p>{{ scopeLabel }}</p>
      </div>
      <a-button type="primary" @click="handleCreateCampaign">创建活动</a-button>
    </section>

    <section class="advertising-filter-row">
      <span>平台</span>
      <span>店铺</span>
    </section>

    <section class="advertising-summary-grid">
      <div v-for="card in summaryCards" :key="card.label" class="advertising-summary-card">
        <span>{{ card.label }}</span>
        <strong>{{ card.value }}</strong>
        <small>{{ card.note }}</small>
      </div>
    </section>

    <ConfigurableDataTable
      :columns="columns"
      :default-visible-keys="defaultVisibleKeys"
      :data="rows"
      row-key="id"
      :pagination="false"
      wrapper-class="store-advertising-table"
    >
      <template #campaignName="{ record }">
        <button type="button" class="advertising-link-button" @click="openCampaignDetail(record)">
          {{ record.campaignName }}
        </button>
      </template>
      <template #status="{ record }">
        {{ getCampaignStatusLabel(record.status) }}
      </template>
      <template #budget="{ record }">
        {{ formatAdvertisingMoney(record.budget, record.currencySymbol) }}
      </template>
      <template #operations="{ record }">
        <a-space>
          <a-button size="mini" @click="openCampaignDetail(record)">详情</a-button>
          <a-button size="mini" @click="openCampaignStatistics(record)">统计</a-button>
        </a-space>
      </template>
    </ConfigurableDataTable>
  </div>
</template>
