import type { ConfigurableTableColumn } from './configurableTable'
import { getSalesProductImage } from './salesProductMedia'

export type PurchasePageKey = 'order' | 'delivery' | 'return' | 'changeLog'
export type PurchaseViewMode = 'document' | 'product'
export type PurchaseFilterKind = 'search' | 'select' | 'multiSelect' | 'dateRange'
export type PurchaseStatusTone = 'success' | 'warning' | 'danger' | 'processing' | 'neutral'

export type PurchaseOption = {
  value: string
  label: string
}

export type PurchaseFilterConfig = {
  key: string
  label: string
  kind: PurchaseFilterKind
  placeholder?: string
  width?: string
  minWidth?: string
  options?: PurchaseOption[]
}

export type PurchaseStatusTab = {
  value: string
  label: string
  tone?: PurchaseStatusTone
}

export type PurchaseRow = {
  id: string
  pageKey: PurchasePageKey
  purchaseNo?: string
  deliveryNo?: string
  returnNo?: string
  documentNo?: string
  status: string
  supplier: string
  purchaseType?: string
  destinationWarehouse?: string
  deliveryWarehouse?: string
  site?: string
  productName?: string
  sku?: string
  msku?: string
  fnsku?: string
  productImage?: string
  purchaseQuantity?: number
  deliveryQuantity?: number
  actualDeliveryQuantity?: number
  receivedQuantity?: number
  beforeStorageReturnQuantity?: number
  afterStorageReturnQuantity?: number
  returnQuantity?: number
  qualityStatus?: string
  returnType?: string
  warehouse?: string
  firstMile?: string
  shipmentNo?: string
  settlementMethod?: string
  expectedDeliveryDate?: string
  changedExpectedDeliveryDate?: string
  diffDays?: number
  responsibilityParty?: string
  changeReason?: string
  owner?: string
  createdBy?: string
  changedBy?: string
  createdTime?: string
  changeDate?: string
  remark?: string
}

export type PurchaseFilters = Record<string, string | string[] | undefined>
export type PurchasePagination = {
  page: number
  pageSize: number
}

export type PurchasePageConfig = {
  key: PurchasePageKey
  title: string
  description: string
  primaryAction?: string
  secondaryAction?: string
  defaultViewMode?: PurchaseViewMode
  viewModes?: PurchaseOption[]
  statusTabs: PurchaseStatusTab[]
  filters: PurchaseFilterConfig[]
  tableColumns: Array<ConfigurableTableColumn<string> & { title: string }>
  defaultVisibleKeys: string[]
  requiredKeys: string[]
  pinnedColumnKeys: string[]
}

const allStatusTab = { value: 'all', label: '全部', tone: 'neutral' as const }

const supplierOptions = [
  { value: '深圳优越电器', label: '深圳优越电器' },
  { value: '义乌智造供应链', label: '义乌智造供应链' },
  { value: '宁波远航工贸', label: '宁波远航工贸' },
  { value: '东莞森麦科技', label: '东莞森麦科技' },
]

const warehouseOptions = [
  { value: '华南采购仓', label: '华南采购仓' },
  { value: '义乌集货仓', label: '义乌集货仓' },
  { value: '莫斯科海外仓', label: '莫斯科海外仓' },
  { value: '深圳交货仓', label: '深圳交货仓' },
]

const siteOptions = [
  { value: 'Amazon US', label: 'Amazon US' },
  { value: 'Ozon RU', label: 'Ozon RU' },
  { value: 'Wildberries RU', label: 'Wildberries RU' },
  { value: 'TikTok Shop', label: 'TikTok Shop' },
]

const purchaseTypeOptions = [
  { value: '常规采购', label: '常规采购' },
  { value: '补货采购', label: '补货采购' },
  { value: '样品采购', label: '样品采购' },
]

const orderStatusTabs: PurchaseStatusTab[] = [
  allStatusTab,
  { value: 'draft', label: '草稿', tone: 'neutral' },
  { value: 'rejected', label: '审核驳回', tone: 'danger' },
  { value: 'reviewing', label: '审核中', tone: 'processing' },
  { value: 'pending-delivery', label: '待交货', tone: 'warning' },
  { value: 'delivering', label: '交货中', tone: 'processing' },
  { value: 'fully-delivered', label: '全部交货', tone: 'success' },
  { value: 'changing', label: '变更中', tone: 'warning' },
  { value: 'completed', label: '已完成', tone: 'success' },
  { value: 'voided', label: '已作废', tone: 'neutral' },
]

