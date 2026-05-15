<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  filterAdvertisingProductClusters,
  findAdvertisingCampaignById,
  formatAdvertisingMoney,
} from '../../data/storeAdvertising'
import './storeAdvertising.css'

const props = defineProps<{
  campaignId: string
}>()

const expandedProductIds = ref<string[]>([])
const campaign = computed(() => findAdvertisingCampaignById(props.campaignId))
const recommendedProducts = computed(() => campaign.value?.products ?? [])
const firstProduct = computed(() => recommendedProducts.value[0])
const visibleClusters = computed(() =>
  firstProduct.value
    ? filterAdvertisingProductClusters(firstProduct.value.searchClusters, { keyword: '', state: undefined })
    : []
)
const budgetBalance = computed(() => {
  if (!campaign.value) return '¥0'
  return formatAdvertisingMoney(campaign.value.budget - campaign.value.spend, campaign.value.currencySymbol)
})
</script>

<template>
  <div class="store-advertising-workbench advertising-detail-workbench">
    <section class="advertising-page-header">
      <div>
        <h1>{{ campaign?.campaignName ?? '活动详情' }}</h1>
        <p>预算余额 {{ budgetBalance }}</p>
      </div>
      <a-button type="primary">完整统计</a-button>
    </section>

    <section class="advertising-detail-grid">
      <div>
        <span>预算余额</span>
        <strong>{{ budgetBalance }}</strong>
      </div>
      <div>
        <span>自动补充预算</span>
        <strong>已开启</strong>
      </div>
    </section>

    <section>
      <h2>推荐商品</h2>
      <div
        v-for="product in recommendedProducts"
        :key="product.id"
        class="advertising-product-expanded"
      >
        <button type="button" @click="expandedProductIds = [product.id]">
          {{ product.name }}
        </button>
      </div>
    </section>

    <section>
      <h2>搜索词集群</h2>
      <div v-for="cluster in visibleClusters" :key="cluster.id">
        {{ cluster.query }}
      </div>
    </section>
  </div>
</template>
