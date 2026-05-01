<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { IconDragDotVertical } from '@arco-design/web-vue/es/icon'
import {
  filterColumnSettingsOptions,
  getColumnSettingsCounts,
  moveColumnSettingsKey,
  toggleColumnSettingsKey,
  type ColumnSettingsOption,
  type ColumnSettingsPanelMode,
  type ColumnSettingsPayload,
} from '../../data/columnSettings'

const props = withDefaults(defineProps<{
  visible: boolean
  columns: ColumnSettingsOption[]
  visibleKeys: string[]
  defaultVisibleKeys: string[]
  requiredKeys?: string[]
  autoWrap?: boolean
  freezeFirstRow?: boolean
  freezeFirstColumn?: boolean
  freezeLastColumn?: boolean
  defaultAutoWrap?: boolean
  defaultFreezeFirstRow?: boolean
  defaultFreezeFirstColumn?: boolean
  defaultFreezeLastColumn?: boolean
  title?: string
  width?: number
  modalClass?: string
}>(), {
  requiredKeys: () => [],
  autoWrap: false,
  freezeFirstRow: true,
  freezeFirstColumn: true,
  freezeLastColumn: true,
  defaultAutoWrap: false,
  defaultFreezeFirstRow: true,
  defaultFreezeFirstColumn: true,
  defaultFreezeLastColumn: true,
  title: '表格设置',
  width: 560,
  modalClass: 'column-settings-modal',
})

const emit = defineEmits<{
  'update:visible': [visible: boolean]
  confirm: [settings: ColumnSettingsPayload]
}>()

const columnPanelMode = ref<ColumnSettingsPanelMode>('selected')
const columnSearchKeyword = ref('')
const draftVisibleKeys = ref<string[]>([])
const draftTableAutoWrap = ref(false)
const draftFreezeFirstRow = ref(true)
const draftFreezeFirstColumn = ref(true)
const draftFreezeLastColumn = ref(true)
const draggedColumnKey = ref<string>()

const modalVisible = computed({
  get: () => props.visible,
  set: (visible: boolean) => emit('update:visible', visible),
})

const columnCounts = computed(() =>
  getColumnSettingsCounts(props.columns, draftVisibleKeys.value)
)

const filteredColumnOptions = computed(() =>
  filterColumnSettingsOptions(
    props.columns,
    draftVisibleKeys.value,
    columnPanelMode.value,
    columnSearchKeyword.value,
  )
)

const resetDraftFromProps = () => {
  draftVisibleKeys.value = [...props.visibleKeys]
  draftTableAutoWrap.value = props.autoWrap
  draftFreezeFirstRow.value = props.freezeFirstRow
  draftFreezeFirstColumn.value = props.freezeFirstColumn
  draftFreezeLastColumn.value = props.freezeLastColumn
  columnSearchKeyword.value = ''
  columnPanelMode.value = 'selected'
  draggedColumnKey.value = undefined
}

const setColumnPanelMode = (key: string | number) => {
  if (key === 'selected' || key === 'unselected') columnPanelMode.value = key
}

const isRequiredColumn = (key: string) => props.requiredKeys.includes(key)

const toggleColumnVisibility = (key: string, checked: boolean | (string | number | boolean)[]) => {
  draftVisibleKeys.value = toggleColumnSettingsKey(
    draftVisibleKeys.value,
    key,
    checked,
    props.requiredKeys,
  )
}

