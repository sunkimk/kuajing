import { describe, expect, it } from 'vitest'
import {
  calculateStoreStats,
  createStoreRows,
  createStoreIssueCards,
  filterStoreRows,
  formatStoreBalance,
  paginateStoreRows,
  type StoreRecord,
} from '../src/data/storeManagement'

const rows: StoreRecord[] = [
  {
    id: '1',
    platform: 'Wildberries',
    storeName: 'WB 旗舰店',
    storeCode: 'WB-001',
    authorizationStatus: 'active',
    syncStatus: 'healthy',
    issueType: undefined,
    region: 'RU',
    lastSyncAt: '2026-05-03 11:00',
    sevenDayOrders: 18,
    owner: 'Alice',
    businessType: '百货',
    storeType: '跨境店',
    legalName: '沃莓国际有限公司',
    accountBalance: 287592,
    taxNumber: '78644060',
    currencySymbol: '¥',
  },
  {
    id: '2',
    platform: 'Ozon',
    storeName: 'OZON 店铺',
    storeCode: 'OZ-002',
    authorizationStatus: 'expired',
    syncStatus: 'failed',
    issueType: 'auth-expired',
    region: 'KZ',
    lastSyncAt: '2026-05-03 08:00',
    sevenDayOrders: 5,
    owner: 'Bob',
    businessType: '电子消费',
    storeType: '本土店',
    legalName: 'Ozon Eurasia LLP',
    accountBalance: 84210,
    taxNumber: '99021041',
    currencySymbol: '¥',
  },
  {
    id: '3',
    platform: 'AliExpress',
    storeName: 'AE 店铺',
    storeCode: 'AE-003',
    authorizationStatus: 'active',
    syncStatus: 'warning',
    issueType: 'sync-overdue',
    region: 'EU',
    lastSyncAt: '2026-05-02 09:00',
    sevenDayOrders: 9,
    owner: 'Cindy',
    businessType: '百货',
    storeType: '跨境店',
    legalName: '达焱国际有限公司',
    accountBalance: 162880,
    taxNumber: '78644060',
    currencySymbol: '¥',
  },
]

describe('storeManagement helpers', () => {
  it('summarizes the homepage health strip', () => {
    expect(calculateStoreStats(rows)).toEqual({
      totalStores: 3,
      healthyStores: 1,
      authIssueStores: 1,
      syncIssueStores: 2,
    })
  })

  it('counts non-healthy sync states in the summary strip even when issue buckets are empty', () => {
    expect(calculateStoreStats([
      {
        ...rows[0],
        syncStatus: 'failed',
        issueType: undefined,
      },
    ])).toEqual({
      totalStores: 1,
      healthyStores: 0,
      authIssueStores: 0,
      syncIssueStores: 1,
    })
  })

  it('builds issueType-driven buckets for the action panel', () => {
    expect(createStoreIssueCards(rows)).toEqual([
      { key: 'auth-expired', label: '授权失效', value: 1, note: '需重新授权' },
      { key: 'api-missing', label: 'API 配置缺失', value: 0, note: '影响同步' },
      { key: 'sync-failed', label: '最近同步失败', value: 0, note: '待处理' },
      { key: 'sync-overdue', label: '超时未同步', value: 1, note: '超过阈值' },
    ])
  })

  it('treats issueType as the bucket key even when sync status would suggest a different issue', () => {
    expect(createStoreIssueCards([
      {
        ...rows[0],
        syncStatus: 'failed',
        issueType: undefined,
      },
      {
        ...rows[1],
        syncStatus: 'healthy',
        issueType: 'sync-failed',
      },
    ])).toEqual([
      { key: 'auth-expired', label: '授权失效', value: 0, note: '需重新授权' },
      { key: 'api-missing', label: 'API 配置缺失', value: 0, note: '影响同步' },
      { key: 'sync-failed', label: '最近同步失败', value: 1, note: '待处理' },
      { key: 'sync-overdue', label: '超时未同步', value: 0, note: '超过阈值' },
    ])
  })

  it('filters store rows by keyword', () => {
    expect(filterStoreRows(rows, {
      keyword: 'oz-002',
      platform: undefined,
      authorizationStatus: undefined,
      syncStatus: undefined,
      issueType: undefined,
    }).map((row) => row.id)).toEqual(['2'])
  })

  it('filters store rows by platform, authorization status, sync status, and issue type', () => {
    expect(filterStoreRows(rows, {
      keyword: '',
      platform: 'Ozon',
      authorizationStatus: 'expired',
      syncStatus: 'failed',
      issueType: 'auth-expired',
    }).map((row) => row.id)).toEqual(['2'])
  })

  it('paginates store rows by page', () => {
    expect(paginateStoreRows(rows, { page: 2, pageSize: 2 }).map((row) => row.id)).toEqual(['3'])
  })

  it('exposes store financial and compliance fields for list cards', () => {
    const [store] = createStoreRows(1)

    expect(store).toMatchObject({
      legalName: expect.any(String),
      businessType: expect.any(String),
      storeType: expect.any(String),
      accountBalance: expect.any(Number),
      taxNumber: expect.any(String),
      currencySymbol: '¥',
    })
    expect(formatStoreBalance(store)).toMatch(/¥$/)
  })
})
