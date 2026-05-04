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
})
