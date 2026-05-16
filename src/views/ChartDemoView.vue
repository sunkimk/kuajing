<script setup lang="ts">
import { computed, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconCopy, IconShareExternal } from '@arco-design/web-vue/es/icon'
import type { EChartsOption } from 'echarts'
import AppEChart from '../components/common/AppEChart.vue'
import QueryActionBar from '../components/common/QueryActionBar.vue'
import QueryFilterItem from '../components/common/QueryFilterItem.vue'
import QueryFilterPanel from '../components/common/QueryFilterPanel.vue'
import '../components/sales/salesWorkbench.css'

type ChartType = 'trend' | 'compare' | 'composition' | 'conversion' | 'relation' | 'distribution'
type ChartScene = 'sales' | 'inventory' | 'ad' | 'fulfillment' | 'store' | 'finance'

interface ChartDemo {
  id: string
  title: string
  type: ChartType
  sceneKey: ChartScene
  scene: string
  tags: string[]
  option: EChartsOption
}

const monthLabels = ['05-10', '05-11', '05-12', '05-13', '05-14', '05-15', '05-16']
const platformLabels = ['WB', 'Ozon', 'TikTok', 'Amazon']

const chartTypeOptions: Array<{ label: string, value: ChartType | 'all' }> = [
  { label: '全部类型', value: 'all' },
  { label: '趋势', value: 'trend' },
  { label: '对比', value: 'compare' },
  { label: '构成', value: 'composition' },
  { label: '转化', value: 'conversion' },
  { label: '关系', value: 'relation' },
  { label: '分布', value: 'distribution' },
]

const sceneOptions: Array<{ label: string, value: ChartScene | 'all' }> = [
  { label: '全部场景', value: 'all' },
  { label: '销售', value: 'sales' },
  { label: '库存', value: 'inventory' },
  { label: '广告', value: 'ad' },
  { label: '履约', value: 'fulfillment' },
  { label: '店铺', value: 'store' },
  { label: '财务', value: 'finance' },
]

const filters = reactive({
  keyword: '',
  chartType: 'all' as ChartType | 'all',
  scene: 'all' as ChartScene | 'all',
})

const baseLineGrid = { top: 24, right: 24, bottom: 40, left: 42 }
const legendBottomGrid = { top: 24, right: 24, bottom: 62, left: 42 }
const chartExampleUrl = 'https://echarts.apache.org/examples/zh/index.html'

