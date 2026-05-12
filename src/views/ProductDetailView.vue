<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { FileItem } from '@arco-design/web-vue/es/upload/interfaces'
import { Message } from '@arco-design/web-vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'
import { useRoute, useRouter } from 'vue-router'
import ConfigurableDataTable from '../components/common/ConfigurableDataTable.vue'
import MetricSummaryStrip from '../components/common/MetricSummaryStrip.vue'
import QueryActionBar from '../components/common/QueryActionBar.vue'
import QueryFilterItem from '../components/common/QueryFilterItem.vue'
import QueryFilterPanel from '../components/common/QueryFilterPanel.vue'
import SecondaryPageHeader from '../components/common/SecondaryPageHeader.vue'
import ProductDetailInfoGrid, { type ProductDetailInfoItem, type ProductDetailInfoValue } from '../components/products/ProductDetailInfoGrid.vue'
import ProductSectionCard from '../components/products/ProductSectionCard.vue'
import type { ConfigurableTableColumn } from '../data/configurableTable'
import {
  createEmptyProduct,
  createEmptyPlatformMapping,
  currencyOptions,
  listingStatusOptions,
  logisticsTagOptions,
  platformOptions,
  procurementStatusOptions,
  productStatusOptions,
  purchasableOptions,
  storeOptions,
  useProductCatalogStore,
  type ProductPlatformMapping,
  type ProductRecord,
  type ProductStatus,
} from '../data/productCatalog'

const router = useRouter()
const route = useRoute()
const catalogStore = useProductCatalogStore()

const statusLabelMap: Record<ProductStatus, string> = {
  '': '-',
  normal: '在售',
  disabled: '停售',
  draft: '草稿',
}

const statusToneMap: Record<ProductStatus, 'green' | 'orange' | 'red' | undefined> = {
  '': undefined,
  normal: 'green',
  disabled: 'orange',
  draft: 'red',
}

const procurementStatusToneMap: Record<ProductRecord['procurement']['status'], 'green' | 'orange' | 'red' | undefined> = {
  normal: 'green',
  'temporary-out-of-stock': 'orange',
  stopped: 'red',
  risk: 'red',
  '': undefined,
}

type DetailTab = {
  key: string
  label: string
  count?: number
}

type BasicDetailFieldKey =
  | 'sku'
  | 'brand'
  | 'chineseName'
  | 'englishName'
  | 'russianName'
  | 'barcode'
  | 'category'
  | 'material'
  | 'specModel'
  | 'status'
  | 'grossWeight'
  | 'netWeight'
  | 'packageSize'

type BasicDetailItem = ProductDetailInfoItem & {
  key: BasicDetailFieldKey
}

type MediaUploadKind = 'image' | 'video'

type MediaUploadAction = {
  key: string
  kind: MediaUploadKind
  label: string
}

type MediaFileItem = FileItem & {
  sourceUrl?: string
}

type MediaInfoRow = {
  key: string
  label: string
  required?: boolean
  fileList: MediaFileItem[]
  uploadActions: MediaUploadAction[]
}

type MappingColumnKey = 'platform' | 'store' | 'platformProductId' | 'platformSkuId' | 'platformBarcode' | 'listingStatus' | 'linkedAt'
type MappingTableColumnData = ConfigurableTableColumn<MappingColumnKey> & { title: string }
type InventoryColumnKey = 'warehouse' | 'location' | 'stock' | 'warningQty' | 'status'
type InventoryTableColumnData = ConfigurableTableColumn<InventoryColumnKey> & { title: string }
type InventoryRow = {
  warehouse: string
  location: string
  stock: number
  warningQty: number
  status: string
  tone: 'green' | 'orange' | 'blue' | 'red'
}
type RecentOrderColumnKey = 'orderNo' | 'platform' | 'store' | 'quantity' | 'amount' | 'status' | 'orderedAt'
type RecentOrderTableColumnData = ConfigurableTableColumn<RecentOrderColumnKey> & { title: string }
type RecentOrderRow = {
  orderNo: string
  platform: string
  store: string
  quantity: number
  amount: string
  status: string
  statusTone: 'green' | 'orange' | 'blue' | 'red'
  orderedAt: string
}
type ProfitRow = {
  key: string
  platform: string
  store: string
  price: string
  discount: string
  dealPrice: string
  commission: string
  logisticsFee: string
  purchaseCost: string
  netProfit: string
  profitRate: string
}
type ReviewColumnKey = 'rating' | 'platform' | 'store' | 'category' | 'content' | 'publishedAt'
type ReviewTableColumnData = ConfigurableTableColumn<ReviewColumnKey> & { title: string }
type ProductReviewRow = {
  id: string
  platform: string
  store: string
  category: string
  rating: number
  title: string
  author: string
  orderNo: string
  text: string
  publishedAt: string
}
type ReviewFilterState = {
  platform: string
  store: string
  category: string
  dateQuick: string
  dateRange: string[]
  keyword: string
}
type ProductTabSummaryCard = {
  label: string
  value: string | number
  note?: string
  tone?: 'green' | 'orange' | 'blue' | 'red'
}
type ChangeLogTone = 'green' | 'orange' | 'blue' | 'red'
type ChangeLogValueType = 'text' | 'status' | 'tag'
type ChangeLogChange = {
  category: string
  field: string
  before: string
  after: string
  beforeTone?: ChangeLogTone
  afterTone?: ChangeLogTone
  valueType?: ChangeLogValueType
}
type ChangeLogColumnKey = 'time' | 'operator' | 'category' | 'before' | 'direction' | 'after'
type ChangeLogTableColumnData = ConfigurableTableColumn<ChangeLogColumnKey> & { title: string }
type ChangeLogItem = {
  id: string
  date: string
  time: string
  operator: string
  operatorInitial: string
  changes: ChangeLogChange[]
}

const formatDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

const isDateKeyInRange = (dateKey: string, startKey: string, endKey: string) =>
  dateKey >= startKey && dateKey <= endKey

const getReviewDateRangeByQuick = (dateQuick: string) => {
  const today = new Date()
  const todayKey = formatDateKey(today)

  if (dateQuick === 'today') return [todayKey, todayKey]
  if (dateQuick === 'yesterday') {
    const yesterdayKey = formatDateKey(addDays(today, -1))
    return [yesterdayKey, yesterdayKey]
  }
  if (dateQuick === 'near-month') return [formatDateKey(addDays(today, -30)), todayKey]

  return []
}

const createDefaultReviewFilters = (): ReviewFilterState => ({
  platform: '',
  store: '',
  category: '',
  dateQuick: '',
  dateRange: [],
  keyword: '',
})

const pageMode = computed(() => route.path.endsWith('/create') ? 'create' : 'edit')
const isCreateMode = computed(() => pageMode.value === 'create')
const routeSku = computed(() => decodeURIComponent(String(route.params.sku ?? '')))

const draft = ref<ProductRecord>(createEmptyProduct())
const missingProduct = ref(false)
const activeDetailTab = ref('basic')
const mediaUploadFiles = ref<Record<string, MediaFileItem[]>>({})
const mediaPreviewObjectUrls = ref<Record<string, string>>({})
const videoPreviewVisible = ref(false)
const videoPreviewSrc = ref('')
const videoPreviewObjectUrl = ref('')
const editingMappingId = ref<string>()
const mappingDraft = ref<ProductPlatformMapping>()
const reviewPlatformFilter = ref('')
const reviewStoreFilter = ref('')
const reviewCategoryFilter = ref('')
const activeReviewDateQuick = ref('')
const reviewDateRange = ref<string[]>([])
const reviewSearchKeyword = ref('')
const appliedReviewFilters = ref<ReviewFilterState>(createDefaultReviewFilters())

const detailTabs = computed<DetailTab[]>(() => [
  { key: 'basic', label: '基础信息' },
  { key: 'inventory', label: '库存概况' },
  { key: 'orders', label: '近期订单', count: isCreateMode.value ? undefined : 32 },
  { key: 'profit', label: '利润概览' },
  { key: 'reviews', label: '商品评价' },
  { key: 'changes', label: '变更记录' },
])

const mappingVisibleColumnKeys: MappingColumnKey[] = [
  'platform',
  'store',
  'platformProductId',
  'platformSkuId',
  'platformBarcode',
  'listingStatus',
  'linkedAt',
]

const mappingColumns: MappingTableColumnData[] = [
  { settingsKey: 'platform', title: '平台', slotName: 'platform', width: 140, minWidth: 118 },
  { settingsKey: 'store', title: '店铺', slotName: 'store', width: 160, minWidth: 136, ellipsis: true, tooltip: true },
  { settingsKey: 'platformProductId', title: '平台商品 ID', slotName: 'platformProductId', width: 180, minWidth: 148, ellipsis: true, tooltip: true },
  { settingsKey: 'platformSkuId', title: '平台 SKU', slotName: 'platformSkuId', width: 180, minWidth: 148, ellipsis: true, tooltip: true },
  { settingsKey: 'platformBarcode', title: '平台条码', slotName: 'platformBarcode', width: 180, minWidth: 148, ellipsis: true, tooltip: true },
  { settingsKey: 'listingStatus', title: '状态', slotName: 'listingStatus', width: 130, minWidth: 108 },
  { settingsKey: 'linkedAt', title: '关联时间', slotName: 'linkedAt', width: 140, minWidth: 120, align: 'center' },
  { title: '操作', slotName: 'operation', width: 116, align: 'center' },
]

const inventorySummaryCards: ProductTabSummaryCard[] = [
  { label: '总库存', value: '156', note: '4 个店铺 · 7 个仓库' },
  { label: 'WB 仓库合计', value: '98', note: '3 个店铺', tone: 'blue' },
  { label: '自有仓库合计', value: '58', note: '1 个仓库' },
  { label: '低库存预警', value: '2', note: '白俄仓 / 深圳仓', tone: 'red' },
]

const inventoryVisibleColumnKeys: InventoryColumnKey[] = [
  'warehouse',
  'location',
  'stock',
  'warningQty',
  'status',
]

const inventoryColumns: InventoryTableColumnData[] = [
  { settingsKey: 'warehouse', title: '仓库', dataIndex: 'warehouse', width: 220, minWidth: 160, ellipsis: true, tooltip: true },
  { settingsKey: 'location', title: '库位', dataIndex: 'location', slotName: 'location', width: 160, minWidth: 120 },
  { settingsKey: 'stock', title: '当前库存', dataIndex: 'stock', width: 140, minWidth: 116, align: 'right' },
  { settingsKey: 'warningQty', title: '预警数量', dataIndex: 'warningQty', width: 140, minWidth: 116, align: 'right' },
  { settingsKey: 'status', title: '状态', dataIndex: 'status', slotName: 'status', width: 120, minWidth: 96, align: 'center' },
]

const inventoryStoreGroups = [
  {
    key: 'wb-russia',
    platform: 'Wildberries',
    store: '俄区主店',
    total: 45,
    rows: [
      { warehouse: 'WB 莫斯科仓', location: '-', stock: 32, warningQty: 10, status: '正常', tone: 'green' },
      { warehouse: 'WB 圣彼得堡仓', location: '-', stock: 13, warningQty: 10, status: '正常', tone: 'green' },
    ],
  },
  {
    key: 'wb-kazakhstan',
    platform: 'Wildberries',
    store: '哈萨克斯坦店',
    total: 32,
    rows: [
      { warehouse: 'WB 阿拉木图仓', location: '-', stock: 32, warningQty: 10, status: '正常', tone: 'green' },
    ],
  },
  {
    key: 'wb-belarus',
    platform: 'Wildberries',
    store: '白俄罗斯店',
    total: 21,
    warning: true,
    rows: [
      { warehouse: 'WB 明斯克仓', location: '-', stock: 21, warningQty: 30, status: '低库存', tone: 'orange' },
    ],
  },
  {
    key: 'self-shenzhen',
    platform: '',
    store: '自有仓库 · 深圳',
    total: 58,
    warning: true,
    rows: [
      { warehouse: '深圳仓 A 区', location: 'A-03-12', stock: 35, warningQty: 60, status: '低库存', tone: 'orange' },
      { warehouse: '深圳仓 B 区', location: 'B-07-05', stock: 23, warningQty: 60, status: '低库存', tone: 'orange' },
    ],
  },
]

