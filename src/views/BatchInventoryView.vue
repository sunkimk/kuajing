<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { TableColumnData } from '@arco-design/web-vue'
import { IconDownload, IconEyeInvisible, IconRefresh } from '@arco-design/web-vue/es/icon'

type BatchStatus = 'normal' | 'expired' | 'locked' | 'warning'
type LogTab = 'operate' | 'cost'
type BatchColumnKey =
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
type BatchTableColumnData = TableColumnData & { hideKey?: BatchColumnKey }

type BatchRow = {
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

type OperateLog = {
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

const warehouses = [
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
const statusLabels: Record<BatchStatus, string> = {
  normal: '正常',
  expired: '已过期',
  locked: '锁定',
  warning: '预警',
}

const filters = ref({
  keyword: '',
  warehouse: undefined as string | undefined,
  status: undefined as BatchStatus | undefined,
  dateRange: [] as string[],
})

const pagination = ref({
  page: 1,
  pageSize: 20,
})

const loading = ref(false)
const selectedRowKeys = ref<string[]>([])
const detailVisible = ref(false)
const currentRow = ref<BatchRow>()
const logVisible = ref(false)
const activeLogTab = ref<LogTab>('operate')
const operateLogs = ref<OperateLog[]>([])
const pendingDragColumnKey = ref<BatchColumnKey>()
const draggingColumnKey = ref<BatchColumnKey>()
const dragOverColumnKey = ref<BatchColumnKey>()
const columnDragStartX = ref(0)
const tableWrapperRef = ref<HTMLElement>()
let columnDragMouseupCleanup: (() => void) | undefined
let tableHeaderDelegationCleanup: (() => void) | undefined

const formatNumber = (value = 0) => value.toLocaleString('zh-CN')

const addDays = (date: Date, days: number) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

const formatDate = (date: Date) => date.toISOString().slice(0, 10)

const formatDateTime = (date: Date, index: number) =>
  `${formatDate(date)} ${String((index * 7) % 24).padStart(2, '0')}:${String((index * 11) % 60).padStart(2, '0')}:${String((index * 13) % 60).padStart(2, '0')}`

const createBatchRows = (count: number): BatchRow[] =>
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

const allRows = ref(createBatchRows(86))

const stats = computed(() => ({
  totalBatches: allRows.value.length,
  totalSku: new Set(allRows.value.map((row) => row.sku)).size,
  totalQty: allRows.value.reduce((total, row) => total + row.batchQty, 0),
  warningCount: allRows.value.filter((row) => row.status === 'warning').length,
  lockedCount: allRows.value.filter((row) => row.status === 'locked').length,
}))

const summaryCards = computed(() => [
  { label: '总批次数', value: formatNumber(stats.value.totalBatches), note: '实时批次记录' },
  { label: '总SKU数', value: formatNumber(stats.value.totalSku), note: '覆盖批次商品' },
  { label: '总库存量', value: formatNumber(stats.value.totalQty), note: '批次库存合计' },
  { label: '预警批次', value: formatNumber(stats.value.warningCount), note: '需及时处理' },
  { label: '锁定批次', value: formatNumber(stats.value.lockedCount), note: '质检或业务锁定' },
])

const defaultVisibleColumnKeys: BatchColumnKey[] = [
  'batchNo',
  'warehouseCode',
  'productCode',
  'sku',
  'productName',
  'specModel',
  'unit',
  'batchQty',
  'availableQty',
  'lockedQty',
  'productionDate',
  'expireDate',
  'supplier',
  'status',
]

const visibleColumnKeys = ref<BatchColumnKey[]>([...defaultVisibleColumnKeys])
const columnOrder = ref<BatchColumnKey[]>([...defaultVisibleColumnKeys])
const hideableColumnKeys = new Set<BatchColumnKey>(defaultVisibleColumnKeys)
const pinnedDataColumnKeys = new Set<BatchColumnKey>(['batchNo'])
const reorderableColumnKeys = new Set(defaultVisibleColumnKeys.filter((key) => !pinnedDataColumnKeys.has(key)))
const headerCollapsedTextWidth = 30
const headerHideIconWidth = 24
const headerSorterWidth = 18
const headerIconGap = 4
const headerCellPadding = 32

const getHeaderMinWidth = (column: TableColumnData) =>
  headerCellPadding
  + headerCollapsedTextWidth
  + headerIconGap
  + headerHideIconWidth
  + (column.sortable ? headerIconGap + headerSorterWidth : 0)

const getColumnKey = (column?: BatchTableColumnData | TableColumnData): BatchColumnKey | undefined => {
  const dataIndex = column?.dataIndex as BatchColumnKey | undefined
  if (dataIndex && hideableColumnKeys.has(dataIndex)) return dataIndex
  return columnTitleKeyMap.get(String(column?.title))
}

const addInteractiveColumnState = (column: BatchTableColumnData): BatchTableColumnData => {
  const columnKey = getColumnKey(column)
  if (!columnKey) return column
  const minWidth = Math.max(column.minWidth ?? 0, getHeaderMinWidth(column))

  return {
    ...column,
    minWidth,
    width: Math.max(column.width ?? minWidth, minWidth),
    titleSlotName: 'hideableHeader',
    hideKey: columnKey,
    headerCellClass: {
      [`batch-table-column-${columnKey}`]: true,
      'batch-table-drop-target': dragOverColumnKey.value === columnKey,
      'batch-table-dragging': draggingColumnKey.value === columnKey,
    },
  }
}

const rawBaseColumns: BatchTableColumnData[] = [
  { title: '', slotName: 'selection', width: 46, align: 'center', fixed: 'left' },
  { title: '批次号', dataIndex: 'batchNo', slotName: 'batchNo', width: 180, minWidth: 150, fixed: 'left' },
  { title: '仓库', dataIndex: 'warehouseCode', width: 90, minWidth: 80, align: 'center' },
  { title: '商品编码', dataIndex: 'productCode', width: 132, minWidth: 116, align: 'center', ellipsis: true, tooltip: true },
  { title: 'SKU', dataIndex: 'sku', width: 150, minWidth: 130, align: 'center', ellipsis: true, tooltip: true },
  { title: '商品名称', dataIndex: 'productName', width: 190, minWidth: 160, ellipsis: true, tooltip: true },
  { title: '规格型号', dataIndex: 'specModel', width: 120, minWidth: 108, align: 'center', ellipsis: true, tooltip: true },
  { title: '单位', dataIndex: 'unit', width: 70, minWidth: 64, align: 'center' },
  { title: '批次数量', dataIndex: 'batchQty', slotName: 'batchQty', width: 144, minWidth: 116, align: 'right', sortable: { sortDirections: ['ascend', 'descend'] } },
  { title: '可用数量', dataIndex: 'availableQty', slotName: 'availableQty', width: 144, minWidth: 116, align: 'right', sortable: { sortDirections: ['ascend', 'descend'] } },
  { title: '锁定数量', dataIndex: 'lockedQty', slotName: 'lockedQty', width: 132, minWidth: 104, align: 'right' },
  { title: '生产日期', dataIndex: 'productionDate', width: 112, minWidth: 104, align: 'center' },
  { title: '有效期至', dataIndex: 'expireDate', slotName: 'expireDate', width: 112, minWidth: 104, align: 'center' },
  { title: '供应商', dataIndex: 'supplier', width: 160, minWidth: 132, ellipsis: true, tooltip: true },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 86, minWidth: 76, align: 'center' },
  { title: '操作', slotName: 'operation', width: 78, align: 'center', fixed: 'right' },
]

const columnTitleKeyMap = new Map(
  rawBaseColumns
    .filter((column) => column.dataIndex)
    .map((column) => [String(column.title), column.dataIndex as BatchColumnKey])
)
const columnByKey = new Map(
  rawBaseColumns
    .filter((column) => column.dataIndex)
    .map((column) => [column.dataIndex as BatchColumnKey, column])
)

const columns = computed(() => {
  const operationColumns = rawBaseColumns.filter((column) => !getColumnKey(column))
  const dataColumns = columnOrder.value
    .filter((columnKey) => visibleColumnKeys.value.includes(columnKey))
    .map((columnKey) => columnByKey.get(columnKey))
    .filter((column): column is BatchTableColumnData => Boolean(column))
    .map(addInteractiveColumnState)

  return [
    ...operationColumns.filter((column) => column.fixed !== 'right'),
    ...dataColumns,
    ...operationColumns.filter((column) => column.fixed === 'right'),
  ]
})

const tableScrollX = computed(() =>
  columns.value.reduce((total, column) => total + (column.width ?? column.minWidth ?? 80), 0)
)

const hideColumnByKey = (columnKey?: BatchColumnKey) => {
  if (!columnKey || !hideableColumnKeys.has(columnKey)) return
  visibleColumnKeys.value = visibleColumnKeys.value.filter((key) => key !== columnKey)
  if (dragOverColumnKey.value === columnKey) dragOverColumnKey.value = undefined
  if (draggingColumnKey.value === columnKey) draggingColumnKey.value = undefined
}

const isReorderableColumn = (column: BatchTableColumnData | TableColumnData) => {
  const columnKey = getColumnKey(column)
  return Boolean(columnKey && reorderableColumnKeys.has(columnKey))
}

const clearColumnDragState = () => {
  pendingDragColumnKey.value = undefined
  draggingColumnKey.value = undefined
  dragOverColumnKey.value = undefined
  if (columnDragMouseupCleanup) {
    columnDragMouseupCleanup()
    columnDragMouseupCleanup = undefined
  }
}

const reorderColumn = (sourceColumnKey: BatchColumnKey, targetColumnKey: BatchColumnKey) => {
  const nextOrder = columnOrder.value.filter((key) => key !== sourceColumnKey)
  const targetIndex = nextOrder.indexOf(targetColumnKey)
  if (targetIndex >= 0) nextOrder.splice(targetIndex, 0, sourceColumnKey)
  columnOrder.value = nextOrder
}

const startColumnDrag = (event: MouseEvent, columnKey?: BatchColumnKey) => {
  if (event.button !== 0) return
  if (!columnKey || !reorderableColumnKeys.has(columnKey)) {
    return
  }

  pendingDragColumnKey.value = columnKey
  columnDragStartX.value = event.clientX
  if (!columnDragMouseupCleanup) {
    const handleMouseup = () => clearColumnDragState()
    window.addEventListener('mouseup', handleMouseup, { once: true })
    columnDragMouseupCleanup = () => window.removeEventListener('mouseup', handleMouseup)
  }
}

const moveColumnDrag = (event: MouseEvent, targetColumnKey?: BatchColumnKey) => {
  const sourceColumnKey = pendingDragColumnKey.value ?? draggingColumnKey.value
  if (
    !sourceColumnKey
    || !targetColumnKey
    || sourceColumnKey === targetColumnKey
    || !reorderableColumnKeys.has(sourceColumnKey)
    || !reorderableColumnKeys.has(targetColumnKey)
    || Math.abs(event.clientX - columnDragStartX.value) < 8
  ) return

  draggingColumnKey.value = sourceColumnKey
  dragOverColumnKey.value = targetColumnKey
  reorderColumn(sourceColumnKey, targetColumnKey)
}

const getColumnKeyFromHeaderCell = (headerCell: Element | null): BatchColumnKey | undefined => {
  const columnClass = Array.from(headerCell?.classList ?? [])
    .find((className) => className.startsWith('batch-table-column-'))
  const columnKey = columnClass?.replace('batch-table-column-', '') as BatchColumnKey | undefined
  return columnKey && hideableColumnKeys.has(columnKey) ? columnKey : undefined
}

const getHeaderCellFromEvent = (event: MouseEvent) => {
  const target = event.target
  if (!(target instanceof Element)) return null
  return target.closest('.arco-table-th')
}

const handleDelegatedHeaderMouseDown = (event: MouseEvent) => {
  const headerCell = getHeaderCellFromEvent(event)
  const columnKey = getColumnKeyFromHeaderCell(headerCell)
  if (!columnKey) return

  const target = event.target
  if (target instanceof Element && target.closest('.column-hide-button')) {
    event.preventDefault()
    event.stopPropagation()
    hideColumnByKey(columnKey)
    return
  }

  startColumnDrag(event, columnKey)
}

const handleDelegatedHeaderMouseMove = (event: MouseEvent) => {
  moveColumnDrag(event, getColumnKeyFromHeaderCell(getHeaderCellFromEvent(event)))
}

const handleDelegatedHeaderMouseOut = (event: MouseEvent) => {
  const columnKey = getColumnKeyFromHeaderCell(getHeaderCellFromEvent(event))
  if (dragOverColumnKey.value === columnKey) dragOverColumnKey.value = undefined
}

onMounted(() => {
  const tableWrapper = tableWrapperRef.value
  if (!tableWrapper) return

  tableWrapper.addEventListener('mousedown', handleDelegatedHeaderMouseDown, true)
  tableWrapper.addEventListener('mousemove', handleDelegatedHeaderMouseMove, true)
  tableWrapper.addEventListener('mouseout', handleDelegatedHeaderMouseOut, true)
  tableHeaderDelegationCleanup = () => {
    tableWrapper.removeEventListener('mousedown', handleDelegatedHeaderMouseDown, true)
    tableWrapper.removeEventListener('mousemove', handleDelegatedHeaderMouseMove, true)
    tableWrapper.removeEventListener('mouseout', handleDelegatedHeaderMouseOut, true)
  }
})

onBeforeUnmount(() => {
  clearColumnDragState()
  tableHeaderDelegationCleanup?.()
})

const logColumns: TableColumnData[] = [
  { title: '序号', dataIndex: 'seqNo', width: 140, align: 'center' },
  { title: '关联单号', dataIndex: 'relatedNo', width: 140, align: 'center', ellipsis: true, tooltip: true },
  { title: '类型', slotName: 'type', width: 100, align: 'center' },
  { title: '仓库', dataIndex: 'warehouse', width: 100, align: 'center' },
  { title: '平台站点', dataIndex: 'platformSite', width: 100, align: 'center' },
  { title: '状态', slotName: 'logStatus', width: 86, align: 'center' },
  { title: '入库类型', dataIndex: 'inboundType', width: 100, align: 'center' },
  { title: '出库类型', dataIndex: 'outboundType', width: 100, align: 'center' },
  { title: '操作人', dataIndex: 'creator', width: 80, align: 'center' },
  { title: '创建时间', dataIndex: 'createTime', width: 160, align: 'center' },
]

const filteredRows = computed(() => {
  let rows = [...allRows.value]
  const keyword = filters.value.keyword.trim().toLowerCase()

  if (keyword) {
    rows = rows.filter((row) =>
      [row.batchNo, row.productName, row.sku].some((field) => field.toLowerCase().includes(keyword))
    )
  }

  if (filters.value.warehouse) rows = rows.filter((row) => row.warehouseCode === filters.value.warehouse)
  if (filters.value.status) rows = rows.filter((row) => row.status === filters.value.status)

  if (filters.value.dateRange.length === 2) {
    const [start, end] = filters.value.dateRange
    rows = rows.filter((row) => row.productionDate >= start && row.productionDate <= end)
  }

  return rows
})

const pagedRows = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.pageSize
  return filteredRows.value.slice(start, start + pagination.value.pageSize)
})

