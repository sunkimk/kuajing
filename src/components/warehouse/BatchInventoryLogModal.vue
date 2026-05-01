<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { TableColumnData } from '@arco-design/web-vue'
import { IconSync } from '@arco-design/web-vue/es/icon'
import type { LogTab, OperateLog } from '../../data/batchInventory'

const props = withDefaults(defineProps<{
  visible: boolean
  logs: OperateLog[]
  activeTab?: LogTab
}>(), {
  activeTab: 'operate',
})

const emit = defineEmits<{
  'update:visible': [visible: boolean]
  close: []
}>()

const modalVisible = computed({
  get: () => props.visible,
  set: (visible: boolean) => emit('update:visible', visible),
})

const activeLogTab = ref<LogTab>(props.activeTab)

watch(() => props.visible, (visible) => {
  if (visible) activeLogTab.value = props.activeTab
})

const closeModal = () => {
  emit('update:visible', false)
  emit('close')
}

const logColumns: TableColumnData[] = [
  { title: '序号', dataIndex: 'seqNo', width: 140, align: 'center' },
  { title: '关联单号', dataIndex: 'relatedNo', width: 140, align: 'center', ellipsis: true, tooltip: true },
  { title: '类型', slotName: 'type', width: 100, align: 'center' },
  { title: '仓库', dataIndex: 'warehouse', width: 100, align: 'center' },
  { title: '平台站点', dataIndex: 'platformSite', width: 100, align: 'center' },
  { title: '状态', slotName: 'logStatus', width: 86, align: 'center' },
  { title: '入库类型', dataIndex: 'inboundType', width: 100, align: 'center' },
  { title: '出库类型', dataIndex: 'outboundType', width: 100, align: 'center' },
  { title: '操作人', dataIndex: 'creator', width: 80, align: 'center' },
  { title: '创建时间', dataIndex: 'createTime', width: 160, align: 'center' },
]
</script>

<template>
  <a-modal
    v-if="modalVisible"
    v-model:visible="modalVisible"
    title="操作日志"
    :width="720"
    modal-class="log-dlg"
    unmount-on-close
    @ok="closeModal"
    @cancel="closeModal"
  >
    <div class="log-dialog">
      <div class="log-tabs">
        <button
          v-for="tabItem in [
            { key: 'operate', label: '操作日志' },
            { key: 'cost', label: '成本调整' },
          ]"
          :key="tabItem.key"
          type="button"
          class="log-tab"
          :class="{ active: activeLogTab === tabItem.key }"
          @click="activeLogTab = tabItem.key as LogTab"
        >
          {{ tabItem.label }}
          <span v-if="activeLogTab === tabItem.key" class="log-tab-indicator" />
        </button>
      </div>

      <div v-if="activeLogTab === 'operate'" class="log-table-wrap">
        <a-table :columns="logColumns" :data="logs" :pagination="false" size="small" class="log-table">
          <template #type="{ record }">
            <span class="type-tag">{{ record.type || '--' }}</span>
          </template>
          <template #logStatus="{ record }">
            <span :class="record.status === '良品' ? 'text-good' : 'text-muted'">{{ record.status || '--' }}</span>
          </template>
        </a-table>
        <div class="log-pagination">
          <span class="log-total">共 {{ logs.length }} 条记录</span>
          <a-pagination :total="logs.length" :page-size="20" size="small" />
        </div>
      </div>

      <div v-else class="log-empty">
        <div class="empty-icon">
          <icon-sync />
        </div>
        <p class="empty-text">暂无成本调整日志</p>
        <p class="empty-hint">成本调整记录将在此处展示</p>
      </div>
    </div>
    <template #footer>
      <a-button type="primary" @click="closeModal">确定</a-button>
    </template>
  </a-modal>
</template>

<style scoped>
.log-dialog {
  --batch-color-primary: rgb(var(--primary-6));
  --batch-color-text-secondary: var(--color-text-2);
  --batch-color-text-tertiary: var(--color-text-3);
  --batch-color-fill: var(--color-fill-1);
  --batch-color-border: var(--color-border-2);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.log-tabs {
  display: flex;
  gap: 18px;
  border-bottom: 1px solid var(--batch-color-border);
}

.log-tab {
  position: relative;
  height: 34px;
  border: 0;
  background: transparent;
  color: var(--batch-color-text-secondary);
  cursor: pointer;
  font-size: 13px;
}

.log-tab.active {
  color: var(--batch-color-primary);
  font-weight: 600;
}

.log-tab-indicator {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 2px;
  border-radius: 999px;
  background: var(--batch-color-primary);
}

.log-table-wrap {
  overflow: hidden;
}

.log-table :deep(.arco-table-th) {
  background: var(--batch-color-fill);
}

.log-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
}

.log-total,
.text-muted,
.empty-icon,
.empty-hint {
  color: var(--batch-color-text-tertiary);
}

.text-good {
  color: #00b42a;
}

.type-tag {
  display: inline-flex;
  height: 22px;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(var(--primary-6), 0.08);
  color: var(--batch-color-primary);
  font-size: 12px;
  line-height: 22px;
}

.log-total,
.empty-hint {
  font-size: 12px;
}

.log-empty {
  display: grid;
  min-height: 240px;
  place-items: center;
  align-content: center;
  gap: 8px;
  color: var(--batch-color-text-tertiary);
}

.empty-icon {
  font-size: 36px;
}

.empty-text {
  margin: 0;
  color: var(--batch-color-text-secondary);
  font-size: 14px;
}

.empty-hint {
  margin: 0;
}
</style>
