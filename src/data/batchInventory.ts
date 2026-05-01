export type BatchStatus = 'normal' | 'expired' | 'locked' | 'warning'
export type LogTab = 'operate' | 'cost'
export type BatchColumnKey =
  | 'batchNo'
  | 'warehouseCode'
  | 'productCode'
  | 'sku'
  | 'productName'
  | 'specModel'
  | 'unit'
  | 'batchQty'
  | 'availableQty'
  | 'lockedQty'
  | 'productionDate'
  | 'expireDate'
  | 'supplier'
  | 'status'

export type BatchRow = {
  id: string
  batchNo: string
  warehouseCode: string
  productCode: string
  sku: string
  productName: string
  specModel: string
  unit: string
  batchQty: number
  availableQty: number
  lockedQty: number
  productionDate: string
  expireDate: string
  supplier: string
  inboundOrderNo: string
  inboundTime: string
  operator: string
  remark: string
  status: BatchStatus
  createdAt: string
  updatedAt: string
}

export type OperateLog = {
  seqNo: string
  relatedNo: string
  type: string
  warehouse: string
  platformSite: string
  status: string
  inboundType: string
  outboundType: string
  creator: string
  createTime: string
}

export type BatchInventoryFilters = {
  keyword: string
  warehouse?: string
  status?: BatchStatus
  dateRange: string[]
}

export type BatchInventoryPagination = {
  page: number
  pageSize: number
}

export const warehouses = [
  { value: 'WH001', label: '深圳仓' },
  { value: 'WH002', label: '广州仓' },
  { value: 'WH003', label: '上海仓' },
  { value: 'WH004', label: '北京仓' },
]

const products = [
  { code: 'SP20260101001', sku: 'WB-IP17PRO-256-BK', name: 'iPhone 17 Pro 256GB 黑色', spec: '256GB/黑色' },
  { code: 'SP20260102002', sku: 'WB-IP17PM-512-WH', name: 'iPhone 17 Pro Max 512GB 白色', spec: '512GB/白色' },
  { code: 'SP20260103003', sku: 'WB-AIRPODS4', name: 'AirPods 4 无线耳机', spec: 'USB-C/白色' },
  { code: 'SP20260104004', sku: 'WB-MB14-M2-16G', name: 'MacBook Air 15寸 M2 16G', spec: '15寸/M2/16G/512G' },
  { code: 'SP20260105005', sku: 'WB-IPAD-11-M4', name: 'iPad Air 11寸 M4', spec: '11寸/M4/128G/蓝色' },
  { code: 'SP20260106006', sku: 'WB-AW-U2-49', name: 'Apple Watch Ultra 2 49mm', spec: '49mm/钛金属/GPS+蜂窝' },
  { code: 'SP20260107007', sku: 'WB-PENCIL-USBC', name: 'Apple Pencil Pro USB-C', spec: 'USB-C/白色' },
  { code: 'SP20260108008', sku: 'WB-MAGIC-KB-TCH', name: 'Magic Keyboard 妙控键盘', spec: '触控ID/中文/白色' },
  { code: 'SP20260109009', sku: 'WB-ATAG-4PK', name: 'AirTag 4件装', spec: '4个装' },
  { code: 'SP20260110010', sku: 'WB-LIGHTNING-1M', name: 'Lightning 数据线 1米', spec: '1米/编织' },
  { code: 'SP20260111011', sku: 'WB-20WUSBC-PD', name: '20W USB-C 电源适配器', spec: '20W/USB-C' },
  { code: 'SP20260112012', sku: 'WB-MAGSAFE-CHG', name: 'MagSafe 充电器', spec: '15W/无线充电' },
]

const suppliers = ['深圳市华强电子有限公司', '广州优品供应链', '上海自贸区进出口贸易', '北京中科物流集团', '东莞精密制造']
const units = ['个', '台', '套', '件', '盒']
const statusCycle: BatchStatus[] = ['normal', 'normal', 'normal', 'normal', 'normal', 'warning', 'locked', 'expired']

export const statusLabels: Record<BatchStatus, string> = {
  normal: '正常',
  expired: '已过期',
  locked: '锁定',
  warning: '预警',
}

export const statusOptions = [
  { value: 'normal', label: statusLabels.normal },
  { value: 'expired', label: statusLabels.expired },
  { value: 'locked', label: statusLabels.locked },
  { value: 'warning', label: statusLabels.warning },
] satisfies Array<{ value: BatchStatus; label: string }>

export const createDefaultBatchInventoryFilters = (): BatchInventoryFilters => ({
  keyword: '',
  warehouse: undefined,
  status: undefined,
  dateRange: [],
})

export const formatBatchNumber = (value = 0) => value.toLocaleString('zh-CN')

const addDays = (date: Date, days: number) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

const formatDate = (date: Date) => date.toISOString().slice(0, 10)

const formatDateTime = (date: Date, index: number) =>
  `${formatDate(date)} ${String((index * 7) % 24).padStart(2, '0')}:${String((index * 11) % 60).padStart(2, '0')}:${String((index * 13) % 60).padStart(2, '0')}`

