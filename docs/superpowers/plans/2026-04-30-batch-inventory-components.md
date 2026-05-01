# Batch Inventory Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the batch inventory route into layered, reusable Vue components while keeping the existing page behavior intact.

**Architecture:** Move typed batch inventory data helpers into `src/data/batchInventory.ts`, then split the current route SFC into a workbench component, a reusable table component, and two modal components. `src/views/BatchInventoryView.vue` becomes a route shell that renders the workbench, while other pages can import `BatchInventoryTable.vue` directly.

**Tech Stack:** Vue 3 `<script setup>`, TypeScript, Arco Design Vue, Vite, Vitest.

---

### Task 1: Extract Batch Inventory Data Helpers

**Files:**
- Create: `src/data/batchInventory.ts`
- Test: `tests/batchInventory.test.ts`

- [ ] Create exported types for `BatchStatus`, `LogTab`, `BatchColumnKey`, `BatchRow`, `OperateLog`, `BatchInventoryFilters`, and `BatchInventoryPagination`.
- [ ] Move warehouse options, product mock data, supplier/unit/status constants, status labels, and mock factories into `src/data/batchInventory.ts`.
- [ ] Add pure helpers: `formatBatchNumber`, `calculateBatchInventoryStats`, `createSummaryCards`, `filterBatchRows`, `paginateBatchRows`, `getBatchStatusLabel`, `getBatchStatusClass`, `isNearExpire`, and `isExpired`.
- [ ] Add Vitest coverage for summary calculation, keyword/warehouse/status/date filtering, and pagination.
- [ ] Run `npm test -- --run tests/batchInventory.test.ts`.

### Task 2: Create Modal Components

**Files:**
- Create: `src/components/warehouse/BatchInventoryDetailModal.vue`
- Create: `src/components/warehouse/BatchInventoryLogModal.vue`

- [ ] Move the current detail modal template and detail-specific styles into `BatchInventoryDetailModal.vue`.
- [ ] Move the current log modal template, log table columns, active tab state, and log-specific styles into `BatchInventoryLogModal.vue`.
- [ ] Keep modal props/events aligned with the design spec: `visible`, `row` or `logs`, `update:visible`, and `close`.
- [ ] Use helpers from `src/data/batchInventory.ts` for number formatting and status rendering.

### Task 3: Create Reusable Table Component

**Files:**
- Create: `src/components/warehouse/BatchInventoryTable.vue`

- [ ] Move the current table template, pagination block, table column definitions, selection controls, column drag state, resize state, and table-specific styles into `BatchInventoryTable.vue`.
- [ ] Define props: `rows`, `total`, `pagination`, `loading`, and `selectedRowKeys`.
- [ ] Define emits: `update:selectedRowKeys`, `update:pagination`, `row-detail`, and `open-logs`.
- [ ] Keep column ordering, resizing, hover highlighting, date/status/number cell rendering, and operation button behavior intact.
- [ ] Ensure the table can render outside the workbench by declaring required `--batch-*` CSS defaults at the component root.

### Task 4: Create Workbench Component And Slim Route View

**Files:**
- Create: `src/components/warehouse/BatchInventoryWorkbench.vue`
- Modify: `src/views/BatchInventoryView.vue`

- [ ] Move page header, summary strip, filter panel, page-level state, filtering, refresh, detail open/close, and log open/close logic into `BatchInventoryWorkbench.vue`.
- [ ] Wire `BatchInventoryTable`, `BatchInventoryDetailModal`, and `BatchInventoryLogModal` together through props/events.
- [ ] Replace `src/views/BatchInventoryView.vue` with a small shell that imports and renders `BatchInventoryWorkbench`.
- [ ] Keep scoped page styles for header, summary, and filters in `BatchInventoryWorkbench.vue`.

### Task 5: Verify And Clean Up

**Files:**
- Modify as needed based on compiler/test feedback.

- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Confirm the dev server still serves `/warehouse/batch-inventory`.
- [ ] Review `git diff` to ensure only batch inventory componentization files and intended plan/test files changed.
