<script setup lang="ts">
import { computed } from 'vue'
import './salesWorkbench.css'
import {
  getSalesReturnStatusClass,
  getSalesReturnStatusLabel,
  type SalesReturnRow,
} from '../../data/salesReturns'

const props = defineProps<{
  visible: boolean
  row?: SalesReturnRow
}>()

const emit = defineEmits<{
  'update:visible': [visible: boolean]
}>()

const drawerVisible = computed({
  get: () => props.visible,
  set: (visible: boolean) => emit('update:visible', visible),
})

const formatMoney = (value = 0) => `${value.toLocaleString('zh-CN')} RUB`
const getTimelineDotClass = (tone: string) => `is-${tone}`
</script>

<template>
  <a-drawer
    v-model:visible="drawerVisible"
    :width="560"
    unmount-on-close
    title="退货处理详情"
  >
    <div v-if="row" class="sales-drawer-content">
      <div class="sales-drawer-header">
        <div class="sales-drawer-header-copy">
          <strong>{{ row.productName }}</strong>
          <span class="sales-mono">{{ row.returnNo }} / {{ row.originalOrderNo }}</span>
        </div>
        <span class="sales-status-pill" :class="getSalesReturnStatusClass(row.status)">
          {{ getSalesReturnStatusLabel(row.status) }}
        </span>
      </div>

      <section class="sales-detail-section">
        <h3 class="sales-detail-section-title">退货信息</h3>
        <div class="sales-detail-grid">
          <div class="sales-detail-item">
            <span>退货单号</span>
            <strong class="sales-mono">{{ row.returnNo }}</strong>
          </div>
          <div class="sales-detail-item">
            <span>原订单号</span>
            <strong class="sales-mono">{{ row.originalOrderNo }}</strong>
          </div>
          <div class="sales-detail-item">
            <span>申请时间</span>
            <strong>{{ row.applyTime }}</strong>
          </div>
          <div class="sales-detail-item">
            <span>退货数量</span>
            <strong>{{ row.quantity }}</strong>
          </div>
          <div class="sales-detail-item">
            <span>退款金额</span>
            <strong>{{ formatMoney(row.refundAmount) }}</strong>
          </div>
          <div class="sales-detail-item">
            <span>仓库</span>
            <strong>{{ row.warehouseName }}</strong>
          </div>
        </div>
      </section>

      <section class="sales-detail-section">
        <h3 class="sales-detail-section-title">商品信息</h3>
        <div class="sales-detail-grid">
          <div class="sales-detail-item">
            <span>商品名称</span>
            <strong>{{ row.productName }}</strong>
          </div>
          <div class="sales-detail-item">
            <span>SKU</span>
            <strong class="sales-mono">{{ row.sku }}</strong>
          </div>
          <div class="sales-detail-item">
            <span>所属店铺</span>
            <strong>{{ row.shopName }}</strong>
          </div>
          <div class="sales-detail-item">
            <span>退货原因</span>
            <strong>{{ row.reasonLabel }}</strong>
          </div>
        </div>
      </section>

      <section class="sales-detail-section">
        <h3 class="sales-detail-section-title">处理进度</h3>
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
