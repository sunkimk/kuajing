import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const componentSource = readFileSync(
  new URL('../src/components/warehouse/BatchInventoryTable.vue', import.meta.url),
  'utf-8',
)

describe('BatchInventoryTable source', () => {
  it('does not render a row selection checkbox column', () => {
    expect(componentSource).not.toContain("slotName: 'selection'")
    expect(componentSource).not.toContain('<a-checkbox')
    expect(componentSource).not.toContain('selectedRowKeys')
  })

  it('leaves enough room around the fixed operation button', () => {
    expect(componentSource).toContain("{ title: '操作', slotName: 'operation', width: 96, align: 'center' }")
  })
})