const statusClass = (status: BatchStatus | string) => `status-${status}`
const getStatusLabel = (status: BatchStatus | string) => statusLabels[status as BatchStatus] ?? status

const isNearExpire = (date?: string) => {
  if (!date) return false
  const diff = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000)
  return diff >= 0 && diff <= 30
}

const isExpired = (date?: string) => Boolean(date && new Date(date) < new Date())

const handleSearch = () => {
  pagination.value.page = 1
}

const resetFilters = () => {
  filters.value = {
    keyword: '',
    warehouse: undefined,
    status: undefined,
    dateRange: [],
  }
  selectedRowKeys.value = []
  handleSearch()
}

const refreshData = () => {
  loading.value = true
  allRows.value = createBatchRows(86)
  selectedRowKeys.value = []
  loading.value = false
}

const toggleRowSelection = (id: string, checked: boolean | (string | number | boolean)[]) => {
  const isChecked = Array.isArray(checked) ? checked.includes(id) : checked
  if (isChecked && !selectedRowKeys.value.includes(id)) {
    selectedRowKeys.value = [...selectedRowKeys.value, id]
    return
  }
  if (!isChecked) selectedRowKeys.value = selectedRowKeys.value.filter((item) => item !== id)
}

const openDetail = (row: BatchRow) => {
  currentRow.value = row
  detailVisible.value = true
}

