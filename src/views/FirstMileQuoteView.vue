<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  IconDelete,
  IconFile,
  IconInfoCircle,
  IconPlus,
  IconSend,
  IconSwap,
  IconThunderbolt,
} from '@arco-design/web-vue/es/icon'
import {
  calculateFirstMileQuote,
  firstMileCargoTypes,
  firstMileDensityOptions,
  firstMileQuantityOptions,
  firstMileRoutes,
  firstMileValueAddedServices,
  firstMileWeightOptions,
  type FirstMileCargoTypeKey,
  type FirstMileRouteKey,
} from '../data/firstMileQuote'
import ConfigurableDataTable from '../components/common/ConfigurableDataTable.vue'
import type { ConfigurableTableColumn } from '../data/configurableTable'
import '../components/sales/salesWorkbench.css'

const originOptions = ['义乌', '广州', '深圳', '宁波', '上海']
const destinationOptions = ['莫斯科1号仓', '圣彼得堡仓', '明斯克中转仓', '阿拉木图仓']
const today = new Date().toISOString().slice(0, 10)

const shipmentDate = ref(today)
const origin = ref('义乌')
const destination = ref('莫斯科1号仓')
const selectedRoute = ref<FirstMileRouteKey>('economy')
const cargoInputMode = ref<'quick' | 'order'>('quick')
const quickCargoType = ref<FirstMileCargoTypeKey>('classA')
const quickQuantity = ref(500)
const quickWeightKg = ref(200)
const quickDensityKgPerM3 = ref(200)
const selectedServices = ref<string[]>([])
const shipmentCartonCount = ref(1)

type ShipmentOrderColumnKey = 'sku' | 'productName' | 'category' | 'quantity' | 'unitWeight' | 'totalWeight' | 'density' | 'operation'
type AddGoodsColumnKey = 'selected' | 'sku' | 'productName' | 'category' | 'stock' | 'quantity'

interface ShipmentOrderRow {
  sku: string
  productName: string
  category: string
  categoryType: FirstMileCargoTypeKey
  quantity: number
  unitWeight: number
  totalWeight: number
  density: number
}

interface AddGoodsRow {
  sku: string
  productName: string
  category: string
  categoryType: FirstMileCargoTypeKey
  stock: number
  quantity: number
  unitWeight: number
  density: number
}

interface InboundOrderOption {
  key: string
  supplier: string
  products: AddGoodsRow[]
}

interface ShipmentOrderSummary {
  cargoTypeKey: FirstMileCargoTypeKey
  quantity: number
  weightKg: number
  densityKgPerM3: number
}

interface ShipmentCategorySummary {
  key: FirstMileCargoTypeKey
  label: string
  tone: 'blue' | 'orange'
  rows: ShipmentOrderRow[]
  quantity: number
  weightKg: number
  densityKgPerM3: number
  volumeM3: number
  priceRange: [number, number]
}

const shipmentOrderRows = ref<ShipmentOrderRow[]>([
  {
    sku: 'SKU-003',
    productName: '蓝牙无线耳机',
    category: '二类',
    categoryType: 'classB',
    quantity: 100,
    unitWeight: 0.25,
    totalWeight: 25,
    density: 180,
  },
  {
    sku: 'SKU-004',
    productName: 'LED台灯护眼灯',
    category: '二类',
    categoryType: 'classB',
    quantity: 100,
    unitWeight: 0.8,
    totalWeight: 80,
    density: 130,
  },
  {
    sku: 'SKU-005',
    productName: '男士休闲运动鞋',
    category: '一类',
    categoryType: 'classA',
    quantity: 100,
    unitWeight: 0.6,
    totalWeight: 60,
    density: 170,
  },
  {
    sku: 'SKU-006',
    productName: '智能手表运动版',
    category: '二类',
    categoryType: 'classB',
    quantity: 100,
    unitWeight: 0.12,
    totalWeight: 12,
    density: 200,
  },
  {
    sku: 'SKU-007',
    productName: '家用收纳箱三件套',
    category: '一类',
    categoryType: 'classA',
    quantity: 100,
    unitWeight: 1.2,
    totalWeight: 120,
    density: 110,
  },
  {
    sku: 'SKU-008',
    productName: '无线充电底座',
    category: '二类',
    categoryType: 'classB',
    quantity: 100,
    unitWeight: 0.18,
    totalWeight: 18,
    density: 190,
  },
  {
    sku: 'SKU-001',
    productName: '儿童益智玩具套装',
    category: '一类',
    categoryType: 'classA',
    quantity: 800,
    unitWeight: 0.35,
    totalWeight: 280,
    density: 160,
  },
  {
    sku: 'SKU-002',
    productName: '婴儿纯棉连体衣',
    category: '一类',
    categoryType: 'classA',
    quantity: 100,
    unitWeight: 0.15,
    totalWeight: 15,
    density: 140,
  },
])
const shipmentOrderColumns: ConfigurableTableColumn<ShipmentOrderColumnKey>[] = [
  { title: 'SKU', dataIndex: 'sku', width: 150 },
  { title: '商品名称', dataIndex: 'productName', width: 180 },
  { title: '品类', dataIndex: 'category', slotName: 'category', width: 120 },
  { title: '数量', dataIndex: 'quantity', slotName: 'quantity', width: 120, align: 'right' },
  { title: '单件重(kg)', dataIndex: 'unitWeight', width: 120, align: 'right' },
  { title: '总重(kg)', dataIndex: 'totalWeight', slotName: 'totalWeight', width: 120, align: 'right' },
  { title: '密度', dataIndex: 'density', width: 100, align: 'right' },
  { title: '操作', slotName: 'operation', width: 64, align: 'center' },
]
const shipmentOrderVisibleColumnKeys: ShipmentOrderColumnKey[] = [
  'sku',
  'productName',
  'category',
  'quantity',
  'unitWeight',
  'totalWeight',
  'density',
]
const addGoodsModalVisible = ref(false)
const addGoodsMode = ref<'inbound' | 'custom'>('inbound')
const selectedInboundOrderKey = ref('RK-20260325-001')
const selectedGoodsKeys = ref<string[]>(['SKU-003', 'SKU-004'])
const inboundOrderOptions: InboundOrderOption[] = [
  {
    key: 'RK-20260325-001',
    supplier: '义乌百货供应商',
    products: [
      { sku: 'SKU-001', productName: '儿童益智玩具套装', category: '一类', categoryType: 'classA', stock: 800, quantity: 200, unitWeight: 0.18, density: 180 },
      { sku: 'SKU-002', productName: '婴儿纯棉连体衣', category: '一类', categoryType: 'classA', stock: 1200, quantity: 300, unitWeight: 0.12, density: 160 },
    ],
  },
  {
    key: 'RK-20260325-002',
    supplier: '深圳电子工厂',
    products: [
      { sku: 'SKU-003', productName: '蓝牙无线耳机', category: '二类', categoryType: 'classB', stock: 2000, quantity: 500, unitWeight: 0.08, density: 220 },
      { sku: 'SKU-004', productName: 'LED台灯护眼灯', category: '二类', categoryType: 'classB', stock: 600, quantity: 150, unitWeight: 0.45, density: 210 },
    ],
  },
  {
    key: 'RK-20260326-001',
    supplier: '广州服饰批发',
    products: [
      { sku: 'SKU-005', productName: '男士休闲运动鞋', category: '一类', categoryType: 'classA', stock: 900, quantity: 400, unitWeight: 0.62, density: 190 },
      { sku: 'SKU-006', productName: '智能手表运动版', category: '二类', categoryType: 'classB', stock: 350, quantity: 100, unitWeight: 0.16, density: 230 },
    ],
  },
]
const selectableGoodsRows = ref<AddGoodsRow[]>([
  { sku: 'SKU-001', productName: '儿童益智玩具套装', category: '一类', categoryType: 'classA', stock: 800, quantity: 100, unitWeight: 0.18, density: 180 },
  { sku: 'SKU-002', productName: '婴儿纯棉连体衣', category: '一类', categoryType: 'classA', stock: 1200, quantity: 100, unitWeight: 0.12, density: 160 },
  { sku: 'SKU-003', productName: '蓝牙无线耳机', category: '二类', categoryType: 'classB', stock: 2000, quantity: 100, unitWeight: 0.08, density: 220 },
  { sku: 'SKU-004', productName: 'LED台灯护眼灯', category: '二类', categoryType: 'classB', stock: 600, quantity: 100, unitWeight: 0.45, density: 210 },
  { sku: 'SKU-005', productName: '男士休闲运动鞋', category: '一类', categoryType: 'classA', stock: 900, quantity: 100, unitWeight: 0.62, density: 190 },
  { sku: 'SKU-006', productName: '智能手表运动版', category: '二类', categoryType: 'classB', stock: 350, quantity: 100, unitWeight: 0.16, density: 230 },
  { sku: 'SKU-007', productName: '家用收纳箱三件套', category: '一类', categoryType: 'classA', stock: 500, quantity: 100, unitWeight: 0.4, density: 170 },
  { sku: 'SKU-008', productName: '无线充电底座', category: '二类', categoryType: 'classB', stock: 780, quantity: 100, unitWeight: 0.18, density: 190 },
])
const addGoodsTableColumns: ConfigurableTableColumn<AddGoodsColumnKey>[] = [
  { title: '', dataIndex: 'selected', slotName: 'selected', width: 54 },
  { title: 'SKU', dataIndex: 'sku', width: 120 },
  { title: '商品名称', dataIndex: 'productName', width: 220 },
  { title: '品类', dataIndex: 'category', slotName: 'category', width: 120 },
  { title: '库存', dataIndex: 'stock', width: 110 },
  { title: '发货数量', dataIndex: 'quantity', slotName: 'quantity', width: 150 },
]
const addGoodsVisibleColumnKeys: AddGoodsColumnKey[] = [
  'selected',
  'sku',
  'productName',
  'category',
  'stock',
  'quantity',
]

