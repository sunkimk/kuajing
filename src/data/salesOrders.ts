import { getSalesProductImage } from './salesProductMedia'

export type SalesOrderStatus =
  | 'pending-pick'
  | 'pending-delivery'
  | 'pending-sync'
  | 'shipped'
  | 'completed'
  | 'exception'

export type SalesOrderFulfillmentType = 'FBS' | 'FBW'
export type SalesOrderSyncState = 'normal' | 'exception'
export type SalesOrderTimelineTone = 'success' | 'warning' | 'danger' | 'neutral'

export type SalesOrderCostItem = {
  label: string
  value: number
}

export type SalesOrderTimelineItem = {
  label: string
  time: string
  note: string
  tone: SalesOrderTimelineTone
}

export type SalesOrderRow = {
  id: string
  orderNo: string
  assemblyId: string
  productName: string
  productImage: string
  sku: string
  shopId: string
  shopName: string
  shopSite: string
  warehouseName: string
  fulfillmentType: SalesOrderFulfillmentType
  deliveryMethod: string
  status: SalesOrderStatus
  orderTime: string
  syncTime: string
  syncState: SalesOrderSyncState
  quantity: number
  salePrice: number
  totalCost: number
  estimatedProfit: number
  profitRate: number
  customerName: string
  logisticsNumber: string
  costBreakdown: SalesOrderCostItem[]
  timeline: SalesOrderTimelineItem[]
}

export type SalesOrderFilters = {
  keyword: string
  shopId?: string
  fulfillmentType?: SalesOrderFulfillmentType
  status?: SalesOrderStatus
  dateRange: string[]
}

export type SalesOrderPagination = {
  page: number
  pageSize: number
}

export const salesOrderShopOptions = [
  { value: 'shop-ru', label: '俄罗斯旗舰店' },
  { value: 'shop-kz', label: '哈萨克斯坦店' },
  { value: 'shop-eu', label: '东欧精选店' },
  { value: 'shop-me', label: '中东直营店' },
] as const

export const salesOrderFulfillmentOptions = [
  { value: 'FBS', label: 'FBS' },
  { value: 'FBW', label: 'FBW' },
] satisfies Array<{ value: SalesOrderFulfillmentType; label: string }>

const salesOrderStatusMeta: Record<SalesOrderStatus, { label: string; className: string }> = {
  'pending-pick': { label: '待拣货', className: 'status-warning' },
  'pending-delivery': { label: '待发运', className: 'status-processing' },
  'pending-sync': { label: '待同步', className: 'status-danger' },
  shipped: { label: '运输中', className: 'status-neutral' },
  completed: { label: '已完成', className: 'status-success' },
  exception: { label: '异常单', className: 'status-danger' },
}

export const salesOrderStatusOptions = Object.entries(salesOrderStatusMeta).map(([value, meta]) => ({
  value: value as SalesOrderStatus,
  label: meta.label,
}))

export const createDefaultSalesOrderFilters = (): SalesOrderFilters => ({
  keyword: '',
  shopId: undefined,
  fulfillmentType: undefined,
  status: undefined,
  dateRange: [],
})

export const formatSalesOrderNumber = (value: number) => value.toLocaleString('zh-CN')

export const getSalesOrderStatusLabel = (status: SalesOrderStatus | string) =>
  salesOrderStatusMeta[status as SalesOrderStatus]?.label ?? status

export const getSalesOrderStatusClass = (status: SalesOrderStatus | string) =>
  salesOrderStatusMeta[status as SalesOrderStatus]?.className ?? 'status-neutral'

const isPendingSalesOrder = (row: SalesOrderRow) =>
  ['pending-pick', 'pending-delivery', 'pending-sync'].includes(row.status)

export const calculateSalesOrderStats = (rows: SalesOrderRow[]) => ({
  totalOrders: rows.length,
  pendingFbsCount: rows.filter((row) => row.fulfillmentType === 'FBS' && isPendingSalesOrder(row)).length,
  pendingFbwCount: rows.filter((row) => row.fulfillmentType === 'FBW' && isPendingSalesOrder(row)).length,
  syncExceptionCount: rows.filter((row) => row.syncState === 'exception').length,
})

export const createSalesOrderSummaryCards = (rows: SalesOrderRow[]) => {
  const stats = calculateSalesOrderStats(rows)

  return [
    { label: '订单总数', value: formatSalesOrderNumber(stats.totalOrders), note: '当前检索结果' },
    { label: 'FBS 待推进', value: formatSalesOrderNumber(stats.pendingFbsCount), note: '待拣货 / 待发运' },
    { label: 'FBW 待推进', value: formatSalesOrderNumber(stats.pendingFbwCount), note: '待同步 / 待回传' },
    { label: '同步异常', value: formatSalesOrderNumber(stats.syncExceptionCount), note: '需人工关注' },
  ]
}

export const filterSalesOrders = (rows: SalesOrderRow[], filters: SalesOrderFilters) => {
  let nextRows = [...rows]
  const keyword = filters.keyword.trim().toLowerCase()

  if (keyword) {
    nextRows = nextRows.filter((row) =>
      [row.orderNo, row.assemblyId, row.sku, row.productName].some((field) =>
        field.toLowerCase().includes(keyword)
      )
    )
  }

  if (filters.shopId) nextRows = nextRows.filter((row) => row.shopId === filters.shopId)
  if (filters.fulfillmentType) nextRows = nextRows.filter((row) => row.fulfillmentType === filters.fulfillmentType)
  if (filters.status) nextRows = nextRows.filter((row) => row.status === filters.status)

  if (filters.dateRange.length === 2) {
    const [start, end] = filters.dateRange
    nextRows = nextRows.filter((row) => {
      const orderDate = row.orderTime.slice(0, 10)
      return orderDate >= start && orderDate <= end
    })
  }

  return nextRows
}

