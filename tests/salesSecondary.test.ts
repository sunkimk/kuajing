import { describe, expect, it } from 'vitest'
import {
  calculateSalesSecondaryStats,
  createSalesSecondarySummaryCards,
  filterSalesSecondaryRows,
  getSalesSecondaryStatusClass,
  getSalesSecondaryStatusLabel,
  paginateSalesSecondaryRows,
  type SalesSecondaryRow,
} from '../src/data/salesSecondary'
import { getSalesProductImage } from '../src/data/salesProductMedia'

const rows: SalesSecondaryRow[] = [
  {
    id: '1',
    shkId: 'SHK-1001',
    nmId: 'NM-5001',
    productName: '旅行收纳压缩袋',
    productImage: getSalesProductImage('BAG-01'),
    sku: 'BAG-01',
    barcode: '460000000001',
    shopId: 'shop-ru',
    shopName: '俄罗斯旗舰店',
    shopSite: 'Ozon RU',
    brand: 'NordHome',
    category: '居家收纳',
    saleCount: 6,
    firstOrderDate: '2026-03-10',
    lastOrderDate: '2026-04-28',
    deliveryFee: 580,
    logisticsCost: 340,
    finalStatus: 'stable',
    records: [],
  },
  {
    id: '2',
    shkId: 'SHK-1002',
    nmId: 'NM-5002',
    productName: '车载折叠垃圾桶',
    productImage: getSalesProductImage('CAR-02'),
    sku: 'CAR-02',
    barcode: '460000000002',
    shopId: 'shop-kz',
    shopName: '哈萨克斯坦店',
    shopSite: 'Wildberries KZ',
    brand: 'RoadTrip',
    category: '汽车用品',
    saleCount: 5,
    firstOrderDate: '2026-03-02',
    lastOrderDate: '2026-04-21',
    deliveryFee: 500,
    logisticsCost: 280,
    finalStatus: 'watch',
    records: [],
  },
  {
    id: '3',
    shkId: 'SHK-1003',
    nmId: 'NM-5003',
    productName: '硅胶可折叠餐盒',
    productImage: getSalesProductImage('BOX-03'),
    sku: 'BOX-03',
    barcode: '460000000003',
    shopId: 'shop-ru',
    shopName: '俄罗斯旗舰店',
    shopSite: 'Ozon RU',
    brand: 'NordHome',
    category: '厨房用品',
    saleCount: 3,
    firstOrderDate: '2026-03-08',
    lastOrderDate: '2026-04-14',
    deliveryFee: 320,
    logisticsCost: 190,
    finalStatus: 'restocking',
    records: [],
  },
]

describe('calculateSalesSecondaryStats', () => {
  it('summarizes product count, average sale count, and fee totals', () => {
    expect(calculateSalesSecondaryStats(rows)).toEqual({
      totalProducts: 3,
      averageSaleCount: 4.7,
      totalDeliveryFee: 1400,
      totalLogisticsCost: 810,
    })
  })

  it('builds summary cards from the calculated stats', () => {
    expect(createSalesSecondarySummaryCards(rows)).toEqual([
      { label: '二销商品数', value: '3', note: '复购商品池' },
      { label: '平均销售次数', value: '4.7', note: '商品平均复购' },
      { label: '配送费用合计', value: '1,400', note: '当前筛选结果' },
      { label: '二销物流成本', value: '810', note: '配送链路成本' },
    ])
  })
})

describe('filterSalesSecondaryRows', () => {
  it('filters by keyword across SHK ID, barcode, sku, and product name', () => {
    expect(filterSalesSecondaryRows(rows, {
      keyword: '460000000002',
    }).map((row) => row.id)).toEqual(['2'])

    expect(filterSalesSecondaryRows(rows, {
      keyword: 'box-03',
    }).map((row) => row.id)).toEqual(['3'])
  })

  it('filters by shop, brand, category, and final status together', () => {
    expect(filterSalesSecondaryRows(rows, {
      keyword: '',
      shopId: 'shop-ru',
      brand: 'NordHome',
      category: '厨房用品',
      finalStatus: 'restocking',
    }).map((row) => row.id)).toEqual(['3'])
  })
})

describe('paginateSalesSecondaryRows', () => {
  it('returns only the rows for the requested page', () => {
    expect(paginateSalesSecondaryRows(rows, { page: 2, pageSize: 2 }).map((row) => row.id)).toEqual(['3'])
  })
})

describe('sales secondary status display helpers', () => {
  it('maps status codes to labels and pill classes', () => {
    expect(getSalesSecondaryStatusLabel('watch')).toBe('关注中')
    expect(getSalesSecondaryStatusClass('stable')).toBe('status-success')
  })
})
