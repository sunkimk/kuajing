# Store Advertising Promotion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a multi-platform, multi-store advertising promotion demo under `店铺管理 > 广告推广`, with campaign homepage, campaign detail, product expanded rows, and campaign statistics.

**Architecture:** Keep route views thin and move advertising behavior into store-domain workbench components. Put all mock data, filters, metrics, formatting, and chart-series helpers in `src/data/storeAdvertising.ts`, then render the three page levels through focused Vue SFCs. Use existing Arco, common filter, summary, and configurable-table patterns.

**Tech Stack:** Vue 3, TypeScript, Vite, Vue Router, Arco Design Vue, Vitest, existing common components in `src/components/common`.

---

## File Structure

- Create: `src/data/storeAdvertising.ts`
  - Owns all advertising types, mock datasets, filters, metrics, formatting helpers, status helpers, campaign lookup, product cluster filters, and statistics-series helpers.
- Create: `tests/storeAdvertisingData.test.ts`
  - Verifies data behavior before components consume it.
- Create: `tests/storeAdvertisingSource.test.ts`
  - Verifies route wiring, navigation placement, and required page/component structure.
- Create: `src/views/StoreAdvertisingView.vue`
  - Thin route view for `/stores/ads`.
- Create: `src/views/StoreAdvertisingDetailView.vue`
  - Thin route view for `/stores/ads/:campaignId`.
- Create: `src/views/StoreAdvertisingStatisticsView.vue`
  - Thin route view for `/stores/ads/:campaignId/statistics`.
- Create: `src/components/stores/StoreAdvertisingWorkbench.vue`
  - Homepage workbench for multi-platform campaign management.
- Create: `src/components/stores/StoreAdvertisingDetailWorkbench.vue`
  - Detail workbench for one campaign, budget, summary trend, and promoted products.
- Create: `src/components/stores/StoreAdvertisingStatisticsWorkbench.vue`
  - Statistics workbench for one campaign, metric toggles, SVG chart, and product stats table.
- Create: `src/components/stores/storeAdvertising.css`
  - Store advertising page styles shared by the three workbenches.
- Modify: `src/router/index.ts`
  - Import new views, exclude `/stores/ads` from generated placeholders, and add detail/statistics routes.
- Verify unchanged: `src/data/navigation.ts`
  - Existing `广告推广` item already points to `/stores/ads`.

---

### Task 1: Advertising Data Contract

**Files:**
- Create: `tests/storeAdvertisingData.test.ts`
- Create: `src/data/storeAdvertising.ts`

- [ ] **Step 1: Write the failing data tests**

Create `tests/storeAdvertisingData.test.ts` with this content:

```ts
import { describe, expect, it } from 'vitest'
import {
  advertisingPlatformOptions,
  calculateAdvertisingSummary,
  createAdvertisingCampaignRows,
  createDefaultAdvertisingFilters,
  filterAdvertisingCampaigns,
  filterAdvertisingProductClusters,
  findAdvertisingCampaignById,
  formatAdvertisingMoney,
  getAdvertisingStoreOptions,
  getCampaignStatusLabel,
  getStatisticsMetricOptions,
  resolveAdvertisingScopeLabel,
  type AdvertisingCampaign,
} from '../src/data/storeAdvertising'

const rows: AdvertisingCampaign[] = createAdvertisingCampaignRows()

describe('storeAdvertising helpers', () => {
  it('creates multi-platform and multi-store campaign rows', () => {
    expect(advertisingPlatformOptions.map((option) => option.value)).toEqual([
      'Wildberries',
      'Ozon',
      'AliExpress',
      'TikTok Shop',
      'Amazon',
    ])
    expect(rows.length).toBeGreaterThanOrEqual(12)
    expect(new Set(rows.map((row) => row.platform)).size).toBeGreaterThanOrEqual(5)
    expect(new Set(rows.map((row) => row.storeId)).size).toBeGreaterThanOrEqual(8)
    expect(rows.some((row) => row.products.length >= 8)).toBe(true)
    expect(rows.some((row) => row.products.some((product) => product.clusters.length >= 4))).toBe(true)
  })

  it('filters campaigns by platform, linked stores, status, type, date range, and keyword', () => {
    const filters = createDefaultAdvertisingFilters()
    filters.platforms = ['Wildberries']
    filters.storeIds = ['wb-main']
    filters.status = 'active'
    filters.campaignType = 'CPM'
    filters.dateRange = ['2026-05-06', '2026-05-12']
    filters.keyword = '旗舰'

    expect(filterAdvertisingCampaigns(rows, filters).map((row) => row.id)).toEqual(['ad-cp-1001'])
  })

  it('filters available stores when platforms are selected', () => {
    expect(getAdvertisingStoreOptions(['Ozon']).map((option) => option.value)).toEqual([
      'oz-main',
      'oz-kz',
    ])
    expect(getAdvertisingStoreOptions(['Ozon', 'Wildberries']).map((option) => option.value)).toContain('wb-main')
  })

  it('summarizes the current campaign scope', () => {
    const summary = calculateAdvertisingSummary(rows)

    expect(summary.totalCampaigns).toBe(rows.length)
    expect(summary.activeCampaigns).toBe(rows.filter((row) => row.status === 'active').length)
    expect(summary.totalBudgetCny).toBeGreaterThan(0)
    expect(summary.todaySpendCny).toBeGreaterThan(0)
    expect(summary.impressions).toBeGreaterThan(0)
    expect(summary.orders).toBeGreaterThan(0)
    expect(summary.averageCtr).toMatch(/%$/)
    expect(summary.spendRatio).toMatch(/%$/)
  })

  it('finds campaign detail rows and formats status and money', () => {
    const campaign = findAdvertisingCampaignById('ad-cp-1001')

    expect(campaign?.storeName).toBe('WB 旗舰店')
    expect(getCampaignStatusLabel(campaign?.status ?? '')).toBe('投放中')
    expect(formatAdvertisingMoney(campaign?.budgetBalance ?? 0, campaign?.currencySymbol ?? '¥')).toMatch(/^¥/)
  })

  it('resolves readable scope labels for all-platform and selected scopes', () => {
    expect(resolveAdvertisingScopeLabel([], [])).toBe('全部平台 · 全部店铺')
    expect(resolveAdvertisingScopeLabel(['Wildberries'], ['wb-main', 'wb-outlet'])).toBe('Wildberries · 2 家店铺')
    expect(resolveAdvertisingScopeLabel(['Ozon', 'Wildberries'], ['oz-main', 'wb-main', 'wb-outlet'])).toBe('Ozon + Wildberries · 3 家店铺')
  })

  it('filters product search clusters by tab state and keyword', () => {
    const campaign = findAdvertisingCampaignById('ad-cp-1001')
    const product = campaign?.products[0]

    expect(product).toBeTruthy()
    expect(filterAdvertisingProductClusters(product?.clusters ?? [], 'active', '').every((row) => row.state === 'active')).toBe(true)
    expect(filterAdvertisingProductClusters(product?.clusters ?? [], 'all', 'iphone').length).toBeGreaterThan(0)
  })

  it('exposes statistics metric options for chart toggles', () => {
    expect(getStatisticsMetricOptions().map((option) => option.value)).toEqual([
      'impressions',
      'clicks',
      'cartAdds',
      'orderedItems',
      'spend',
    ])
  })
})
```

- [ ] **Step 2: Run the data tests to verify they fail**

Run:

```bash
npm run test -- tests/storeAdvertisingData.test.ts
```

Expected: FAIL because `src/data/storeAdvertising.ts` does not exist.

- [ ] **Step 3: Create the advertising data module**

Create `src/data/storeAdvertising.ts` with this content:

