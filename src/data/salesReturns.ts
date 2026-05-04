import { getSalesProductImage } from './salesProductMedia'

export type SalesReturnStatus = 'pending' | 'approved' | 'inbound' | 'completed' | 'rejected'
export type SalesReturnReasonType = 'quality' | 'mismatch' | 'delivery' | 'other'
export type SalesReturnTimelineTone = 'success' | 'warning' | 'danger' | 'neutral'

export type SalesReturnTimelineItem = {
  label: string
  time: string
  note: string
  tone: SalesReturnTimelineTone
}

export type SalesReturnRow = {
  id: string
  returnNo: string
  originalOrderNo: string
  productName: string
  productImage: string
  sku: string
  shopId: string
  shopName: string
  warehouseName: string
  quantity: number
  refundAmount: number
  reasonType: SalesReturnReasonType
  reasonLabel: string
  status: SalesReturnStatus
  applyTime: string
  timeline: SalesReturnTimelineItem[]
}

export type SalesReturnFilters = {
  keyword: string
  shopId?: string
  status?: SalesReturnStatus
  reasonType?: SalesReturnReasonType
  dateRange: string[]
}

export type SalesReturnPagination = {
  page: number
  pageSize: number
}

export const salesReturnShopOptions = [
  { value: 'shop-ru', label: '俄罗斯旗舰店' },
  { value: 'shop-kz', label: '哈萨克斯坦店' },
  { value: 'shop-eu', label: '东欧精选店' },
] as const

const salesReturnStatusMeta: Record<SalesReturnStatus, { label: string; className: string }> = {
  pending: { label: '待处理', className: 'status-warning' },
  approved: { label: '已同意', className: 'status-processing' },
  inbound: { label: '回仓中', className: 'status-neutral' },
  completed: { label: '已完成', className: 'status-success' },
  rejected: { label: '已拒绝', className: 'status-danger' },
}

export const salesReturnStatusOptions = Object.entries(salesReturnStatusMeta).map(([value, meta]) => ({
  value: value as SalesReturnStatus,
  label: meta.label,
}))

export const salesReturnReasonOptions = [
  { value: 'quality', label: '质量问题' },
  { value: 'mismatch', label: '与描述不符' },
  { value: 'delivery', label: '物流破损' },
  { value: 'other', label: '其他原因' },
] satisfies Array<{ value: SalesReturnReasonType; label: string }>

export const createDefaultSalesReturnFilters = (): SalesReturnFilters => ({
  keyword: '',
  shopId: undefined,
  status: undefined,
  reasonType: undefined,
  dateRange: [],
})

const formatSalesReturnNumber = (value: number) => value.toLocaleString('zh-CN')

export const getSalesReturnStatusLabel = (status: SalesReturnStatus | string) =>
  salesReturnStatusMeta[status as SalesReturnStatus]?.label ?? status

export const getSalesReturnStatusClass = (status: SalesReturnStatus | string) =>
  salesReturnStatusMeta[status as SalesReturnStatus]?.className ?? 'status-neutral'

export const calculateSalesReturnStats = (rows: SalesReturnRow[]) => ({
  totalReturns: rows.length,
  pendingCount: rows.filter((row) => row.status === 'pending').length,
  approvedInboundCount: rows.filter((row) => ['approved', 'inbound'].includes(row.status)).length,
  completedCount: rows.filter((row) => row.status === 'completed').length,
})

export const createSalesReturnSummaryCards = (rows: SalesReturnRow[]) => {
  const stats = calculateSalesReturnStats(rows)

  return [
    { label: '退货总量', value: formatSalesReturnNumber(stats.totalReturns), note: '当前筛选结果' },
    { label: '待处理', value: formatSalesReturnNumber(stats.pendingCount), note: '待审核 / 待回复' },
    { label: '已同意待回仓', value: formatSalesReturnNumber(stats.approvedInboundCount), note: '等待仓库收货' },
    { label: '已完成', value: formatSalesReturnNumber(stats.completedCount), note: '退款与回仓闭环' },
  ]
}