const chartDemos: ChartDemo[] = [
  {
    id: 'line-trend',
    title: '折线趋势',
    type: 'trend',
    sceneKey: 'sales',
    scene: '订单、错误数、访客数、销售额按时间变化',
    tags: ['时间序列', '单指标', '运营看板'],
    option: {
      tooltip: { trigger: 'axis' },
      grid: baseLineGrid,
      xAxis: { type: 'category', boundaryGap: false, data: monthLabels },
      yAxis: { type: 'value' },
      series: [{ name: '销售额', type: 'line', smooth: true, symbolSize: 6, data: [128, 142, 139, 166, 174, 169, 193] }],
    },
  },
  {
    id: 'multi-line',
    title: '多折线趋势',
    type: 'trend',
    sceneKey: 'sales',
    scene: '多平台、多店铺、多指标同屏趋势比较',
    tags: ['时间序列', '多指标', '平台对比'],
    option: {
      tooltip: { trigger: 'axis' },
      legend: { bottom: 0 },
      grid: legendBottomGrid,
      xAxis: { type: 'category', boundaryGap: false, data: monthLabels },
      yAxis: { type: 'value' },
      series: [
        { name: 'WB', type: 'line', smooth: true, data: [128, 142, 139, 166, 174, 169, 193] },
        { name: 'Ozon', type: 'line', smooth: true, data: [88, 96, 102, 119, 126, 123, 140] },
        { name: 'TikTok', type: 'line', smooth: true, data: [42, 61, 72, 76, 95, 104, 118] },
      ],
    },
  },
  {
    id: 'dual-axis',
    title: '双轴组合',
    type: 'trend',
    sceneKey: 'ad',
    scene: '销售额与广告 ROI、订单量与客单价联动查看',
    tags: ['双轴', '柱线组合', '广告分析'],
    option: {
      tooltip: { trigger: 'axis' },
      legend: { bottom: 0 },
      grid: legendBottomGrid,
      xAxis: { type: 'category', data: monthLabels },
      yAxis: [
        { type: 'value', name: '消耗' },
        { type: 'value', name: 'ROI' },
      ],
      series: [
        { name: '广告消耗', type: 'bar', yAxisIndex: 0, data: [42, 51, 49, 68, 74, 71, 86] },
        { name: 'ROI', type: 'line', yAxisIndex: 1, smooth: true, data: [2.8, 3.1, 2.9, 3.4, 3.7, 3.5, 4.1] },
      ],
    },
  },
  {
    id: 'area-trend',
    title: '面积趋势',
    type: 'trend',
    sceneKey: 'inventory',
    scene: '库存水位、广告消耗、GMV 累积趋势',
    tags: ['面积', '容量感', '水位'],
    option: {
      tooltip: { trigger: 'axis' },
      grid: baseLineGrid,
      xAxis: { type: 'category', boundaryGap: false, data: monthLabels },
      yAxis: { type: 'value' },
      series: [{ name: '广告消耗', type: 'line', smooth: true, areaStyle: { opacity: 0.16 }, data: [42, 51, 49, 68, 74, 71, 86] }],
    },
  },
  {
    id: 'stacked-area',
    title: '堆叠面积',
    type: 'trend',
    sceneKey: 'finance',
    scene: '收入来源、费用结构、库存占用随时间变化',
    tags: ['堆叠', '趋势构成', '费用'],
    option: {
      tooltip: { trigger: 'axis' },
      legend: { bottom: 0 },
      grid: legendBottomGrid,
      xAxis: { type: 'category', boundaryGap: false, data: monthLabels },
      yAxis: { type: 'value' },
      series: [
        { name: '商品成本', type: 'line', stack: 'total', areaStyle: {}, data: [82, 91, 88, 94, 101, 108, 112] },
        { name: '物流', type: 'line', stack: 'total', areaStyle: {}, data: [26, 31, 29, 36, 35, 38, 42] },
        { name: '广告', type: 'line', stack: 'total', areaStyle: {}, data: [16, 22, 24, 27, 31, 29, 35] },
      ],
    },
  },
  {
    id: 'bar-compare',
    title: '柱状对比',
    type: 'compare',
    sceneKey: 'sales',
    scene: '平台、店铺、仓库、品类之间的横向比较',
    tags: ['柱状', '排行', '平台'],
    option: {
      tooltip: { trigger: 'axis' },
      grid: baseLineGrid,
      xAxis: { type: 'category', data: platformLabels },
      yAxis: { type: 'value' },
      series: [{ name: '订单量', type: 'bar', barWidth: 22, data: [320, 268, 198, 151] }],
    },
  },
  {
    id: 'horizontal-bar',
    title: '横向条形',
    type: 'compare',
    sceneKey: 'inventory',
    scene: 'SKU 排名、仓库占用、供应商绩效排序',
    tags: ['排行', '长标签', '库存'],
    option: {
      tooltip: { trigger: 'axis' },
      grid: { top: 20, right: 24, bottom: 28, left: 86 },
      xAxis: { type: 'value' },
      yAxis: { type: 'category', data: ['蓝牙耳机', '折叠支架', '露营灯', '宠物梳', '收纳盒'] },
      series: [{ name: '销量', type: 'bar', barWidth: 16, data: [420, 388, 342, 286, 244] }],
    },
  },
  {
    id: 'stacked-bar',
    title: '堆叠柱状',
    type: 'composition',
    sceneKey: 'fulfillment',
    scene: '订单状态、费用结构、库存构成',
    tags: ['堆叠', '状态构成', '履约'],
    option: {
      tooltip: { trigger: 'axis' },
      legend: { bottom: 0 },
      grid: legendBottomGrid,
      xAxis: { type: 'category', data: platformLabels },
      yAxis: { type: 'value' },
      series: [
        { name: '已发货', type: 'bar', stack: 'total', data: [210, 188, 132, 96] },
        { name: '待发货', type: 'bar', stack: 'total', data: [68, 44, 38, 28] },
        { name: '异常', type: 'bar', stack: 'total', data: [12, 9, 16, 7] },
      ],
    },
  },
  {
    id: 'waterfall-profit',
    title: '瀑布利润',
    type: 'composition',
    sceneKey: 'finance',
    scene: '从收入拆到毛利、净利，展示费用扣减过程',
    tags: ['利润', '费用拆解', '财务'],
    option: {
      tooltip: { trigger: 'axis' },
      grid: baseLineGrid,
      xAxis: { type: 'category', data: ['收入', '成本', '平台费', '物流', '广告', '净利'] },
      yAxis: { type: 'value' },
      series: [
        { name: '辅助', type: 'bar', stack: 'total', itemStyle: { color: 'transparent' }, data: [0, 460, 360, 292, 210, 0] },
        { name: '金额', type: 'bar', stack: 'total', data: [620, 160, 100, 68, 82, 210] },
      ],
    },
  },
  {
    id: 'donut-share',
    title: '环形占比',
    type: 'composition',
    sceneKey: 'sales',
    scene: '平台销售占比、费用占比、库存占比',
    tags: ['占比', '构成', '平台'],
    option: {
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [
        {
          name: '销售占比',
          type: 'pie',
          radius: ['52%', '72%'],
          center: ['50%', '44%'],
          data: [
            { name: 'WB', value: 42 },
            { name: 'Ozon', value: 28 },
            { name: 'TikTok', value: 18 },
            { name: 'Amazon', value: 12 },
          ],
        },
      ],
    },
  },
  {
    id: 'rose-pie',
    title: '玫瑰占比',
    type: 'composition',
    sceneKey: 'store',
    scene: '店铺贡献、品类贡献、流量来源差异更明显',
    tags: ['占比', '玫瑰图', '贡献'],
    option: {
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [
        {
          name: '品类贡献',
          type: 'pie',
          radius: [22, 86],
          center: ['50%', '42%'],
          roseType: 'radius',
          data: [
            { name: '电子', value: 38 },
            { name: '家居', value: 28 },
            { name: '户外', value: 24 },
            { name: '宠物', value: 18 },
            { name: '美妆', value: 14 },
          ],
        },
      ],
    },
  },
  {
    id: 'treemap-category',
    title: '矩形树图',
    type: 'composition',
    sceneKey: 'inventory',
    scene: '品类库存、SKU 贡献、广告计划预算占比',
    tags: ['树图', '层级', '占比'],
    option: {
      tooltip: { trigger: 'item' },
      series: [
        {
          name: '品类',
          type: 'treemap',
          roam: false,
          breadcrumb: { show: false },
          data: [
            { name: '电子配件', value: 42, children: [{ name: '耳机', value: 22 }, { name: '支架', value: 20 }] },
            { name: '家居收纳', value: 30, children: [{ name: '收纳盒', value: 18 }, { name: '挂架', value: 12 }] },
            { name: '户外', value: 18 },
            { name: '宠物', value: 10 },
          ],
        },
      ],
    },
  },
  {
    id: 'radar-score',
    title: '雷达评分',
    type: 'compare',
    sceneKey: 'store',
    scene: '店铺健康度、供应商评分、产品竞争力',
    tags: ['评分', '多维度', '健康度'],
    option: {
      tooltip: {},
      radar: {
        radius: '64%',
        indicator: [
          { name: '销量', max: 100 },
          { name: '毛利', max: 100 },
          { name: '库存', max: 100 },
          { name: '履约', max: 100 },
          { name: '广告', max: 100 },
        ],
      },
      series: [{ name: '店铺评分', type: 'radar', areaStyle: { opacity: 0.12 }, data: [{ value: [82, 71, 64, 90, 76], name: '旗舰店' }] }],
    },
  },
  {
    id: 'funnel-conversion',
    title: '漏斗转化',
    type: 'conversion',
    sceneKey: 'ad',
    scene: '曝光到下单、询价到成交、客服转化',
    tags: ['转化', '漏斗', '广告'],
    option: {
      tooltip: { trigger: 'item' },
      series: [
        {
          name: '转化',
          type: 'funnel',
          top: 20,
          bottom: 20,
          left: '10%',
          width: '80%',
          data: [
            { name: '曝光', value: 100 },
            { name: '访问', value: 72 },
            { name: '加购', value: 36 },
            { name: '下单', value: 18 },
          ],
        },
      ],
    },
  },
  {
    id: 'gauge-progress',
    title: '仪表进度',
    type: 'conversion',
    sceneKey: 'fulfillment',
    scene: '目标达成率、履约及时率、预算消耗率',
    tags: ['进度', '达成率', '目标'],
    option: {
      series: [
        {
          name: '目标达成',
          type: 'gauge',
          progress: { show: true, width: 10 },
          axisLine: { lineStyle: { width: 10 } },
          axisTick: { show: false },
          splitLine: { length: 8 },
          detail: { formatter: '{value}%' },
          data: [{ value: 76, name: '本月目标' }],
        },
      ],
    },
  },
  {
    id: 'heatmap-calendar',
    title: '热力矩阵',
    type: 'distribution',
    sceneKey: 'fulfillment',
    scene: '时段销量、异常密度、补货压力',
    tags: ['热力', '时段', '密度'],
    option: {
      tooltip: { position: 'top' },
      grid: { top: 24, right: 20, bottom: 36, left: 58 },
      xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
      yAxis: { type: 'category', data: ['上午', '中午', '下午', '晚上'] },
      visualMap: { min: 0, max: 100, show: false, inRange: { color: ['#e8f3ff', '#1677ff'] } },
      series: [
        {
          name: '订单密度',
          type: 'heatmap',
          data: [
            [0, 0, 32], [1, 0, 41], [2, 0, 48], [3, 0, 62], [4, 0, 77], [5, 0, 55], [6, 0, 38],
            [0, 1, 28], [1, 1, 36], [2, 1, 51], [3, 1, 74], [4, 1, 91], [5, 1, 68], [6, 1, 46],
            [0, 2, 52], [1, 2, 58], [2, 2, 64], [3, 2, 81], [4, 2, 96], [5, 2, 73], [6, 2, 59],
            [0, 3, 22], [1, 3, 34], [2, 3, 45], [3, 3, 69], [4, 3, 84], [5, 3, 62], [6, 3, 44],
          ],
          label: { show: false },
        },
      ],
    },
  },
  {
    id: 'scatter-correlation',
    title: '散点相关',
    type: 'distribution',
    sceneKey: 'sales',
    scene: '价格与销量、广告消耗与订单量的相关性',
    tags: ['相关性', '散点', '决策'],
    option: {
      tooltip: { trigger: 'item' },
      grid: baseLineGrid,
      xAxis: { type: 'value', name: '价格' },
      yAxis: { type: 'value', name: '销量' },
      series: [{ name: 'SKU', type: 'scatter', symbolSize: 10, data: [[19, 320], [25, 280], [32, 210], [46, 160], [58, 118], [72, 96], [88, 72]] }],
    },
  },
  {
    id: 'bubble-scatter',
    title: '气泡散点',
    type: 'distribution',
    sceneKey: 'ad',
    scene: '消耗、转化率、订单量三个变量一起判断',
    tags: ['气泡', '三变量', '广告'],
    option: {
      tooltip: { trigger: 'item' },
      grid: baseLineGrid,
      xAxis: { type: 'value', name: '消耗' },
      yAxis: { type: 'value', name: 'ROI' },
      series: [
        {
          name: '计划',
          type: 'scatter',
          symbolSize: (value: unknown) => Array.isArray(value) ? Number(value[2]) / 4 : 12,
          data: [[42, 2.8, 54], [61, 3.1, 72], [86, 4.1, 118], [74, 3.7, 96], [52, 2.6, 48]],
        },
      ],
    },
  },
  {
    id: 'sankey-flow',
    title: '桑基流向',
    type: 'relation',
    sceneKey: 'fulfillment',
    scene: '订单流向、物流节点、费用流转关系',
    tags: ['流向', '链路', '关系'],
    option: {
      tooltip: { trigger: 'item' },
      series: [
        {
          type: 'sankey',
          nodeWidth: 14,
          nodeGap: 10,
          layoutIterations: 24,
          data: [
            { name: '下单' }, { name: '待拣货' }, { name: '已发货' }, { name: '签收' }, { name: '异常' },
          ],
          links: [
            { source: '下单', target: '待拣货', value: 420 },
            { source: '待拣货', target: '已发货', value: 386 },
            { source: '已发货', target: '签收', value: 341 },
            { source: '待拣货', target: '异常', value: 34 },
            { source: '已发货', target: '异常', value: 45 },
          ],
        },
      ],
    },
  },
  {
    id: 'graph-relation',
    title: '关系网络',
    type: 'relation',
    sceneKey: 'store',
    scene: '商品、店铺、供应商、广告计划的关联图',
    tags: ['网络', '关联', '实体'],
    option: {
      tooltip: {},
      series: [
        {
          type: 'graph',
          layout: 'force',
          roam: false,
          label: { show: true },
          force: { repulsion: 90, edgeLength: 70 },
          data: [
            { name: '旗舰店', symbolSize: 48 },
            { name: '耳机 SKU', symbolSize: 34 },
            { name: '供应商 A', symbolSize: 32 },
            { name: '广告计划', symbolSize: 30 },
            { name: '北京仓', symbolSize: 28 },
          ],
          links: [
            { source: '旗舰店', target: '耳机 SKU' },
            { source: '耳机 SKU', target: '供应商 A' },
            { source: '耳机 SKU', target: '广告计划' },
            { source: '耳机 SKU', target: '北京仓' },
          ],
        },
      ],
    },
  },
]