const closeDetail = () => {
  detailVisible.value = false
}

const createOperateLogs = (): OperateLog[] => {
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

const openLogs = () => {
  operateLogs.value = createOperateLogs()
  activeLogTab.value = 'operate'
  logVisible.value = true
}

const closeLogs = () => {
  logVisible.value = false
}
</script>

<template>
  <div class="batch-inventory-page">
    <section class="page-header">
      <div class="header-left">
        <h1 class="page-title">批次库存</h1>
        <span class="page-desc">实时追踪各仓库批次商品的入库、库存与流转状态</span>
      </div>
    </section>

    <section class="summary-strip">
      <div class="summary-grid">
        <div v-for="card in summaryCards" :key="card.label" class="summary-metric">
          <span>{{ card.label }}</span>
          <strong>{{ card.value }}</strong>
          <small>{{ card.note }}</small>
        </div>
      </div>
    </section>

    <section class="filter-panel-shell volc-design-common-table-query">
      <div class="filter-panel">
        <div class="filter-row">
          <div class="volc-design-search-item-wrap batch-filter-keyword">
            <div class="volc-design-search-item-label">
              <span>关键词</span>
            </div>
            <a-input-search
              v-model="filters.keyword"
              allow-clear
              placeholder="搜索批次号 / 商品名称 / SKU"
              class="volc-design-search-item filter-search"
              @search="handleSearch"
              @press-enter="handleSearch"
              @clear="handleSearch"
            />
          </div>

          <div class="volc-design-search-item-wrap">
            <div class="volc-design-search-item-label">
              <span>仓库</span>
            </div>
            <a-select v-model="filters.warehouse" placeholder="全部仓库" allow-clear class="volc-design-search-item" @change="handleSearch">
              <a-option v-for="warehouse in warehouses" :key="warehouse.value" :value="warehouse.value">
                {{ warehouse.label }}
              </a-option>
            </a-select>
          </div>

          <div class="volc-design-search-item-wrap">
            <div class="volc-design-search-item-label">
              <span>状态</span>
            </div>
            <a-select v-model="filters.status" placeholder="全部状态" allow-clear class="volc-design-search-item" @change="handleSearch">
              <a-option value="normal">正常</a-option>
              <a-option value="expired">已过期</a-option>
              <a-option value="locked">锁定</a-option>
              <a-option value="warning">预警</a-option>
            </a-select>
          </div>

          <div class="volc-design-search-item-wrap batch-filter-date">
            <div class="volc-design-search-item-label">
              <span>日期范围</span>
            </div>
            <a-range-picker
              v-model="filters.dateRange"
              value-format="YYYY-MM-DD"
              :placeholder="['开始', '结束']"
              class="volc-design-search-item filter-date-picker"
              @change="handleSearch"
            />
          </div>

          <div class="filter-actions-bar">
            <a-button type="primary" class="volc-design-button" @click="handleSearch">查询</a-button>
            <a-button class="volc-design-button" @click="resetFilters">重置</a-button>
            <a-tooltip content="刷新">
              <a-button size="small" class="filter-icon-button" aria-label="刷新" :loading="loading" @click="refreshData">
                <template #icon>
                  <icon-refresh />
                </template>
              </a-button>
            </a-tooltip>
            <a-tooltip content="导出数据">
              <a-button size="small" class="filter-icon-button" aria-label="导出数据">
                <template #icon>
                  <icon-download />
                </template>
              </a-button>
            </a-tooltip>
          </div>
        </div>
      </div>
    </section>

    <section ref="tableWrapperRef" class="table-wrapper">
      <a-table
        :columns="columns"
        :data="pagedRows"
        row-key="id"
        :pagination="false"
        :scroll="{ x: tableScrollX }"
        :loading="loading"
        column-resizable
        class="data-table"
      >
        <template #hideableHeader="{ column }">
          <span
            class="hideable-table-header"
            :class="{
              'is-draggable': isReorderableColumn(column),
              'is-dragging': draggingColumnKey === getColumnKey(column) || pendingDragColumnKey === getColumnKey(column),
            }"
          >
            <span class="hideable-table-header-title">{{ column.title }}</span>
            <a-tooltip content="隐藏列">
              <button
                type="button"
                class="column-hide-button"
                :aria-label="`隐藏列 ${column.title}`"
                @click.prevent.stop
                @mousedown.prevent.stop
                @dragstart.prevent.stop
              >
                <icon-eye-invisible />
              </button>
            </a-tooltip>
          </span>
        </template>

        <template #selection="{ record }">
          <a-checkbox
            :model-value="selectedRowKeys.includes(record.id)"
            @change="(checked) => toggleRowSelection(record.id, checked)"
          />
        </template>

        <template #batchNo="{ record }">
          <button type="button" class="cell-link" @click.stop="openDetail(record)">{{ record.batchNo }}</button>
        </template>

        <template #batchQty="{ record }">
          <span class="num-primary">{{ formatNumber(record.batchQty) }}</span>
        </template>

        <template #availableQty="{ record }">
          <span class="num-success">{{ formatNumber(record.availableQty) }}</span>
        </template>

        <template #lockedQty="{ record }">
          <span class="num-muted">{{ formatNumber(record.lockedQty) }}</span>
        </template>

        <template #expireDate="{ record }">
          <span :class="{ 'text-danger': isNearExpire(record.expireDate), 'text-muted': isExpired(record.expireDate) }">
            {{ record.expireDate }}
          </span>
        </template>

        <template #status="{ record }">
          <span class="status-pill" :class="statusClass(record.status)">{{ getStatusLabel(record.status) }}</span>
        </template>

        <template #operation>
          <a-button type="primary" size="small" status="normal" @click.stop="openLogs">日志</a-button>
        </template>
      </a-table>

      <div class="pagination-wrapper">
        <a-pagination
          v-model:current="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="filteredRows.length"
          :page-size-options="[20, 50, 100]"
          show-total
          show-jumper
          show-page-size
        />
      </div>
    </section>

    <a-modal
      v-if="detailVisible"
      v-model:visible="detailVisible"
      title="批次详情"
      :width="680"
      modal-class="detail-dlg"
      unmount-on-close
      @ok="closeDetail"
      @cancel="closeDetail"
    >
      <a-descriptions v-if="currentRow" :column="2" bordered class="detail-desc">
        <a-descriptions-item label="批次号">{{ currentRow.batchNo }}</a-descriptions-item>
        <a-descriptions-item label="仓库编码">{{ currentRow.warehouseCode }}</a-descriptions-item>
        <a-descriptions-item label="商品编码">{{ currentRow.productCode }}</a-descriptions-item>
        <a-descriptions-item label="SKU">{{ currentRow.sku }}</a-descriptions-item>
        <a-descriptions-item label="商品名称" :span="2">{{ currentRow.productName }}</a-descriptions-item>
        <a-descriptions-item label="规格型号">{{ currentRow.specModel }}</a-descriptions-item>
        <a-descriptions-item label="单位">{{ currentRow.unit }}</a-descriptions-item>
        <a-descriptions-item label="批次数量">
          <span class="num-primary">{{ formatNumber(currentRow.batchQty) }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="可用数量">
          <span class="num-success">{{ formatNumber(currentRow.availableQty) }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="锁定数量">
          <span class="num-muted">{{ formatNumber(currentRow.lockedQty) }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="生产日期">{{ currentRow.productionDate }}</a-descriptions-item>
        <a-descriptions-item label="有效期至">{{ currentRow.expireDate }}</a-descriptions-item>
        <a-descriptions-item label="供应商">{{ currentRow.supplier }}</a-descriptions-item>
        <a-descriptions-item label="入库单号">{{ currentRow.inboundOrderNo }}</a-descriptions-item>
        <a-descriptions-item label="入库时间">{{ currentRow.inboundTime }}</a-descriptions-item>
        <a-descriptions-item label="操作人">{{ currentRow.operator }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <span class="status-pill" :class="statusClass(currentRow.status)">{{ getStatusLabel(currentRow.status) }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">{{ currentRow.remark || '-' }}</a-descriptions-item>
      </a-descriptions>
      <template #footer>
        <a-button type="primary" @click="closeDetail">确定</a-button>
      </template>
    </a-modal>

    <a-modal
      v-if="logVisible"
      v-model:visible="logVisible"
      title="操作日志"
      :width="720"
      modal-class="log-dlg"
      unmount-on-close
      @ok="closeLogs"
      @cancel="closeLogs"
    >
      <div class="log-dialog">
        <div class="log-tabs">
          <button
            v-for="tabItem in [
              { key: 'operate', label: '操作日志' },
              { key: 'cost', label: '成本调整' },
            ]"
            :key="tabItem.key"
            type="button"
            class="log-tab"
            :class="{ active: activeLogTab === tabItem.key }"
            @click="activeLogTab = tabItem.key as LogTab"
          >
            {{ tabItem.label }}
            <span v-if="activeLogTab === tabItem.key" class="log-tab-indicator" />
          </button>
        </div>

        <div v-if="activeLogTab === 'operate'" class="log-table-wrap">
          <a-table :columns="logColumns" :data="operateLogs" :pagination="false" size="small" class="log-table">
            <template #type="{ record }">
              <span class="type-tag">{{ record.type || '--' }}</span>
            </template>
            <template #logStatus="{ record }">
              <span :class="record.status === '良品' ? 'text-good' : 'text-muted'">{{ record.status || '--' }}</span>
            </template>
          </a-table>
          <div class="log-pagination">
            <span class="log-total">共 {{ operateLogs.length }} 条记录</span>
            <a-pagination :total="operateLogs.length" :page-size="20" size="small" />
          </div>
        </div>

        <div v-else class="log-empty">
          <div class="empty-icon">
            <icon-sync />
          </div>
          <p class="empty-text">暂无成本调整日志</p>
          <p class="empty-hint">成本调整记录将在此处展示</p>
        </div>
      </div>
      <template #footer>
        <a-button type="primary" @click="closeLogs">确定</a-button>
      </template>
    </a-modal>
  </div>
</template>

<style scoped>
.batch-inventory-page {
  --batch-color-primary: rgb(var(--primary-6));
  --batch-color-text: var(--color-text-1);
  --batch-color-text-secondary: var(--color-text-2);
  --batch-color-text-tertiary: var(--color-text-3);
  --batch-color-bg: var(--color-bg-2);
  --batch-color-fill: var(--color-fill-1);
  --batch-color-border: var(--color-border-2);
  --batch-color-control-border: var(--color-border-2);
  --batch-color-hover-bg: var(--color-fill-2);
  --batch-control-height: var(--size-default, 32px);
  --batch-radius: var(--border-radius-medium);
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 16px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 0 2px;
}

.header-left {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.page-title {
  margin: 0;
  color: var(--batch-color-text);
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
}

.page-desc {
  color: var(--batch-color-text-secondary);
  font-size: 13px;
  line-height: 20px;
}

.summary-strip,
.table-wrapper {
  border: 1px solid var(--batch-color-border);
  border-radius: 8px;
  background: var(--batch-color-bg);
  box-shadow: none;
}

.summary-strip {
  overflow: hidden;
  padding: 18px 0;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.summary-metric {
  display: flex;
  min-height: 86px;
  flex-direction: column;
  justify-content: center;
  padding: 0 28px;
}

.summary-metric + .summary-metric {
  border-left: 1px solid var(--batch-color-border);
}

.summary-metric span {
  margin-bottom: 8px;
  color: var(--batch-color-text-secondary);
  font-size: 13px;
  line-height: 20px;
}

.summary-metric strong {
  margin-bottom: 6px;
  color: var(--batch-color-text);
  font-size: 26px;
  font-weight: 600;
  line-height: 32px;
}

.summary-metric small {
  color: var(--batch-color-text-tertiary);
  font-size: 12px;
  line-height: 18px;
}

.filter-panel-shell {
  padding-top: 2px;
}

.filter-panel {
  padding: 0;
  background: var(--batch-color-bg);
}

.filter-row {
  display: flex;
  align-items: flex-start;
  gap: 12px 16px;
  flex-wrap: wrap;
}

.volc-design-search-item-wrap {
  display: flex;
  min-width: 300px;
  width: 300px;
  max-width: none;
  align-items: stretch;
}

.batch-filter-keyword {
  width: 300px;
  max-width: 300px;
}

.batch-filter-date {
  min-width: 360px;
  width: 380px;
  max-width: none;
}

.volc-design-search-item-wrap:hover :deep(.arco-select-view-single),
.volc-design-search-item-wrap:focus-within :deep(.arco-select-view-single),
.volc-design-search-item-wrap:hover :deep(.arco-input-wrapper),
.volc-design-search-item-wrap:focus-within :deep(.arco-input-wrapper),
.volc-design-search-item-wrap:hover :deep(.arco-picker),
.volc-design-search-item-wrap:focus-within :deep(.arco-picker) {
  border-color: var(--batch-color-primary);
  box-shadow: 0 4px 10px rgba(var(--primary-6), 0.12);
}

.volc-design-search-item-label {
  display: flex;
  height: var(--batch-control-height);
  align-items: center;
  flex-shrink: 0;
  padding: 0 16px;
  border: 1px solid var(--batch-color-control-border);
  border-right: 0;
  border-radius: var(--batch-radius) 0 0 var(--batch-radius);
  background: var(--batch-color-bg);
  color: var(--batch-color-text-secondary);
  font-size: 14px;
  line-height: var(--batch-control-height);
  white-space: nowrap;
}

.volc-design-search-item-label span {
  display: inline-flex;
  align-items: center;
}

.volc-design-search-item {
  min-width: 0;
  flex: 1;
  width: 100%;
}

.filter-actions-bar {
  display: flex;
  min-width: max-content;
  flex: 1 0 240px;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-left: auto;
}

.filter-actions-bar :deep(.arco-btn) {
  border-radius: 4px;
}

.volc-design-button {
  height: var(--batch-control-height);
}

.filter-icon-button {
  width: var(--batch-control-height);
  height: var(--batch-control-height);
  padding: 0;
  border-color: var(--batch-color-control-border);
  background: var(--batch-color-bg);
  color: var(--batch-color-text-secondary);
  box-shadow: none;
}

.filter-icon-button:hover,
.filter-icon-button:focus-visible {
  border-color: var(--batch-color-primary);
  background: var(--batch-color-bg);
  color: var(--batch-color-text-secondary);
  box-shadow: 0 4px 10px rgba(var(--primary-6), 0.16);
}

.filter-panel :deep(.arco-select-view-single),
.filter-panel :deep(.arco-input-wrapper),
.filter-panel :deep(.arco-picker) {
  height: var(--batch-control-height);
  border-color: var(--batch-color-control-border);
  border-radius: 0 var(--batch-radius) var(--batch-radius) 0;
  background: var(--batch-color-bg);
  box-shadow: none;
}

.filter-panel :deep(.volc-design-search-item .arco-select-view-single),
.filter-panel :deep(.volc-design-search-item .arco-input-wrapper),
.filter-panel :deep(.volc-design-search-item.arco-picker) {
  margin-left: -1px;
}

.filter-panel :deep(.arco-select-view-value),
.filter-panel :deep(.arco-input) {
  font-size: 13px;
}

.table-wrapper {
  overflow: hidden;
}

.data-table :deep(.arco-table-th) {
  background: var(--batch-color-fill);
  color: var(--batch-color-text-secondary);
  font-weight: 600;
}

.hideable-table-header {
  display: flex;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  align-items: center;
  gap: 4px;
  vertical-align: middle;
}

.hideable-table-header.is-draggable {
  cursor: grab;
}

.hideable-table-header.is-dragging {
  cursor: grabbing;
  opacity: 0.58;
}

.hideable-table-header-title {
  min-width: 30px;
  overflow: hidden;
  flex: 1 1 auto;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.column-hide-button {
  display: inline-flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  flex: 0 0 24px;
  padding: 0;
  border: 0;
  border-radius: 4px;
  margin: 0;
  background: transparent;
  color: var(--batch-color-text-secondary);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.12s ease, background-color 0.12s ease, color 0.12s ease;
}

.hideable-table-header:hover .column-hide-button,
.column-hide-button:focus-visible,
:global(.batch-inventory-page .arco-table-th:hover .column-hide-button) {
  opacity: 1;
}

.column-hide-button:hover,
.column-hide-button:focus-visible {
  background: var(--batch-color-fill);
  color: var(--batch-color-text);
  outline: none;
}

.data-table :deep(.arco-table-column-handle) {
  right: -7px;
  z-index: 20;
  width: 14px;
}

.data-table :deep(.arco-table-column-handle::after) {
  position: absolute;
  top: 0;
  left: 50%;
  width: 2px;
  height: 100vh;
  background: transparent;
  content: '';
  pointer-events: none;
  transform: translateX(-50%);
}

.data-table :deep(.arco-table-column-handle:hover::after),
.data-table :deep(.arco-table-th-resizing .arco-table-column-handle::after) {
  background: var(--batch-color-primary);
}

.data-table :deep(.arco-table-border-cell .arco-table-th-resizing),
.data-table :deep(.arco-table-border-cell .arco-table-td-resizing:not(.arco-table-tr-expand)),
.data-table :deep(.arco-table-border-header-cell .arco-table-th-resizing),
.data-table :deep(.arco-table-border-header-cell .arco-table-td-resizing:not(.arco-table-tr-expand)) {
  border-right-color: #e9edf3;
}

.data-table :deep(.arco-table-container) {
  border: 0;
}

.data-table :deep(.arco-table-border .arco-table-container::before),
.data-table :deep(.arco-table-border .arco-table-container::after),
.data-table :deep(.arco-table-border .arco-table-container .arco-table),
.data-table :deep(.arco-table-border .arco-table-tr::after),
.data-table :deep(.arco-table-border .arco-table-th),
.data-table :deep(.arco-table-border .arco-table-td) {
  border-color: #e9edf3;
}

.data-table :deep(.arco-table-td) {
  background: var(--batch-color-bg);
  white-space: nowrap;
}

.data-table :deep(.arco-table-th:hover),
.data-table :deep(.arco-table-th.batch-table-drop-target) {
  background: var(--batch-color-hover-bg);
}

.data-table :deep(.arco-table-tr:hover .arco-table-td) {
  background: var(--batch-color-hover-bg);
}

.cell-link {
  border: 0;
  background: transparent;
  color: var(--batch-color-primary);
  cursor: pointer;
  font-weight: 500;
  padding: 0;
  text-align: left;
}

.cell-link:hover {
  text-decoration: underline;
}

.num-primary,
.num-success,
.num-muted {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.num-primary {
  color: var(--batch-color-primary);
}

.num-success,
.text-good {
  color: #00b42a;
}

.num-muted,
.text-muted {
  color: var(--batch-color-text-tertiary);
}

.text-danger {
  color: #f53f3f;
}

.status-pill,
.type-tag {
  display: inline-flex;
  height: 22px;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 12px;
  line-height: 22px;
}

.status-normal {
  background: rgba(0, 180, 42, 0.12);
  color: #00b42a;
}

.status-expired {
  background: rgba(245, 63, 63, 0.12);
  color: #f53f3f;
}

.status-locked {
  background: rgba(78, 89, 105, 0.12);
  color: #4e5969;
}

.status-warning {
  background: rgba(255, 125, 0, 0.14);
  color: #ff7d00;
}

.type-tag {
  background: rgba(var(--primary-6), 0.08);
  color: var(--batch-color-primary);
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 16px 18px 18px;
}

.detail-desc {
  margin-top: 4px;
}

.log-dialog {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.log-tabs {
  display: flex;
  gap: 18px;
  border-bottom: 1px solid var(--batch-color-border);
}

.log-tab {
  position: relative;
  height: 34px;
  border: 0;
  background: transparent;
  color: var(--batch-color-text-secondary);
  cursor: pointer;
  font-size: 13px;
}

.log-tab.active {
  color: var(--batch-color-primary);
  font-weight: 600;
}

.log-tab-indicator {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 2px;
  border-radius: 999px;
  background: var(--batch-color-primary);
}

.log-table-wrap {
  overflow: hidden;
}

.log-table :deep(.arco-table-th) {
  background: var(--batch-color-fill);
}

.log-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
}

.log-total {
  color: var(--batch-color-text-tertiary);
  font-size: 12px;
}

.log-empty {
  display: grid;
  min-height: 240px;
  place-items: center;
  align-content: center;
  gap: 8px;
  color: var(--batch-color-text-tertiary);
}

.empty-icon {
  font-size: 36px;
  color: var(--batch-color-text-tertiary);
}

.empty-text {
  margin: 0;
  color: var(--batch-color-text-secondary);
  font-size: 14px;
}

.empty-hint {
  margin: 0;
  font-size: 12px;
}

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .summary-metric:nth-child(4) {
    border-left: 0;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .summary-metric + .summary-metric {
    border-left: 0;
    border-top: 1px solid var(--batch-color-border);
  }

  .volc-design-search-item-wrap,
  .batch-filter-keyword,
  .batch-filter-date,
  .filter-actions-bar {
    width: 100%;
    max-width: 100%;
  }

  .filter-actions-bar {
    justify-content: flex-start;
    margin-left: 0;
  }
}
</style>
