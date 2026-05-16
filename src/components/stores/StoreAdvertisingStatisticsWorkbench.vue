<script setup lang="ts">
import { computed, ref } from 'vue'
import { IconDownload, IconRefresh } from '@arco-design/web-vue/es/icon'
import { useRouter } from 'vue-router'
import {
  createStatisticPolylinePoints,
  findAdvertisingCampaignById,
  formatAdvertisingMoney,
  formatAdvertisingNumber,
  getCampaignStatusLabel,
  getCampaignStatusTagColor,
  getStatisticsMetricOptions,
  type AdvertisingStatisticsMetricKey,
} from '../../data/storeAdvertising'
import './storeAdvertising.css'

const props = defineProps<{
  campaignId: string
}>()

const router = useRouter()
const metricOptions = getStatisticsMetricOptions()
const selectedMetrics = ref<AdvertisingStatisticsMetricKey[]>([
  'impressions',
  'clicks',
  'cartAdds',
  'orderedItems',
  'spend',
])
const chartMode = ref<'linear' | 'funnel'>('linear')
const displayArea = ref('all')

const metricColorMap: Record<AdvertisingStatisticsMetricKey, string> = {
  impressions: '#1d4ed8',
  clicks: '#059669',
  cartAdds: '#d97706',
  orderedItems: '#7c3aed',
  spend: '#dc2626',
}

const campaign = computed(() => findAdvertisingCampaignById(props.campaignId))
const chartSeries = computed(() => campaign.value?.statistics ?? [])
const metricLines = computed(() =>
  metricOptions
    .filter((option) => selectedMetrics.value.includes(option.value))
    .map((option) => ({
      ...option,
      color: metricColorMap[option.value],
      points: createStatisticPolylinePoints(chartSeries.value, option.value, 720, 220),
    }))
)
const funnelSteps = computed(() => {
  const totals = chartSeries.value.reduce(
    (summary, point) => ({
      impressions: summary.impressions + point.impressions,
      clicks: summary.clicks + point.clicks,
      cartAdds: summary.cartAdds + point.cartAdds,
      orderedItems: summary.orderedItems + point.orderedItems,
    }),
    {
      impressions: 0,
      clicks: 0,
      cartAdds: 0,
      orderedItems: 0,
    }
  )
  const fallbackOrders = campaign.value?.orders ?? 0
  const steps = [
    { key: 'impressions', label: '展示次数', value: totals.impressions || campaign.value?.impressions || 0 },
    { key: 'clicks', label: '点击次数', value: totals.clicks || campaign.value?.clicks || 0 },
    { key: 'cartAdds', label: '加入购物车', value: totals.cartAdds },
    { key: 'orderedItems', label: '订购商品数量', value: totals.orderedItems || fallbackOrders },
  ]
  const firstValue = steps[0]?.value || 1

  return steps.map((step, index) => {
    const previousValue = index > 0 ? steps[index - 1].value : firstValue

    return {
      ...step,
      width: `${Math.max(step.value / firstValue * 100, step.value > 0 ? 8 : 0)}%`,
      firstRate: `${(step.value / firstValue * 100).toFixed(1)}%`,
      previousRate: `${(previousValue > 0 ? step.value / previousValue * 100 : 0).toFixed(1)}%`,
    }
  })
})

const goBack = () => {
  if (!campaign.value) {
    router.push('/stores/ads')
    return
  }

  router.push(`/stores/ads/${campaign.value.id}`)
}

const getProductStats = (product: NonNullable<typeof campaign.value>['products'][number]) => {
  const impressions = product.searchClusters.reduce((sum, cluster) => sum + cluster.impressions, 0)
  const clicks = product.searchClusters.reduce((sum, cluster) => sum + cluster.clicks, 0)
  const spend = product.searchClusters.reduce((sum, cluster) => sum + cluster.spend, 0)
  const orderedItems = product.searchClusters.reduce((sum, cluster) => sum + cluster.orders, 0)
  const cartAdds = Math.max(Math.round(orderedItems * 1.8), orderedItems)
  const orderAmount = orderedItems * 68

  return {
    spend,
    orderAmount,
    impressions,
    clicks,
    cartAdds,
  }
}

const getProductAverageRank = (index: number) =>
  (index + 1.6).toFixed(1)

const getLastDataText = () => {
  const lastPoint = chartSeries.value.at(-1)

  return lastPoint ? `最近数据 ${lastPoint.date}` : '暂无统计数据'
}
</script>

