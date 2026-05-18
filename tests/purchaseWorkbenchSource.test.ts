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

  it('keeps the purchase filter controls compact and omits the extra table control strip', () => {
    expect(workbenchStyleSource).toContain('grid-column: 2 / -1')
    expect(workbenchStyleSource).toContain('align-self: end')
    expect(workbenchSource).not.toContain('purchase-table-controls')
    expect(workbenchSource).not.toContain('purchase-table-controls-left')
    expect(workbenchSource).not.toContain('purchase-table-controls-right')
    expect(workbenchSource).not.toContain('purchase-view-mode')
    expect(workbenchSource).not.toContain('已选 0 项')
    expect(workbenchStyleSource).not.toContain('.purchase-table-controls')
    expect(workbenchStyleSource).not.toContain('.purchase-table-controls-left')
    expect(workbenchStyleSource).not.toContain('.purchase-table-controls-right')
    expect(workbenchStyleSource).not.toContain('.purchase-view-mode')
  })

  it('uses product detail inspired card tabs for purchase status switching', () => {
    expect(workbenchSource).toContain('class="purchase-status-tabs c-m-detail-header-tabs"')
    expect(workbenchSource).toContain('data-testid="c-m-detail-header-tabs"')
    expect(workbenchSource).toContain('class="purchase-status-tabs-wrapper c-m-detail-header-tabs-wrapper"')
    expect(workbenchSource).toContain('purchase-status-tabs-wrapper')
    expect(workbenchSource).toContain('<a-tabs')
    expect(workbenchSource).toContain(':active-key="activeStatus"')
    expect(workbenchSource).toContain('type="card-gutter"')
    expect(workbenchSource).toContain('hide-content')
    expect(workbenchSource).toContain('@change="(key) => setStatus(String(key))"')
    expect(workbenchSource).toContain('<a-tab-pane')
    expect(workbenchSource).toContain('v-for="tab in statusTabsWithCounts"')
    expect(workbenchSource).toContain('class="purchase-status-tab-title"')
    expect(workbenchSource).toContain('class="purchase-status-tab-count"')
    expect(workbenchSource).not.toContain('class="purchase-status-tab"')

    expect(workbenchStyleSource).toContain('.purchase-status-tabs-wrapper')
    expect(workbenchStyleSource).toContain('.purchase-status-tabs .arco-tabs')
    expect(workbenchStyleSource).toContain('.purchase-status-tabs .arco-tabs-content-hide')
    expect(workbenchStyleSource).toContain('.purchase-status-tabs .arco-tabs-nav-type-card-gutter')
    expect(workbenchStyleSource).toContain('--workspace-radius-small: var(--border-radius-small)')
    expect(workbenchStyleSource).toContain('--purchase-tabs-line-bleed: 28px')
    expect(workbenchStyleSource).toContain('.purchase-status-tabs::before')
    expect(workbenchStyleSource).toContain('right: calc(var(--purchase-tabs-line-bleed) * -1)')
    expect(workbenchStyleSource).toContain('box-shadow:')
    expect(workbenchStyleSource).toContain('inset 0 2px 0 var(--workspace-color-primary')
    expect(workbenchStyleSource).toContain('border-radius: var(--workspace-radius-small) var(--workspace-radius-small) 0 0')
    expect(workbenchStyleSource).toContain('.purchase-status-tabs .arco-tabs-tab-active .purchase-status-tab-count')
    expect(workbenchStyleSource).not.toContain(':deep(')
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

  it('uses Arco tags instead of custom pills for purchase table status labels', () => {
    expect(dataSource).toContain('getPurchaseStatusTagColor')
    expect(workbenchSource).toContain('getPurchaseStatusTagColor')
    expect(workbenchSource).toContain('<a-tag :color="getPurchaseStatusTagColor(props.pageKey, record.status)">')
    expect(workbenchSource).toContain('{{ getPurchaseStatusLabel(props.pageKey, record.status) }}')
    expect(workbenchSource).not.toContain('sales-status-pill')
    expect(workbenchSource).not.toContain('getPurchaseStatusClass')
  })
})