const recentOrderSummaryCards: ProductTabSummaryCard[] = [
  { label: '近 30 天订单', value: '32' },
  { label: '待发货', value: '5', tone: 'orange' },
  { label: '运输中', value: '12', tone: 'blue' },
  { label: '已完成', value: '15', tone: 'green' },
]

const recentOrderVisibleColumnKeys: RecentOrderColumnKey[] = [
  'orderNo',
  'platform',
  'store',
  'quantity',
  'amount',
  'status',
  'orderedAt',
]

const recentOrderColumns: RecentOrderTableColumnData[] = [
  { settingsKey: 'orderNo', title: '订单号', dataIndex: 'orderNo', slotName: 'orderNo', width: 170, minWidth: 148 },
  { settingsKey: 'platform', title: '平台', dataIndex: 'platform', slotName: 'platform', width: 130, minWidth: 108 },
  { settingsKey: 'store', title: '店铺', dataIndex: 'store', width: 170, minWidth: 136, ellipsis: true, tooltip: true },
  { settingsKey: 'quantity', title: '数量', dataIndex: 'quantity', align: 'right', width: 100, minWidth: 82 },
  { settingsKey: 'amount', title: '金额', dataIndex: 'amount', align: 'right', width: 130, minWidth: 110 },
  { settingsKey: 'status', title: '状态', dataIndex: 'status', slotName: 'status', align: 'center', width: 120, minWidth: 96 },
  { settingsKey: 'orderedAt', title: '下单时间', dataIndex: 'orderedAt', align: 'center', width: 130, minWidth: 110 },
]

const recentOrderRows: RecentOrderRow[] = [
  { orderNo: 'WB-78901234', platform: 'Wildberries', store: '俄区主店', quantity: 1, amount: '1 890 ₽', status: '已完成', statusTone: 'green', orderedAt: '04-28' },
  { orderNo: 'WB-78901198', platform: 'Wildberries', store: '哈萨克斯坦店', quantity: 2, amount: '15 800 ₽', status: '待发货', statusTone: 'orange', orderedAt: '04-29' },
  { orderNo: 'WB-78901056', platform: 'Wildberries', store: '俄区主店', quantity: 1, amount: '1 890 ₽', status: '运输中', statusTone: 'blue', orderedAt: '04-27' },
  { orderNo: 'WB-78900987', platform: 'Wildberries', store: '白俄罗斯店', quantity: 1, amount: '59 BYN', status: '已完成', statusTone: 'green', orderedAt: '04-26' },
  { orderNo: 'WB-78900845', platform: 'Wildberries', store: '俄区主店', quantity: 3, amount: '5 670 ₽', status: '已完成', statusTone: 'green', orderedAt: '04-25' },
  { orderNo: 'WB-78900612', platform: 'Wildberries', store: '哈萨克斯坦店', quantity: 1, amount: '7 900 ₽', status: '运输中', statusTone: 'blue', orderedAt: '04-24' },
]

const profitSummaryCards: ProductTabSummaryCard[] = [
  { label: '近 30 天销售额', value: '68 230 ₽', note: '36 笔订单', tone: 'blue' },
  { label: '近 30 天采购成本', value: '¥ 1 620', note: '36 件 × ¥45' },
  { label: '近 30 天净利润率', value: '52.3%', note: '汇率 8.72 CNY/RUB', tone: 'green' },
]

const profitRows: ProfitRow[] = [
  {
    key: 'wb-russia',
    platform: 'WB',
    store: '俄区主店',
    price: '1 890 ₽',
    discount: '-10%',
    dealPrice: '1 701 ₽',
    commission: '- 255 ₽',
    logisticsFee: '- 85 ₽',
    purchaseCost: '- 392 ₽ (¥45)',
    netProfit: '+ 969 ₽',
    profitRate: '57.0%',
  },
  {
    key: 'wb-kazakhstan',
    platform: 'WB',
    store: '哈萨克斯坦店',
    price: '7 900 ₽',
    discount: '—',
    dealPrice: '7 900 ₽',
    commission: '- 1 185 ₽',
    logisticsFee: '- 220 ₽',
    purchaseCost: '- 392 ₽ (¥45)',
    netProfit: '+ 6 103 ₽',
    profitRate: '77.2%',
  },
]

const reviewPlatformOptions = [
  { label: 'TikTok Shop', value: 'TikTok Shop' },
  { label: 'Wildberries', value: 'Wildberries' },
]

const reviewStoreOptions = [
  { label: '东南亚厨房店', value: '东南亚厨房店' },
  { label: '中东生活店', value: '中东生活店' },
]

const reviewCategoryOptions = [
  { label: '厨房用品', value: '厨房用品' },
  { label: '户外便携', value: '户外便携' },
]

const reviewDateQuickOptions = [
  { label: '今天', value: 'today' },
  { label: '昨天', value: 'yesterday' },
  { label: '近一个月', value: 'near-month' },
]

const reviewVisibleColumnKeys: ReviewColumnKey[] = [
  'rating',
  'platform',
  'store',
  'category',
  'content',
  'publishedAt',
]

const reviewColumns: ReviewTableColumnData[] = [
  { settingsKey: 'rating', title: '评级', dataIndex: 'rating', slotName: 'rating', width: 180, minWidth: 140 },
  { settingsKey: 'platform', title: '平台', dataIndex: 'platform', slotName: 'platform', width: 120, minWidth: 100 },
  { settingsKey: 'store', title: '店铺', dataIndex: 'store', width: 160, minWidth: 132, ellipsis: true, tooltip: true },
  { settingsKey: 'category', title: '品类', dataIndex: 'category', width: 140, minWidth: 116, ellipsis: true, tooltip: true },
  { settingsKey: 'content', title: '评价', dataIndex: 'text', slotName: 'content', width: 520, minWidth: 360, ellipsis: true, tooltip: true },
  { settingsKey: 'publishedAt', title: '发表时间', dataIndex: 'publishedAt', slotName: 'publishedAt', width: 180, minWidth: 150 },
]

const reviewRows: ProductReviewRow[] = [
  {
    id: 'review-tts-001',
    platform: 'TikTok Shop',
    store: '东南亚厨房店',
    category: '厨房用品',
    rating: 5,
    title: '杯身轻，户外携带方便',
    author: 'Nora K.',
    orderNo: 'TTS-78901234',
    text: '杯身轻，户外携带方便，打果汁速度很快。',
    publishedAt: '2026-04-28 18:20',
  },
  {
    id: 'review-tts-002',
    platform: 'TikTok Shop',
    store: '东南亚厨房店',
    category: '厨房用品',
    rating: 4,
    title: '清洗方便，续航略短',
    author: 'Mika L.',
    orderNo: 'TTS-78901198',
    text: '续航比预期略短，但清洗和出汁效果不错。',
    publishedAt: '2026-04-22 11:08',
  },
  {
    id: 'review-wb-001',
    platform: 'Wildberries',
    store: '中东生活店',
    category: '户外便携',
    rating: 5,
    title: 'Удобно брать на работу',
    author: 'Елена П.',
    orderNo: 'WB-78900987',
    text: 'Хороший блендер, удобно брать на работу.',
    publishedAt: '2026-04-26 16:45',
  },
  {
    id: 'review-wb-002',
    platform: 'Wildberries',
    store: '中东生活店',
    category: '户外便携',
    rating: 4,
    title: '包装有轻微挤压',
    author: 'Artem S.',
    orderNo: 'WB-78900845',
    text: 'Коробка немного помялась, сам товар работает.',
    publishedAt: '2026-04-18 09:32',
  },
]

const matchesReviewDateFilter = (row: ProductReviewRow, filters: ReviewFilterState) => {
  const publishedDate = row.publishedAt.slice(0, 10)

  if (filters.dateRange.length === 2 && filters.dateRange[0] && filters.dateRange[1]) {
    return isDateKeyInRange(publishedDate, filters.dateRange[0], filters.dateRange[1])
  }

  const today = new Date()
  if (filters.dateQuick === 'today') return publishedDate === formatDateKey(today)
  if (filters.dateQuick === 'yesterday') return publishedDate === formatDateKey(addDays(today, -1))
  if (filters.dateQuick === 'near-month') return isDateKeyInRange(publishedDate, formatDateKey(addDays(today, -30)), formatDateKey(today))

  return true
}

const filteredReviewRows = computed(() => {
  const filters = appliedReviewFilters.value
  const keyword = filters.keyword.trim().toLowerCase()

  return reviewRows.filter((row) => {
    const matchesKeyword = !keyword || [
      row.title,
      row.text,
      row.author,
      row.orderNo,
      row.platform,
      row.store,
      row.category,
    ].some((value) => value.toLowerCase().includes(keyword))

    return (
      (!filters.platform || row.platform === filters.platform)
      && (!filters.store || row.store === filters.store)
      && (!filters.category || row.category === filters.category)
      && matchesReviewDateFilter(row, filters)
      && matchesKeyword
    )
  })
})

const changeLogVisibleColumnKeys: ChangeLogColumnKey[] = [
  'time',
  'operator',
  'category',
  'before',
  'direction',
  'after',
]

const changeLogColumns: ChangeLogTableColumnData[] = [
  { settingsKey: 'time', title: '时间', dataIndex: 'time', slotName: 'time', width: 150, minWidth: 132 },
  { settingsKey: 'operator', title: '操作人', dataIndex: 'operator', slotName: 'operator', width: 180, minWidth: 150 },
  { settingsKey: 'category', title: '分类', dataIndex: 'id', slotName: 'category', width: 160, minWidth: 128 },
  { settingsKey: 'before', title: '变更前', dataIndex: 'id', slotName: 'before', width: 320, minWidth: 240 },
  { settingsKey: 'direction', title: '', dataIndex: 'id', slotName: 'direction', width: 64, minWidth: 48, align: 'center' },
  { settingsKey: 'after', title: '变更后', dataIndex: 'id', slotName: 'after', width: 340, minWidth: 260 },
]

const changeLogItems: ChangeLogItem[] = [
  {
    id: 'change-basic-20260430',
    date: '04月30日',
    time: '2026-04-30 00:18',
    operator: '张三',
    operatorInitial: '张',
    changes: [
      { category: '基础信息', field: '包装尺寸', before: '18 × 8 × 4 cm', after: '24 × 10.5 × 10.5 cm' },
      { category: '基础信息', field: '商品英文名', before: 'Portable Blender Cup', after: 'Portable Blender Travel Cup' },
    ],
  },
  {
    id: 'change-procurement-20260422',
    date: '04月22日',
    time: '2026-04-22 16:40',
    operator: '李四',
    operatorInitial: '李',
    changes: [
      { category: '采购参考', field: '最近采购价', before: '¥42.00', after: '¥49.80' },
      { category: '采购参考', field: '供应商', before: '义乌电子', after: '深圳优越电器' },
    ],
  },
  {
    id: 'change-mapping-20260320',
    date: '03月20日',
    time: '2026-03-20 09:15',
    operator: '张三',
    operatorInitial: '张',
    changes: [
      { category: '平台映射', field: '平台', before: '-', after: 'WB', afterTone: 'blue', valueType: 'tag' },
      { category: '平台映射', field: '店铺', before: '-', after: '中东生活店' },
      { category: '平台映射', field: '平台商品 ID', before: '-', after: 'WB-PROD-10332' },
      { category: '平台映射', field: '上架状态', before: '未上架', after: '已上架', beforeTone: 'orange', afterTone: 'green', valueType: 'status' },
    ],
  },
  {
    id: 'change-created-20260315',
    date: '03月15日',
    time: '2026-03-15 10:30',
    operator: '系统',
    operatorInitial: '系',
    changes: [
      { category: '商品档案', field: '创建商品', before: '-', after: '-' },
    ],
  },
]