```ts
export type AdvertisingPlatform = 'Wildberries' | 'Ozon' | 'AliExpress' | 'TikTok Shop' | 'Amazon'
export type AdvertisingCampaignStatus = 'active' | 'paused' | 'finished' | 'draft'
export type AdvertisingCampaignType = 'CPM' | 'CPC' | '搜索推广' | '商品推广'
export type AdvertisingBudgetStatus = 'healthy' | 'low' | 'empty'
export type AdvertisingClusterState = 'active' | 'inactive'
export type AdvertisingClusterFilter = AdvertisingClusterState | 'all'
export type AdvertisingStatisticsMetricKey = 'impressions' | 'clicks' | 'cartAdds' | 'orderedItems' | 'spend'

export type AdvertisingStore = {
  id: string
  platform: AdvertisingPlatform
  name: string
  region: string
}

export type AdvertisingSearchCluster = {
  id: string
  query: string
  state: AdvertisingClusterState
  averageRank: number
  impressions: number
  clicks: number
  cartAdds: number
  orderedItems: number
  spend: number
  ctr: number
  cpm: number
}

export type AdvertisingCampaignProduct = {
  id: string
  image: string
  brand: string
  sku: string
  name: string
  bid: number
  placement: string
  averageRank: number
  impressions: number
  clicks: number
  cartAdds: number
  orderedItems: number
  spend: number
  orderAmount: number
  clusters: AdvertisingSearchCluster[]
}

export type AdvertisingMetricPoint = {
  date: string
  impressions: number
  clicks: number
  cartAdds: number
  orderedItems: number
  spend: number
}

export type AdvertisingCampaign = {
  id: string
  name: string
  platform: AdvertisingPlatform
  storeId: string
  storeName: string
  storeRegion: string
  status: AdvertisingCampaignStatus
  campaignType: AdvertisingCampaignType
  budgetStatus: AdvertisingBudgetStatus
  currencySymbol: string
  budgetBalance: number
  budgetBalanceCny: number
  todaySpend: number
  todaySpendCny: number
  impressions: number
  clicks: number
  ctr: number
  orders: number
  spendRatio: number
  orderAmount: number
  startDate: string
  endDate: string
  updatedAt: string
  autoTopUp: boolean
  thumbnail: string
  products: AdvertisingCampaignProduct[]
  metricSeries: AdvertisingMetricPoint[]
}

export type AdvertisingFilterState = {
  keyword: string
  platforms: AdvertisingPlatform[]
  storeIds: string[]
  status?: AdvertisingCampaignStatus
  campaignType?: AdvertisingCampaignType
  budgetStatus?: AdvertisingBudgetStatus
  dateRange: [string, string]
}

export type AdvertisingSummary = {
  totalCampaigns: number
  activeCampaigns: number
  totalBudgetCny: number
  todaySpendCny: number
  impressions: number
  orders: number
  averageCtr: string
  spendRatio: string
}

const productImages = [
  'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1603891128711-11b4b03bb138?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=120&q=80',
]

export const advertisingStores: AdvertisingStore[] = [
  { id: 'wb-main', platform: 'Wildberries', name: 'WB 旗舰店', region: 'RU' },
  { id: 'wb-outlet', platform: 'Wildberries', name: 'WB 折扣店', region: 'RU' },
  { id: 'oz-main', platform: 'Ozon', name: 'OZON 主店', region: 'KZ' },
  { id: 'oz-kz', platform: 'Ozon', name: 'OZON 哈萨克店', region: 'KZ' },
  { id: 'ae-eu', platform: 'AliExpress', name: 'AE 欧洲店', region: 'EU' },
  { id: 'ae-es', platform: 'AliExpress', name: 'AE 西语店', region: 'ES' },
  { id: 'tt-uk', platform: 'TikTok Shop', name: 'TT 英国店', region: 'UK' },
  { id: 'amz-de', platform: 'Amazon', name: 'AMZ 德国店', region: 'DE' },
]

export const advertisingPlatformOptions = ['Wildberries', 'Ozon', 'AliExpress', 'TikTok Shop', 'Amazon']
  .map((value) => ({ label: value, value: value as AdvertisingPlatform }))

export const campaignStatusOptions: Array<{ label: string; value: AdvertisingCampaignStatus }> = [
  { label: '投放中', value: 'active' },
  { label: '已暂停', value: 'paused' },
  { label: '已结束', value: 'finished' },
  { label: '待启动', value: 'draft' },
]

export const campaignTypeOptions: Array<{ label: string; value: AdvertisingCampaignType }> = [
  { label: 'CPM', value: 'CPM' },
  { label: 'CPC', value: 'CPC' },
  { label: '搜索推广', value: '搜索推广' },
  { label: '商品推广', value: '商品推广' },
]

export const budgetStatusOptions: Array<{ label: string; value: AdvertisingBudgetStatus }> = [
  { label: '预算充足', value: 'healthy' },
  { label: '预算偏低', value: 'low' },
  { label: '预算为 0', value: 'empty' },
]

const statusLabels: Record<AdvertisingCampaignStatus, string> = {
  active: '投放中',
  paused: '已暂停',
  finished: '已结束',
  draft: '待启动',
}

const statusClasses: Record<AdvertisingCampaignStatus, string> = {
  active: 'is-success',
  paused: 'is-warning',
  finished: 'is-neutral',
  draft: 'is-info',
}

const createSeries = (seed: number): AdvertisingMetricPoint[] =>
  ['2026-05-06', '2026-05-07', '2026-05-08', '2026-05-09', '2026-05-10', '2026-05-11', '2026-05-12']
    .map((date, index) => {
      const wave = [0.78, 0.82, 1.12, 0.58, 1.24, 1.52, 0.9][index]
      const impressions = Math.round(seed * wave)
      const clicks = Math.round(impressions * (0.045 + index * 0.002))
      const cartAdds = Math.round(clicks * 0.18)
      const orderedItems = Math.round(cartAdds * 0.42)

      return {
        date,
        impressions,
        clicks,
        cartAdds,
        orderedItems,
        spend: Number((impressions * 0.0062).toFixed(2)),
      }
    })

const createClusters = (productId: string, base: number): AdvertisingSearchCluster[] =>
  [
    ['iphone 16 pro max', 'active'],
    ['16 pro max', 'active'],
    ['iphone 16', 'inactive'],
    ['apple', 'active'],
    ['smartphone restored', 'inactive'],
  ].map(([query, state], index) => {
    const impressions = base - index * 210
    const clicks = Math.max(0, Math.round(impressions * (0.028 + index * 0.004)))

    return {
      id: `${productId}-cluster-${index + 1}`,
      query,
      state: state as AdvertisingClusterState,
      averageRank: Number((8 + index * 2.7).toFixed(2)),
      impressions,
      clicks,
      cartAdds: Math.round(clicks * 0.12),
      orderedItems: Math.round(clicks * 0.04),
      spend: Number((impressions * 0.64).toFixed(2)),
      ctr: Number(((clicks / impressions) * 100).toFixed(2)),
      cpm: Number((620 + index * 24).toFixed(2)),
    }
  })

const createProducts = (prefix: string, count: number): AdvertisingCampaignProduct[] =>
  Array.from({ length: count }, (_, index) => {
    const impressions = 1800 + index * 680
    const clicks = 48 + index * 19
    const orderedItems = 2 + index

    return {
      id: `${prefix}-product-${index + 1}`,
      image: productImages[index % productImages.length],
      brand: index % 3 === 0 ? 'Apple' : index % 3 === 1 ? 'Samsung' : 'Baseus',
      sku: `${977552200 + index}`,
      name: index % 2 === 0 ? 'iPhone 16 Pro MAX 256GB Восстановленный' : 'iPhone 15 Pro 256GB Восстановленный',
      bid: index === 3 ? 698 : 650,
      placement: index % 2 === 0 ? '顶级搜索' : '目录推荐',
      averageRank: 6 + index,
      impressions,
      clicks,
      cartAdds: Math.round(clicks * 0.14),
      orderedItems,
      spend: Number((impressions * 0.69).toFixed(2)),
      orderAmount: orderedItems * 312000,
      clusters: createClusters(`${prefix}-${index + 1}`, 1700 + index * 360),
    }
  })

const campaignSeeds: Array<Omit<AdvertisingCampaign, 'products' | 'metricSeries'>> = [
  {
    id: 'ad-cp-1001',
    name: 'WB 旗舰手机 5 月搜索推广',
    platform: 'Wildberries',
    storeId: 'wb-main',
    storeName: 'WB 旗舰店',
    storeRegion: 'RU',
    status: 'active',
    campaignType: 'CPM',
    budgetStatus: 'healthy',
    currencySymbol: '₽',
    budgetBalance: 95872,
    budgetBalanceCny: 7670,
    todaySpend: 52966,
    todaySpendCny: 4237,
    impressions: 838821,
    clicks: 57135,
    ctr: 6.81,
    orders: 830,
    spendRatio: 1.7,
    orderAmount: 31756135,
    startDate: '2026-04-20',
    endDate: '2026-05-30',
    updatedAt: '2026-05-12 17:05',
    autoTopUp: true,
    thumbnail: productImages[0],
  },
  {
    id: 'ad-cp-1002',
    name: 'WB 折扣配件 CPM 活动',
    platform: 'Wildberries',
    storeId: 'wb-outlet',
    storeName: 'WB 折扣店',
    storeRegion: 'RU',
    status: 'paused',
    campaignType: 'CPM',
    budgetStatus: 'empty',
    currencySymbol: '₽',
    budgetBalance: 0,
    budgetBalanceCny: 0,
    todaySpend: 657.63,
    todaySpendCny: 53,
    impressions: 2368,
    clicks: 58,
    ctr: 2.45,
    orders: 0,
    spendRatio: 0,
    orderAmount: 0,
    startDate: '2026-04-20',
    endDate: '2026-05-12',
    updatedAt: '2026-05-12 09:12',
    autoTopUp: false,
    thumbnail: productImages[1],
  },
  {
    id: 'ad-cp-1003',
    name: 'OZON 电子消费 CPC 拉新',
    platform: 'Ozon',
    storeId: 'oz-main',
    storeName: 'OZON 主店',
    storeRegion: 'KZ',
    status: 'active',
    campaignType: 'CPC',
    budgetStatus: 'low',
    currencySymbol: '₽',
    budgetBalance: 4414,
    budgetBalanceCny: 353,
    todaySpend: 455,
    todaySpendCny: 36,
    impressions: 3004,
    clicks: 91,
    ctr: 3.03,
    orders: 8,
    spendRatio: 0.47,
    orderAmount: 168420,
    startDate: '2026-05-02',
    endDate: '2026-05-21',
    updatedAt: '2026-05-12 12:10',
    autoTopUp: true,
    thumbnail: productImages[2],
  },
  {
    id: 'ad-cp-1004',
    name: 'OZON 哈萨克春季推广',
    platform: 'Ozon',
    storeId: 'oz-kz',
    storeName: 'OZON 哈萨克店',
    storeRegion: 'KZ',
    status: 'active',
    campaignType: '商品推广',
    budgetStatus: 'healthy',
    currencySymbol: '₽',
    budgetBalance: 22696,
    budgetBalanceCny: 1816,
    todaySpend: 33485.1,
    todaySpendCny: 2679,
    impressions: 105563,
    clicks: 3788,
    ctr: 3.59,
    orders: 60,
    spendRatio: 5.15,
    orderAmount: 6501200,
    startDate: '2026-04-13',
    endDate: '2026-06-01',
    updatedAt: '2026-05-12 10:46',
    autoTopUp: false,
    thumbnail: productImages[3],
  },
]

const extraCampaigns: Array<Omit<AdvertisingCampaign, 'products' | 'metricSeries'>> =
  ['ae-eu', 'ae-es', 'tt-uk', 'amz-de', 'wb-main', 'oz-main', 'ae-eu', 'tt-uk']
    .map((storeId, index) => {
      const store = advertisingStores.find((item) => item.id === storeId) ?? advertisingStores[0]
      const status: AdvertisingCampaignStatus[] = ['active', 'paused', 'finished', 'draft']
      const type: AdvertisingCampaignType[] = ['CPM', 'CPC', '搜索推广', '商品推广']
      const impressions = 38000 + index * 14200
      const clicks = 1200 + index * 420

      return {
        id: `ad-cp-${1005 + index}`,
        name: `${store.name} ${type[index % type.length]} 活动`,
        platform: store.platform,
        storeId: store.id,
        storeName: store.name,
        storeRegion: store.region,
        status: status[index % status.length],
        campaignType: type[index % type.length],
        budgetStatus: index % 3 === 0 ? 'healthy' : index % 3 === 1 ? 'low' : 'empty',
        currencySymbol: store.platform === 'Amazon' ? '€' : store.platform === 'TikTok Shop' ? '£' : '¥',
        budgetBalance: 3200 + index * 1780,
        budgetBalanceCny: 3200 + index * 1780,
        todaySpend: 980 + index * 540,
        todaySpendCny: 980 + index * 540,
        impressions,
        clicks,
        ctr: Number(((clicks / impressions) * 100).toFixed(2)),
        orders: 8 + index * 7,
        spendRatio: Number((0.8 + index * 0.62).toFixed(2)),
        orderAmount: 210000 + index * 180000,
        startDate: `2026-05-${String(1 + index).padStart(2, '0')}`,
        endDate: '2026-06-15',
        updatedAt: `2026-05-12 ${String(8 + index).padStart(2, '0')}:20`,
        autoTopUp: index % 2 === 0,
        thumbnail: productImages[index % productImages.length],
      }
    })

export const createDefaultAdvertisingFilters = (): AdvertisingFilterState => ({
  keyword: '',
  platforms: [],
  storeIds: [],
  status: undefined,
  campaignType: undefined,
  budgetStatus: undefined,
  dateRange: ['2026-05-06', '2026-05-12'],
})

export const createAdvertisingCampaignRows = (): AdvertisingCampaign[] =>
  [...campaignSeeds, ...extraCampaigns].map((campaign, index) => ({
    ...campaign,
    products: createProducts(campaign.id, index === 0 ? 10 : 4 + (index % 4)),
    metricSeries: createSeries(94000 + index * 9000),
  }))

export const getAdvertisingStoreOptions = (platforms: AdvertisingPlatform[] = []) =>
  advertisingStores
    .filter((store) => !platforms.length || platforms.includes(store.platform))
    .map((store) => ({
      label: `${store.name}（${store.platform}）`,
      value: store.id,
      platform: store.platform,
    }))

export const getCampaignStatusLabel = (status: AdvertisingCampaignStatus | string) =>
  statusLabels[status as AdvertisingCampaignStatus] ?? status

export const getCampaignStatusClass = (status: AdvertisingCampaignStatus | string) =>
  statusClasses[status as AdvertisingCampaignStatus] ?? 'is-neutral'

export const formatAdvertisingMoney = (value: number, currencySymbol = '¥') =>
  `${currencySymbol}${value.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}`

export const formatAdvertisingNumber = (value: number) =>
  value.toLocaleString('zh-CN')

export const filterAdvertisingCampaigns = (rows: AdvertisingCampaign[], filters: AdvertisingFilterState) => {
  const keyword = filters.keyword.trim().toLowerCase()

  return rows.filter((row) => {
    const matchesKeyword = !keyword || [
      row.name,
      row.id,
      row.platform,
      row.storeName,
      row.campaignType,
    ].some((field) => field.toLowerCase().includes(keyword))
    const matchesPlatform = !filters.platforms.length || filters.platforms.includes(row.platform)
    const matchesStore = !filters.storeIds.length || filters.storeIds.includes(row.storeId)
    const matchesStatus = !filters.status || row.status === filters.status
    const matchesType = !filters.campaignType || row.campaignType === filters.campaignType
    const matchesBudget = !filters.budgetStatus || row.budgetStatus === filters.budgetStatus
    const matchesDate = row.startDate <= filters.dateRange[1] && row.endDate >= filters.dateRange[0]

    return matchesKeyword && matchesPlatform && matchesStore && matchesStatus && matchesType && matchesBudget && matchesDate
  })
}

export const calculateAdvertisingSummary = (rows: AdvertisingCampaign[]): AdvertisingSummary => {
  const clicks = rows.reduce((total, row) => total + row.clicks, 0)
  const impressions = rows.reduce((total, row) => total + row.impressions, 0)
  const totalBudgetCny = rows.reduce((total, row) => total + row.budgetBalanceCny, 0)
  const todaySpendCny = rows.reduce((total, row) => total + row.todaySpendCny, 0)

  return {
    totalCampaigns: rows.length,
    activeCampaigns: rows.filter((row) => row.status === 'active').length,
    totalBudgetCny,
    todaySpendCny,
    impressions,
    orders: rows.reduce((total, row) => total + row.orders, 0),
    averageCtr: impressions ? `${((clicks / impressions) * 100).toFixed(2)}%` : '0%',
    spendRatio: totalBudgetCny ? `${((todaySpendCny / totalBudgetCny) * 100).toFixed(2)}%` : '0%',
  }
}

export const createAdvertisingSummaryCards = (rows: AdvertisingCampaign[]) => {
  const summary = calculateAdvertisingSummary(rows)

  return [
    { label: '活动总数', value: summary.totalCampaigns, note: '当前筛选范围' },
    { label: '投放中', value: summary.activeCampaigns, note: '可点击筛选', tone: 'green' as const },
    { label: '总预算', value: formatAdvertisingMoney(summary.totalBudgetCny), note: '人民币折算', tone: 'blue' as const },
    { label: '今日消耗', value: formatAdvertisingMoney(summary.todaySpendCny), note: summary.spendRatio, tone: 'orange' as const },
    { label: '展示次数', value: formatAdvertisingNumber(summary.impressions), note: '近 7 天' },
    { label: '订单数', value: formatAdvertisingNumber(summary.orders), note: '广告归因' },
    { label: '平均 CTR', value: summary.averageCtr, note: '点击率' },
    { label: '花费比例', value: summary.spendRatio, note: '消耗 / 预算' },
  ]
}

export const findAdvertisingCampaignById = (campaignId: string) =>
  createAdvertisingCampaignRows().find((row) => row.id === campaignId)

export const resolveAdvertisingScopeLabel = (platforms: AdvertisingPlatform[], storeIds: string[]) => {
  if (!platforms.length && !storeIds.length) return '全部平台 · 全部店铺'
  const platformLabel = platforms.length ? platforms.join(' + ') : '全部平台'
  const storeLabel = storeIds.length ? `${storeIds.length} 家店铺` : '全部店铺'

  return `${platformLabel} · ${storeLabel}`
}

export const filterAdvertisingProductClusters = (
  rows: AdvertisingSearchCluster[],
  state: AdvertisingClusterFilter,
  keyword: string,
) => {
  const normalizedKeyword = keyword.trim().toLowerCase()

  return rows.filter((row) => {
    const matchesState = state === 'all' || row.state === state
    const matchesKeyword = !normalizedKeyword || row.query.toLowerCase().includes(normalizedKeyword)

    return matchesState && matchesKeyword
  })
}

export const getStatisticsMetricOptions = (): Array<{ label: string; value: AdvertisingStatisticsMetricKey; color: string }> => [
  { label: '展示次数', value: 'impressions', color: '#4e6ef2' },
  { label: '点击次数', value: 'clicks', color: '#ff5f5f' },
  { label: '加入购物车', value: 'cartAdds', color: '#f5c400' },
  { label: '订购商品数量', value: 'orderedItems', color: '#14c9c9' },
  { label: '花费', value: 'spend', color: '#a855f7' },
]

export const createStatisticPolylinePoints = (
  series: AdvertisingMetricPoint[],
  metric: AdvertisingStatisticsMetricKey,
  width = 760,
  height = 280,
) => {
  const values = series.map((point) => Number(point[metric]))
  const max = Math.max(...values, 1)
  const step = series.length > 1 ? width / (series.length - 1) : width

  return values
    .map((value, index) => {
      const x = Number((index * step).toFixed(2))
      const y = Number((height - (value / max) * height).toFixed(2))

      return `${x},${y}`
    })
    .join(' ')
}
```

