<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Message, type TableColumnData } from '@arco-design/web-vue'
import {
  IconBarChart,
  IconCopy,
  IconDownload,
  IconDown,
  IconEdit,
  IconMore,
  IconPlus,
  IconUp,
} from '@arco-design/web-vue/es/icon'
import { useRouter } from 'vue-router'
import type { EChartsOption } from 'echarts'
import AppDataTable from '../common/AppDataTable.vue'
import AppEChart from '../common/AppEChart.vue'
import SecondaryPageHeader from '../common/SecondaryPageHeader.vue'
import {
  filterAdvertisingProductClusters,
  findAdvertisingCampaignById,
  formatAdvertisingMoney,
  formatAdvertisingNumber,
  getCampaignStatusLabel,
  getCampaignStatusTagColor,
  type AdvertisingCampaignProduct,
  type AdvertisingMetricPoint,
  type AdvertisingSearchCluster,
  type AdvertisingStatisticsMetricKey,
} from '../../data/storeAdvertising'
import { useProductCatalogStore } from '../../data/productCatalog'
import './storeAdvertising.css'

type ClusterFilterValue = 'active' | 'inactive' | 'all'
type DetailMetricKey = AdvertisingStatisticsMetricKey | 'spendRatio'
type DetailMetricTrend = 'up' | 'down' | 'flat'
type DetailStatisticCard = {
  title: string
  metricKey: DetailMetricKey
  value: string
  delta: string
  trend: DetailMetricTrend
  color: string
}

const props = defineProps<{
  campaignId: string
}>()

const router = useRouter()
const catalogStore = useProductCatalogStore()
const expandedProductIds = ref<string[]>([])
const clusterFilter = ref<ClusterFilterValue>('all')
const clusterCurrentPage = ref(1)
const clusterPageSize = ref(10)
const activeClusterTab = ref<'clusters' | 'recommended'>('clusters')
const campaignNameOverride = ref('')
const campaignNameDraft = ref('')
const editNameVisible = ref(false)
const historyVisible = ref(false)
const selectedDetailMetrics = ref<DetailMetricKey[]>(['impressions', 'clicks'])
const selectedDetailDateRange = ref<string[]>([])
const budgetAutoTopUpEnabled = ref(false)

const campaign = computed(() => findAdvertisingCampaignById(props.campaignId))
const productBySku = computed(() =>
  new Map(catalogStore.products.value.map((product) => [product.basicInfo.sku, product]))
)
const summaryPoints = computed(() => campaign.value?.statistics ?? [])
const filteredSummaryPoints = computed(() => {
  const [startDate, endDate] = selectedDetailDateRange.value

  if (!startDate || !endDate) return summaryPoints.value

  return summaryPoints.value.filter((point) => point.date >= startDate && point.date <= endDate)
})
const displayCampaignName = computed(() => campaignNameOverride.value || campaign.value?.campaignName || '')

const formatAdvertisingDetailDate = (date: string) => date.replace(/-/g, '/')
const formatAdvertisingPercent = (value: number) =>
  `${value.toFixed(1)}%`

const campaignUpdatedAt = computed(() => {
  if (!campaign.value) return ''

  return `${formatAdvertisingDetailDate(campaign.value.startDate)} 15:25`
})

const budgetBalance = computed(() => {
  if (!campaign.value) return formatAdvertisingMoney(0)

  return formatAdvertisingMoney(
    Math.max(campaign.value.budget - campaign.value.spend, 0),
    campaign.value.currencySymbol
  )
})

const detailStatisticCards = computed<DetailStatisticCard[]>(() => {
  if (!campaign.value) return []

  const record = campaign.value

  return [
    {
      title: '展示次数',
      metricKey: 'impressions',
      value: formatAdvertisingNumber(record.impressions),
      delta: '214.3%',
      trend: 'up',
      color: '#165dff',
    },
    {
      title: '点击次数',
      metricKey: 'clicks',
      value: formatAdvertisingNumber(record.clicks),
      delta: '285.8%',
      trend: 'up',
      color: '#24E0FF',
    },
    {
      title: '订单',
      metricKey: 'orderedItems',
      value: formatAdvertisingNumber(record.orders),
      delta: '260.2%',
      trend: 'up',
      color: '#14c9c9',
    },
    {
      title: '花费比例',
      metricKey: 'spendRatio',
      value: formatAdvertisingPercent(record.budget > 0 ? record.spend / record.budget * 100 : 0),
      delta: '506.8%',
      trend: 'up',
      color: '#f53f3f',
    },
  ]
})

