<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { IconRefresh, IconSettings } from '@arco-design/web-vue/es/icon'
import { useRoute } from 'vue-router'
import ConfigurableDataTable from '../components/common/ConfigurableDataTable.vue'
import MetricSummaryStrip from '../components/common/MetricSummaryStrip.vue'
import QueryActionBar from '../components/common/QueryActionBar.vue'
import QueryFilterItem from '../components/common/QueryFilterItem.vue'
import QueryFilterPanel from '../components/common/QueryFilterPanel.vue'
import type { ConfigurableTableColumn } from '../data/configurableTable'

type InventoryTab = 'product' | 'warehouse'
type InventoryColumnKey =
  | 'warehouse'
  | 'thumb'
  | 'product'
  | 'store'
  | 'brand'
  | 'stock'
  | 'deliveryType'
  | 'sellerCode'
  | 'barcode'
  | 'updatedAt'
  | 'nextUpdate'
  | 'warehouseType'
  | 'productKinds'
  | 'purchasePlanQty'
  | 'transferOutboundQty'
  | 'transferShippingQty'
  | 'inTransitQty'
  | 'reservedQty'
  | 'availableQty'
  | 'defectiveQty'
  | 'goodQty'
  | 'warehouseStockQty'
  | 'totalStockQty'
  | 'dailyAverage7d'
  | 'age0To30'
  | 'age31To60'
  | 'age61To90'
  | 'age365Plus'
  | 'stagnantQty'
  | 'stagnantRate'

type InventoryRow = {
  id: string
  warehouse: string
  warehouseMeta: string
  productName: string
  sku: string
  storeName: string
  storePlatform: string
  brand: string
  stock: number
  deliveryType: 'FBS' | 'FBW'
  sellerCode: string
  barcode: string
  updatedAt: string
  nextUpdateAt: string
  thumbUrl: string
  thumbText: string
  thumbTone: string
}

type InventoryTableColumnData = ConfigurableTableColumn<InventoryColumnKey> & { title: string }

type WarehouseAggregateRow = {
  id: string
  warehouse: string
  warehouseMeta: string
  warehouseType: 'FBS' | 'FBW'
  productKinds: number
  purchasePlanQty: number
  transferOutboundQty: number
  transferShippingQty: number
  inTransitQty: number
  reservedQty: number
  availableQty: number
  defectiveQty: number
  goodQty: number
  warehouseStockQty: number
  totalStockQty: number
  dailyAverage7d: number
  age0To30: number
  age31To60: number
  age61To90: number
  age365Plus: number
  stagnantQty: number
  stagnantRate: string
}

const route = useRoute()

const getRouteInventoryTab = (): InventoryTab =>
  ['product', 'warehouse'].includes(String(route.meta.inventoryTab))
    ? route.meta.inventoryTab as InventoryTab
    : 'product'

const activeTab = computed<InventoryTab>(getRouteInventoryTab)
const pageTitle = computed(() => String(route.meta.title ?? '库存管理'))
const pageDescription = computed(() => ({
  product: '统一查看产品库存状态',
  warehouse: '统一查看仓库库存状态',
})[activeTab.value])

const prototypeProductTotal = 2947
const productPageSize = 10
const warehousePageSize = 20

const filters = ref({
  store: undefined,
  warehouse: undefined as string | undefined,
  deliveryType: undefined as string | undefined,
  brand: undefined as string | undefined,
  stockOperator: undefined as 'gte' | 'lte' | undefined,
  stockValue: 0,
  keyword: '',
  warehouseOwner: undefined as string | undefined,
  warehouseMetric: undefined as string | undefined,
  warehouseCompare: undefined as string | undefined,
  warehouseMetricValue: undefined as number | undefined,
})
const pagination = ref({
  page: 1,
  pageSize: activeTab.value === 'warehouse' ? 20 : 10,
})

watch(activeTab, () => {
  pagination.value = {
    ...pagination.value,
    page: 1,
    pageSize: activeTab.value === 'warehouse' ? warehousePageSize : productPageSize,
  }
})

const prototypeSummaryCards = [
  { label: '在库 SKU', value: '2,947', note: '已接入5站点' },
  { label: '低库存预警', value: '10', note: '需关注补货' },
  { label: '海外仓数量', value: '57', note: '俄/欧/中东仓' },
  { label: '下次同步', value: '11:00', note: '每30分钟刷新' },
]

