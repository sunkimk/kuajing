<script setup lang="ts">
import { IconMore, IconPlus } from '@arco-design/web-vue/es/icon'
import type { StoreRecord } from '../../data/storeManagement'
import {
  getStoreAuthorizationStatusLabel,
  getStoreSyncStatusLabel,
} from '../../data/storeManagement'

type StoreCardAction = 'detail' | 'sync' | 'authorize'

const props = defineProps<{
  stores: StoreRecord[]
  totalCount: number
}>()

const emit = defineEmits<{
  createStore: []
  openStore: [storeId: string]
  syncStore: [storeId: string]
  authorizeStore: [storeId: string]
}>()

const getStatusClass = (type: 'authorization' | 'sync', status: string) => {
  if (type === 'authorization') {
    if (status === 'active') return 'status-success'
    if (status === 'pending') return 'status-processing'
    return 'status-danger'
  }

  if (status === 'healthy') return 'status-success'
  if (status === 'warning') return 'status-warning'
  return 'status-danger'
}

const getStoreMonogram = (store: StoreRecord) => {
  const normalized = store.platform.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
  if (normalized.length >= 2) return normalized.slice(0, 2)

  return store.storeName.trim().slice(0, 1).toUpperCase()
}

const getStoreHint = (store: StoreRecord) => {
  if (store.authorizationStatus !== 'active') return '授权需处理'
  if (store.syncStatus === 'failed') return '同步失败'
  if (store.syncStatus === 'warning') return '同步预警'
  return '运行正常'
}

const handleMenuSelect = (
  storeId: string,
  action: string | number | Record<string, any> | undefined,
) => {
  const nextAction = String(action) as StoreCardAction

  if (nextAction === 'detail') {
    emit('openStore', storeId)
    return
  }

  if (nextAction === 'sync') {
    emit('syncStore', storeId)
    return
  }

  if (nextAction === 'authorize') {
    emit('authorizeStore', storeId)
  }
}
</script>

<template>
  <section class="store-showcase">
    <div class="store-showcase-head">
      <div class="store-showcase-heading">
        <div>
          <h2>我的店铺</h2>
          <span>当前筛选结果 {{ totalCount }} 家店铺，统一浏览授权、同步和近期订单表现。</span>
        </div>

        <div class="store-showcase-toolbar">
          <a-button type="primary" class="volc-design-button" @click="emit('createStore')">
            <template #icon>
              <icon-plus />
            </template>
            创建新店铺
          </a-button>
        </div>
      </div>
    </div>

    <div v-if="!props.stores.length" class="store-empty-state">
      <strong>当前没有符合条件的店铺</strong>
      <span>可以调整筛选条件，或者直接创建新店铺继续接入。</span>
    </div>

    <div v-else class="store-card-grid">
      <article v-for="store in props.stores" :key="store.id" class="store-card">
        <div class="store-card-head">
          <div class="store-card-identity">
            <div class="store-avatar">{{ getStoreMonogram(store) }}</div>

            <div class="store-card-copy">
              <button type="button" class="store-card-title" @click="emit('openStore', store.id)">
                {{ store.storeName }}
              </button>
              <span>{{ store.storeCode }} · {{ store.platform }}</span>
            </div>
          </div>

          <a-dropdown trigger="click" @select="(value) => handleMenuSelect(store.id, value)">
            <a-button size="small" class="store-more-button" aria-label="更多操作">
              <template #icon>
                <icon-more />
              </template>
            </a-button>

            <template #content>
              <a-doption value="detail">查看详情</a-doption>
              <a-doption value="sync">立即同步</a-doption>
              <a-doption value="authorize">{{ store.authorizationStatus === 'active' ? '平台配置' : '重新授权' }}</a-doption>
            </template>
          </a-dropdown>
        </div>

        <div class="store-card-tags">
          <span class="store-platform-pill">{{ store.platform }}</span>
          <span class="store-status-pill" :class="getStatusClass('authorization', store.authorizationStatus)">
            {{ getStoreAuthorizationStatusLabel(store.authorizationStatus) }}
          </span>
          <span class="store-status-pill" :class="getStatusClass('sync', store.syncStatus)">
            {{ getStoreSyncStatusLabel(store.syncStatus) }}
          </span>
        </div>

        <div class="store-card-summary">
          <div class="store-card-summary-item">
            <span>负责人</span>
            <strong>{{ store.owner }}</strong>
          </div>
          <div class="store-card-summary-item">
            <span>站点 / 区域</span>
            <strong>{{ store.region }}</strong>
          </div>
          <div class="store-card-summary-item">
            <span>最近同步</span>
            <strong class="store-mono">{{ store.lastSyncAt }}</strong>
          </div>
          <div class="store-card-summary-item">
            <span>近 7 天订单</span>
            <strong>{{ store.sevenDayOrders }}</strong>
          </div>
        </div>

        <div class="store-card-footnote">{{ getStoreHint(store) }}</div>
      </article>
    </div>
  </section>
</template>
