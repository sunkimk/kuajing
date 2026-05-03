<script setup lang="ts">
import { computed } from 'vue'
import ConfigurableDataTable from '../common/ConfigurableDataTable.vue'
import type { ConfigurableTableColumn } from '../../data/configurableTable'
import {
  formatBatchNumber,
  getBatchStatusClass,
  getBatchStatusLabel,
  isExpired,
  isNearExpire,
  type BatchColumnKey,
  type BatchInventoryPagination,
  type BatchRow,
} from '../../data/batchInventory'

type BatchTableColumnData = ConfigurableTableColumn<BatchColumnKey> & { title: string }

const props = withDefaults(defineProps<{
  rows: BatchRow[]
  total: number
  pagination: BatchInventoryPagination
  loading?: boolean
  settingsVisible?: boolean
}>(), {
  loading: false,
  settingsVisible: false,
})

const emit = defineEmits<{
  'update:pagination': [pagination: BatchInventoryPagination]
  'update:settingsVisible': [visible: boolean]
  'row-detail': [row: BatchRow]
  'open-logs': [row: BatchRow]
}>()

const settingsModalVisible = computed({
  get: () => props.settingsVisible,
  set: (visible: boolean) => emit('update:settingsVisible', visible),
})

const currentPage = computed({
  get: () => props.pagination.page,
  set: (page: number) => emit('update:pagination', { ...props.pagination, page }),
})

const pageSize = computed({
  get: () => props.pagination.pageSize,
  set: (nextPageSize: number) => emit('update:pagination', { ...props.pagination, pageSize: nextPageSize }),
})

const defaultVisibleColumnKeys: BatchColumnKey[] = [
  'batchNo',
  'warehouseCode',
  'productCode',
  'sku',
  'productName',
  'specModel',
  'unit',
  'batchQty',
  'availableQty',
  'lockedQty',
  'productionDate',
  'expireDate',
  'supplier',
  'status',
]

const requiredColumnKeys: BatchColumnKey[] = ['batchNo']
const pinnedDataColumnKeys: BatchColumnKey[] = ['batchNo']

const rawBaseColumns: BatchTableColumnData[] = [
  { settingsKey: 'batchNo', title: '批次号', dataIndex: 'batchNo', slotName: 'batchNo', width: 180, minWidth: 150 },
  { settingsKey: 'warehouseCode', title: '仓库', dataIndex: 'warehouseCode', width: 90, minWidth: 80, align: 'center' },
  { settingsKey: 'productCode', title: '商品编码', dataIndex: 'productCode', width: 132, minWidth: 116, align: 'center', ellipsis: true, tooltip: true },
  { settingsKey: 'sku', title: 'SKU', dataIndex: 'sku', width: 150, minWidth: 130, ellipsis: true, tooltip: true },
  { settingsKey: 'productName', title: '商品名称', dataIndex: 'productName', width: 190, minWidth: 160, ellipsis: true, tooltip: true },
  { settingsKey: 'specModel', title: '规格型号', dataIndex: 'specModel', width: 120, minWidth: 108, ellipsis: true, tooltip: true },
  { settingsKey: 'unit', title: '单位', dataIndex: 'unit', width: 70, minWidth: 64, align: 'center' },
  { settingsKey: 'batchQty', title: '批次数量', dataIndex: 'batchQty', slotName: 'batchQty', width: 144, minWidth: 116, align: 'right', sortable: { sortDirections: ['ascend', 'descend'] } },
  { settingsKey: 'availableQty', title: '可用数量', dataIndex: 'availableQty', slotName: 'availableQty', width: 144, minWidth: 116, align: 'right', sortable: { sortDirections: ['ascend', 'descend'] } },
  { settingsKey: 'lockedQty', title: '锁定数量', dataIndex: 'lockedQty', slotName: 'lockedQty', width: 132, minWidth: 104, align: 'right', sortable: { sortDirections: ['ascend', 'descend'] } },
  { settingsKey: 'productionDate', title: '生产日期', dataIndex: 'productionDate', width: 112, minWidth: 104, align: 'center' },
  { settingsKey: 'expireDate', title: '有效期至', dataIndex: 'expireDate', slotName: 'expireDate', width: 112, minWidth: 104, align: 'center' },
  { settingsKey: 'supplier', title: '供应商', dataIndex: 'supplier', width: 160, minWidth: 132, ellipsis: true, tooltip: true },
  { settingsKey: 'status', title: '状态', dataIndex: 'status', slotName: 'status', width: 86, minWidth: 76, align: 'center' },
  { title: '操作', slotName: 'operation', width: 96, align: 'center' },
]
</script>

