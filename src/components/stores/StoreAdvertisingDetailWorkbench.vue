<script setup lang="ts">
import { computed, ref } from 'vue'
import { IconBarChart, IconDownload, IconMore, IconPlus, IconUp, IconDown } from '@arco-design/web-vue/es/icon'
import type { TableColumnData } from '@arco-design/web-vue'
import { useRouter } from 'vue-router'
import {
  createStatisticPolylinePoints,
  filterAdvertisingProductClusters,
  findAdvertisingCampaignById,
  formatAdvertisingMoney,
  formatAdvertisingNumber,
  getCampaignStatusLabel,
  getCampaignStatusTagColor,
  type AdvertisingSearchCluster,
} from '../../data/storeAdvertising'
import './storeAdvertising.css'

type ClusterFilterValue = 'active' | 'inactive' | 'all'

const props = defineProps<{
  campaignId: string
}>()

const router = useRouter()
const expandedProductIds = ref<string[]>([])
const clusterFilter = ref<ClusterFilterValue>('active')
const clusterKeyword = ref('')
const activeClusterTab = ref<'clusters' | 'recommended'>('clusters')

const campaign = computed(() => findAdvertisingCampaignById(props.campaignId))
const summaryPoints = computed(() => campaign.value?.statistics ?? [])
const summaryLine = computed(() => createStatisticPolylinePoints(summaryPoints.value, 'impressions', 720, 220))

const budgetBalance = computed(() => {
  if (!campaign.value) return formatAdvertisingMoney(0)

  return formatAdvertisingMoney(
    Math.max(campaign.value.budget - campaign.value.spend, 0),
    campaign.value.currencySymbol
  )
})

const spendRatio = computed(() => {
  if (!campaign.value || campaign.value.budget === 0) return '0.0%'

  return `${(campaign.value.spend / campaign.value.budget * 100).toFixed(1)}%`
})

const clusterColumns: TableColumnData[] = [
  { title: '集群', dataIndex: 'query', slotName: 'query', width: 180 },
  { title: '平均排名', dataIndex: 'rank', slotName: 'rank', align: 'right' },
  { title: '展示次数', dataIndex: 'impressions', slotName: 'impressions', align: 'right' },
  { title: '点击次数', dataIndex: 'clicks', slotName: 'clicks', align: 'right' },
  { title: '购物车', dataIndex: 'cartAdds', slotName: 'cartAdds', align: 'right' },
  { title: '订购商品数量', dataIndex: 'orders', slotName: 'orders', align: 'right' },
  { title: '花费', dataIndex: 'spend', slotName: 'spend', align: 'right' },
  { title: 'CTR', dataIndex: 'ctr', slotName: 'ctr', align: 'right' },
  { title: 'CPM', dataIndex: 'cpm', slotName: 'cpm', align: 'right' },
]

const getProductBid = (index: number) => {
  if (!campaign.value) return '¥0'

  return formatAdvertisingMoney(42 + index * 6, campaign.value.currencySymbol)
}

const getProductPlacement = (index: number) =>
  index % 2 === 0 ? '搜索结果顶部' : '商品详情推荐'

const getRecommendedProducts = (productId: string) =>
  campaign.value?.products.filter((product) => product.id !== productId).slice(0, 3) ?? []

const filterProductClusters = (clusters: AdvertisingSearchCluster[]) => {
  const keyword = clusterKeyword.value.trim().toLowerCase()

  if (clusterFilter.value === 'active') {
    return filterAdvertisingProductClusters(clusters, { state: 'active', keyword: clusterKeyword.value })
  }

  if (clusterFilter.value === 'all') {
    return filterAdvertisingProductClusters(clusters, { keyword: clusterKeyword.value })
  }

  return clusters.filter((cluster) =>
    cluster.state !== 'active' &&
    (!keyword || cluster.query.toLowerCase().includes(keyword))
  )
}

const getClusterCtr = (impressions: number, clicks: number) =>
  impressions > 0 ? `${(clicks / impressions * 100).toFixed(1)}%` : '0.0%'

const getClusterCpm = (impressions: number, spend: number) => {
  if (!campaign.value || impressions === 0) return formatAdvertisingMoney(0)

  return formatAdvertisingMoney(spend / impressions * 1000, campaign.value.currencySymbol)
}

const toggleExpandedProduct = (productId: string) => {
  expandedProductIds.value = expandedProductIds.value.includes(productId) ? [] : [productId]
}

const goBack = () => {
  router.push('/stores/ads')
}

const goStatistics = () => {
  if (!campaign.value) return

  router.push(`/stores/ads/${campaign.value.id}/statistics`)
}
</script>

