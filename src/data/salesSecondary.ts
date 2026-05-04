import { getSalesProductImage } from './salesProductMedia'

export type SalesSecondaryStatus = 'stable' | 'watch' | 'restocking' | 'stopped'

export type SalesSecondarySaleRecord = {
  orderNo: string
  orderDate: string
  quantity: number
  deliveryFee: number
  status: string
  warehouseName: string
}

export type SalesSecondaryRow = {
  id: string
  shkId: string
  nmId: string
  productName: string
  productImage: string
  sku: string
  barcode: string
  shopId: string
  shopName: string
  shopSite: string
  brand: string
  category: string
  saleCount: number
  firstOrderDate: string
  lastOrderDate: string
  deliveryFee: number
  logisticsCost: number
  finalStatus: SalesSecondaryStatus
  records: SalesSecondarySaleRecord[]
}

export type SalesSecondaryFilters = {
  keyword: string
  shopId?: string
  brand?: string
  category?: string
  finalStatus?: SalesSecondaryStatus
}

export type SalesSecondaryPagination = {
  page: number
  pageSize: number
}

export const salesSecondaryShopOptions = [
  { value: 'shop-ru', label: '俄罗斯旗舰店' },
  { value: 'shop-kz', label: '哈萨克斯坦店' },
  { value: 'shop-eu', label: '东欧精选店' },
] as const

export const salesSecondaryBrandOptions = ['NordHome', 'RoadTrip', 'LiteCook', 'PeakLab'] as const
export const salesSecondaryCategoryOptions = ['居家收纳', '汽车用品', '厨房用品', '数码配件'] as const

const salesSecondaryStatusMeta: Record<SalesSecondaryStatus, { label: string; className: string }> = {
  stable: { label: '持续稳定', className: 'status-success' },
  watch: { label: '关注中', className: 'status-warning' },
  restocking: { label: '补货跟进', className: 'status-processing' },
  stopped: { label: '暂停追踪', className: 'status-neutral' },
}

export const salesSecondaryStatusOptions = Object.entries(salesSecondaryStatusMeta).map(([value, meta]) => ({
  value: value as SalesSecondaryStatus,
  label: meta.label,
}))

export const createDefaultSalesSecondaryFilters = (): SalesSecondaryFilters => ({
  keyword: '',
  shopId: undefined,
  brand: undefined,
  category: undefined,
  finalStatus: undefined,
})

const formatSalesSecondaryNumber = (
  value: number,
  digits = 0,
) => value.toLocaleString('zh-CN', {
  minimumFractionDigits: digits > 0 && value % 1 !== 0 ? digits : 0,
  maximumFractionDigits: digits,
})

export const getSalesSecondaryStatusLabel = (status: SalesSecondaryStatus | string) =>
  salesSecondaryStatusMeta[status as SalesSecondaryStatus]?.label ?? status

export const getSalesSecondaryStatusClass = (status: SalesSecondaryStatus | string) =>
  salesSecondaryStatusMeta[status as SalesSecondaryStatus]?.className ?? 'status-neutral'

export const calculateSalesSecondaryStats = (rows: SalesSecondaryRow[]) => {
  const totalProducts = rows.length
  const averageSaleCount = totalProducts === 0
    ? 0
    : Math.round((rows.reduce((total, row) => total + row.saleCount, 0) / totalProducts) * 10) / 10

  return {
    totalProducts,
    averageSaleCount,
    totalDeliveryFee: rows.reduce((total, row) => total + row.deliveryFee, 0),
    totalLogisticsCost: rows.reduce((total, row) => total + row.logisticsCost, 0),
  }
}

export const createSalesSecondarySummaryCards = (rows: SalesSecondaryRow[]) => {
  const stats = calculateSalesSecondaryStats(rows)

  return [
    { label: '二销商品数', value: formatSalesSecondaryNumber(stats.totalProducts), note: '复购商品池' },
    { label: '平均销售次数', value: formatSalesSecondaryNumber(stats.averageSaleCount, 1), note: '商品平均复购' },
    { label: '配送费用合计', value: formatSalesSecondaryNumber(stats.totalDeliveryFee), note: '当前筛选结果' },
    { label: '二销物流成本', value: formatSalesSecondaryNumber(stats.totalLogisticsCost), note: '配送链路成本' },
  ]
}