const overviewDescriptionParts = computed(() => [
  draft.value.basicInfo.chineseName,
  draft.value.basicInfo.englishName,
  draft.value.basicInfo.russianName,
  draft.value.basicInfo.brand,
  draft.value.basicInfo.category,
].map((value) => value.trim()).filter(Boolean))

const overviewMainImage = computed(() => {
  const uploadedMainImage = mediaUploadFiles.value['main-image']?.[0]
  return uploadedMainImage?.sourceUrl || uploadedMainImage?.url || draft.value.basicInfo.mainImage
})

const pageTitle = computed(() => isCreateMode.value ? '新建商品' : '商品详情')

const categoryEditOptions = [
  { label: '数码配件', value: '数码配件' },
  { label: '车载配件', value: '车载配件' },
  { label: '家居日用', value: '家居日用' },
]

const materialOptions = [
  { label: 'ABS', value: 'ABS' },
  { label: 'ABS + 硅胶', value: 'ABS + 硅胶' },
  { label: 'Tritan + ABS', value: 'Tritan + ABS' },
  { label: 'PC', value: 'PC' },
  { label: 'PP', value: 'PP' },
  { label: 'PE', value: 'PE' },
  { label: 'PET', value: 'PET' },
  { label: '硅胶', value: '硅胶' },
  { label: '不锈钢', value: '不锈钢' },
  { label: '铝合金', value: '铝合金' },
  { label: '玻璃', value: '玻璃' },
  { label: '陶瓷', value: '陶瓷' },
  { label: '木材', value: '木材' },
  { label: '竹纤维', value: '竹纤维' },
  { label: '棉', value: '棉' },
  { label: '尼龙', value: '尼龙' },
  { label: '涤纶', value: '涤纶' },
]

const formatDetailValue = (value: string | number | undefined) => {
  if (value === undefined || value === '') return '-'
  return String(value)
}

const formatWeightValue = (value: number | undefined) => {
  if (value === undefined) return '-'
  return value.toFixed(3)
}

const formatPriceValue = (value: number | undefined) => {
  if (value === undefined) return '-'
  return value.toFixed(2)
}

const formatOptionValue = (value: string | boolean | undefined, options: Array<{ label: string, value: string | boolean }>) => {
  if (value === undefined || value === '') return '-'
  return options.find((option) => option.value === value)?.label ?? String(value)
}

const formatOptionListValue = (values: string[], options: Array<{ label: string, value: string | boolean }>) => {
  if (!values.length) return '-'
  return values.map((value) => options.find((option) => option.value === value)?.label ?? value).join('、')
}

const packageSizeText = computed(() => {
  const { packageLength, packageWidth, packageHeight } = draft.value.packaging
  const sizeValues = [packageLength, packageWidth, packageHeight]
  if (sizeValues.some((value) => value === undefined)) return '-'

  return sizeValues.map(formatDetailValue).join(' × ')
})

const basicDetailItems = computed<BasicDetailItem[]>(() => [
  { key: 'sku', label: 'SKU', required: true, control: isCreateMode.value ? 'text' : 'readonly', value: formatDetailValue(draft.value.basicInfo.sku), editValue: draft.value.basicInfo.sku, mono: true },
  { key: 'brand', label: '品牌', control: 'text', value: formatDetailValue(draft.value.basicInfo.brand), editValue: draft.value.basicInfo.brand },
  { key: 'chineseName', label: '商品中文名', required: true, control: 'text', value: formatDetailValue(draft.value.basicInfo.chineseName), editValue: draft.value.basicInfo.chineseName },
  { key: 'englishName', label: '商品英文名', control: 'text', value: formatDetailValue(draft.value.basicInfo.englishName), editValue: draft.value.basicInfo.englishName },
  { key: 'russianName', label: '商品俄文名', control: 'text', value: formatDetailValue(draft.value.basicInfo.russianName), editValue: draft.value.basicInfo.russianName },
  { key: 'barcode', label: '条码', control: 'text', mono: true, value: formatDetailValue(draft.value.basicInfo.barcode), editValue: draft.value.basicInfo.barcode },
  { key: 'category', label: '类目', control: 'select', options: categoryEditOptions, value: formatDetailValue(draft.value.basicInfo.category), editValue: draft.value.basicInfo.category },
  { key: 'material', label: '材质', control: 'combobox', options: materialOptions, value: formatDetailValue(draft.value.basicInfo.material), editValue: draft.value.basicInfo.material },
  { key: 'specModel', label: '规格型号', control: 'text', value: formatDetailValue(draft.value.basicInfo.specModel), editValue: draft.value.basicInfo.specModel },
  { key: 'status', label: '状态', required: true, control: 'select', options: productStatusOptions, value: statusLabelMap[draft.value.basicInfo.status], editValue: draft.value.basicInfo.status, statusTone: statusToneMap[draft.value.basicInfo.status] },
  { key: 'grossWeight', label: '毛重 (kg)', control: 'number', value: formatWeightValue(draft.value.packaging.grossWeight), editValue: draft.value.packaging.grossWeight, mono: true },
  { key: 'netWeight', label: '净重 (kg)', control: 'number', value: formatWeightValue(draft.value.packaging.netWeight), editValue: draft.value.packaging.netWeight, mono: true },
  { key: 'packageSize', label: '包装尺寸 (cm)', control: 'dimension', value: packageSizeText.value, editValue: [draft.value.packaging.packageLength, draft.value.packaging.packageWidth, draft.value.packaging.packageHeight], mono: true },
])

const logisticsInfoItems = computed<ProductDetailInfoItem[]>(() => [
  { key: 'logistics.customsChineseName', label: '报关中文名', required: true, control: 'text', value: formatDetailValue(draft.value.logistics.customsChineseName), editValue: draft.value.logistics.customsChineseName },
  { key: 'logistics.customsEnglishName', label: '报关英文名', control: 'text', value: formatDetailValue(draft.value.logistics.customsEnglishName), editValue: draft.value.logistics.customsEnglishName },
  { key: 'logistics.hsCode', label: 'HS Code', control: 'text', value: formatDetailValue(draft.value.logistics.hsCode), editValue: draft.value.logistics.hsCode, mono: true },
  { key: 'logistics.countryOfOrigin', label: '原产地', control: 'text', value: formatDetailValue(draft.value.logistics.countryOfOrigin), editValue: draft.value.logistics.countryOfOrigin },
  { key: 'logistics.logisticsTags', label: '物流属性标签', control: 'multiselect', value: formatOptionListValue(draft.value.logistics.logisticsTags, logisticsTagOptions), editValue: [...draft.value.logistics.logisticsTags], options: logisticsTagOptions, span: 'wide' },
])

const procurementInfoItems = computed<ProductDetailInfoItem[]>(() => [
  { key: 'procurement.purchasable', label: '是否可采购', required: true, control: 'select', value: formatOptionValue(draft.value.procurement.purchasable, purchasableOptions), editValue: draft.value.procurement.purchasable, options: purchasableOptions },
  { key: 'procurement.recentSupplier', label: '最近采购供应商', control: 'text', value: formatDetailValue(draft.value.procurement.recentSupplier), editValue: draft.value.procurement.recentSupplier },
  { key: 'procurement.recentPrice', label: '最近采购价', control: 'number', value: formatPriceValue(draft.value.procurement.recentPrice), editValue: draft.value.procurement.recentPrice, mono: true },
  { key: 'procurement.currency', label: '采购币种', control: 'select', value: formatOptionValue(draft.value.procurement.currency, currencyOptions), editValue: draft.value.procurement.currency, options: currencyOptions },
  { key: 'procurement.recentPurchaseDate', label: '最近采购日期', control: 'date', value: formatDetailValue(draft.value.procurement.recentPurchaseDate), editValue: draft.value.procurement.recentPurchaseDate },
  { key: 'procurement.status', label: '采购状态', control: 'select', value: formatOptionValue(draft.value.procurement.status, procurementStatusOptions), editValue: draft.value.procurement.status, options: procurementStatusOptions, statusTone: procurementStatusToneMap[draft.value.procurement.status] },
  { key: 'procurement.defaultPurchaseUrl', label: '默认采购链接', required: true, control: 'text', value: formatDetailValue(draft.value.procurement.defaultPurchaseUrl), href: draft.value.procurement.defaultPurchaseUrl.trim() || undefined, editValue: draft.value.procurement.defaultPurchaseUrl, span: 'wide' },
  { key: 'procurement.note', label: '采购备注', control: 'textarea', value: formatDetailValue(draft.value.procurement.note), editValue: draft.value.procurement.note, span: 'wide' },
])

const buildImageFileItems = (images: string[], keyPrefix: string, namePrefix: string): MediaFileItem[] =>
  images.map((src, index) => ({
    uid: `${keyPrefix}-${index}`,
    name: `${namePrefix}${index + 1}`,
    url: src,
    status: 'done',
  }))

const getMediaFileList = (key: string, fallbackFileList: MediaFileItem[]) => mediaUploadFiles.value[key] ?? fallbackFileList

const createMediaUploadAction = (key: string, label: string, kind: MediaUploadKind = 'image'): MediaUploadAction => ({
  key,
  kind,
  label,
})

const getMediaUploadAccept = (kind: MediaUploadKind) => kind === 'video' ? 'video/*' : 'image/*'

const clearMediaPreviewObjectUrls = () => {
  Object.values(mediaPreviewObjectUrls.value).forEach((url) => URL.revokeObjectURL(url))
  mediaPreviewObjectUrls.value = {}
}

const createMediaPreviewFileItem = (key: string, item: FileItem): MediaFileItem => {
  const mediaItem = { ...item } as MediaFileItem
  const file = mediaItem.file
  if (!file) return mediaItem

  const objectUrlKey = `${key}:${mediaItem.uid}`
  const objectUrl = mediaPreviewObjectUrls.value[objectUrlKey] ?? URL.createObjectURL(file)
  mediaPreviewObjectUrls.value = {
    ...mediaPreviewObjectUrls.value,
    [objectUrlKey]: objectUrl,
  }

  mediaItem.sourceUrl = mediaItem.sourceUrl || objectUrl
  if (!mediaItem.url && file.type.startsWith('image/')) {
    mediaItem.url = objectUrl
  }

  return mediaItem
}