const deliveryStatusTabs: PurchaseStatusTab[] = [
  allStatusTab,
  { value: 'pending-qc', label: '待质检', tone: 'warning' },
  { value: 'quality-checking', label: '质检中', tone: 'processing' },
  { value: 'pending-shipment', label: '待发货', tone: 'warning' },
  { value: 'shipped', label: '已发货', tone: 'processing' },
  { value: 'stocking', label: '入库中', tone: 'processing' },
  { value: 'completed', label: '已完成', tone: 'success' },
  { value: 'voided', label: '已作废', tone: 'neutral' },
]

const returnStatusTabs: PurchaseStatusTab[] = [
  allStatusTab,
  { value: 'pending', label: '待处理', tone: 'warning' },
  { value: 'processed', label: '已处理', tone: 'success' },
  { value: 'voided', label: '已作废', tone: 'neutral' },
]

const changeLogStatusTabs: PurchaseStatusTab[] = [
  allStatusTab,
  { value: 'supplier', label: '责任方：供应商', tone: 'warning' },
  { value: 'buyer', label: '责任方：采购', tone: 'processing' },
  { value: 'warehouse', label: '责任方：仓库', tone: 'neutral' },
]

const pageViewModes = [
  { value: 'document', label: '单据' },
  { value: 'product', label: '产品' },
]

const documentNoColumn = (settingsKey: string, title: string, dataIndex: string) => ({
  settingsKey,
  title,
  dataIndex,
  slotName: 'documentNo',
  width: 168,
  minWidth: 152,
  align: 'left' as const,
})

const productColumn = {
  settingsKey: 'product',
  title: '产品名称/SKU',
  dataIndex: 'productName',
  slotName: 'product',
  width: 240,
  minWidth: 220,
  align: 'left' as const,
}

const statusColumn = {
  settingsKey: 'status',
  title: '单据状态',
  dataIndex: 'status',
  slotName: 'status',
  width: 112,
  minWidth: 96,
  align: 'center' as const,
}