const getRowTotalWeight = (row: Pick<ShipmentOrderRow, 'quantity' | 'unitWeight'>) =>
  Number((row.quantity * row.unitWeight).toFixed(1))

const getWeightedDensity = (rows: ShipmentOrderRow[], quantity: number) => {
  if (quantity <= 0) return 0
  return Math.round(rows.reduce((total, row) => total + row.quantity * row.density, 0) / quantity)
}

const getShipmentOrderSummary = (rows: ShipmentOrderRow[]): ShipmentOrderSummary => {
  if (rows.length === 0) {
    return {
      cargoTypeKey: 'classA' as FirstMileCargoTypeKey,
      quantity: 0,
      weightKg: 0,
      densityKgPerM3: 0,
    }
  }

  const quantity = rows.reduce((total, row) => total + row.quantity, 0)
  const weightKg = Number(rows.reduce((total, row) => total + getRowTotalWeight(row), 0).toFixed(1))
  const densityKgPerM3 = getWeightedDensity(rows, quantity)

  return {
    cargoTypeKey: rows.some((row) => row.categoryType === 'classB') ? 'classB' : 'classA',
    quantity,
    weightKg,
    densityKgPerM3,
  }
}

const orderSummary = ref(getShipmentOrderSummary(shipmentOrderRows.value))
const orderCargoType = ref<FirstMileCargoTypeKey>(orderSummary.value.cargoTypeKey)
const orderQuantity = ref(orderSummary.value.quantity)
const orderWeightKg = ref(orderSummary.value.weightKg)
const orderDensityKgPerM3 = ref(orderSummary.value.densityKgPerM3)

const syncOrderSummary = (rows: ShipmentOrderRow[]) => {
  const nextSummary = getShipmentOrderSummary(rows)
  orderSummary.value = nextSummary
  orderCargoType.value = nextSummary.cargoTypeKey
  orderQuantity.value = nextSummary.quantity
  orderWeightKg.value = nextSummary.weightKg
  orderDensityKgPerM3.value = nextSummary.densityKgPerM3
}

const activeCargoTypeKey = computed<FirstMileCargoTypeKey>({
  get: () => cargoInputMode.value === 'quick' ? quickCargoType.value : orderCargoType.value,
  set: (value) => {
    if (cargoInputMode.value === 'quick') {
      quickCargoType.value = value
    } else {
      orderCargoType.value = value
    }
  },
})
const selectedCargoType = computed<FirstMileCargoTypeKey>({
  get: () => activeCargoTypeKey.value,
  set: (value) => {
    activeCargoTypeKey.value = value
  },
})
const activeQuantity = computed<number>({
  get: () => cargoInputMode.value === 'quick' ? quickQuantity.value : orderQuantity.value,
  set: (value) => {
    if (cargoInputMode.value === 'quick') {
      quickQuantity.value = value
    } else {
      orderQuantity.value = value
    }
  },
})
const activeWeightKg = computed<number>({
  get: () => cargoInputMode.value === 'quick' ? quickWeightKg.value : orderWeightKg.value,
  set: (value) => {
    if (cargoInputMode.value === 'quick') {
      quickWeightKg.value = value
    } else {
      orderWeightKg.value = value
    }
  },
})
const activeDensityKgPerM3 = computed<number>({
  get: () => cargoInputMode.value === 'quick' ? quickDensityKgPerM3.value : orderDensityKgPerM3.value,
  set: (value) => {
    if (cargoInputMode.value === 'quick') {
      quickDensityKgPerM3.value = value
    } else {
      orderDensityKgPerM3.value = value
    }
  },
})
const cargoInputModeLabel = computed(() =>
  cargoInputMode.value === 'quick' ? '快速对比' : '发货单模式'
)