const createVideoCoverFromFile = (file: File) => new Promise<string>((resolve, reject) => {
  const video = document.createElement('video')
  const canvas = document.createElement('canvas')
  const objectUrl = URL.createObjectURL(file)
  let settled = false

  const cleanup = () => {
    URL.revokeObjectURL(objectUrl)
    video.removeAttribute('src')
    video.load()
  }

  const finish = (callback: () => void) => {
    if (settled) return
    settled = true
    cleanup()
    callback()
  }

  const captureFrame = () => {
    const width = video.videoWidth || 100
    const height = video.videoHeight || 100
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')

    if (!context) {
      finish(() => reject(new Error('视频封面生成失败')))
      return
    }

    context.drawImage(video, 0, 0, width, height)
    finish(() => resolve(canvas.toDataURL('image/jpeg', 0.82)))
  }

  video.addEventListener('loadedmetadata', () => {
    const seekTime = Number.isFinite(video.duration) && video.duration > 0.1 ? 0.1 : 0
    if (seekTime > 0) {
      video.currentTime = seekTime
    }
  }, { once: true })
  video.addEventListener('loadeddata', () => {
    if (!Number.isFinite(video.duration) || video.duration <= 0.1) {
      captureFrame()
    }
  }, { once: true })
  video.addEventListener('seeked', captureFrame, { once: true })
  video.addEventListener('error', () => finish(() => reject(new Error('视频封面生成失败'))), { once: true })

  video.preload = 'metadata'
  video.muted = true
  video.playsInline = true
  video.src = objectUrl
  video.load()
})

const setMediaUploadFiles = (key: string, fileList: FileItem[]) => {
  mediaUploadFiles.value = {
    ...mediaUploadFiles.value,
    [key]: fileList.map((item) => createMediaPreviewFileItem(key, item)),
  }
}

const updateVideoCover = async (key: string, fileItem: FileItem) => {
  const file = fileItem.file
  if (!file || !file.type.startsWith('video/') || fileItem.url) return

  try {
    const coverUrl = await createVideoCoverFromFile(file)
    const currentFileList = mediaUploadFiles.value[key] ?? []
    mediaUploadFiles.value = {
      ...mediaUploadFiles.value,
      [key]: currentFileList.map((item) => item.uid === fileItem.uid ? { ...item, url: coverUrl } : item),
    }
  } catch {
    // Keep Arco's default file item if the browser cannot decode the selected video.
  }
}

const clearVideoPreviewObjectUrl = () => {
  if (!videoPreviewObjectUrl.value) return

  URL.revokeObjectURL(videoPreviewObjectUrl.value)
  videoPreviewObjectUrl.value = ''
}

const openVideoPreview = (fileItem: FileItem) => {
  clearVideoPreviewObjectUrl()

  const mediaFileItem = fileItem as MediaFileItem
  let src = mediaFileItem.sourceUrl
  if (!src && fileItem.file) {
    src = URL.createObjectURL(fileItem.file)
    videoPreviewObjectUrl.value = src
  }

  if (!src) return

  videoPreviewSrc.value = src
  videoPreviewVisible.value = true
}

const handleMediaPreview = (kind: MediaUploadKind, fileItem: FileItem) => {
  if (kind === 'video') {
    openVideoPreview(fileItem)
  }
}

const handleMediaUploadChange = (key: string, kind: MediaUploadKind, fileList: FileItem[], fileItem: FileItem) => {
  setMediaUploadFiles(key, fileList)

  if (kind === 'video') {
    void updateVideoCover(key, fileItem)
  }
}

const mediaInfoRows = computed<MediaInfoRow[]>(() => {
  const galleryImages = draft.value.basicInfo.galleryImages.filter(Boolean)
  const productImages = [draft.value.basicInfo.mainImage, ...galleryImages].filter(Boolean).slice(0, 3)

  return [
    {
      key: 'main-image',
      label: '商品主图',
      required: true,
      fileList: getMediaFileList('main-image', buildImageFileItems(productImages, 'main-image', '商品主图')),
      uploadActions: [
        createMediaUploadAction('upload-main-image', '上传主图'),
      ],
    },
    {
      key: 'main-video',
      label: '主图视频',
      fileList: getMediaFileList('main-video', []),
      uploadActions: [
        createMediaUploadAction('upload-main-video', '上传视频', 'video'),
      ],
    },
    {
      key: 'detail-images',
      label: '详情页图片',
      required: true,
      fileList: getMediaFileList('detail-images', buildImageFileItems(productImages, 'detail-image', '详情页图')),
      uploadActions: [
        createMediaUploadAction('upload-detail-image', '上传图片'),
      ],
    },
    {
      key: 'package-images',
      label: '包装图',
      fileList: getMediaFileList('package-images', []),
      uploadActions: [
        createMediaUploadAction('upload-package-image', '上传包装图'),
      ],
    },
  ]
})

const loadDraft = () => {
  clearMediaPreviewObjectUrls()
  mediaUploadFiles.value = {}

  if (isCreateMode.value) {
    draft.value = createEmptyProduct()
    missingProduct.value = false
    return
  }

  const matched = catalogStore.getProductBySku(routeSku.value)
  if (!matched) {
    missingProduct.value = true
    return
  }

  draft.value = matched
  missingProduct.value = false
}

const goBackToList = () => {
  router.push('/products/core-library')
}

const toTextValue = (value: ProductDetailInfoValue) => typeof value === 'string' ? value.trim() : ''
const toNumberValue = (value: ProductDetailInfoValue) => typeof value === 'number' && Number.isFinite(value) ? value : undefined
const toStringListValue = (value: ProductDetailInfoValue) => Array.isArray(value)
  ? value.map((item) => String(item).trim()).filter(Boolean)
  : []
const toDimensionValue = (value: ProductDetailInfoValue): [number | undefined, number | undefined, number | undefined] => {
  if (!Array.isArray(value)) return [undefined, undefined, undefined]
  return [
    typeof value[0] === 'number' ? value[0] : undefined,
    typeof value[1] === 'number' ? value[1] : undefined,
    typeof value[2] === 'number' ? value[2] : undefined,
  ]
}

const assignBasicTextField = (key: BasicDetailFieldKey, value: string) => {
  switch (key) {
    case 'sku':
      draft.value.basicInfo.sku = value
      break
    case 'brand':
      draft.value.basicInfo.brand = value
      break
    case 'chineseName':
      draft.value.basicInfo.chineseName = value
      break
    case 'englishName':
      draft.value.basicInfo.englishName = value
      break
    case 'russianName':
      draft.value.basicInfo.russianName = value
      break
    case 'barcode':
      draft.value.basicInfo.barcode = value
      break
    case 'category':
      draft.value.basicInfo.category = value
      break
    case 'material':
      draft.value.basicInfo.material = value
      break
    case 'specModel':
      draft.value.basicInfo.specModel = value
      break
    case 'status':
      draft.value.basicInfo.status = value as ProductStatus
      break
  }
}

const saveBasicInfoField = (key: BasicDetailFieldKey, value: ProductDetailInfoValue) => {
  if (key === 'grossWeight') {
    draft.value.packaging.grossWeight = toNumberValue(value)
    return
  }

  if (key === 'netWeight') {
    draft.value.packaging.netWeight = toNumberValue(value)
    return
  }

  if (key === 'packageSize') {
    const [packageLength, packageWidth, packageHeight] = toDimensionValue(value)
    draft.value.packaging.packageLength = packageLength
    draft.value.packaging.packageWidth = packageWidth
    draft.value.packaging.packageHeight = packageHeight
    return
  }

  const textValue = toTextValue(value)
  if (key === 'sku' && !textValue) {
    Message.warning('请填写 SKU')
    return
  }
  if (key === 'chineseName' && !textValue) {
    Message.warning('请填写商品中文名')
    return
  }
  if (key === 'status' && !textValue) {
    Message.warning('请选择商品状态')
    return
  }

  assignBasicTextField(key, textValue)
}

const saveLogisticsInfoField = (key: string, value: ProductDetailInfoValue) => {
  const textValue = toTextValue(value)

  switch (key) {
    case 'logistics.customsChineseName':
      if (!textValue) {
        Message.warning('请填写报关中文名')
        return
      }
      draft.value.logistics.customsChineseName = textValue
      break
    case 'logistics.customsEnglishName':
      draft.value.logistics.customsEnglishName = textValue
      break
    case 'logistics.hsCode':
      draft.value.logistics.hsCode = textValue
      break
    case 'logistics.countryOfOrigin':
      draft.value.logistics.countryOfOrigin = textValue
      break
    case 'logistics.logisticsTags':
      draft.value.logistics.logisticsTags = toStringListValue(value) as ProductRecord['logistics']['logisticsTags']
      break
  }
}

const saveProcurementInfoField = (key: string, value: ProductDetailInfoValue) => {
  const textValue = toTextValue(value)

  switch (key) {
    case 'procurement.defaultPurchaseUrl':
      if (!textValue) {
        Message.warning('请填写默认采购链接')
        return
      }
      draft.value.procurement.defaultPurchaseUrl = textValue
      break
    case 'procurement.purchasable':
      if (typeof value !== 'boolean') {
        Message.warning('请选择是否可采购')
        return
      }
      draft.value.procurement.purchasable = value
      break
    case 'procurement.recentSupplier':
      draft.value.procurement.recentSupplier = textValue
      break
    case 'procurement.recentPrice':
      draft.value.procurement.recentPrice = toNumberValue(value)
      break
    case 'procurement.currency':
      draft.value.procurement.currency = textValue
      break
    case 'procurement.recentPurchaseDate':
      draft.value.procurement.recentPurchaseDate = textValue
      break
    case 'procurement.status':
      draft.value.procurement.status = textValue as ProductRecord['procurement']['status']
      break
    case 'procurement.note':
      draft.value.procurement.note = textValue
      break
  }
}

const saveDetailInfoField = (key: string, value: ProductDetailInfoValue) => {
  if (key.startsWith('logistics.')) {
    saveLogisticsInfoField(key, value)
    return
  }

  if (key.startsWith('procurement.')) {
    saveProcurementInfoField(key, value)
    return
  }

  saveBasicInfoField(key as BasicDetailFieldKey, value)
}

const getPlatformShortLabel = (platform: string) => {
  if (platform === 'Wildberries') return 'WB'
  if (platform === 'TikTok Shop') return 'TTS'
  if (platform === 'AliExpress') return 'AE'
  return platform || '-'
}

const getInventoryStoreBadgeLabel = (group: { platform: string }) => group.platform ? getPlatformShortLabel(group.platform) : '自有仓库'

const getInventoryStoreName = (store: string) => store.replace('自有仓库 · ', '')

const syncReviewFilterInputs = (filters: ReviewFilterState) => {
  reviewPlatformFilter.value = filters.platform
  reviewStoreFilter.value = filters.store
  reviewCategoryFilter.value = filters.category
  activeReviewDateQuick.value = filters.dateQuick
  reviewDateRange.value = [...filters.dateRange]
  reviewSearchKeyword.value = filters.keyword
}

const applyReviewFilters = () => {
  appliedReviewFilters.value = {
    platform: reviewPlatformFilter.value,
    store: reviewStoreFilter.value,
    category: reviewCategoryFilter.value,
    dateQuick: activeReviewDateQuick.value,
    dateRange: [...reviewDateRange.value],
    keyword: reviewSearchKeyword.value,
  }
}

const resetReviewFilters = () => {
  const defaultFilters = createDefaultReviewFilters()
  syncReviewFilterInputs(defaultFilters)
  appliedReviewFilters.value = defaultFilters
}

const setReviewDateQuick = (dateQuick: string) => {
  activeReviewDateQuick.value = dateQuick
  reviewDateRange.value = getReviewDateRangeByQuick(dateQuick)
  applyReviewFilters()
}

const handleReviewDateRangeChange = (_value: unknown, _date: unknown, dateString?: Array<string | undefined>) => {
  reviewDateRange.value = Array.isArray(dateString)
    ? dateString.filter((item): item is string => Boolean(item))
    : []
  activeReviewDateQuick.value = ''
  applyReviewFilters()
}

