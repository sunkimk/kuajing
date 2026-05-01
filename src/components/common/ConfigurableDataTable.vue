<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useAttrs, useSlots } from 'vue'
import type { HTMLAttributes } from 'vue'
import type { TableColumnData } from '@arco-design/web-vue'
import ColumnSettingsModal from './ColumnSettingsModal.vue'
import type { ColumnSettingsPayload } from '../../data/columnSettings'
import {
  createTableColumnSettingsOptions,
  getConfigurableTableColumnFixedSide,
  getConfigurableTableColumnKey,
  isConfigurableTableColumnReorderable,
  mergeConfirmedColumnOrder,
  type ConfigurableTableColumn,
} from '../../data/configurableTable'
import {
  getColumnResizeGuideLeft,
  getColumnResizeGuideLeftFromWidth,
  getHeaderMinimumWidth,
  reorderColumnKeys,
  resolveColumnWidth,
  setTableTextSelectionGuard,
} from '../../data/tableInteractionHelpers'

defineOptions({
  inheritAttrs: false,
})

type TableClassValue = HTMLAttributes['class']
type ScrollConfig = {
  x?: string | number
  y?: string | number
  minWidth?: string | number
  maxHeight?: string | number
}

const props = withDefaults(defineProps<{
  columns: ConfigurableTableColumn[]
  defaultVisibleKeys: string[]
  settingsVisible?: boolean
  requiredKeys?: string[]
  pinnedColumnKeys?: string[]
  operationSlotName?: string
  tableClass?: TableClassValue
  wrapperClass?: TableClassValue
}>(), {
  settingsVisible: false,
  requiredKeys: () => [],
  pinnedColumnKeys: () => [],
  operationSlotName: 'operation',
  tableClass: undefined,
  wrapperClass: undefined,
})

const emit = defineEmits<{
  'update:settingsVisible': [visible: boolean]
}>()

const attrs = useAttrs()
const slots = useSlots()

const settingsModalVisible = computed({
  get: () => props.settingsVisible,
  set: (visible: boolean) => emit('update:settingsVisible', visible),
})

const tableWrapperRef = ref<HTMLElement>()
const tableBodyRef = ref<HTMLElement>()
const visibleColumnKeys = ref<string[]>([...props.defaultVisibleKeys])
const columnOrder = ref<string[]>([...props.defaultVisibleKeys])
const tableAutoWrap = ref(false)
const freezeFirstRow = ref(true)
const freezeFirstColumn = ref(true)
const freezeLastColumn = ref(true)
const pendingDragColumnKey = ref<string>()
const draggingColumnKey = ref<string>()
const dragOverColumnKey = ref<string>()
const hoveredColumnKey = ref<string>()
const resizingColumnKey = ref<string>()
const columnWidthOverrides = ref<Record<string, number>>({})
const columnDragStartX = ref(0)
const columnResizeStartX = ref(0)
const columnResizeStartWidth = ref(0)
const columnResizeMinWidth = ref(0)
const columnResizeStartGuideLeft = ref(0)
const columnResizeGuideLeft = ref<number>()
const headerTitleWidthCache = new Map<string, number>()
let columnDragMouseupCleanup: (() => void) | undefined
let columnResizeCleanup: (() => void) | undefined
let tableHeaderDelegationCleanup: (() => void) | undefined

const slotNames = computed(() =>
  Object.keys(slots).filter((slotName) => !['default', 'footer', 'hideableHeader'].includes(slotName))
)

const configurableKeySet = computed(() => new Set(props.defaultVisibleKeys))
const pinnedColumnKeySet = computed(() => new Set(props.pinnedColumnKeys))
const columnByKey = computed(() => new Map(
  props.columns
    .map((column) => [getColumnKey(column), column] as const)
    .filter((entry): entry is readonly [string, ConfigurableTableColumn] => Boolean(entry[0]))
))

const columnSettingsOptions = computed(() =>
  createTableColumnSettingsOptions(props.columns, props.defaultVisibleKeys)
)

const orderedVisibleColumnKeys = computed(() =>
  columnOrder.value.filter((columnKey) => visibleColumnKeys.value.includes(columnKey))
)

const measureHeaderTitleWidth = (title: string) => {
  const cachedWidth = headerTitleWidthCache.get(title)
  if (cachedWidth !== undefined) return cachedWidth

  let width = Math.ceil(title.length * 14)
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (context) {
      context.font = '600 14px -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'
      width = Math.ceil(context.measureText(title).width)
    }
  }

  headerTitleWidthCache.set(title, width)
  return width
}