const createThumbUrl = (label: string, colors: [string, string], shape: 'keyboard' | 'ssd' | 'drawer' | 'blender') => {
  const [from, to] = colors
  const shapeMarkup = {
    keyboard: `
      <rect x="13" y="22" width="54" height="32" rx="7" fill="rgba(255,255,255,.92)"/>
      <g fill="rgba(30,41,59,.34)">
        <rect x="19" y="28" width="6" height="5" rx="1"/>
        <rect x="28" y="28" width="6" height="5" rx="1"/>
        <rect x="37" y="28" width="6" height="5" rx="1"/>
        <rect x="46" y="28" width="6" height="5" rx="1"/>
        <rect x="55" y="28" width="6" height="5" rx="1"/>
        <rect x="19" y="37" width="36" height="5" rx="1"/>
        <rect x="58" y="37" width="6" height="5" rx="1"/>
      </g>
    `,
    ssd: `
      <rect x="19" y="13" width="42" height="54" rx="7" fill="rgba(255,255,255,.92)"/>
      <rect x="27" y="23" width="26" height="8" rx="2" fill="rgba(30,41,59,.34)"/>
      <circle cx="31" cy="54" r="3" fill="rgba(30,41,59,.28)"/>
      <circle cx="49" cy="54" r="3" fill="rgba(30,41,59,.28)"/>
    `,
    drawer: `
      <rect x="17" y="18" width="46" height="45" rx="8" fill="rgba(255,255,255,.92)"/>
      <rect x="23" y="26" width="34" height="8" rx="2" fill="rgba(30,41,59,.24)"/>
      <rect x="23" y="39" width="34" height="8" rx="2" fill="rgba(30,41,59,.2)"/>
      <rect x="23" y="52" width="34" height="5" rx="2" fill="rgba(30,41,59,.18)"/>
    `,
    blender: `
      <path d="M29 18h22l-3 30H32L29 18Z" fill="rgba(255,255,255,.92)"/>
      <rect x="31" y="49" width="18" height="11" rx="3" fill="rgba(255,255,255,.88)"/>
      <path d="M35 37c4-4 8 4 12-1" stroke="rgba(30,41,59,.28)" stroke-width="3" stroke-linecap="round"/>
    `,
  }[shape]

  const svg = `
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="16" fill="url(#bg)"/>
      <circle cx="66" cy="15" r="18" fill="rgba(255,255,255,.16)"/>
      <circle cx="14" cy="68" r="20" fill="rgba(255,255,255,.12)"/>
      ${shapeMarkup}
      <text x="40" y="75" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" font-weight="700" fill="rgba(255,255,255,.76)">${label}</text>
      <defs>
        <linearGradient id="bg" x1="8" y1="8" x2="74" y2="76" gradientUnits="userSpaceOnUse">
          <stop stop-color="${from}"/>
          <stop offset="1" stop-color="${to}"/>
        </linearGradient>
      </defs>
    </svg>
  `

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const inventoryRows = ref<InventoryRow[]>([
  {
    id: '2050848210824',
    warehouse: '广州仓',
    warehouseMeta: '15-30天 58元/公斤+2元',
    productName: 'Механическая клавиатура PBT набор клавиш-Sage',
    sku: '2050848210824',
    storeName: '達焱國際有限公司',
    storePlatform: 'AliExpress',
    brand: '',
    stock: 0,
    deliveryType: 'FBS',
    sellerCode: '130212011793',
    barcode: '2050848210824',
    updatedAt: '2026/05/03 10:30',
    nextUpdateAt: '2026/05/03 11:00',
    thumbUrl: createThumbUrl('SG', ['#ff8a3d', '#ef4444'], 'keyboard'),
    thumbText: 'SG',
    thumbTone: 'sunset',
  },
  {
    id: '2050848210817',
    warehouse: '广州仓',
    warehouseMeta: '15-30天 58元/公斤+2元',
    productName: 'Механическая клавиатура PBT набор клавиш-JETT',
    sku: '2050848210817',
    storeName: '達焱國際有限公司',
    storePlatform: 'AliExpress',
    brand: '',
    stock: 0,
    deliveryType: 'FBS',
    sellerCode: '130212011792',
    barcode: '2050848210817',
    updatedAt: '2026/05/03 10:30',
    nextUpdateAt: '2026/05/03 11:00',
    thumbUrl: createThumbUrl('JT', ['#3c7eff', '#00b2ff'], 'keyboard'),
    thumbText: 'JT',
    thumbTone: 'ice',
  },
  {
    id: '2050848210770',
    warehouse: '广州仓',
    warehouseMeta: '15-30天 58元/公斤+2元',
    productName: 'Механическая клавиатура PBT набор клавиш-JETT',
    sku: '2050848210770',
    storeName: '達焱國際有限公司',
    storePlatform: 'AliExpress',
    brand: '',
    stock: 0,
    deliveryType: 'FBS',
    sellerCode: '130212011791',
    barcode: '2050848210770',
    updatedAt: '2026/05/03 10:30',
    nextUpdateAt: '2026/05/03 11:00',
    thumbUrl: createThumbUrl('JT', ['#7b61ff', '#9f7aea'], 'keyboard'),
    thumbText: 'JT',
    thumbTone: 'violet',
  },
  {
    id: '2050819406881',
    warehouse: '广州仓',
    warehouseMeta: '15-30天 58元/公斤+2元',
    productName: 'Механическая клавиатура PBT набор клавиш-Clove',
    sku: '2050819406881',
    storeName: '達焱國際有限公司',
    storePlatform: 'AliExpress',
    brand: '',
    stock: 0,
    deliveryType: 'FBS',
    sellerCode: '130212011789',
    barcode: '2050819406881',
    updatedAt: '2026/05/03 10:30',
    nextUpdateAt: '2026/05/03 11:00',
    thumbUrl: createThumbUrl('CL', ['#64748b', '#334155'], 'keyboard'),
    thumbText: 'CL',
    thumbTone: 'slate',
  },
  {
    id: '2050818828455',
    warehouse: '广州仓',
    warehouseMeta: '15-30天 58元/公斤+2元',
    productName: 'Механическая клавиатура PBT набор клавиш-Sage',
    sku: '2050818828455',
    storeName: '達焱國際有限公司',
    storePlatform: 'AliExpress',
    brand: '',
    stock: 0,
    deliveryType: 'FBS',
    sellerCode: '130212011790',
    barcode: '2050818828455',
    updatedAt: '2026/05/03 10:30',
    nextUpdateAt: '2026/05/03 11:00',
    thumbUrl: createThumbUrl('SG', ['#22c55e', '#65a30d'], 'keyboard'),
    thumbText: 'SG',
    thumbTone: 'mint',
  },
  {
    id: '2050751433310',
    warehouse: '广州仓',
    warehouseMeta: '15-30天 58元/公斤+2元',
    productName: 'Механическая клавиатура PBT набор клавиш-Аска Лэнгли Сорью',
    sku: '2050751433310',
    storeName: '達焱國際有限公司',
    storePlatform: 'AliExpress',
    brand: '',
    stock: 0,
    deliveryType: 'FBS',
    sellerCode: '130212011787',
    barcode: '2050751433310',
    updatedAt: '2026/05/03 10:30',
    nextUpdateAt: '2026/05/03 11:00',
    thumbUrl: createThumbUrl('AS', ['#ff7a45', '#f43f5e'], 'keyboard'),
    thumbText: 'AS',
    thumbTone: 'coral',
  },
  {
    id: '2050751433280',
    warehouse: '广州仓',
    warehouseMeta: '15-30天 58元/公斤+2元',
    productName: 'Механическая клавиатура PBT набор клавиш-Аска Лэнгли Сорью',
    sku: '2050751433280',
    storeName: '達焱國際有限公司',
    storePlatform: 'AliExpress',
    brand: '',
    stock: 0,
    deliveryType: 'FBS',
    sellerCode: '130212011786',
    barcode: '2050751433280',
    updatedAt: '2026/05/03 10:30',
    nextUpdateAt: '2026/05/03 11:00',
    thumbUrl: createThumbUrl('AS', ['#3c7eff', '#00b2ff'], 'keyboard'),
    thumbText: 'AS',
    thumbTone: 'ice',
  },
  {
    id: '2050751433242',
    warehouse: '广州仓',
    warehouseMeta: '15-30天 58元/公斤+2元',
    productName: 'Механическая клавиатура PBT набор клавиш-Аска Лэнгли Сорью',
    sku: '2050751433242',
    storeName: '達焱國際有限公司',
    storePlatform: 'AliExpress',
    brand: '',
    stock: 0,
    deliveryType: 'FBS',
    sellerCode: '130212011785',
    barcode: '2050751433242',
    updatedAt: '2026/05/03 10:30',
    nextUpdateAt: '2026/05/03 11:00',
    thumbUrl: createThumbUrl('AS', ['#7b61ff', '#9f7aea'], 'keyboard'),
    thumbText: 'AS',
    thumbTone: 'violet',
  },
  {
    id: '2050751433228',
    warehouse: '广州仓',
    warehouseMeta: '15-30天 58元/公斤+2元',
    productName: 'Механическая клавиатура PBT набор клавиш-Рэй Аянами',
    sku: '2050751433228',
    storeName: '達焱國際有限公司',
    storePlatform: 'AliExpress',
    brand: '',
    stock: 0,
    deliveryType: 'FBS',
    sellerCode: '130212011788',
    barcode: '2050751433228',
    updatedAt: '2026/05/03 10:30',
    nextUpdateAt: '2026/05/03 11:00',
    thumbUrl: createThumbUrl('RE', ['#ff8a3d', '#ef4444'], 'keyboard'),
    thumbText: 'RE',
    thumbTone: 'sunset',
  },
  {
    id: '2050691774191',
    warehouse: '广州仓',
    warehouseMeta: '15-30天 58元/公斤+2元',
    productName: 'Механическая клавиатура PBT набор клавиш',
    sku: '2050691774191',
    storeName: '達焱國際有限公司',
    storePlatform: 'AliExpress',
    brand: '',
    stock: 0,
    deliveryType: 'FBS',
    sellerCode: '130212011780',
    barcode: '2050691774191',
    updatedAt: '2026/05/03 10:30',
    nextUpdateAt: '2026/05/03 11:00',
    thumbUrl: createThumbUrl('KB', ['#64748b', '#334155'], 'keyboard'),
    thumbText: 'KB',
    thumbTone: 'slate',
  },
])

const warehouseAggregateRows = ref<WarehouseAggregateRow[]>([
  {
    id: 'WB-PLUS',
    warehouse: 'WB-PLUS仓',
    warehouseMeta: '海外平台仓 · FBW',
    warehouseType: 'FBW',
    productKinds: 2862,
    purchasePlanQty: 1,
    transferOutboundQty: 732,
    transferShippingQty: 0,
    inTransitQty: 11250,
    reservedQty: 0,
    availableQty: 4380,
    defectiveQty: 13,
    goodQty: 4988,
    warehouseStockQty: 5001,
    totalStockQty: 16251,
    dailyAverage7d: 112.83,
    age0To30: 1510,
    age31To60: 1911,
    age61To90: 1025,
    age365Plus: 0,
    stagnantQty: 0,
    stagnantRate: '0%',
  },
  {
    id: 'MSK',
    warehouse: 'MSK仓',
    warehouseMeta: '莫斯科履约仓 · FBS',
    warehouseType: 'FBS',
    productKinds: 3026,
    purchasePlanQty: 11,
    transferOutboundQty: 0,
    transferShippingQty: 0,
    inTransitQty: 0,
    reservedQty: 0,
    availableQty: 6085,
    defectiveQty: 1,
    goodQty: 6085,
    warehouseStockQty: 6086,
    totalStockQty: 6086,
    dailyAverage7d: 1,
    age0To30: 5702,
    age31To60: 206,
    age61To90: 10,
    age365Plus: 0,
    stagnantQty: 0,
    stagnantRate: '0%',
  },
  {
    id: 'MSK-OFFLINE',
    warehouse: 'MSK线下销售仓',
    warehouseMeta: '线下销售周转仓 · FBS',
    warehouseType: 'FBS',
    productKinds: 2866,
    purchasePlanQty: 0,
    transferOutboundQty: 0,
    transferShippingQty: 0,
    inTransitQty: 0,
    reservedQty: 0,
    availableQty: 3,
    defectiveQty: 0,
    goodQty: 3,
    warehouseStockQty: 3,
    totalStockQty: 3,
    dailyAverage7d: 0.28,
    age0To30: 3,
    age31To60: 0,
    age61To90: 0,
    age365Plus: 0,
    stagnantQty: 0,
    stagnantRate: '0%',
  },
  {
    id: 'GZ',
    warehouse: '广州仓',
    warehouseMeta: '国内头程仓 · FBS',
    warehouseType: 'FBS',
    productKinds: 2861,
    purchasePlanQty: 0,
    transferOutboundQty: 0,
    transferShippingQty: 0,
    inTransitQty: 0,
    reservedQty: 0,
    availableQty: 824,
    defectiveQty: 0,
    goodQty: 824,
    warehouseStockQty: 824,
    totalStockQty: 824,
    dailyAverage7d: 1,
    age0To30: 0,
    age31To60: 0,
    age61To90: 0,
    age365Plus: 0,
    stagnantQty: 0,
    stagnantRate: '0%',
  },
  {
    id: 'GZ-SAMPLE',
    warehouse: '广州样品仓',
    warehouseMeta: '样品留存仓 · FBS',
    warehouseType: 'FBS',
    productKinds: 2860,
    purchasePlanQty: 0,
    transferOutboundQty: 0,
    transferShippingQty: 0,
    inTransitQty: 0,
    reservedQty: 0,
    availableQty: 0,
    defectiveQty: 0,
    goodQty: 0,
    warehouseStockQty: 0,
    totalStockQty: 0,
    dailyAverage7d: 0,
    age0To30: 0,
    age31To60: 0,
    age61To90: 0,
    age365Plus: 0,
    stagnantQty: 0,
    stagnantRate: '0%',
  },
  {
    id: 'DOMESTIC-LOSS',
    warehouse: '国内报损仓',
    warehouseMeta: '国内异常库存仓 · FBS',
    warehouseType: 'FBS',
    productKinds: 2860,
    purchasePlanQty: 0,
    transferOutboundQty: 0,
    transferShippingQty: 0,
    inTransitQty: 0,
    reservedQty: 0,
    availableQty: 38,
    defectiveQty: 0,
    goodQty: 38,
    warehouseStockQty: 38,
    totalStockQty: 38,
    dailyAverage7d: 0,
    age0To30: 0,
    age31To60: 0,
    age61To90: 0,
    age365Plus: 0,
    stagnantQty: 0,
    stagnantRate: '0%',
  },
  {
    id: 'KREMLIN',
    warehouse: '克里姆枞宫',
    warehouseMeta: '海外备用仓 · FBS',
    warehouseType: 'FBS',
    productKinds: 2851,
    purchasePlanQty: 0,
    transferOutboundQty: 0,
    transferShippingQty: 0,
    inTransitQty: 0,
    reservedQty: 0,
    availableQty: 0,
    defectiveQty: 0,
    goodQty: 0,
    warehouseStockQty: 0,
    totalStockQty: 0,
    dailyAverage7d: 0,
    age0To30: 1,
    age31To60: 0,
    age61To90: 0,
    age365Plus: 0,
    stagnantQty: 0,
    stagnantRate: '0%',
  },
  {
    id: 'OVERSEAS-IML',
    warehouse: '海外IML仓',
    warehouseMeta: '海外中转库存 · FBS',
    warehouseType: 'FBS',
    productKinds: 2860,
    purchasePlanQty: 0,
    transferOutboundQty: 0,
    transferShippingQty: 0,
    inTransitQty: 0,
    reservedQty: 0,
    availableQty: 80,
    defectiveQty: 0,
    goodQty: 80,
    warehouseStockQty: 0,
    totalStockQty: 80,
    dailyAverage7d: 0,
    age0To30: 0,
    age31To60: 0,
    age61To90: 0,
    age365Plus: 0,
    stagnantQty: 0,
    stagnantRate: '0%',
  },
  {
    id: 'OVERSEAS-LOSS',
    warehouse: '海外报损仓',
    warehouseMeta: '海外异常库存仓 · FBS',
    warehouseType: 'FBS',
    productKinds: 2896,
    purchasePlanQty: 0,
    transferOutboundQty: 0,
    transferShippingQty: 0,
    inTransitQty: 0,
    reservedQty: 0,
    availableQty: 198,
    defectiveQty: 0,
    goodQty: 198,
    warehouseStockQty: 198,
    totalStockQty: 198,
    dailyAverage7d: 0,
    age0To30: 0,
    age31To60: 0,
    age61To90: 211,
    age365Plus: 0,
    stagnantQty: 0,
    stagnantRate: '0%',
  },
])

const defaultVisibleColumnKeys: InventoryColumnKey[] = [
  'warehouse',
  'thumb',
  'product',
  'store',
  'brand',
  'stock',
  'deliveryType',
  'sellerCode',
  'barcode',
  'updatedAt',
  'nextUpdate',
]

const warehouseDefaultVisibleColumnKeys: InventoryColumnKey[] = [
  'warehouse',
  'warehouseType',
  'productKinds',
  'purchasePlanQty',
  'transferOutboundQty',
  'transferShippingQty',
  'inTransitQty',
  'reservedQty',
  'availableQty',
  'defectiveQty',
  'goodQty',
  'warehouseStockQty',
  'totalStockQty',
  'dailyAverage7d',
  'age0To30',
  'age31To60',
  'age61To90',
  'age365Plus',
  'stagnantQty',
  'stagnantRate',
]

const requiredColumnKeys: InventoryColumnKey[] = ['warehouse', 'product']
const warehouseRequiredColumnKeys: InventoryColumnKey[] = ['warehouse']
const columnSettingsVisible = ref(false)

const allColumns: InventoryTableColumnData[] = [
  { settingsKey: 'warehouse', title: '仓库', slotName: 'warehouse', width: 176, minWidth: 132 },
  { settingsKey: 'thumb', title: '图片', slotName: 'thumb', width: 86, minWidth: 72 },
  { settingsKey: 'product', title: '产品名称/SKU', slotName: 'product', width: 280, minWidth: 220, align: 'left' },
  { settingsKey: 'store', title: '店铺名称', slotName: 'store', width: 180, minWidth: 150 },
  { settingsKey: 'brand', title: '品牌', dataIndex: 'brand', width: 120, minWidth: 96 },
  { settingsKey: 'stock', title: '在库库存', slotName: 'stock', width: 120, minWidth: 104, align: 'right', sortable: { sortDirections: ['ascend', 'descend'] } },
  { settingsKey: 'deliveryType', title: '配送类型', dataIndex: 'deliveryType', width: 120, minWidth: 104 },
  { settingsKey: 'sellerCode', title: '卖家编码', dataIndex: 'sellerCode', width: 140, minWidth: 116 },
  { settingsKey: 'barcode', title: '条形码', dataIndex: 'barcode', width: 150, minWidth: 116 },
  { settingsKey: 'updatedAt', title: '更新时间', dataIndex: 'updatedAt', width: 168, minWidth: 132 },
  { settingsKey: 'nextUpdate', title: '下次预计更新时间', slotName: 'nextUpdate', width: 176, minWidth: 148 },
]

const warehouseColumns: InventoryTableColumnData[] = [
  { settingsKey: 'warehouse', title: '仓库', slotName: 'warehouse', width: 180, minWidth: 150 },
  { settingsKey: 'warehouseType', title: '仓库类型', dataIndex: 'warehouseType', width: 100, minWidth: 86, align: 'center' },
  { settingsKey: 'productKinds', title: '产品种类', dataIndex: 'productKinds', width: 110, minWidth: 96, align: 'right' },
  { settingsKey: 'purchasePlanQty', title: '计采交合计量', dataIndex: 'purchasePlanQty', width: 130, minWidth: 112, align: 'right' },
  { settingsKey: 'transferOutboundQty', title: '调拨待出库', dataIndex: 'transferOutboundQty', width: 120, minWidth: 104, align: 'right' },
  { settingsKey: 'transferShippingQty', title: '调拨待出运', dataIndex: 'transferShippingQty', width: 120, minWidth: 104, align: 'right' },
  { settingsKey: 'inTransitQty', title: '在途量', dataIndex: 'inTransitQty', width: 100, minWidth: 86, align: 'right' },
  { settingsKey: 'reservedQty', title: '预占量', dataIndex: 'reservedQty', width: 100, minWidth: 86, align: 'right' },
  { settingsKey: 'availableQty', title: '可用量', dataIndex: 'availableQty', width: 100, minWidth: 86, align: 'right' },
  { settingsKey: 'defectiveQty', title: '次品量', dataIndex: 'defectiveQty', width: 100, minWidth: 86, align: 'right' },
  { settingsKey: 'goodQty', title: '良品量', dataIndex: 'goodQty', width: 100, minWidth: 86, align: 'right' },
  { settingsKey: 'warehouseStockQty', title: '在库量', dataIndex: 'warehouseStockQty', width: 100, minWidth: 86, align: 'right' },
  { settingsKey: 'totalStockQty', title: '总库存', dataIndex: 'totalStockQty', width: 100, minWidth: 86, align: 'right' },
  { settingsKey: 'dailyAverage7d', title: '7天日均', dataIndex: 'dailyAverage7d', width: 100, minWidth: 86, align: 'right' },
  { settingsKey: 'age0To30', title: '0~30', dataIndex: 'age0To30', width: 90, minWidth: 78, align: 'right' },
  { settingsKey: 'age31To60', title: '31~60', dataIndex: 'age31To60', width: 90, minWidth: 78, align: 'right' },
  { settingsKey: 'age61To90', title: '61~90', dataIndex: 'age61To90', width: 90, minWidth: 78, align: 'right' },
  { settingsKey: 'age365Plus', title: '365+', dataIndex: 'age365Plus', width: 90, minWidth: 78, align: 'right' },
  { settingsKey: 'stagnantQty', title: '滞销量', dataIndex: 'stagnantQty', width: 100, minWidth: 86, align: 'right' },
  { settingsKey: 'stagnantRate', title: '滞销率', dataIndex: 'stagnantRate', width: 100, minWidth: 86, align: 'right' },
]

const activeSummaryCards = computed(() => prototypeSummaryCards)
const activeColumns = computed(() => activeTab.value === 'warehouse' ? warehouseColumns : allColumns)
const activeDefaultVisibleColumnKeys = computed(() =>
  activeTab.value === 'warehouse' ? warehouseDefaultVisibleColumnKeys : defaultVisibleColumnKeys
)
const activeRequiredColumnKeys = computed(() =>
  activeTab.value === 'warehouse' ? warehouseRequiredColumnKeys : requiredColumnKeys
)

const openColumnSettings = () => {
  columnSettingsVisible.value = true
}

const filteredRows = computed(() => {
  let rows = [...inventoryRows.value]

  if (filters.value.store) {
    rows = rows.filter((item) => item.storePlatform === filters.value.store)
  }

  if (filters.value.warehouse && filters.value.warehouse !== 'all') {
    rows = rows.filter((item) => item.warehouse.includes(String(filters.value.warehouse)))
  }

  if (filters.value.deliveryType) {
    rows = rows.filter((item) => item.deliveryType === filters.value.deliveryType)
  }

  if (filters.value.brand) {
    rows = rows.filter((item) => item.brand === filters.value.brand)
  }

  const stockValue = Number(filters.value.stockValue ?? 0)
  if (stockValue > 0) {
    const stockOperator = filters.value.stockOperator ?? 'gte'
    if (stockOperator === 'lte') rows = rows.filter((item) => item.stock <= stockValue)
    if (stockOperator === 'gte') rows = rows.filter((item) => item.stock >= stockValue)
  }

  if (filters.value.keyword.trim()) {
    const keyword = filters.value.keyword.trim().toLowerCase()
    rows = rows.filter((item) =>
      [item.sku, item.sellerCode, item.barcode, item.productName].some((field) =>
        field.toLowerCase().includes(keyword)
      )
    )
  }

  return rows
})

const filteredWarehouseRows = computed(() => {
  let rows = [...warehouseAggregateRows.value]

  if (filters.value.warehouse) {
    rows = rows.filter((item) => item.warehouse.includes(String(filters.value.warehouse)))
  }

  return rows
})

const activeRows = computed(() => activeTab.value === 'warehouse' ? filteredWarehouseRows.value : filteredRows.value)
const activeTotal = computed(() => activeTab.value === 'warehouse' ? activeRows.value.length : prototypeProductTotal)

const pagedRows = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.pageSize
  return activeRows.value.slice(start, start + pagination.value.pageSize)
})