const matchedTypeLabel = (value: ChartType) =>
  chartTypeOptions.find((option) => option.value === value)?.label ?? value

const matchedSceneLabel = (value: ChartScene) =>
  sceneOptions.find((option) => option.value === value)?.label ?? value

const filteredDemos = computed(() => {
  const keyword = filters.keyword.trim().toLowerCase()

  return chartDemos.filter((demo) => {
    const matchesKeyword = !keyword
      || [demo.id, demo.title, demo.scene, ...demo.tags].some((text) => text.toLowerCase().includes(keyword))
    const matchesType = filters.chartType === 'all' || demo.type === filters.chartType
    const matchesScene = filters.scene === 'all' || demo.sceneKey === filters.scene

    return matchesKeyword && matchesType && matchesScene
  })
})

const resetFilters = () => {
  filters.keyword = ''
  filters.chartType = 'all'
  filters.scene = 'all'
}

const copyDemoId = async (id: string) => {
  try {
    await navigator.clipboard.writeText(id)
    Message.success(`已复制 ${id}`)
  } catch {
    Message.warning('复制失败，请手动复制编号')
  }
}
</script>

<template>
  <div class="sales-workbench chart-demo-workbench">
    <section class="page-header chart-demo-page-header">
      <div class="header-left">
        <h1 class="page-title">图表 Demo</h1>
        <span class="page-desc">按图表编号挑选样式，例如直接告诉 AI 使用 line-trend 或 sankey-flow。</span>
      </div>

      <a-space>
        <a-button class="action-button" :href="chartExampleUrl">
          <template #icon>
            <IconShareExternal />
          </template>
          查看更多图表示例
        </a-button>
        <a-tag color="arcoblue">ECharts + Vue</a-tag>
        <a-tag>{{ filteredDemos.length }} / {{ chartDemos.length }}</a-tag>
      </a-space>
    </section>

    <QueryFilterPanel>
      <QueryFilterItem label="关键词" width="320px" min-width="260px">
        <a-input-search
          v-model="filters.keyword"
          allow-clear
          placeholder="搜索编号、场景、标签"
        />
      </QueryFilterItem>

      <QueryFilterItem label="图表类型" width="260px" min-width="220px">
        <a-select v-model="filters.chartType">
          <a-option v-for="option in chartTypeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </a-option>
        </a-select>
      </QueryFilterItem>

      <QueryFilterItem label="业务场景" width="260px" min-width="220px">
        <a-select v-model="filters.scene">
          <a-option v-for="option in sceneOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </a-option>
        </a-select>
      </QueryFilterItem>

      <QueryActionBar>
        <a-button class="action-button" @click="resetFilters">重置</a-button>
      </QueryActionBar>
    </QueryFilterPanel>

    <section class="chart-demo-grid">
      <a-card
        v-for="demo in filteredDemos"
        :key="demo.id"
        class="chart-demo-card"
      >
        <template #title>
          <div class="chart-demo-card-title">
            <span>{{ demo.title }}</span>
            <code>{{ demo.id }}</code>
          </div>
        </template>

        <template #extra>
          <a-space size="mini">
            <a-tag size="small">{{ matchedTypeLabel(demo.type) }}</a-tag>
            <a-tooltip content="复制图表编号">
              <a-button class="chart-demo-copy-button" size="small" @click="copyDemoId(demo.id)">
                <template #icon>
                  <IconCopy />
                </template>
              </a-button>
            </a-tooltip>
          </a-space>
        </template>

        <p class="chart-demo-scene">{{ demo.scene }}</p>
        <div class="chart-demo-tags">
          <a-tag size="small" color="gray">{{ matchedSceneLabel(demo.sceneKey) }}</a-tag>
          <a-tag v-for="tag in demo.tags" :key="tag" size="small" color="blue">{{ tag }}</a-tag>
        </div>
        <AppEChart :option="demo.option" :height="280" />
      </a-card>
    </section>

    <a-empty v-if="filteredDemos.length === 0" description="没有匹配的图表 Demo" />
  </div>
