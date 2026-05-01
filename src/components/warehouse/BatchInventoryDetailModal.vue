<script setup lang="ts">
import { computed } from 'vue'
import {
  formatBatchNumber,
  getBatchStatusClass,
  getBatchStatusLabel,
  type BatchRow,
} from '../../data/batchInventory'

const props = defineProps<{
  visible: boolean
  row?: BatchRow
}>()

const emit = defineEmits<{
  'update:visible': [visible: boolean]
  close: []
}>()

const modalVisible = computed({
  get: () => props.visible,
  set: (visible: boolean) => emit('update:visible', visible),
})

const closeModal = () => {
  emit('update:visible', false)
  emit('close')
}
</script>

<template>
  <a-modal
    v-if="modalVisible"
    v-model:visible="modalVisible"
    title="批次详情"
    :width="680"
    modal-class="detail-dlg"
    unmount-on-close
    @ok="closeModal"
    @cancel="closeModal"
  >
    <a-descriptions v-if="row" :column="2" bordered class="detail-desc">
      <a-descriptions-item label="批次号">{{ row.batchNo }}</a-descriptions-item>
      <a-descriptions-item label="仓库编码">{{ row.warehouseCode }}</a-descriptions-item>
      <a-descriptions-item label="商品编码">{{ row.productCode }}</a-descriptions-item>
      <a-descriptions-item label="SKU">{{ row.sku }}</a-descriptions-item>
      <a-descriptions-item label="商品名称" :span="2">{{ row.productName }}</a-descriptions-item>
      <a-descriptions-item label="规格型号">{{ row.specModel }}</a-descriptions-item>
      <a-descriptions-item label="单位">{{ row.unit }}</a-descriptions-item>
      <a-descriptions-item label="批次数量">
        <span class="num-primary">{{ formatBatchNumber(row.batchQty) }}</span>
      </a-descriptions-item>
      <a-descriptions-item label="可用数量">
        <span class="num-success">{{ formatBatchNumber(row.availableQty) }}</span>
      </a-descriptions-item>
      <a-descriptions-item label="锁定数量">
        <span class="num-muted">{{ formatBatchNumber(row.lockedQty) }}</span>
      </a-descriptions-item>
      <a-descriptions-item label="生产日期">{{ row.productionDate }}</a-descriptions-item>
      <a-descriptions-item label="有效期至">{{ row.expireDate }}</a-descriptions-item>
      <a-descriptions-item label="供应商">{{ row.supplier }}</a-descriptions-item>
      <a-descriptions-item label="入库单号">{{ row.inboundOrderNo }}</a-descriptions-item>
      <a-descriptions-item label="入库时间">{{ row.inboundTime }}</a-descriptions-item>
      <a-descriptions-item label="操作人">{{ row.operator }}</a-descriptions-item>
      <a-descriptions-item label="状态">
        <span class="status-pill" :class="getBatchStatusClass(row.status)">{{ getBatchStatusLabel(row.status) }}</span>
      </a-descriptions-item>
      <a-descriptions-item label="备注" :span="2">{{ row.remark || '-' }}</a-descriptions-item>
    </a-descriptions>
    <template #footer>
      <a-button type="primary" @click="closeModal">确定</a-button>
    </template>
  </a-modal>
</template>

<style scoped>
.detail-desc {
  --batch-color-primary: rgb(var(--primary-6));
  --batch-color-text-tertiary: var(--color-text-3);
  margin-top: 4px;
}

.num-primary,
.num-success,
.num-muted {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.num-primary {
  color: var(--batch-color-primary);
}

.num-success {
  color: #00b42a;
}

.num-muted {
  color: var(--batch-color-text-tertiary);
}

.status-pill {
  display: inline-flex;
  height: 22px;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 12px;
  line-height: 22px;
}

.status-normal {
  background: rgba(0, 180, 42, 0.12);
  color: #00b42a;
}

.status-expired {
  background: rgba(245, 63, 63, 0.12);
  color: #f53f3f;
}

.status-locked {
  background: rgba(78, 89, 105, 0.12);
  color: #4e5969;
}

.status-warning {
  background: rgba(255, 125, 0, 0.14);
  color: #ff7d00;
}
</style>