const stockStatusText = (stock: number) => {
  if (stock <= 10) return '紧张'
  if (stock <= 80) return '关注'
  return '健康'
}

const resetFilters = () => {
  filters.value = {
    store: undefined,
    warehouse: undefined,
    deliveryType: undefined,
    brand: undefined,
    stockOperator: undefined,
    stockValue: 0,
    keyword: '',
    warehouseOwner: undefined,
    warehouseMetric: undefined,
    warehouseCompare: undefined,
    warehouseMetricValue: undefined,
  }
  pagination.value = {
    ...pagination.value,
    page: 1,
    pageSize: activeTab.value === 'warehouse' ? warehousePageSize : productPageSize,
  }
}

</script>

<template>
  <div class="inventory-page">
    <section class="page-head">
      <div class="page-title">
        <span>{{ pageTitle }}</span>
      </div>
      <p class="page-description">{{ pageDescription }}</p>
    </section>

    <div class="volc-design-common-table inventory-table-workspace">
      <MetricSummaryStrip class="inventory-summary" :cards="activeSummaryCards" />

      <QueryFilterPanel v-if="activeTab === 'warehouse'" class="inventory-filter-panel">
        <QueryFilterItem label="店铺/仓库">
          <a-select v-model="filters.warehouse" placeholder="全部" allow-clear class="volc-design-search-item">
            <a-option value="all">全部</a-option>
            <a-option value="WB-PLUS仓">WB-PLUS仓</a-option>
            <a-option value="MSK仓">MSK仓</a-option>
            <a-option value="广州仓">广州仓</a-option>
          </a-select>
        </QueryFilterItem>

        <QueryFilterItem label="所有人">
          <a-select v-model="filters.warehouseOwner" placeholder="所有人" allow-clear class="volc-design-search-item">
            <a-option value="all">全部</a-option>
          </a-select>
        </QueryFilterItem>

        <QueryFilterItem label="在库值">
          <a-select v-model="filters.warehouseMetric" placeholder="在库值" allow-clear class="volc-design-search-item">
            <a-option value="warehouseStockQty">在库量</a-option>
            <a-option value="availableQty">可用量</a-option>
          </a-select>
        </QueryFilterItem>

        <QueryFilterItem label="条件">
          <a-select v-model="filters.warehouseCompare" placeholder="等于" allow-clear class="volc-design-search-item">
            <a-option value="eq">等于</a-option>
            <a-option value="gte">大于等于</a-option>
            <a-option value="lte">小于等于</a-option>
          </a-select>
        </QueryFilterItem>

        <QueryFilterItem label="数值">
          <a-input-number
            v-model="filters.warehouseMetricValue"
            hide-button
            placeholder="请输入"
          />
        </QueryFilterItem>

        <QueryActionBar>
          <a-button type="primary" class="volc-design-button">查询</a-button>
          <a-button class="volc-design-button" @click="resetFilters">重置</a-button>
          <a-button class="volc-design-button">导出</a-button>
          <a-tooltip content="定制列">
            <a-button size="small" class="filter-icon-button" aria-label="定制列" @click="openColumnSettings">
              <template #icon>
                <icon-settings />
              </template>
            </a-button>
          </a-tooltip>
          <a-tooltip content="刷新">
            <a-button size="small" class="filter-icon-button" aria-label="刷新">
              <template #icon>
                <icon-refresh />
              </template>
            </a-button>
          </a-tooltip>
        </QueryActionBar>
      </QueryFilterPanel>

      <QueryFilterPanel v-else class="inventory-filter-panel">
        <QueryFilterItem label="店铺">
          <a-select v-model="filters.store" placeholder="选择店铺" allow-clear class="volc-design-search-item">
            <a-option value="AliExpress">AliExpress</a-option>
          </a-select>
        </QueryFilterItem>

        <QueryFilterItem label="仓库">
          <a-select v-model="filters.warehouse" placeholder="选择仓库" allow-clear class="volc-design-search-item">
            <a-option value="广州仓">广州仓</a-option>
          </a-select>
        </QueryFilterItem>

        <QueryFilterItem label="配送类型">
          <a-select v-model="filters.deliveryType" placeholder="配送类型" allow-clear class="volc-design-search-item">
            <a-option value="FBS">FBS</a-option>
            <a-option value="FBW">FBW</a-option>
          </a-select>
        </QueryFilterItem>

        <QueryFilterItem label="品牌">
          <a-select v-model="filters.brand" placeholder="选择品牌" allow-clear class="volc-design-search-item">
            <a-option value="">全部</a-option>
            <a-option value="KeyMood">KeyMood</a-option>
          </a-select>
        </QueryFilterItem>

        <QueryFilterItem label="在库库存" class="filter-stock-range">
          <div class="stock-filter-combo">
            <a-select v-model="filters.stockOperator" placeholder="条件" class="stock-operator" :style="{ width: '112px' }">
              <a-option value="gte">≥</a-option>
              <a-option value="lte">≤</a-option>
            </a-select>
            <a-input-number
              v-model="filters.stockValue"
              :min="0"
              hide-button
              class="stock-value"
              placeholder="数值"
              :style="{ width: '100%' }"
            />
          </div>
        </QueryFilterItem>

        <QueryFilterItem label="关键词">
          <a-input-search
            v-model="filters.keyword"
            allow-clear
            placeholder="搜索 sku / 卖家编号 / 条形码"
            class="volc-design-search-item filter-search"
          />
        </QueryFilterItem>

        <QueryActionBar>
          <a-button type="primary" class="volc-design-button">查询</a-button>
          <a-button class="volc-design-button" @click="resetFilters">重置</a-button>
          <a-tooltip content="定制列">
            <a-button size="small" class="filter-icon-button" aria-label="定制列" @click="openColumnSettings">
              <template #icon>
                <icon-settings />
              </template>
            </a-button>
          </a-tooltip>
          <a-tooltip content="刷新">
            <a-button size="small" class="filter-icon-button" aria-label="刷新">
              <template #icon>
                <icon-refresh />
              </template>
            </a-button>
          </a-tooltip>
        </QueryActionBar>
      </QueryFilterPanel>

      <section class="table-wrapper">
        <ConfigurableDataTable
          :key="activeTab"
          v-model:settings-visible="columnSettingsVisible"
          :columns="activeColumns"
          :default-visible-keys="activeDefaultVisibleColumnKeys"
          :required-keys="activeRequiredColumnKeys"
          :default-freeze-last-column="true"
          :data="pagedRows"
          row-key="id"
          :pagination="false"
          table-class="inventory-table"
          wrapper-class="inventory-table-shell"
        >
          <template #warehouse="{ record }">
            <div class="warehouse-cell warehouse-cell-compact">
              <strong>{{ record.warehouse }}</strong>
              <span v-if="activeTab !== 'warehouse'">{{ record.warehouseMeta }}</span>
            </div>
          </template>

          <template #thumb="{ record }">
            <div class="thumb-card" :class="`tone-${record.thumbTone}`">
              <img
                v-if="record.thumbUrl"
                class="thumb-image"
                :src="record.thumbUrl"
                :alt="record.productName"
                loading="lazy"
                @error="record.thumbUrl = ''"
              />
              <span v-else>{{ record.thumbText }}</span>
            </div>
          </template>

          <template #product="{ record }">
            <div class="product-cell">
              <a-link>{{ record.productName }}</a-link>
              <span>{{ record.sku }}</span>
            </div>
          </template>

          <template #store="{ record }">
            <div class="store-cell">
              <strong>{{ record.storeName }}</strong>
              <span>{{ record.storePlatform }}</span>
            </div>
          </template>

          <template #stock="{ record }">
            <div class="stock-cell">
              <strong>{{ record.stock }}</strong>
              <a-tag :color="record.stock <= 10 ? 'red' : record.stock <= 80 ? 'orange' : 'green'">
                {{ stockStatusText(record.stock) }}
              </a-tag>
            </div>
          </template>

          <template #nextUpdate="{ record }">
            <span class="next-update">{{ record.nextUpdateAt }}</span>
          </template>

          <template #footer>
            <a-pagination
              v-model:current="pagination.page"
              v-model:page-size="pagination.pageSize"
              :total="activeTotal"
              :page-size-options="[10, 20, 50, 100]"
              show-total
              show-jumper
              show-page-size
            />
          </template>
        </ConfigurableDataTable>
      </section>
    </div>
  </div>
