<script setup lang="ts">
import { computed } from 'vue'
import type { TableColumnData } from '@arco-design/web-vue'
import AppDataTable from '../common/AppDataTable.vue'
import './salesWorkbench.css'
import {
  getSalesSecondaryStatusClass,
  getSalesSecondaryStatusLabel,
  type SalesSecondaryRow,
} from '../../data/salesSecondary'

const props = defineProps<{
  visible: boolean
  row?: SalesSecondaryRow
}>()

const emit = defineEmits<{
  'update:visible': [visible: boolean]
}>()

const drawerVisible = computed({
  get: () => props.visible,
  set: (visible: boolean) => emit('update:visible', visible),
})

const recordColumns: TableColumnData[] = [
  { title: '订单号', dataIndex: 'orderNo', width: 150, slotName: 'orderNo' },
  { title: '下单日期', dataIndex: 'orderDate', width: 110, align: 'center' },
  { title: '数量', dataIndex: 'quantity', width: 72, align: 'center' },
  { title: '配送费用', dataIndex: 'deliveryFee', width: 108, align: 'right', slotName: 'deliveryFee' },
  { title: '状态', dataIndex: 'status', minWidth: 100 },
  { title: '仓库', dataIndex: 'warehouseName', minWidth: 120 },
]

const formatMoney = (value = 0) => `${value.toLocaleString('zh-CN')} RUB`
</script>

<template>
  <a-drawer
    v-model:visible="drawerVisible"
    :width="640"
    unmount-on-close
    title="商品销售记录"
  >
    <div v-if="row" class="sales-drawer-content">
      <div class="sales-drawer-header">
        <div class="sales-drawer-header-copy">
          <strong>{{ row.productName }}</strong>
          <span class="sales-mono">{{ row.shkId }} / {{ row.nmId }}</span>
        </div>
        <span class="sales-status-pill" :class="getSalesSecondaryStatusClass(row.finalStatus)">
          {{ getSalesSecondaryStatusLabel(row.finalStatus) }}
        </span>
      </div>

      <section class="sales-detail-section">
        <div class="sales-detail-stats">
          <div class="sales-detail-stat-card">
            <span>条码</span>
            <strong class="sales-mono">{{ row.barcode }}</strong>
          </div>
          <div class="sales-detail-stat-card">
            <span>品牌 / 品类</span>
            <strong>{{ row.brand }} / {{ row.category }}</strong>
          </div>
          <div class="sales-detail-stat-card">
            <span>销售次数</span>
            <strong>{{ row.saleCount }}</strong>
          </div>
          <div class="sales-detail-stat-card">
            <span>配送费用合计</span>
            <strong>{{ formatMoney(row.deliveryFee) }}</strong>
          </div>
        </div>
      </section>

      <section class="sales-detail-section">
        <h3 class="sales-detail-section-title">销售记录</h3>
        <AppDataTable
          :columns="recordColumns"
          :data="row.records"
          row-key="orderNo"
          :pagination="false"
          wrapper-class="sales-subtable"
        >
          <template #orderNo="{ record }">
            <span class="sales-mono">{{ record.orderNo }}</span>
          </template>

          <template #deliveryFee="{ record }">
            <span class="sales-money">{{ formatMoney(record.deliveryFee) }}</span>
          </template>
        </AppDataTable>
      </section>
    </div>
  </a-drawer>
</template>