export const purchasePageConfigs: Record<PurchasePageKey, PurchasePageConfig> = {
  order: {
    key: 'order',
    title: '采购订单',
    description: '按采购单和产品双视角跟踪下单、交货、入库与退货进度。',
    primaryAction: '下载1688订单',
    secondaryAction: '更多',
    defaultViewMode: 'product',
    viewModes: pageViewModes,
    statusTabs: orderStatusTabs,
    filters: [
      { key: 'purchaseType', label: '采购类型', kind: 'select', placeholder: '全部类型', options: purchaseTypeOptions },
      { key: 'productKeyword', label: '产品名称', kind: 'search', placeholder: '产品名称 / SKU' },
      { key: 'purchaseNo', label: '采购单号', kind: 'search', placeholder: '采购单号' },
      { key: 'destinationWarehouse', label: '目的仓', kind: 'select', placeholder: '全部仓库', options: warehouseOptions },
      { key: 'site', label: '平台站点', kind: 'select', placeholder: '全部站点', options: siteOptions },
      { key: 'supplier', label: '供应商', kind: 'select', placeholder: '全部供应商', options: supplierOptions },
      { key: 'createdTime', label: '创建时间', kind: 'dateRange', width: '340px', minWidth: '340px' },
    ],
    tableColumns: [
      documentNoColumn('purchaseNo', '采购单号', 'purchaseNo'),
      statusColumn,
      { settingsKey: 'destinationWarehouse', title: '目的仓', dataIndex: 'destinationWarehouse', width: 132, minWidth: 118 },
      { settingsKey: 'deliveryWarehouse', title: '交货仓', dataIndex: 'deliveryWarehouse', width: 132, minWidth: 118 },
      productColumn,
      { settingsKey: 'site', title: '平台站点', dataIndex: 'site', width: 126, minWidth: 112 },
      { settingsKey: 'msku', title: 'MSKU/FNSKU', dataIndex: 'msku', slotName: 'msku', width: 150, minWidth: 136 },
      { settingsKey: 'purchaseQuantity', title: '采购量', dataIndex: 'purchaseQuantity', width: 92, minWidth: 86, align: 'right' },
      { settingsKey: 'deliveryQuantity', title: '交货量', dataIndex: 'deliveryQuantity', width: 92, minWidth: 86, align: 'right' },
      { settingsKey: 'actualDeliveryQuantity', title: '实交量', dataIndex: 'actualDeliveryQuantity', width: 92, minWidth: 86, align: 'right' },
      { settingsKey: 'receivedQuantity', title: '已入库量', dataIndex: 'receivedQuantity', width: 104, minWidth: 94, align: 'right' },
      { settingsKey: 'beforeStorageReturnQuantity', title: '入库前退货量', dataIndex: 'beforeStorageReturnQuantity', width: 128, minWidth: 116, align: 'right' },
      { settingsKey: 'afterStorageReturnQuantity', title: '入库后退货量', dataIndex: 'afterStorageReturnQuantity', width: 128, minWidth: 116, align: 'right' },
      { settingsKey: 'remark', title: '产品资料备注', dataIndex: 'remark', width: 160, minWidth: 140, ellipsis: true, tooltip: true },
      { title: '操作', slotName: 'operation', width: 76, align: 'center' },
    ],
    defaultVisibleKeys: ['purchaseNo', 'status', 'destinationWarehouse', 'deliveryWarehouse', 'product', 'site', 'msku', 'purchaseQuantity', 'deliveryQuantity', 'actualDeliveryQuantity', 'receivedQuantity', 'remark'],
    requiredKeys: ['purchaseNo', 'product'],
    pinnedColumnKeys: ['purchaseNo'],
  },
  delivery: {
    key: 'delivery',
    title: '交货单',
    description: '跟踪供应商交货、质检、发货与入库节点。',
    primaryAction: '导入交货产品',
    defaultViewMode: 'document',
    statusTabs: deliveryStatusTabs,
    filters: [
      { key: 'deliveryNo', label: '交货单号', kind: 'search', placeholder: '交货单号' },
      { key: 'status', label: '单据状态', kind: 'multiSelect', placeholder: '全部状态', options: deliveryStatusTabs.filter((item) => item.value !== 'all') },
      { key: 'deliveryWarehouse', label: '交货仓', kind: 'select', placeholder: '全部仓库', options: warehouseOptions },
      { key: 'site', label: '平台站点', kind: 'select', placeholder: '全部站点', options: siteOptions },
      { key: 'supplier', label: '供应商', kind: 'select', placeholder: '全部供应商', options: supplierOptions },
      { key: 'createdTime', label: '创建时间', kind: 'dateRange', width: '340px', minWidth: '340px' },
    ],
    tableColumns: [
      documentNoColumn('deliveryNo', '交货单号', 'deliveryNo'),
      statusColumn,
      { settingsKey: 'firstMile', title: '头程', dataIndex: 'firstMile', width: 116, minWidth: 104 },
      { settingsKey: 'shipmentNo', title: '货件/发货单号', dataIndex: 'shipmentNo', width: 160, minWidth: 144, ellipsis: true, tooltip: true },
      { settingsKey: 'deliveryWarehouse', title: '交货仓', dataIndex: 'deliveryWarehouse', width: 132, minWidth: 118 },
      { settingsKey: 'supplier', title: '供应商', dataIndex: 'supplier', width: 150, minWidth: 136 },
      { settingsKey: 'settlementMethod', title: '结算方式', dataIndex: 'settlementMethod', width: 112, minWidth: 102 },
      { settingsKey: 'receivedQuantity', title: '已入库量', dataIndex: 'receivedQuantity', width: 104, minWidth: 94, align: 'right' },
      { settingsKey: 'deliveryQuantity', title: '交货量', dataIndex: 'deliveryQuantity', width: 92, minWidth: 86, align: 'right' },
      { settingsKey: 'actualDeliveryQuantity', title: '实交量', dataIndex: 'actualDeliveryQuantity', width: 92, minWidth: 86, align: 'right' },
      { settingsKey: 'createdTime', title: '创建时间', dataIndex: 'createdTime', width: 160, minWidth: 150, align: 'center' },
      { title: '操作', slotName: 'operation', width: 76, align: 'center' },
    ],
    defaultVisibleKeys: ['deliveryNo', 'status', 'firstMile', 'shipmentNo', 'deliveryWarehouse', 'supplier', 'settlementMethod', 'receivedQuantity', 'deliveryQuantity', 'actualDeliveryQuantity', 'createdTime'],
    requiredKeys: ['deliveryNo'],
    pinnedColumnKeys: ['deliveryNo'],
  },
  return: {
    key: 'return',
    title: '采购退货单',
    description: '聚合入库前后退货、供应商处理与质量状态。',
    primaryAction: '发起退货',
    defaultViewMode: 'product',
    viewModes: pageViewModes,
    statusTabs: returnStatusTabs,
    filters: [
      { key: 'returnNo', label: '退货单号', kind: 'search', placeholder: '退货单号' },
      { key: 'warehouse', label: '仓库', kind: 'select', placeholder: '全部仓库', options: warehouseOptions },
      { key: 'supplier', label: '供应商', kind: 'select', placeholder: '全部供应商', options: supplierOptions },
      { key: 'returnType', label: '退货类型', kind: 'select', placeholder: '全部类型', options: [{ value: '入库前退货', label: '入库前退货' }, { value: '入库后退货', label: '入库后退货' }] },
      { key: 'createdBy', label: '创建人', kind: 'select', placeholder: '全部创建人', options: [{ value: '林夏', label: '林夏' }, { value: '陈越', label: '陈越' }] },
      { key: 'sku', label: 'SKU', kind: 'search', placeholder: 'SKU' },
    ],
    tableColumns: [
      documentNoColumn('returnNo', '退货单号', 'returnNo'),
      statusColumn,
      productColumn,
      { settingsKey: 'warehouse', title: '仓库', dataIndex: 'warehouse', width: 132, minWidth: 118 },
      { settingsKey: 'supplier', title: '供应商', dataIndex: 'supplier', width: 150, minWidth: 136 },
      { settingsKey: 'returnType', title: '退货类型', dataIndex: 'returnType', width: 120, minWidth: 108 },
      { settingsKey: 'qualityStatus', title: '质量状态', dataIndex: 'qualityStatus', width: 108, minWidth: 98 },
      { settingsKey: 'returnQuantity', title: '总数量', dataIndex: 'returnQuantity', width: 92, minWidth: 86, align: 'right' },
      { settingsKey: 'createdBy', title: '创建人', dataIndex: 'createdBy', width: 96, minWidth: 88 },
      { settingsKey: 'createdTime', title: '创建时间', dataIndex: 'createdTime', width: 160, minWidth: 150, align: 'center' },
      { settingsKey: 'remark', title: '备注', dataIndex: 'remark', width: 180, minWidth: 150, ellipsis: true, tooltip: true },
      { title: '操作', slotName: 'operation', width: 76, align: 'center' },
    ],
    defaultVisibleKeys: ['returnNo', 'status', 'product', 'warehouse', 'supplier', 'returnType', 'qualityStatus', 'returnQuantity', 'createdBy', 'createdTime', 'remark'],
    requiredKeys: ['returnNo', 'product'],
    pinnedColumnKeys: ['returnNo'],
  },
  changeLog: {
    key: 'changeLog',
    title: '采购变更日志',
    description: '追踪预计交期变动、责任方、变更原因与执行人。',
    secondaryAction: '导出',
    statusTabs: changeLogStatusTabs,
    filters: [
      { key: 'supplier', label: '供应商', kind: 'select', placeholder: '全部供应商', options: supplierOptions },
      { key: 'destinationWarehouse', label: '目的仓', kind: 'select', placeholder: '全部仓库', options: warehouseOptions },
      { key: 'documentNo', label: '单据编号', kind: 'search', placeholder: '采购单 / 交货单' },
      { key: 'sku', label: 'SKU', kind: 'search', placeholder: 'SKU' },
      { key: 'responsibilityParty', label: '责任方', kind: 'select', placeholder: '全部责任方', options: [{ value: '供应商', label: '供应商' }, { value: '采购', label: '采购' }, { value: '仓库', label: '仓库' }] },
      { key: 'changeDate', label: '变更日期', kind: 'dateRange', width: '340px', minWidth: '340px' },
    ],
    tableColumns: [
      { settingsKey: 'supplier', title: '供应商', dataIndex: 'supplier', width: 150, minWidth: 136 },
      { settingsKey: 'destinationWarehouse', title: '目的仓', dataIndex: 'destinationWarehouse', width: 132, minWidth: 118 },
      { settingsKey: 'site', title: '亚马逊站点', dataIndex: 'site', width: 120, minWidth: 108 },
      documentNoColumn('documentNo', '单据编号', 'documentNo'),
      productColumn,
      { settingsKey: 'msku', title: 'MSKU', dataIndex: 'msku', width: 132, minWidth: 120 },
      { settingsKey: 'purchaseQuantity', title: '变更数量', dataIndex: 'purchaseQuantity', width: 104, minWidth: 94, align: 'right' },
      { settingsKey: 'expectedDeliveryDate', title: '预计交期', dataIndex: 'expectedDeliveryDate', width: 124, minWidth: 112, align: 'center' },
      { settingsKey: 'changedExpectedDeliveryDate', title: '变更后预计交期', dataIndex: 'changedExpectedDeliveryDate', width: 144, minWidth: 132, align: 'center' },
      { settingsKey: 'diffDays', title: '差异天数', dataIndex: 'diffDays', width: 104, minWidth: 94, align: 'right' },
      { settingsKey: 'responsibilityParty', title: '责任方', dataIndex: 'responsibilityParty', width: 96, minWidth: 88 },
      { settingsKey: 'changeReason', title: '变更理由', dataIndex: 'changeReason', width: 180, minWidth: 150, ellipsis: true, tooltip: true },
      { settingsKey: 'owner', title: '计划负责人', dataIndex: 'owner', width: 112, minWidth: 102 },
      { settingsKey: 'changedBy', title: '变更人', dataIndex: 'changedBy', width: 96, minWidth: 88 },
      { settingsKey: 'changeDate', title: '变更日期', dataIndex: 'changeDate', width: 160, minWidth: 150, align: 'center' },
    ],
    defaultVisibleKeys: ['supplier', 'destinationWarehouse', 'site', 'documentNo', 'product', 'msku', 'purchaseQuantity', 'expectedDeliveryDate', 'changedExpectedDeliveryDate', 'diffDays', 'responsibilityParty', 'changeReason', 'owner', 'changedBy', 'changeDate'],
    requiredKeys: ['documentNo', 'product'],
    pinnedColumnKeys: ['documentNo'],
  },
}