const getMappingStatusLabel = (status: ProductRecord['mappings'][number]['listingStatus']) =>
  listingStatusOptions.find((option) => option.value === status)?.label ?? '未知'

const getMappingStatusClass = (status: ProductRecord['mappings'][number]['listingStatus']) => ({
  'is-linked': status === 'listed',
  'is-unlinked': status === 'unlisted',
  'is-unknown': status === 'unknown',
})

const startEditMapping = (mapping: ProductPlatformMapping) => {
  editingMappingId.value = mapping.id
  mappingDraft.value = { ...mapping }
}

const cancelEditMapping = () => {
  editingMappingId.value = undefined
  mappingDraft.value = undefined
}

const saveEditMapping = (mappingId: string) => {
  const nextMapping = mappingDraft.value
  if (!nextMapping) return

  draft.value.mappings = draft.value.mappings.map((mapping) =>
    mapping.id === mappingId ? { ...nextMapping, id: mappingId } : mapping)
  cancelEditMapping()
}

const removeMapping = (mappingId: string) => {
  draft.value.mappings = draft.value.mappings.filter((mapping) => mapping.id !== mappingId)
  if (editingMappingId.value === mappingId) {
    cancelEditMapping()
  }
}

const isEditingMapping = (mappingId: string) => editingMappingId.value === mappingId

const addMapping = () => {
  const nextMapping = createEmptyPlatformMapping()
  draft.value.mappings.push(nextMapping)
  startEditMapping(nextMapping)
}

const submitProduct = () => {
  if (!isCreateMode.value) return

  if (!draft.value.basicInfo.sku.trim()) {
    Message.warning('请填写 SKU')
    activeDetailTab.value = 'basic'
    return
  }

  try {
    const sku = catalogStore.saveProduct({ mode: 'create', product: draft.value })
    Message.success('商品已提交')
    router.push(`/products/core-library/${encodeURIComponent(sku)}/edit`)
  } catch (error) {
    Message.error(error instanceof Error ? error.message : '提交失败，请稍后重试')
  }
}

watch([() => route.params.sku, () => route.path], loadDraft, { immediate: true })

watch(videoPreviewVisible, (visible) => {
  if (visible) return

  videoPreviewSrc.value = ''
  clearVideoPreviewObjectUrl()
})

onBeforeUnmount(() => {
  clearVideoPreviewObjectUrl()
  clearMediaPreviewObjectUrls()
})
</script>