export const filterSalesReturns = (rows: SalesReturnRow[], filters: SalesReturnFilters) => {
  let nextRows = [...rows]
  const keyword = filters.keyword.trim().toLowerCase()

  if (keyword) {
    nextRows = nextRows.filter((row) =>
      [row.returnNo, row.originalOrderNo, row.sku, row.productName].some((field) =>
        field.toLowerCase().includes(keyword)
      )
    )
  }

  if (filters.shopId) nextRows = nextRows.filter((row) => row.shopId === filters.shopId)
  if (filters.status) nextRows = nextRows.filter((row) => row.status === filters.status)
  if (filters.reasonType) nextRows = nextRows.filter((row) => row.reasonType === filters.reasonType)

  if (filters.dateRange.length === 2) {
    const [start, end] = filters.dateRange
    nextRows = nextRows.filter((row) => {
      const applyDate = row.applyTime.slice(0, 10)
      return applyDate >= start && applyDate <= end
    })
  }

  return nextRows
}

export const paginateSalesReturns = (rows: SalesReturnRow[], pagination: SalesReturnPagination) => {
  const start = (pagination.page - 1) * pagination.pageSize
  return rows.slice(start, start + pagination.pageSize)
}

const reasonSeedMap: Record<SalesReturnReasonType, string[]> = {
  quality: ['做工瑕疵', '开箱异响', '功能异常'],
  mismatch: ['与描述不符', '颜色不一致', '规格错误'],
  delivery: ['物流破损', '外箱变形', '部件遗失'],
  other: ['客户误购', '重复下单', '临时取消'],
}

const statusCycle: SalesReturnStatus[] = ['pending', 'approved', 'inbound', 'completed', 'rejected']
const reasonTypeCycle: SalesReturnReasonType[] = ['quality', 'mismatch', 'delivery', 'other']

const buildReturnTimeline = (status: SalesReturnStatus, applyTime: string): SalesReturnTimelineItem[] => {
  const base = [
    { label: '已申请', time: applyTime, note: '用户已提交退货申请', tone: 'neutral' as const },
  ]

  if (status === 'pending') {
    return [...base, { label: '待审核', time: applyTime, note: '客服待处理', tone: 'warning' }]
  }

  if (status === 'approved') {
    return [...base, { label: '已同意', time: applyTime, note: '等待退货回仓', tone: 'success' }]
  }

  if (status === 'inbound') {
    return [...base, { label: '回仓中', time: applyTime, note: '仓库等待签收', tone: 'neutral' }]
  }

  if (status === 'rejected') {
    return [...base, { label: '已拒绝', time: applyTime, note: '需跟进用户沟通', tone: 'danger' }]
  }

  return [...base, { label: '已完成', time: applyTime, note: '退款与回仓处理完成', tone: 'success' }]
}

export const createSalesReturnRows = (count = 28): SalesReturnRow[] =>
  Array.from({ length: count }, (_, index) => {
    const shop = salesReturnShopOptions[index % salesReturnShopOptions.length]
    const reasonType = reasonTypeCycle[index % reasonTypeCycle.length]
    const status = statusCycle[index % statusCycle.length]
    const applyDate = new Date(`2026-04-${String(28 - (index % 14)).padStart(2, '0')}T${String(9 + (index % 7)).padStart(2, '0')}:15:00`)
    const applyTime = `${applyDate.toISOString().slice(0, 10)} ${String(applyDate.getHours()).padStart(2, '0')}:${String(applyDate.getMinutes()).padStart(2, '0')}`

    return {
      id: `sales-return-${index + 1}`,
      returnNo: `RT26${String(200000 + index).padStart(6, '0')}`,
      originalOrderNo: `SO26${String(100000 + index * 4).padStart(6, '0')}`,
      productName: ['磁吸充电支架', '折叠旅行水壶', '便携露营灯', '桌面显示器支架'][index % 4],
      productImage: getSalesProductImage(['CHARGE-01', 'KETTLE-02', 'LAMP-03', 'RACK-04'][index % 4]),
      sku: ['CHARGE-01', 'KETTLE-02', 'LAMP-03', 'RACK-04'][index % 4],
      shopId: shop.value,
      shopName: shop.label,
      warehouseName: ['莫斯科中转仓', '阿拉木图前置仓', '华沙共享仓'][index % 3],
      quantity: 1 + (index % 3),
      refundAmount: 890 + (index % 6) * 280,
      reasonType,
      reasonLabel: reasonSeedMap[reasonType][index % reasonSeedMap[reasonType].length],
      status,
      applyTime,
      timeline: buildReturnTimeline(status, applyTime),
    }
  })