const quoteEstimate = computed(() =>
  calculateFirstMileQuote({
    routeKey: selectedRoute.value,
    cargoTypeKey: activeCargoTypeKey.value,
    shipmentDate: shipmentDate.value,
    quantity: activeQuantity.value,
    weightKg: activeWeightKg.value,
    densityKgPerM3: activeDensityKgPerM3.value,
  })
)

const activeCargoType = computed(() => quoteEstimate.value.cargoType)
const selectedInboundOrder = computed(() =>
  inboundOrderOptions.find((order) => order.key === selectedInboundOrderKey.value) ?? inboundOrderOptions[0]
)
const selectedServicesLabel = computed(() =>
  selectedServices.value.length > 0 ? selectedServices.value.join('、') : '未选择'
)
const getCargoTypeMeta = (key: FirstMileCargoTypeKey) =>
  firstMileCargoTypes.find((cargoType) => cargoType.key === key) ?? firstMileCargoTypes[0]
const shipmentCategorySummaries = computed<ShipmentCategorySummary[]>(() =>
  (['classA', 'classB'] as FirstMileCargoTypeKey[])
    .map((key) => {
      const rows = shipmentOrderRows.value.filter((row) => row.categoryType === key)
      if (rows.length === 0) return undefined

      const quantity = rows.reduce((total, row) => total + row.quantity, 0)
      const weightKg = Number(rows.reduce((total, row) => total + getRowTotalWeight(row), 0).toFixed(1))
      const densityKgPerM3 = getWeightedDensity(rows, quantity)
      const estimate = calculateFirstMileQuote({
        routeKey: selectedRoute.value,
        cargoTypeKey: key,
        shipmentDate: shipmentDate.value,
        quantity,
        weightKg,
        densityKgPerM3,
      })

      return {
        key,
        label: getCargoTypeMeta(key).label,
        tone: key === 'classA' ? 'blue' : 'orange',
        rows,
        quantity,
        weightKg,
        densityKgPerM3,
        volumeM3: estimate.volumeM3,
        priceRange: estimate.priceRange,
      }
    })
    .filter((summary): summary is ShipmentCategorySummary => Boolean(summary))
)
const hasMultipleShipmentCategories = computed(() => shipmentCategorySummaries.value.length > 1)
const shipmentOrderVolumeM3 = computed(() =>
  orderWeightKg.value > 0 && orderDensityKgPerM3.value > 0
    ? Number((orderWeightKg.value / orderDensityKgPerM3.value).toFixed(2))
    : 0
)
const orderPriceRange = computed<[number, number]>(() => [
  shipmentCategorySummaries.value.reduce((total, summary) => total + summary.priceRange[0], 0),
  shipmentCategorySummaries.value.reduce((total, summary) => total + summary.priceRange[1], 0),
])
const orderPerItemRange = computed<[number, number]>(() => orderQuantity.value > 0
  ? [
      Number((orderPriceRange.value[0] / orderQuantity.value).toFixed(2)),
      Number((orderPriceRange.value[1] / orderQuantity.value).toFixed(2)),
    ]
  : [0, 0]
)
const summaryDetails = computed(() => cargoInputMode.value === 'order'
  ? [
      { label: '发货时间', value: shipmentDate.value },
      { label: '发货地', value: origin.value },
      { label: '目的地', value: destination.value },
      { label: '运输线路', value: quoteEstimate.value.route.label },
      { label: '时效', value: `${quoteEstimate.value.route.days[0]}-${quoteEstimate.value.route.days[1]}天` },
      { label: '商品种类', value: `${shipmentOrderRows.value.length} 种` },
      { label: '箱数', value: `${shipmentCartonCount.value} 箱` },
      { label: '货物总数', value: `${activeQuantity.value} 件` },
      { label: '总重量', value: `${activeWeightKg.value} kg` },
      { label: '平均密度', value: `${activeDensityKgPerM3.value} kg/m³` },
      { label: '计算体积', value: `${formatDecimal(shipmentOrderVolumeM3.value)} m³` },
    ]
  : [
      { label: '发货时间', value: shipmentDate.value },
      { label: '发货地', value: origin.value },
      { label: '目的地', value: destination.value },
      { label: '运输线路', value: quoteEstimate.value.route.label },
      { label: '时效', value: `${quoteEstimate.value.route.days[0]}-${quoteEstimate.value.route.days[1]}天` },
      { label: '货物类型', value: quoteEstimate.value.cargoType.label },
      { label: '货物数量', value: `${activeQuantity.value} 件` },
      { label: '预计总重', value: `${activeWeightKg.value} kg` },
      { label: '预计密度', value: `${activeDensityKgPerM3.value} kg/m³` },
      { label: '计算体积', value: `${formatDecimal(quoteEstimate.value.volumeM3)} m³` },
      { label: '增值服务', value: selectedServicesLabel.value },
    ]
)

const formatCurrency = (value: number) => `¥${value.toLocaleString('zh-CN')}`
const formatDecimal = (value: number) => value.toFixed(2)
const formatWeight = (value: number) => Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1)
const mapGoodsToShipmentRow = (row: AddGoodsRow): ShipmentOrderRow => ({
  sku: row.sku,
  productName: row.productName,
  category: row.category,
  categoryType: row.categoryType,
  quantity: row.quantity,
  unitWeight: row.unitWeight,
  totalWeight: getRowTotalWeight(row),
  density: row.density,
})

const openAddGoodsModal = () => {
  addGoodsMode.value = 'inbound'
  addGoodsModalVisible.value = true
}

const setCargoMode = (key: string | number) => {
  if (key === 'quick' || key === 'order') {
    cargoInputMode.value = key
  }
}

const setSelectedCargoType = (key: string | number) => {
  if (key === 'classA' || key === 'classB') {
    selectedCargoType.value = key
  }
}

