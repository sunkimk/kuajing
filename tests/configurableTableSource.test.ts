import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const componentSource = readFileSync(
  new URL('../src/components/common/ConfigurableDataTable.vue', import.meta.url),
  'utf-8',
)

describe('ConfigurableDataTable source', () => {
  it('starts column resizing from the header cell boundary instead of the mouse position', () => {
    expect(componentSource).toContain('updateColumnResizeGuideFromHeaderCell(getHeaderCellFromEvent(event))')
    expect(componentSource).not.toContain('updateColumnResizeGuide(event.clientX)')
  })

  it('keeps transient hover and drag visuals out of resolved column definitions so sort state can persist', () => {
    const interactiveColumnStateSource = componentSource.match(
      /const addInteractiveColumnState =[\s\S]*?const resolvedColumns = computed<TableColumnData/ ,
    )?.[0] ?? ''

    expect(interactiveColumnStateSource).not.toContain('hoveredColumnKey.value === columnKey')
    expect(interactiveColumnStateSource).not.toContain('dragOverColumnKey.value === columnKey')
    expect(interactiveColumnStateSource).not.toContain('draggingColumnKey.value === columnKey')
  })

  it('bases resize drag math on the rendered header width so the guide stays aligned in stretched tables', () => {
    const resizeStartSource = componentSource.match(
      /const startColumnResize =[\s\S]*?const getColumnKeyFromHeaderCell =/ ,
    )?.[0] ?? ''

    expect(resizeStartSource).toContain('const headerCell = getHeaderCellFromEvent(event)')
    expect(resizeStartSource).toContain('headerCell?.getBoundingClientRect().width')
  })

  it('previews column resizing with the guide and applies the new width only after mouseup', () => {
    const resizeMoveSource = componentSource.match(
      /const handleColumnResizeMove =[\s\S]*?const finishColumnResize =/ ,
    )?.[0] ?? ''
    const resizeFinishSource = componentSource.match(
      /const finishColumnResize =[\s\S]*?const startColumnResize =/ ,
    )?.[0] ?? ''

    expect(componentSource).toContain('const columnResizeNextWidth = ref<number>()')
    expect(resizeMoveSource).toContain('columnResizeNextWidth.value = nextWidth')
    expect(resizeMoveSource).not.toContain('columnWidthOverrides.value = {')
    expect(resizeFinishSource).toContain('columnWidthOverrides.value = {')
    expect(resizeFinishSource).toContain('[columnKey]: nextWidth')
    expect(componentSource).toContain("window.addEventListener('mouseup', finishColumnResize, { once: true })")
  })

  it('does not start column reordering from the resize edge guard area', () => {
    const mouseDownSource = componentSource.match(
      /const handleDelegatedHeaderMouseDown =[\s\S]*?const handleDelegatedHeaderMouseMove =/ ,
    )?.[0] ?? ''

    expect(componentSource).toContain('const COLUMN_RESIZE_EDGE_GUARD_WIDTH = 12')
    expect(componentSource).toContain('const isNearHeaderRightEdge =')
    expect(mouseDownSource).toContain('isNearHeaderRightEdge(headerCell, event)')
    expect(mouseDownSource).toContain('return')
  })

  it('does not freeze the last column by default unless a table opts into it', () => {
    expect(componentSource).toContain('defaultFreezeLastColumn?: boolean')
    expect(componentSource).toContain('defaultFreezeLastColumn: false')
    expect(componentSource).toContain('const freezeLastColumn = ref(props.defaultFreezeLastColumn)')
    expect(componentSource).toContain(':default-freeze-last-column="defaultFreezeLastColumn"')
    expect(componentSource).not.toContain('const freezeLastColumn = ref(true)')
  })
})
