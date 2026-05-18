<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { TableColumnData } from '@arco-design/web-vue'
import { IconDown, IconDownload, IconRefresh, IconUp } from '@arco-design/web-vue/es/icon'
import { useRouter } from 'vue-router'
import type { EChartsOption } from 'echarts'
import AppDataTable from '../common/AppDataTable.vue'
import AppEChart from '../common/AppEChart.vue'
import SecondaryPageHeader from '../common/SecondaryPageHeader.vue'
import {
  createAdvertisingProductStatisticsRows,
  findAdvertisingCampaignById,
  formatAdvertisingMoney,
  formatAdvertisingNumber,
  getCampaignStatusLabel,
  getCampaignStatusTagColor,
  type AdvertisingCampaignProduct,
  type AdvertisingProductStatisticsItem,
  type AdvertisingProductStatisticsRow,
  type AdvertisingStatisticsMetricKey,
} from '../../data/storeAdvertising'
import { useProductCatalogStore } from '../../data/productCatalog'
import './storeAdvertising.css'

type StatisticsMetricTrend = 'up' | 'down' | 'flat'
type StatisticsMetricCard = {
  title: string
  metricKey: AdvertisingStatisticsMetricKey
  value: string
  delta: string
  trend: StatisticsMetricTrend
  color: string
}
type StatisticsProductDisplayRow = {
  displayId: string
  rowType: 'group' | 'item'
  id: string
  sku: string
  productCount: number
  averageRank: number
  product: AdvertisingProductStatisticsItem
  statistics: AdvertisingProductStatisticsItem['statistics']
}

const props = defineProps<{
  campaignId: string
}>()

const router = useRouter()
const catalogStore = useProductCatalogStore()
const selectedMetrics = ref<AdvertisingStatisticsMetricKey[]>([
  'impressions',
  'clicks',
  'cartAdds',
  'orderedItems',
  'spend',
])
const selectedDateRange = ref<string[]>([])
const chartMode = ref<'linear' | 'funnel'>('linear')
const displayArea = ref('all')
const expandedStatisticsProductGroupIds = ref<string[]>([])
const statisticsProductCurrentPage = ref(1)
const statisticsProductPageSize = ref(10)

const statisticsProductColumns: TableColumnData[] = [
  { title: '照片', dataIndex: 'image', slotName: 'image', width: 96, align: 'center' },
  { title: '产品名称', dataIndex: 'sku', slotName: 'product', width: 260 },
  { title: '平均排名', dataIndex: 'averageRank', slotName: 'averageRank', width: 120, align: 'right' },
  { title: '花费', dataIndex: 'spend', slotName: 'spend', width: 130, align: 'right' },
  { title: '订单金额', dataIndex: 'orderAmount', slotName: 'orderAmount', width: 140, align: 'right' },
  { title: '展示次数', dataIndex: 'impressions', slotName: 'impressions', width: 140, align: 'right' },
  { title: '点击次数', dataIndex: 'clicks', slotName: 'clicks', width: 130, align: 'right' },
  { title: '添加到购物车', dataIndex: 'cartAdds', slotName: 'cartAdds', width: 150, align: 'right' },
]

const metricColorMap: Record<AdvertisingStatisticsMetricKey, string> = {
  impressions: '#165dff',
  clicks: '#24E0FF',
  cartAdds: '#f7ba1e',
  orderedItems: '#14c9c9',
  spend: '#f53f3f',
}

const campaign = computed(() => findAdvertisingCampaignById(props.campaignId))
const productBySku = computed(() =>
  new Map(catalogStore.products.value.map((product) => [product.basicInfo.sku, product]))
)
const chartSeries = computed(() => {
  const points = campaign.value?.statistics ?? []
  const [startDate, endDate] = selectedDateRange.value

  if (!startDate || !endDate) return points

  return points.filter((point) => point.date >= startDate && point.date <= endDate)
})
const statisticsProductRows = computed(() =>
  createAdvertisingProductStatisticsRows(campaign.value?.products ?? [])
)
const createStatisticsProductGroupDisplayRow = (
  row: AdvertisingProductStatisticsRow
): StatisticsProductDisplayRow => ({
  displayId: row.id,
  rowType: 'group',
  id: row.id,
  sku: row.sku,
  productCount: row.productCount,
  averageRank: row.averageRank,
  product: row.items[0],
  statistics: row.statistics,
})