</template>

<style scoped>
.inventory-page {
  --inventory-color-primary: rgb(var(--primary-6));
  --inventory-color-primary-strong: rgb(var(--primary-7));
  --inventory-color-text: var(--color-text-1);
  --inventory-color-text-secondary: var(--color-text-2);
  --inventory-color-text-tertiary: var(--color-text-3);
  --inventory-color-bg: var(--color-bg-2);
  --inventory-color-fill: var(--color-fill-1);
  --inventory-color-border: var(--color-border-2);
  --inventory-color-control-border: var(--color-border-2);
  --inventory-control-height: var(--size-default, 32px);
  --inventory-radius: var(--border-radius-medium);
  --inventory-radius-small: var(--border-radius-small);
  --workspace-color-primary: var(--inventory-color-primary);
  --workspace-color-text: var(--inventory-color-text);
  --workspace-color-text-secondary: var(--inventory-color-text-secondary);
  --workspace-color-text-tertiary: var(--inventory-color-text-tertiary);
  --workspace-color-bg: var(--inventory-color-bg);
  --workspace-color-fill: var(--inventory-color-fill);
  --workspace-color-border: var(--inventory-color-border);
  --workspace-color-control-border: var(--inventory-color-control-border);
  --workspace-control-height: var(--inventory-control-height);
  --workspace-radius: var(--inventory-radius);
  display: flex;
  flex-direction: column;
  gap: 0;
}

