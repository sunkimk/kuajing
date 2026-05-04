import { describe, expect, it } from 'vitest'
import {
  calculateSalesOrderStats,
  createSalesOrderSummaryCards,
  filterSalesOrders,
  getSalesOrderStatusClass,
  getSalesOrderStatusLabel,
  paginateSalesOrders,
  type SalesOrderRow,
} from '../src/data/salesOrders'
import { getSalesProductImage } from '../src/data/salesProductMedia'

const rows: SalesOrderRow[] = [
  {
    id: '1',
    orderNo: 'SO-1001',
    assemblyId: 'ASM-7001',
    productName: '磁吸充电支架',
    productImage: getSalesProductImage('CHARGE-01'),
    sku: 'CHARGE-01',
    shopId: 'shop-ru',
    shopName: '俄罗斯旗舰店',
    shopSite: 'Ozon RU',
    warehouseName: '莫斯科中转仓',
    fulfillmentType: 'FBS',
    deliveryMethod: '平台物流',
    status: 'pending-pick',
    orderTime: '2026-04-28 09:30',
    syncTime: '2026-04-28 09:45',
    syncState: 'normal',
    quantity: 2,
    salePrice: 2590,
    totalCost: 1730,
    estimatedProfit: 860,
    profitRate: 0.332,
    customerName: 'Ivan Petrov',
    logisticsNumber: 'TRK-RU-001',
    costBreakdown: [{ label: '采购成本', value: 1200 }],
    timeline: [{ label: '待拣货', time: '2026-04-28 09:45', note: '仓库待处理', tone: 'warning' }],
  },
  {
    id: '2',
    orderNo: 'SO-1002',
    assemblyId: 'ASM-7002',
    productName: '折叠旅行水壶',
    productImage: getSalesProductImage('KETTLE-02'),
    sku: 'KETTLE-02',
    shopId: 'shop-kz',
    shopName: '哈萨克斯坦店',
    shopSite: 'Wildberries KZ',
    warehouseName: '阿拉木图前置仓',
    fulfillmentType: 'FBW',
    deliveryMethod: '海外仓派送',
    status: 'pending-sync',
    orderTime: '2026-04-27 18:20',
    syncTime: '2026-04-27 18:45',
    syncState: 'exception',
    quantity: 1,
    salePrice: 1990,
    totalCost: 1210,
    estimatedProfit: 780,
    profitRate: 0.392,
    customerName: 'Arman S.',
    logisticsNumber: 'TRK-KZ-002',
    costBreakdown: [{ label: '采购成本', value: 930 }],
    timeline: [{ label: '同步异常', time: '2026-04-27 18:45', note: '平台状态未回写', tone: 'danger' }],
  },
  {
    id: '3',
    orderNo: 'SO-1003',
    assemblyId: 'ASM-7003',
    productName: '便携露营灯',
    productImage: getSalesProductImage('LAMP-03'),
    sku: 'LAMP-03',
    shopId: 'shop-ru',
    shopName: '俄罗斯旗舰店',
    shopSite: 'Ozon RU',
    warehouseName: '圣彼得堡履约仓',
    fulfillmentType: 'FBW',
    deliveryMethod: '平台物流',
    status: 'completed',
    orderTime: '2026-04-25 12:10',
    syncTime: '2026-04-25 12:20',
    syncState: 'normal',
    quantity: 3,
    salePrice: 4590,
    totalCost: 2990,
    estimatedProfit: 1600,
    profitRate: 0.349,
    customerName: 'Olga V.',
    logisticsNumber: 'TRK-RU-003',
    costBreakdown: [{ label: '采购成本', value: 2010 }],
    timeline: [{ label: '已完成', time: '2026-04-26 16:20', note: '客户签收', tone: 'success' }],
  },
]

describe('calculateSalesOrderStats', () => {
  it('summarizes total orders, pending fulfillment counts, and sync exceptions', () => {
    expect(calculateSalesOrderStats(rows)).toEqual({
      totalOrders: 3,
      pendingFbsCount: 1,
      pendingFbwCount: 1,
      syncExceptionCount: 1,
    })
  })

  it('builds summary cards from the calculated stats', () => {
    expect(createSalesOrderSummaryCards(rows)).toEqual([
      { label: '订单总数', value: '3', note: '当前检索结果' },
      { label: 'FBS 待推进', value: '1', note: '待拣货 / 待发运' },
      { label: 'FBW 待推进', value: '1', note: '待同步 / 待回传' },
      { label: '同步异常', value: '1', note: '需人工关注' },
    ])
  })
})

describe('filterSalesOrders', () => {
  it('filters by keyword across order number, assembly number, sku, and product name', () => {
    expect(filterSalesOrders(rows, {
      keyword: 'ASM-7002',
      dateRange: [],
    }).map((row) => row.id)).toEqual(['2'])

    expect(filterSalesOrders(rows, {
      keyword: 'lamp-03',
      dateRange: [],
    }).map((row) => row.id)).toEqual(['3'])
  })

  it('filters by shop, fulfillment type, status, and date range together', () => {
    expect(filterSalesOrders(rows, {
      keyword: '',
      shopId: 'shop-ru',
      fulfillmentType: 'FBS',
      status: 'pending-pick',
      dateRange: ['2026-04-28', '2026-04-28'],
    }).map((row) => row.id)).toEqual(['1'])
  })
})

describe('paginateSalesOrders', () => {
  it('returns only the rows for the requested page', () => {
    expect(paginateSalesOrders(rows, { page: 2, pageSize: 2 }).map((row) => row.id)).toEqual(['3'])
  })
})

describe('sales order status display helpers', () => {
  it('maps status codes to labels and pill classes', () => {
    expect(getSalesOrderStatusLabel('pending-sync')).toBe('待同步')
    expect(getSalesOrderStatusClass('completed')).toBe('status-success')
  })
})