export const getPurchaseStatusLabel = (pageKey: PurchasePageKey, status: string) =>
  purchasePageConfigs[pageKey].statusTabs.find((tab) => tab.value === status)?.label ?? status

export const getPurchaseStatusClass = (pageKey: PurchasePageKey, status: string) => {
  const tone = purchasePageConfigs[pageKey].statusTabs.find((tab) => tab.value === status)?.tone ?? 'neutral'
  return `status-${tone}`
}

const purchaseStatusTagColorMap: Record<PurchaseStatusTone, string> = {
  success: 'green',
  warning: 'orange',
  danger: 'red',
  processing: 'arcoblue',
  neutral: 'gray',
}

export const getPurchaseStatusTagColor = (pageKey: PurchasePageKey, status: string) => {
  const tone = purchasePageConfigs[pageKey].statusTabs.find((tab) => tab.value === status)?.tone ?? 'neutral'
  return purchaseStatusTagColorMap[tone]
}

export const createDefaultPurchaseFilters = (pageKey: PurchasePageKey): PurchaseFilters =>
  Object.fromEntries(purchasePageConfigs[pageKey].filters.map((filter) => [filter.key, filter.kind === 'dateRange' || filter.kind === 'multiSelect' ? [] : undefined]))

const productSeeds = [
  { sku: 'SKU-BLEND-001', name: '便携无线榨汁杯', msku: 'BLEND-GO-RU' },
  { sku: 'SKU-EAR-002', name: '无线蓝牙耳机 Pro', msku: 'EAR-PRO-US' },
  { sku: 'SKU-LAMP-003', name: '露营折叠灯', msku: 'CAMP-LAMP-EU' },
  { sku: 'SKU-RACK-004', name: '桌面收纳支架', msku: 'DESK-RACK-US' },
]

