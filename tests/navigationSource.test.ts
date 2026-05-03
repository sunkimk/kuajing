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

const warehouseInventorySource = readFileSync(
  new URL('../src/views/WarehouseInventoryView.vue', import.meta.url),
  'utf-8',
)

describe('warehouse inventory navigation source', () => {
  it('uses product and warehouse inventory menu entries', () => {
    expect(navigationSource).toContain("{ key: 'inventory', title: '产品库存', path: '/warehouse/inventory'")
    expect(navigationSource).toContain("{ key: 'warehouse-inventory', title: '仓库库存', path: '/warehouse/warehouse-inventory'")
    expect(navigationSource).toContain("{ key: 'batch-inventory', title: '批次库存', path: '/warehouse/batch-inventory'")
    expect(navigationSource).not.toContain("title: '库存管理', path: '/warehouse/inventory'")
  })

  it('opens the shared inventory page on the requested tab from navigation', () => {
    expect(routerSource).toContain("title: '产品库存'")
    expect(routerSource).toContain("inventoryTab: 'product'")
    expect(routerSource).toContain("path: 'warehouse/warehouse-inventory'")
    expect(routerSource).toContain("title: '仓库库存'")
    expect(routerSource).toContain("inventoryTab: 'warehouse'")
    expect(routerSource).toContain("item.path !== '/warehouse/warehouse-inventory'")
    expect(warehouseInventorySource).toContain('const route = useRoute()')
    expect(warehouseInventorySource).toContain('const router = useRouter()')
    expect(warehouseInventorySource).toContain('const activeTab = computed<InventoryTab>(getRouteInventoryTab)')
    expect(warehouseInventorySource).toContain('const inventoryTabs')
    expect(warehouseInventorySource).toContain('v-for="tab in inventoryTabs"')
    expect(warehouseInventorySource).toContain('@click="switchInventoryTab(tab)"')
    expect(warehouseInventorySource).not.toContain('activeTab = tab.key')
  })
})