const setAddGoodsMode = (key: string | number) => {
  if (key === 'inbound' || key === 'custom') {
    addGoodsMode.value = key
  }
}

const toggleGoodsSelection = (sku: string, checked: boolean | (string | number | boolean)[]) => {
  const isChecked = checked === true
  selectedGoodsKeys.value = isChecked
    ? Array.from(new Set([...selectedGoodsKeys.value, sku]))
    : selectedGoodsKeys.value.filter((key) => key !== sku)
}

const updateShipmentRowQuantity = (sku: string, value: number | string | undefined) => {
  const quantity = Math.max(1, Number(value) || 1)
  const nextRows = shipmentOrderRows.value.map((row) => row.sku === sku
    ? { ...row, quantity, totalWeight: getRowTotalWeight({ ...row, quantity }) }
    : row
  )
  shipmentOrderRows.value = nextRows
  syncOrderSummary(nextRows)
}

const confirmAddGoods = () => {
  const goods = addGoodsMode.value === 'inbound'
    ? selectedInboundOrder.value.products
    : selectableGoodsRows.value.filter((row) => selectedGoodsKeys.value.includes(row.sku))

  if (goods.length === 0) return

  const nextRows = goods.map(mapGoodsToShipmentRow)
  shipmentOrderRows.value = nextRows
  syncOrderSummary(nextRows)
  cargoInputMode.value = 'order'
  addGoodsModalVisible.value = false
}

const removeShipmentOrderRow = (sku: string) => {
  const nextRows = shipmentOrderRows.value.filter((row) => row.sku !== sku)
  shipmentOrderRows.value = nextRows
  syncOrderSummary(nextRows)
}

const swapRoute = () => {
  const nextOrigin = destination.value
  destination.value = origin.value
  origin.value = nextOrigin
}
</script>