const orderStatusCycle = orderStatusTabs.filter((tab) => tab.value !== 'all').map((tab) => tab.value)
const deliveryStatusCycle = deliveryStatusTabs.filter((tab) => tab.value !== 'all').map((tab) => tab.value)
const returnStatusCycle = returnStatusTabs.filter((tab) => tab.value !== 'all').map((tab) => tab.value)
const responsibilityCycle = ['供应商', '采购', '仓库']

export const createPurchaseRows = (pageKey: PurchasePageKey, count = 28): PurchaseRow[] =>
  Array.from({ length: count }, (_, index) => {
    const product = productSeeds[index % productSeeds.length]
    const supplier = supplierOptions[index % supplierOptions.length].label
    const destinationWarehouse = warehouseOptions[index % warehouseOptions.length].label
    const deliveryWarehouse = warehouseOptions[(index + 1) % warehouseOptions.length].label
    const site = siteOptions[index % siteOptions.length].label
    const createdDay = String(18 + (index % 12)).padStart(2, '0')
    const createdTime = `2026-05-${createdDay} ${String(9 + (index % 8)).padStart(2, '0')}:30`
    const base = {
      id: `${pageKey}-${index + 1}`,
      pageKey,
      supplier,
      destinationWarehouse,
      deliveryWarehouse,
      site,
      productName: product.name,
      sku: product.sku,
      msku: product.msku,
      fnsku: `FNSKU-${String(3000 + index)}`,
      productImage: getSalesProductImage(product.sku),
      purchaseQuantity: 120 + index * 6,
      deliveryQuantity: 80 + index * 4,
      actualDeliveryQuantity: 78 + index * 4,
      receivedQuantity: 56 + index * 3,
      beforeStorageReturnQuantity: index % 3,
      afterStorageReturnQuantity: index % 2,
      owner: index % 2 ? '陈越' : '林夏',
      createdBy: index % 2 ? '陈越' : '林夏',
      createdTime,
      remark: index % 2 ? '供应商承诺本周补齐差异数量' : '重点跟踪热销 SKU 交期',
    } satisfies Partial<PurchaseRow>

    if (pageKey === 'order') {
      return {
        ...base,
        purchaseNo: `PO202605${String(1000 + index)}`,
        documentNo: `PO202605${String(1000 + index)}`,
        purchaseType: purchaseTypeOptions[index % purchaseTypeOptions.length].label,
        status: orderStatusCycle[index % orderStatusCycle.length],
        expectedDeliveryDate: `2026-06-${String(8 + (index % 14)).padStart(2, '0')}`,
      } as PurchaseRow
    }

    if (pageKey === 'delivery') {
      return {
        ...base,
        deliveryNo: `DO202605${String(2000 + index)}`,
        documentNo: `DO202605${String(2000 + index)}`,
        status: deliveryStatusCycle[index % deliveryStatusCycle.length],
        firstMile: index % 2 ? '已建头程' : '待关联',
        shipmentNo: `SHIP-${String(880000 + index)}`,
        settlementMethod: index % 2 ? '月结' : '货到付款',
      } as PurchaseRow
    }

    if (pageKey === 'return') {
      return {
        ...base,
        returnNo: `PR202605${String(3000 + index)}`,
        documentNo: `PR202605${String(3000 + index)}`,
        warehouse: destinationWarehouse,
        status: returnStatusCycle[index % returnStatusCycle.length],
        returnType: index % 2 ? '入库后退货' : '入库前退货',
        qualityStatus: index % 3 ? '良品' : '次品',
        returnQuantity: 6 + (index % 7),
      } as PurchaseRow
    }

    const responsibilityParty = responsibilityCycle[index % responsibilityCycle.length]
    return {
      ...base,
      documentNo: `PO202605${String(1000 + index)}`,
      status: responsibilityParty === '供应商' ? 'supplier' : responsibilityParty === '采购' ? 'buyer' : 'warehouse',
      expectedDeliveryDate: `2026-06-${String(5 + (index % 14)).padStart(2, '0')}`,
      changedExpectedDeliveryDate: `2026-06-${String(8 + (index % 14)).padStart(2, '0')}`,
      diffDays: 3 + (index % 5),
      responsibilityParty,
      changeReason: responsibilityParty === '供应商' ? '原材料到货延迟' : responsibilityParty === '采购' ? '采购计划调整' : '交货仓预约变更',
      changedBy: index % 2 ? '李楠' : '王沐',
      changeDate: `2026-05-${createdDay} ${String(13 + (index % 6)).padStart(2, '0')}:10`,
    } as PurchaseRow
  })

