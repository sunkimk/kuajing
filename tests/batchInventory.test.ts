import { describe, expect, it } from 'vitest'
import {
  calculateBatchInventoryStats,
  createBatchRows,
  filterBatchRows,
  paginateBatchRows,
  type BatchRow,
} from '../src/data/batchInventory'

const rows: BatchRow[] = [
  {
    id: '1',
    batchNo: 'PC26000001',
    warehouseCode: 'WH001',
    productCode: 'SP001',
    sku: 'SKU-A',
    productName: 'Alpha Phone',
    specModel: 'Black',
    unit: '台',
    batchQty: 100,
    availableQty: 80,
    lockedQty: 20,
    productionDate: '2026-03-01',
    expireDate: '2026-09-01',
    supplier: 'Supplier A',
    inboundOrderNo: 'IN001',
    inboundTime: '2026-04-01 10:00:00',
    operator: '张三',
    remark: '',
    status: 'normal',
    createdAt: '2026-04-01 10:00:00',
    updatedAt: '2026-04-01 10:00:00',
  },
  {
    id: '2',
    batchNo: 'PC26000002',
    warehouseCode: 'WH002',
    productCode: 'SP002',
    sku: 'SKU-B',
    productName: 'Beta Cable',
    specModel: '1m',
    unit: '件',
    batchQty: 50,
    availableQty: 15,
    lockedQty: 35,
    productionDate: '2026-03-15',
    expireDate: '2026-07-01',
    supplier: 'Supplier B',
    inboundOrderNo: 'IN002',
    inboundTime: '2026-04-02 10:00:00',
    operator: '李四',
    remark: '库存不足，请及时补货',
    status: 'warning',
    createdAt: '2026-04-02 10:00:00',
    updatedAt: '2026-04-02 10:00:00',
  },
  {
    id: '3',
    batchNo: 'PC26000003',
    warehouseCode: 'WH002',
    productCode: 'SP003',
    sku: 'SKU-B',
    productName: 'Gamma Watch',
    specModel: '49mm',
    unit: '个',
    batchQty: 30,
    availableQty: 0,
    lockedQty: 30,
    productionDate: '2026-04-01',
    expireDate: '2026-05-01',
    supplier: 'Supplier C',
    inboundOrderNo: 'IN003',
    inboundTime: '2026-04-03 10:00:00',
    operator: '王五',
    remark: '质检锁定中',
    status: 'locked',
    createdAt: '2026-04-03 10:00:00',
    updatedAt: '2026-04-03 10:00:00',
  },
]

describe('calculateBatchInventoryStats', () => {
  it('summarizes batch count, unique SKUs, quantity, warnings, and locks', () => {
    expect(calculateBatchInventoryStats(rows)).toEqual({
      totalBatches: 3,
      totalSku: 2,
      totalQty: 180,
      warningCount: 1,
      lockedCount: 1,
    })
  })
})

describe('filterBatchRows', () => {
  it('filters by keyword across batch number, product name, and SKU', () => {
    expect(filterBatchRows(rows, { keyword: 'beta', dateRange: [] }).map((row) => row.id)).toEqual(['2'])
    expect(filterBatchRows(rows, { keyword: 'PC26000003', dateRange: [] }).map((row) => row.id)).toEqual(['3'])
    expect(filterBatchRows(rows, { keyword: 'sku-a', dateRange: [] }).map((row) => row.id)).toEqual(['1'])
  })

  it('filters by warehouse, status, and production date range together', () => {
    expect(filterBatchRows(rows, {
      keyword: '',
      warehouse: 'WH002',
      status: 'locked',
      dateRange: ['2026-03-20', '2026-04-05'],
    }).map((row) => row.id)).toEqual(['3'])
  })
})

describe('paginateBatchRows', () => {
  it('returns only the rows for the requested page', () => {
    const generatedRows = createBatchRows(5)

    expect(paginateBatchRows(generatedRows, { page: 2, pageSize: 2 }).map((row) => row.id)).toEqual([
      generatedRows[2].id,
      generatedRows[3].id,
    ])
  })
})