const getColumnKey = (column?: ConfigurableTableColumn | TableColumnData) =>
  getConfigurableTableColumnKey(column, configurableKeySet.value)

const getColumnMinWidth = (column: ConfigurableTableColumn) => {
  const titleWidth = typeof column.title === 'string' ? measureHeaderTitleWidth(column.title) : 0
  return Math.max(column.minWidth ?? 0, getHeaderMinimumWidth(titleWidth, Boolean(column.sortable)))
}

const getResolvedColumnWidth = (columnKey: string, fallbackWidth: number, minWidth: number) =>
  resolveColumnWidth(columnWidthOverrides.value[columnKey], fallbackWidth, minWidth)

const isReorderableColumn = (column?: ConfigurableTableColumn | TableColumnData) =>
  isConfigurableTableColumnReorderable(getColumnKey(column), pinnedColumnKeySet.value)

const addInteractiveColumnState = (column: ConfigurableTableColumn): ConfigurableTableColumn => {
  const columnKey = getColumnKey(column)
  if (!columnKey) return column

  const minWidth = getColumnMinWidth(column)
  const fallbackWidth = Math.max(column.width ?? minWidth, minWidth)
  const width = getResolvedColumnWidth(columnKey, fallbackWidth, minWidth)

  return {
    ...column,
    minWidth,
    width,
    titleSlotName: 'hideableHeader',
    headerCellClass: {
      [`configurable-table-column-${columnKey}`]: true,
      'configurable-table-column-hovered': hoveredColumnKey.value === columnKey,
      'configurable-table-drop-target': dragOverColumnKey.value === columnKey,
      'configurable-table-dragging': draggingColumnKey.value === columnKey,
    },
    bodyCellClass: {
      'configurable-table-column-hovered': hoveredColumnKey.value === columnKey,
    },
  }
}

const resolvedColumns = computed<TableColumnData[]>(() => {
  const utilityColumns = props.columns.filter((column) => !getColumnKey(column) && column.slotName !== props.operationSlotName)
  const operationColumns = props.columns.filter((column) => column.slotName === props.operationSlotName)
  const hasOperationColumn = operationColumns.length > 0
  const visibleDataColumns = columnOrder.value
    .filter((columnKey) => visibleColumnKeys.value.includes(columnKey))
    .map((columnKey) => columnByKey.value.get(columnKey))
    .filter((column): column is ConfigurableTableColumn => Boolean(column))
  const dataColumns = visibleDataColumns
    .map((column, index) => ({
      ...column,
      fixed: getConfigurableTableColumnFixedSide(index, visibleDataColumns.length, {
        freezeFirstColumn: freezeFirstColumn.value,
        freezeLastColumn: freezeLastColumn.value,
        hasOperationColumn,
      }),
    }))
    .map(addInteractiveColumnState)

  return [
    ...utilityColumns,
    ...dataColumns,
    ...operationColumns.map((column) => ({
      ...column,
      fixed: freezeLastColumn.value ? 'right' as const : undefined,
    })),
  ]
})

const tableScrollX = computed(() =>
  resolvedColumns.value.reduce((total, column) => total + (column.width ?? column.minWidth ?? 80), 0)
)

const attrScroll = computed(() => {
  const scroll = attrs.scroll
  return typeof scroll === 'object' && scroll !== null && !Array.isArray(scroll)
    ? scroll as ScrollConfig
    : {}
})

const resolvedScroll = computed(() => ({
  ...attrScroll.value,
  x: attrScroll.value.x ?? tableScrollX.value,
}))

const applyColumnSettings = (settings: ColumnSettingsPayload) => {
  const nextVisibleKeys = settings.visibleKeys.filter((key) => configurableKeySet.value.has(key))
  visibleColumnKeys.value = nextVisibleKeys
  columnOrder.value = mergeConfirmedColumnOrder(nextVisibleKeys, props.defaultVisibleKeys)
  tableAutoWrap.value = settings.autoWrap
  freezeFirstRow.value = settings.freezeFirstRow
  freezeFirstColumn.value = settings.freezeFirstColumn
  freezeLastColumn.value = settings.freezeLastColumn
}

const setGlobalTableTextSelectionGuard = (enabled: boolean) => {
  if (typeof document === 'undefined') return

  setTableTextSelectionGuard(document.body?.classList, enabled)
}

const getColumnResizeGuideMaxLeft = () => tableBodyRef.value?.clientWidth ?? tableWrapperRef.value?.clientWidth

