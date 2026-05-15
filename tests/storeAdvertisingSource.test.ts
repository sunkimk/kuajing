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

const listViewSource = readFileSync(
  new URL('../src/views/StoreAdvertisingView.vue', import.meta.url),
  'utf-8',
)

const detailViewSource = readFileSync(
  new URL('../src/views/StoreAdvertisingDetailView.vue', import.meta.url),
  'utf-8',
)

const statisticsViewSource = readFileSync(
  new URL('../src/views/StoreAdvertisingStatisticsView.vue', import.meta.url),
  'utf-8',
)

const workbenchSource = readFileSync(
  new URL('../src/components/stores/StoreAdvertisingWorkbench.vue', import.meta.url),
  'utf-8',
)

const detailWorkbenchSource = readFileSync(
  new URL('../src/components/stores/StoreAdvertisingDetailWorkbench.vue', import.meta.url),
  'utf-8',
)

const statisticsWorkbenchSource = readFileSync(
  new URL('../src/components/stores/StoreAdvertisingStatisticsWorkbench.vue', import.meta.url),
  'utf-8',
)

const styleSource = readFileSync(
  new URL('../src/components/stores/storeAdvertising.css', import.meta.url),
  'utf-8',
)

describe('store advertising source contracts', () => {
  it('wires advertising navigation to real routes', () => {
    expect(navigationSource).toContain("{ key: 'ads', title: '广告推广', path: '/stores/ads'")
    expect(routerSource).toContain("import StoreAdvertisingView from '../views/StoreAdvertisingView.vue'")
    expect(routerSource).toContain("import StoreAdvertisingDetailView from '../views/StoreAdvertisingDetailView.vue'")
    expect(routerSource).toContain("import StoreAdvertisingStatisticsView from '../views/StoreAdvertisingStatisticsView.vue'")
    expect(routerSource).toContain("&& item.path !== '/stores/ads'")
    expect(routerSource).toMatch(/path:\s*'stores\/ads'[\s\S]*?component:\s*StoreAdvertisingView/)
    expect(routerSource).toMatch(/path:\s*'stores\/ads\/:campaignId\/statistics'[\s\S]*?component:\s*StoreAdvertisingStatisticsView/)
    expect(routerSource).toMatch(/path:\s*'stores\/ads\/:campaignId'[\s\S]*?component:\s*StoreAdvertisingDetailView/)
  })

  it('keeps route views thin', () => {
    expect(listViewSource).toContain('<StoreAdvertisingWorkbench />')
    expect(detailViewSource).toContain(':campaign-id="campaignId"')
    expect(statisticsViewSource).toContain(':campaign-id="campaignId"')
  })

  it('renders the advertising homepage shell', () => {
    expect(workbenchSource).toContain('广告推广')
    expect(workbenchSource).toContain('平台')
    expect(workbenchSource).toContain('店铺')
    expect(workbenchSource).toContain('scopeLabel')
    expect(workbenchSource).toContain('ConfigurableDataTable')
    expect(workbenchSource).toContain('router.push(`/stores/ads/${record.id}`)')
    expect(workbenchSource).toContain('router.push(`/stores/ads/${record.id}/statistics`)')
    expect(workbenchSource).toContain('创建活动')
  })

  it('uses a reference-style advertising activity toolbar on the homepage', () => {
    expect(workbenchSource).toContain('class="advertising-scope-picker"')
    expect(workbenchSource).toContain('class="advertising-scope-select"')
    expect(workbenchSource).toContain('v-model="filters.storeIds"')
    expect(workbenchSource).toContain('v-for="option in storeOptions"')
    expect(workbenchSource).toMatch(/class="advertising-page-header-actions"[\s\S]*?广告范围[\s\S]*?创建活动[\s\S]*?<icon-refresh/)
    expect(workbenchSource).not.toContain('<section class="advertising-scope-bar">')
    expect(workbenchSource).not.toContain('<MetricSummaryStrip')
    expect(workbenchSource).toContain('class="advertising-activity-toolbar"')
    expect(workbenchSource).not.toContain('<h2>活动</h2>')
    expect(workbenchSource).not.toMatch(/class="advertising-toolbar-primary"[\s\S]*?<a-button type="primary" class="advertising-create-button"/)
    expect(workbenchSource).toContain('通过活动ID或名称搜索')
    expect(workbenchSource).toContain('class="advertising-toolbar-search"')
    expect(workbenchSource).toContain('class="advertising-toolbar-date"')
    expect(workbenchSource).not.toContain('筛选器')
    expect(workbenchSource).not.toContain('IconFilter')
    expect(workbenchSource).not.toContain('advancedFiltersVisible')
    expect(workbenchSource).toMatch(/class="advertising-filter-row"[\s\S]*?<span>活动状态<\/span>[\s\S]*?<span>活动类型<\/span>[\s\S]*?<span>预算状态<\/span>/)
  })

  it('supports advertising campaign bulk selection actions', () => {
    expect(workbenchSource).toContain('const selectedRowKeys = ref')
    expect(workbenchSource).toContain('const campaignRowSelection = {')
    expect(workbenchSource).toContain('v-model:selected-keys="selectedRowKeys"')
    expect(workbenchSource).toContain(':row-selection="campaignRowSelection"')
    expect(workbenchSource).toContain('class="advertising-bulk-action-bar"')
    expect(workbenchSource).toContain('已选 <span>{{ selectedRowKeys.length }}</span> / {{ filteredRows.length }} 条')
    expect(workbenchSource).toContain('取消选择')
    expect(workbenchSource).toContain('批量关闭')
    expect(workbenchSource).toContain('批量开启')
    expect(workbenchSource).toContain("bulkUpdateSelectedCampaigns('paused')")
    expect(workbenchSource).toContain("bulkUpdateSelectedCampaigns('active')")
  })

  it('renders the advertising detail shell', () => {
    expect(detailWorkbenchSource).toContain('预算余额')
    expect(detailWorkbenchSource).toContain('自动补充预算')
    expect(detailWorkbenchSource).toContain('完整统计')
    expect(detailWorkbenchSource).toContain('filterAdvertisingProductClusters')
    expect(detailWorkbenchSource).toContain('搜索词集群')
    expect(detailWorkbenchSource).toContain('推荐商品')
    expect(detailWorkbenchSource).toContain('expandedProductIds')
  })

  it('renders the advertising statistics shell', () => {
    expect(statisticsWorkbenchSource).toContain('活动统计')
    expect(statisticsWorkbenchSource).toContain('metricOptions')
    expect(statisticsWorkbenchSource).toContain('selectedMetrics')
    expect(statisticsWorkbenchSource).toContain('createStatisticPolylinePoints')
    expect(statisticsWorkbenchSource).toContain('广告活动的基本统计')
    expect(statisticsWorkbenchSource).toContain('扩展统计')
  })

  it('adds advertising styles', () => {
    [
      '.store-advertising-workbench',
      '.advertising-page-header',
      '.advertising-scope-picker',
      '.advertising-scope-select',
      '.advertising-activity-toolbar',
      '.advertising-bulk-action-bar',
      '.store-advertising-table',
      '.advertising-detail-budget-card',
      '.advertising-product-expanded',
      '.advertising-statistics-workbench',
      '.advertising-chart-card',
      '.advertising-statistics-funnel',
      '.advertising-statistics-table',
    ].forEach((selector) => {
      expect(styleSource).toContain(selector)
    })
    expect(styleSource).toContain('--advertising-color-primary: rgb(var(--primary-6))')
    expect(styleSource).toContain('.advertising-status-pill.is-active')
    expect(styleSource).toContain('.advertising-status-pill.is-unknown')
    expect(styleSource).toContain('.advertising-chart-grid line')
    expect(styleSource).toContain('@media (max-width: 1199px)')
    expect(styleSource).toContain('@media (max-width: 767px)')
  })
})