<template>
  <div class="store-advertising-workbench advertising-detail-workbench">
    <template v-if="campaign">
      <section class="advertising-page-header advertising-detail-header">
        <div class="advertising-page-header-copy">
          <a-button type="text" class="advertising-back-button" @click="goBack">
            返回广告推广
          </a-button>
          <div class="advertising-detail-title-row">
            <h1>{{ campaign.campaignName }}</h1>
            <a-tag :color="getCampaignStatusTagColor(campaign.status)">
              {{ getCampaignStatusLabel(campaign.status) }}
            </a-tag>
          </div>
          <div class="advertising-detail-meta">
            <span>{{ campaign.platform }}</span>
            <span>{{ campaign.storeName }}</span>
            <span>{{ campaign.campaignType }}</span>
            <span>ID {{ campaign.id }}</span>
            <span>更新于 {{ campaign.endDate }}</span>
          </div>
        </div>

        <div class="advertising-page-header-actions">
          <a-button>{{ campaign.status === 'active' ? '暂停' : '继续' }}</a-button>
          <a-button type="primary">完成</a-button>
        </div>
      </section>

      <section class="advertising-detail-budget-card">
        <div>
          <span>预算余额</span>
          <strong>{{ budgetBalance }}</strong>
        </div>
        <div>
          <span>总预算</span>
          <strong>{{ formatAdvertisingMoney(campaign.budget, campaign.currencySymbol) }}</strong>
        </div>
        <div class="advertising-budget-switch">
          <a-switch :model-value="campaign.budgetStatus === 'healthy'" />
          <span>自动补充预算</span>
        </div>
        <a-button>修改预算</a-button>
      </section>

      <section class="advertising-statistics-section">
        <div class="advertising-section-header">
          <div>
            <h2>统计</h2>
            <p>{{ campaign.startDate }} - {{ campaign.endDate }}</p>
          </div>
          <div class="advertising-section-actions">
            <a-range-picker :default-value="[campaign.startDate, campaign.endDate]" value-format="YYYY-MM-DD" />
            <a-button @click="goStatistics">
              <template #icon>
                <icon-bar-chart />
              </template>
              完整统计
            </a-button>
          </div>
        </div>

        <div class="advertising-kpi-grid">
          <div class="advertising-kpi-card">
            <span>展示次数</span>
            <strong>{{ formatAdvertisingNumber(campaign.impressions) }}</strong>
          </div>
          <div class="advertising-kpi-card">
            <span>点击次数</span>
            <strong>{{ formatAdvertisingNumber(campaign.clicks) }}</strong>
          </div>
          <div class="advertising-kpi-card">
            <span>订单</span>
            <strong>{{ formatAdvertisingNumber(campaign.orders) }}</strong>
          </div>
          <div class="advertising-kpi-card">
            <span>花费比例</span>
            <strong>{{ spendRatio }}</strong>
          </div>
        </div>

        <div class="advertising-chart-card">
          <svg class="advertising-chart-svg" viewBox="0 0 720 220" role="img" aria-label="展示次数趋势">
            <polyline
              :points="summaryLine"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </section>

      <section class="advertising-products-section">
        <div class="advertising-section-header">
          <div>
            <h2>商品</h2>
            <p>{{ campaign.products.length }} 个商品</p>
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

        <div class="advertising-product-list">
          <div
            v-for="(product, index) in campaign.products"
            :key="product.id"
            class="advertising-product-card"
          >
            <div class="advertising-product-row">
              <div class="advertising-product-image">
                <img v-if="product.image" :src="product.image" :alt="product.name">
                <span v-else>{{ product.name.slice(0, 1) }}</span>
              </div>
              <div class="advertising-product-main">
                <strong>{{ product.name }}</strong>
                <span>{{ campaign.platform }} · {{ campaign.storeName }} · {{ product.sku }}</span>
              </div>
              <div class="advertising-product-metric">
                <span>出价</span>
                <strong>{{ getProductBid(index) }}</strong>
              </div>
              <div class="advertising-product-metric">
                <span>投放位置</span>
                <strong>{{ getProductPlacement(index) }}</strong>
              </div>
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
                <a-button shape="circle" @click="toggleExpandedProduct(product.id)">
                  <template #icon>
                    <icon-up v-if="expandedProductIds.includes(product.id)" />
                    <icon-down v-else />
                  </template>
                </a-button>
              </div>
            </div>

            <div
              v-if="expandedProductIds.includes(product.id)"
              class="advertising-product-expanded"
            >
              <div class="advertising-expanded-toolbar">
                <a-tabs v-model:active-key="activeClusterTab" type="rounded" hide-content>
                  <a-tab-pane key="clusters" title="搜索词集群" />
                  <a-tab-pane key="recommended" title="推荐商品" />
                </a-tabs>
                <div class="advertising-expanded-actions">
                  <a-button>集群管理</a-button>
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
                  <a-radio-group v-model="clusterFilter" type="button">
                    <a-radio value="active">活跃</a-radio>
                    <a-radio value="inactive">不活跃</a-radio>
                    <a-radio value="all">全部</a-radio>
                  </a-radio-group>
                  <a-input-search
                    v-model="clusterKeyword"
                    allow-clear
                    placeholder="寻找"
                  />
                </div>

                <a-table
                  :columns="clusterColumns"
                  :data="filterProductClusters(product.searchClusters)"
                  :pagination="false"
                  row-key="id"
                >
                  <template #query="{ record }">
                    <span>{{ record.query }}</span>
                  </template>
                  <template #rank="{ rowIndex }">
                    <span>{{ rowIndex + 1 }}</span>
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
              </template>

              <div v-else class="advertising-recommended-products">
                <div
                  v-for="recommendedProduct in getRecommendedProducts(product.id)"
                  :key="recommendedProduct.id"
                  class="advertising-recommended-product"
                >
                  <div class="advertising-product-image">
                    <img
                      v-if="recommendedProduct.image"
                      :src="recommendedProduct.image"
                      :alt="recommendedProduct.name"
                    >
                    <span v-else>{{ recommendedProduct.name.slice(0, 1) }}</span>
                  </div>
                  <div class="advertising-product-main">
                    <strong>{{ recommendedProduct.name }}</strong>
                    <span>{{ campaign.platform }} · {{ campaign.storeName }} · {{ recommendedProduct.sku }}</span>
                  </div>
                  <div class="advertising-product-metric">
                    <span>词集</span>
                    <strong>{{ recommendedProduct.searchClusters.length }}</strong>
                  </div>
                  <a-button>添加</a-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>

    <a-empty v-else description="没有找到这个广告活动">
      <a-button type="primary" @click="goBack">返回广告推广</a-button>
    </a-empty>
  </div>
</template>
