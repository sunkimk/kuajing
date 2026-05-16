import { describe, expect, it } from 'vitest'
import {
  advertisingPlatformOptions,
  calculateAdvertisingSummary,
  createAdvertisingCampaignRows,
  createStatisticPolylinePoints,
  filterAdvertisingCampaigns,
  filterAdvertisingProductClusters,
  findAdvertisingCampaignById,
  formatAdvertisingMoney,
  getAdvertisingStoreOptions,
  getCampaignStatusLabel,
  getCampaignStatusTagColor,
  getStatisticsMetricOptions,
  resolveAdvertisingScopeLabel,
  type AdvertisingFilterState,
} from '../src/data/storeAdvertising'

describe('storeAdvertising data contract', () => {
  it('creates a multi-platform advertising demo dataset', () => {
    const rows = createAdvertisingCampaignRows()
    const platformCount = new Set(rows.map((row) => row.platform)).size
    const storeCount = new Set(rows.map((row) => row.storeId)).size
    const largestProductCount = Math.max(...rows.map((row) => row.products.length))
    const largestClusterCount = Math.max(
      ...rows.flatMap((row) => row.products.map((product) => product.searchClusters.length))
    )

    expect(rows.length).toBeGreaterThanOrEqual(12)
    expect(platformCount).toBeGreaterThanOrEqual(5)
    expect(storeCount).toBeGreaterThanOrEqual(8)
    expect(largestProductCount).toBeGreaterThanOrEqual(8)
    expect(largestClusterCount).toBeGreaterThanOrEqual(4)
  })

  it('provides sample product images for campaign thumbnails', () => {
    const rows = createAdvertisingCampaignRows()
    const images = rows.flatMap((row) => row.products.map((product) => product.image ?? ''))

    expect(rows.every((row) => row.products[0]?.image?.startsWith('data:image/svg+xml,'))).toBe(true)
    expect(new Set(images).size).toBeGreaterThanOrEqual(8)
    expect(new Set(rows.map((row) => row.products[0]?.image)).size).toBeGreaterThanOrEqual(6)
    expect(images.every((image) => decodeURIComponent(image).includes('product-photo'))).toBe(true)
  })

  it('exposes the supported platform options in display order', () => {
    expect(advertisingPlatformOptions.map((option) => option.value)).toEqual([
      'Wildberries',
      'Ozon',
      'AliExpress',
      'TikTok Shop',
      'Amazon',
    ])
  })

  it('filters campaigns by platform, store, status, type, date range, and keyword', () => {
    const filters: AdvertisingFilterState = {
      keyword: '旗舰',
      platforms: ['Wildberries'],
      storeIds: ['wb-main'],
      statuses: ['active'],
      campaignTypes: ['CPM'],
      budgetStatuses: [],
      dateRange: ['2026-05-06', '2026-05-12'],
    }

    expect(filterAdvertisingCampaigns(createAdvertisingCampaignRows(), filters).map((row) => row.id)).toEqual([
      'ad-cp-1001',
    ])
  })

  it('limits store options by selected platforms', () => {
    expect(getAdvertisingStoreOptions(['Ozon']).map((option) => option.value)).toEqual([
      'oz-main',
      'oz-kz',
    ])
    expect(getAdvertisingStoreOptions(['Ozon', 'Wildberries']).map((option) => option.value)).toContain('wb-main')
  })

  it('calculates aggregate advertising summary metrics', () => {
    const rows = createAdvertisingCampaignRows()
    const summary = calculateAdvertisingSummary(rows)

    expect(summary.totalCount).toBe(rows.length)
    expect(summary.activeCount).toBeGreaterThan(0)
    expect(summary.totalBudget).toBeGreaterThan(0)
    expect(summary.totalSpend).toBeGreaterThan(0)
    expect(summary.totalImpressions).toBeGreaterThan(0)
    expect(summary.totalOrders).toBeGreaterThan(0)
    expect(summary.averageCtr).toMatch(/%$/)
    expect(summary.spendRatio).toMatch(/%$/)
  })

  it('finds campaign metadata and formats status and money labels', () => {
    const campaign = findAdvertisingCampaignById('ad-cp-1001')

    expect(campaign?.storeName).toBe('WB 旗舰店')
    expect(getCampaignStatusLabel(campaign?.status ?? '')).toBe('投放中')
    expect(getCampaignStatusTagColor(campaign?.status ?? '')).toBe('green')
    expect(getCampaignStatusTagColor('paused')).toBe('orange')
    expect(getCampaignStatusTagColor('unknown')).toBe('gray')
    expect(formatAdvertisingMoney(campaign?.spend ?? 0, campaign?.currencySymbol ?? '')).toMatch(/^₽/)
  })

  it('resolves compact scope labels for platform and store selections', () => {
    expect(resolveAdvertisingScopeLabel([], [])).toBe('全部平台 · 全部店铺')
    expect(resolveAdvertisingScopeLabel(['Wildberries'], ['wb-main', 'wb-outlet'])).toBe('Wildberries · 2 家店铺')
    expect(resolveAdvertisingScopeLabel(['Ozon', 'Wildberries'], ['oz-main', 'oz-kz', 'wb-main'])).toBe(
      'Ozon + Wildberries · 3 家店铺'
    )
  })

  it('filters product search clusters by state and keyword', () => {
    const campaign = findAdvertisingCampaignById('ad-cp-1001')
    const product = campaign?.products.find((item) => item.searchClusters.length >= 4)

    expect(product).toBeDefined()
    expect(filterAdvertisingProductClusters(product?.searchClusters ?? [], {
      state: 'active',
      keyword: 'iphone',
    }).every((cluster) =>
      cluster.state === 'active' && cluster.query.toLowerCase().includes('iphone')
    )).toBe(true)
  })

  it('exposes statistics metric options in chart order', () => {
    expect(getStatisticsMetricOptions().map((option) => option.value)).toEqual([
      'impressions',
      'clicks',
      'cartAdds',
      'orderedItems',
      'spend',
    ])
  })

  it('generates distinct chart lines for the statistics metrics', () => {
    const campaign = findAdvertisingCampaignById('ad-cp-1001')
    const lines = getStatisticsMetricOptions().map((option) =>
      createStatisticPolylinePoints(campaign?.statistics ?? [], option.value, 720, 220)
    )

    expect(new Set(lines).size).toBeGreaterThanOrEqual(4)
  })
})
