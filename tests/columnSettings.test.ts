import { describe, expect, it } from 'vitest'
import {
  filterColumnSettingsOptions,
  getColumnSettingsCounts,
  moveColumnSettingsKey,
  toggleColumnSettingsKey,
  type ColumnSettingsOption,
} from '../src/data/columnSettings'

const options: ColumnSettingsOption<'warehouse' | 'product' | 'sku' | 'status'>[] = [
  { key: 'warehouse', title: '仓库' },
  { key: 'product', title: '商品名称' },
  { key: 'sku', title: 'SKU' },
  { key: 'status', title: '状态' },
]

describe('column settings helpers', () => {
  it('separates selected and unselected columns with keyword search', () => {
    expect(filterColumnSettingsOptions(options, ['warehouse', 'sku'], 'selected', '')).toEqual([
      options[0],
      options[2],
    ])
    expect(filterColumnSettingsOptions(options, ['warehouse', 'sku'], 'unselected', '商品')).toEqual([
      options[1],
    ])
  })

  it('keeps required columns selected while toggling optional columns', () => {
    expect(toggleColumnSettingsKey(['warehouse', 'sku'], 'warehouse', false, ['warehouse'])).toEqual([
      'warehouse',
      'sku',
    ])
    expect(toggleColumnSettingsKey(['warehouse', 'sku'], 'status', true, ['warehouse'])).toEqual([
      'warehouse',
      'sku',
      'status',
    ])
    expect(toggleColumnSettingsKey(['warehouse', 'sku'], 'sku', false, ['warehouse'])).toEqual([
      'warehouse',
    ])
  })

  it('moves a selected column before the drop target', () => {
    expect(moveColumnSettingsKey(['warehouse', 'product', 'sku'], 'sku', 'product')).toEqual([
      'warehouse',
      'sku',
      'product',
    ])
  })

  it('reports selected and hidden counts', () => {
    expect(getColumnSettingsCounts(options, ['warehouse', 'sku'])).toEqual({
      selectedCount: 2,
      hiddenCount: 2,
    })
  })
})