<template>
  <div class="sales-workbench first-mile-page">
    <section class="page-header first-mile-header">
      <div class="header-left">
        <h1 class="page-title">物流智能询价</h1>
      </div>

      <a-button type="outline" class="action-button quote-console-button">
        直接进入比价台
        <template #icon>
          <icon-send />
        </template>
      </a-button>
    </section>

    <div class="first-mile-shell">
      <a-card class="quote-config-panel" :bordered="false">
        <section class="form-section">
          <label class="field-label is-required">期望发货时间</label>
          <a-date-picker v-model="shipmentDate" class="quote-date-picker" />
        </section>

        <section class="form-section">
          <label class="field-label is-required">运输路线</label>
          <div class="route-select-row">
            <a-select v-model="origin" class="route-select">
              <a-option v-for="item in originOptions" :key="item" :value="item">{{ item }}</a-option>
            </a-select>
            <a-button class="swap-button" type="text" shape="circle" aria-label="交换发货地和目的地" @click="swapRoute">
              <template #icon>
                <icon-swap />
              </template>
            </a-button>
            <a-select v-model="destination" class="route-select">
              <a-option v-for="item in destinationOptions" :key="item" :value="item">{{ item }}</a-option>
            </a-select>
          </div>
        </section>

        <section class="form-section">
          <label class="field-label is-required">选择线路</label>
          <a-radio-group v-model="selectedRoute" class="line-grid">
            <a-radio
              v-for="route in firstMileRoutes"
              :key="route.key"
              :value="route.key"
              class="line-card"
              :class="[`line-${route.accent}`, { 'is-active': selectedRoute === route.key }]"
            >
              <span class="line-emoji">{{ route.emoji }}</span>
              <strong>{{ route.label }}</strong>
              <small>{{ route.days[0] }}-{{ route.days[1] }}天</small>
            </a-radio>
          </a-radio-group>
        </section>

        <section class="form-section cargo-section">
          <label class="field-label is-required">货物信息</label>
          <div class="cargo-mode-panel">
            <a-tabs
              :active-key="cargoInputMode"
              hide-content
              class="mode-tabs"
              @change="setCargoMode"
            >
              <a-tab-pane key="quick">
                <template #title>
                  <span class="mode-tab-title">
                    <icon-thunderbolt />
                    快速对比
                  </span>
                </template>
              </a-tab-pane>
              <a-tab-pane key="order">
                <template #title>
                  <span class="mode-tab-title">
                    <icon-file />
                    根据发货单
                  </span>
                </template>
              </a-tab-pane>
            </a-tabs>

            <div v-if="cargoInputMode === 'quick'" class="cargo-type-panel">
              <div class="cargo-type-card">
                <a-tabs
                  :active-key="selectedCargoType"
                  type="rounded"
                  hide-content
                  class="cargo-tabs"
                  @change="setSelectedCargoType"
                >
                  <a-tab-pane
                    v-for="cargoType in firstMileCargoTypes"
                    :key="cargoType.key"
                  >
                    <template #title>{{ cargoType.label }}</template>
                  </a-tab-pane>
                </a-tabs>
                <div class="cargo-type-content">
                  <span>{{ activeCargoType.label }}包括：</span>
                  <div class="cargo-tag-list">
                    <a-tag v-for="tag in activeCargoType.tags" :key="tag">{{ tag }}</a-tag>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="shipment-order-panel">
              <div class="shipment-order-heading">
                <strong>发货商品明细</strong>
                <a-button type="primary" size="small" @click="openAddGoodsModal">
                  <template #icon>
                    <icon-plus />
                  </template>
                  添加商品
                </a-button>
              </div>
              <ConfigurableDataTable
                :columns="shipmentOrderColumns"
                :default-visible-keys="shipmentOrderVisibleColumnKeys"
                :default-freeze-last-column="true"
                :data="shipmentOrderRows"
                :pagination="false"
                size="small"
                row-key="sku"
                table-class="data-table"
                wrapper-class="shipment-order-table first-mile-config-table"
              >
                <template #category="{ record }">
                  <a-tag :color="record.categoryType === 'classB' ? 'orange' : 'arcoblue'">
                    {{ record.category }}
                  </a-tag>
                </template>
                <template #quantity="{ record }">
                  <a-input-number
                    :model-value="record.quantity"
                    class="shipment-row-quantity"
                    :min="1"
                    hide-button
                    @change="(value) => updateShipmentRowQuantity(record.sku, value)"
                  />
                </template>
                <template #totalWeight="{ record }">
                  {{ formatWeight(getRowTotalWeight(record)) }}
                </template>
                <template #operation="{ record }">
                  <a-tooltip content="删除">
                    <a-button
                      type="text"
                      size="small"
                      status="danger"
                      class="shipment-order-delete-button"
                      aria-label="删除发货商品"
                      @click.stop="removeShipmentOrderRow(record.sku)"
                    >
                      <template #icon>
                        <icon-delete />
                      </template>
                    </a-button>
                  </a-tooltip>
                </template>
                <template #empty>
                  <div class="shipment-order-empty">
                    <icon-file />
                    <span>暂无商品，请点击「添加商品」按钮</span>
                  </div>
                </template>
              </ConfigurableDataTable>
              <div v-if="hasMultipleShipmentCategories" class="shipment-category-block">
                <div class="shipment-category-notice">
                  <icon-info-circle />
                  <p class="shipment-category-tip">
                    提示：本单货物包含{{ shipmentCategorySummaries.length }}个品类，系统将按品类自动拆分计费。
                  </p>
                </div>
                <div class="shipment-category-grid">
                  <section
                    v-for="(summary, index) in shipmentCategorySummaries"
                    :key="summary.key"
                    class="shipment-category-card"
                    :class="`is-${summary.tone}`"
                  >
                    <strong>单{{ index + 1 }} · {{ summary.label }}</strong>
                    <p>{{ summary.rows.map((row) => row.productName).join('、') }}</p>
                    <span>
                      数量: {{ summary.quantity }}件 ·
                      重量: {{ formatWeight(summary.weightKg) }}kg ·
                      密度: {{ summary.densityKgPerM3 }}kg/m³
                    </span>
                  </section>
                </div>
              </div>
              <div class="shipment-stat-grid">
                <section class="shipment-stat-card">
                  <span>货物总数</span>
                  <strong>{{ orderQuantity }} 件</strong>
                </section>
                <section class="shipment-stat-card">
                  <span>总重量</span>
                  <strong class="is-green">{{ formatWeight(orderWeightKg) }} kg</strong>
                </section>
                <section class="shipment-stat-card">
                  <span>平均密度</span>
                  <strong class="is-orange">{{ orderDensityKgPerM3 }} kg/m³</strong>
                </section>
                <section class="shipment-stat-card">
                  <span>计算体积</span>
                  <strong class="is-purple">{{ formatDecimal(shipmentOrderVolumeM3) }} m³</strong>
                </section>
              </div>
              <div class="carton-count-row">
                <label class="field-label is-required">箱数</label>
                <a-input-number v-model="shipmentCartonCount" class="carton-count-control" :min="1" hide-button>
                  <template #suffix>箱</template>
                </a-input-number>
              </div>
            </div>
          </div>
        </section>

        <section v-if="cargoInputMode === 'quick'" class="form-section compact-fields">
          <label class="field-label is-required">货物数量</label>
          <a-space class="chip-input-row" wrap>
            <a-radio-group v-model="activeQuantity" type="button" size="small">
              <a-radio
                v-for="item in firstMileQuantityOptions"
                :key="item"
                :value="item"
              >
                {{ item }}
              </a-radio>
            </a-radio-group>
            <a-input-number v-model="activeQuantity" class="number-control" :min="1" hide-button>
              <template #suffix>件</template>
            </a-input-number>
          </a-space>
        </section>

        <section v-if="cargoInputMode === 'quick'" class="form-section compact-fields">
          <label class="field-label is-required">预估总重</label>
          <a-space class="chip-input-row" wrap>
            <a-radio-group v-model="activeWeightKg" type="button" size="small">
              <a-radio
                v-for="item in firstMileWeightOptions"
                :key="item"
                :value="item"
              >
                {{ item }}kg
              </a-radio>
            </a-radio-group>
            <a-input-number v-model="activeWeightKg" class="number-control" :min="1" hide-button>
              <template #suffix>kg</template>
            </a-input-number>
          </a-space>
        </section>

        <section v-if="cargoInputMode === 'quick'" class="form-section compact-fields">
          <label class="field-label is-required">预估密度（kg/m³）</label>
          <a-space class="chip-input-row" wrap>
            <a-radio-group v-model="activeDensityKgPerM3" type="button" size="small">
              <a-radio
                v-for="item in firstMileDensityOptions"
                :key="item"
                :value="item"
              >
                {{ item }}
              </a-radio>
              <a-radio :value="220">200+</a-radio>
            </a-radio-group>
            <a-input-number v-model="activeDensityKgPerM3" class="number-control density-control" :min="1" hide-button>
              <template #suffix>kg/m³</template>
            </a-input-number>
          </a-space>
        </section>

        <section class="form-section">
          <div class="optional-label">
            <span>增值服务</span>
            <small>可选，多选</small>
          </div>
          <a-checkbox-group v-model="selectedServices" class="service-row">
            <a-checkbox
              v-for="service in firstMileValueAddedServices"
              :key="service"
              :value="service"
            >
              {{ service }}
            </a-checkbox>
          </a-checkbox-group>
        </section>

        <a-alert class="special-note" type="warning" show-icon>
          <template #title>特殊商品备注</template>
          <p>以下特殊商品需要单独咨询物流商：</p>
          <div class="sensitive-tags">
            <a-tag color="orangered">带电产品</a-tag>
            <a-tag color="orangered">带磁产品</a-tag>
            <a-tag color="orangered">液体商品</a-tag>
            <a-tag color="orangered">超大件货物</a-tag>
            <a-tag color="orangered">易碎品</a-tag>
          </div>
        </a-alert>
      </a-card>

      <a-card class="quote-summary-panel" :bordered="false">
        <header class="summary-header">
          <h2>配置详情</h2>
          <a-tag :color="cargoInputMode === 'order' ? 'green' : 'arcoblue'">{{ cargoInputModeLabel }}</a-tag>
        </header>

        <dl class="summary-detail-list">
          <div v-for="item in summaryDetails" :key="item.label" class="summary-detail-item">
            <dt>{{ item.label }}</dt>
            <dd>{{ item.value }}</dd>
          </div>
        </dl>

        <section v-if="cargoInputMode === 'order'" class="summary-split-detail">
          <div class="summary-split-title"><span>分单明细</span></div>
          <section
            v-for="(summary, index) in shipmentCategorySummaries"
            :key="summary.key"
            class="summary-split-card"
            :class="`is-${summary.tone}`"
          >
            <strong>单{{ index + 1 }} · {{ summary.label }}</strong>
            <dl>
              <div>
                <dt>数量</dt>
                <dd>{{ summary.quantity }} 件</dd>
              </div>
              <div>
                <dt>重量</dt>
                <dd>{{ formatWeight(summary.weightKg) }} kg</dd>
              </div>
              <div>
                <dt>密度</dt>
                <dd>{{ summary.densityKgPerM3 }} kg/m³</dd>
              </div>
              <div>
                <dt>体积</dt>
                <dd>{{ formatDecimal(summary.volumeM3) }} m³</dd>
              </div>
              <div>
                <dt>预估运费</dt>
                <dd class="split-price">
                  {{ formatCurrency(summary.priceRange[0]) }} - {{ formatCurrency(summary.priceRange[1]) }}
                </dd>
              </div>
            </dl>
          </section>
        </section>

        <section class="estimate-card">
          <span>预计可用物流线路</span>
          <p>有 <strong>{{ quoteEstimate.route.availableLines }}</strong> 条物流线路报价</p>
          <span>{{ cargoInputMode === 'order' ? '合计预估运费范围（分单合计）' : '预估运费范围' }}</span>
          <h3>
            {{ formatCurrency(cargoInputMode === 'order' ? orderPriceRange[0] : quoteEstimate.priceRange[0]) }}
            -
            {{ formatCurrency(cargoInputMode === 'order' ? orderPriceRange[1] : quoteEstimate.priceRange[1]) }}
          </h3>
          <small v-if="cargoInputMode === 'order'">
            {{ shipmentCategorySummaries.map((summary, index) => `单${index + 1}: ${formatCurrency(summary.priceRange[0])}-${formatCurrency(summary.priceRange[1])}`).join(' · ') }}
          </small>
          <small v-else>基于海运模式 · 实时计算</small>
          <span>每件运费范围</span>
          <p class="blue-text">
            {{ formatCurrency(cargoInputMode === 'order' ? orderPerItemRange[0] : quoteEstimate.perItemRange[0]) }}
            -
            {{ formatCurrency(cargoInputMode === 'order' ? orderPerItemRange[1] : quoteEstimate.perItemRange[1]) }}
          </p>
          <small>基于{{ cargoInputMode === 'order' ? '发货单总数' : '货物数量' }} · 实时计算</small>
          <span>预计到达时间</span>
          <p class="blue-text">{{ quoteEstimate.arrivalRange[0] }} - {{ quoteEstimate.arrivalRange[1] }}</p>
          <small>基于运输模式 · 实时计算</small>
        </section>

        <a-button type="primary" long class="quote-detail-button">
          <template #icon>
            <icon-send />
          </template>
          查看具体报价
        </a-button>

        <div class="quote-note-list">
          <p>· 报价仅供参考，实际费用以物流商确认价为准</p>
          <p>· 特殊货物可能产生额外费用</p>
        </div>
      </a-card>
    </div>

    <a-modal
      v-model:visible="addGoodsModalVisible"
      title="添加发货商品"
      width="720px"
      simple
      align-center
      title-align="start"
      ok-text="确认添加"
      cancel-text="取消"
      modal-class="first-mile-simple-modal"
      @ok="confirmAddGoods"
    >
      <div class="add-goods-modal-content">
        <a-tabs
          :active-key="addGoodsMode"
          hide-content
          class="add-goods-tabs"
          @change="setAddGoodsMode"
        >
          <a-tab-pane key="inbound">
            <template #title>
              <span class="add-goods-tab-title">
                <icon-file />
                根据入库单整单发送
              </span>
            </template>
          </a-tab-pane>
          <a-tab-pane key="custom">
            <template #title>
              <span class="add-goods-tab-title">
                <icon-thunderbolt />
                根据需求自行选择
              </span>
            </template>
          </a-tab-pane>
        </a-tabs>

        <section v-if="addGoodsMode === 'inbound'" class="add-goods-content">
          <p class="add-goods-helper">选择一个入库单，将整单商品添加到发货列表</p>
          <div class="inbound-order-list">
            <a-card
              v-for="order in inboundOrderOptions"
              :key="order.key"
              class="inbound-order-item"
              :class="{ 'is-active': selectedInboundOrderKey === order.key }"
              :bordered="true"
              hoverable
              @click="selectedInboundOrderKey = order.key"
            >
              <div class="inbound-order-main">
                <div class="inbound-order-head">
                  <span class="inbound-order-id">{{ order.key }}</span>
                  <span class="inbound-order-supplier">{{ order.supplier }}</span>
                </div>
                <div class="inbound-order-products">
                  <a-tag v-for="product in order.products" :key="product.sku">
                    {{ product.productName }} × {{ product.quantity }}
                  </a-tag>
                </div>
              </div>
            </a-card>
          </div>
        </section>

        <section v-else class="add-goods-content">
          <p class="add-goods-helper">从商品库中选择需要发货的商品并设置数量</p>
          <ConfigurableDataTable
            :columns="addGoodsTableColumns"
            :default-visible-keys="addGoodsVisibleColumnKeys"
            :pinned-column-keys="['selected']"
            :data="selectableGoodsRows"
            :pagination="false"
            row-key="sku"
            table-class="data-table"
            wrapper-class="add-goods-table first-mile-config-table"
          >
            <template #selected="{ record }">
              <a-checkbox
                :model-value="selectedGoodsKeys.includes(record.sku)"
                @change="(checked) => toggleGoodsSelection(record.sku, checked)"
              />
            </template>
            <template #category="{ record }">
              <a-tag :color="record.categoryType === 'classB' ? 'orange' : 'arcoblue'">{{ record.category }}</a-tag>
            </template>
            <template #quantity="{ record }">
              <a-input-number
                :model-value="record.quantity"
                class="add-goods-quantity"
                :min="1"
                :max="record.stock"
                hide-button
                @change="(value) => record.quantity = Math.max(1, Number(value) || 1)"
              />
            </template>
          </ConfigurableDataTable>
        </section>
      </div>
    </a-modal>
  </div>