const createStatisticsProductItemDisplayRow = (
  groupRow: AdvertisingProductStatisticsRow,
  item: AdvertisingProductStatisticsItem
): StatisticsProductDisplayRow => ({
  displayId: `${groupRow.id}-${item.id}`,
  rowType: 'item',
  id: groupRow.id,
  sku: item.sku,
  productCount: 1,
  averageRank: item.statisticRank,
  product: item,
  statistics: item.statistics,
})

const visibleStatisticsProductRows = computed(() =>
  statisticsProductRows.value.flatMap((row) => {
    const groupRow = createStatisticsProductGroupDisplayRow(row)

    if (!expandedStatisticsProductGroupIds.value.includes(row.id)) return [groupRow]

    return [
      groupRow,
      ...row.items.slice(1).map((item) => createStatisticsProductItemDisplayRow(row, item)),
    ]
  })
)
const pagedStatisticsProductRows = computed(() => {
  const startIndex = (statisticsProductCurrentPage.value - 1) * statisticsProductPageSize.value

  return visibleStatisticsProductRows.value.slice(startIndex, startIndex + statisticsProductPageSize.value)
})
const statisticsTotals = computed(() =>
  chartSeries.value.reduce(
    (summary, point) => ({
      impressions: summary.impressions + point.impressions,
      clicks: summary.clicks + point.clicks,
      cartAdds: summary.cartAdds + point.cartAdds,
      orderedItems: summary.orderedItems + point.orderedItems,
      spend: summary.spend + point.spend,
    }),
    {
      impressions: 0,
      clicks: 0,
      cartAdds: 0,
      orderedItems: 0,
      spend: 0,
    }
  )
)

const statisticsMetricCards = computed<StatisticsMetricCard[]>(() => {
  if (!campaign.value) return []

  const totals = statisticsTotals.value

  return [
    {
      title: '展示次数',
      metricKey: 'impressions',
      value: formatAdvertisingNumber(totals.impressions || campaign.value.impressions),
      delta: '214.3%',
      trend: 'up',
      color: metricColorMap.impressions,
    },
    {
      title: '点击次数',
      metricKey: 'clicks',
      value: formatAdvertisingNumber(totals.clicks || campaign.value.clicks),
      delta: '285.8%',
      trend: 'up',
      color: metricColorMap.clicks,
    },
    {
      title: '购物车',
      metricKey: 'cartAdds',
      value: formatAdvertisingNumber(totals.cartAdds),
      delta: '168.6%',
      trend: 'up',
      color: metricColorMap.cartAdds,
    },
    {
      title: '订购商品数量',
      metricKey: 'orderedItems',
      value: formatAdvertisingNumber(totals.orderedItems || campaign.value.orders),
      delta: '260.2%',
      trend: 'up',
      color: metricColorMap.orderedItems,
    },
    {
      title: '花费',
      metricKey: 'spend',
      value: formatAdvertisingMoney(totals.spend || campaign.value.spend, campaign.value.currencySymbol),
      delta: '506.8%',
      trend: 'up',
      color: metricColorMap.spend,
    },
  ]
})

const selectedStatisticsMetricCards = computed(() =>
  statisticsMetricCards.value.filter((card) => selectedMetrics.value.includes(card.metricKey))
)

const funnelSteps = computed(() => {
  const totals = statisticsTotals.value
  const fallbackOrders = campaign.value?.orders ?? 0
  const steps = [
    {
      key: 'impressions',
      label: '展示次数',
      value: totals.impressions || campaign.value?.impressions || 0,
      color: metricColorMap.impressions,
    },
    {
      key: 'clicks',
      label: '点击次数',
      value: totals.clicks || campaign.value?.clicks || 0,
      color: metricColorMap.clicks,
    },
    {
      key: 'cartAdds',
      label: '加入购物车',
      value: totals.cartAdds,
      color: metricColorMap.cartAdds,
    },
    {
      key: 'orderedItems',
      label: '订购商品数量',
      value: totals.orderedItems || fallbackOrders,
      color: metricColorMap.orderedItems,
    },
  ]
  const firstValue = steps[0]?.value || 1

  return steps.map((step, index) => {
    const previousValue = index > 0 ? steps[index - 1].value : firstValue

    return {
      ...step,
      firstRate: `${(step.value / firstValue * 100).toFixed(1)}%`,
      previousRate: `${(previousValue > 0 ? step.value / previousValue * 100 : 0).toFixed(1)}%`,
    }
  })
})

const statisticsChartUpdateOptions = { replaceMerge: ['series', 'xAxis', 'yAxis', 'dataZoom'] }

