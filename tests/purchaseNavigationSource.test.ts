import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const navigationSource = readFileSync(
  new URL('../src/data/navigation.ts', import.meta.url),
  'utf-8',
)

const routerSource = readFileSync(
  new URL('../src/router/index.ts', import.meta.url),
  'utf-8',
)

describe('purchase navigation source', () => {
  it('adds all purchase management prototype entries to the menu', () => {
    expect(navigationSource).toContain("{ key: 'purchase-orders', title: '采购订单', path: '/purchase/orders'")
    expect(navigationSource).toContain("{ key: 'purchase-delivery-orders', title: '交货单', path: '/purchase/delivery-orders'")
    expect(navigationSource).toContain("{ key: 'purchase-return-orders', title: '采购退货单', path: '/purchase/return-orders'")
    expect(navigationSource).toContain("{ key: 'purchase-change-logs', title: '采购变更日志', path: '/purchase/change-logs'")
  })

  it('routes purchase pages to real views instead of placeholder pages', () => {
    expect(routerSource).toContain("import PurchaseOrderView from '../views/PurchaseOrderView.vue'")
    expect(routerSource).toContain("import PurchaseDeliveryView from '../views/PurchaseDeliveryView.vue'")
    expect(routerSource).toContain("import PurchaseReturnView from '../views/PurchaseReturnView.vue'")
    expect(routerSource).toContain("import PurchaseChangeLogView from '../views/PurchaseChangeLogView.vue'")
    expect(routerSource).toContain("item.path !== '/purchase/orders'")
    expect(routerSource).toContain("item.path !== '/purchase/delivery-orders'")
    expect(routerSource).toContain("item.path !== '/purchase/return-orders'")
    expect(routerSource).toContain("item.path !== '/purchase/change-logs'")
    expect(routerSource).toContain("path: 'purchase/orders'")
    expect(routerSource).toContain("component: PurchaseOrderView")
    expect(routerSource).toContain("path: 'purchase/delivery-orders'")
    expect(routerSource).toContain("component: PurchaseDeliveryView")
    expect(routerSource).toContain("path: 'purchase/return-orders'")
    expect(routerSource).toContain("component: PurchaseReturnView")
    expect(routerSource).toContain("path: 'purchase/change-logs'")
    expect(routerSource).toContain("component: PurchaseChangeLogView")
  })
})
