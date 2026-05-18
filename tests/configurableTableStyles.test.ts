import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const componentSource = readFileSync(
  new URL('../src/components/common/ConfigurableDataTable.vue', import.meta.url),
  'utf-8',
)

describe('ConfigurableDataTable styles', () => {
  it('keeps a separator between table content and pagination footer', () => {
    expect(componentSource).toMatch(/\.configurable-data-table-footer\s*\{[^}]*border-top:/s)
  })

  it('prevents text selection while table headers are being dragged or resized', () => {
    expect(componentSource).toContain(':global(body.configurable-table-is-interacting)')
    expect(componentSource).toMatch(/user-select:\s*none\s*!important/)
  })

  it('renders the column resize guide from the table body so it spans all rows', () => {
    expect(componentSource).toContain('class="column-resize-guide"')
    expect(componentSource).toMatch(/\.column-resize-guide\s*\{[^}]*position:\s*absolute;[^}]*top:\s*0;[^}]*bottom:\s*0;/s)
    expect(componentSource).not.toContain('height: 9999px')
  })

  it('keeps the column resize guide above Arco sticky table headers', () => {
    const guideStyle = componentSource.match(/\.column-resize-guide\s*\{(?<style>[^}]*)\}/s)?.groups?.style ?? ''
    const zIndex = Number(guideStyle.match(/z-index:\s*(?<value>\d+)/)?.groups?.value)

    expect(zIndex).toBeGreaterThan(100)
  })

  it('anchors the resize handle to the header content so drag hit areas stay on the correct column', () => {
    expect(componentSource).toMatch(/\.configurable-data-table\s*:deep\(\.arco-table-th \.arco-table-cell\),[\s\S]*?position:\s*relative;/s)
    expect(componentSource).toMatch(/\.column-resize-handle\s*\{[^}]*position:\s*absolute;[^}]*right:\s*-3px;/s)
  })

  it('keeps the resize handle narrow and shows the guide only while resizing', () => {
    const handleStyle = componentSource.match(/\.column-resize-handle\s*\{(?<style>[^}]*)\}/s)?.groups?.style ?? ''

    expect(handleStyle).toContain('width: 6px')
    expect(componentSource).toContain("v-if=\"(resizingColumnKey || hoveredResizeColumnKey) && columnResizeGuideLeft !== undefined\"")
  })

  it('defines a shared media cell field style for image, title and description columns', () => {
    for (const className of [
      '.configurable-table-media-cell',
      '.configurable-table-media-frame',
      '.configurable-table-media-image',
      '.configurable-table-media-copy',
      '.configurable-table-media-title',
      '.configurable-table-media-description',
    ]) {
      expect(componentSource).toContain(className)
    }

    expect(componentSource).toMatch(/\.configurable-data-table :deep\(\.configurable-table-media-cell\)\s*\{[^}]*gap:\s*12px;/s)
    expect(componentSource).toMatch(/\.configurable-data-table :deep\(\.configurable-table-media-frame\)\s*\{[^}]*width:\s*42px;[^}]*height:\s*42px;[^}]*border-radius:\s*8px;/s)
    expect(componentSource).toMatch(/\.configurable-data-table :deep\(\.configurable-table-media-title\)\s*\{[^}]*font-size:\s*14px;[^}]*line-height:\s*24px;/s)
    expect(componentSource).toMatch(/\.configurable-data-table :deep\(\.configurable-table-media-description\)\s*\{[^}]*font-size:\s*12px;[^}]*line-height:\s*18px;/s)
  })

  it('keeps hover background continuous across fixed table columns', () => {
    expect(componentSource).toMatch(/\.configurable-data-table :deep\(\.arco-table-tr:hover \.arco-table-td\),[\s\S]*?\.configurable-data-table :deep\(\.arco-table-tr-hover \.arco-table-td\)\s*\{[^}]*background:\s*var\(--workspace-color-hover-bg, var\(--color-fill-2\)\);/s)
    expect(componentSource).toMatch(/\.configurable-data-table :deep\(\.arco-table-tr:hover \.arco-table-td\.arco-table-col-fixed-left::before\),[\s\S]*?\.configurable-data-table :deep\(\.arco-table-tr-hover \.arco-table-td\.arco-table-col-fixed-right::before\)\s*\{[^}]*background-color:\s*var\(--workspace-color-hover-bg, var\(--color-fill-2\)\);/s)
    expect(componentSource).not.toMatch(/\.configurable-data-table :deep\(\.arco-table-tr:hover \.arco-table-td\.arco-table-col-fixed-left-last::after\),[\s\S]*?background-color:\s*var\(--workspace-color-hover-bg, var\(--color-fill-2\)\);/s)
    expect(componentSource).not.toMatch(/\.configurable-data-table :deep\(\.arco-table-tr:hover \.arco-table-td\.arco-table-col-fixed-right-first::after\),[\s\S]*?background-color:\s*var\(--workspace-color-hover-bg, var\(--color-fill-2\)\);/s)
    expect(componentSource).not.toContain('.arco-table-td-fixed-left')
    expect(componentSource).not.toContain('.arco-table-td-fixed-right')
  })
})