.page-head {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 16px 2px 16px;
}

.page-title {
  display: flex;
  min-width: 0;
  align-items: center;
}

.page-title span {
  color: var(--inventory-color-text);
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
}

.page-description {
  margin: 2px 0 0;
  color: var(--inventory-color-text-secondary);
  font-size: 13px;
  line-height: 20px;
}

.inventory-summary {
  --workspace-color-bg: var(--color-bg-1);

  margin-bottom: 16px;
}

.inventory-filter-panel {
  margin-bottom: 14px;
}

.volc-design-button {
  height: var(--inventory-control-height);
}

.table-wrapper {
  overflow: hidden;
}

.inventory-table-shell :deep(.arco-table-element) {
  min-width: unset;
}

.inventory-table-shell :deep(.arco-table-header) {
  background: var(--inventory-color-fill);
}

.inventory-table-shell :deep(.arco-table-scroll-position-right .arco-table-col-fixed-left-last::after),
.inventory-table-shell :deep(.arco-table-scroll-position-middle .arco-table-col-fixed-left-last::after) {
  box-shadow: inset 6px 0 8px -3px rgba(0, 0, 0, 0.15) !important;
  transition: none !important;
}

.inventory-table-shell :deep(.arco-table-scroll-position-left .arco-table-col-fixed-right-first::after),
.inventory-table-shell :deep(.arco-table-scroll-position-middle .arco-table-col-fixed-right-first::after) {
  box-shadow: inset -6px 0 8px -3px rgba(0, 0, 0, 0.15) !important;
  transition: none !important;
}

