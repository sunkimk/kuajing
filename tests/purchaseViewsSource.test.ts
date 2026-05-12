import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const viewFiles = {
  order: '../src/views/PurchaseOrderView.vue',
  delivery: '../src/views/PurchaseDeliveryView.vue',
  return: '../src/views/PurchaseReturnView.vue',
  changeLog: '../src/views/PurchaseChangeLogView.vue',
} as const

describe('purchase view source', () => {
  it('uses the shared purchase workbench with page-specific config keys', () => {
    for (const [pageKey, file] of Object.entries(viewFiles)) {
      const source = readFileSync(new URL(file, import.meta.url), 'utf-8')
      expect(source).toContain("import PurchaseWorkbench from '../components/purchase/PurchaseWorkbench.vue'")
      expect(source).toContain(`<PurchaseWorkbench page-key="${pageKey}" />`)
    }
  })
})
