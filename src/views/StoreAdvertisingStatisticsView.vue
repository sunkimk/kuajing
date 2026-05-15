<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import StoreAdvertisingStatisticsWorkbench from '../components/stores/StoreAdvertisingStatisticsWorkbench.vue'

const route = useRoute()
const campaignId = computed(() => String(route.params.campaignId ?? ''))
</script>

<template>
  <StoreAdvertisingStatisticsWorkbench :campaign-id="campaignId" />
</template>