const updateColumnResizeGuide = (viewportX: number) => {
  const guideContainer = tableBodyRef.value ?? tableWrapperRef.value
  if (!guideContainer) return

  columnResizeGuideLeft.value = getColumnResizeGuideLeft(
    viewportX,
    guideContainer.getBoundingClientRect().left,
    { minLeft: 0, maxLeft: getColumnResizeGuideMaxLeft() },
  )
}

const updateColumnResizeGuideFromHeaderCell = (headerCell: Element | null) => {
  if (!headerCell) {
    columnResizeGuideLeft.value = undefined
    return
  }

  updateColumnResizeGuide(headerCell.getBoundingClientRect().right)
}

const clearColumnResizeGuide = () => {
  columnResizeGuideLeft.value = undefined
}

const clearColumnDragState = () => {
  pendingDragColumnKey.value = undefined
  draggingColumnKey.value = undefined
  dragOverColumnKey.value = undefined
  clearColumnResizeGuide()
  setGlobalTableTextSelectionGuard(false)
  if (columnDragMouseupCleanup) {
    columnDragMouseupCleanup()
    columnDragMouseupCleanup = undefined
  }
}

const clearColumnResizeState = () => {
  resizingColumnKey.value = undefined
  clearColumnResizeGuide()
  setGlobalTableTextSelectionGuard(false)
  if (columnResizeCleanup) {
    columnResizeCleanup()
    columnResizeCleanup = undefined
  }
}

const reorderVisibleColumn = (sourceColumnKey: string, targetColumnKey: string) => {
  columnOrder.value = reorderColumnKeys(columnOrder.value, sourceColumnKey, targetColumnKey)
}

const startColumnDrag = (event: MouseEvent, columnKey?: string) => {
  if (event.button !== 0 || !isConfigurableTableColumnReorderable(columnKey, pinnedColumnKeySet.value)) return

  event.preventDefault()
  setGlobalTableTextSelectionGuard(true)
  pendingDragColumnKey.value = columnKey
  columnDragStartX.value = event.clientX
  if (!columnDragMouseupCleanup) {
    const handleMouseup = () => clearColumnDragState()
    window.addEventListener('mouseup', handleMouseup, { once: true })
    columnDragMouseupCleanup = () => window.removeEventListener('mouseup', handleMouseup)
  }
}

const moveColumnDrag = (event: MouseEvent, targetColumnKey?: string) => {
  const sourceColumnKey = pendingDragColumnKey.value ?? draggingColumnKey.value
  if (
    resizingColumnKey.value
    || !sourceColumnKey
    || !targetColumnKey
    || sourceColumnKey === targetColumnKey
    || !isConfigurableTableColumnReorderable(sourceColumnKey, pinnedColumnKeySet.value)
    || !isConfigurableTableColumnReorderable(targetColumnKey, pinnedColumnKeySet.value)
    || Math.abs(event.clientX - columnDragStartX.value) < 8
  ) return

  draggingColumnKey.value = sourceColumnKey
  dragOverColumnKey.value = targetColumnKey
  reorderVisibleColumn(sourceColumnKey, targetColumnKey)
}

const handleColumnResizeMove = (event: MouseEvent) => {
  const columnKey = resizingColumnKey.value
  if (!columnKey) return

  const deltaX = event.clientX - columnResizeStartX.value
  const nextWidth = Math.max(columnResizeMinWidth.value, Math.round(columnResizeStartWidth.value + deltaX))
  columnResizeGuideLeft.value = getColumnResizeGuideLeftFromWidth(
    columnResizeStartGuideLeft.value,
    columnResizeStartWidth.value,
    nextWidth,
    { minLeft: 0, maxLeft: getColumnResizeGuideMaxLeft() },
  )
  columnWidthOverrides.value = {
    ...columnWidthOverrides.value,
    [columnKey]: nextWidth,
  }
}

const startColumnResize = (columnKey: string | undefined, event: MouseEvent) => {
  if (event.button !== 0 || !columnKey) return

  const column = columnByKey.value.get(columnKey)
  if (!column) return

  event.preventDefault()
  event.stopPropagation()
  clearColumnDragState()
  setGlobalTableTextSelectionGuard(true)
  hoveredColumnKey.value = undefined

  const minWidth = getColumnMinWidth(column)
  const fallbackWidth = Math.max(column.width ?? minWidth, minWidth)
  const startWidth = getResolvedColumnWidth(columnKey, fallbackWidth, minWidth)

  updateColumnResizeGuide(event.clientX)
  resizingColumnKey.value = columnKey
  columnResizeStartX.value = event.clientX
  columnResizeStartWidth.value = startWidth
  columnResizeMinWidth.value = minWidth
  columnResizeStartGuideLeft.value = columnResizeGuideLeft.value ?? 0

  const stopResize = () => clearColumnResizeState()
  window.addEventListener('mousemove', handleColumnResizeMove)
  window.addEventListener('mouseup', stopResize, { once: true })
  window.addEventListener('contextmenu', stopResize, { once: true })
  columnResizeCleanup = () => {
    window.removeEventListener('mousemove', handleColumnResizeMove)
    window.removeEventListener('mouseup', stopResize)
    window.removeEventListener('contextmenu', stopResize)
  }
}