const rowContainsKeyword = (row: PurchaseRow, keyword: string) =>
  Object.values(row).some((value) => String(value ?? '').toLowerCase().includes(keyword))

export const filterPurchaseRows = (
  rows: PurchaseRow[],
  pageKey: PurchasePageKey,
  filters: PurchaseFilters,
  status: string,
) => {
  let nextRows = status === 'all' ? [...rows] : rows.filter((row) => row.status === status)
  const configs = purchasePageConfigs[pageKey].filters

  for (const config of configs) {
    const rawValue = filters[config.key]
    if (Array.isArray(rawValue) && rawValue.length === 0) continue
    if (!Array.isArray(rawValue) && !rawValue) continue

    if (config.kind === 'search') {
      const keyword = String(rawValue).trim().toLowerCase()
      nextRows = nextRows.filter((row) => rowContainsKeyword(row, keyword))
      continue
    }

    if (config.kind === 'multiSelect' && Array.isArray(rawValue)) {
      nextRows = nextRows.filter((row) => rawValue.includes(String(row[config.key as keyof PurchaseRow] ?? '')))
      continue
    }

    if (config.kind === 'select') {
      nextRows = nextRows.filter((row) => String(row[config.key as keyof PurchaseRow] ?? '') === rawValue)
      continue
    }

    if (config.kind === 'dateRange' && Array.isArray(rawValue) && rawValue.length === 2) {
      const [start, end] = rawValue
      const rowDateKey = config.key === 'changeDate' ? 'changeDate' : 'createdTime'
      nextRows = nextRows.filter((row) => {
        const rowDate = String(row[rowDateKey] ?? '').slice(0, 10)
        return rowDate >= start && rowDate <= end
      })
    }
  }

  return nextRows
}

