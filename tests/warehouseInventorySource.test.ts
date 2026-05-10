import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const componentSource = readFileSync(
  new URL('../src/views/WarehouseInventoryView.vue', import.meta.url),
  'utf-8',
)

describe('WarehouseInventoryView source', () => {
  it('left-aligns the product name and SKU column', () => {
    expect(componentSource).toMatch(
      /settingsKey:\s*'product'[^}]*title:\s*'产品名称\/SKU'[^}]*align:\s*'left'/s,
    )
  })

  it('keeps stacked table cell content truncated within resized columns', () => {
    const stackedCellStyle = componentSource.match(
      /\.warehouse-cell,\s*\.product-cell,\s*\.store-cell\s*\{(?<style>[^}]*)\}/s,
    )?.groups?.style ?? ''

    expect(stackedCellStyle).toMatch(/min-width:\s*0/)
    expect(stackedCellStyle).toMatch(/text-align:\s*left/)

    expect(componentSource).toMatch(
      /\.warehouse-cell strong,\s*\.warehouse-cell span,\s*\.product-cell :deep\(\.arco-link\),\s*\.product-cell span,\s*\.store-cell strong,\s*\.store-cell span\s*\{[^}]*overflow:\s*hidden;[^}]*text-overflow:\s*ellipsis;[^}]*white-space:\s*nowrap;/s,
    )
  })

  it('supports the warehouse aggregate inventory view from the warehouse menu', () => {
    expect(componentSource).toContain('type WarehouseAggregateRow')
    expect(componentSource).toContain("const pageTitle = computed(() => String(route.meta.title ?? '库存管理'))")
    expect(componentSource).toContain("product: '统一查看产品库存状态'")
    expect(componentSource).toContain("warehouse: '统一查看仓库库存状态'")
    expect(componentSource).not.toContain('const inventoryTabs')
    expect(componentSource).not.toContain('switchInventoryTab')
    expect(componentSource).not.toContain("class=\"inventory-tabs-shell\"")
    expect(componentSource).toContain('const prototypeSummaryCards')
    expect(componentSource).toContain("{ label: '在库 SKU', value: '2,947', note: '已接入5站点' }")
    expect(componentSource).toContain("{ label: '海外仓数量', value: '57', note: '俄/欧/中东仓' }")
    expect(componentSource).toContain("{ label: '下次同步', value: '11:00', note: '每30分钟刷新' }")
    expect(componentSource).toContain("{ settingsKey: 'warehouseType', title: '仓库类型'")
    expect(componentSource).toContain("{ settingsKey: 'productKinds', title: '产品种类'")
    expect(componentSource).toContain("{ settingsKey: 'purchasePlanQty', title: '计采交合计量'")
    expect(componentSource).toContain("{ settingsKey: 'transferOutboundQty', title: '调拨待出库'")
    expect(componentSource).toContain("{ settingsKey: 'transferShippingQty', title: '调拨待出运'")
    expect(componentSource).toContain("{ settingsKey: 'inTransitQty', title: '在途量'")
    expect(componentSource).toContain("{ settingsKey: 'reservedQty', title: '预占量'")
    expect(componentSource).toContain("{ settingsKey: 'availableQty', title: '可用量'")
    expect(componentSource).toContain("{ settingsKey: 'defectiveQty', title: '次品量'")
    expect(componentSource).toContain("{ settingsKey: 'goodQty', title: '良品量'")
    expect(componentSource).toContain("{ settingsKey: 'warehouseStockQty', title: '在库量'")
    expect(componentSource).toContain("{ settingsKey: 'totalStockQty', title: '总库存'")
    expect(componentSource).toContain("{ settingsKey: 'dailyAverage7d', title: '7天日均'")
    expect(componentSource).toContain("{ settingsKey: 'age0To30', title: '0~30'")
    expect(componentSource).toContain("{ settingsKey: 'age31To60', title: '31~60'")
    expect(componentSource).toContain("{ settingsKey: 'age61To90', title: '61~90'")
    expect(componentSource).toContain("{ settingsKey: 'age365Plus', title: '365+'")
    expect(componentSource).toContain("{ settingsKey: 'stagnantQty', title: '滞销量'")
    expect(componentSource).toContain("{ settingsKey: 'stagnantRate', title: '滞销率'")
    expect(componentSource).toMatch(/activeTab\.value\s*===\s*'warehouse'\s*\?\s*warehouseColumns\s*:\s*allColumns/)
    expect(componentSource).toContain('warehousePageSize')
    expect(componentSource).toContain('label="店铺/仓库"')
    expect(componentSource).toContain('label="所有人"')
    expect(componentSource).toContain('label="在库值"')
    expect(componentSource).toContain('label="条件"')
    expect(componentSource).toContain('label="数值"')
    expect(componentSource).toContain('>导出</a-button>')
    expect(componentSource).toContain('wrapper-class="inventory-table-shell"')
    expect(componentSource).toContain('table-class="inventory-table"')
    expect(componentSource).not.toContain('warehouse-aggregate-table')
    expect(componentSource).not.toContain('warehouse-aggregate-table-shell')
    expect(componentSource).not.toContain('店铺/仓库: 全部')
    expect(componentSource).not.toContain('class="warehouse-filter-pill"')
    expect(componentSource).not.toContain('class="warehouse-table-toolbar"')
    expect(componentSource).toContain('class="warehouse-cell warehouse-cell-compact"')
    expect(componentSource).toContain('v-if="activeTab !== \'warehouse\'"')
    expect(componentSource).toContain('placeholder="全部"')
    expect(componentSource).toContain('placeholder="所有人"')
    expect(componentSource).toContain('placeholder="在库值"')
    expect(componentSource).toContain('placeholder="等于"')
    expect(componentSource).toContain('placeholder="请输入"')
  })

  it('remounts the configurable table when switching between inventory tabs', () => {
    expect(componentSource).toMatch(/<ConfigurableDataTable[\s\S]*:key="activeTab"/)
  })

  it('keeps product inventory aligned with the prototype fields and pagination', () => {
    expect(componentSource).toContain('const prototypeProductTotal = 2947')
    expect(componentSource).toContain('const productPageSize = 10')
    expect(componentSource).toContain("productName: 'Механическая клавиатура PBT набор клавиш-Sage'")
    expect(componentSource).toContain("sku: '2050848210824'")
    expect(componentSource).toContain("sellerCode: '130212011793'")
    expect(componentSource).toContain("updatedAt: '2026/05/03 10:30'")
    expect(componentSource).toContain("nextUpdateAt: '2026/05/03 11:00'")
    expect(componentSource).toContain('选择店铺')
    expect(componentSource).toContain('选择仓库')
    expect(componentSource).toContain('配送类型')
    expect(componentSource).toContain('选择品牌')
    expect(componentSource).toContain('搜索 sku / 卖家编号 / 条形码')
  })

  it('matches the sales order product image size for the inventory thumbnail', () => {
    expect(componentSource).toMatch(/\.thumb-card\s*\{[^}]*width:\s*42px;[^}]*height:\s*42px;/s)
  })

  it('matches the batch inventory spacing below the page description', () => {
    expect(componentSource).toMatch(/\.page-head\s*\{[^}]*padding:\s*16px 2px 16px;/s)
  })

  it('uses a white fill for the inventory summary strip', () => {
    expect(componentSource).toMatch(/\.inventory-summary\s*\{[^}]*--workspace-color-bg:\s*var\(--color-bg-1\);/s)
  })
})