const getColumnKeyFromHeaderCell = (headerCell: Element | null) => {
  const columnClass = Array.from(headerCell?.classList ?? [])
    .find((className) => className.startsWith('configurable-table-column-'))
  const columnKey = columnClass?.replace('configurable-table-column-', '')
  return columnKey && configurableKeySet.value.has(columnKey) ? columnKey : undefined
}

const getHeaderCellFromEvent = (event: MouseEvent) => {
  const target = event.target
  if (!(target instanceof Element)) return null
  return target.closest('.arco-table-th')
}

const syncHoveredColumnKey = (event: MouseEvent) => {
  if (resizingColumnKey.value) {
    hoveredColumnKey.value = undefined
    return
  }

  const target = event.target
  if (target instanceof Element && target.closest('.column-resize-handle')) {
    updateColumnResizeGuideFromHeaderCell(getHeaderCellFromEvent(event))
    hoveredColumnKey.value = undefined
    return
  }

  clearColumnResizeGuide()
  hoveredColumnKey.value = getColumnKeyFromHeaderCell(getHeaderCellFromEvent(event))
}

const handleDelegatedHeaderMouseDown = (event: MouseEvent) => {
  const target = event.target
  if (target instanceof Element && target.closest('.column-resize-handle')) return

  const columnKey = getColumnKeyFromHeaderCell(getHeaderCellFromEvent(event))
  if (!columnKey) return

  startColumnDrag(event, columnKey)
}

const handleDelegatedHeaderMouseMove = (event: MouseEvent) => {
  syncHoveredColumnKey(event)
  moveColumnDrag(event, getColumnKeyFromHeaderCell(getHeaderCellFromEvent(event)))
}

const handleDelegatedHeaderMouseOut = (event: MouseEvent) => {
  const columnKey = getColumnKeyFromHeaderCell(getHeaderCellFromEvent(event))
  if (dragOverColumnKey.value === columnKey) dragOverColumnKey.value = undefined

  const relatedTarget = event.relatedTarget
  if (!(relatedTarget instanceof Element) || !relatedTarget.closest('.arco-table-th')) {
    hoveredColumnKey.value = undefined
    if (!resizingColumnKey.value) clearColumnResizeGuide()
  }
}

onMounted(() => {
  const tableWrapper = tableWrapperRef.value
  if (!tableWrapper) return

  tableWrapper.addEventListener('mousedown', handleDelegatedHeaderMouseDown, true)
  tableWrapper.addEventListener('mousemove', handleDelegatedHeaderMouseMove, true)
  tableWrapper.addEventListener('mouseout', handleDelegatedHeaderMouseOut, true)
  tableHeaderDelegationCleanup = () => {
    tableWrapper.removeEventListener('mousedown', handleDelegatedHeaderMouseDown, true)
    tableWrapper.removeEventListener('mousemove', handleDelegatedHeaderMouseMove, true)
    tableWrapper.removeEventListener('mouseout', handleDelegatedHeaderMouseOut, true)
  }
})

onBeforeUnmount(() => {
  clearColumnDragState()
  clearColumnResizeState()
  hoveredColumnKey.value = undefined
  tableHeaderDelegationCleanup?.()
})
</script>

