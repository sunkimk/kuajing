export type StoreAuthorizationStatus = 'active' | 'expired' | 'pending'
export type StoreSyncStatus = 'healthy' | 'warning' | 'failed'
export type StoreIssueType = 'auth-expired' | 'api-missing' | 'sync-failed' | 'sync-overdue'

export type StoreRecord = {
  id: string
  platform: string
  storeName: string
  storeCode: string
  authorizationStatus: StoreAuthorizationStatus
  syncStatus: StoreSyncStatus
  issueType?: StoreIssueType
  region: string
  lastSyncAt: string
  sevenDayOrders: number
  owner: string
  businessType: string
  storeType: string
  legalName: string
  accountBalance: number
  taxNumber: string
  currencySymbol: string
}

export type StoreFilterState = {
  keyword: string
  platform?: string
  authorizationStatus?: StoreAuthorizationStatus
  syncStatus?: StoreSyncStatus
  issueType?: StoreIssueType
}

export type StorePagination = {
  page: number
  pageSize: number
}

type StoreStatusMeta = {
  label: string
}

type StoreIssueMeta = {
  label: string
  note: string
}

const authorizationStatusMeta: Record<StoreAuthorizationStatus, StoreStatusMeta> = {
  active: { label: '有效' },
  expired: { label: '失效' },
  pending: { label: '待审' },
}

const syncStatusMeta: Record<StoreSyncStatus, StoreStatusMeta> = {
  healthy: { label: '正常' },
  warning: { label: '预警' },
  failed: { label: '失败' },
}

const issueTypeMeta: Record<StoreIssueType, StoreIssueMeta> = {
  'auth-expired': { label: '授权失效', note: '需重新授权' },
  'api-missing': { label: 'API 配置缺失', note: '影响同步' },
  'sync-failed': { label: '最近同步失败', note: '待处理' },
  'sync-overdue': { label: '超时未同步', note: '超过阈值' },
}

export const createDefaultStoreFilters = (): StoreFilterState => ({
  keyword: '',
  platform: undefined,
  authorizationStatus: undefined,
  syncStatus: undefined,
  issueType: undefined,
})

export const getStoreAuthorizationStatusLabel = (status: StoreAuthorizationStatus | string) =>
  authorizationStatusMeta[status as StoreAuthorizationStatus]?.label ?? status

export const getStoreSyncStatusLabel = (status: StoreSyncStatus | string) =>
  syncStatusMeta[status as StoreSyncStatus]?.label ?? status

export const getStoreIssueTypeLabel = (issueType: StoreIssueType | string) =>
  issueTypeMeta[issueType as StoreIssueType]?.label ?? issueType

export const getStoreIssueTypeNote = (issueType: StoreIssueType | string) =>
  issueTypeMeta[issueType as StoreIssueType]?.note ?? ''

export const formatStoreBalance = (row: Pick<StoreRecord, 'accountBalance' | 'currencySymbol'>) =>
  `${row.accountBalance.toLocaleString('zh-CN')} ${row.currencySymbol}`

const isHealthyStore = (row: StoreRecord) =>
  row.authorizationStatus === 'active' && row.syncStatus === 'healthy'

const hasAuthIssue = (row: StoreRecord) =>
  row.authorizationStatus !== 'active' || row.issueType === 'auth-expired'

const hasSyncIssue = (row: StoreRecord) =>
  row.syncStatus !== 'healthy'

export const calculateStoreStats = (rows: StoreRecord[]) => ({
  totalStores: rows.length,
  healthyStores: rows.filter(isHealthyStore).length,
  authIssueStores: rows.filter(hasAuthIssue).length,
  syncIssueStores: rows.filter(hasSyncIssue).length,
})

export const createStoreSummaryCards = (rows: StoreRecord[]) => {
  const stats = calculateStoreStats(rows)

  return [
    { label: '已接入店铺', value: String(stats.totalStores), note: '全部店铺' },
    { label: '正常运行', value: String(stats.healthyStores), note: '授权和同步正常' },
    { label: '授权异常', value: String(stats.authIssueStores), note: '待重新授权' },
    { label: '同步异常', value: String(stats.syncIssueStores), note: '待处理' },
  ]
}

export const createStoreIssueCards = (rows: StoreRecord[]) =>
  (Object.keys(issueTypeMeta) as StoreIssueType[]).map((key) => ({
    key,
    label: issueTypeMeta[key].label,
    value: rows.filter((row) => row.issueType === key).length,
    note: issueTypeMeta[key].note,
  }))

