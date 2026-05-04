import { describe, expect, it } from 'vitest'
import {
  calculateSalesReturnStats,
  createSalesReturnSummaryCards,
  filterSalesReturns,
  getSalesReturnStatusClass,
  getSalesReturnStatusLabel,
  paginateSalesReturns,
  type SalesReturnRow,
} from '../src/data/salesReturns'
import { getSalesProductImage } from '../src/data/salesProductMedia'

const rows: SalesReturnRow[] = [
  {
    id: '1',
    returnNo: 'RT-1001',
    originalOrderNo: 'SO-1001',
    productName: '磁吸充电支架',
    productImage: getSalesProductImage('CHARGE-01'),
    sku: 'CHARGE-01',
    shopId: 'shop-ru',
    shopName: '俄罗斯旗舰店',
    warehouseName: '莫斯科中转仓',
    quantity: 1,
    refundAmount: 1290,
    reasonType: 'quality',
    reasonLabel: '做工瑕疵',
    status: 'pending',
    applyTime: '2026-04-28 10:00',
    timeline: [],
  },
  {
    id: '2',
    returnNo: 'RT-1002',
    originalOrderNo: 'SO-1002',
    productName: '折叠旅行水壶',
    productImage: getSalesProductImage('KETTLE-02'),
    sku: 'KETTLE-02',
    shopId: 'shop-kz',
    shopName: '哈萨克斯坦店',
    warehouseName: '阿拉木图前置仓',
    quantity: 2,
    refundAmount: 1990,
    reasonType: 'mismatch',
    reasonLabel: '与描述不符',
    status: 'approved',
    applyTime: '2026-04-27 09:40',
    timeline: [],
  },
  {
    id: '3',
    returnNo: 'RT-1003',
    originalOrderNo: 'SO-1003',
    productName: '便携露营灯',
    productImage: getSalesProductImage('LAMP-03'),
    sku: 'LAMP-03',
    shopId: 'shop-ru',
    shopName: '俄罗斯旗舰店',
    warehouseName: '圣彼得堡履约仓',
    quantity: 1,
    refundAmount: 890,
    reasonType: 'delivery',
    reasonLabel: '物流破损',
    status: 'completed',
    applyTime: '2026-04-25 17:20',
    timeline: [],
  },
]

describe('calculateSalesReturnStats', () => {
  it('summarizes total returns and key workflow buckets', () => {
    expect(calculateSalesReturnStats(rows)).toEqual({
      totalReturns: 3,
      pendingCount: 1,
      approvedInboundCount: 1,
      completedCount: 1,
    })
  })

  it('builds summary cards from the calculated stats', () => {
    expect(createSalesReturnSummaryCards(rows)).toEqual([
      { label: '退货总量', value: '3', note: '当前筛选结果' },
      { label: '待处理', value: '1', note: '待审核 / 待回复' },
      { label: '已同意待回仓', value: '1', note: '等待仓库收货' },
      { label: '已完成', value: '1', note: '退款与回仓闭环' },
    ])
  })
})

describe('filterSalesReturns', () => {
  it('filters by keyword across return number, original order number, sku, and product name', () => {
    expect(filterSalesReturns(rows, {
      keyword: 'SO-1002',
      dateRange: [],
    }).map((row) => row.id)).toEqual(['2'])

    expect(filterSalesReturns(rows, {
      keyword: 'lamp-03',
      dateRange: [],
    }).map((row) => row.id)).toEqual(['3'])
  })

  it('filters by shop, status, reason type, and apply date range together', () => {
    expect(filterSalesReturns(rows, {
      keyword: '',
      shopId: 'shop-kz',
      status: 'approved',
      reasonType: 'mismatch',
      dateRange: ['2026-04-27', '2026-04-27'],
    }).map((row) => row.id)).toEqual(['2'])
  })
})

describe('paginateSalesReturns', () => {
  it('returns only the rows for the requested page', () => {
    expect(paginateSalesReturns(rows, { page: 2, pageSize: 2 }).map((row) => row.id)).toEqual(['3'])
  })
})

describe('sales return status display helpers', () => {
  it('maps status codes to labels and pill classes', () => {
    expect(getSalesReturnStatusLabel('approved')).toBe('已同意')
    expect(getSalesReturnStatusClass('completed')).toBe('status-success')
  })
})