export const createBatchRows = (count: number): BatchRow[] =>
  Array.from({ length: count }, (_, index) => {
    const product = products[index % products.length]
    const status = statusCycle[index % statusCycle.length]
    const batchQty = 10 + ((index * 379) % 5000)
    const lockedQty = status === 'locked'
      ? batchQty
      : Math.floor(status === 'warning' ? batchQty * 0.7 : ((index * 31) % Math.max(1, Math.floor(batchQty * 0.1))))
    const inboundDate = addDays(new Date('2026-04-09T00:00:00'), -Math.floor(index / 5))
    const productionDate = addDays(inboundDate, -(30 + ((index * 17) % 180)))
    const expireDate = addDays(inboundDate, 180 + ((index * 29) % 365))

    return {
      id: `BATCH-${String(100000000000 + index).slice(-12)}`,
      batchNo: `PC26${String(index + 1).padStart(6, '0')}A${String(100000 + ((index * 7919) % 900000)).padStart(6, '0')}`,
      warehouseCode: warehouses[index % warehouses.length].value,
      productCode: product.code,
      sku: product.sku,
      productName: product.name,
      specModel: product.spec,
      unit: units[index % units.length],
      batchQty,
      availableQty: batchQty - lockedQty,
      lockedQty,
      productionDate: formatDate(productionDate),
      expireDate: formatDate(expireDate),
      supplier: suppliers[index % suppliers.length],
      inboundOrderNo: `IN26${String(10000000 + ((index * 4567) % 90000000)).padStart(8, '0')}`,
      inboundTime: formatDateTime(inboundDate, index),
      operator: ['张三', '李四', '王五', '赵六', '钱七'][index % 5],
      remark: status === 'warning' ? '库存不足，请及时补货' : status === 'expired' ? '已超过有效期' : status === 'locked' ? '质检锁定中' : '',
      status,
      createdAt: formatDateTime(inboundDate, index + 3),
      updatedAt: formatDateTime(new Date('2026-04-27T00:00:00'), index + 9),
    }
  })

export const calculateBatchInventoryStats = (rows: BatchRow[]) => ({
  totalBatches: rows.length,
  totalSku: new Set(rows.map((row) => row.sku)).size,
  totalQty: rows.reduce((total, row) => total + row.batchQty, 0),
  warningCount: rows.filter((row) => row.status === 'warning').length,
  lockedCount: rows.filter((row) => row.status === 'locked').length,
})

export const createSummaryCards = (rows: BatchRow[]) => {
  const stats = calculateBatchInventoryStats(rows)

  return [
    { label: '总批次数', value: formatBatchNumber(stats.totalBatches), note: '实时批次记录' },
    { label: '总SKU数', value: formatBatchNumber(stats.totalSku), note: '覆盖批次商品' },
    { label: '总库存量', value: formatBatchNumber(stats.totalQty), note: '批次库存合计' },
    { label: '预警批次', value: formatBatchNumber(stats.warningCount), note: '需及时处理' },
    { label: '锁定批次', value: formatBatchNumber(stats.lockedCount), note: '质检或业务锁定' },
  ]
}

export const filterBatchRows = (rows: BatchRow[], filters: BatchInventoryFilters) => {
  let nextRows = [...rows]
  const keyword = filters.keyword.trim().toLowerCase()

  if (keyword) {
    nextRows = nextRows.filter((row) =>
      [row.batchNo, row.productName, row.sku].some((field) => field.toLowerCase().includes(keyword))
    )
  }

  if (filters.warehouse) nextRows = nextRows.filter((row) => row.warehouseCode === filters.warehouse)
  if (filters.status) nextRows = nextRows.filter((row) => row.status === filters.status)

  if (filters.dateRange.length === 2) {
    const [start, end] = filters.dateRange
    nextRows = nextRows.filter((row) => row.productionDate >= start && row.productionDate <= end)
  }

  return nextRows
}

export const paginateBatchRows = (rows: BatchRow[], pagination: BatchInventoryPagination) => {
  const start = (pagination.page - 1) * pagination.pageSize
  return rows.slice(start, start + pagination.pageSize)
}

export const getBatchStatusLabel = (status: BatchStatus | string) => statusLabels[status as BatchStatus] ?? status

export const getBatchStatusClass = (status: BatchStatus | string) => `status-${status}`

export const isNearExpire = (date?: string, now = new Date()) => {
  if (!date) return false
  const diff = Math.ceil((new Date(date).getTime() - now.getTime()) / 86400000)
  return diff >= 0 && diff <= 30
}

export const isExpired = (date?: string, now = new Date()) => Boolean(date && new Date(date) < now)

export const createOperateLogs = (): OperateLog[] => {
  const types = ['其它入库', '采购入库', '退货入库', '调拨入库', '盘点入库']
  const logWarehouses = ['海外IML仓', '深圳仓', '广州仓', '上海仓', '北京仓']
  const platforms = ['共享', 'OZON', 'WB', 'AliExpress']
  const qualityStatus = ['良品', '不良品', '待检品']
  const inboundTypes = ['其它入库', '采购入库', '退货入库', '调拨入库']
  const outboundTypes = ['销售出库', '调拨出库', '报损出库', '退货出库', '--']
  const creators = ['小连', '张三', '李四', '王五', '赵六']

  return Array.from({ length: 15 }, (_, index) => {
    const onlyInbound = index % 3 !== 0
    return {
      seqNo: `OT${String(2026041000000 + index).slice(-13)}`,
      relatedNo: onlyInbound ? '--' : `SO${String(100000000 + index).slice(-9)}`,
      type: types[index % types.length],
      warehouse: logWarehouses[index % logWarehouses.length],
      platformSite: platforms[index % platforms.length],
      status: qualityStatus[index % qualityStatus.length],
      inboundType: inboundTypes[index % inboundTypes.length],
      outboundType: onlyInbound ? '--' : outboundTypes[index % outboundTypes.length],
      creator: creators[index % creators.length],
      createTime: `2026-04-${String(10 - Math.floor(index / 5)).padStart(2, '0')} ${String(8 + Math.floor(index / 2)).padStart(2, '0')}:${String((index * 7) % 60).padStart(2, '0')}:00`,
    }
  })
}
