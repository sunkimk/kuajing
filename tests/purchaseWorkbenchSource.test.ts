import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const dataSource = readFileSync(
  new URL('../src/data/purchase.ts', import.meta.url),
  'utf-8',
)

const workbenchSource = readFileSync(
  new URL('../src/components/purchase/PurchaseWorkbench.vue', import.meta.url),
  'utf-8',
)

const workbenchStyleSource = readFileSync(
  new URL('../src/components/purchase/purchaseWorkbench.css', import.meta.url),
  'utf-8',
)

describe('purchase workbench source', () => {
  it('captures the four prototype page configs and status tabs', () => {
    expect(dataSource).toContain('purchasePageConfigs')
    expect(dataSource).toContain("order: {")
    expect(dataSource).toContain("delivery: {")
    expect(dataSource).toContain("return: {")
    expect(dataSource).toContain("changeLog: {")

    for (const label of ['草稿', '审核驳回', '待交货', '交货中', '全部交货', '变更中', '待质检', '质检中', '待发货', '入库中', '待处理', '责任方']) {
      expect(dataSource).toContain(label)
    }
  })

  it('models the prototype filter vocabulary for each page', () => {
    for (const label of [
      '采购类型',
      '产品名称',
      '采购单号',
      '目的仓',
      '平台站点',
      '供应商',
      '交货单号',
      '交货仓',
      '退货单号',
      '退货类型',
      '单据编号',
      '变更日期',
    ]) {
      expect(dataSource).toContain(label)
    }
  })

  it('renders a reusable purchase workbench with filters, actions, settings and configurable table', () => {
    for (const snippet of [
      'MetricSummaryStrip',
      'QueryFilterPanel',
      'QueryFilterItem',
      'QueryActionBar',
      'ConfigurableDataTable',
      'purchase-status-tabs',
      'purchase-view-mode',
      'activeFilterChips',
      'settingsVisible',
      'IconRefresh',
      'IconSettings',
      '导出',
      '保存视图',
    ]) {
      expect(workbenchSource).toContain(snippet)
    }
  })

  it('keeps purchase table columns adaptive with a desktop three-column filter grid fallback', () => {
    expect(workbenchStyleSource).toContain('grid-template-columns: repeat(3, minmax(0, 1fr))')
    expect(workbenchStyleSource).toContain('@media (max-width: 1199px)')
    expect(workbenchStyleSource).toContain('grid-template-columns: repeat(2, minmax(0, 1fr))')
    expect(workbenchStyleSource).toContain('@media (max-width: 767px)')
    expect(workbenchStyleSource).toContain('grid-template-columns: 1fr')
  })

  it('keeps the purchase filter controls compact instead of adding extra vertical rows', () => {
    expect(workbenchSource).toContain('purchase-table-controls')
    expect(workbenchSource).toContain('purchase-table-controls-left')
    expect(workbenchSource).toContain('purchase-table-controls-right')
    expect(workbenchStyleSource).toContain('grid-column: 2 / -1')
    expect(workbenchStyleSource).toContain('align-self: end')
  })

  it('uses the shared configurable table media cell style for product columns', () => {
    for (const className of [
      'configurable-table-media-cell',
      'configurable-table-media-frame',
      'configurable-table-media-image',
      'configurable-table-media-copy',
      'configurable-table-media-title',
      'configurable-table-media-description',
    ]) {
      expect(workbenchSource).toContain(className)
    }

    expect(workbenchSource).not.toContain('sales-product-cell')
    expect(workbenchSource).not.toContain('sales-product-copy')
  })
})
