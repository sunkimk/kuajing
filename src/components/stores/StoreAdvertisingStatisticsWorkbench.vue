<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AdvertisingStatisticsMetricKey } from '../../data/storeAdvertising'
import {
  createStatisticPolylinePoints,
  findAdvertisingCampaignById,
  getStatisticsMetricOptions,
} from '../../data/storeAdvertising'
import './storeAdvertising.css'

const props = defineProps<{
  campaignId: string
}>()

const campaign = computed(() => findAdvertisingCampaignById(props.campaignId))
const metricOptions = getStatisticsMetricOptions()
const selectedMetrics = ref<AdvertisingStatisticsMetricKey[]>(['impressions', 'clicks'])
const chartPoints = computed(() =>
  selectedMetrics.value.map((metric) => ({
    metric,
    points: createStatisticPolylinePoints(campaign.value?.statistics ?? [], metric, 320, 120),
  }))
)
</script>

<template>
  <div class="store-advertising-workbench advertising-statistics-workbench">
    <section class="advertising-page-header">
      <div>
        <h1>活动统计</h1>
        <p>{{ campaign?.campaignName ?? campaignId }}</p>
      </div>
    </section>

    <section>
      <h2>广告活动的基本统计</h2>
      <a-checkbox-group v-model="selectedMetrics">
        <a-checkbox v-for="option in metricOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </a-checkbox>
      </a-checkbox-group>
    </section>

    <section class="advertising-chart-card">
      <h2>扩展统计</h2>
      <svg viewBox="0 0 320 120" role="img" aria-label="活动统计趋势">
        <polyline
          v-for="line in chartPoints"
          :key="line.metric"
          :points="line.points"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        />
      </svg>
    </section>
  </div>
</template>