.table-wrapper :deep(.inventory-table .arco-table-th) {
  background: var(--inventory-color-fill);
  color: var(--inventory-color-text-secondary);
  font-weight: 600;
}

.table-wrapper :deep(.inventory-table .arco-table-container) {
  border: 0;
}

.table-wrapper :deep(.inventory-table .arco-table-border .arco-table-container::before),
.table-wrapper :deep(.inventory-table .arco-table-border .arco-table-container::after),
.table-wrapper :deep(.inventory-table .arco-table-border .arco-table-container .arco-table),
.table-wrapper :deep(.inventory-table .arco-table-border .arco-table-tr::after),
.table-wrapper :deep(.inventory-table .arco-table-border .arco-table-th),
.table-wrapper :deep(.inventory-table .arco-table-border .arco-table-td) {
  border-color: #e9edf3;
}

.table-wrapper :deep(.inventory-table .arco-table-td) {
  background: var(--inventory-color-bg);
}

.table-wrapper :deep(.inventory-table .arco-table-tr:hover .arco-table-td) {
  background: var(--inventory-color-fill);
}

.table-wrapper :deep(.inventory-table .arco-pagination) {
  padding: 0 18px 18px;
  margin-top: 16px;
}

.stock-filter-combo {
  display: flex;
  min-width: 0;
  flex: 1;
}