const selectedDetailStatisticCards = computed(() =>
  detailStatisticCards.value.filter((card) => selectedDetailMetrics.value.includes(card.metricKey))
)

const detailChartUpdateOptions = { replaceMerge: ['series', 'xAxis', 'yAxis', 'dataZoom'] }

const toggleDetailMetric = (metricKey: DetailMetricKey) => {
  const currentMetrics = selectedDetailMetrics.value

  if (currentMetrics.includes(metricKey)) {
    if (currentMetrics.length === 1) return

    selectedDetailMetrics.value = currentMetrics.filter((currentMetric) => currentMetric !== metricKey)
    return
  }

  selectedDetailMetrics.value = [...currentMetrics, metricKey]
}

const getDetailMetricPointValue = (point: AdvertisingMetricPoint, metricKey: DetailMetricKey) => {
  if (metricKey === 'spendRatio') {
    const budget = campaign.value?.budget ?? 0

    return budget > 0 ? point.spend / budget * 100 : 0
  }

  return point[metricKey]
}

const detailChartOption = computed<EChartsOption>(() => {
  const points = filteredSummaryPoints.value
  const labels = points.map((point) => point.date.slice(5).replace('-', '.'))
  const activeCards = selectedDetailStatisticCards.value.length > 0
    ? selectedDetailStatisticCards.value
    : detailStatisticCards.value.slice(0, 1)
  const currencySymbol = campaign.value?.currencySymbol
  const shouldFormatCurrency = activeCards.length === 1 && activeCards[0]?.metricKey === 'spend'
  const shouldFormatPercent = activeCards.length === 1 && activeCards[0]?.metricKey === 'spendRatio'

  return {
    color: activeCards.map((card) => card.color),
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value) => {
        const numericValue = Number(value)

        if (Number.isNaN(numericValue)) return String(value)
        if (shouldFormatCurrency) return formatAdvertisingMoney(numericValue, currencySymbol)
        if (shouldFormatPercent) return formatAdvertisingPercent(numericValue)

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
            : shouldFormatPercent
              ? formatAdvertisingPercent(value)
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
      data: points.map((point) => getDetailMetricPointValue(point, card.metricKey)),
    })),
  }
})

const changeHistoryItems = computed(() => {
  if (!campaign.value) return []

  return [
    {
      time: `${formatAdvertisingDetailDate(campaign.value.startDate)} 15:25`,
      title: '活动创建',
      description: `${displayCampaignName.value} 开始投放`,
    },
    {
      time: `${formatAdvertisingDetailDate(campaign.value.endDate)} 10:30`,
      title: '预算调整',
      description: `总预算调整为 ${formatAdvertisingMoney(campaign.value.budget, campaign.value.currencySymbol)}`,
    },
    {
      time: `${formatAdvertisingDetailDate(campaign.value.endDate)} 16:00`,
      title: '状态更新',
      description: `活动状态更新为 ${getCampaignStatusLabel(campaign.value.status)}`,
    },
  ]
})

const clusterColumns: TableColumnData[] = [
  { title: '集群', dataIndex: 'query', slotName: 'query', width: 180 },
  { title: '平均排名', dataIndex: 'rank', slotName: 'rank', width: 110, align: 'right' },
  { title: '展示次数', dataIndex: 'impressions', slotName: 'impressions', width: 130, align: 'right' },
  { title: '点击次数', dataIndex: 'clicks', slotName: 'clicks', width: 120, align: 'right' },
  { title: '购物车', dataIndex: 'cartAdds', slotName: 'cartAdds', width: 110, align: 'right' },
  { title: '订购商品数量', dataIndex: 'orders', slotName: 'orders', width: 140, align: 'right' },
  { title: '花费', dataIndex: 'spend', slotName: 'spend', width: 120, align: 'right' },
  { title: 'CTR', dataIndex: 'ctr', slotName: 'ctr', width: 100, align: 'right' },
  { title: 'CPM', dataIndex: 'cpm', slotName: 'cpm', width: 100, align: 'right' },
]

const clusterTableScroll = { x: 1110 }