export const paginatePurchaseRows = (rows: PurchaseRow[], pagination: PurchasePagination) => {
  const start = (pagination.page - 1) * pagination.pageSize
  return rows.slice(start, start + pagination.pageSize)
}

export const createPurchaseSummaryCards = (rows: PurchaseRow[], pageKey: PurchasePageKey) => {
  const processingCount = rows.filter((row) => ['reviewing', 'pending-delivery', 'delivering', 'pending-qc', 'quality-checking', 'pending-shipment', 'stocking', 'pending'].includes(row.status)).length
  const quantityTotal = rows.reduce((total, row) => total + (row.purchaseQuantity ?? row.deliveryQuantity ?? row.returnQuantity ?? 0), 0)
  const exceptionCount = rows.filter((row) => ['rejected', 'voided', 'supplier'].includes(row.status)).length
  const pageNoun = pageKey === 'delivery' ? '交货单' : pageKey === 'return' ? '退货单' : pageKey === 'changeLog' ? '变更记录' : '采购单'

  return [
    { label: `${pageNoun}总数`, value: rows.length.toLocaleString('zh-CN'), note: '当前检索结果' },
    { label: '待推进', value: processingCount.toLocaleString('zh-CN'), note: '需要采购/仓库协同' },
    { label: '数量合计', value: quantityTotal.toLocaleString('zh-CN'), note: '采购/交货/退货数量' },
    { label: '异常关注', value: exceptionCount.toLocaleString('zh-CN'), note: '驳回、作废或供应商责任' },
  ]
}
