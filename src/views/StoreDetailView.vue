<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SecondaryPageHeader from '../components/common/SecondaryPageHeader.vue'
import {
  createStoreRows,
  formatStoreBalance,
  getStoreAuthorizationStatusLabel,
  getStoreIssueTypeLabel,
  getStoreIssueTypeNote,
  getStoreSyncStatusLabel,
} from '../data/storeManagement'

const route = useRoute()
const router = useRouter()
const storeRows = createStoreRows()

const storeId = computed(() => String(route.params.storeId ?? ''))
const store = computed(() => storeRows.find((row) => row.id === storeId.value))
const statusText = computed(() => {
  if (!store.value) return '未找到'
  if (store.value.authorizationStatus !== 'active') return '授权需处理'
  if (store.value.syncStatus !== 'healthy') return '同步需关注'
  return '运行正常'
})
const statusTone = computed(() => statusText.value === '运行正常' ? 'success' : 'warning')

const goBack = () => {
  router.push('/stores/list')
}

const goSettings = () => {
  if (!store.value) return
  router.push(`/stores/${store.value.id}/settings`)
}

const goAuthorize = () => {
  if (!store.value) return
  router.push(`/stores/${store.value.id}/authorize`)
}

const goSync = () => {
  if (!store.value) return
  router.push(`/stores/${store.value.id}/sync`)
}
</script>

<template>
  <div class="store-detail-page">
    <SecondaryPageHeader
      :title="store?.legalName ?? '店铺详情'"
      :description="store ? `${store.platform} · ${store.businessType} · ${store.storeType}` : '当前店铺不存在或已被移除。'"
      :status-text="statusText"
      :status-tone="statusTone"
      @back="goBack"
    />

    <template v-if="store">
      <section class="store-detail-hero">
        <div class="store-detail-avatar">{{ store.platform.slice(0, 2).toUpperCase() }}</div>
        <div class="store-detail-title">
          <strong>{{ store.storeName }}</strong>
          <span>{{ store.storeCode }} · {{ store.region }} · 负责人 {{ store.owner }}</span>
        </div>

        <div class="store-detail-actions">
          <a-button class="store-action-button" @click="goSync">同步策略</a-button>
          <a-button class="store-action-button" @click="goSettings">平台配置</a-button>
          <a-button type="primary" class="store-action-button" @click="goAuthorize">重新授权</a-button>
        </div>
      </section>

      <section class="store-detail-metrics">
        <div class="store-detail-metric">
          <span>账户余额</span>
          <strong>{{ formatStoreBalance(store) }}</strong>
        </div>
        <div class="store-detail-metric">
          <span>税号</span>
          <strong class="store-mono">{{ store.taxNumber }}</strong>
        </div>
        <div class="store-detail-metric">
          <span>近 7 天订单</span>
          <strong>{{ store.sevenDayOrders }}</strong>
        </div>
        <div class="store-detail-metric">
          <span>最近同步</span>
          <strong class="store-mono">{{ store.lastSyncAt }}</strong>
        </div>
      </section>

      <section class="store-detail-section">
        <h2>运行状态</h2>
        <div class="store-detail-grid">
          <div class="store-detail-item">
            <span>授权状态</span>
            <strong>{{ getStoreAuthorizationStatusLabel(store.authorizationStatus) }}</strong>
          </div>
          <div class="store-detail-item">
            <span>同步状态</span>
            <strong>{{ getStoreSyncStatusLabel(store.syncStatus) }}</strong>
          </div>
          <div class="store-detail-item">
            <span>异常摘要</span>
            <strong>{{ store.issueType ? getStoreIssueTypeLabel(store.issueType) : '当前正常' }}</strong>
          </div>
          <div class="store-detail-item">
            <span>处理建议</span>
            <strong>{{ store.issueType ? getStoreIssueTypeNote(store.issueType) : '保持自动同步' }}</strong>
          </div>
        </div>
      </section>
    </template>

    <section v-else class="store-detail-empty">
      <strong>没有找到这个店铺</strong>
      <span>可以返回店铺列表重新选择，或者创建新店铺继续接入。</span>
      <a-button type="primary" @click="goBack">返回店铺列表</a-button>
    </section>
  </div>
</template>

<style scoped>
.store-detail-page {
  --store-detail-primary: rgb(var(--primary-6));
  --store-detail-text: var(--color-text-1);
  --store-detail-text-secondary: var(--color-text-2);
  --store-detail-text-tertiary: var(--color-text-3);
  --store-detail-bg: var(--color-bg-2);
  --store-detail-surface: var(--color-bg-1);
  --store-detail-border: var(--color-border-2);
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 16px;
}

.store-detail-hero,
.store-detail-metrics,
.store-detail-section,
.store-detail-empty {
  border: 1px solid var(--store-detail-border);
  border-radius: 8px;
  background: var(--store-detail-surface);
}

.store-detail-hero {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px;
}

.store-detail-avatar {
  display: inline-flex;
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(var(--primary-6), 0.08);
  color: var(--store-detail-primary);
  font-size: 14px;
  font-weight: 700;
}

.store-detail-title {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 4px;
}

.store-detail-title strong {
  color: var(--store-detail-text);
  font-size: 18px;
  font-weight: 600;
  line-height: 26px;
}

.store-detail-title span {
  color: var(--store-detail-text-tertiary);
  font-size: 13px;
  line-height: 20px;
}

.store-detail-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.store-action-button {
  border-radius: 4px;
}

.store-detail-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.store-detail-metric {
  display: flex;
  min-height: 108px;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  padding: 0 22px;
}

.store-detail-metric + .store-detail-metric {
  border-left: 1px solid var(--store-detail-border);
}

.store-detail-metric span,
.store-detail-item span {
  color: var(--store-detail-text-tertiary);
  font-size: 13px;
  line-height: 20px;
}

.store-detail-metric strong {
  overflow: hidden;
  color: var(--store-detail-text);
  font-size: 22px;
  font-weight: 600;
  line-height: 30px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.store-detail-section {
  padding: 18px;
}

.store-detail-section h2 {
  margin: 0 0 14px;
  color: var(--store-detail-text);
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.store-detail-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.store-detail-item {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
}

.store-detail-item strong {
  overflow: hidden;
  color: var(--store-detail-text);
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.store-detail-empty {
  display: flex;
  min-height: 260px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 24px;
  text-align: center;
}

.store-detail-empty strong {
  color: var(--store-detail-text);
  font-size: 16px;
  line-height: 24px;
}

.store-detail-empty span {
  color: var(--store-detail-text-tertiary);
  font-size: 13px;
  line-height: 20px;
}

.store-mono {
  font-variant-numeric: tabular-nums;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace;
}

@media (max-width: 1100px) {
  .store-detail-metrics,
  .store-detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .store-detail-metric:nth-child(odd) {
    border-left: 0;
  }
}

@media (max-width: 768px) {
  .store-detail-hero {
    align-items: flex-start;
    flex-direction: column;
  }

  .store-detail-actions {
    justify-content: flex-start;
  }

  .store-detail-metrics,
  .store-detail-grid {
    grid-template-columns: 1fr;
  }

  .store-detail-metric + .store-detail-metric {
    border-top: 1px solid var(--store-detail-border);
    border-left: 0;
  }
}
</style>
