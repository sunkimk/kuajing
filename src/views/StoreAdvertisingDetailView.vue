<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import StoreAdvertisingDetailWorkbench from '../components/stores/StoreAdvertisingDetailWorkbench.vue'

const route = useRoute()
const campaignId = computed(() => String(route.params.campaignId ?? ''))
</script>

<template>
  <StoreAdvertisingDetailWorkbench :campaign-id="campaignId" />
</template>