export const filterStoreRows = (rows: StoreRecord[], filters: StoreFilterState) => {
  let nextRows = [...rows]
  const keyword = filters.keyword.trim().toLowerCase()

  if (keyword) {
    nextRows = nextRows.filter((row) =>
      [
        row.platform,
        row.storeName,
        row.storeCode,
        row.region,
        row.owner,
        row.legalName,
        row.businessType,
        row.storeType,
        row.taxNumber,
      ].some((field) =>
        field.toLowerCase().includes(keyword)
      )
    )
  }

  if (filters.platform) nextRows = nextRows.filter((row) => row.platform === filters.platform)
  if (filters.authorizationStatus) {
    nextRows = nextRows.filter((row) => row.authorizationStatus === filters.authorizationStatus)
  }
  if (filters.syncStatus) nextRows = nextRows.filter((row) => row.syncStatus === filters.syncStatus)
  if (filters.issueType) nextRows = nextRows.filter((row) => row.issueType === filters.issueType)

  return nextRows
}

export const paginateStoreRows = (rows: StoreRecord[], pagination: StorePagination) => {
  const start = (pagination.page - 1) * pagination.pageSize
  return rows.slice(start, start + pagination.pageSize)
}

const storeSeeds: Array<Omit<StoreRecord, 'id'>> = [
  {
    platform: 'Wildberries',
    storeName: 'WB 旗舰店',
    storeCode: 'WB-001',
    authorizationStatus: 'active',
    syncStatus: 'healthy',
    issueType: undefined,
    region: 'RU',
    lastSyncAt: '2026-05-04 09:30',
    sevenDayOrders: 48,
    owner: 'Alice',
    businessType: '百货',
    storeType: '跨境店',
    legalName: '沃莓国际有限公司',
    accountBalance: 287592,
    taxNumber: '78644060',
    currencySymbol: '¥',
  },
  {
    platform: 'Ozon',
    storeName: 'OZON 主店',
    storeCode: 'OZ-002',
    authorizationStatus: 'expired',
    syncStatus: 'failed',
    issueType: 'auth-expired',
    region: 'KZ',
    lastSyncAt: '2026-05-03 18:20',
    sevenDayOrders: 12,
    owner: 'Bob',
    businessType: '电子消费',
    storeType: '本土店',
    legalName: '欧仓贸易有限公司',
    accountBalance: 84210,
    taxNumber: '99021041',
    currencySymbol: '¥',
  },
  {
    platform: 'AliExpress',
    storeName: 'AE 海外店',
    storeCode: 'AE-003',
    authorizationStatus: 'active',
    syncStatus: 'warning',
    issueType: 'sync-overdue',
    region: 'EU',
    lastSyncAt: '2026-05-03 08:10',
    sevenDayOrders: 26,
    owner: 'Cindy',
    businessType: '百货',
    storeType: '跨境店',
    legalName: '达焱国际有限公司',
    accountBalance: 162880,
    taxNumber: '78644060',
    currencySymbol: '¥',
  },
  {
    platform: 'TikTok Shop',
    storeName: 'TT 英国店',
    storeCode: 'TT-004',
    authorizationStatus: 'pending',
    syncStatus: 'warning',
    issueType: 'api-missing',
    region: 'UK',
    lastSyncAt: '2026-05-02 14:05',
    sevenDayOrders: 8,
    owner: 'Dylan',
    businessType: '美妆个护',
    storeType: '跨境店',
    legalName: '英仓优选有限公司',
    accountBalance: 52190,
    taxNumber: '44091827',
    currencySymbol: '¥',
  },
  {
    platform: 'Amazon',
    storeName: 'AMZ 德国店',
    storeCode: 'AM-005',
    authorizationStatus: 'active',
    syncStatus: 'failed',
    issueType: 'sync-failed',
    region: 'DE',
    lastSyncAt: '2026-05-01 21:45',
    sevenDayOrders: 31,
    owner: 'Eva',
    businessType: '家居百货',
    storeType: '本土店',
    legalName: '莱茵商贸有限公司',
    accountBalance: 241360,
    taxNumber: 'DE93844120',
    currencySymbol: '¥',
  },
  {
    platform: 'Temu',
    storeName: 'Temu 西语店',
    storeCode: 'TM-006',
    authorizationStatus: 'active',
    syncStatus: 'healthy',
    issueType: undefined,
    region: 'ES',
    lastSyncAt: '2026-05-04 07:15',
    sevenDayOrders: 19,
    owner: 'Frank',
    businessType: '服饰配件',
    storeType: '跨境店',
    legalName: '伊比利亚优选有限公司',
    accountBalance: 73480,
    taxNumber: 'ES20481677',
    currencySymbol: '¥',
  },
]

export const createStoreRows = (count = storeSeeds.length): StoreRecord[] =>
  Array.from({ length: count }, (_, index) => {
    const seed = storeSeeds[index % storeSeeds.length]
    const cycle = Math.floor(index / storeSeeds.length)

    return {
      id: String(index + 1),
      ...seed,
      storeCode: `${seed.storeCode}${cycle > 0 ? `-${cycle + 1}` : ''}`,
      lastSyncAt: seed.lastSyncAt,
      sevenDayOrders: seed.sevenDayOrders + cycle * 4,
    }
  })