</template>

<style scoped>
.first-mile-page {
  --first-mile-color-bg: var(--color-bg-2);
  --first-mile-color-control-border: var(--color-border-2);
  --first-mile-radius: var(--border-radius-medium);

  min-height: calc(100vh - 64px);
  color: var(--workspace-color-text, var(--color-text-1));
}

.first-mile-header {
  align-items: center;
}

.first-mile-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 390px;
  gap: 20px;
  align-items: start;
}

.quote-config-panel {
  border: 1px solid var(--workspace-color-border, var(--color-border-2));
  border-radius: 8px;
  background: var(--workspace-color-bg, var(--color-bg-2));
  box-shadow: none;
}

.quote-config-panel :deep(.arco-card-body) {
  padding: 20px;
}

.quote-summary-panel {
  position: sticky;
  top: 16px;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.quote-summary-panel :deep(.arco-card-body) {
  padding: 0;
}

.form-section + .form-section,
.special-note {
  margin-top: 18px;
}

.field-label,
.optional-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: var(--color-text-1);
  font-size: 13px;
  font-weight: 650;
}

.field-label.is-required::before {
  color: rgb(var(--danger-6));
  content: '*';
}

.optional-label small {
  color: var(--color-text-3);
  font-weight: 400;
}

.quote-date-picker,
.route-select {
  width: 100%;
}

