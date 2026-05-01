import { describe, expect, it } from 'vitest'
import {
  createTableColumnSettingsOptions,
  getConfigurableTableColumnKey,
  isConfigurableTableColumnReorderable,
  mergeConfirmedColumnOrder,
  type ConfigurableTableColumn,
} from '../src/data/configurableTable'

type TestColumnKey = 'warehouse' | 'product' | 'stock'

const columns: ConfigurableTableColumn<TestColumnKey>[] = [
  { title: '仓库', settingsKey: 'warehouse', slotName: 'warehouse' },
  { title: '商品', settingsKey: 'product', slotName: 'product' },
  { title: '库存', dataIndex: 'stock' },
  { title: '操作', slotName: 'operation' },
]

describe('configurable table helpers', () => {
  it('resolves a configurable key from settingsKey before dataIndex', () => {
    expect(getConfigurableTableColumnKey(columns[0], new Set<TestColumnKey>(['warehouse']))).toBe('warehouse')
    expect(getConfigurableTableColumnKey(columns[2], new Set<TestColumnKey>(['stock']))).toBe('stock')
    expect(getConfigurableTableColumnKey(columns[3], new Set<TestColumnKey>(['stock']))).toBeUndefined()
  })

  it('creates column settings options in default visible order', () => {
    expect(createTableColumnSettingsOptions(columns, ['stock', 'warehouse'])).toEqual([
      { key: 'stock', title: '库存' },
      { key: 'warehouse', title: '仓库' },
    ])
  })

  it('keeps confirmed visible keys first and appends hidden default keys', () => {
    expect(mergeConfirmedColumnOrder(['stock', 'warehouse'], ['warehouse', 'product', 'stock'])).toEqual([
      'stock',
      'warehouse',
      'product',
    ])
  })

  it('does not allow pinned columns to be reordered', () => {
    expect(isConfigurableTableColumnReorderable('warehouse', new Set(['warehouse']))).toBe(false)
    expect(isConfigurableTableColumnReorderable('product', new Set(['warehouse']))).toBe(true)
  })
})