const toggleMetric = (metricKey: AdvertisingStatisticsMetricKey) => {
  const currentMetrics = selectedMetrics.value

  if (currentMetrics.includes(metricKey)) {
    if (currentMetrics.length === 1) return

    selectedMetrics.value = currentMetrics.filter((currentMetric) => currentMetric !== metricKey)
    return
  }

  selectedMetrics.value = [...currentMetrics, metricKey]
}

const statisticsChartOption = computed<EChartsOption>(() => {
  if (chartMode.value === 'funnel') {
    const steps = funnelSteps.value

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        valueFormatter: (value) => formatAdvertisingNumber(Number(value)),
      },
      grid: {
        top: 20,
        right: 96,
        bottom: 28,
        left: 96,
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: {
          color: '#86909c',
          fontSize: 12,
          formatter: (value: number) => formatAdvertisingNumber(value),
        },
        splitLine: {
          lineStyle: { color: '#f2f3f5' },
        },
      },
      yAxis: {
        type: 'category',
        data: steps.map((step) => step.label),
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: {
          color: '#4e5969',
          fontSize: 12,
        },
      },
      series: [
        {
          name: '转化漏斗',
          type: 'bar',
          barWidth: 22,
          data: steps.map((step) => ({
            value: step.value,
            itemStyle: {
              color: step.color,
              borderRadius: [0, 4, 4, 0],
            },
          })),
          label: {
            show: true,
            position: 'right',
            color: '#4e5969',
            formatter: (params) => formatAdvertisingNumber(Number(params.value)),
          },
        },
      ],
    }
  }

  const points = chartSeries.value
  const labels = points.map((point) => point.date.slice(5).replace('-', '.'))
  const activeCards = selectedStatisticsMetricCards.value.length > 0
    ? selectedStatisticsMetricCards.value
    : statisticsMetricCards.value.slice(0, 1)
  const currencySymbol = campaign.value?.currencySymbol
  const shouldFormatCurrency = activeCards.length === 1 && activeCards[0]?.metricKey === 'spend'

  return {
    color: activeCards.map((card) => card.color),
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value) => {
        const numericValue = Number(value)

        if (Number.isNaN(numericValue)) return String(value)
        if (shouldFormatCurrency) return formatAdvertisingMoney(numericValue, currencySymbol)

        return formatAdvertisingNumber(numericValue)
      },
    },
    grid: {
      top: 24,
      right: 56,
      bottom: 76,
      left: 16,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: labels,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#e5e6eb' } },
      axisLabel: {
        color: '#86909c',
        fontSize: 12,
      },
      splitLine: {
        show: true,
        lineStyle: { color: '#f2f3f5' },
      },
    },
    yAxis: {
      type: 'value',
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: {
        color: '#86909c',
        fontSize: 12,
        formatter: (value: number) =>
          shouldFormatCurrency
            ? formatAdvertisingMoney(value, currencySymbol)
            : formatAdvertisingNumber(value),
      },
      splitLine: {
        lineStyle: { color: '#f2f3f5' },
      },
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
      },
      {
        type: 'slider',
        start: 0,
        end: 100,
        height: 24,
        bottom: 18,
        borderColor: '#c9d8ff',
        backgroundColor: '#f5f8ff',
        fillerColor: 'rgba(22, 93, 255, 0.16)',
        handleStyle: {
          color: '#ffffff',
          borderColor: '#9bbcff',
        },
        textStyle: {
          color: '#86909c',
        },
      },
    ],
    series: activeCards.map((card) => ({
      name: card.title,
      type: 'line',
      smooth: false,
      symbol: 'circle',
      symbolSize: 7,
      showSymbol: true,
      lineStyle: {
        width: 2,
      },
      itemStyle: {
        color: card.color,
      },
      emphasis: {
        focus: 'series',
      },
      data: points.map((point) => point[card.metricKey]),
    })),
  }
})

const goBack = () => {
  if (!campaign.value) {
    router.push('/stores/ads')
    return
  }

  router.push(`/stores/ads/${campaign.value.id}`)
}

const getCatalogProduct = (product?: AdvertisingCampaignProduct) =>
  product ? productBySku.value.get(product.sku) : undefined

const getAdvertisingProductName = (product?: AdvertisingCampaignProduct) =>
  getCatalogProduct(product)?.basicInfo.chineseName ?? product?.sku ?? ''

const getAdvertisingProductImage = (product?: AdvertisingCampaignProduct) =>
  getCatalogProduct(product)?.basicInfo.mainImage

