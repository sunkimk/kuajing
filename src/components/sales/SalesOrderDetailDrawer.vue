<script setup lang="ts">
import { computed } from 'vue'
import './salesWorkbench.css'
import {
  getSalesOrderStatusClass,
  getSalesOrderStatusLabel,
  type SalesOrderRow,
} from '../../data/salesOrders'

const props = defineProps<{
  visible: boolean
  row?: SalesOrderRow
}>()

const emit = defineEmits<{
  'update:visible': [visible: boolean]
}>()

const drawerVisible = computed({
  get: () => props.visible,
  set: (visible: boolean) => emit('update:visible', visible),
})

const formatMoney = (value = 0) => `${value.toLocaleString('zh-CN')} RUB`
const formatPercent = (value = 0) => `${(value * 100).toFixed(1)}%`
const getTimelineDotClass = (tone: string) => `is-${tone}`
</script>

<template>
  <a-drawer
    v-model:visible="drawerVisible"
    :width="560"
    unmount-on-close
    title="订单详情"
  >
    <div v-if="row" class="sales-drawer-content">
      <div class="sales-drawer-header">
        <div class="sales-drawer-header-copy">
          <strong>{{ row.productName }}</strong>
          <span class="sales-mono">{{ row.orderNo }} / {{ row.assemblyId }}</span>
        </div>
        <span class="sales-status-pill" :class="getSalesOrderStatusClass(row.status)">
          {{ getSalesOrderStatusLabel(row.status) }}
        </span>
      </div>

      <section class="sales-detail-section">
        <h3 class="sales-detail-section-title">基础信息</h3>
        <div class="sales-detail-grid">
          <div class="sales-detail-item">
            <span>订单号</span>
            <strong class="sales-mono">{{ row.orderNo }}</strong>
          </div>
          <div class="sales-detail-item">
            <span>装配单号</span>
            <strong class="sales-mono">{{ row.assemblyId }}</strong>
          </div>
          <div class="sales-detail-item">
            <span>商品 SKU</span>
            <strong class="sales-mono">{{ row.sku }}</strong>
          </div>
          <div class="sales-detail-item">
            <span>客户</span>
            <strong>{{ row.customerName }}</strong>
          </div>
          <div class="sales-detail-item">
            <span>店铺</span>
            <strong>{{ row.shopName }}</strong>
          </div>
          <div class="sales-detail-item">
            <span>仓库</span>
            <strong>{{ row.warehouseName }}</strong>
          </div>
          <div class="sales-detail-item">
            <span>履约类型</span>
            <strong>{{ row.fulfillmentType }}</strong>
          </div>
          <div class="sales-detail-item">
            <span>配送方式</span>
            <strong>{{ row.deliveryMethod }}</strong>
          </div>
          <div class="sales-detail-item">
            <span>下单时间</span>
            <strong>{{ row.orderTime }}</strong>
          </div>
          <div class="sales-detail-item">
            <span>运单号</span>
            <strong class="sales-mono">{{ row.logisticsNumber }}</strong>
          </div>
        </div>
      </section>

      <section class="sales-detail-section">
        <h3 class="sales-detail-section-title">成本与利润</h3>
        <div class="sales-detail-stats">
          <div class="sales-detail-stat-card">
            <span>售价</span>
            <strong>{{ formatMoney(row.salePrice) }}</strong>
          </div>
          <div class="sales-detail-stat-card">
            <span>总成本</span>
            <strong>{{ formatMoney(row.totalCost) }}</strong>
          </div>
          <div class="sales-detail-stat-card">
            <span>预计利润</span>
            <strong>{{ formatMoney(row.estimatedProfit) }}</strong>
          </div>
          <div class="sales-detail-stat-card">
            <span>利润率</span>
            <strong>{{ formatPercent(row.profitRate) }}</strong>
          </div>
        </div>

        <div class="sales-detail-list">
          <div v-for="item in row.costBreakdown" :key="item.label" class="sales-detail-list-row">
            <span>{{ item.label }}</span>
            <strong>{{ formatMoney(item.value) }}</strong>
          </div>
        </div>
      </section>

      <section class="sales-detail-section">
        <h3 class="sales-detail-section-title">物流 / 状态日志</h3>
        <div class="sales-timeline">
          <div v-for="item in row.timeline" :key="`${item.label}-${item.time}`" class="sales-timeline-item">
            <span class="sales-timeline-dot" :class="getTimelineDotClass(item.tone)" />
            <div class="sales-timeline-copy">
              <strong>{{ item.label }}</strong>
              <span>{{ item.note }}</span>
              <small>{{ item.time }}</small>
            </div>
          </div>
        </div>
      </section>
    </div>
  </a-drawer>
</template>