const productColumns: TableColumnData[] = [
  { title: '图片', dataIndex: 'image', slotName: 'image', width: 72, minWidth: 64, align: 'center' },
  { title: '名称 · 品牌 · SKU', dataIndex: 'sku', slotName: 'product', minWidth: 260 },
  { title: '出价 (CPM)', dataIndex: 'bid', slotName: 'bid', width: 152, minWidth: 136, align: 'right' },
  { title: '操作', slotName: 'operation', width: 136, minWidth: 124, align: 'center' },
]

const productTableScroll = { x: 620 }

const getCatalogProduct = (product?: AdvertisingCampaignProduct) =>
  product ? productBySku.value.get(product.sku) : undefined

const getAdvertisingProductName = (product?: AdvertisingCampaignProduct) =>
  getCatalogProduct(product)?.basicInfo.chineseName ?? product?.sku ?? ''

const getAdvertisingProductBrand = (product?: AdvertisingCampaignProduct) =>
  getCatalogProduct(product)?.basicInfo.brand || '未设置品牌'

const getAdvertisingProductImage = (product?: AdvertisingCampaignProduct) =>
  getCatalogProduct(product)?.basicInfo.mainImage

const getProductBid = (index: number) => {
  if (!campaign.value) return '¥0'

  return formatAdvertisingMoney(42 + index * 6, campaign.value.currencySymbol)
}

const getProductRowClass = (record: AdvertisingCampaignProduct) =>
  expandedProductIds.value.includes(record.id) ? 'is-expanded-product-row' : ''

const getRecommendedProducts = (productId: string) =>
  campaign.value?.products.filter((product) => product.id !== productId).slice(0, 3) ?? []

const filterProductClusters = (clusters: AdvertisingSearchCluster[]) => {
  if (clusterFilter.value === 'active') {
    return filterAdvertisingProductClusters(clusters, { state: 'active', keyword: '' })
  }

  if (clusterFilter.value === 'all') {
    return filterAdvertisingProductClusters(clusters, { keyword: '' })
  }

  return clusters.filter((cluster) => cluster.state !== 'active')
}

const getPagedProductClusters = (clusters: AdvertisingSearchCluster[]) => {
  const startIndex = (clusterCurrentPage.value - 1) * clusterPageSize.value

  return filterProductClusters(clusters).slice(startIndex, startIndex + clusterPageSize.value)
}

const getClusterRank = (rowIndex: number) =>
  (clusterCurrentPage.value - 1) * clusterPageSize.value + rowIndex + 1

const getClusterCtr = (impressions: number, clicks: number) =>
  impressions > 0 ? `${(clicks / impressions * 100).toFixed(1)}%` : '0.0%'

const getClusterCpm = (impressions: number, spend: number) => {
  if (!campaign.value || impressions === 0) return formatAdvertisingMoney(0)

  return formatAdvertisingMoney(spend / impressions * 1000, campaign.value.currencySymbol)
}

const toggleExpandedProduct = (productId: string) => {
  if (expandedProductIds.value.includes(productId)) {
    expandedProductIds.value = expandedProductIds.value.filter((expandedProductId) => expandedProductId !== productId)
    return
  }

  expandedProductIds.value = [...expandedProductIds.value, productId]
  clusterCurrentPage.value = 1
}

const openCampaignNameEditor = () => {
  campaignNameDraft.value = displayCampaignName.value
  editNameVisible.value = true
}

const closeCampaignNameEditor = () => {
  campaignNameDraft.value = ''
}

const saveCampaignName = () => {
  const nextName = campaignNameDraft.value.trim()

  if (!nextName) {
    Message.warning('请填写活动名称')
    return false
  }

  campaignNameOverride.value = nextName
  Message.success('活动名称已更新')
  return true
}

const copyCampaignId = async () => {
  if (!campaign.value) return

  try {
    await navigator.clipboard.writeText(campaign.value.id)
    Message.success(`已复制 ${campaign.value.id}`)
  } catch {
    Message.warning('复制失败，请手动复制活动 ID')
  }
}

const showChangeHistory = () => {
  historyVisible.value = true
}

const goBack = () => {
  router.push('/stores/ads')
}

const goStatistics = () => {
  if (!campaign.value) return

  router.push(`/stores/ads/${campaign.value.id}/statistics`)
}

watch(campaign, (nextCampaign) => {
  budgetAutoTopUpEnabled.value = nextCampaign?.budgetStatus === 'healthy'
  selectedDetailDateRange.value = nextCampaign ? [nextCampaign.startDate, nextCampaign.endDate] : []
}, { immediate: true })

