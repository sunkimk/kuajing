<script setup lang="ts">
import { computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRouter } from 'vue-router'
import type { StoreRecord } from '../../data/storeManagement'
import {
  getStoreAuthorizationStatusLabel,
  getStoreIssueTypeLabel,
  getStoreIssueTypeNote,
  getStoreSyncStatusLabel,
} from '../../data/storeManagement'
import './storeManagement.css'

const props = defineProps<{
  visible: boolean
  row?: StoreRecord
}>()

const emit = defineEmits<{
  'update:visible': [visible: boolean]
}>()

const router = useRouter()

const drawerVisible = computed({
  get: () => props.visible,
  set: (visible: boolean) => emit('update:visible', visible),
})

const handleQuickAction = (actionKey: string) => {
  if (actionKey === 'add') {
    router.push('/stores/add')
    return
  }

  Message.info(`${actionKey === 'config' ? '平台配置' : actionKey === 'sync' ? '同步策略' : '接入说明'}将在下一阶段接入`)
}
</script>

<template>
  <a-drawer
    v-model:visible="drawerVisible"
    :width="560"
    unmount-on-close
    title="店铺详情"
  >
    <div v-if="row" class="store-drawer-content">
      <div class="store-drawer-header">
        <div class="store-drawer-header-copy">
          <strong>{{ row.storeName }}</strong>
          <span>{{ row.platform }} / {{ row.storeCode }}</span>
        </div>
      </div>

      <section class="store-detail-section">
        <h3 class="store-detail-section-title">基础信息</h3>
        <div class="store-detail-grid">
          <div class="store-detail-item">
            <span>平台</span>
            <strong>{{ row.platform }}</strong>
          </div>
          <div class="store-detail-item">
            <span>店铺名称</span>
            <strong>{{ row.storeName }}</strong>
          </div>
          <div class="store-detail-item">
            <span>店铺编号</span>
            <strong class="store-mono">{{ row.storeCode }}</strong>
          </div>
          <div class="store-detail-item">
            <span>站点 / 区域</span>
            <strong>{{ row.region }}</strong>
          </div>
          <div class="store-detail-item">
            <span>负责人</span>
            <strong>{{ row.owner }}</strong>
          </div>
          <div class="store-detail-item">
            <span>近 7 天订单</span>
            <strong>{{ row.sevenDayOrders }}</strong>
          </div>
        </div>
      </section>

      <section class="store-detail-section">
        <h3 class="store-detail-section-title">状态信息</h3>
        <div class="store-detail-grid">
          <div class="store-detail-item">
            <span>授权状态</span>
            <strong>{{ getStoreAuthorizationStatusLabel(row.authorizationStatus) }}</strong>
          </div>
          <div class="store-detail-item">
            <span>同步状态</span>
            <strong>{{ getStoreSyncStatusLabel(row.syncStatus) }}</strong>
          </div>
          <div class="store-detail-item">
            <span>最近同步时间</span>
            <strong class="store-mono">{{ row.lastSyncAt }}</strong>
          </div>
          <div class="store-detail-item">
            <span>异常摘要</span>
            <strong>{{ row.issueType ? getStoreIssueTypeLabel(row.issueType) : '当前正常' }}</strong>
          </div>
        </div>

        <div v-if="row.issueType" class="store-detail-note">
          {{ getStoreIssueTypeNote(row.issueType) }}
        </div>
      </section>

      <section class="store-detail-section">
        <h3 class="store-detail-section-title">快捷动作</h3>
        <div class="store-drawer-actions">
          <a-button type="primary" class="store-action-button" @click="handleQuickAction('add')">创建新店铺</a-button>
          <a-button class="store-action-button" @click="handleQuickAction('config')">平台配置</a-button>
          <a-button class="store-action-button" @click="handleQuickAction('sync')">同步策略</a-button>
          <a-button class="store-action-button" @click="handleQuickAction('guide')">接入说明</a-button>
        </div>
      </section>
    </div>
  </a-drawer>
</template>
