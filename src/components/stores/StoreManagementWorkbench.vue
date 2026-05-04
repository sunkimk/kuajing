<script setup lang="ts">
import { computed, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconRefresh } from '@arco-design/web-vue/es/icon'
import { useRouter } from 'vue-router'
import type {
  StoreAuthorizationStatus,
  StoreRecord,
  StoreSyncStatus,
} from '../../data/storeManagement'
import {
  createDefaultStoreFilters,
  createStoreRows,
  filterStoreRows,
} from '../../data/storeManagement'
import StoreDetailDrawer from './StoreDetailDrawer.vue'
import StoreHealthActionPanel from './StoreHealthActionPanel.vue'
import './storeManagement.css'

const router = useRouter()
const filters = ref(createDefaultStoreFilters())
const loading = ref(false)
const detailVisible = ref(false)
const currentRow = ref<StoreRecord>()
const allRows = ref(createStoreRows())

const platformOptions = computed(() =>
  Array.from(new Set(allRows.value.map((row) => row.platform))).map((value) => ({ label: value, value }))
)

const authorizationOptions: Array<{ label: string; value: StoreAuthorizationStatus }> = [
  { label: '有效', value: 'active' },
  { label: '失效', value: 'expired' },
  { label: '待审', value: 'pending' },
]

const syncOptions: Array<{ label: string; value: StoreSyncStatus }> = [
  { label: '正常', value: 'healthy' },
  { label: '预警', value: 'warning' },
  { label: '失败', value: 'failed' },
]

const filteredRows = computed(() => filterStoreRows(allRows.value, filters.value))

const handleSearch = () => {}

const resetFilters = () => {
  filters.value = createDefaultStoreFilters()
}

const refreshData = () => {
  loading.value = true
  allRows.value = createStoreRows()
  loading.value = false
}

const findStoreById = (storeId: string) => allRows.value.find((row) => row.id === storeId)

const openDetail = (row: StoreRecord) => {
  currentRow.value = row
  detailVisible.value = true
}

const handleCreateStore = () => {
  router.push('/stores/add')
}

const handleOpenStore = (storeId: string) => {
  const row = findStoreById(storeId)
  if (!row) return
  openDetail(row)
}

const handleSyncStore = (storeId: string) => {
  const row = findStoreById(storeId)
  if (!row) return
  Message.success(`${row.storeName} 已加入同步队列`)
}

const handleAuthorizeStore = (storeId: string) => {
  const row = findStoreById(storeId)
  if (!row) return

  if (row.authorizationStatus === 'active') {
    Message.info(`${row.storeName} 的平台配置将在下一阶段接入`)
    return
  }

  Message.info(`${row.storeName} 的重新授权流程将在下一阶段接入`)
}
</script>

<template>
  <div class="store-management-workbench">
    <section class="page-header">
      <div class="header-left">
        <h1 class="page-title">店铺列表</h1>
        <span class="page-desc">集中查看我的店铺、授权状态与同步情况。</span>
      </div>
    </section>

    <section class="filter-panel-shell volc-design-common-table-query">
      <div class="filter-panel">
        <div class="filter-row">
          <div class="volc-design-search-item-wrap store-filter-keyword">
            <div class="volc-design-search-item-label">
              <span>关键词</span>
            </div>
            <a-input-search
              v-model="filters.keyword"
              allow-clear
              placeholder="搜索店铺名称 / 店铺编号 / 平台 / 负责人"
              class="volc-design-search-item filter-search"
              @search="handleSearch"
              @press-enter="handleSearch"
              @clear="handleSearch"
            />
          </div>

          <div class="volc-design-search-item-wrap">
            <div class="volc-design-search-item-label">
              <span>平台</span>
            </div>
            <a-select
              v-model="filters.platform"
              placeholder="全部平台"
              allow-clear
              class="volc-design-search-item"
              @change="handleSearch"
            >
              <a-option v-for="option in platformOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </a-option>
            </a-select>
          </div>

          <div class="volc-design-search-item-wrap">
            <div class="volc-design-search-item-label">
              <span>授权状态</span>
            </div>
            <a-select
              v-model="filters.authorizationStatus"
              placeholder="全部状态"
              allow-clear
              class="volc-design-search-item"
              @change="handleSearch"
            >
              <a-option v-for="option in authorizationOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </a-option>
            </a-select>
          </div>

          <div class="volc-design-search-item-wrap">
            <div class="volc-design-search-item-label">
              <span>同步状态</span>
            </div>
            <a-select
              v-model="filters.syncStatus"
              placeholder="全部状态"
              allow-clear
              class="volc-design-search-item"
              @change="handleSearch"
            >
              <a-option v-for="option in syncOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </a-option>
            </a-select>
          </div>

          <div class="filter-actions-bar">
            <a-button class="volc-design-button" @click="resetFilters">重置</a-button>
            <a-tooltip content="刷新">
              <a-button size="small" class="filter-icon-button" aria-label="刷新" :loading="loading" @click="refreshData">
                <template #icon>
                  <icon-refresh />
                </template>
              </a-button>
            </a-tooltip>
          </div>
        </div>
      </div>
    </section>

    <StoreHealthActionPanel
      :stores="filteredRows"
      :total-count="filteredRows.length"
      @create-store="handleCreateStore"
      @open-store="handleOpenStore"
      @sync-store="handleSyncStore"
      @authorize-store="handleAuthorizeStore"
    />

    <StoreDetailDrawer v-model:visible="detailVisible" :row="currentRow" />
  </div>
</template>