.stock-operator {
  width: 112px !important;
  min-width: 112px;
  flex: 0 0 112px;
}

.stock-value {
  width: auto !important;
  display: block;
  min-width: 0;
  flex: 1;
  margin-left: -1px;
}

.stock-filter-combo :deep(.stock-operator) {
  width: 112px !important;
  min-width: 112px;
  flex: 0 0 112px;
}

.stock-filter-combo :deep(.stock-value) {
  width: auto !important;
  min-width: 0;
  flex: 1 1 auto;
}

.stock-value :deep(.arco-input-number-step) {
  display: none;
}

.stock-filter-combo :deep(.arco-select-view-single) {
  border-radius: 0;
}

.stock-value :deep(.arco-input-number) {
  display: flex;
  width: 100%;
  border-radius: 0 var(--inventory-radius) var(--inventory-radius) 0;
}

.stock-value :deep(.arco-input-number-input) {
  width: 100%;
}

.inventory-table:not(.is-auto-wrap) :deep(.arco-table-td) {
  white-space: nowrap;
}

.inventory-table:not(.is-auto-wrap) :deep(.product-cell a),
.inventory-table:not(.is-auto-wrap) :deep(.product-cell span) {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.warehouse-cell,
.product-cell,
.store-cell {
  display: flex;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  text-align: left;
}

.warehouse-cell strong,
.warehouse-cell span,
.product-cell :deep(.arco-link),
.product-cell span,
.store-cell strong,
.store-cell span {
  display: block;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.warehouse-cell strong,
.store-cell strong {
  color: var(--inventory-color-text);
  font-size: 13px;
}

.warehouse-cell span,
.product-cell span,
.store-cell span {
  color: var(--inventory-color-text-tertiary);
  font-size: 12px;
  line-height: 1.5;
}

.thumb-card {
  display: flex;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 10px;
  color: var(--inventory-color-bg);
  font-size: 12px;
  font-weight: 700;
}

.thumb-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tone-sunset {
  background: linear-gradient(135deg, #ff7d00, #f53f3f);
}

.tone-ice {
  background: linear-gradient(135deg, #3c7eff, #00b2ff);
}

.tone-violet {
  background: linear-gradient(135deg, #7b61ff, #9f7aea);
}

.tone-slate {
  background: linear-gradient(135deg, var(--inventory-color-text-secondary), var(--inventory-color-text-tertiary));
}

.tone-mint {
  background: linear-gradient(135deg, #00b42a, #7bc616);
}

.tone-coral {
  background: linear-gradient(135deg, #ff5722, #ff9a62);
}

.stock-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  text-align: right;
}

.stock-cell strong {
  color: var(--inventory-color-text);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  min-width: 32px;
  text-align: right;
}

.next-update {
  color: #ff7d00;
  font-weight: 500;
}
</style>
