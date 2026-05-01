<script setup lang="ts">
import { computed, ref, useAttrs, useSlots } from 'vue'
import type { HTMLAttributes } from 'vue'
import type { TableColumnData, TableData } from '@arco-design/web-vue'

defineOptions({
  inheritAttrs: false,
})

type TableClassValue = HTMLAttributes['class']
type ColumnClassValue = TableColumnData['cellClass']
type BodyColumnClassValue = TableColumnData['bodyCellClass']
type NormalizedClassToken = string | Record<string, boolean>

const props = withDefaults(defineProps<{
  columns: TableColumnData[]
  highlightColumnOnHeaderHover?: boolean
  tableClass?: TableClassValue
  wrapperClass?: TableClassValue
}>(), {
  highlightColumnOnHeaderHover: false,
  tableClass: undefined,
  wrapperClass: undefined,
})

const attrs = useAttrs()
const slots = useSlots()
const wrapperRef = ref<HTMLElement>()
const hoveredColumnKey = ref<string>()

const slotNames = computed(() => Object.keys(slots).filter((slotName) => slotName !== 'default'))

const isNormalizedClassToken = (classValue: unknown): classValue is NormalizedClassToken =>
  typeof classValue === 'string' || (typeof classValue === 'object' && classValue !== null)

const mergeClassValues = (...classValues: Array<unknown>): NormalizedClassToken[] =>
  classValues.filter(isNormalizedClassToken)

const mergeBodyClassValue = (
  originalValue: BodyColumnClassValue | undefined,
  extraValue: ColumnClassValue,
): BodyColumnClassValue => {
  if (typeof originalValue === 'function') {
    return (record: TableData) => mergeClassValues(originalValue(record), extraValue)
  }

  return mergeClassValues(originalValue, extraValue) as ColumnClassValue
}

const getColumnKey = (column: TableColumnData) =>
  typeof column.dataIndex === 'string' && column.dataIndex.length > 0 ? column.dataIndex : undefined

const enhanceColumns = (columns: TableColumnData[]): TableColumnData[] =>
  columns.map((column) => {
    const children = Array.isArray(column.children) ? enhanceColumns(column.children) : undefined
    const columnKey = getColumnKey(column)

    if (!props.highlightColumnOnHeaderHover || !columnKey) {
      return children ? { ...column, children } : column
    }

    const hoverClass = { 'app-data-table-column-hovered': hoveredColumnKey.value === columnKey }

    return {
      ...column,
      children,
      headerCellClass: mergeClassValues(
        column.headerCellClass,
        `app-data-table-column-${columnKey}`,
        hoverClass,
      ) as ColumnClassValue,
      bodyCellClass: mergeBodyClassValue(column.bodyCellClass, hoverClass),
    }
  })

const normalizedColumns = computed(() => enhanceColumns(props.columns))

const getColumnKeyFromHeaderTarget = (target: EventTarget | null) => {
  if (!(target instanceof Element)) return undefined

  const headerCell = target.closest('.arco-table-th')
  const className = Array.from(headerCell?.classList ?? [])
    .find((value) => value.startsWith('app-data-table-column-'))

  return className?.replace('app-data-table-column-', '')
}

const syncHoveredColumnKey = (event: MouseEvent) => {
  if (!props.highlightColumnOnHeaderHover) return
  hoveredColumnKey.value = getColumnKeyFromHeaderTarget(event.target)
}

const clearHoveredColumnKey = () => {
  hoveredColumnKey.value = undefined
}

defineExpose({
  wrapperEl: wrapperRef,
  wrapperRef,
})
</script>

<template>
  <section
    ref="wrapperRef"
    :class="['common-data-table-shell', wrapperClass]"
    @mouseleave.capture="clearHoveredColumnKey"
    @mousemove.capture="syncHoveredColumnKey"
  >
    <a-table
      v-bind="attrs"
      :columns="normalizedColumns"
      :class="tableClass"
    >
      <template
        v-for="slotName in slotNames"
        :key="slotName"
        #[slotName]="slotProps"
      >
        <slot :name="slotName" v-bind="slotProps ?? {}" />
      </template>
    </a-table>
  </section>
</template>

<style scoped>
.common-data-table-shell {
  overflow: hidden;
}

.common-data-table-shell :deep(.app-data-table-column-hovered.arco-table-th),
.common-data-table-shell :deep(.app-data-table-column-hovered.arco-table-td) {
  background: var(--app-data-table-column-hover-bg, var(--color-fill-2));
}
</style>
