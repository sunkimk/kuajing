export type AdvertisingPlatform = 'Wildberries' | 'Ozon' | 'AliExpress' | 'TikTok Shop' | 'Amazon'
export type AdvertisingCampaignStatus = 'active' | 'paused' | 'ended' | 'draft'
export type AdvertisingCampaignType = 'CPM' | 'CPC' | 'CPA' | 'Search'
export type AdvertisingBudgetStatus = 'healthy' | 'limited' | 'exhausted'
export type AdvertisingClusterState = 'active' | 'paused' | 'negative'
export type AdvertisingStatisticsMetricKey = 'impressions' | 'clicks' | 'cartAdds' | 'orderedItems' | 'spend'

export type AdvertisingClusterFilter = {
  state?: AdvertisingClusterState
  keyword: string
}

export type AdvertisingStore = {
  id: string
  platform: AdvertisingPlatform
  storeName: string
  region: string
  currencySymbol: string
}

export type AdvertisingSearchCluster = {
  id: string
  query: string
  state: AdvertisingClusterState
  impressions: number
  clicks: number
  spend: number
  orders: number
}

export type AdvertisingCampaignProduct = {
  id: string
  sku: string
  name: string
  image?: string
  searchClusters: AdvertisingSearchCluster[]
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
  platform: AdvertisingPlatform
  storeId: string
  storeName: string
  campaignName: string
  status: AdvertisingCampaignStatus
  campaignType: AdvertisingCampaignType
  budgetStatus: AdvertisingBudgetStatus
  startDate: string
  endDate: string
  budget: number
  spend: number
  impressions: number
  clicks: number
  orders: number
  currencySymbol: string
  products: AdvertisingCampaignProduct[]
  statistics: AdvertisingMetricPoint[]
}

export type AdvertisingFilterState = {
  keyword: string
  platforms: AdvertisingPlatform[]
  storeIds: string[]
  statuses: AdvertisingCampaignStatus[]
  campaignTypes: AdvertisingCampaignType[]
  budgetStatuses: AdvertisingBudgetStatus[]
  dateRange: [string, string] | []
}

export type AdvertisingSummary = {
  totalCount: number
  activeCount: number
  totalBudget: number
  totalSpend: number
  totalImpressions: number
  totalOrders: number
  averageCtr: string
  spendRatio: string
}

type Option<T extends string> = {
  label: string
  value: T
}

const statusMeta: Record<AdvertisingCampaignStatus, { label: string, tagColor: string }> = {
  active: { label: '投放中', tagColor: 'green' },
  paused: { label: '已暂停', tagColor: 'orange' },
  ended: { label: '已结束', tagColor: 'gray' },
  draft: { label: '草稿', tagColor: 'arcoblue' },
}

export const advertisingStores: AdvertisingStore[] = [
  { id: 'wb-main', platform: 'Wildberries', storeName: 'WB 旗舰店', region: 'RU', currencySymbol: '₽' },
  { id: 'wb-outlet', platform: 'Wildberries', storeName: 'WB 折扣店', region: 'RU', currencySymbol: '₽' },
  { id: 'oz-main', platform: 'Ozon', storeName: 'Ozon 主店', region: 'RU', currencySymbol: '₽' },
  { id: 'oz-kz', platform: 'Ozon', storeName: 'Ozon 哈萨克店', region: 'KZ', currencySymbol: '₸' },
  { id: 'ae-eu', platform: 'AliExpress', storeName: 'AE 欧洲店', region: 'EU', currencySymbol: '€' },
  { id: 'ae-es', platform: 'AliExpress', storeName: 'AE 西班牙店', region: 'ES', currencySymbol: '€' },
  { id: 'tt-uk', platform: 'TikTok Shop', storeName: 'TikTok 英国店', region: 'UK', currencySymbol: '£' },
  { id: 'amz-de', platform: 'Amazon', storeName: 'Amazon 德国店', region: 'DE', currencySymbol: '€' },
]

export const advertisingPlatformOptions: Array<Option<AdvertisingPlatform>> = [
  { label: 'Wildberries', value: 'Wildberries' },
  { label: 'Ozon', value: 'Ozon' },
  { label: 'AliExpress', value: 'AliExpress' },
  { label: 'TikTok Shop', value: 'TikTok Shop' },
  { label: 'Amazon', value: 'Amazon' },
]

