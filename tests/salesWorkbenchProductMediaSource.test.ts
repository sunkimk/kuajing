import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const orderSource = readFileSync(
  new URL('../src/components/sales/SalesOrderWorkbench.vue', import.meta.url),
  'utf-8',
)

const secondarySource = readFileSync(
  new URL('../src/components/sales/SalesSecondaryWorkbench.vue', import.meta.url),
  'utf-8',
)

const returnSource = readFileSync(
  new URL('../src/components/sales/SalesReturnWorkbench.vue', import.meta.url),
  'utf-8',
)

describe('sales workbench product media source', () => {
  it('renders product images instead of letter thumbnails in every sales workbench table', () => {
    for (const source of [orderSource, secondarySource, returnSource]) {
      expect(source).toContain('<img')
      expect(source).not.toContain('sales-product-thumb')
      expect(source).not.toContain('record.sku.slice(0, 2)')
    }
  })
})
