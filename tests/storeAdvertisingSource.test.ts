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
    expect(workbenchSource).toContain('ConfigurableDataTable')
    expect(workbenchSource).toContain('router.push(`/stores/ads/${record.id}`)')
    expect(workbenchSource).toContain('router.push(`/stores/ads/${record.id}/statistics`)')
    expect(workbenchSource).toContain('创建活动')
    expect(workbenchSource).not.toContain('统一查看多平台、多店铺广告活动、预算消耗与转化表现。')
  })

  it('uses the product metadata filter layout on the homepage', () => {
    expect(workbenchSource).toContain("import QueryActionBar from '../common/QueryActionBar.vue'")
    expect(workbenchSource).toContain("import QueryFilterItem from '../common/QueryFilterItem.vue'")
    expect(workbenchSource).toContain("import QueryFilterPanel from '../common/QueryFilterPanel.vue'")
    expect(workbenchSource).not.toContain('class="advertising-scope-picker"')
    expect(workbenchSource).not.toContain('class="advertising-scope-select"')
    expect(workbenchSource).not.toContain('resolveAdvertisingScopeLabel')
    expect(workbenchSource).not.toContain('广告范围')
    expect(workbenchSource).toContain('v-model="filters.storeIds"')
    expect(workbenchSource).toContain('v-for="option in storeOptions"')
    expect(workbenchSource).toMatch(/class="advertising-page-header-actions"[\s\S]*?创建活动/)
    expect(workbenchSource).not.toMatch(/class="advertising-page-header-actions"[\s\S]*?刷新/)
    expect(workbenchSource).not.toContain('IconRefresh')
    expect(workbenchSource).not.toContain('refreshData')
    expect(workbenchSource).not.toContain('<section class="advertising-scope-bar">')
    expect(workbenchSource).not.toContain('<MetricSummaryStrip')
    expect(workbenchSource).toContain('<QueryFilterPanel class="advertising-filter-panel">')
    expect(workbenchSource).toContain('<QueryFilterItem label="关键词"')
    expect(workbenchSource).toContain('<QueryFilterItem label="店铺"')
    expect(workbenchSource).toContain('<QueryFilterItem label="日期"')
    expect(workbenchSource).toContain('<QueryFilterItem label="活动状态"')
    expect(workbenchSource).toContain('<QueryFilterItem label="活动类型"')
    expect(workbenchSource).toContain('<QueryFilterItem label="预算状态"')
    expect(workbenchSource).toMatch(/<QueryFilterItem label="关键词"[\s\S]*?<QueryFilterItem label="店铺" width="320px" min-width="300px"[\s\S]*?<QueryFilterItem label="活动状态" width="280px" min-width="260px"[\s\S]*?<QueryFilterItem label="活动类型" width="260px" min-width="240px"[\s\S]*?<QueryFilterItem label="预算状态" width="320px" min-width="300px"[\s\S]*?<QueryFilterItem label="日期" width="300px" min-width="260px"[\s\S]*?<QueryActionBar>/)
    expect(workbenchSource).toContain('const filterSelectWidths = ref')
    expect(workbenchSource).toContain('const resolveFilterMaxTagCount = (selectedLabels: string[], availableWidth: number)')
    expect(workbenchSource).toContain('ResizeObserver')
    expect(workbenchSource).toMatch(/<QueryFilterItem label="店铺"[\s\S]*?data-filter-key="storeIds"[\s\S]*?:max-tag-count="storeFilterMaxTagCount"[\s\S]*?<QueryFilterItem label="活动状态"[\s\S]*?data-filter-key="statuses"[\s\S]*?:max-tag-count="statusFilterMaxTagCount"[\s\S]*?<QueryFilterItem label="活动类型"[\s\S]*?data-filter-key="campaignTypes"[\s\S]*?:max-tag-count="campaignTypeFilterMaxTagCount"[\s\S]*?<QueryFilterItem label="预算状态"[\s\S]*?data-filter-key="budgetStatuses"[\s\S]*?:max-tag-count="budgetStatusFilterMaxTagCount"/)
    expect(workbenchSource).not.toContain(':max-tag-count="1"')
    expect(workbenchSource).not.toContain(':max-tag-count="2"')
    expect(workbenchSource).toContain('<QueryActionBar>')
    expect(workbenchSource).not.toContain('@click="filterActiveCampaigns"')
    expect(workbenchSource).not.toContain('const filterActiveCampaigns')
    expect(workbenchSource).not.toContain('class="advertising-activity-toolbar"')
    expect(workbenchSource).not.toContain('class="advertising-filter-row"')
    expect(workbenchSource).not.toContain('<h2>活动</h2>')
    expect(workbenchSource).not.toContain('class="advertising-toolbar-primary"')
    expect(workbenchSource).not.toContain('class="advertising-toolbar-actions"')
    expect(workbenchSource).toContain('通过活动ID或名称搜索')
    expect(workbenchSource).not.toContain('筛选器')
    expect(workbenchSource).not.toContain('IconFilter')
    expect(workbenchSource).not.toContain('advancedFiltersVisible')
  })

  it('shows campaign sample images with product count badges', () => {
    expect(workbenchSource).toContain('<a-badge')
    expect(workbenchSource).toContain(':count="record.products.length"')
    expect(workbenchSource).toContain('class="advertising-campaign-main"')
    expect(workbenchSource).toContain('class="advertising-campaign-thumb-badge"')
    expect(workbenchSource).toContain('class="advertising-campaign-image"')
    expect(workbenchSource).toContain(':src="record.products[0]?.image"')
    expect(workbenchSource).not.toContain("record.platform.slice(0, 2)")
  })

  it('renders campaign statuses with Arco tags', () => {
    expect(workbenchSource).toContain('<a-tag :color="getCampaignStatusTagColor(record.status)">')
    expect(detailWorkbenchSource).toContain('<a-tag :color="getCampaignStatusTagColor(campaign.status)">')
    expect(statisticsWorkbenchSource).toContain('<a-tag :color="getCampaignStatusTagColor(campaign.status)">')
    expect(workbenchSource).toContain('getCampaignStatusTagColor')
    expect(detailWorkbenchSource).toContain('getCampaignStatusTagColor')
    expect(statisticsWorkbenchSource).toContain('getCampaignStatusTagColor')
    expect(workbenchSource).not.toContain('class="advertising-status-pill"')
    expect(detailWorkbenchSource).not.toContain('class="advertising-status-pill"')
    expect(statisticsWorkbenchSource).not.toContain('class="advertising-status-pill"')
    expect(workbenchSource).not.toContain('getCampaignStatusClass')
    expect(detailWorkbenchSource).not.toContain('getCampaignStatusClass')
    expect(statisticsWorkbenchSource).not.toContain('getCampaignStatusClass')
    expect(workbenchSource).not.toContain('<span class="advertising-status-pill"')
    expect(detailWorkbenchSource).not.toContain('<span class="advertising-status-pill"')
    expect(statisticsWorkbenchSource).not.toContain('<span class="advertising-status-pill"')
  })

  it('supports advertising campaign bulk selection actions', () => {
    expect(workbenchSource).toContain('const selectedRowKeys = ref')
    expect(workbenchSource).toContain('const currentPage = ref(1)')
    expect(workbenchSource).toContain('const pageSize = ref(10)')
    expect(workbenchSource).toContain('const pagedRows = computed')
    expect(workbenchSource).toContain('const campaignRowSelection = {')
    expect(workbenchSource).toContain('v-model:selected-keys="selectedRowKeys"')
    expect(workbenchSource).toContain(':row-selection="campaignRowSelection"')
    expect(workbenchSource).toContain(':data="pagedRows"')
    expect(workbenchSource).toContain("{ settingsKey: 'campaign', title: '活动', dataIndex: 'campaign', slotName: 'campaign', width: 320, minWidth: 300")
    expect(workbenchSource).toContain('<template #footer>')
    expect(workbenchSource).toContain('class="advertising-table-footer-row"')
    expect(workbenchSource).toContain('class="advertising-bulk-action-bar"')
    expect(workbenchSource).toContain('已选 <span>{{ selectedRowKeys.length }}</span> / {{ filteredRows.length }} 条')
    expect(workbenchSource).toContain('class="advertising-bulk-action-placeholder"')
    expect(workbenchSource).toContain('取消选择')
    expect(workbenchSource).toContain('批量关闭')
    expect(workbenchSource).toContain('批量开启')
    expect(workbenchSource).toContain("bulkUpdateSelectedCampaigns('paused')")
    expect(workbenchSource).toContain("bulkUpdateSelectedCampaigns('active')")
    expect(workbenchSource).toContain('<a-pagination')
    expect(workbenchSource).toContain('v-model:current="currentPage"')
    expect(workbenchSource).toContain('v-model:page-size="pageSize"')
    expect(workbenchSource).toContain('class="advertising-pagination"')
    expect(workbenchSource).toContain(':total="filteredRows.length"')
    expect(workbenchSource).toContain(':page-size-options="[10, 20, 50]"')
    expect(workbenchSource).not.toContain('<section v-if="selectedRowKeys.length" class="advertising-bulk-action-bar">')
  })

  it('keeps the campaign status switch in a standalone table column', () => {
    expect(workbenchSource).toContain("{ title: '', slotName: 'statusToggle', width: 64, minWidth: 56, align: 'center', fixed: 'left' }")
    expect(workbenchSource).toContain('<template #statusToggle="{ record }">')
    expect(workbenchSource).toContain('class="advertising-status-toggle-cell"')
    expect(workbenchSource).not.toMatch(/<template #campaign="\{ record \}">[\s\S]*?<a-switch/)
  })

  it('right aligns the create campaign modal footer actions', () => {
    expect(workbenchSource).toMatch(/<template #footer>[\s\S]*?class="advertising-create-modal-footer"/)
    expect(styleSource).toContain('.advertising-create-modal-footer')
    expect(styleSource).toMatch(/\.advertising-create-modal-footer\s*{[^}]*justify-content: flex-end;/)
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

  it('scopes chart svg sizing away from table and checkbox icons', () => {
    expect(detailWorkbenchSource).toContain('class="advertising-chart-svg"')
    expect(statisticsWorkbenchSource).toContain('class="advertising-chart-svg"')
    expect(styleSource).toContain('.advertising-chart-svg')
    expect(styleSource).not.toContain('.advertising-chart-card svg')
    expect(styleSource).not.toContain('.advertising-statistics-chart svg')
  })

  it('adds advertising styles', () => {
    [
      '.store-advertising-workbench',
      '.advertising-page-header',
      '.advertising-status-toggle-cell',
      '.advertising-status-toggle-cell .arco-switch',
      '.advertising-campaign-main',
      '.advertising-campaign-thumb-badge',
      '.advertising-campaign-thumb-badge .arco-badge-number',
      '.advertising-table-footer-row',
      '.advertising-bulk-action-bar',
      '.advertising-bulk-action-placeholder',
      '.advertising-pagination',
      '.store-advertising-table',
      '.store-advertising-campaign-table .arco-table-th',
      '.store-advertising-campaign-table .arco-table-td',
      '.store-advertising-campaign-table:not(.is-auto-wrap) .advertising-link-button',
      '.store-advertising-campaign-table:not(.is-auto-wrap) .advertising-campaign-meta',
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
    expect(styleSource).toContain('background: var(--color-fill-3)')
    expect(styleSource).toContain('font-size: 10px')
    expect(styleSource).toContain('height: 14px')
    expect(styleSource).toContain('flex-wrap: nowrap')
    expect(styleSource).toMatch(/\.advertising-status-toggle-cell\s*{[^}]*justify-content: center;/)
    expect(styleSource).toMatch(/\.advertising-campaign-main\s*{[^}]*gap: 14px;/)
    expect(styleSource).toMatch(/\.advertising-bulk-action-bar \.arco-btn\s*{[^}]*height: var\(--workspace-control-height, var\(--size-default, 32px\)\);[^}]*border-radius: var\(--border-radius-medium\);[^}]*padding: 0 15px;/)
    expect(styleSource).toMatch(/\.store-advertising-campaign-table \.arco-table-th\s*{[^}]*font-size: 13px;[^}]*font-weight: 600;/)
    expect(styleSource).toMatch(/\.store-advertising-campaign-table \.arco-table-td\s*{[^}]*font-size: 13px;[^}]*white-space: nowrap;/)
    expect(styleSource).toMatch(/\.advertising-link-button\s*{[^}]*font-size: 14px;[^}]*line-height: 24px;/)
    expect(styleSource).not.toContain('.advertising-status-pill')
    expect(styleSource).toContain('.advertising-chart-grid line')
    expect(styleSource).toContain('@media (max-width: 1199px)')
    expect(styleSource).toContain('@media (max-width: 767px)')
  })
})