const getStatisticsItemLabel = (item: AdvertisingProductStatisticsItem) =>
  `${getAdvertisingProductName(item)} · ${item.id.replace('ad-product-', '')}`

const getStatisticsProductRowClass = (record: StatisticsProductDisplayRow) => [
  record.rowType === 'item' ? 'is-statistics-product-child' : '',
  record.rowType === 'group' && expandedStatisticsProductGroupIds.value.includes(record.id)
    ? 'is-expanded-statistics-product-row'
    : '',
].filter(Boolean).join(' ')

const toggleStatisticsProductExpansion = (rowId: string) => {
  expandedStatisticsProductGroupIds.value = expandedStatisticsProductGroupIds.value.includes(rowId)
    ? expandedStatisticsProductGroupIds.value.filter((currentId) => currentId !== rowId)
    : [...expandedStatisticsProductGroupIds.value, rowId]
}

const getLastDataText = () => {
  const lastPoint = chartSeries.value.at(-1)

  return lastPoint ? `最近数据 ${lastPoint.date}` : '暂无统计数据'
}

watch(campaign, (nextCampaign) => {
  selectedDateRange.value = nextCampaign ? [nextCampaign.startDate, nextCampaign.endDate] : []
  expandedStatisticsProductGroupIds.value = []
  statisticsProductCurrentPage.value = 1
}, { immediate: true })

watch(statisticsProductPageSize, () => {
  statisticsProductCurrentPage.value = 1
})

watch(visibleStatisticsProductRows, (nextRows) => {
  const maxPage = Math.max(Math.ceil(nextRows.length / statisticsProductPageSize.value), 1)

  if (statisticsProductCurrentPage.value > maxPage) {
    statisticsProductCurrentPage.value = maxPage
  }
})
</script>