:deep(.quote-date-picker.arco-picker),
.route-select :deep(.arco-select-view-single) {
  height: var(--size-default, 32px);
  border-color: var(--first-mile-color-control-border);
  border-radius: var(--first-mile-radius);
  background: var(--first-mile-color-bg);
  box-shadow: none;
}

:deep(.quote-date-picker.arco-picker:hover),
:deep(.quote-date-picker.arco-picker-focused),
.route-select:hover :deep(.arco-select-view-single),
.route-select:focus-within :deep(.arco-select-view-single),
.route-select :deep(.arco-select-view-focus) {
  border-color: rgb(var(--primary-6));
  background: var(--first-mile-color-bg);
  box-shadow: none;
}

.route-select-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 32px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
}

.swap-button {
  color: rgb(var(--primary-6));
}

.line-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}

.line-card {
  position: relative;
  display: flex;
  min-height: 88px;
  margin: 0;
  padding: 14px 12px;
  border: 1px solid var(--color-border-2);
  border-radius: 6px;
  background: var(--color-bg-2);
  cursor: pointer;
  justify-content: center;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.line-card :deep(.arco-radio-icon),
.line-card :deep(.arco-radio-icon-hover) {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.line-card :deep(.arco-radio-icon-hover::before) {
  display: none;
}

.line-card :deep(.arco-radio-label) {
  display: flex;
  align-items: center;
  width: 100%;
  flex-direction: column;
  gap: 4px;
  padding: 0;
  text-align: center;
}

.line-green {
  --line-active-bg: #f0fff4;
  --line-color: #00a22d;
}

.line-blue {
  --line-active-bg: #eef5ff;
  --line-color: #165dff;
}

.line-purple {
  --line-active-bg: #f5f0ff;
  --line-color: #722ed1;
}

.line-orange {
  --line-active-bg: #fff7e8;
  --line-color: #ff7d00;
}

.line-red {
  --line-active-bg: #fff1f0;
  --line-color: #f53f3f;
}

.line-emoji {
  display: block;
  font-size: 22px;
  line-height: 1;
}

.line-card strong {
  color: var(--color-text-1);
  font-size: 13px;
  line-height: 18px;
}

.line-card small {
  color: var(--color-text-3);
  font-size: 11px;
  line-height: 16px;
}

.line-card.is-active {
  background: var(--line-active-bg);
  border-color: var(--line-color);
  box-shadow: inset 0 0 0 1px var(--line-color);
}

.cargo-mode-panel {
  border: 1px solid var(--color-border-2);
  border-radius: 6px;
  background: var(--color-bg-2);
  overflow: hidden;
}

.mode-tabs {
  padding: 0 12px;
}

.mode-tab-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.service-row {
  margin-top: 10px;
  padding: 12px;
  border-radius: 6px;
  background: var(--color-fill-1);
}

.cargo-type-panel,
.shipment-order-panel {
  margin-top: 0;
  padding: 12px;
  border-top: 1px solid var(--color-border-1);
}

.cargo-tabs {
  width: 100%;
}

.cargo-tabs :deep(.arco-tabs-nav-type-rounded .arco-tabs-nav-tab) {
  min-height: 34px;
}

.cargo-tabs :deep(.arco-tabs-nav-tab) {
  font-size: 13px;
}

.cargo-type-card {
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
}

.cargo-type-content {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--color-border-1);
  color: var(--color-text-3);
  font-size: 12px;
}

.cargo-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.cargo-tag-list :deep(.arco-tag) {
  border: 1px solid var(--color-border-1);
  background: var(--color-fill-1);
}

.shipment-order-panel {
  background: transparent;
}

.shipment-order-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 14px 0 10px;
}

.shipment-order-heading strong {
  color: var(--color-text-1);
  font-size: 14px;
}

.first-mile-config-table {
  --batch-color-primary: rgb(var(--primary-6));
  --batch-color-text: var(--color-text-1);
  --batch-color-text-secondary: var(--color-text-2);
  --batch-color-text-tertiary: var(--color-text-3);
  --batch-color-bg: var(--color-bg-2);
  --batch-color-fill: var(--color-fill-1);
  --batch-color-border: var(--color-border-2);
  --batch-color-hover-bg: var(--color-fill-2);
  --batch-radius: var(--border-radius-medium);
  --workspace-color-primary: var(--batch-color-primary);
  --workspace-color-text: var(--batch-color-text);
  --workspace-color-text-secondary: var(--batch-color-text-secondary);
  --workspace-color-text-tertiary: var(--batch-color-text-tertiary);
  --workspace-color-bg: var(--batch-color-bg);
  --workspace-color-fill: var(--batch-color-fill);
  --workspace-color-border: var(--batch-color-border);
  --workspace-color-hover-bg: var(--batch-color-hover-bg);
  --workspace-radius: var(--batch-radius);
}

.first-mile-config-table :deep(.arco-table-th),
.first-mile-config-table :deep(.arco-table-td) {
  font-size: 12px;
}

.shipment-order-table {
  margin-top: 10px;
}

.shipment-row-quantity {
  width: 110px;
}

.shipment-order-delete-button {
  color: rgb(var(--danger-6));
}

.shipment-order-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 96px;
  gap: 10px;
  color: var(--color-text-3);
}

.shipment-order-empty svg {
  color: var(--color-text-4);
  font-size: 24px;
}

.shipment-category-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  padding: 8px 10px;
  border-radius: 4px;
  background: var(--color-fill-1);
  color: var(--color-text-2);
  font-size: 12px;
}

.shipment-category-tip {
  margin: 0;
  color: inherit;
  font-size: inherit;
  line-height: 18px;
}

.shipment-category-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.shipment-category-card {
  display: grid;
  gap: 8px;
  padding: 12px;
  border-radius: 6px;
  font-size: 12px;
}