- [ ] **Step 4: Run the data tests to verify they pass**

Run:

```bash
npm run test -- tests/storeAdvertisingData.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit the data contract**

Run:

```bash
git add src/data/storeAdvertising.ts tests/storeAdvertisingData.test.ts
git commit -m "feat: add store advertising data model"
```

---

### Task 2: Route And Source Contract

**Files:**
- Create: `tests/storeAdvertisingSource.test.ts`
- Create: `src/views/StoreAdvertisingView.vue`
- Create: `src/views/StoreAdvertisingDetailView.vue`
- Create: `src/views/StoreAdvertisingStatisticsView.vue`
- Modify: `src/router/index.ts`

- [ ] **Step 1: Write the failing source contract tests**

Create `tests/storeAdvertisingSource.test.ts` with this content:

```ts
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

const listWorkbenchSource = readFileSync(
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

describe('store advertising source contract', () => {
  it('keeps advertising promotion in store navigation and maps routes to real views', () => {
    expect(navigationSource).toContain("{ key: 'ads', title: '广告推广', path: '/stores/ads'")
    expect(routerSource).toContain("import StoreAdvertisingView from '../views/StoreAdvertisingView.vue'")
    expect(routerSource).toContain("import StoreAdvertisingDetailView from '../views/StoreAdvertisingDetailView.vue'")
    expect(routerSource).toContain("import StoreAdvertisingStatisticsView from '../views/StoreAdvertisingStatisticsView.vue'")
    expect(routerSource).toContain("&& item.path !== '/stores/ads'")
    expect(routerSource).toMatch(/\{\s*path:\s*'stores\/ads',[\s\S]*?component:\s*StoreAdvertisingView/)
    expect(routerSource).toMatch(/\{\s*path:\s*'stores\/ads\/:campaignId',[\s\S]*?component:\s*StoreAdvertisingDetailView/)
    expect(routerSource).toMatch(/\{\s*path:\s*'stores\/ads\/:campaignId\/statistics',[\s\S]*?component:\s*StoreAdvertisingStatisticsView/)
  })

  it('keeps route views thin and delegates to store advertising workbenches', () => {
    expect(listViewSource).toContain('<StoreAdvertisingWorkbench />')
    expect(detailViewSource).toContain('<StoreAdvertisingDetailWorkbench')
    expect(detailViewSource).toContain(':campaign-id="campaignId"')
    expect(statisticsViewSource).toContain('<StoreAdvertisingStatisticsWorkbench')
    expect(statisticsViewSource).toContain(':campaign-id="campaignId"')
  })

  it('renders a multi-platform multi-store homepage contract', () => {
    expect(listWorkbenchSource).toContain('广告推广')
    expect(listWorkbenchSource).toContain('平台')
    expect(listWorkbenchSource).toContain('店铺')
    expect(listWorkbenchSource).toContain('scopeLabel')
    expect(listWorkbenchSource).toContain('ConfigurableDataTable')
    expect(listWorkbenchSource).toContain('createAdvertisingSummaryCards')
    expect(listWorkbenchSource).toContain('router.push(`/stores/ads/${record.id}`)')
    expect(listWorkbenchSource).toContain('router.push(`/stores/ads/${record.id}/statistics`)')
    expect(listWorkbenchSource).toContain('创建活动')
  })

  it('renders campaign detail, expanded product clusters, and statistics entry', () => {
    expect(detailWorkbenchSource).toContain('预算余额')
    expect(detailWorkbenchSource).toContain('自动补充预算')
    expect(detailWorkbenchSource).toContain('完整统计')
    expect(detailWorkbenchSource).toContain('filterAdvertisingProductClusters')
    expect(detailWorkbenchSource).toContain('搜索词集群')
    expect(detailWorkbenchSource).toContain('推荐商品')
    expect(detailWorkbenchSource).toContain('expandedProductIds')
  })

  it('renders the statistics report contract', () => {
    expect(statisticsWorkbenchSource).toContain('活动统计')
    expect(statisticsWorkbenchSource).toContain('metricOptions')
    expect(statisticsWorkbenchSource).toContain('selectedMetrics')
    expect(statisticsWorkbenchSource).toContain('createStatisticPolylinePoints')
    expect(statisticsWorkbenchSource).toContain('广告活动的基本统计')
    expect(statisticsWorkbenchSource).toContain('扩展统计')
    expect(styleSource).toContain('.store-advertising-workbench')
    expect(styleSource).toContain('.advertising-chart-card')
    expect(styleSource).toContain('.advertising-product-expanded')
  })
})
```

- [ ] **Step 2: Run the source tests to verify they fail**

Run:

```bash
npm run test -- tests/storeAdvertisingSource.test.ts
```

Expected: FAIL because the new view and workbench files do not exist.

- [ ] **Step 3: Add thin route views**

Create `src/views/StoreAdvertisingView.vue`:

```vue
<script setup lang="ts">
import StoreAdvertisingWorkbench from '../components/stores/StoreAdvertisingWorkbench.vue'
</script>

<template>
  <StoreAdvertisingWorkbench />
</template>
```

Create `src/views/StoreAdvertisingDetailView.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import StoreAdvertisingDetailWorkbench from '../components/stores/StoreAdvertisingDetailWorkbench.vue'

const route = useRoute()
const campaignId = computed(() => String(route.params.campaignId ?? ''))
</script>

<template>
  <StoreAdvertisingDetailWorkbench :campaign-id="campaignId" />
</template>
```

Create `src/views/StoreAdvertisingStatisticsView.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import StoreAdvertisingStatisticsWorkbench from '../components/stores/StoreAdvertisingStatisticsWorkbench.vue'

const route = useRoute()
const campaignId = computed(() => String(route.params.campaignId ?? ''))
</script>

<template>
  <StoreAdvertisingStatisticsWorkbench :campaign-id="campaignId" />
</template>
```

- [ ] **Step 4: Wire router imports, placeholder exclusion, and routes**

Modify `src/router/index.ts`.

Add imports near existing store views:

```ts
import StoreAdvertisingView from '../views/StoreAdvertisingView.vue'
import StoreAdvertisingDetailView from '../views/StoreAdvertisingDetailView.vue'
import StoreAdvertisingStatisticsView from '../views/StoreAdvertisingStatisticsView.vue'
```

Add placeholder exclusion next to `/stores/list`:

```ts
    && item.path !== '/stores/ads'
```

Add these child routes after the existing `stores/list` route and before `stores/add`:

```ts
        {
          path: 'stores/ads',
          component: StoreAdvertisingView,
          meta: {
            title: '广告推广',
            sectionKey: 'stores',
            sectionTitle: '店铺管理',
            hideBreadcrumb: true,
          },
        },
        {
          path: 'stores/ads/:campaignId',
          component: StoreAdvertisingDetailView,
          meta: {
            title: '活动详情',
            sectionKey: 'stores',
            sectionTitle: '店铺管理',
            hideBreadcrumb: true,
          },
        },
        {
          path: 'stores/ads/:campaignId/statistics',
          component: StoreAdvertisingStatisticsView,
          meta: {
            title: '活动统计',
            sectionKey: 'stores',
            sectionTitle: '店铺管理',
            hideBreadcrumb: true,
          },
        },
```

- [ ] **Step 5: Add temporary minimal workbench shells so source tests reach component assertions**

Create `src/components/stores/storeAdvertising.css`:

```css
.store-advertising-workbench {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 16px;
}

.advertising-chart-card {
  border: 1px solid var(--color-border-2);
}

.advertising-product-expanded {
  border-top: 1px solid var(--color-border-2);
}
```

Create `src/components/stores/StoreAdvertisingWorkbench.vue`:

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import ConfigurableDataTable from '../common/ConfigurableDataTable.vue'
import { createAdvertisingCampaignRows, createAdvertisingSummaryCards, resolveAdvertisingScopeLabel } from '../../data/storeAdvertising'
import './storeAdvertising.css'

const router = useRouter()
const rows = ref(createAdvertisingCampaignRows())
const scopeLabel = computed(() => resolveAdvertisingScopeLabel([], []))
const summaryCards = computed(() => createAdvertisingSummaryCards(rows.value))

const openDetail = (record: { id: string }) => {
  router.push(`/stores/ads/${record.id}`)
}

const openStatistics = (record: { id: string }) => {
  router.push(`/stores/ads/${record.id}/statistics`)
}
</script>

<template>
  <div class="store-advertising-workbench">
    <h1>广告推广</h1>
    <span>{{ scopeLabel }}</span>
    <span>平台</span>
    <span>店铺</span>
    <a-button type="primary">创建活动</a-button>
    <ConfigurableDataTable
      :columns="[]"
      :default-visible-keys="[]"
      :data="rows"
      row-key="id"
      :pagination="false"
    />
    <button type="button" @click="openDetail(rows[0])">详情</button>
    <button type="button" @click="openStatistics(rows[0])">统计</button>
    <span>{{ summaryCards.length }}</span>
  </div>
</template>
```

Create `src/components/stores/StoreAdvertisingDetailWorkbench.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { filterAdvertisingProductClusters } from '../../data/storeAdvertising'
import './storeAdvertising.css'

defineProps<{
  campaignId: string
}>()

const expandedProductIds = ref<string[]>([])
</script>

<template>
  <div class="store-advertising-workbench">
    <h1>活动详情</h1>
    <span>预算余额</span>
    <span>自动补充预算</span>
    <span>完整统计</span>
    <span>搜索词集群</span>
    <span>推荐商品</span>
    <span>{{ campaignId }}</span>
    <span>{{ expandedProductIds.length }}</span>
    <span>{{ filterAdvertisingProductClusters([], 'all', '').length }}</span>
  </div>
</template>
```

Create `src/components/stores/StoreAdvertisingStatisticsWorkbench.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { createStatisticPolylinePoints, getStatisticsMetricOptions, type AdvertisingStatisticsMetricKey } from '../../data/storeAdvertising'
import './storeAdvertising.css'

defineProps<{
  campaignId: string
}>()

const metricOptions = getStatisticsMetricOptions()
const selectedMetrics = ref<AdvertisingStatisticsMetricKey[]>(['impressions', 'clicks', 'cartAdds', 'orderedItems', 'spend'])
</script>

<template>
  <div class="store-advertising-workbench">
    <h1>活动统计</h1>
    <span>广告活动的基本统计</span>
    <span>扩展统计</span>
    <span>{{ campaignId }}</span>
    <span>{{ metricOptions.length }}</span>
    <span>{{ selectedMetrics.length }}</span>
    <span>{{ createStatisticPolylinePoints([], 'impressions') }}</span>
    <section class="advertising-chart-card"></section>
  </div>
</template>
```

- [ ] **Step 6: Run source tests**

Run:

```bash
npm run test -- tests/storeAdvertisingSource.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit route and source contract**

Run:

```bash
git add src/router/index.ts src/views/StoreAdvertisingView.vue src/views/StoreAdvertisingDetailView.vue src/views/StoreAdvertisingStatisticsView.vue src/components/stores/StoreAdvertisingWorkbench.vue src/components/stores/StoreAdvertisingDetailWorkbench.vue src/components/stores/StoreAdvertisingStatisticsWorkbench.vue src/components/stores/storeAdvertising.css tests/storeAdvertisingSource.test.ts
git commit -m "feat: route store advertising pages"
```

---

### Task 3: Advertising Homepage Workbench

**Files:**
- Modify: `src/components/stores/StoreAdvertisingWorkbench.vue`
- Verify: `tests/storeAdvertisingSource.test.ts`
- Verify: `tests/storeAdvertisingData.test.ts`

- [ ] **Step 1: Replace the homepage shell with the full workbench**

Replace `src/components/stores/StoreAdvertisingWorkbench.vue` with this content:

```vue
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { IconRefresh, IconSettings } from '@arco-design/web-vue/es/icon'
import { useRouter } from 'vue-router'
import type { ConfigurableTableColumn } from '../../data/configurableTable'
import ConfigurableDataTable from '../common/ConfigurableDataTable.vue'
import MetricSummaryStrip from '../common/MetricSummaryStrip.vue'
import QueryActionBar from '../common/QueryActionBar.vue'
import QueryFilterItem from '../common/QueryFilterItem.vue'
import QueryFilterPanel from '../common/QueryFilterPanel.vue'
import {
  advertisingPlatformOptions,
  budgetStatusOptions,
  campaignStatusOptions,
  campaignTypeOptions,
  createAdvertisingCampaignRows,
  createAdvertisingSummaryCards,
  createDefaultAdvertisingFilters,
  filterAdvertisingCampaigns,
  formatAdvertisingMoney,
  formatAdvertisingNumber,
  getAdvertisingStoreOptions,
  getCampaignStatusClass,
  getCampaignStatusLabel,
  resolveAdvertisingScopeLabel,
  type AdvertisingCampaign,
} from '../../data/storeAdvertising'
import './storeAdvertising.css'

type CampaignColumnKey =
  | 'campaign'
  | 'platform'
  | 'store'
  | 'campaignType'
  | 'budgetBalance'
  | 'todaySpend'
  | 'impressions'
  | 'ctr'
  | 'orders'
  | 'spendRatio'

type CampaignTableColumn = ConfigurableTableColumn<CampaignColumnKey> & { title: string }

const router = useRouter()
const filters = ref(createDefaultAdvertisingFilters())
const allRows = ref(createAdvertisingCampaignRows())
const loading = ref(false)
const settingsVisible = ref(false)
const createVisible = ref(false)

const filteredRows = computed(() => filterAdvertisingCampaigns(allRows.value, filters.value))
const summaryCards = computed(() => createAdvertisingSummaryCards(filteredRows.value))
const storeOptions = computed(() => getAdvertisingStoreOptions(filters.value.platforms))
const scopeLabel = computed(() => resolveAdvertisingScopeLabel(filters.value.platforms, filters.value.storeIds))

watch(() => filters.value.platforms, () => {
  const allowedStoreIds = new Set(storeOptions.value.map((option) => option.value))
  filters.value.storeIds = filters.value.storeIds.filter((storeId) => allowedStoreIds.has(storeId))
})

const columns: CampaignTableColumn[] = [
  { settingsKey: 'campaign', title: '活动', slotName: 'campaign', width: 260, minWidth: 220, align: 'left' },
  { settingsKey: 'platform', title: '平台', dataIndex: 'platform', width: 132, minWidth: 120 },
  { settingsKey: 'store', title: '店铺', slotName: 'store', width: 168, minWidth: 148 },
  { settingsKey: 'campaignType', title: '广告类型', dataIndex: 'campaignType', width: 110, minWidth: 96, align: 'center' },
  { settingsKey: 'budgetBalance', title: '预算余额', slotName: 'budgetBalance', width: 138, minWidth: 122, align: 'right' },
  { settingsKey: 'todaySpend', title: '费用', slotName: 'todaySpend', width: 126, minWidth: 112, align: 'right' },
  { settingsKey: 'impressions', title: '展示次数', slotName: 'impressions', width: 130, minWidth: 116, align: 'right' },
  { settingsKey: 'ctr', title: 'CTR', slotName: 'ctr', width: 96, minWidth: 86, align: 'right' },
  { settingsKey: 'orders', title: '订单', dataIndex: 'orders', width: 90, minWidth: 80, align: 'right' },
  { settingsKey: 'spendRatio', title: '花费比例', slotName: 'spendRatio', width: 112, minWidth: 98, align: 'right' },
  { title: '操作', slotName: 'operation', width: 136, minWidth: 120, align: 'center' },
]

const defaultVisibleKeys: CampaignColumnKey[] = [
  'campaign',
  'platform',
  'store',
  'campaignType',
  'budgetBalance',
  'todaySpend',
  'impressions',
  'ctr',
  'orders',
  'spendRatio',
]

const requiredKeys: CampaignColumnKey[] = ['campaign']
const pinnedColumnKeys: CampaignColumnKey[] = ['campaign']

const handleSearch = () => {}

const resetFilters = () => {
  filters.value = createDefaultAdvertisingFilters()
}

const refreshData = () => {
  loading.value = true
  allRows.value = createAdvertisingCampaignRows()
  loading.value = false
}

const toggleStatus = (record: AdvertisingCampaign) => {
  allRows.value = allRows.value.map((row) =>
    row.id === record.id
      ? { ...row, status: row.status === 'active' ? 'paused' : 'active' }
      : row
  )
}

const filterActiveCampaigns = () => {
  filters.value.status = 'active'
}

const openDetail = (record: AdvertisingCampaign) => {
  router.push(`/stores/ads/${record.id}`)
}

const openStatistics = (record: AdvertisingCampaign) => {
  router.push(`/stores/ads/${record.id}/statistics`)
}
</script>

<template>
  <div class="store-advertising-workbench">
    <section class="page-header advertising-page-header">
      <div class="header-left">
        <h1 class="page-title">广告推广</h1>
        <span class="page-desc">统一查看多平台、多店铺广告活动、预算消耗与转化表现。</span>
      </div>
      <div class="advertising-header-actions">
        <a-button @click="refreshData">刷新</a-button>
        <a-button type="primary" @click="createVisible = true">创建活动</a-button>
      </div>
    </section>

    <section class="advertising-scope-bar">
      <div class="advertising-scope-copy">
        <span>当前范围</span>
        <strong>{{ scopeLabel }}</strong>
      </div>
      <a-select
        v-model="filters.platforms"
        multiple
        allow-clear
        placeholder="全部平台"
        class="advertising-scope-select"
        @change="handleSearch"
      >
        <a-option v-for="option in advertisingPlatformOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </a-option>
      </a-select>
      <a-select
        v-model="filters.storeIds"
        multiple
        allow-clear
        placeholder="全部店铺"
        class="advertising-scope-select"
        @change="handleSearch"
      >
        <a-option v-for="option in storeOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </a-option>
      </a-select>
      <a-range-picker
        v-model="filters.dateRange"
        value-format="YYYY-MM-DD"
        class="advertising-date-range"
        @change="handleSearch"
      />
    </section>

    <MetricSummaryStrip :cards="summaryCards" :columns="4" />

    <QueryFilterPanel>
      <QueryFilterItem label="关键词" width="360px" min-width="320px">
        <a-input-search
          v-model="filters.keyword"
          allow-clear
          placeholder="搜索活动名称 / 活动 ID / 平台 / 店铺"
          @search="handleSearch"
          @press-enter="handleSearch"
          @clear="handleSearch"
        />
      </QueryFilterItem>

      <QueryFilterItem label="活动状态">
        <a-select v-model="filters.status" allow-clear placeholder="全部状态" @change="handleSearch">
          <a-option v-for="option in campaignStatusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </a-option>
        </a-select>
      </QueryFilterItem>

      <QueryFilterItem label="广告类型">
        <a-select v-model="filters.campaignType" allow-clear placeholder="全部类型" @change="handleSearch">
          <a-option v-for="option in campaignTypeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </a-option>
        </a-select>
      </QueryFilterItem>

      <QueryFilterItem label="预算状态">
        <a-select v-model="filters.budgetStatus" allow-clear placeholder="全部预算" @change="handleSearch">
          <a-option v-for="option in budgetStatusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </a-option>
        </a-select>
      </QueryFilterItem>

      <QueryActionBar>
        <a-button type="primary" class="action-button" @click="handleSearch">查询</a-button>
        <a-button class="action-button" @click="resetFilters">重置</a-button>
        <a-tooltip content="筛选投放中活动">
          <a-button class="action-button" @click="filterActiveCampaigns">投放中</a-button>
        </a-tooltip>
        <a-tooltip content="定制列">
          <a-button class="icon-button" size="small" aria-label="定制列" @click="settingsVisible = true">
            <template #icon>
              <icon-settings />
            </template>
          </a-button>
        </a-tooltip>
        <a-tooltip content="刷新">
          <a-button class="icon-button" size="small" aria-label="刷新" :loading="loading" @click="refreshData">
            <template #icon>
              <icon-refresh />
            </template>
          </a-button>
        </a-tooltip>
      </QueryActionBar>
    </QueryFilterPanel>

    <ConfigurableDataTable
      v-model:settings-visible="settingsVisible"
      :columns="columns"
      :default-visible-keys="defaultVisibleKeys"
      :required-keys="requiredKeys"
      :pinned-column-keys="pinnedColumnKeys"
      :default-freeze-last-column="true"
      :data="filteredRows"
      row-key="id"
      :pagination="false"
      :loading="loading"
      wrapper-class="advertising-table-shell"
      table-class="advertising-campaign-table"
    >
      <template #campaign="{ record }">
        <div class="advertising-campaign-cell">
          <a-switch
            size="small"
            :model-value="record.status === 'active'"
            @change="toggleStatus(record)"
          />
          <img :src="record.thumbnail" :alt="record.name" class="advertising-campaign-thumb" />
          <div class="advertising-campaign-copy">
            <button type="button" class="advertising-link-button" @click.stop="openDetail(record)">
              {{ record.name }}
            </button>
            <span>
              <span class="advertising-status-pill" :class="getCampaignStatusClass(record.status)">
                {{ getCampaignStatusLabel(record.status) }}
              </span>
              <span class="advertising-muted">ID {{ record.id }}</span>
            </span>
          </div>
        </div>
      </template>

      <template #store="{ record }">
        <div class="advertising-store-cell">
          <strong>{{ record.storeName }}</strong>
          <span>{{ record.storeRegion }}</span>
        </div>
      </template>

      <template #budgetBalance="{ record }">
        <strong :class="{ 'advertising-danger': record.budgetStatus === 'empty' }">
          {{ formatAdvertisingMoney(record.budgetBalance, record.currencySymbol) }}
        </strong>
      </template>

      <template #todaySpend="{ record }">
        <span>{{ formatAdvertisingMoney(record.todaySpend, record.currencySymbol) }}</span>
      </template>

      <template #impressions="{ record }">
        <span>{{ formatAdvertisingNumber(record.impressions) }}</span>
      </template>

      <template #ctr="{ record }">
        <span>{{ record.ctr }}%</span>
      </template>

      <template #spendRatio="{ record }">
        <span>{{ record.spendRatio }}%</span>
      </template>

      <template #operation="{ record }">
        <div class="advertising-table-actions">
          <a-button type="text" size="small" @click.stop="openStatistics(record)">统计</a-button>
          <a-button type="text" size="small" @click.stop="openDetail(record)">详情</a-button>
        </div>
      </template>
    </ConfigurableDataTable>

    <a-modal
      v-model:visible="createVisible"
      title="创建活动"
      width="600px"
      simple
      align-center
      title-align="start"
    >
      <div class="advertising-create-modal">
        <span>选择平台、店铺和广告类型后即可进入创建向导。当前 demo 先保留入口，活动数据使用 mock 数据展示。</span>
        <div class="advertising-create-grid">
          <a-select placeholder="选择平台">
            <a-option v-for="option in advertisingPlatformOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </a-option>
          </a-select>
          <a-select placeholder="选择广告类型">
            <a-option v-for="option in campaignTypeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </a-option>
          </a-select>
        </div>
      </div>
      <template #footer>
        <a-button @click="createVisible = false">取消</a-button>
        <a-button type="primary" @click="createVisible = false">确认</a-button>
      </template>
    </a-modal>
  </div>
</template>
```

- [ ] **Step 2: Run focused tests**

Run:

```bash
npm run test -- tests/storeAdvertisingData.test.ts tests/storeAdvertisingSource.test.ts
```

Expected: PASS.

- [ ] **Step 3: Commit homepage workbench**

Run:

```bash
git add src/components/stores/StoreAdvertisingWorkbench.vue tests/storeAdvertisingSource.test.ts
git commit -m "feat: build store advertising homepage"
```

---

### Task 4: Campaign Detail And Product Expansion

**Files:**
- Modify: `src/components/stores/StoreAdvertisingDetailWorkbench.vue`
- Verify: `tests/storeAdvertisingSource.test.ts`

- [ ] **Step 1: Replace the detail shell with the full workbench**

Replace `src/components/stores/StoreAdvertisingDetailWorkbench.vue` with this content:

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { IconBarChart, IconDownload, IconMore, IconPlus, IconUp, IconDown } from '@arco-design/web-vue/es/icon'
import { useRouter } from 'vue-router'
import {
  createStatisticPolylinePoints,
  filterAdvertisingProductClusters,
  findAdvertisingCampaignById,
  formatAdvertisingMoney,
  formatAdvertisingNumber,
  getCampaignStatusClass,
  getCampaignStatusLabel,
  type AdvertisingClusterFilter,
} from '../../data/storeAdvertising'
import './storeAdvertising.css'

const props = defineProps<{
  campaignId: string
}>()

const router = useRouter()
const expandedProductIds = ref<string[]>([])
const clusterFilter = ref<AdvertisingClusterFilter>('active')
const clusterKeyword = ref('')
const activeClusterTab = ref<'clusters' | 'recommended'>('clusters')

const campaign = computed(() => findAdvertisingCampaignById(props.campaignId))
const summaryPoints = computed(() => campaign.value?.metricSeries ?? [])
const summaryLine = computed(() => createStatisticPolylinePoints(summaryPoints.value, 'impressions', 720, 220))

const toggleExpandedProduct = (productId: string) => {
  expandedProductIds.value = expandedProductIds.value.includes(productId)
    ? expandedProductIds.value.filter((id) => id !== productId)
    : [productId]
}

const goBack = () => {
  router.push('/stores/ads')
}

const goStatistics = () => {
  if (!campaign.value) return
  router.push(`/stores/ads/${campaign.value.id}/statistics`)
}
</script>

<template>
  <div class="store-advertising-workbench">
    <template v-if="campaign">
      <section class="advertising-detail-header">
        <div>
          <a-button type="text" size="small" @click="goBack">返回广告推广</a-button>
          <h1>{{ campaign.name }}</h1>
          <div class="advertising-detail-meta">
            <span class="advertising-status-pill" :class="getCampaignStatusClass(campaign.status)">
              {{ getCampaignStatusLabel(campaign.status) }}
            </span>
            <span>{{ campaign.platform }}</span>
            <span>{{ campaign.storeName }}</span>
            <span>{{ campaign.campaignType }}</span>
            <span>ID {{ campaign.id }}</span>
            <span>{{ campaign.updatedAt }}</span>
          </div>
        </div>
        <div class="advertising-header-actions">
          <a-button>{{ campaign.status === 'active' ? '暂停' : '继续' }}</a-button>
          <a-button type="primary">完成</a-button>
        </div>
      </section>

      <section class="advertising-budget-card">
        <div>
          <span>预算余额</span>
          <strong>{{ formatAdvertisingMoney(campaign.budgetBalance, campaign.currencySymbol) }}</strong>
        </div>
        <a-switch :model-value="campaign.autoTopUp" />
        <span>自动补充预算</span>
        <a-button>修改预算</a-button>
      </section>

      <section class="advertising-detail-statistics">
        <div class="advertising-section-head">
          <h2>统计</h2>
          <div class="advertising-header-actions">
            <a-range-picker :model-value="['2026-05-06', '2026-05-12']" value-format="YYYY-MM-DD" />
            <a-button @click="goStatistics">
              <template #icon>
                <icon-bar-chart />
              </template>
              完整统计
            </a-button>
          </div>
        </div>
        <div class="advertising-kpi-grid">
          <div>
            <span>展示次数</span>
            <strong>{{ formatAdvertisingNumber(campaign.impressions) }}</strong>
          </div>
          <div>
            <span>点击次数</span>
            <strong>{{ formatAdvertisingNumber(campaign.clicks) }}</strong>
          </div>
          <div>
            <span>订单</span>
            <strong>{{ formatAdvertisingNumber(campaign.orders) }}</strong>
          </div>
          <div>
            <span>花费比例</span>
            <strong>{{ campaign.spendRatio }}%</strong>
          </div>
        </div>
        <div class="advertising-chart-card">
          <svg viewBox="0 0 720 220" role="img" aria-label="展示次数趋势">
            <polyline :points="summaryLine" fill="none" stroke="rgb(var(--primary-6))" stroke-width="3" />
          </svg>
        </div>
      </section>

      <section class="advertising-products-card">
        <div class="advertising-section-head">
          <h2>商品 <small>{{ campaign.products.length }} 件</small></h2>
          <div class="advertising-header-actions">
            <a-button>
              <template #icon>
                <icon-plus />
              </template>
              添加商品
            </a-button>
            <a-button>
              上传
            </a-button>
          </div>
        </div>

        <div class="advertising-product-list">
          <article v-for="product in campaign.products" :key="product.id" class="advertising-product-row">
            <div class="advertising-product-main">
              <img :src="product.image" :alt="product.name" class="advertising-product-image" />
              <div class="advertising-product-copy">
                <strong>{{ product.name }}</strong>
                <span>{{ product.brand }} · {{ product.sku }}</span>
              </div>
              <div class="advertising-product-bid">
                <strong>{{ formatAdvertisingMoney(product.bid, campaign.currencySymbol) }}</strong>
                <span>{{ product.placement }}</span>
              </div>
              <a-button type="text">
                <template #icon>
                  <icon-bar-chart />
                </template>
              </a-button>
              <a-button type="text">
                <template #icon>
                  <icon-more />
                </template>
              </a-button>
              <a-button type="text" @click="toggleExpandedProduct(product.id)">
                <template #icon>
                  <icon-up v-if="expandedProductIds.includes(product.id)" />
                  <icon-down v-else />
                </template>
              </a-button>
            </div>

            <div v-if="expandedProductIds.includes(product.id)" class="advertising-product-expanded">
              <div class="advertising-expanded-toolbar">
                <a-tabs v-model:active-key="activeClusterTab">
                  <a-tab-pane key="clusters" title="搜索词集群" />
                  <a-tab-pane key="recommended" title="推荐商品" />
                </a-tabs>
                <div class="advertising-header-actions">
                  <a-button disabled>
                    集群管理
                  </a-button>
                  <a-button>
                    <template #icon>
                      <icon-download />
                    </template>
                    下载
                  </a-button>
                  <a-range-picker :model-value="['2026-05-06', '2026-05-12']" value-format="YYYY-MM-DD" />
                </div>
              </div>

              <div class="advertising-cluster-filters">
                <a-radio-group v-model="clusterFilter" type="button">
                  <a-radio value="active">活跃</a-radio>
                  <a-radio value="inactive">不活跃</a-radio>
                  <a-radio value="all">全部</a-radio>
                </a-radio-group>
                <a-input-search v-model="clusterKeyword" allow-clear placeholder="寻找" />
              </div>

              <a-table
                :data="filterAdvertisingProductClusters(product.clusters, clusterFilter, clusterKeyword)"
                :pagination="false"
                row-key="id"
                size="small"
              >
                <template #columns>
                  <a-table-column title="集群" data-index="query" />
                  <a-table-column title="平均排名" data-index="averageRank" />
                  <a-table-column title="展示次数" data-index="impressions" />
                  <a-table-column title="点击次数" data-index="clicks" />
                  <a-table-column title="购物车" data-index="cartAdds" />
                  <a-table-column title="订购商品数量" data-index="orderedItems" />
                  <a-table-column title="花费" data-index="spend" />
                  <a-table-column title="CTR" data-index="ctr" />
                  <a-table-column title="CPM" data-index="cpm" />
                </template>
              </a-table>
            </div>
          </article>
        </div>
      </section>
    </template>

    <section v-else class="advertising-empty-state">
      <strong>没有找到这个广告活动</strong>
      <span>可以返回广告推广首页重新选择活动。</span>
      <a-button type="primary" @click="goBack">返回广告推广</a-button>
    </section>
  </div>
</template>
```

- [ ] **Step 2: Run source tests**

Run:

```bash
npm run test -- tests/storeAdvertisingSource.test.ts
```

Expected: PASS.

- [ ] **Step 3: Commit detail workbench**

Run:

```bash
git add src/components/stores/StoreAdvertisingDetailWorkbench.vue tests/storeAdvertisingSource.test.ts
git commit -m "feat: build advertising campaign detail"
```

---

### Task 5: Campaign Statistics Workbench

**Files:**
- Modify: `src/components/stores/StoreAdvertisingStatisticsWorkbench.vue`
- Verify: `tests/storeAdvertisingSource.test.ts`

- [ ] **Step 1: Replace the statistics shell with the full workbench**

Replace `src/components/stores/StoreAdvertisingStatisticsWorkbench.vue` with this content:

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { IconDownload, IconRefresh } from '@arco-design/web-vue/es/icon'
import { useRouter } from 'vue-router'
import {
  createStatisticPolylinePoints,
  findAdvertisingCampaignById,
  formatAdvertisingMoney,
  formatAdvertisingNumber,
  getCampaignStatusClass,
  getCampaignStatusLabel,
  getStatisticsMetricOptions,
  type AdvertisingStatisticsMetricKey,
} from '../../data/storeAdvertising'
import './storeAdvertising.css'

const props = defineProps<{
  campaignId: string
}>()

const router = useRouter()
const metricOptions = getStatisticsMetricOptions()
const selectedMetrics = ref<AdvertisingStatisticsMetricKey[]>(['impressions', 'clicks', 'cartAdds', 'orderedItems', 'spend'])
const chartMode = ref<'linear' | 'funnel'>('linear')
const campaign = computed(() => findAdvertisingCampaignById(props.campaignId))
const chartSeries = computed(() => campaign.value?.metricSeries ?? [])

const metricLines = computed(() =>
  metricOptions
    .filter((option) => selectedMetrics.value.includes(option.value))
    .map((option) => ({
      ...option,
      points: createStatisticPolylinePoints(chartSeries.value, option.value, 820, 320),
    }))
)

const goBack = () => {
  if (!campaign.value) {
    router.push('/stores/ads')
    return
  }

  router.push(`/stores/ads/${campaign.value.id}`)
}
</script>

<template>
  <div class="store-advertising-workbench">
    <template v-if="campaign">
      <section class="advertising-detail-header">
        <div>
          <a-button type="text" size="small" @click="goBack">返回活动详情</a-button>
          <h1>活动统计</h1>
          <div class="advertising-detail-meta">
            <strong>{{ campaign.name }}</strong>
            <span>ID {{ campaign.id }}</span>
            <span>{{ campaign.platform }}</span>
            <span>{{ campaign.storeName }}</span>
            <span>{{ campaign.campaignType }}</span>
            <span class="advertising-status-pill" :class="getCampaignStatusClass(campaign.status)">
              {{ getCampaignStatusLabel(campaign.status) }}
            </span>
          </div>
        </div>
        <div class="advertising-muted">最后的数据 {{ campaign.updatedAt }}</div>
      </section>

      <section class="advertising-stat-filter">
        <a-range-picker :model-value="['2026-05-06', '2026-05-12']" value-format="YYYY-MM-DD" />
        <a-select model-value="all" class="advertising-area-select">
          <a-option value="all">所有展示区域</a-option>
          <a-option value="search">搜索</a-option>
          <a-option value="catalog">目录</a-option>
        </a-select>
        <div class="advertising-header-actions">
          <a-button>
            <template #icon>
              <icon-refresh />
            </template>
            刷新
          </a-button>
          <a-button>
            <template #icon>
              <icon-download />
            </template>
            扩展统计
          </a-button>
        </div>
      </section>

      <section class="advertising-chart-card advertising-statistics-chart">
        <div class="advertising-chart-mode">
          <a-radio-group v-model="chartMode" type="button">
            <a-radio value="linear">线性</a-radio>
            <a-radio value="funnel">漏斗</a-radio>
          </a-radio-group>
        </div>
        <svg viewBox="0 0 820 320" role="img" aria-label="广告活动的基本统计">
          <line v-for="tick in [64, 128, 192, 256]" :key="tick" x1="0" :y1="tick" x2="820" :y2="tick" stroke="var(--color-border-2)" />
          <polyline
            v-for="line in metricLines"
            :key="line.value"
            :points="line.points"
            fill="none"
            :stroke="line.color"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <div class="advertising-metric-toggles">
          <a-checkbox-group v-model="selectedMetrics">
            <a-checkbox v-for="option in metricOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </a-checkbox>
          </a-checkbox-group>
        </div>
      </section>

      <section class="advertising-stat-table-card">
        <h2>广告活动的基本统计</h2>
        <a-table :data="campaign.products" :pagination="false" row-key="id">
          <template #columns>
            <a-table-column title="照片">
              <template #cell="{ record }">
                <img :src="record.image" :alt="record.name" class="advertising-product-image" />
              </template>
            </a-table-column>
            <a-table-column title="产品名称">
              <template #cell="{ record }">
                <div class="advertising-product-copy">
                  <strong>{{ record.sku }}</strong>
                  <span>{{ record.name }}</span>
                </div>
              </template>
            </a-table-column>
            <a-table-column title="平均排名" data-index="averageRank" />
            <a-table-column title="花费">
              <template #cell="{ record }">
                {{ formatAdvertisingMoney(record.spend, campaign.currencySymbol) }}
              </template>
            </a-table-column>
            <a-table-column title="订单金额">
              <template #cell="{ record }">
                {{ formatAdvertisingMoney(record.orderAmount, campaign.currencySymbol) }}
              </template>
            </a-table-column>
            <a-table-column title="展示次数">
              <template #cell="{ record }">
                {{ formatAdvertisingNumber(record.impressions) }}
              </template>
            </a-table-column>
            <a-table-column title="点击次数">
              <template #cell="{ record }">
                {{ formatAdvertisingNumber(record.clicks) }}
              </template>
            </a-table-column>
            <a-table-column title="添加到购物车" data-index="cartAdds" />
          </template>
        </a-table>
      </section>
    </template>

    <section v-else class="advertising-empty-state">
      <strong>没有找到这个广告活动</strong>
      <span>可以返回广告推广首页重新选择活动。</span>
      <a-button type="primary" @click="goBack">返回广告推广</a-button>
    </section>
  </div>
</template>
```

- [ ] **Step 2: Run source tests**

Run:

```bash
npm run test -- tests/storeAdvertisingSource.test.ts
```

Expected: PASS.

- [ ] **Step 3: Commit statistics workbench**

Run:

```bash
git add src/components/stores/StoreAdvertisingStatisticsWorkbench.vue src/components/stores/storeAdvertising.css tests/storeAdvertisingSource.test.ts
git commit -m "feat: build advertising statistics page"
```

---

### Task 6: Shared Advertising Styles

**Files:**
- Modify: `src/components/stores/storeAdvertising.css`

- [ ] **Step 1: Replace shared CSS with the complete style sheet**

Replace `src/components/stores/storeAdvertising.css` with this content:

```css
.store-advertising-workbench {
  --advertising-primary: rgb(var(--primary-6));
  --advertising-text: var(--color-text-1);
  --advertising-text-secondary: var(--color-text-2);
  --advertising-text-tertiary: var(--color-text-3);
  --advertising-bg: var(--color-bg-2);
  --advertising-surface: var(--color-bg-1);
  --advertising-border: var(--color-border-2);
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 16px;
}

.advertising-page-header,
.advertising-detail-header,
.advertising-section-head,
.advertising-stat-filter {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.store-advertising-workbench .header-left {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.store-advertising-workbench .page-title,
.advertising-detail-header h1 {
  margin: 0;
  color: var(--advertising-text);
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
}

.store-advertising-workbench .page-desc,
.advertising-muted {
  color: var(--advertising-text-tertiary);
  font-size: 13px;
  line-height: 20px;
}

.advertising-header-actions,
.advertising-table-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.advertising-scope-bar,
.advertising-budget-card,
.advertising-detail-statistics,
.advertising-products-card,
.advertising-stat-filter,
.advertising-chart-card,
.advertising-stat-table-card,
.advertising-empty-state {
  border: 1px solid var(--advertising-border);
  border-radius: 8px;
  background: var(--advertising-surface);
}

.advertising-scope-bar {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) minmax(220px, 260px) minmax(240px, 320px) minmax(260px, 320px);
  gap: 12px;
  align-items: center;
  padding: 14px 16px;
}

.advertising-scope-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.advertising-scope-copy span,
.advertising-detail-meta,
.advertising-product-copy span,
.advertising-store-cell span,
.advertising-product-bid span {
  color: var(--advertising-text-tertiary);
  font-size: 12px;
  line-height: 18px;
}

.advertising-scope-copy strong,
.advertising-store-cell strong,
.advertising-product-copy strong {
  overflow: hidden;
  color: var(--advertising-text);
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.advertising-scope-select,
.advertising-date-range,
.advertising-area-select {
  width: 100%;
}

.advertising-campaign-cell,
.advertising-product-main {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
}

.advertising-campaign-thumb,
.advertising-product-image {
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  border-radius: 6px;
  object-fit: cover;
}

.advertising-campaign-copy,
.advertising-store-cell,
.advertising-product-copy,
.advertising-product-bid {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
}

.advertising-link-button {
  overflow: hidden;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--advertising-primary);
  cursor: pointer;
  font: inherit;
  font-weight: 500;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.advertising-status-pill {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  line-height: 22px;
}

.advertising-status-pill.is-success {
  background: rgba(0, 180, 42, 0.12);
  color: #00b42a;
}

.advertising-status-pill.is-warning {
  background: rgba(255, 125, 0, 0.12);
  color: #ff7d00;
}

.advertising-status-pill.is-neutral {
  background: var(--color-fill-2);
  color: var(--color-text-3);
}

.advertising-status-pill.is-info {
  background: rgba(var(--primary-6), 0.12);
  color: var(--advertising-primary);
}

.advertising-danger {
  color: #f53f3f;
}

.advertising-detail-header {
  padding: 0 2px;
}

.advertising-detail-header > div:first-child {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 8px;
}

.advertising-detail-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
}

.advertising-budget-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px;
}

.advertising-budget-card > div {
  display: flex;
  min-width: 180px;
  flex-direction: column;
  gap: 6px;
}

.advertising-budget-card span,
.advertising-kpi-grid span {
  color: var(--advertising-text-tertiary);
  font-size: 13px;
  line-height: 20px;
}

.advertising-budget-card strong {
  color: var(--advertising-primary);
  font-size: 22px;
  line-height: 30px;
}

.advertising-detail-statistics,
.advertising-products-card,
.advertising-stat-table-card {
  padding: 18px 20px;
}

.advertising-section-head {
  align-items: center;
  margin-bottom: 16px;
}

.advertising-section-head h2,
.advertising-stat-table-card h2 {
  margin: 0;
  color: var(--advertising-text);
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.advertising-section-head small {
  color: var(--advertising-text-tertiary);
  font-size: 12px;
}

.advertising-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  overflow: hidden;
  margin-bottom: 16px;
  border: 1px solid var(--advertising-border);
  border-radius: 8px;
}

.advertising-kpi-grid > div {
  display: flex;
  min-height: 86px;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  padding: 0 18px;
}

.advertising-kpi-grid > div + div {
  border-left: 1px solid var(--advertising-border);
}

.advertising-kpi-grid strong {
  color: var(--advertising-text);
  font-size: 20px;
  line-height: 28px;
}

.advertising-chart-card {
  overflow: hidden;
  padding: 18px;
}

.advertising-chart-card svg {
  display: block;
  width: 100%;
  min-height: 220px;
}

.advertising-product-list {
  display: flex;
  flex-direction: column;
}

.advertising-product-row {
  border-top: 1px solid var(--advertising-border);
}

.advertising-product-main {
  padding: 14px 0;
}

.advertising-product-copy {
  flex: 1;
}

.advertising-product-bid {
  width: 150px;
  align-items: flex-end;
}

.advertising-product-bid strong {
  color: var(--advertising-text);
  font-size: 16px;
  line-height: 24px;
}

.advertising-product-expanded {
  padding: 18px 0 22px;
  border-top: 1px solid var(--advertising-border);
}

.advertising-expanded-toolbar,
.advertising-cluster-filters,
.advertising-chart-mode,
.advertising-metric-toggles {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.advertising-cluster-filters {
  margin-bottom: 14px;
}

.advertising-cluster-filters .arco-input-search {
  max-width: 280px;
}

.advertising-stat-filter {
  align-items: center;
  padding: 14px 16px;
}

.advertising-statistics-chart {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.advertising-metric-toggles {
  justify-content: flex-start;
}

.advertising-empty-state {
  display: flex;
  min-height: 260px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--advertising-text-secondary);
}

.advertising-empty-state strong {
  color: var(--advertising-text);
  font-size: 16px;
}

.advertising-create-modal {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.advertising-create-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.store-advertising-workbench :deep(.advertising-campaign-table .arco-table-td) {
  vertical-align: middle;
}

@media (max-width: 1199px) {
  .advertising-scope-bar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .advertising-kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .advertising-kpi-grid > div:nth-child(3) {
    border-left: 0;
  }
}

@media (max-width: 767px) {
  .advertising-page-header,
  .advertising-detail-header,
  .advertising-section-head,
  .advertising-stat-filter,
  .advertising-expanded-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .advertising-scope-bar,
  .advertising-kpi-grid,
  .advertising-create-grid {
    grid-template-columns: 1fr;
  }

  .advertising-kpi-grid > div + div {
    border-left: 0;
    border-top: 1px solid var(--advertising-border);
  }

  .advertising-product-main {
    flex-wrap: wrap;
  }

  .advertising-product-bid {
    width: auto;
    align-items: flex-start;
  }
}
```

- [ ] **Step 2: Run focused tests**

Run:

```bash
npm run test -- tests/storeAdvertisingData.test.ts tests/storeAdvertisingSource.test.ts
```

Expected: PASS.

- [ ] **Step 3: Commit shared styles**

Run:

```bash
git add src/components/stores/storeAdvertising.css tests/storeAdvertisingSource.test.ts
git commit -m "style: polish store advertising pages"
```

---

### Task 7: Full Verification

**Files:**
- Verify all files from previous tasks

- [ ] **Step 1: Run all tests**

Run:

```bash
npm run test
```

Expected: PASS.

- [ ] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 3: Start the dev server**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Expected: Vite prints a local URL, usually `http://127.0.0.1:5173/`.

- [ ] **Step 4: Verify the homepage in the browser**

Open:

```text
http://127.0.0.1:5173/stores/ads
```

Expected:

- Page title reads `广告推广`
- Scope bar shows `全部平台 · 全部店铺`
- Platform and store selectors are visible
- Summary strip renders eight metrics
- Campaign table includes platform and store columns
- Activity name navigates to detail
- `统计` operation navigates to statistics

- [ ] **Step 5: Verify the detail page in the browser**

Open:

```text
http://127.0.0.1:5173/stores/ads/ad-cp-1001
```

Expected:

- Page shows activity name `WB 旗舰手机 5 月搜索推广`
- Budget card shows `预算余额`
- Statistics section shows a non-empty SVG line
- Product list renders more than eight products
- Clicking a product arrow opens `搜索词集群`
- `活跃 / 不活跃 / 全部` switches the expanded cluster table
- `完整统计` navigates to `/stores/ads/ad-cp-1001/statistics`

- [ ] **Step 6: Verify the statistics page in the browser**

Open:

```text
http://127.0.0.1:5173/stores/ads/ad-cp-1001/statistics
```

Expected:

- Page title reads `活动统计`
- Date range and area selector are visible
- Chart displays multiple colored lines
- Metric checkboxes toggle line visibility
- Product statistics table renders photos and metrics

- [ ] **Step 7: Commit verification fixes if any were required**

If verification required code changes, run:

```bash
git add src tests
git commit -m "fix: verify store advertising demo"
```

Expected: commit created only when there were verification fixes.

---

## Self-Review

- Spec coverage:
  - Multi-platform and multi-store homepage: Task 1 data plus Task 3 homepage.
  - `/stores/ads`: Task 2 route plus Task 3 workbench.
  - `/stores/ads/:campaignId`: Task 2 route plus Task 4 workbench.
  - `/stores/ads/:campaignId/statistics`: Task 2 route plus Task 5 workbench.
  - Product expanded row: Task 4.
  - Metric toggles and statistics table: Task 5.
  - Tests and browser verification: Tasks 1, 2, and 7.
- Placeholder scan:
  - No unresolved planning markers or open-ended task wording remains.
- Type consistency:
  - `AdvertisingCampaign`, `AdvertisingCampaignProduct`, `AdvertisingSearchCluster`, `AdvertisingFilterState`, and `AdvertisingStatisticsMetricKey` are defined in Task 1 and reused consistently in later tasks.
  - Route names and paths match the approved design.
