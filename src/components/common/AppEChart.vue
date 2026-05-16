<script setup lang="ts">
import { computed } from 'vue'
import type { CSSProperties } from 'vue'
import type { EChartsOption } from 'echarts'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import {
  BarChart,
  FunnelChart,
  GaugeChart,
  GraphChart,
  HeatmapChart,
  LineChart,
  PieChart,
  RadarChart,
  SankeyChart,
  ScatterChart,
  TreemapChart,
} from 'echarts/charts'
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  RadarComponent,
  TooltipComponent,
  VisualMapComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  RadarChart,
  FunnelChart,
  GaugeChart,
  HeatmapChart,
  ScatterChart,
  TreemapChart,
  SankeyChart,
  GraphChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  RadarComponent,
  VisualMapComponent,
])

const props = withDefaults(defineProps<{
  option: EChartsOption
  height?: number | string
}>(), {
  height: 260,
})

const chartStyle = computed<CSSProperties>(() => ({
  '--app-e-chart-height': typeof props.height === 'number' ? `${props.height}px` : props.height,
}))
</script>

<template>
  <v-chart
    class="app-e-chart"
    :style="chartStyle"
    :option="option"
    autoresize
  />
</template>

<style scoped>
.app-e-chart {
  width: 100%;
  height: var(--app-e-chart-height);
  min-height: 220px;
}
</style>