<template>
  <div class="product-detail-page">
    <template v-if="!missingProduct">
      <SecondaryPageHeader
        :title="pageTitle"
        @back="goBackToList"
      />

      <section class="overview-card">
        <div class="overview-profile">
          <div class="image-preview">
            <img v-if="overviewMainImage" :src="overviewMainImage" :alt="draft.basicInfo.chineseName || draft.basicInfo.sku" />
            <div v-else class="image-empty">主图待补充</div>
          </div>

          <div class="overview-identity">
            <div class="overview-title-row">
              <strong>{{ draft.basicInfo.sku || '请先填写 SKU' }}</strong>
              <a-tag v-if="draft.basicInfo.status" :color="statusToneMap[draft.basicInfo.status]">{{ statusLabelMap[draft.basicInfo.status] }}</a-tag>
            </div>
            <span v-if="overviewDescriptionParts.length" class="overview-description">
              <template v-for="(part, index) in overviewDescriptionParts" :key="`${part}-${index}`">
                <span v-if="index > 0" class="overview-description-separator" aria-hidden="true">·</span>
                <span>{{ part }}</span>
              </template>
            </span>
            <span v-else class="overview-description">请补充商品名称、品牌和类目</span>
          </div>
        </div>
        <div v-if="isCreateMode" class="overview-actions">
          <a-button type="primary" @click="submitProduct">提交商品</a-button>
        </div>
      </section>

      <nav class="product-detail-tabs" aria-label="商品详情分区">
        <button
          v-for="tab in detailTabs"
          :key="tab.key"
          type="button"
          class="product-detail-tab"
          :class="{ 'is-active': activeDetailTab === tab.key }"
          @click="activeDetailTab = tab.key"
        >
          <span>{{ tab.label }}</span>
          <span v-if="tab.count !== undefined" class="product-detail-tab-count">{{ tab.count }}</span>
        </button>
      </nav>

      <template v-if="activeDetailTab === 'basic'">
        <a-alert class="mapping-tip" type="info" show-icon>
          后续订单导入时，这里的平台、店铺、店铺 SKU 和平台 SKU ID 会作为内部 SKU 的反查入口。
        </a-alert>

        <ProductSectionCard title="基础信息">
          <ProductDetailInfoGrid :items="basicDetailItems" @save="saveDetailInfoField" />
        </ProductSectionCard>

        <ProductSectionCard title="图文信息">
          <div class="media-info-list">
            <div v-for="row in mediaInfoRows" :key="row.key" class="media-info-row">
              <div class="media-info-label-cell">
                <span class="media-info-label">
                  {{ row.label }}
                </span>
              </div>

              <div class="media-info-content">
                <div class="media-info-wall">
                  <a-upload
                    class="media-picture-upload"
                    :class="{ 'is-video': row.uploadActions[0].kind === 'video' }"
                    :file-list="row.fileList"
                    list-type="picture-card"
                    :accept="getMediaUploadAccept(row.uploadActions[0].kind)"
                    :auto-upload="false"
                    :show-remove-button="true"
                    :show-retry-button="false"
                    :show-cancel-button="false"
                    :tip="row.uploadActions[0].label"
                    :image-preview="row.uploadActions[0].kind !== 'video'"
                    @change="(fileList, fileItem) => handleMediaUploadChange(row.key, row.uploadActions[0].kind, fileList, fileItem)"
                    @preview="(fileItem) => handleMediaPreview(row.uploadActions[0].kind, fileItem)"
                  />

                  <a-upload
                    v-for="action in row.uploadActions.slice(1)"
                    :key="action.key"
                    class="media-picture-upload is-upload-only"
                    list-type="picture-card"
                    :accept="getMediaUploadAccept(action.kind)"
                    :auto-upload="false"
                    :show-file-list="false"
                    :tip="action.label"
                  />
                </div>
              </div>
            </div>
          </div>
        </ProductSectionCard>

        <a-modal v-model:visible="videoPreviewVisible" title="视频预览" :footer="false" width="720px">
          <video
            v-if="videoPreviewSrc"
            class="media-video-preview"
            :src="videoPreviewSrc"
            controls
            autoplay
          />
        </a-modal>

        <ProductSectionCard title="报关和物流属性">
          <ProductDetailInfoGrid :items="logisticsInfoItems" @save="saveDetailInfoField" />
        </ProductSectionCard>

        <ProductSectionCard title="采购参考">
          <ProductDetailInfoGrid :items="procurementInfoItems" @save="saveDetailInfoField" />
        </ProductSectionCard>

        <ProductSectionCard title="平台店铺映射">
          <template #extra>
            <a-button type="primary" size="small" @click="addMapping">
              <template #icon>
                <icon-plus />
              </template>
              新增映射
            </a-button>
          </template>

          <ConfigurableDataTable
            :columns="mappingColumns"
            :default-visible-keys="mappingVisibleColumnKeys"
            :required-keys="['platform']"
            :pinned-column-keys="['platform']"
            :data="draft.mappings"
            row-key="id"
            :pagination="false"
            table-class="data-table"
            wrapper-class="mapping-table"
          >
            <template #platform="{ record }">
              <a-select v-if="isEditingMapping((record as ProductPlatformMapping).id) && mappingDraft" v-model="mappingDraft.platform" allow-clear placeholder="平台">
                <a-option v-for="option in platformOptions" :key="option.value" :value="option.value">{{ option.label }}</a-option>
              </a-select>
              <span v-else class="mapping-platform-badge">
                <span class="mapping-platform-dot" />
                {{ getPlatformShortLabel((record as ProductPlatformMapping).platform) }}
              </span>
            </template>

            <template #store="{ record }">
              <a-select v-if="isEditingMapping((record as ProductPlatformMapping).id) && mappingDraft" v-model="mappingDraft.store" allow-clear placeholder="店铺">
                <a-option v-for="option in storeOptions" :key="option.value" :value="option.value">{{ option.label }}</a-option>
              </a-select>
              <span v-else>{{ (record as ProductPlatformMapping).store || '-' }}</span>
            </template>

            <template #platformProductId="{ record }">
              <a-input v-if="isEditingMapping((record as ProductPlatformMapping).id) && mappingDraft" v-model="mappingDraft.platformProductId" placeholder="选填" />
              <span v-else class="mapping-mono">{{ (record as ProductPlatformMapping).platformProductId || '-' }}</span>
            </template>

            <template #platformSkuId="{ record }">
              <a-input v-if="isEditingMapping((record as ProductPlatformMapping).id) && mappingDraft" v-model="mappingDraft.platformSkuId" placeholder="选填" />
              <span v-else class="mapping-mono">{{ (record as ProductPlatformMapping).platformSkuId || '-' }}</span>
            </template>

            <template #platformBarcode="{ record }">
              <a-input v-if="isEditingMapping((record as ProductPlatformMapping).id) && mappingDraft" v-model="mappingDraft.platformBarcode" placeholder="选填" />
              <span v-else class="mapping-mono">{{ (record as ProductPlatformMapping).platformBarcode || '-' }}</span>
            </template>

            <template #listingStatus="{ record }">
              <a-select v-if="isEditingMapping((record as ProductPlatformMapping).id) && mappingDraft" v-model="mappingDraft.listingStatus" placeholder="状态">
                <a-option v-for="option in listingStatusOptions" :key="option.value" :value="option.value">{{ option.label }}</a-option>
              </a-select>
              <span v-else class="mapping-status" :class="getMappingStatusClass((record as ProductPlatformMapping).listingStatus)">
                <span class="mapping-status-dot" />
                {{ getMappingStatusLabel((record as ProductPlatformMapping).listingStatus) }}
              </span>
            </template>

            <template #linkedAt="{ record }">
              <a-date-picker
                v-if="isEditingMapping((record as ProductPlatformMapping).id) && mappingDraft"
                v-model="mappingDraft.linkedAt"
                value-format="YYYY-MM-DD"
                size="small"
              />
              <span v-else class="mapping-date">{{ (record as ProductPlatformMapping).linkedAt || '-' }}</span>
            </template>

            <template #operation="{ record }">
              <div v-if="isEditingMapping((record as ProductPlatformMapping).id)" class="mapping-row-actions">
                <button
                  type="button"
                  class="mapping-row-action is-save"
                  :aria-label="`保存${(record as ProductPlatformMapping).platform || '映射'}`"
                  @click.stop="saveEditMapping((record as ProductPlatformMapping).id)"
                >
                  保存
                </button>
                <button
                  type="button"
                  class="mapping-row-action is-cancel"
                  aria-label="取消编辑映射"
                  @click.stop="cancelEditMapping"
                >
                  取消
                </button>
              </div>
              <div v-else class="mapping-operation-links">
                <button type="button" class="mapping-edit-link" @click.stop="startEditMapping(record as ProductPlatformMapping)">编辑</button>
                <button type="button" class="mapping-delete-link" @click.stop="removeMapping((record as ProductPlatformMapping).id)">删除</button>
              </div>
            </template>
          </ConfigurableDataTable>

          <div v-if="draft.mappings.length === 0" class="mapping-empty">
            暂未绑定平台店铺商品，点击右上角“新增映射”开始维护。
          </div>
        </ProductSectionCard>
      </template>

      <div v-else-if="activeDetailTab === 'inventory'" class="product-tab-panel">
        <div v-if="isCreateMode" class="product-tab-empty">
          <a-empty description="提交商品后可查看库存概况" />
        </div>
        <template v-else>
          <MetricSummaryStrip class="product-tab-summary-strip" :cards="inventorySummaryCards" :columns="4" />

          <a-card
            v-for="group in inventoryStoreGroups"
            :key="group.key"
            class="product-tab-section-card inventory-store-card"
            :bordered="false"
          >
            <template #title>
              <div class="product-tab-card-title">
                <span class="mapping-platform-badge">
                  <span class="mapping-platform-dot" />
                  {{ getInventoryStoreBadgeLabel(group) }}
                </span>
                <span>{{ getInventoryStoreName(group.store) }}</span>
                <small class="inventory-total">合计: <strong :class="{ 'is-warning': group.warning }">{{ group.total }}</strong></small>
                <a-tag v-if="group.warning" class="inventory-warning-tag" color="orange">低库存</a-tag>
              </div>
            </template>

            <ConfigurableDataTable
              :columns="inventoryColumns"
              :default-visible-keys="inventoryVisibleColumnKeys"
              :required-keys="['warehouse']"
              :pinned-column-keys="['warehouse']"
              :data="group.rows"
              row-key="warehouse"
              :pagination="false"
              table-class="data-table"
              wrapper-class="product-tab-data-table"
            >
              <template #location="{ record }">
                <span class="mapping-mono">{{ (record as InventoryRow).location }}</span>
              </template>
              <template #status="{ record }">
                <a-tag :color="(record as InventoryRow).tone">{{ (record as InventoryRow).status }}</a-tag>
              </template>
            </ConfigurableDataTable>
          </a-card>
        </template>
      </div>

      <div v-else-if="activeDetailTab === 'orders'" class="product-tab-panel">
        <div v-if="isCreateMode" class="product-tab-empty">
          <a-empty description="提交商品后可查看近期订单" />
        </div>
        <template v-else>
          <MetricSummaryStrip class="product-tab-summary-strip" :cards="recentOrderSummaryCards" :columns="4" />

          <a-card class="product-tab-section-card" :bordered="false">
            <template #title>
              <div class="product-tab-card-title">
                <span>近期订单</span>
                <small>展示最近同步的商品订单</small>
              </div>
            </template>

            <ConfigurableDataTable
              :columns="recentOrderColumns"
              :default-visible-keys="recentOrderVisibleColumnKeys"
              :required-keys="['orderNo']"
              :pinned-column-keys="['orderNo']"
              :data="recentOrderRows"
              row-key="orderNo"
              :pagination="false"
              table-class="data-table"
              wrapper-class="product-tab-data-table"
            >
              <template #orderNo="{ record }">
                <span class="mapping-mono">{{ (record as RecentOrderRow).orderNo }}</span>
              </template>
              <template #platform="{ record }">
                <span class="mapping-platform-badge">
                  <span class="mapping-platform-dot" />
                  {{ getPlatformShortLabel((record as RecentOrderRow).platform) }}
                </span>
              </template>
              <template #status="{ record }">
                <a-tag :color="(record as RecentOrderRow).statusTone">{{ (record as RecentOrderRow).status }}</a-tag>
              </template>
            </ConfigurableDataTable>
          </a-card>
        </template>
      </div>

      <div v-else-if="activeDetailTab === 'profit'" class="product-tab-panel">
        <div v-if="isCreateMode" class="product-tab-empty">
          <a-empty description="提交商品后可查看利润概览" />
        </div>
        <template v-else>
          <MetricSummaryStrip class="product-tab-summary-strip" :cards="profitSummaryCards" :columns="3" />

          <a-card class="product-tab-section-card" :bordered="false">
            <template #title>
              <div class="product-tab-card-title">
                <span>店铺利润明细</span>
                <small>按店铺展示关键利润项</small>
              </div>
            </template>

            <div class="profit-card-grid">
              <article v-for="row in profitRows" :key="row.key" class="profit-overview-card">
                <div class="profit-overview-header">
                  <span class="mapping-platform-badge">
                    <span class="mapping-platform-dot" />
                    {{ row.platform }}
                  </span>
                  <h3>{{ row.store }}</h3>
                </div>
                <div class="profit-overview-list">
                  <div class="profit-overview-row">
                    <span>WB 售价</span>
                    <strong class="profit-value">{{ row.price }}</strong>
                  </div>
                  <div class="profit-overview-row">
                    <span>WB Club 折扣</span>
                    <strong class="profit-value">{{ row.discount }}</strong>
                  </div>
                  <div class="profit-overview-row">
                    <span>实际成交价</span>
                    <strong class="profit-value">{{ row.dealPrice }}</strong>
                  </div>
                  <div class="profit-overview-row">
                    <span>平台佣金</span>
                    <strong class="profit-value is-negative">{{ row.commission }}</strong>
                  </div>
                  <div class="profit-overview-row">
                    <span>物流费用</span>
                    <strong class="profit-value is-negative">{{ row.logisticsFee }}</strong>
                  </div>
                  <div class="profit-overview-row">
                    <span>采购成本</span>
                    <strong class="profit-value is-negative">{{ row.purchaseCost }}</strong>
                  </div>
                  <div class="profit-overview-divider" aria-hidden="true" />
                  <div class="profit-overview-row">
                    <span>单件净利润</span>
                    <strong class="profit-value is-positive">{{ row.netProfit }}</strong>
                  </div>
                  <div class="profit-overview-row">
                    <span>利润率</span>
                    <strong class="profit-value is-positive">{{ row.profitRate }}</strong>
                  </div>
                </div>
              </article>
            </div>
          </a-card>
        </template>
      </div>

      <div v-else-if="activeDetailTab === 'reviews'" class="product-tab-panel">
        <div v-if="isCreateMode" class="product-tab-empty">
          <a-empty description="提交商品后可查看商品评价" />
        </div>
        <template v-else>
          <a-card class="product-tab-section-card review-detail-card" :bordered="false">
            <QueryFilterPanel class="review-filter-panel">
              <QueryFilterItem label="平台" width="260px" min-width="240px">
                <a-select v-model="reviewPlatformFilter" placeholder="全部平台" allow-clear class="volc-design-search-item" @change="applyReviewFilters">
                  <a-option v-for="option in reviewPlatformOptions" :key="option.value" :value="option.value">{{ option.label }}</a-option>
                </a-select>
              </QueryFilterItem>

              <QueryFilterItem label="店铺" width="280px" min-width="260px">
                <a-select v-model="reviewStoreFilter" placeholder="全部店铺" allow-clear class="volc-design-search-item" @change="applyReviewFilters">
                  <a-option v-for="option in reviewStoreOptions" :key="option.value" :value="option.value">{{ option.label }}</a-option>
                </a-select>
              </QueryFilterItem>

              <QueryFilterItem label="品类" width="260px" min-width="240px">
                <a-select v-model="reviewCategoryFilter" placeholder="全部品类" allow-clear class="volc-design-search-item" @change="applyReviewFilters">
                  <a-option v-for="option in reviewCategoryOptions" :key="option.value" :value="option.value">{{ option.label }}</a-option>
                </a-select>
              </QueryFilterItem>

              <QueryFilterItem label="日期" width="520px" min-width="480px" class="review-date-filter-item">
                <div class="review-date-filter">
                  <div class="review-date-quick">
                    <button
                      v-for="option in reviewDateQuickOptions"
                      :key="option.value"
                      type="button"
                      :class="{ 'is-active': activeReviewDateQuick === option.value }"
                      @click="setReviewDateQuick(option.value)"
                    >
                      {{ option.label }}
                    </button>
                  </div>
                  <a-range-picker v-model="reviewDateRange" value-format="YYYY-MM-DD" class="review-date-range" @change="handleReviewDateRangeChange" />
                </div>
              </QueryFilterItem>

              <QueryFilterItem label="关键词" width="360px" min-width="320px">
                <a-input-search
                  v-model="reviewSearchKeyword"
                  class="volc-design-search-item review-keyword-search"
                  placeholder="搜索评价内容 / 订单号"
                  allow-clear
                  @search="applyReviewFilters"
                  @press-enter="applyReviewFilters"
                  @clear="applyReviewFilters"
                />
              </QueryFilterItem>

              <QueryActionBar>
                <a-button type="primary" class="volc-design-button" @click="applyReviewFilters">查询</a-button>
                <a-button class="volc-design-button" @click="resetReviewFilters">重置</a-button>
                <a-button class="volc-design-button">导出</a-button>
              </QueryActionBar>
            </QueryFilterPanel>

            <ConfigurableDataTable
              :columns="reviewColumns"
              :default-visible-keys="reviewVisibleColumnKeys"
              :required-keys="['rating']"
              :pinned-column-keys="['rating']"
              :data="filteredReviewRows"
              row-key="id"
              :pagination="false"
              table-class="data-table"
              wrapper-class="product-tab-data-table review-table"
            >
              <template #rating="{ record }">
                <div class="review-rating-cell">
                  <a-rate :model-value="(record as ProductReviewRow).rating" readonly />
                  <strong>{{ (record as ProductReviewRow).rating }}.0</strong>
                </div>
              </template>

              <template #platform="{ record }">
                <span class="mapping-platform-badge">
                  <span class="mapping-platform-dot" />
                  {{ getPlatformShortLabel((record as ProductReviewRow).platform) }}
                </span>
              </template>

              <template #content="{ record }">
                <div class="review-content-cell">
                  <div class="review-title-line">
                    <strong>{{ (record as ProductReviewRow).title }}</strong>
                  </div>
                  <div class="review-meta-line">
                    <span>{{ (record as ProductReviewRow).author }}</span>
                    <span>{{ (record as ProductReviewRow).orderNo }}</span>
                  </div>
                  <p>{{ (record as ProductReviewRow).text }}</p>
                </div>
              </template>

              <template #publishedAt="{ record }">
                <div class="review-time-cell">{{ (record as ProductReviewRow).publishedAt }}</div>
              </template>
            </ConfigurableDataTable>
          </a-card>
        </template>
      </div>

      <div v-else-if="activeDetailTab === 'changes'" class="product-tab-panel">
        <div v-if="isCreateMode" class="product-tab-empty">
          <a-empty description="提交商品后可查看变更记录" />
        </div>
        <template v-else>
          <a-card class="product-tab-section-card" :bordered="false">
            <ConfigurableDataTable
              :columns="changeLogColumns"
              :default-visible-keys="changeLogVisibleColumnKeys"
              :required-keys="['time']"
              :pinned-column-keys="['time']"
              :data="changeLogItems"
              row-key="id"
              :pagination="false"
              table-class="data-table"
              wrapper-class="product-tab-data-table change-log-table"
            >
              <template #time="{ record }">
                <div class="change-log-time">
                  <strong>{{ (record as ChangeLogItem).date }}</strong>
                  <small>{{ (record as ChangeLogItem).time }}</small>
                </div>
              </template>
              <template #operator="{ record }">
                <div class="change-log-operator">
                  <span class="change-log-operator-avatar">{{ (record as ChangeLogItem).operatorInitial }}</span>
                  <span>{{ (record as ChangeLogItem).operator }}</span>
                </div>
              </template>
              <template #category="{ record }">
                <div class="change-log-field">{{ (record as ChangeLogItem).changes[0]?.category }}</div>
              </template>
              <template #before="{ record }">
                <div class="change-log-value-list">
                  <div v-for="change in (record as ChangeLogItem).changes" :key="`${change.field}-before`" class="change-log-value-line">
                    <span class="change-log-value-label">{{ change.field }}：</span>
                    <span
                      v-if="change.valueType === 'status' && change.beforeTone"
                      class="change-log-status"
                      :class="`is-${change.beforeTone}`"
                    >
                      <span class="change-log-status-dot" />
                      {{ change.before }}
                    </span>
                    <span
                      v-else-if="change.valueType === 'tag' && change.beforeTone"
                      class="change-log-tag"
                      :class="`is-${change.beforeTone}`"
                    >
                      {{ change.before }}
                    </span>
                    <span v-else>{{ change.before }}</span>
                  </div>
                </div>
              </template>
              <template #direction>
                <div class="change-log-arrow">→</div>
              </template>
              <template #after="{ record }">
                <div class="change-log-value-list">
                  <div v-for="change in (record as ChangeLogItem).changes" :key="`${change.field}-after`" class="change-log-value-line">
                    <span class="change-log-value-label">{{ change.field }}：</span>
                    <span
                      v-if="change.valueType === 'status' && change.afterTone"
                      class="change-log-status"
                      :class="`is-${change.afterTone}`"
                    >
                      <span class="change-log-status-dot" />
                      {{ change.after }}
                    </span>
                    <span
                      v-else-if="change.valueType === 'tag' && change.afterTone"
                      class="change-log-tag"
                      :class="`is-${change.afterTone}`"
                    >
                      {{ change.after }}
                    </span>
                    <span v-else>{{ change.after }}</span>
                  </div>
                </div>
              </template>
            </ConfigurableDataTable>
          </a-card>
        </template>
      </div>

    </template>

    <a-result v-else status="404" title="未找到商品" subtitle="当前 SKU 不存在，可能已经被删除或链接已失效。">
      <template #extra>
        <a-button type="primary" @click="goBackToList">返回商品列表</a-button>
      </template>
    </a-result>
  </div>