</template>

<style scoped>
.chart-demo-workbench {
  padding-bottom: 32px;
}

.chart-demo-page-header {
  align-items: center;
}

.chart-demo-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.chart-demo-card {
  border-radius: 8px;
  box-shadow: none;
}

.chart-demo-card :deep(.arco-card-header) {
  min-height: 52px;
  padding: 14px 16px 0;
  border-bottom: 0;
}

.chart-demo-card :deep(.arco-card-body) {
  padding: 8px 16px 16px;
}

.chart-demo-card-title {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
}

.chart-demo-card-title span {
  min-width: 0;
  overflow: hidden;
  color: var(--workspace-color-text, var(--color-text-1));
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chart-demo-card-title code {
  flex-shrink: 0;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--color-fill-2);
  color: var(--workspace-color-text-secondary, var(--color-text-2));
  font-size: 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace;
  line-height: 18px;
}

.chart-demo-scene {
  min-height: 40px;
  margin: 0 0 8px;
  color: var(--workspace-color-text-secondary, var(--color-text-2));
  font-size: 13px;
  line-height: 20px;
}

.chart-demo-tags {
  display: flex;
  min-height: 24px;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.chart-demo-copy-button {
  width: 28px;
  height: 28px;
  padding: 0;
}

@media (max-width: 1280px) {
  .chart-demo-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .chart-demo-page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .chart-demo-grid {
    grid-template-columns: 1fr;
  }
}
</style>