<template>
  <section ref="tableWrapperRef" :class="['configurable-data-table-shell', wrapperClass]">
    <div ref="tableBodyRef" class="configurable-data-table-body">
      <a-table
        v-bind="attrs"
        :columns="resolvedColumns"
        :scroll="resolvedScroll"
        :sticky-header="freezeFirstRow"
        :class="['configurable-data-table', { 'is-auto-wrap': tableAutoWrap }, tableClass]"
      >
        <template #hideableHeader="{ column }">
          <span
            class="hideable-table-header"
            :class="{
              'is-draggable': isReorderableColumn(column),
              'is-dragging': draggingColumnKey === getColumnKey(column) || pendingDragColumnKey === getColumnKey(column),
              'is-resizing': resizingColumnKey === getColumnKey(column),
            }"
          >
            <span class="hideable-table-header-title">{{ column.title }}</span>
            <span
              class="column-resize-handle"
              aria-hidden="true"
              @mousedown="startColumnResize(getColumnKey(column), $event)"
            />
          </span>
        </template>

        <template
          v-for="slotName in slotNames"
          :key="slotName"
          #[slotName]="slotProps"
        >
          <slot :name="slotName" v-bind="slotProps ?? {}" />
        </template>
      </a-table>

      <span
        v-if="columnResizeGuideLeft !== undefined"
        class="column-resize-guide"
        :style="{ left: `${columnResizeGuideLeft}px` }"
        aria-hidden="true"
      />
    </div>

    <div v-if="$slots.footer" class="configurable-data-table-footer">
      <slot name="footer" />
    </div>

    <ColumnSettingsModal
      v-model:visible="settingsModalVisible"
      :columns="columnSettingsOptions"
      :visible-keys="orderedVisibleColumnKeys"
      :default-visible-keys="defaultVisibleKeys"
      :required-keys="requiredKeys"
      :auto-wrap="tableAutoWrap"
      :freeze-first-row="freezeFirstRow"
      :freeze-first-column="freezeFirstColumn"
      :freeze-last-column="freezeLastColumn"
      @confirm="applyColumnSettings"
    />
  </section>
</template>

<style scoped>
.configurable-data-table-shell {
  overflow: hidden;
  border: 1px solid var(--workspace-color-border, var(--color-border-2));
  border-radius: 8px;
  background: var(--workspace-color-bg, var(--color-bg-2));
  box-shadow: none;
}

.configurable-data-table-body {
  position: relative;
  overflow: hidden;
}

.column-resize-guide {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 120;
  width: 2px;
  background: var(--workspace-color-primary, rgb(var(--primary-6)));
  pointer-events: none;
  transform: translateX(-50%);
}

:global(body.configurable-table-is-interacting),
:global(body.configurable-table-is-interacting *) {
  -webkit-user-select: none !important;
  user-select: none !important;
}

.configurable-data-table :deep(.arco-table-th) {
  background: var(--workspace-color-fill, var(--color-fill-1));
  color: var(--workspace-color-text-secondary, var(--color-text-2));
  font-weight: 600;
}

.configurable-data-table :deep(.arco-table-th .arco-table-cell),
.configurable-data-table :deep(.arco-table-th .arco-table-cell-with-sorter),
.configurable-data-table :deep(.arco-table-th .arco-table-th-title) {
  width: 100%;
  min-width: 0;
}

.hideable-table-header {
  display: flex;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  align-items: center;
  gap: 4px;
  vertical-align: middle;
}

.hideable-table-header.is-draggable {
  cursor: grab;
}

.hideable-table-header.is-dragging {
  cursor: grabbing;
  opacity: 0.58;
}

.hideable-table-header.is-resizing {
  cursor: col-resize;
}

.hideable-table-header-title {
  min-width: 30px;
  overflow: hidden;
  flex: 1 1 auto;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.column-resize-handle {
  position: absolute;
  top: 0;
  right: -7px;
  z-index: 20;
  width: 14px;
  height: 100%;
  cursor: col-resize;
}

.configurable-data-table :deep(.arco-table-container) {
  overflow: hidden;
  border: 0;
  border-radius: 0;
}

.configurable-data-table :deep(.arco-table-border .arco-table-container::before),
.configurable-data-table :deep(.arco-table-border .arco-table-container::after),
.configurable-data-table :deep(.arco-table-border .arco-table-container .arco-table),
.configurable-data-table :deep(.arco-table-border .arco-table-tr::after),
.configurable-data-table :deep(.arco-table-border .arco-table-th),
.configurable-data-table :deep(.arco-table-border .arco-table-td) {
  border-color: #e9edf3;
}

.configurable-data-table :deep(.arco-table-border .arco-table-container::before),
.configurable-data-table :deep(.arco-table-border .arco-table-container::after) {
  display: none;
}

.configurable-data-table :deep(.arco-table-td) {
  background: var(--workspace-color-bg, var(--color-bg-2));
}

.configurable-data-table :deep(.arco-table-th.configurable-table-drop-target) {
  background: var(--workspace-color-hover-bg, var(--color-fill-2));
}

.configurable-data-table :deep(.configurable-table-column-hovered.arco-table-th),
.configurable-data-table :deep(.configurable-table-column-hovered.arco-table-td) {
  background: var(--workspace-color-hover-bg, var(--color-fill-2));
}

.configurable-data-table:not(.is-auto-wrap) :deep(.arco-table-td) {
  white-space: nowrap;
}

.configurable-data-table-footer {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #e9edf3;
  padding: 16px 18px 18px;
}
</style>
