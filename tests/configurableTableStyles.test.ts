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
})