</template>

<style scoped>
.product-detail-page {
  --product-color-primary: rgb(var(--primary-6));
  --product-color-text: var(--color-text-1);
  --product-color-text-secondary: var(--color-text-2);
  --product-color-text-tertiary: var(--color-text-3);
  --product-color-bg: var(--color-bg-2);
  --product-color-fill: var(--color-fill-1);
  --product-color-border: var(--color-border-2);
  --product-color-control-border: var(--color-border-2);
  --product-control-height: var(--size-default, 32px);
  --product-radius: var(--border-radius-medium);
  --product-radius-small: var(--border-radius-small);
  --product-tabs-line-bleed: 28px;
  --workspace-color-primary: var(--product-color-primary);
  --workspace-color-text: var(--product-color-text);
  --workspace-color-text-secondary: var(--product-color-text-secondary);
  --workspace-color-text-tertiary: var(--product-color-text-tertiary);
  --workspace-color-bg: var(--product-color-bg);
  --workspace-color-border: var(--product-color-border);
  display: flex;
  flex-direction: column;
  gap: 0;
  padding-top: 16px;
  padding-bottom: 24px;
}

.overview-card {
  display: flex;
  min-height: 104px;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-top: 16px;
  padding: 20px 28px;
  border: 1px solid var(--product-color-border);
  border-radius: 12px;
  background: transparent;
  box-shadow: none;
}

.overview-profile {
  display: flex;
  align-items: center;
  flex: 1 1 auto;
  min-width: 0;
  gap: 16px;
}

.overview-actions {
  display: inline-flex;
  margin-left: auto;
  flex: 0 0 auto;
  align-items: center;
}

.image-preview {
  display: flex;
  width: 64px;
  height: 64px;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  overflow: hidden;
  border-radius: 8px;
  background: #eef4ff;
}

.image-preview img {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  object-fit: cover;
}

.image-empty {
  padding: 0 12px;
  color: #5a78a8;
  font-size: 11px;
  line-height: 16px;
  text-align: center;
}

.overview-identity {
  display: flex;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
}

.overview-title-row {
  display: flex;
  min-width: 0;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.overview-title-row strong {
  color: var(--product-color-text);
  font-size: 18px;
  font-weight: 600;
  line-height: 26px;
}

.overview-description {
  color: var(--product-color-text-secondary);
  font-size: 13px;
  line-height: 20px;
}

.overview-description-separator {
  margin: 0 2px;
}

.overview-title-row :deep(.arco-tag) {
  height: 20px;
  padding: 0 6px;
  font-size: 12px;
  line-height: 18px;
}

.product-detail-tabs {
  position: relative;
  display: flex;
  align-items: flex-end;
  margin-top: 16px;
  margin-bottom: 0;
  overflow: visible;
  border-bottom: 0;
}

.product-detail-tabs::before {
  position: absolute;
  right: calc(var(--product-tabs-line-bleed) * -1);
  bottom: 0;
  left: calc(var(--product-tabs-line-bleed) * -1);
  z-index: 0;
  height: 1px;
  background: var(--product-color-border);
  content: '';
}

.product-detail-tab {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
  margin: 0 0 0 4px;
  padding: 7px 16px;
  border: 0;
  border-radius: var(--product-radius-small) var(--product-radius-small) 0 0;
  appearance: none;
  box-shadow:
    inset 0 1px 0 var(--product-color-border),
    inset -1px 0 0 var(--product-color-border),
    inset 1px 0 0 var(--product-color-border);
  background: var(--product-color-fill);
  color: var(--product-color-text-secondary);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  user-select: none;
  transition: none;
}

.product-detail-tab:first-child {
  margin-left: 0;
}

.product-detail-tab::after {
  position: absolute;
  bottom: 0;
  left: 1px;
  width: calc(100% - 2px);
  height: 1px;
  background: var(--product-color-border);
  content: '';
}

.product-detail-tab:hover,
.product-detail-tab:active,
.product-detail-tab:focus,
.product-detail-tab:focus-visible {
  background: var(--product-color-fill);
  outline: none;
}

.product-detail-tab.is-active {
  z-index: 2;
  box-shadow:
    inset 0 2px 0 var(--product-color-primary),
    inset -1px 0 0 var(--product-color-border),
    inset 1px 0 0 var(--product-color-border);
  background: var(--product-color-bg);
  color: var(--product-color-primary);
}

.product-detail-tab.is-active:hover,
.product-detail-tab.is-active:active,
.product-detail-tab.is-active:focus,
.product-detail-tab.is-active:focus-visible {
  background: var(--product-color-bg);
}

.product-detail-tab.is-active::after {
  background: var(--product-color-bg);
}

.product-detail-tab-count {
  display: inline-flex;
  min-width: 24px;
  height: 18px;
  align-items: center;
  justify-content: center;
  padding: 0 7px;
  border-radius: 999px;
  background: var(--color-fill-2);
  color: var(--product-color-text-tertiary);
  font-size: 12px;
  font-weight: 600;
  line-height: 18px;
}

.product-detail-tab.is-active .product-detail-tab-count {
  background: rgb(var(--primary-2));
  color: var(--product-color-primary);
}

.mapping-tip {
  margin-top: 24px;
  border-radius: 8px;
}

.product-tab-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 24px;
}

.product-tab-empty {
  padding: 56px 0;
  border: 1px solid var(--product-color-border);
  border-radius: 8px;
  background: var(--color-bg-1);
}

