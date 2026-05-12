import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const viewPath = new URL('../src/views/FirstMileQuoteView.vue', import.meta.url)
const dataPath = new URL('../src/data/firstMileQuote.ts', import.meta.url)
const navigationSource = readFileSync(
  new URL('../src/data/navigation.ts', import.meta.url),
  'utf-8',
)
const routerSource = readFileSync(
  new URL('../src/router/index.ts', import.meta.url),
  'utf-8',
)

describe('first-mile quote source', () => {
  it('adds the logistics quote page under logistics management', () => {
    expect(navigationSource).toMatch(/key: 'logistics',[\s\S]*title: '物流管理',[\s\S]*\{ key: 'first-mile', title: '物流智能询价', path: '\/services\/first-mile'/)
    expect(navigationSource).not.toMatch(/key: 'services',[\s\S]*title: '外部服务商',[\s\S]*\{ key: 'first-mile', title: '物流智能询价'/)
    expect(routerSource).toContain("import FirstMileQuoteView from '../views/FirstMileQuoteView.vue'")
    expect(routerSource).toContain("item.path !== '/services/first-mile'")
    expect(routerSource).toContain("path: 'services/first-mile'")
    expect(routerSource).toContain("component: FirstMileQuoteView")
    expect(routerSource).toMatch(/title: '物流智能询价',[\s\S]*sectionKey: 'logistics',[\s\S]*sectionTitle: '物流管理',[\s\S]*hideBreadcrumb: true/)
  })

  it('renders the quote workflow vocabulary from the prototype', () => {
    expect(existsSync(viewPath)).toBe(true)
    const viewSource = readFileSync(viewPath, 'utf-8')

    for (const snippet of [
      '物流智能询价',
      '直接进入比价台',
      '期望发货时间',
      '运输路线',
      '选择线路',
      '货物信息',
      '快速对比',
      '根据发货单',
      '配置详情',
      '查看具体报价',
      '特殊商品备注',
      '报价仅供参考',
    ]) {
      expect(viewSource).toContain(snippet)
    }
  })

  it('aligns the quote page header with the product category page header pattern', () => {
    expect(existsSync(viewPath)).toBe(true)
    const viewSource = readFileSync(viewPath, 'utf-8')

    expect(viewSource).toContain('class="sales-workbench first-mile-page"')
    expect(viewSource).toContain('<section class="page-header first-mile-header">')
    expect(viewSource).toContain('<div class="header-left">')
    expect(viewSource).toContain('<h1 class="page-title">物流智能询价</h1>')
    expect(viewSource).not.toContain('quote-title-icon')
    expect(viewSource).not.toContain('实时比价 · 透明可靠')
  })

  it('uses Arco controls instead of hand-rolled form primitives for the quote UI', () => {
    expect(existsSync(viewPath)).toBe(true)
    const viewSource = readFileSync(viewPath, 'utf-8')

    for (const snippet of [
      '<a-card',
      '<a-date-picker',
      '<a-radio-group',
      '<a-radio',
      '<a-checkbox-group',
      '<a-checkbox',
      '<a-input-number',
    ]) {
      expect(viewSource).toContain(snippet)
    }

    expect(viewSource).not.toContain('<input')
    expect(viewSource).not.toContain('<button')
  })

  it('keeps stacked shipment fields while using batch inventory control colors', () => {
    expect(existsSync(viewPath)).toBe(true)
    const viewSource = readFileSync(viewPath, 'utf-8')

    expect(viewSource).not.toContain('class="quote-filter-row"')
    expect(viewSource).not.toContain('volc-design-search-item-label')
    expect(viewSource).toContain('<label class="field-label is-required">期望发货时间</label>')
    expect(viewSource).toContain('<label class="field-label is-required">运输路线</label>')
    expect(viewSource).toContain(':deep(.quote-date-picker.arco-picker)')
    expect(viewSource).toMatch(/:deep\(\.quote-date-picker\.arco-picker\),[\s\S]*\.route-select :deep\(\.arco-select-view-single\)\s*{[\s\S]*background: var\(--first-mile-color-bg\);/)
    expect(viewSource).toMatch(/\.route-select:hover :deep\(\.arco-select-view-single\),[\s\S]*border-color: rgb\(var\(--primary-6\)\);/)
  })

  it('renders route cards with neutral default styling and color only on selected state', () => {
    expect(existsSync(viewPath)).toBe(true)
    const viewSource = readFileSync(viewPath, 'utf-8')
    const dataSource = readFileSync(dataPath, 'utf-8')

    expect(viewSource).toContain('class="line-emoji"')
    expect(viewSource).toContain('{{ route.emoji }}')
    expect(viewSource).toContain('<strong>{{ route.label }}</strong>')
    expect(viewSource).toContain('<small>{{ route.days[0] }}-{{ route.days[1] }}天</small>')
    expect(viewSource).not.toContain('class="line-icon"')
    expect(viewSource).toMatch(/\.line-card\s*{[\s\S]*background: var\(--color-bg-2\);/)
    expect(viewSource).toMatch(/\.line-card small\s*{[\s\S]*color: var\(--color-text-3\);/)
    expect(viewSource).toMatch(/\.line-card\.is-active\s*{[\s\S]*background: var\(--line-active-bg\);/)
    expect(viewSource).toContain('.line-card :deep(.arco-radio-icon-hover)')
    expect(dataSource).toContain("emoji: '🚛'")
    expect(dataSource).toContain("emoji: '✈️'")
  })

  it('upgrades cargo information into polished quick and shipment order modes', () => {
    expect(existsSync(viewPath)).toBe(true)
    const viewSource = readFileSync(viewPath, 'utf-8')

    expect(viewSource).toContain('class="cargo-type-card"')
    expect(viewSource).toContain('class="cargo-tag-list"')
    expect(viewSource).toContain('class="shipment-order-panel"')
    expect(viewSource).toContain('class="cargo-mode-panel"')
    expect(viewSource).toMatch(/<div class="cargo-mode-panel">[\s\S]*<a-tabs[\s\S]*:active-key="cargoInputMode"[\s\S]*class="mode-tabs"[\s\S]*@change="setCargoMode"[\s\S]*<div v-if="cargoInputMode === 'quick'" class="cargo-type-panel">[\s\S]*<div v-else class="shipment-order-panel">/)
    expect(viewSource).not.toContain('<a-radio-group v-model="cargoInputMode" class="mode-tabs" type="button">')
    expect(viewSource).toMatch(/\.cargo-mode-panel\s*{[\s\S]*border: 1px solid var\(--color-border-2\);[\s\S]*background: var\(--color-bg-2\);/)
    expect(viewSource).toContain('class="mode-tab-title"')
    expect(viewSource).toMatch(/<a-tabs[\s\S]*:active-key="selectedCargoType"[\s\S]*type="rounded"[\s\S]*class="cargo-tabs"[\s\S]*@change="setSelectedCargoType"/)
    expect(viewSource).not.toContain('<a-radio-group v-model="selectedCargoType" class="cargo-tabs" type="button">')
    expect(viewSource).toMatch(/\.cargo-type-card\s*{[\s\S]*border: 0;/)
    expect(viewSource).toContain('发货商品明细')
    expect(viewSource).toContain('添加商品')
    for (const snippet of ['SKU', '商品名称', '品类', '数量', '单件重(kg)', '总重(kg)', '密度', '操作']) {
      expect(viewSource).toContain(snippet)
    }
    expect(viewSource).toContain('ConfigurableDataTable')
    expect(viewSource).toContain('wrapper-class="shipment-order-table first-mile-config-table"')
    expect(viewSource).toContain('first-mile-config-table')
    expect(viewSource).toContain('<template #category="{ record }">')
    expect(viewSource).toContain('<a-tag :color="record.categoryType === \'classB\' ? \'orange\' : \'arcoblue\'">')
    expect(viewSource).toContain('<template #quantity="{ record }">')
    expect(viewSource).toContain('shipment-row-quantity')
    expect(viewSource).toContain('<template #totalWeight="{ record }">')
    expect(viewSource).toContain('shipment-order-delete-button')
    expect(viewSource).toContain('icon-delete')
    expect(viewSource).toContain('shipment-category-notice')
    expect(viewSource).toContain('shipment-stat-grid')
    expect(viewSource).toContain('暂无商品，请点击「添加商品」按钮')
    expect(viewSource).toContain('箱数')
    expect(viewSource).toContain('shipmentCartonCount')
  })

  it('keeps quick compare and shipment order values mutually exclusive for the summary', () => {
    expect(existsSync(viewPath)).toBe(true)
    const viewSource = readFileSync(viewPath, 'utf-8')

    for (const snippet of [
      'quickCargoType',
      'quickQuantity',
      'quickWeightKg',
      'quickDensityKgPerM3',
      'orderCargoType',
      'orderQuantity',
      'orderWeightKg',
      'orderDensityKgPerM3',
      'activeCargoTypeKey',
      'activeQuantity',
      'activeWeightKg',
      'activeDensityKgPerM3',
      'cargoInputModeLabel',
      'shipmentCategorySummaries',
      'hasMultipleShipmentCategories',
      'orderPriceRange',
      'orderPerItemRange',
    ]) {
      expect(viewSource).toContain(snippet)
    }

    expect(viewSource).toMatch(/calculateFirstMileQuote\(\{[\s\S]*cargoTypeKey: activeCargoTypeKey\.value,[\s\S]*quantity: activeQuantity\.value,[\s\S]*weightKg: activeWeightKg\.value,[\s\S]*densityKgPerM3: activeDensityKgPerM3\.value,/)
    expect(viewSource).toContain('<a-tag :color="cargoInputMode === \'order\' ? \'green\' : \'arcoblue\'">{{ cargoInputModeLabel }}</a-tag>')
    expect(viewSource).toContain('class="summary-split-detail"')
    expect(viewSource).toContain('class="summary-split-card"')
    expect(viewSource).toContain('提示：本单货物包含{{ shipmentCategorySummaries.length }}个品类，系统将按品类自动拆分计费。')
    expect(viewSource).toContain('class="shipment-category-tip"')
    expect(viewSource).not.toContain('选择发货单后会自动带出货物类型、数量、重量和目的仓，当前原型先保留入口态。')
    expect(viewSource).toContain("{ label: '商品种类', value: `${shipmentOrderRows.value.length} 种` }")
    expect(viewSource).toContain("{ label: '货物总数', value: `${activeQuantity.value} 件` }")
    expect(viewSource).toContain("{ label: '总重量', value: `${activeWeightKg.value} kg` }")
    expect(viewSource).toContain("{ label: '平均密度', value: `${activeDensityKgPerM3.value} kg/m³` }")
    expect(viewSource).toContain("{ label: '计算体积', value: `${formatDecimal(shipmentOrderVolumeM3.value)} m³` }")
    expect(viewSource).toContain('合计预估运费范围（分单合计）')
    expect(viewSource).toContain('v-model="activeQuantity"')
    expect(viewSource).toContain('v-model="activeWeightKg"')
    expect(viewSource).toContain('v-model="activeDensityKgPerM3"')
    expect(viewSource).toContain('syncOrderSummary(nextRows)')
    expect(viewSource).not.toContain('quantity.value = nextRows.reduce')
  })

  it('adds the prototype modal flow for adding shipment goods', () => {
    expect(existsSync(viewPath)).toBe(true)
    const viewSource = readFileSync(viewPath, 'utf-8')

    expect(viewSource).toContain('addGoodsModalVisible')
    expect(viewSource).toContain('@click="openAddGoodsModal"')
    expect(viewSource).toContain('<a-modal')
    expect(viewSource).toContain('title="添加发货商品"')
    expect(viewSource).toContain('simple')
    expect(viewSource).toContain('align-center')
    expect(viewSource).toContain('title-align="start"')
    expect(viewSource).toContain('modal-class="first-mile-simple-modal"')
    expect(viewSource).toContain('ok-text="确认添加"')
    expect(viewSource).toContain('@ok="confirmAddGoods"')
    expect(viewSource).toContain('addGoodsMode')
    expect(viewSource).toContain('<a-tabs')
    expect(viewSource).toContain('@change="setAddGoodsMode"')
    expect(viewSource).toContain('根据入库单整单发送')
    expect(viewSource).toContain('根据需求自行选择')
    expect(viewSource).toContain('<div class="inbound-order-list">')
    expect(viewSource).toContain('<a-card')
    expect(viewSource).toContain('hoverable')
    expect(viewSource).not.toContain('<a-list class="inbound-order-list" :bordered="false" size="small">')
    expect(viewSource).toContain('class="inbound-order-item"')
    expect(viewSource).toContain('RK-20260325-001')
    expect(viewSource).toContain('义乌百货供应商')
    expect(viewSource).toContain('SKU-001')
    expect(viewSource).toContain('发货数量')
    expect(viewSource).toContain('selectedGoodsKeys')
    expect(viewSource).toContain('wrapper-class="add-goods-table first-mile-config-table"')
    expect(viewSource).toContain('ConfigurableDataTable')
    expect(viewSource).toContain('class="add-goods-modal-content"')
    expect(viewSource).toContain(':global(.first-mile-simple-modal .arco-modal-footer)')
    expect(viewSource).not.toContain('inbound-order-check')
    expect(viewSource).toContain('inbound-order-main')
  })

  it('separates summary detail rows with dividers for easier scanning', () => {
    expect(existsSync(viewPath)).toBe(true)
    const viewSource = readFileSync(viewPath, 'utf-8')

    expect(viewSource).toContain('<a-card class="quote-summary-panel" :bordered="false">')
    expect(viewSource).toMatch(/\.quote-summary-panel\s*{[\s\S]*border: 0;/)
    expect(viewSource).toMatch(/\.quote-summary-panel :deep\(\.arco-card-body\)\s*{[\s\S]*padding: 0;/)
    expect(viewSource).toContain('class="summary-detail-list"')
    expect(viewSource).toContain('class="summary-detail-item"')
    expect(viewSource).toMatch(/\.summary-detail-item \+ \.summary-detail-item\s*{[\s\S]*border-top:/)
    expect(viewSource).toContain('class="summary-split-detail"')
    expect(viewSource).toContain('class="shipment-category-notice"')
    expect(viewSource).toContain('class="shipment-category-tip"')
    expect(viewSource).toContain('class="shipment-stat-grid"')
    expect(viewSource).toMatch(/\.estimate-card \.blue-text\s*{[\s\S]*font-weight: 650;/)
  })

  it('uses plain helper text for quote notes instead of a warning alert', () => {
    expect(existsSync(viewPath)).toBe(true)
    const viewSource = readFileSync(viewPath, 'utf-8')

    expect(viewSource).toContain('class="quote-note-list"')
    expect(viewSource).not.toContain('<a-alert class="price-warning"')
    expect(viewSource).toContain('报价仅供参考，实际费用以物流商确认价为准')
    expect(viewSource).toContain('特殊货物可能产生额外费用')
  })

  it('keeps quote options and estimate logic in a typed data module', () => {
    expect(existsSync(dataPath)).toBe(true)
    const dataSource = readFileSync(dataPath, 'utf-8')

    for (const snippet of [
      'firstMileRoutes',
      'firstMileCargoTypes',
      'firstMileQuantityOptions',
      'calculateFirstMileQuote',
      'estimateVolume',
      'emoji',
      '经济线路',
      '普快线路',
      '特快线路',
      '空运线路',
      '特快空运',
    ]) {
      expect(dataSource).toContain(snippet)
    }
  })
})