export const filterSalesSecondaryRows = (rows: SalesSecondaryRow[], filters: SalesSecondaryFilters) => {
  let nextRows = [...rows]
  const keyword = filters.keyword.trim().toLowerCase()

  if (keyword) {
    nextRows = nextRows.filter((row) =>
      [row.shkId, row.nmId, row.sku, row.productName, row.barcode].some((field) =>
        field.toLowerCase().includes(keyword)
      )
    )
  }

  if (filters.shopId) nextRows = nextRows.filter((row) => row.shopId === filters.shopId)
  if (filters.brand) nextRows = nextRows.filter((row) => row.brand === filters.brand)
  if (filters.category) nextRows = nextRows.filter((row) => row.category === filters.category)
  if (filters.finalStatus) nextRows = nextRows.filter((row) => row.finalStatus === filters.finalStatus)

  return nextRows
}

export const paginateSalesSecondaryRows = (rows: SalesSecondaryRow[], pagination: SalesSecondaryPagination) => {
  const start = (pagination.page - 1) * pagination.pageSize
  return rows.slice(start, start + pagination.pageSize)
}

const productSeeds = [
  { productName: '旅行收纳压缩袋', sku: 'BAG-01', barcode: '460000000001' },
  { productName: '车载折叠垃圾桶', sku: 'CAR-02', barcode: '460000000002' },
  { productName: '硅胶可折叠餐盒', sku: 'BOX-03', barcode: '460000000003' },
  { productName: '磁吸理线器', sku: 'WIRE-04', barcode: '460000000004' },
  { productName: '便携咖啡研磨杯', sku: 'COFFEE-05', barcode: '460000000005' },
] as const

const statusCycle: SalesSecondaryStatus[] = ['stable', 'watch', 'restocking', 'stable', 'stopped']

const createSalesSecondaryRecords = (rowIndex: number, saleCount: number): SalesSecondarySaleRecord[] =>
  Array.from({ length: saleCount }, (_, index) => ({
    orderNo: `SO26${String(300000 + rowIndex * 20 + index).padStart(6, '0')}`,
    orderDate: `2026-04-${String(28 - ((rowIndex + index) % 12)).padStart(2, '0')}`,
    quantity: 1 + (index % 2),
    deliveryFee: 80 + ((rowIndex + index) % 5) * 25,
    status: index === saleCount - 1 ? '最近成交' : '历史成交',
    warehouseName: ['莫斯科中转仓', '阿拉木图前置仓', '华沙共享仓'][index % 3],
  }))

export const createSalesSecondaryRows = (count = 24): SalesSecondaryRow[] =>
  Array.from({ length: count }, (_, index) => {
    const product = productSeeds[index % productSeeds.length]
    const shop = salesSecondaryShopOptions[index % salesSecondaryShopOptions.length]
    const brand = salesSecondaryBrandOptions[index % salesSecondaryBrandOptions.length]
    const category = salesSecondaryCategoryOptions[index % salesSecondaryCategoryOptions.length]
    const saleCount = 2 + (index % 6)
    const deliveryFee = 320 + (index % 7) * 85
    const logisticsCost = 180 + (index % 5) * 60
    const firstOrderDate = `2026-03-${String(2 + (index % 10)).padStart(2, '0')}`
    const lastOrderDate = `2026-04-${String(28 - (index % 12)).padStart(2, '0')}`

    return {
      id: `sales-secondary-${index + 1}`,
      shkId: `SHK-${String(1000 + index).padStart(4, '0')}`,
      nmId: `NM-${String(5000 + index).padStart(4, '0')}`,
      productName: product.productName,
      productImage: getSalesProductImage(product.sku),
      sku: product.sku,
      barcode: product.barcode,
      shopId: shop.value,
      shopName: shop.label,
      shopSite: shop.value === 'shop-ru' ? 'Ozon RU' : shop.value === 'shop-kz' ? 'Wildberries KZ' : 'Allegro PL',
      brand,
      category,
      saleCount,
      firstOrderDate,
      lastOrderDate,
      deliveryFee,
      logisticsCost,
      finalStatus: statusCycle[index % statusCycle.length],
      records: createSalesSecondaryRecords(index, saleCount),
    }
  })