<template>
  <div class="store-advertising-workbench advertising-statistics-workbench">
    <template v-if="campaign">
      <SecondaryPageHeader title="活动统计" @back="goBack" />

      <section class="advertising-detail-overview-card advertising-statistics-overview-card">
        <div class="advertising-detail-overview-main">
          <div class="advertising-detail-overview-profile">
            <span class="advertising-detail-overview-thumb">
              <img
                v-if="getAdvertisingProductImage(campaign.products[0])"
                :src="getAdvertisingProductImage(campaign.products[0])"
                :alt="getAdvertisingProductName(campaign.products[0]) || campaign.campaignName"
              >
              <span v-else>{{ (getAdvertisingProductName(campaign.products[0]) || campaign.campaignName).slice(0, 1) }}</span>
            </span>

            <div class="advertising-detail-overview-identity">
              <div class="advertising-detail-overview-title-row">
                <strong>{{ campaign.campaignName }}</strong>
              </div>
              <div class="advertising-detail-overview-description advertising-detail-meta-row">
                <a-tag :color="getCampaignStatusTagColor(campaign.status)">
                  {{ getCampaignStatusLabel(campaign.status) }}
                </a-tag>
                <a-tag size="small" color="gray">{{ campaign.campaignType }}</a-tag>
                <span>ID {{ campaign.id }}</span>
                <span>{{ campaign.platform }}</span>
                <span>{{ campaign.storeName }}</span>
                <span>{{ getLastDataText() }} · 更新于 {{ campaign.endDate }}</span>
              </div>
            </div>
          </div>

          <div class="advertising-detail-overview-actions">
            <a-button>
              <template #icon>
                <icon-download />
              </template>
              导出
            </a-button>
          </div>
        </div>
      </section>

      <section class="advertising-statistics-section advertising-statistics-page-section advertising-detail-module-section">
        <div class="advertising-statistics-heading">
          <div class="advertising-statistics-title-group">
            <h2>广告活动的基本统计</h2>
            <a-radio-group v-model="chartMode" type="button" size="small" class="advertising-chart-mode">
              <a-radio value="linear">线性</a-radio>
              <a-radio value="funnel">漏斗</a-radio>
            </a-radio-group>
          </div>
          <div class="advertising-statistics-actions">
            <a-range-picker
              v-model="selectedDateRange"
              :default-value="[campaign.startDate, campaign.endDate]"
              value-format="YYYY-MM-DD"
            />
            <a-select v-model="displayArea">
              <a-option value="all">所有展示区域</a-option>
              <a-option value="search">搜索</a-option>
              <a-option value="catalog">目录</a-option>
            </a-select>
            <a-button type="primary">搜索</a-button>
            <a-button>
              <template #icon>
                <icon-refresh />
              </template>
              刷新
            </a-button>
            <a-button>
              <template #icon>
                <icon-download />
              </template>
              扩展统计
            </a-button>
          </div>
        </div>

        <div class="advertising-kpi-grid advertising-statistics-page-kpi-grid">
          <button
            v-for="card in statisticsMetricCards"
            :key="card.title"
            type="button"
            class="advertising-kpi-card"
            :class="{ 'is-active': selectedMetrics.includes(card.metricKey) }"
            :style="{ '--advertising-kpi-color': card.color }"
            :aria-pressed="selectedMetrics.includes(card.metricKey)"
            @click="toggleMetric(card.metricKey)"
          >
            <span class="advertising-kpi-card-label">
              {{ card.title }}
            </span>
            <span class="advertising-kpi-card-main">
              <strong>{{ card.value }}</strong>
              <span class="advertising-kpi-delta" :class="`is-${card.trend}`">
                {{ card.delta }}
              </span>
            </span>
          </button>
        </div>

        <div class="advertising-chart-card advertising-chart-frame advertising-statistics-page-chart-frame">
          <div class="advertising-chart-stage">
            <AppEChart
              class="advertising-e-chart"
              :option="statisticsChartOption"
              :update-options="statisticsChartUpdateOptions"
              :height="340"
            />
          </div>
        </div>
      </section>

      <section class="advertising-products-section advertising-statistics-products advertising-detail-module-section">
        <div class="advertising-section-header">
          <div>
            <h2>商品统计</h2>
          </div>
        </div>

        <AppDataTable
          :columns="statisticsProductColumns"
          :data="pagedStatisticsProductRows"
          :pagination="false"
          :scroll="{ x: 1166 }"
          :row-class="getStatisticsProductRowClass"
          row-key="displayId"
          size="medium"
          wrapper-class="advertising-statistics-table-wrap"
          table-class="advertising-statistics-table"
        >
          <template #image="{ record }">
            <div class="advertising-product-image">
              <img
                v-if="getAdvertisingProductImage(record.product)"
                :src="getAdvertisingProductImage(record.product)"
                :alt="getAdvertisingProductName(record.product)"
              >
              <span v-else>{{ getAdvertisingProductName(record.product).slice(0, 1) }}</span>
            </div>
          </template>

          <template #product="{ record }">
            <div class="advertising-statistics-product-name">
              <strong>
                {{ record.rowType === 'item' ? getStatisticsItemLabel(record.product) : getAdvertisingProductName(record.product) }}
              </strong>
              <span>{{ record.sku }}</span>
              <button
                v-if="record.rowType === 'group' && record.productCount > 1"
                type="button"
                class="advertising-statistics-product-expand-link"
                @click.stop="toggleStatisticsProductExpansion(record.id)"
              >
                还有 {{ record.productCount - 1 }} 件商品
                <icon-up v-if="expandedStatisticsProductGroupIds.includes(record.id)" />
                <icon-down v-else />
              </button>
            </div>
          </template>

          <template #averageRank="{ record }">
            <span>{{ record.averageRank.toFixed(1) }}</span>
          </template>

          <template #spend="{ record }">
            <span>{{ formatAdvertisingMoney(record.statistics.spend, campaign.currencySymbol) }}</span>
          </template>

          <template #orderAmount="{ record }">
            <span>{{ formatAdvertisingMoney(record.statistics.orderAmount, campaign.currencySymbol) }}</span>
          </template>

          <template #impressions="{ record }">
            <span>{{ formatAdvertisingNumber(record.statistics.impressions) }}</span>
          </template>

          <template #clicks="{ record }">
            <span>{{ formatAdvertisingNumber(record.statistics.clicks) }}</span>
          </template>

          <template #cartAdds="{ record }">
            <span>{{ formatAdvertisingNumber(record.statistics.cartAdds) }}</span>
          </template>
        </AppDataTable>

        <div class="advertising-statistics-pagination">
          <a-pagination
            v-model:current="statisticsProductCurrentPage"
            v-model:page-size="statisticsProductPageSize"
            :total="visibleStatisticsProductRows.length"
            :page-size-options="[10, 20, 50]"
            size="small"
            show-total
            show-jumper
            show-page-size
          />
        </div>
      </section>
    </template>

    <a-empty v-else description="没有找到这个广告活动">
      <a-button type="primary" @click="goBack">返回广告推广</a-button>
    </a-empty>
  </div>
</template>