<template>
  <div class="store-advertising-workbench advertising-statistics-workbench">
    <template v-if="campaign">
      <section class="advertising-page-header advertising-statistics-header">
        <div class="advertising-page-header-copy">
          <a-button type="text" class="advertising-back-button" @click="goBack">
            返回活动详情
          </a-button>
          <div class="advertising-detail-title-row">
            <h1>活动统计</h1>
            <a-tag :color="getCampaignStatusTagColor(campaign.status)">
              {{ getCampaignStatusLabel(campaign.status) }}
            </a-tag>
          </div>
          <p>{{ campaign.campaignName }}</p>
          <div class="advertising-detail-meta">
            <span>ID {{ campaign.id }}</span>
            <span>{{ campaign.platform }}</span>
            <span>{{ campaign.storeName }}</span>
            <span>{{ campaign.campaignType }}</span>
            <span>{{ getLastDataText() }} · 更新于 {{ campaign.endDate }}</span>
          </div>
        </div>

        <div class="advertising-page-header-actions">
          <a-button>
            <template #icon>
              <icon-download />
            </template>
            导出
          </a-button>
        </div>
      </section>

      <section class="advertising-filter-row advertising-statistics-filter">
        <a-range-picker :default-value="[campaign.startDate, campaign.endDate]" value-format="YYYY-MM-DD" />
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
      </section>

      <section class="advertising-chart-card advertising-statistics-chart-card">
        <div class="advertising-section-header">
          <div>
            <h2>趋势</h2>
            <p>{{ campaign.startDate }} - {{ campaign.endDate }}</p>
          </div>
          <a-radio-group v-model="chartMode" type="button">
            <a-radio value="linear">线性</a-radio>
            <a-radio value="funnel">漏斗</a-radio>
          </a-radio-group>
        </div>

        <template v-if="chartMode === 'linear'">
          <svg class="advertising-chart-svg" viewBox="0 0 720 220" role="img" aria-label="广告活动的基本统计">
            <g class="advertising-chart-grid">
              <line x1="0" y1="0" x2="720" y2="0" />
              <line x1="0" y1="55" x2="720" y2="55" />
              <line x1="0" y1="110" x2="720" y2="110" />
              <line x1="0" y1="165" x2="720" y2="165" />
              <line x1="0" y1="220" x2="720" y2="220" />
            </g>
            <polyline
              v-for="line in metricLines"
              :key="line.value"
              :points="line.points"
              fill="none"
              :stroke="line.color"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>

          <a-checkbox-group v-model="selectedMetrics" class="advertising-statistics-metric-group">
            <a-checkbox v-for="option in metricOptions" :key="option.value" :value="option.value">
              <span class="advertising-statistics-metric-dot" :style="{ backgroundColor: metricColorMap[option.value] }" />
              {{ option.label }}
            </a-checkbox>
          </a-checkbox-group>
        </template>

        <div v-else class="advertising-statistics-funnel" role="list" aria-label="广告活动的基本统计">
          <div
            v-for="step in funnelSteps"
            :key="step.key"
            class="advertising-statistics-funnel-step"
            role="listitem"
          >
            <div class="advertising-statistics-funnel-copy">
              <strong>{{ step.label }}</strong>
              <span>{{ formatAdvertisingNumber(step.value) }}</span>
            </div>
            <div class="advertising-statistics-funnel-track">
              <div class="advertising-statistics-funnel-bar" :style="{ width: step.width }" />
            </div>
            <div class="advertising-statistics-funnel-rates">
              <span>占展示 {{ step.firstRate }}</span>
              <span>较上一步 {{ step.previousRate }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="advertising-products-section advertising-statistics-products">
        <div class="advertising-section-header">
          <div>
            <h2>广告活动的基本统计</h2>
            <p>{{ campaign.products.length }} 个商品</p>
          </div>
        </div>

        <div class="advertising-statistics-table-wrap">
          <table class="advertising-statistics-table">
            <thead>
              <tr>
                <th>照片</th>
                <th>产品名称</th>
                <th>平均排名</th>
                <th>花费</th>
                <th>订单金额</th>
                <th>展示次数</th>
                <th>点击次数</th>
                <th>添加到购物车</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(product, index) in campaign.products" :key="product.id">
                <td>
                  <div class="advertising-product-image">
                    <img v-if="product.image" :src="product.image" :alt="product.name">
                    <span v-else>{{ product.name.slice(0, 1) }}</span>
                  </div>
                </td>
                <td>
                  <div class="advertising-statistics-product-name">
                    <strong>{{ product.name }}</strong>
                    <span>{{ product.sku }}</span>
                  </div>
                </td>
                <td>{{ getProductAverageRank(index) }}</td>
                <td>{{ formatAdvertisingMoney(getProductStats(product).spend, campaign.currencySymbol) }}</td>
                <td>{{ formatAdvertisingMoney(getProductStats(product).orderAmount, campaign.currencySymbol) }}</td>
                <td>{{ formatAdvertisingNumber(getProductStats(product).impressions) }}</td>
                <td>{{ formatAdvertisingNumber(getProductStats(product).clicks) }}</td>
                <td>{{ formatAdvertisingNumber(getProductStats(product).cartAdds) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>

    <a-empty v-else description="没有找到这个广告活动">
      <a-button type="primary" @click="goBack">返回广告推广</a-button>
    </a-empty>
  </div>
</template>