export const paginateSalesOrders = (rows: SalesOrderRow[], pagination: SalesOrderPagination) => {
  const start = (pagination.page - 1) * pagination.pageSize
  return rows.slice(start, start + pagination.pageSize)
}

const productSeeds = [
  { sku: 'CHARGE-01', name: '磁吸充电支架', customerName: 'Ivan Petrov' },
  { sku: 'KETTLE-02', name: '折叠旅行水壶', customerName: 'Arman S.' },
  { sku: 'LAMP-03', name: '便携露营灯', customerName: 'Olga V.' },
  { sku: 'RACK-04', name: '桌面显示器支架', customerName: 'Maxim G.' },
  { sku: 'COOK-05', name: '便携电煮锅', customerName: 'Diana K.' },
] as const

const warehouseSeeds = ['莫斯科中转仓', '阿拉木图前置仓', '圣彼得堡履约仓', '迪拜共享仓'] as const
const deliveryMethodSeeds = ['平台物流', '海外仓派送', '专线尾程'] as const
const orderStatusCycle: SalesOrderStatus[] = [
  'pending-pick',
  'pending-delivery',
  'pending-sync',
  'shipped',
  'completed',
  'exception',
]

const buildSalesOrderTimeline = (status: SalesOrderStatus, orderTime: string, syncTime: string): SalesOrderTimelineItem[] => {
  const base = [
    { label: '已下单', time: orderTime, note: '订单进入销售工作台', tone: 'neutral' as const },
    { label: '已同步', time: syncTime, note: '平台数据已拉取', tone: 'success' as const },
  ]

  if (status === 'pending-pick') {
    return [...base, { label: '待拣货', time: syncTime, note: '仓库待分配拣货任务', tone: 'warning' }]
  }

  if (status === 'pending-delivery') {
    return [...base, { label: '待发运', time: syncTime, note: '尾程单待创建', tone: 'warning' }]
  }

  if (status === 'pending-sync') {
    return [...base, { label: '待同步', time: syncTime, note: '平台状态尚未回写', tone: 'danger' }]
  }

  if (status === 'shipped') {
    return [...base, { label: '运输中', time: syncTime, note: '尾程运单已生成', tone: 'neutral' }]
  }

  if (status === 'exception') {
    return [...base, { label: '异常单', time: syncTime, note: '库存或平台状态待人工处理', tone: 'danger' }]
  }

  return [...base, { label: '已完成', time: syncTime, note: '客户已签收', tone: 'success' }]
}

export const createSalesOrderRows = (count = 36): SalesOrderRow[] =>
  Array.from({ length: count }, (_, index) => {
    const product = productSeeds[index % productSeeds.length]
    const shop = salesOrderShopOptions[index % salesOrderShopOptions.length]
    const status = orderStatusCycle[index % orderStatusCycle.length]
    const fulfillmentType = index % 2 === 0 ? 'FBS' : 'FBW'
    const salePrice = 1590 + (index % 6) * 320
    const totalCost = Math.round(salePrice * (0.58 + ((index % 4) * 0.04)))
    const estimatedProfit = salePrice - totalCost
    const orderDate = new Date(`2026-04-${String(28 - (index % 12)).padStart(2, '0')}T${String(9 + (index % 8)).padStart(2, '0')}:20:00`)
    const syncDate = new Date(orderDate.getTime() + 25 * 60 * 1000)
    const orderTime = `${orderDate.toISOString().slice(0, 10)} ${String(orderDate.getHours()).padStart(2, '0')}:${String(orderDate.getMinutes()).padStart(2, '0')}`
    const syncTime = `${syncDate.toISOString().slice(0, 10)} ${String(syncDate.getHours()).padStart(2, '0')}:${String(syncDate.getMinutes()).padStart(2, '0')}`

    return {
      id: `sales-order-${index + 1}`,
      orderNo: `SO26${String(100000 + index).padStart(6, '0')}`,
      assemblyId: `ASM26${String(400000 + index * 3).padStart(6, '0')}`,
      productName: product.name,
      productImage: getSalesProductImage(product.sku),
      sku: product.sku,
      shopId: shop.value,
      shopName: shop.label,
      shopSite: shop.value === 'shop-ru' ? 'Ozon RU' : shop.value === 'shop-kz' ? 'Wildberries KZ' : shop.value === 'shop-eu' ? 'Allegro PL' : 'Noon UAE',
      warehouseName: warehouseSeeds[index % warehouseSeeds.length],
      fulfillmentType,
      deliveryMethod: deliveryMethodSeeds[index % deliveryMethodSeeds.length],
      status,
      orderTime,
      syncTime,
      syncState: status === 'pending-sync' || status === 'exception' ? 'exception' : 'normal',
      quantity: 1 + (index % 3),
      salePrice,
      totalCost,
      estimatedProfit,
      profitRate: estimatedProfit / salePrice,
      customerName: product.customerName,
      logisticsNumber: `TRK-${String(700000 + index).padStart(6, '0')}`,
      costBreakdown: [
        { label: '采购成本', value: Math.round(totalCost * 0.68) },
        { label: '头程物流', value: Math.round(totalCost * 0.18) },
        { label: '平台手续费', value: Math.round(totalCost * 0.14) },
      ],
      timeline: buildSalesOrderTimeline(status, orderTime, syncTime),
    }
  })