.product-tab-section-card {
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.product-tab-summary-strip {
  --workspace-color-bg: var(--color-bg-1);
  --workspace-color-border: var(--product-color-border);
  --workspace-color-text: var(--product-color-text);
  --workspace-color-text-secondary: var(--product-color-text-secondary);
  --workspace-color-text-tertiary: var(--product-color-text-tertiary);
}

.product-tab-section-card :deep(.arco-card-header) {
  height: auto;
  min-height: auto;
  align-items: flex-start;
  padding: 24px 0 8px;
  border-bottom: 0;
}

.product-tab-section-card :deep(.arco-card-body) {
  padding: 14px 0 0;
}

.product-tab-card-title {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.product-tab-card-title small {
  color: var(--product-color-text-tertiary);
  font-size: 12px;
  font-weight: 400;
}

.product-tab-card-title :deep(.arco-rate) {
  font-size: 14px;
}

.inventory-store-card {
  margin-top: 8px;
  margin-bottom: 8px;
}

.inventory-store-card :deep(.arco-card-header) {
  padding: 4px 0 8px;
}

.inventory-total {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.inventory-total strong {
  color: var(--product-color-primary);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.inventory-total strong.is-warning {
  color: #f53f3f;
}

.inventory-warning-tag {
  height: 20px;
  padding: 0 6px;
  font-size: 11px;
  line-height: 18px;
}

.profit-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 18px;
}

.profit-overview-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--product-color-border);
  border-radius: 14px;
  background: var(--color-bg-1);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.profit-overview-header {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
  padding: 16px 22px 14px;
  border-bottom: 1px solid var(--product-color-border);
}

.profit-overview-header h3 {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: var(--product-color-text);
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profit-overview-list {
  display: flex;
  flex-direction: column;
  padding: 14px 22px 18px;
}

.profit-overview-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 24px;
  align-items: center;
  min-height: 32px;
  padding: 2px 0;
}

.profit-overview-row span {
  color: var(--product-color-text-tertiary);
  font-size: 13px;
  line-height: 20px;
}

.profit-overview-divider {
  height: 1px;
  margin: 12px 0 14px;
  background: var(--product-color-border);
}

.profit-overview-row .profit-value {
  min-width: 0;
  overflow: hidden;
  color: var(--product-color-text);
  font-size: 13px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  line-height: 20px;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-tab-data-table {
  --workspace-color-primary: rgb(var(--primary-6));
  --workspace-color-text: var(--color-text-1);
  --workspace-color-text-secondary: var(--color-text-2);
  --workspace-color-text-tertiary: var(--color-text-3);
  --workspace-color-bg: var(--color-bg-2);
  --workspace-color-fill: var(--color-fill-1);
  --workspace-color-border: var(--color-border-2);
  --workspace-color-hover-bg: var(--color-fill-2);
  --workspace-radius: var(--border-radius-medium);
}

.profit-value {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.profit-value.is-negative {
  color: #f53f3f;
}

.profit-value.is-positive {
  color: #00b42a;
}

.review-detail-card :deep(.arco-card-body) {
  display: block;
  padding-top: 0;
}

.review-filter-panel {
  --workspace-color-primary: var(--product-color-primary);
  --workspace-color-text: var(--product-color-text);
  --workspace-color-text-secondary: var(--product-color-text-secondary);
  --workspace-color-text-tertiary: var(--product-color-text-tertiary);
  --workspace-color-bg: var(--product-color-bg);
  --workspace-color-border: var(--product-color-border);
  --workspace-color-control-border: var(--product-color-control-border);
  --workspace-control-height: var(--product-control-height);
  --workspace-radius: var(--product-radius-small);

  margin-bottom: 14px;
}

.review-date-filter {
  display: flex;
  min-width: 0;
  flex: 1;
}

.review-date-quick {
  display: flex;
  height: 32px;
  align-items: center;
  flex: 0 0 auto;
  overflow: hidden;
  border: 1px solid var(--product-color-control-border);
  border-radius: 0;
  background: var(--product-color-bg);
}

.review-date-quick button {
  height: 32px;
  padding: 0 10px;
  border: 0;
  border-right: 1px solid var(--product-color-control-border);
  background: transparent;
  color: var(--product-color-text-secondary);
  cursor: pointer;
  font-size: 13px;
  line-height: 32px;
}

.review-date-quick button:last-child {
  border-right: 0;
}

.review-date-quick button.is-active {
  background: rgba(22, 93, 255, 0.08);
  color: var(--product-color-primary);
  font-weight: 600;
}

.review-date-range {
  width: 240px;
}

.review-date-filter :deep(.review-date-range .arco-picker) {
  border-left: 0;
  border-radius: 0 var(--product-radius-small) var(--product-radius-small) 0;
}

.review-keyword-search {
  width: 300px;
}

.review-table {
  --workspace-color-bg: var(--color-bg-2);
}

.review-rating-cell {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 8px;
}

.review-rating-cell :deep(.arco-rate) {
  font-size: 15px;
}

.review-rating-cell strong {
  color: var(--product-color-text);
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.review-content-cell {
  min-width: 0;
  color: var(--product-color-text-secondary);
  font-size: 13px;
  line-height: 22px;
}

.review-title-line {
  display: flex;
  min-width: 0;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.review-title-line > strong {
  color: var(--product-color-text);
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
}

.review-store-name,
.review-meta-line {
  color: var(--product-color-text-tertiary);
  font-size: 12px;
}

.review-meta-line {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
  font-variant-numeric: tabular-nums;
}

.review-content-cell p {
  margin: 8px 0 0;
}

.review-time-cell {
  color: var(--product-color-text-secondary);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  line-height: 22px;
}

.change-log-table {
  --workspace-color-bg: var(--color-bg-2);
}

.change-log-time {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
}

.change-log-time strong {
  color: var(--product-color-text);
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
}

.change-log-time small {
  color: var(--product-color-text-tertiary);
  font-size: 12px;
  line-height: 18px;
  font-variant-numeric: tabular-nums;
}

.change-log-operator {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
  color: var(--product-color-text);
  font-size: 14px;
  font-weight: 500;
}

.change-log-operator-avatar {
  display: inline-flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #9f7aea;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
}

.change-log-field {
  min-width: 0;
  overflow: hidden;
  color: var(--product-color-text);
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.change-log-value-list {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 8px;
  justify-content: flex-start;
  padding: 2px 0;
}

.change-log-value-line {
  display: flex;
  min-width: 0;
  min-height: 22px;
  align-items: center;
  overflow: hidden;
  color: var(--product-color-text-secondary);
  font-size: 14px;
  line-height: 22px;
  text-overflow: ellipsis;
}

.change-log-value-label {
  flex: 0 0 auto;
  color: var(--product-color-text);
  font-weight: 500;
}

.change-log-status,
.change-log-tag {
  display: inline-flex;
  width: fit-content;
  max-width: 100%;
  align-items: center;
  border-radius: 999px;
}

.change-log-status {
  display: inline-flex;
  width: fit-content;
  max-width: 100%;
  align-items: center;
  gap: 6px;
  padding: 1px 10px;
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
}

.change-log-status.is-green {
  background: rgba(0, 180, 42, 0.12);
  color: #00b42a;
}

.change-log-status.is-orange {
  background: rgba(255, 125, 0, 0.12);
  color: #ff7d00;
}

.change-log-status.is-red {
  background: rgba(245, 63, 63, 0.12);
  color: #f53f3f;
}

.change-log-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.change-log-tag {
  display: inline-flex;
  width: fit-content;
  max-width: 100%;
  align-items: center;
  overflow: hidden;
  padding: 2px 10px;
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.change-log-tag.is-green {
  background: rgba(0, 180, 42, 0.12);
  color: #00b42a;
}

.change-log-tag.is-blue {
  background: rgba(var(--primary-6), 0.1);
  color: var(--product-color-primary);
}

.change-log-tag.is-orange {
  background: rgba(255, 125, 0, 0.12);
  color: #ff7d00;
}

.change-log-tag.is-red {
  background: rgba(245, 63, 63, 0.12);
  color: #f53f3f;
}

.change-log-arrow {
  display: flex;
  justify-content: center;
  color: var(--product-color-text-tertiary);
  font-size: 22px;
  line-height: 1;
}

.media-info-list {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding-bottom: 20px;
}

.media-info-row {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  align-items: start;
  gap: 12px;
}

.media-info-label-cell {
  padding-top: 5px;
}

.media-info-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--product-color-text-tertiary);
  font-size: 13px;
  font-weight: 500;
  line-height: 22px;
}

.media-info-content {
  min-width: 0;
}

.media-info-wall {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.media-picture-upload {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.media-picture-upload :deep(.arco-upload-wrapper) {
  width: auto;
}

.media-picture-upload :deep(.arco-upload-list-type-picture-card) {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.media-picture-upload :deep(.arco-upload-list-picture) {
  width: 100px;
  height: 100px;
  margin: 0;
  line-height: 100px;
}

.media-picture-upload :deep(.arco-upload-list-picture img) {
  width: 100px;
  height: 100px;
  max-width: none;
  max-height: none;
  object-fit: cover;
}

.media-picture-upload :deep(.arco-upload-list-picture-mask) {
  line-height: 100px;
}

.media-picture-upload.is-video :deep(.arco-upload-list-picture) {
  position: relative;
}

.media-picture-upload.is-video :deep(.arco-upload-list-picture::after) {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.42);
  background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 24 24' fill='%23fff' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 5.8v12.4c0 .78.86 1.26 1.53.85l9.8-6.2a1 1 0 000-1.7l-9.8-6.2A1 1 0 008 5.8z'/%3E%3C/svg%3E");
  background-position: center;
  background-repeat: no-repeat;
  background-size: 20px 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.18);
  content: '';
  pointer-events: none;
  transform: translate(-50%, -50%);
  transition: opacity 0.12s ease;
}

.media-picture-upload.is-video :deep(.arco-upload-list-picture:hover::after) {
  opacity: 0;
}

.media-picture-upload :deep(.arco-upload-picture-card) {
  width: 100px;
  min-width: 100px;
  height: 100px;
  border-radius: 8px;
}

.media-picture-upload :deep(.arco-upload-tip) {
  margin-top: 8px;
  color: var(--product-color-text-tertiary);
  font-size: 13px;
  line-height: 22px;
}

.media-video-preview {
  display: block;
  width: 100%;
  max-height: 70vh;
  border-radius: 8px;
  background: #000;
}

.product-detail-page :deep(.arco-form-item-label-col > label) {
  color: var(--product-color-text-secondary);
  font-size: 13px;
}

.product-detail-page :deep(.arco-input-wrapper),
.product-detail-page :deep(.arco-select-view-single),
.product-detail-page :deep(.arco-textarea-wrapper),
.product-detail-page :deep(.arco-input-number),
.product-detail-page :deep(.arco-picker) {
  border-color: var(--product-color-control-border);
  background: var(--product-color-bg);
  box-shadow: none;
}

.product-detail-page :deep(.arco-input-wrapper),
.product-detail-page :deep(.arco-select-view-single),
.product-detail-page :deep(.arco-input-number),
.product-detail-page :deep(.arco-picker) {
  min-height: var(--product-control-height);
}

.product-detail-page :deep(.arco-textarea-wrapper),
.product-detail-page :deep(.arco-input-number),
.product-detail-page :deep(.arco-picker) {
  border-radius: var(--product-radius);
}

.product-detail-page :deep(.arco-input-wrapper:hover),
.product-detail-page :deep(.arco-input-wrapper.arco-input-focus),
.product-detail-page :deep(.arco-select-view-single:hover),
.product-detail-page :deep(.arco-select-view-single.arco-select-view-focus),
.product-detail-page :deep(.arco-textarea-wrapper:hover),
.product-detail-page :deep(.arco-textarea-wrapper-focus),
.product-detail-page :deep(.arco-input-number:hover),
.product-detail-page :deep(.arco-input-number-focus),
.product-detail-page :deep(.arco-picker:hover),
.product-detail-page :deep(.arco-picker-focused) {
  border-color: var(--product-color-primary);
  box-shadow: 0 4px 10px rgba(var(--primary-6), 0.12);
}

.product-detail-page :deep(.arco-input),
.product-detail-page :deep(.arco-textarea),
.product-detail-page :deep(.arco-select-view-value),
.product-detail-page :deep(.arco-input-number-input),
.product-detail-page :deep(.arco-picker input) {
  font-size: 13px;
}

.mapping-table {
  --workspace-color-primary: var(--product-color-primary);
  --workspace-color-text: var(--product-color-text);
  --workspace-color-text-secondary: var(--product-color-text-secondary);
  --workspace-color-text-tertiary: var(--product-color-text-tertiary);
  --workspace-color-bg: var(--product-color-bg);
  --workspace-color-fill: var(--product-color-fill);
  --workspace-color-border: var(--product-color-border);
  --workspace-color-hover-bg: var(--color-fill-2);
  --workspace-radius: 8px;
}

.mapping-table :deep(.arco-table-th) {
  height: 48px;
}

.mapping-table :deep(.arco-table-td) {
  height: 52px;
}

.mapping-table :deep(.arco-input-wrapper),
.mapping-table :deep(.arco-select-view-single),
.mapping-table :deep(.arco-picker) {
  height: 32px;
  min-height: 32px;
  background: var(--product-color-bg);
}

.mapping-platform-badge {
  display: inline-flex;
  height: 22px;
  align-items: center;
  gap: 6px;
  padding: 0 8px;
  border-radius: 4px;
  background: rgba(var(--primary-6), 0.08);
  color: var(--product-color-primary);
  font-size: 13px;
  font-weight: 600;
  line-height: 22px;
}

.mapping-platform-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(var(--primary-6), 0.45);
}

.mapping-mono,
.mapping-date {
  color: var(--product-color-text-secondary);
  font-variant-numeric: tabular-nums;
}

.mapping-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--product-color-text-secondary);
  font-size: 13px;
  line-height: 22px;
}

.mapping-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.mapping-status.is-linked {
  color: #00b42a;
}

.mapping-status.is-unlinked {
  color: #f53f3f;
}

.mapping-status.is-unknown {
  color: var(--product-color-text-tertiary);
}

.mapping-edit-link {
  border: 0;
  background: transparent;
  color: var(--product-color-primary);
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  line-height: 22px;
  padding: 0;
}

.mapping-edit-link:hover {
  text-decoration: underline;
}

.mapping-operation-links {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.mapping-delete-link {
  border: 0;
  background: transparent;
  color: #f53f3f;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  line-height: 22px;
  padding: 0;
}

.mapping-delete-link:hover {
  text-decoration: underline;
}

.mapping-row-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.mapping-row-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  line-height: 22px;
}

.mapping-row-action.is-save {
  color: var(--product-color-primary);
}

.mapping-row-action.is-cancel {
  color: var(--product-color-text-secondary);
}

.mapping-row-action:hover {
  text-decoration: underline;
}

.mapping-empty {
  padding-top: 12px;
  color: var(--product-color-text-tertiary);
  font-size: 12px;
}

@media (max-width: 1200px) {
  .overview-card {
    padding: 20px 24px;
  }
}

@media (max-width: 768px) {
  .overview-profile {
    align-items: flex-start;
    flex-direction: column;
  }

  .overview-card {
    padding: 18px;
  }

  .product-detail-tabs {
    overflow-x: auto;
  }

  .product-detail-tab {
    padding: 7px 12px;
  }

  .media-info-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .profit-card-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .media-info-label-cell {
    padding-top: 0;
  }

  .media-picture-upload :deep(.arco-upload-list-picture),
  .media-picture-upload :deep(.arco-upload-list-picture img),
  .media-picture-upload :deep(.arco-upload-picture-card) {
    width: 100px;
  }
}
</style>
