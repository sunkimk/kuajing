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

describe('sales navigation source', () => {
  it('adds all three sales management entries to the menu', () => {
    expect(navigationSource).toContain("{ key: 'sales-orders', title: '销售订单', path: '/sales/orders'")
    expect(navigationSource).toContain("{ key: 'upsell', title: '二次销售', path: '/sales/upsell'")
    expect(navigationSource).toContain("{ key: 'sales-return', title: '退货管理', path: '/sales/return'")
  })

  it('routes sales pages to real views instead of placeholder pages', () => {
    expect(routerSource).toContain("import SalesOrderView from '../views/SalesOrderView.vue'")
    expect(routerSource).toContain("import SalesSecondaryView from '../views/SalesSecondaryView.vue'")
    expect(routerSource).toContain("import SalesReturnView from '../views/SalesReturnView.vue'")
    expect(routerSource).toContain("item.path !== '/sales/orders'")
    expect(routerSource).toContain("item.path !== '/sales/upsell'")
    expect(routerSource).toContain("item.path !== '/sales/return'")
    expect(routerSource).toContain("path: 'sales/orders'")
    expect(routerSource).toContain("component: SalesOrderView")
    expect(routerSource).toContain("path: 'sales/upsell'")
    expect(routerSource).toContain("component: SalesSecondaryView")
    expect(routerSource).toContain("path: 'sales/return'")
    expect(routerSource).toContain("component: SalesReturnView")
  })
})