watch(() => props.campaignId, () => {
  campaignNameOverride.value = ''
  campaignNameDraft.value = ''
  editNameVisible.value = false
  historyVisible.value = false
  clusterCurrentPage.value = 1
})

watch(clusterFilter, () => {
  clusterCurrentPage.value = 1
})

watch(clusterPageSize, () => {
  clusterCurrentPage.value = 1
})
</script>

<template>
  <div class="store-advertising-workbench advertising-detail-workbench">
    <template v-if="campaign">
      <SecondaryPageHeader title="活动详情" @back="goBack" />

      <section class="advertising-detail-overview-card">
        <div class="advertising-detail-overview-main">
          <div class="advertising-detail-overview-profile">
            <span class="advertising-detail-overview-thumb">
              <img
                v-if="getAdvertisingProductImage(campaign.products[0])"
                :src="getAdvertisingProductImage(campaign.products[0])"
                :alt="getAdvertisingProductName(campaign.products[0]) || displayCampaignName"
              />
              <span v-else>{{ (getAdvertisingProductName(campaign.products[0]) || displayCampaignName).slice(0, 1) }}</span>
            </span>

            <div class="advertising-detail-overview-identity">
              <div class="advertising-detail-overview-title-row">
                <strong>{{ displayCampaignName }}</strong>
                <a-tooltip content="编辑活动名称">
                  <a-button
                    type="text"
                    size="mini"
                    class="advertising-detail-title-edit-button"
                    @click="openCampaignNameEditor"
                  >
                    <template #icon>
                      <icon-edit />
                    </template>
                  </a-button>
                </a-tooltip>
              </div>
              <div class="advertising-detail-overview-description advertising-detail-meta-row">
                <a-tag size="small" :color="getCampaignStatusTagColor(campaign.status)">
                  {{ getCampaignStatusLabel(campaign.status) }}
                </a-tag>
                <a-tag size="small" color="gray">{{ campaign.campaignType }}</a-tag>
                <span class="advertising-detail-meta-id">
                  ID {{ campaign.id }}
                  <a-tooltip content="复制活动 ID">
                    <a-button
                      type="text"
                      size="mini"
                      class="advertising-detail-id-copy-button"
                      @click="copyCampaignId"
                    >
                      <template #icon>
                        <icon-copy />
                      </template>
                    </a-button>
                  </a-tooltip>
                </span>
                <span>{{ campaignUpdatedAt }}</span>
                <a-button
                  type="text"
                  size="mini"
                  class="advertising-detail-history-button"
                  @click="showChangeHistory"
                >
                  <template #icon>
                    <icon-download />
                  </template>
                  变更历史
                </a-button>
              </div>
            </div>
          </div>

          <div class="advertising-detail-overview-actions">
            <a-button>{{ campaign.status === 'active' ? '暂停' : '继续' }}</a-button>
            <a-button type="primary">完成</a-button>
          </div>
        </div>

        <div class="advertising-detail-overview-divider" />

        <div class="advertising-detail-budget-row">
          <div class="advertising-detail-budget-item">
            <span>预算余额</span>
            <strong class="advertising-detail-budget-balance">{{ budgetBalance }}</strong>
          </div>
          <div class="advertising-detail-budget-separator" role="separator" aria-hidden="true" />
          <div class="advertising-detail-budget-item">
            <span>总预算</span>
            <strong>{{ formatAdvertisingMoney(campaign.budget, campaign.currencySymbol) }}</strong>
          </div>
          <div class="advertising-detail-budget-separator" role="separator" aria-hidden="true" />
          <div class="advertising-budget-switch">
            <a-switch v-model="budgetAutoTopUpEnabled" />
            <span>自动补充预算</span>
          </div>
          <div class="advertising-detail-budget-actions">
            <a-button>修改预算</a-button>
          </div>
        </div>
      </section>

      <section class="advertising-statistics-section advertising-detail-module-section">
        <div class="advertising-statistics-heading">
          <div class="advertising-statistics-title-group">
            <h2>统计</h2>
          </div>
          <div class="advertising-statistics-actions">
            <a-range-picker v-model="selectedDetailDateRange" value-format="YYYY-MM-DD" />
            <a-button @click="goStatistics">
              <template #icon>
                <icon-bar-chart />
              </template>
              完整统计
            </a-button>
          </div>
        </div>

        <div class="advertising-kpi-grid">
          <button
            v-for="card in detailStatisticCards"
            :key="card.title"
            type="button"
            class="advertising-kpi-card"
            :class="{ 'is-active': selectedDetailMetrics.includes(card.metricKey) }"
            :style="{ '--advertising-kpi-color': card.color }"
            :aria-pressed="selectedDetailMetrics.includes(card.metricKey)"
            @click="toggleDetailMetric(card.metricKey)"
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

        <div class="advertising-chart-card advertising-chart-frame">
          <div class="advertising-chart-stage">
            <AppEChart
              class="advertising-e-chart"
              :option="detailChartOption"
              :update-options="detailChartUpdateOptions"
              :height="340"
            />
          </div>
        </div>
      </section>

      <section class="advertising-products-section advertising-detail-module-section">
        <div class="advertising-section-header">
          <div>
            <h2>商品</h2>
          </div>
          <div class="advertising-section-actions">
            <a-button type="primary">
              <template #icon>
                <icon-plus />
              </template>
              添加商品
            </a-button>
            <a-button>上传</a-button>
          </div>
        </div>

        <AppDataTable
          v-model:expanded-keys="expandedProductIds"
          :columns="productColumns"
          :data="campaign.products"
          :pagination="false"
          :scroll="productTableScroll"
          row-key="id"
          :row-class="getProductRowClass"
          size="medium"
          wrapper-class="advertising-products-table-shell"
          table-class="advertising-products-table"
          highlight-column-on-header-hover
        >
          <template #image="{ record }">
            <div class="advertising-products-table-image-cell">
              <div class="advertising-product-image">
                <img
                  v-if="getAdvertisingProductImage(record)"
                  :src="getAdvertisingProductImage(record)"
                  :alt="getAdvertisingProductName(record)"
                >
                <span v-else>{{ getAdvertisingProductName(record).slice(0, 1) }}</span>
              </div>
            </div>
          </template>

          <template #product="{ record }">
            <div class="advertising-products-table-product">
              <div class="advertising-product-main">
                <strong>{{ getAdvertisingProductName(record) }}</strong>
                <span>{{ getAdvertisingProductBrand(record) }} · {{ record.sku }}</span>
              </div>
            </div>
          </template>

          <template #bid="{ rowIndex }">
            <span class="advertising-products-bid-text">{{ getProductBid(rowIndex) }}</span>
          </template>

          <template #operation="{ record }">
            <div class="advertising-product-actions">
              <a-button shape="circle" @click="goStatistics">
                <template #icon>
                  <icon-bar-chart />
                </template>
              </a-button>
              <a-button shape="circle">
                <template #icon>
                  <icon-more />
                </template>
              </a-button>
              <a-button
                shape="circle"
                class="advertising-product-expand-button"
                :aria-label="expandedProductIds.includes(record.id) ? '收起商品详情' : '展开商品详情'"
                @click="toggleExpandedProduct(record.id)"
              >
                <template #icon>
                  <icon-up v-if="expandedProductIds.includes(record.id)" />
                  <icon-down v-else />
                </template>
              </a-button>
            </div>
          </template>

          <template #expand-row="{ record }">
            <div class="advertising-product-expanded">
              <div class="advertising-expanded-toolbar">
                <a-tabs
                  v-model:active-key="activeClusterTab"
                  type="line"
                  hide-content
                  class="advertising-expanded-tabs"
                >
                  <a-tab-pane key="clusters" title="搜索词集群" />
                  <a-tab-pane key="recommended" title="推荐商品" />
                </a-tabs>
                <div class="advertising-expanded-actions">
                  <a-button disabled>集群管理</a-button>
                  <a-button>
                    <template #icon>
                      <icon-download />
                    </template>
                    下载
                  </a-button>
                  <a-range-picker :default-value="[campaign.startDate, campaign.endDate]" value-format="YYYY-MM-DD" />
                </div>
              </div>

              <template v-if="activeClusterTab === 'clusters'">
                <div class="advertising-cluster-filter-row">
                  <a-tabs
                    v-model:active-key="clusterFilter"
                    type="rounded"
                    hide-content
                    class="advertising-cluster-state-tabs"
                  >
                    <a-tab-pane key="all" title="全部" />
                    <a-tab-pane key="active" title="活跃" />
                    <a-tab-pane key="inactive" title="不活跃" />
                  </a-tabs>
                </div>

                <a-table
                  :columns="clusterColumns"
                  :data="getPagedProductClusters(record.searchClusters)"
                  :pagination="false"
                  :scroll="clusterTableScroll"
                  class="advertising-cluster-table"
                  row-key="id"
                >
                  <template #query="{ record }">
                    <span>{{ record.query }}</span>
                  </template>
                  <template #rank="{ rowIndex }">
                    <span>{{ getClusterRank(rowIndex) }}</span>
                  </template>
                  <template #impressions="{ record }">
                    <span>{{ formatAdvertisingNumber(record.impressions) }}</span>
                  </template>
                  <template #clicks="{ record }">
                    <span>{{ formatAdvertisingNumber(record.clicks) }}</span>
                  </template>
                  <template #cartAdds="{ record }">
                    <span>{{ formatAdvertisingNumber(Math.max(Math.round(record.orders * 1.8), record.orders)) }}</span>
                  </template>
                  <template #orders="{ record }">
                    <span>{{ formatAdvertisingNumber(record.orders) }}</span>
                  </template>
                  <template #spend="{ record }">
                    <span>{{ formatAdvertisingMoney(record.spend, campaign.currencySymbol) }}</span>
                  </template>
                  <template #ctr="{ record }">
                    <span>{{ getClusterCtr(record.impressions, record.clicks) }}</span>
                  </template>
                  <template #cpm="{ record }">
                    <span>{{ getClusterCpm(record.impressions, record.spend) }}</span>
                  </template>
                </a-table>
                <div class="advertising-cluster-pagination">
                  <a-pagination
                    v-model:current="clusterCurrentPage"
                    v-model:page-size="clusterPageSize"
                    :total="filterProductClusters(record.searchClusters).length"
                    :page-size-options="[10, 20, 50]"
                    size="small"
                    show-total
                    show-jumper
                    show-page-size
                  />
                </div>
              </template>

              <div v-else class="advertising-recommended-products">
                <div
                  v-for="recommendedProduct in getRecommendedProducts(record.id)"
                  :key="recommendedProduct.id"
                  class="advertising-recommended-product"
                >
                  <div class="advertising-recommended-product-info">
                    <div class="advertising-product-image">
                      <img
                        v-if="getAdvertisingProductImage(recommendedProduct)"
                        :src="getAdvertisingProductImage(recommendedProduct)"
                        :alt="getAdvertisingProductName(recommendedProduct)"
                      >
                      <span v-else>{{ getAdvertisingProductName(recommendedProduct).slice(0, 1) }}</span>
                    </div>
                    <div class="advertising-product-main">
                      <strong>{{ getAdvertisingProductName(recommendedProduct) }}</strong>
                      <span>{{ getAdvertisingProductBrand(recommendedProduct) }} · {{ recommendedProduct.sku }}</span>
                    </div>
                  </div>

                  <div class="advertising-recommended-product-metric">
                    <span>词集</span>
                    <strong>{{ recommendedProduct.searchClusters.length }}</strong>
                  </div>
                  <a-button>添加</a-button>
                </div>
              </div>
            </div>
          </template>
        </AppDataTable>
      </section>

      <a-modal
        v-model:visible="editNameVisible"
        title="编辑活动名称"
        width="600px"
        simple
        align-center
        title-align="start"
        modal-class="advertising-detail-name-modal"
        :on-before-ok="saveCampaignName"
        @cancel="closeCampaignNameEditor"
      >
        <a-form :model="{ campaignName: campaignNameDraft }" layout="vertical" class="advertising-detail-name-form">
          <a-form-item label="活动名称" required>
            <a-input
              v-model="campaignNameDraft"
              allow-clear
              placeholder="请输入活动名称"
            />
          </a-form-item>
        </a-form>
      </a-modal>

      <a-drawer
        v-model:visible="historyVisible"
        title="变更历史"
        width="420px"
        class="advertising-detail-history-drawer"
      >
        <div class="advertising-detail-history-list">
          <div
            v-for="item in changeHistoryItems"
            :key="`${item.time}-${item.title}`"
            class="advertising-detail-history-item"
          >
            <span>{{ item.time }}</span>
            <strong>{{ item.title }}</strong>
            <p>{{ item.description }}</p>
          </div>
        </div>
      </a-drawer>
    </template>

    <a-empty v-else description="没有找到这个广告活动">
      <a-button type="primary" @click="goBack">返回广告推广</a-button>
    </a-empty>
  </div>
</template>
