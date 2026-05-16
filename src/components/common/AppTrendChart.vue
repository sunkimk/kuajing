<script setup lang="ts">
import { computed } from 'vue'
import type { CSSProperties } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
])

const props = withDefaults(defineProps<{
  labels: string[]
  seriesName: string
  values: Array<number | null>
  height?: number
  smooth?: boolean
  showDataZoom?: boolean
}>(), {
  height: 300,
  smooth: true,
  showDataZoom: true,
})

const chartStyle = computed<CSSProperties>(() => ({
  '--app-trend-chart-height': `${props.height}px`,
}))

const dataZoom = computed(() => (props.showDataZoom ? [
  {
    type: 'inside',
    throttle: 60,
  },
  {
    type: 'slider',
    height: 18,
    bottom: 12,
    borderColor: 'transparent',
    backgroundColor: 'rgba(22, 120, 255, 0.06)',
    fillerColor: 'rgba(22, 120, 255, 0.16)',
    handleSize: 14,
  },
] : []))

const option = computed(() => ({
  color: ['#1677ff'],
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'line',
      lineStyle: {
        color: '#c9cdd4',
      },
    },
  },
  legend: {
    bottom: 0,
    icon: 'circle',
    itemWidth: 8,
    itemHeight: 8,
    textStyle: {
      color: '#4e5969',
      fontSize: 12,
    },
  },
  grid: {
    top: 24,
    right: 24,
    bottom: props.showDataZoom ? 64 : 40,
    left: 48,
  },
  dataZoom: dataZoom.value,
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: props.labels,
    axisTick: {
      show: false,
    },
    axisLine: {
      lineStyle: {
        color: '#e5e6eb',
      },
    },
    axisLabel: {
      color: '#86909c',
      fontSize: 11,
    },
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      color: '#86909c',
      fontSize: 11,
    },
    splitLine: {
      lineStyle: {
        color: '#eef1f5',
      },
    },
  },
  series: [
    {
      name: props.seriesName,
      type: 'line',
      smooth: props.smooth,
      showSymbol: true,
      symbol: 'circle',
      symbolSize: 5,
      data: props.values,
      lineStyle: {
        width: 2,
      },
      itemStyle: {
        borderWidth: 1.5,
        borderColor: '#fff',
      },
      emphasis: {
        focus: 'series',
      },
    },
  ],
}))
</script>

<template>
  <v-chart
    class="app-trend-chart"
    :style="chartStyle"
    :option="option"
    autoresize
  />
</template>

<style scoped>
.app-trend-chart {
  width: 100%;
  height: var(--app-trend-chart-height);
  min-height: 220px;
}
</style>