.shipment-category-card.is-blue {
  background: #e8f5ff;
}

.shipment-category-card.is-orange {
  background: #fff3e8;
}

.shipment-category-card strong {
  color: rgb(var(--primary-6));
}

.shipment-category-card.is-orange strong {
  color: #f77234;
}

.shipment-category-card p {
  margin: 0;
  color: var(--color-text-2);
  line-height: 20px;
}

.shipment-category-card span {
  color: var(--color-text-2);
}

.shipment-stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.shipment-stat-card {
  display: grid;
  justify-items: start;
  gap: 6px;
  padding: 12px;
  border: 1px solid var(--color-border-1);
  border-radius: 6px;
  background: var(--color-bg-2);
  text-align: left;
}

.shipment-stat-card span {
  color: var(--color-text-3);
  font-size: 12px;
}

.shipment-stat-card strong {
  color: rgb(var(--primary-6));
  font-size: 18px;
}

.shipment-stat-card strong.is-green {
  color: #00b42a;
}

.shipment-stat-card strong.is-orange {
  color: #ff7d00;
}

.shipment-stat-card strong.is-purple {
  color: #722ed1;
}

.carton-count-row {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--color-border-1);
}

.carton-count-control {
  width: 160px;
}

.chip-input-row {
  width: 100%;
}

.number-control {
  width: 136px;
}

.density-control {
  width: 168px;
}

.service-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
}

.special-note :deep(.arco-alert-content) {
  width: 100%;
}

.special-note p {
  margin: 4px 0 8px;
  font-size: 12px;
}

.sensitive-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.summary-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.summary-header h2 {
  margin: 0;
  font-size: 16px;
}

.summary-detail-list {
  margin: 0;
}

.summary-detail-item {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
  padding: 8px 0;
}

.summary-detail-item + .summary-detail-item {
  border-top: 1px solid var(--color-border-1);
}

.summary-detail-item dt {
  color: var(--color-text-3);
}

.summary-detail-item dd {
  margin: 0;
  color: var(--color-text-1);
  text-align: right;
}

.summary-split-detail {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.summary-split-title {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 10px;
  align-items: center;
  color: var(--color-text-3);
  font-size: 13px;
  font-weight: 650;
}

.summary-split-title::before,
.summary-split-title::after {
  height: 1px;
  background: var(--color-border-1);
  content: '';
}

.summary-split-card {
  padding: 12px;
  border-radius: 6px;
}

.summary-split-card.is-blue {
  background: #e8f5ff;
}

.summary-split-card.is-orange {
  background: #fff3e8;
}

.summary-split-card strong {
  color: rgb(var(--primary-6));
}

.summary-split-card.is-orange strong {
  color: #f77234;
}

.summary-split-card dl {
  display: grid;
  gap: 6px;
  margin: 10px 0 0;
}

.summary-split-card dl div {
  display: grid;
  grid-template-columns: 80px minmax(0, 1fr);
  gap: 8px;
}

.summary-split-card dt {
  color: var(--color-text-3);
}

.summary-split-card dd {
  margin: 0;
  color: var(--color-text-1);
  text-align: right;
}

.summary-split-card .split-price {
  color: rgb(var(--primary-6));
  font-weight: 650;
}

.estimate-card {
  display: grid;
  gap: 6px;
  margin-top: 18px;
  padding: 18px;
  border-radius: 6px;
  background: var(--color-fill-1);
}

.estimate-card span {
  color: var(--color-text-3);
  font-size: 12px;
}

.estimate-card p,
.estimate-card h3 {
  margin: 0;
}

.estimate-card p {
  color: var(--color-text-1);
  font-size: 14px;
}

.estimate-card strong,
.estimate-card h3,
.estimate-card .blue-text {
  color: rgb(var(--primary-6));
}

.estimate-card .blue-text {
  font-weight: 650;
}

.estimate-card h3 {
  font-size: 22px;
}

.estimate-card small {
  margin-bottom: 4px;
  color: var(--color-text-3);
}

.quote-detail-button {
  height: 42px;
  margin-top: 16px;
  font-weight: 650;
}

.quote-note-list {
  margin-top: 12px;
  color: var(--color-text-3);
  font-size: 12px;
  line-height: 20px;
}

.quote-note-list p {
  margin: 0;
}

.quote-note-list p + p {
  margin-top: 2px;
}

:global(.first-mile-simple-modal .arco-modal-footer) {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  text-align: right;
}

.add-goods-modal-content {
  padding: 0;
}

.add-goods-tabs {
  width: 100%;
}

.add-goods-tab-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.add-goods-content {
  margin-top: 16px;
}

.add-goods-helper {
  margin: 0 0 12px;
  color: var(--color-text-2);
  font-size: 13px;
}

.inbound-order-list {
  display: grid;
  gap: 8px;
}

.inbound-order-item {
  width: 100%;
  min-height: 74px;
  box-sizing: border-box;
  border-radius: 8px;
  background: var(--color-bg-2);
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}

.inbound-order-item :deep(.arco-card-body) {
  padding: 12px 14px;
}

.inbound-order-item:hover {
  border-color: rgb(var(--primary-4));
}

.inbound-order-item.is-active {
  border-color: rgb(var(--primary-5));
  background: rgb(var(--primary-1));
  box-shadow: inset 0 0 0 1px rgb(var(--primary-5));
}

.inbound-order-main {
  display: grid;
  min-width: 0;
  gap: 8px;
}

.inbound-order-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.inbound-order-id {
  color: var(--color-text-1);
  font-weight: 650;
}

.inbound-order-supplier {
  color: var(--color-text-3);
  font-size: 13px;
}

.inbound-order-products {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.add-goods-table {
  max-height: 430px;
}

.add-goods-quantity {
  width: 120px;
}

@media (max-width: 1280px) {
  .first-mile-shell {
    grid-template-columns: minmax(0, 1fr);
  }

  .quote-summary-panel {
    position: static;
  }
}

@media (max-width: 900px) {
  .first-mile-header {
    flex-direction: column;
    align-items: stretch;
  }

  .quote-console-button {
    width: 100%;
  }

  .route-select-row {
    grid-template-columns: 1fr;
  }

  .line-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .cargo-type-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .quote-config-panel :deep(.arco-card-body) {
    padding: 16px;
  }

  .line-grid {
    grid-template-columns: 1fr;
  }

  .summary-detail-item {
    grid-template-columns: 1fr;
  }

  .summary-detail-item dd {
    text-align: left;
  }
}
</style>