const startColumnDrag = (key: string, event: DragEvent) => {
  if (columnPanelMode.value !== 'selected') return
  draggedColumnKey.value = key
  event.dataTransfer?.setData('text/plain', key)
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

const moveDraftColumn = (targetKey: string) => {
  if (columnPanelMode.value !== 'selected') return
  draftVisibleKeys.value = moveColumnSettingsKey(
    draftVisibleKeys.value,
    draggedColumnKey.value,
    targetKey,
  )
}

const endColumnDrag = () => {
  draggedColumnKey.value = undefined
}

const resetColumnSettings = () => {
  draftVisibleKeys.value = [...props.defaultVisibleKeys]
  columnSearchKeyword.value = ''
  columnPanelMode.value = 'selected'
  draftTableAutoWrap.value = props.defaultAutoWrap
  draftFreezeFirstRow.value = props.defaultFreezeFirstRow
  draftFreezeFirstColumn.value = props.defaultFreezeFirstColumn
  draftFreezeLastColumn.value = props.defaultFreezeLastColumn
  draggedColumnKey.value = undefined
}

const cancelColumnSettings = () => {
  modalVisible.value = false
}

const confirmColumnSettings = () => {
  emit('confirm', {
    visibleKeys: [...draftVisibleKeys.value],
    autoWrap: draftTableAutoWrap.value,
    freezeFirstRow: draftFreezeFirstRow.value,
    freezeFirstColumn: draftFreezeFirstColumn.value,
    freezeLastColumn: draftFreezeLastColumn.value,
  })
  modalVisible.value = false
}

watch(() => props.visible, (visible) => {
  if (visible) resetDraftFromProps()
}, { immediate: true })
</script>

<template>
  <a-modal
    v-model:visible="modalVisible"
    :width="width"
    :title="title"
    :modal-class="modalClass"
  >
    <div class="column-settings">
      <div class="settings-side">
        <div class="settings-section-title">基础设置</div>
        <div class="settings-switch-row">
          <a-switch v-model="draftTableAutoWrap" size="small" />
          <span>自动换行</span>
        </div>
        <div class="settings-section-title">冻结设置</div>
        <div class="settings-switch-row">
          <a-switch v-model="draftFreezeFirstRow" size="small" />
          <span>首行</span>
        </div>
        <div class="settings-switch-row">
          <a-switch v-model="draftFreezeFirstColumn" size="small" />
          <span>首列</span>
        </div>
        <div class="settings-switch-row">
          <a-switch v-model="draftFreezeLastColumn" size="small" />
          <span>末列</span>
        </div>
      </div>

      <div class="settings-divider" />

      <div class="settings-main">
        <div class="settings-section-title">选择可见列</div>
        <a-tabs
          :active-key="columnPanelMode"
          type="capsule"
          size="small"
          hide-content
          class="settings-capsule-tabs"
          @change="setColumnPanelMode"
        >
          <a-tab-pane key="selected">
            <template #title>
              <span class="settings-tab-title">
                已选列
                <span class="settings-tab-count">{{ columnCounts.selectedCount }}</span>
              </span>
            </template>
          </a-tab-pane>
          <a-tab-pane key="unselected">
            <template #title>
              <span class="settings-tab-title">
                未选列
                <span class="settings-tab-count">{{ columnCounts.hiddenCount }}</span>
              </span>
            </template>
          </a-tab-pane>
        </a-tabs>
        <a-input-search v-model="columnSearchKeyword" placeholder="请输入" allow-clear class="settings-search" />
        <div class="settings-column-list">
          <label
            v-for="column in filteredColumnOptions"
            :key="column.key"
            class="settings-column-item"
            :class="{
              'is-disabled': isRequiredColumn(column.key),
              'is-dragging': draggedColumnKey === column.key,
            }"
            :draggable="columnPanelMode === 'selected'"
            @dragstart="startColumnDrag(column.key, $event)"
            @dragover.prevent="moveDraftColumn(column.key)"
            @dragend="endColumnDrag"
          >
            <a-checkbox
              :model-value="draftVisibleKeys.includes(column.key)"
              :disabled="isRequiredColumn(column.key)"
              @change="(checked) => toggleColumnVisibility(column.key, checked)"
            />
            <span class="settings-column-name">{{ column.title }}</span>
            <span v-if="columnPanelMode === 'selected'" class="settings-drag-handle" aria-hidden="true">
              <icon-drag-dot-vertical />
            </span>
          </label>
          <div v-if="filteredColumnOptions.length === 0" class="settings-empty">暂无列</div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="column-settings-footer">
        <a-button class="settings-restore-button" @click="resetColumnSettings">恢复默认</a-button>
        <a-button @click="cancelColumnSettings">取消</a-button>
        <a-button type="primary" @click="confirmColumnSettings">确定</a-button>
      </div>
    </template>
  </a-modal>
</template>

<style scoped>
.column-settings {
  --column-settings-color-primary: rgb(var(--primary-6));
  --column-settings-color-text: var(--color-text-1);
  --column-settings-color-text-secondary: var(--color-text-2);
  --column-settings-color-text-tertiary: var(--color-text-3);
  --column-settings-color-fill: var(--color-fill-1);
  --column-settings-color-border: var(--color-border-2);
  display: flex;
  height: 372px;
  overflow: hidden;
}

.settings-side {
  flex: 0 0 124px;
  padding-top: 2px;
}

.settings-divider {
  width: 1px;
  flex: 0 0 1px;
  margin: 0 20px;
  background: var(--column-settings-color-border);
}

.settings-section-title {
  margin-bottom: 12px;
  color: var(--column-settings-color-text);
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
}

.settings-switch-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: var(--column-settings-color-text-secondary);
  font-size: 13px;
  line-height: 20px;
}

.settings-main {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
}

.settings-capsule-tabs {
  width: fit-content;
  margin-bottom: 16px;
}

.settings-capsule-tabs :deep(.arco-tabs-nav-type-capsule .arco-tabs-nav-tab:not(.arco-tabs-nav-tab-scroll)) {
  justify-content: flex-start;
}

.settings-capsule-tabs :deep(.arco-tabs-content-hide) {
  display: none;
}

.settings-tab-title {
  display: flex;
  align-items: center;
}

.settings-tab-count {
  display: inline-flex;
  height: 14px;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
  padding: 0 6px;
  border-radius: 42px;
  background: rgb(250, 251, 252);
  color: var(--column-settings-color-text-secondary);
  font-size: 10px;
  font-weight: inherit;
  line-height: 14px;
}

.settings-capsule-tabs :deep(.arco-tabs-tab-active) .settings-tab-count {
  background: rgb(235, 241, 255);
  color: var(--column-settings-color-primary);
}

.settings-search {
  margin-bottom: 8px;
}

.settings-column-list {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding-right: 4px;
}

.settings-column-item {
  display: flex;
  height: 32px;
  align-items: center;
  gap: 8px;
  padding: 0 6px 0 4px;
  border-radius: 4px;
  color: var(--column-settings-color-text);
  cursor: pointer;
  font-size: 13px;
}

.settings-column-item:hover {
  background: var(--column-settings-color-fill);
}

.settings-column-item.is-dragging {
  background: rgba(var(--primary-6), 0.08);
  opacity: 0.72;
}

.settings-column-item.is-disabled {
  color: var(--column-settings-color-text-tertiary);
  cursor: not-allowed;
}

.settings-column-name {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.settings-drag-handle {
  display: inline-flex;
  align-items: center;
  color: var(--column-settings-color-text-tertiary);
  cursor: grab;
  font-size: 14px;
}

.settings-empty {
  display: grid;
  height: 100%;
  min-height: 96px;
  place-items: center;
  color: var(--column-settings-color-text-tertiary);
  font-size: 13px;
}

.column-settings-footer {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.settings-restore-button {
  margin-right: auto;
}
</style>
