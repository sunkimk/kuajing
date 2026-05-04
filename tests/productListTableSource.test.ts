import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const productListSource = readFileSync(
  new URL('../src/views/ProductListView.vue', import.meta.url),
  'utf-8',
)

describe('ProductListView table source', () => {
  it('reuses the inventory configurable table component', () => {
    expect(productListSource).toContain("import ConfigurableDataTable from '../components/common/ConfigurableDataTable.vue'")
    expect(productListSource).toContain('type ProductListColumnKey')
    expect(productListSource).toContain('v-model:settings-visible="columnSettingsVisible"')
    expect(productListSource).toContain(':default-visible-keys="defaultVisibleColumnKeys"')
    expect(productListSource).toContain('wrapper-class="product-list-table"')
    expect(productListSource).toContain('<template #footer>')
    expect(productListSource).not.toContain('AppDataTable')
    expect(productListSource).not.toContain('common-data-table-shell')
  })

  it('keeps product table density aligned with the inventory table', () => {
    expect(productListSource).toContain("{ settingsKey: 'image', title: '图片', slotName: 'image', width: 86, minWidth: 72 }")
    expect(productListSource).toContain('width: 36px;')
    expect(productListSource).toContain('height: 36px;')
    expect(productListSource).toContain('border-radius: 10px;')
    expect(productListSource).toContain('line-height: 24px;')
    expect(productListSource).toContain("{ settingsKey: 'sku', title: 'SKU', slotName: 'sku', width: 180, minWidth: 150")
    expect(productListSource).toContain("{ settingsKey: 'name', title: '商品中文名', slotName: 'name', width: 320, minWidth: 220")
    expect(productListSource).toContain("{ settingsKey: 'mappingCount', title: '已绑定平台店铺数量', slotName: 'mappingCount', width: 220, minWidth: 160")
    expect(productListSource).toContain('table-class="product-list-data-table"')
    expect(productListSource).toContain('.product-list-table :deep(.arco-table-element)')
    expect(productListSource).toContain('min-width: 100%;')
    expect(productListSource).not.toContain('min-width: unset;')
    expect(productListSource).toContain('.product-list-table :deep(.arco-table-header)')
    expect(productListSource).toContain('background: var(--product-color-fill);')
    expect(productListSource).toContain('.product-list-table :deep(.arco-table-scroll-position-right .arco-table-col-fixed-left-last::after)')
    expect(productListSource).toContain('.product-list-table :deep(.arco-table-scroll-position-middle .arco-table-col-fixed-left-last::after)')
    expect(productListSource).toContain('box-shadow: inset 6px 0 8px -3px rgba(0, 0, 0, 0.15) !important;')
    expect(productListSource).toContain('transition: none !important;')
    expect(productListSource).not.toContain('.product-list-table :deep(.arco-table-col-fixed-left-last::after) {\n  box-shadow')
    expect(productListSource).toContain('.product-list-table :deep(.arco-table-scroll-position-left .arco-table-col-fixed-right-first::after)')
    expect(productListSource).toContain('.product-list-table :deep(.arco-table-scroll-position-middle .arco-table-col-fixed-right-first::after)')
    expect(productListSource).toContain('box-shadow: inset -6px 0 8px -3px rgba(0, 0, 0, 0.15) !important;')
    expect(productListSource).not.toContain('.product-list-table :deep(.arco-table-col-fixed-right-first::after) {\n  box-shadow')
    expect(productListSource).toContain('.table-wrapper :deep(.product-list-data-table:not(.is-auto-wrap) .name-cell strong)')
    expect(productListSource).toContain('.table-wrapper :deep(.product-list-data-table:not(.is-auto-wrap) .name-cell small)')
  })
})