export const campaignStatusOptions: Array<Option<AdvertisingCampaignStatus>> = [
  { label: '投放中', value: 'active' },
  { label: '已暂停', value: 'paused' },
  { label: '已结束', value: 'ended' },
  { label: '草稿', value: 'draft' },
]

export const campaignTypeOptions: Array<Option<AdvertisingCampaignType>> = [
  { label: 'CPM', value: 'CPM' },
  { label: 'CPC', value: 'CPC' },
  { label: 'CPA', value: 'CPA' },
  { label: 'Search', value: 'Search' },
]

export const budgetStatusOptions: Array<Option<AdvertisingBudgetStatus>> = [
  { label: '预算充足', value: 'healthy' },
  { label: '预算受限', value: 'limited' },
  { label: '预算耗尽', value: 'exhausted' },
]

const createClusters = (productId: string, queries: string[]): AdvertisingSearchCluster[] =>
  queries.map((query, index) => ({
    id: `${productId}-cluster-${index + 1}`,
    query,
    state: index === 2 ? 'paused' : index === 3 ? 'negative' : 'active',
    impressions: 12000 - index * 1300,
    clicks: 620 - index * 52,
    spend: 1800 - index * 140,
    orders: 45 - index * 4,
  }))

const createProductPhotoDataUrl = (accent: string, bg: string, productMarkup: string) => {
  const svg = `
    <svg class="product-photo" xmlns="http://www.w3.org/2000/svg" width="112" height="112" viewBox="0 0 112 112">
      <rect width="112" height="112" rx="18" fill="${bg}"/>
      <ellipse cx="56" cy="91" rx="34" ry="8" fill="#1d2129" opacity="0.08"/>
      <rect x="14" y="12" width="84" height="84" rx="18" fill="#fff" opacity="0.72"/>
      <rect x="18" y="16" width="76" height="76" rx="16" fill="#fff" opacity="0.86"/>
      <circle cx="88" cy="24" r="8" fill="${accent}" opacity="0.12"/>
      ${productMarkup}
    </svg>
  `

  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const productSampleImages = [
  createProductPhotoDataUrl('#2563eb', '#eef5ff', `
    <rect x="38" y="20" width="36" height="70" rx="11" fill="#1d2129"/>
    <rect x="42" y="27" width="28" height="54" rx="6" fill="#f8fbff"/>
    <rect x="47" y="34" width="18" height="3" rx="1.5" fill="#93c5fd"/>
    <circle cx="56" cy="78" r="2.4" fill="#2563eb"/>
    <rect x="36" y="18" width="40" height="74" rx="13" fill="none" stroke="#60a5fa" stroke-width="3" opacity="0.9"/>
  `),
  createProductPhotoDataUrl('#10b981', '#eefcf6', `
    <path d="M30 34c10-10 32-10 42 0" fill="none" stroke="#10b981" stroke-width="6" stroke-linecap="round"/>
    <path d="M35 42c11-9 31-9 42 1" fill="none" stroke="#34d399" stroke-width="5" stroke-linecap="round"/>
    <rect x="20" y="61" width="18" height="12" rx="4" fill="#064e3b"/>
    <rect x="74" y="52" width="18" height="12" rx="4" fill="#064e3b"/>
    <rect x="24" y="64" width="9" height="3" rx="1.5" fill="#d1fae5"/>
    <rect x="78" y="55" width="9" height="3" rx="1.5" fill="#d1fae5"/>
  `),
  createProductPhotoDataUrl('#f97316', '#fff7ed', `
    <path d="M38 22h36l6 16-8 49H40l-8-49 6-16Z" fill="#fb923c"/>
    <path d="M43 31h26l4 9-5 39H45l-5-39 3-9Z" fill="#fed7aa"/>
    <path d="M44 48h25" stroke="#ea580c" stroke-width="4" stroke-linecap="round"/>
    <path d="M47 58h19" stroke="#fff7ed" stroke-width="4" stroke-linecap="round"/>
  `),
  createProductPhotoDataUrl('#8b5cf6', '#f6f3ff', `
    <rect x="28" y="27" width="56" height="35" rx="10" fill="#6d28d9"/>
    <rect x="34" y="33" width="44" height="22" rx="5" fill="#ddd6fe"/>
    <rect x="45" y="67" width="22" height="8" rx="4" fill="#8b5cf6"/>
    <path d="M38 81h36" stroke="#6d28d9" stroke-width="6" stroke-linecap="round"/>
    <path d="M56 62v17" stroke="#6d28d9" stroke-width="6" stroke-linecap="round"/>
  `),
  createProductPhotoDataUrl('#0ea5e9', '#eef9ff', `
    <rect x="34" y="28" width="44" height="54" rx="10" fill="#0f172a"/>
    <rect x="39" y="34" width="34" height="32" rx="6" fill="#e0f2fe"/>
    <path d="M44 72h24" stroke="#38bdf8" stroke-width="5" stroke-linecap="round"/>
    <circle cx="68" cy="42" r="3" fill="#0ea5e9"/>
    <rect x="28" y="23" width="56" height="64" rx="14" fill="none" stroke="#bae6fd" stroke-width="4"/>
  `),
  createProductPhotoDataUrl('#64748b', '#f8fafc', `
    <rect x="30" y="24" width="52" height="64" rx="8" fill="#e5e7eb"/>
    <rect x="36" y="31" width="40" height="50" rx="5" fill="#fff"/>
    <path d="M40 38h32" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"/>
    <path d="M40 49h24" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round"/>
    <rect x="42" y="60" width="28" height="13" rx="3" fill="#dbeafe"/>
  `),
  createProductPhotoDataUrl('#ef4444', '#fff1f2', `
    <rect x="32" y="39" width="48" height="25" rx="8" fill="#111827"/>
    <circle cx="43" cy="51" r="11" fill="#ef4444"/>
    <circle cx="69" cy="51" r="11" fill="#ef4444"/>
    <path d="M41 66h30v13H41z" fill="#374151"/>
    <path d="M48 79h16" stroke="#111827" stroke-width="5" stroke-linecap="round"/>
    <rect x="38" y="44" width="10" height="4" rx="2" fill="#fecaca"/>
    <rect x="64" y="44" width="10" height="4" rx="2" fill="#fecaca"/>
  `),
  createProductPhotoDataUrl('#7c3aed', '#f5f3ff', `
    <rect x="35" y="21" width="42" height="64" rx="9" fill="#f9fafb" stroke="#c4b5fd" stroke-width="3"/>
    <rect x="42" y="28" width="28" height="13" rx="4" fill="#ede9fe"/>
    <circle cx="46" cy="58" r="7" fill="#7c3aed"/>
    <circle cx="66" cy="58" r="7" fill="#7c3aed"/>
    <path d="M46 58h20" stroke="#7c3aed" stroke-width="5" stroke-linecap="round"/>
    <path d="M43 74h26" stroke="#ddd6fe" stroke-width="4" stroke-linecap="round"/>
  `),
]

const flagshipProducts: AdvertisingCampaignProduct[] = [
  {
    id: 'wb-ip15-case',
    sku: 'WB-IP15-CASE',
    name: 'iPhone 15 透明防摔壳',
    image: productSampleImages[0],
    searchClusters: createClusters('wb-ip15-case', [
      'iphone 15 case',
      'iphone clear case',
      'iphone 15 pro case',
      'iphone premium cover',
    ]),
  },
  {
    id: 'wb-usbc-cable',
    sku: 'WB-USBC-100',
    name: '快充 USB-C 数据线',
    image: productSampleImages[1],
    searchClusters: createClusters('wb-usbc-cable', ['type c cable', 'fast charge cable']),
  },
  {
    id: 'wb-watch-band',
    sku: 'WB-WATCH-BAND',
    name: '智能手表硅胶表带',
    image: productSampleImages[2],
    searchClusters: createClusters('wb-watch-band', ['watch band', 'smart watch strap']),
  },
  {
    id: 'wb-airbuds',
    sku: 'WB-AIRBUDS',
    name: '蓝牙耳机收纳套',
    image: productSampleImages[3],
    searchClusters: createClusters('wb-airbuds', ['earbuds case', 'wireless earphone cover']),
  },
  {
    id: 'wb-powerbank',
    sku: 'WB-PB-20K',
    name: '20000mAh 移动电源',
    image: productSampleImages[4],
    searchClusters: createClusters('wb-powerbank', ['power bank', 'portable charger']),
  },
  {
    id: 'wb-screen',
    sku: 'WB-SCREEN-IP',
    name: '高清钢化膜',
    image: productSampleImages[5],
    searchClusters: createClusters('wb-screen', ['screen protector', 'tempered glass']),
  },
  {
    id: 'wb-car-holder',
    sku: 'WB-CAR-HOLDER',
    name: '车载磁吸支架',
    image: productSampleImages[6],
    searchClusters: createClusters('wb-car-holder', ['car phone holder', 'magnetic holder']),
  },
  {
    id: 'wb-charger',
    sku: 'WB-GAN-65',
    name: '65W GaN 充电器',
    image: productSampleImages[7],
    searchClusters: createClusters('wb-charger', ['gan charger', '65w charger']),
  },
]

const createStatistics = (base: number, spendBase: number): AdvertisingMetricPoint[] => {
  const impressionWave = [0.78, 0.86, 1.12, 0.94, 1.08, 1.25, 1.03]
  const clickWave = [0.84, 0.9, 1.04, 0.72, 0.88, 1.18, 0.97]
  const cartWave = [0.72, 0.82, 0.76, 0.64, 0.74, 0.98, 0.88]
  const orderWave = [0.66, 0.74, 0.68, 0.56, 0.63, 0.82, 0.77]
  const spendWave = [0.88, 0.84, 0.79, 0.93, 1.02, 0.97, 1.11]

  return Array.from({ length: 7 }, (_, index) => ({
    date: `2026-05-${String(6 + index).padStart(2, '0')}`,
    impressions: Math.round(base * impressionWave[index]),
    clicks: Math.round(base * 0.058 * clickWave[index]),
    cartAdds: Math.round(base * 0.008 * cartWave[index]),
    orderedItems: Math.round(base * 0.003 * orderWave[index]),
    spend: Math.round(spendBase * spendWave[index]),
  }))
}

const getRotatedCampaignProducts = (id: string) => {
  const numericId = Number(id.match(/\d+$/)?.[0] ?? 0)
  const offset = numericId % flagshipProducts.length
  return [...flagshipProducts.slice(offset), ...flagshipProducts.slice(0, offset)].slice(0, 2)
}

const createCampaign = (
  id: string,
  storeId: string,
  campaignName: string,
  status: AdvertisingCampaignStatus,
  campaignType: AdvertisingCampaignType,
  budgetStatus: AdvertisingBudgetStatus,
  startDate: string,
  endDate: string,
  budget: number,
  spend: number,
  impressions: number,
  clicks: number,
  orders: number,
  products?: AdvertisingCampaignProduct[]
): AdvertisingCampaign => {
  const store = advertisingStores.find((item) => item.id === storeId) ?? advertisingStores[0]
  const campaignProducts = products ?? getRotatedCampaignProducts(id)

  return {
    id,
    platform: store.platform,
    storeId: store.id,
    storeName: store.storeName,
    campaignName,
    status,
    campaignType,
    budgetStatus,
    startDate,
    endDate,
    budget,
    spend,
    impressions,
    clicks,
    orders,
    currencySymbol: store.currencySymbol,
    products: campaignProducts,
    statistics: createStatistics(Math.round(impressions / 12), Math.round(spend / 12)),
  }
}

const campaignSeeds: AdvertisingCampaign[] = [
  createCampaign(
    'ad-cp-1001',
    'wb-main',
    'WB 旗舰爆品 CPM 拉新',
    'active',
    'CPM',
    'healthy',
    '2026-05-01',
    '2026-05-18',
    120000,
    68420,
    1460000,
    84200,
    3960,
    flagshipProducts
  ),
  createCampaign('ad-cp-1002', 'wb-outlet', 'WB 清仓 CPC 转化', 'paused', 'CPC', 'limited', '2026-05-03', '2026-05-14', 72000, 38940, 820000, 49200, 1840),
  createCampaign('ad-cp-1003', 'oz-main', 'Ozon 手机配件搜索', 'active', 'Search', 'healthy', '2026-05-02', '2026-05-16', 98000, 55210, 920000, 61100, 2430),
  createCampaign('ad-cp-1004', 'oz-kz', 'Ozon 哈萨克周末 CPA', 'ended', 'CPA', 'exhausted', '2026-04-20', '2026-05-08', 4200000, 4175000, 610000, 31800, 1280),
  createCampaign('ad-cp-1005', 'ae-eu', 'AE 欧洲夏季新品', 'active', 'CPC', 'healthy', '2026-05-05', '2026-05-22', 54000, 21900, 390000, 20700, 920),
  createCampaign('ad-cp-1006', 'ae-es', 'AE 西语站搜索增长', 'paused', 'Search', 'limited', '2026-05-08', '2026-05-28', 38000, 12600, 260000, 15100, 610),
  createCampaign('ad-cp-1007', 'tt-uk', 'TikTok 英区短视频引流', 'active', 'CPM', 'healthy', '2026-05-04', '2026-05-20', 31000, 16750, 740000, 45200, 1720),
  createCampaign('ad-cp-1008', 'amz-de', 'Amazon DE 搜索守位', 'active', 'Search', 'limited', '2026-05-06', '2026-05-24', 64000, 40120, 480000, 26700, 1340),
  createCampaign('ad-cp-1009', 'wb-main', 'WB 老客复购 CPC', 'ended', 'CPC', 'healthy', '2026-04-12', '2026-05-05', 56000, 49800, 510000, 35200, 1560),
  createCampaign('ad-cp-1010', 'oz-main', 'Ozon 家居品类 CPM', 'draft', 'CPM', 'healthy', '2026-05-15', '2026-05-30', 86000, 0, 0, 0, 0),
  createCampaign('ad-cp-1011', 'ae-eu', 'AE 会员日 CPA', 'active', 'CPA', 'healthy', '2026-05-01', '2026-05-13', 47000, 28500, 340000, 19800, 980),
  createCampaign('ad-cp-1012', 'amz-de', 'Amazon 德国配件 CPM', 'paused', 'CPM', 'limited', '2026-05-10', '2026-05-27', 52000, 23100, 310000, 17000, 740),
]

export const createDefaultAdvertisingFilters = (): AdvertisingFilterState => ({
  keyword: '',
  platforms: [],
  storeIds: [],
  statuses: [],
  campaignTypes: [],
  budgetStatuses: [],
  dateRange: [],
})

export const createAdvertisingCampaignRows = (): AdvertisingCampaign[] =>
  campaignSeeds.map((campaign) => ({
    ...campaign,
    products: campaign.products.map((product) => ({
      ...product,
      searchClusters: product.searchClusters.map((cluster) => ({ ...cluster })),
    })),
    statistics: campaign.statistics.map((point) => ({ ...point })),
  }))

export const getAdvertisingStoreOptions = (platforms: AdvertisingPlatform[] = []) =>
  advertisingStores
    .filter((store) => platforms.length === 0 || platforms.includes(store.platform))
    .map((store) => ({
      label: store.storeName,
      value: store.id,
    }))

export const getCampaignStatusLabel = (status: AdvertisingCampaignStatus | string) =>
  statusMeta[status as AdvertisingCampaignStatus]?.label ?? status

export const getCampaignStatusTagColor = (status: AdvertisingCampaignStatus | string) =>
  statusMeta[status as AdvertisingCampaignStatus]?.tagColor ?? 'gray'

export const formatAdvertisingMoney = (value: number, currencySymbol = '¥') =>
  `${currencySymbol}${value.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}`

export const formatAdvertisingNumber = (value: number) =>
  value.toLocaleString('zh-CN')

const overlapsDateRange = (campaign: AdvertisingCampaign, dateRange: [string, string] | []) => {
  if (dateRange.length !== 2) return true

  const [rangeStart, rangeEnd] = dateRange
  return campaign.startDate <= rangeEnd && campaign.endDate >= rangeStart
}

const matchesKeyword = (campaign: AdvertisingCampaign, keyword: string) => {
  const normalizedKeyword = keyword.trim().toLowerCase()
  if (!normalizedKeyword) return true

  return [
    campaign.id,
    campaign.campaignName,
    campaign.storeName,
    campaign.platform,
    ...campaign.products.flatMap((product) => [
      product.name,
      product.sku,
      ...product.searchClusters.map((cluster) => cluster.query),
    ]),
  ].some((field) => field.toLowerCase().includes(normalizedKeyword))
}

export const filterAdvertisingCampaigns = (rows: AdvertisingCampaign[], filters: AdvertisingFilterState) =>
  rows.filter((row) =>
    matchesKeyword(row, filters.keyword) &&
    (filters.platforms.length === 0 || filters.platforms.includes(row.platform)) &&
    (filters.storeIds.length === 0 || filters.storeIds.includes(row.storeId)) &&
    (filters.statuses.length === 0 || filters.statuses.includes(row.status)) &&
    (filters.campaignTypes.length === 0 || filters.campaignTypes.includes(row.campaignType)) &&
    (filters.budgetStatuses.length === 0 || filters.budgetStatuses.includes(row.budgetStatus)) &&
    overlapsDateRange(row, filters.dateRange)
  )

const formatPercent = (value: number) =>
  `${value.toFixed(1)}%`

export const calculateAdvertisingSummary = (rows: AdvertisingCampaign[]): AdvertisingSummary => {
  const totalBudget = rows.reduce((sum, row) => sum + row.budget, 0)
  const totalSpend = rows.reduce((sum, row) => sum + row.spend, 0)
  const totalImpressions = rows.reduce((sum, row) => sum + row.impressions, 0)
  const totalClicks = rows.reduce((sum, row) => sum + row.clicks, 0)
  const totalOrders = rows.reduce((sum, row) => sum + row.orders, 0)

  return {
    totalCount: rows.length,
    activeCount: rows.filter((row) => row.status === 'active').length,
    totalBudget,
    totalSpend,
    totalImpressions,
    totalOrders,
    averageCtr: formatPercent(totalImpressions > 0 ? totalClicks / totalImpressions * 100 : 0),
    spendRatio: formatPercent(totalBudget > 0 ? totalSpend / totalBudget * 100 : 0),
  }
}

export const createAdvertisingSummaryCards = (rows: AdvertisingCampaign[]) => {
  const summary = calculateAdvertisingSummary(rows)

  return [
    { label: '广告计划', value: String(summary.totalCount), note: `${summary.activeCount} 个投放中` },
    { label: '总花费', value: formatAdvertisingMoney(summary.totalSpend), note: `预算使用 ${summary.spendRatio}` },
    { label: '曝光量', value: formatAdvertisingNumber(summary.totalImpressions), note: `CTR ${summary.averageCtr}` },
    { label: '订单量', value: formatAdvertisingNumber(summary.totalOrders), note: '广告归因订单' },
  ]
}

export const findAdvertisingCampaignById = (id: string) =>
  createAdvertisingCampaignRows().find((campaign) => campaign.id === id)

export const resolveAdvertisingScopeLabel = (platforms: AdvertisingPlatform[], storeIds: string[]) => {
  const platformLabel = platforms.length > 0 ? platforms.join(' + ') : '全部平台'
  const storeLabel = storeIds.length > 0 ? `${storeIds.length} 家店铺` : '全部店铺'

  return `${platformLabel} · ${storeLabel}`
}

export const filterAdvertisingProductClusters = (
  clusters: AdvertisingSearchCluster[],
  filter: AdvertisingClusterFilter
) => {
  const keyword = filter.keyword.trim().toLowerCase()

  return clusters.filter((cluster) =>
    (!filter.state || cluster.state === filter.state) &&
    (!keyword || cluster.query.toLowerCase().includes(keyword))
  )
}

export const getStatisticsMetricOptions = (): Array<Option<AdvertisingStatisticsMetricKey>> => [
  { label: '曝光量', value: 'impressions' },
  { label: '点击量', value: 'clicks' },
  { label: '加购量', value: 'cartAdds' },
  { label: '成交件数', value: 'orderedItems' },
  { label: '花费', value: 'spend' },
]

export const createStatisticPolylinePoints = (
  series: AdvertisingMetricPoint[],
  metric: AdvertisingStatisticsMetricKey,
  width: number,
  height: number
) => {
  if (series.length === 0) return ''

  const values = series.map((point) => point[metric])
  const maxValue = Math.max(...values)
  const minValue = Math.min(...values)
  const range = maxValue - minValue
  const xStep = series.length > 1 ? width / (series.length - 1) : 0

  return values.map((value, index) => {
    const x = Math.round(index * xStep)
    const y = range === 0 ? Math.round(height / 2) : Math.round(height - (value - minValue) / range * height)

    return `${x},${y}`
  }).join(' ')
}
