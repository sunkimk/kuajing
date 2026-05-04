import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const componentSource = readFileSync(
  new URL('../src/components/sales/SalesOrderWorkbench.vue', import.meta.url),
  'utf-8',
)

describe('SalesOrderWorkbench source', () => {
  it('reserves enough width for the order and sync timestamp columns', () => {
    expect(componentSource).toContain("{ settingsKey: 'orderTime', title: '下单时间', dataIndex: 'orderTime', slotName: 'orderTime', width: 160, minWidth: 160, align: 'center' }")
    expect(componentSource).toContain("{ settingsKey: 'syncTime', title: '同步时间', dataIndex: 'syncTime', slotName: 'syncTime', width: 160, minWidth: 160, align: 'center' }")
  })
})