<template>
  <ConfigurableDataTable
    v-model:settings-visible="settingsModalVisible"
    :columns="rawBaseColumns"
    :default-visible-keys="defaultVisibleColumnKeys"
    :required-keys="requiredColumnKeys"
    :pinned-column-keys="pinnedDataColumnKeys"
    :data="rows"
    row-key="id"
    :pagination="false"
    :loading="loading"
    table-class="data-table"
    wrapper-class="batch-inventory-table"
  >
    <template #batchNo="{ record }">
      <button type="button" class="cell-link" @click.stop="emit('row-detail', record)">{{ record.batchNo }}</button>
    </template>

    <template #batchQty="{ record }">
      <span class="num-primary">{{ formatBatchNumber(record.batchQty) }}</span>
    </template>

    <template #availableQty="{ record }">
      <span class="num-success">{{ formatBatchNumber(record.availableQty) }}</span>
    </template>

    <template #lockedQty="{ record }">
      <span class="num-muted">{{ formatBatchNumber(record.lockedQty) }}</span>
    </template>

    <template #expireDate="{ record }">
      <span :class="{ 'text-danger': isNearExpire(record.expireDate), 'text-muted': isExpired(record.expireDate) }">
        {{ record.expireDate }}
      </span>
    </template>

    <template #status="{ record }">
      <span class="status-pill" :class="getBatchStatusClass(record.status)">{{ getBatchStatusLabel(record.status) }}</span>
    </template>

    <template #operation="{ record }">
      <a-button type="primary" size="small" status="normal" @click.stop="emit('open-logs', record)">日志</a-button>
    </template>

    <template #footer>
      <a-pagination
        v-model:current="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-size-options="[20, 50, 100]"
        show-total
        show-jumper
        show-page-size
      />
    </template>
  </ConfigurableDataTable>
</template>

<style scoped>
.batch-inventory-table {
  --batch-color-primary: rgb(var(--primary-6));
  --batch-color-text: var(--color-text-1);
  --batch-color-text-secondary: var(--color-text-2);
  --batch-color-text-tertiary: var(--color-text-3);
  --batch-color-bg: var(--color-bg-2);
  --batch-color-fill: var(--color-fill-1);
  --batch-color-border: var(--color-border-2);
  --batch-color-hover-bg: var(--color-fill-2);
  --batch-radius: var(--border-radius-medium);
  --workspace-color-primary: var(--batch-color-primary);
  --workspace-color-text: var(--batch-color-text);
  --workspace-color-text-secondary: var(--batch-color-text-secondary);
  --workspace-color-text-tertiary: var(--batch-color-text-tertiary);
  --workspace-color-bg: var(--batch-color-bg);
  --workspace-color-fill: var(--batch-color-fill);
  --workspace-color-border: var(--batch-color-border);
  --workspace-color-hover-bg: var(--batch-color-hover-bg);
  --workspace-radius: var(--batch-radius);
}

.cell-link {
  display: block;
  width: 100%;
  overflow: hidden;
  border: 0;
  background: transparent;
  color: var(--batch-color-primary);
  cursor: pointer;
  font-weight: 500;
  padding: 0;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell-link:hover {
  text-decoration: underline;
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

.num-muted,
.text-muted {
  color: var(--batch-color-text-tertiary);
}

.text-danger {
  color: #f53f3f;
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
