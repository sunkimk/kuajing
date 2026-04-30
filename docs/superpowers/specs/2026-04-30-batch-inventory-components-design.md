# Batch Inventory Componentization Design

## Goal

Refactor the batch inventory page into reusable Vue components so the full page can keep its current behavior while other pages can reuse only the batch inventory table module when needed.

## Scope

In scope:

- Keep `/warehouse/batch-inventory` visually and behaviorally equivalent after the refactor.
- Split the current single-file page into layered components.
- Support two reuse modes: full batch inventory workbench and table-only embed.
- Move batch inventory types, mock data, labels, statistics, and filtering helpers out of the route view.
- Preserve the current table interactions: row selection, pagination, column order, column width resizing, column hover highlight, detail opening, and log opening.

Out of scope:

- Replacing mock data with backend APIs.
- Redesigning the page layout.
- Creating a generic inventory workbench for every warehouse module.
- Persisting user table settings.

## Component Boundaries

`src/views/BatchInventoryView.vue`

- Route-level shell only.
- Renders `BatchInventoryWorkbench`.
- Owns no batch inventory business logic after the refactor.

`src/components/warehouse/BatchInventoryWorkbench.vue`

- Full-page batch inventory experience.
- Owns filters, loading state, selected row keys, current detail row, log modal state, and pagination state.
- Uses shared data helpers to create mock rows, filter rows, calculate summary cards, and create operation logs.
- Renders the page header, summary strip, filter panel, `BatchInventoryTable`, `BatchInventoryDetailModal`, and `BatchInventoryLogModal`.

`src/components/warehouse/BatchInventoryTable.vue`

- Reusable table-only module.
- Receives rows, filtered total, pagination, loading, and selected row keys through props.
- Emits interaction events instead of owning page-level actions.
- Keeps table-specific UI behavior such as column order, column resizing, column hover state, column slot rendering, and row selection controls.
- Can be imported by other pages without also importing the summary strip or filter panel.

`src/components/warehouse/BatchInventoryDetailModal.vue`

- Displays one batch inventory row in the current detail layout.
- Receives `visible` and `row`.
- Emits `update:visible` or `close`.

`src/components/warehouse/BatchInventoryLogModal.vue`

- Displays operation logs and the empty cost-adjustment tab.
- Receives `visible`, `logs`, and optional active tab.
- Emits `update:visible` or `close`.

`src/data/batchInventory.ts`

- Exports `BatchStatus`, `LogTab`, `BatchColumnKey`, `BatchRow`, `OperateLog`, and filter/pagination types.
- Exports warehouse/status option constants.
- Exports mock row/log factories.
- Exports pure helpers for summary calculation, filtering, status label lookup, date-state checks, and number/date formatting where appropriate.

## Table Props And Events

`BatchInventoryTable` props:

- `rows: BatchRow[]`
- `total: number`
- `pagination: { page: number; pageSize: number }`
- `loading?: boolean`
- `selectedRowKeys: string[]`

`BatchInventoryTable` events:

- `update:selectedRowKeys: string[]`
- `update:pagination: { page: number; pageSize: number }`
- `row-detail: BatchRow`
- `open-logs: BatchRow`

The component may expose table wrapper refs internally, but consumers should not depend on DOM refs.

## Data Flow

Full page reuse:

`BatchInventoryView -> BatchInventoryWorkbench -> BatchInventoryTable + BatchInventoryDetailModal + BatchInventoryLogModal`

Table-only reuse:

`OtherPage -> BatchInventoryTable`

In the full workbench path, the workbench filters the complete row set, slices the current page, and passes only the visible page rows to the table. In the table-only path, the parent page is responsible for supplying rows, totals, pagination, and selected keys.

## Styling

Move existing scoped CSS with the component it belongs to:

- Page header, summary strip, and filter panel styles live in `BatchInventoryWorkbench.vue`.
- Table shell, header interaction, table cells, status pills, numbers, and pagination styles live in `BatchInventoryTable.vue`.
- Detail modal styles live in `BatchInventoryDetailModal.vue`.
- Log modal styles live in `BatchInventoryLogModal.vue`.

Keep the current `--batch-*` CSS variables at the workbench root and re-declare the required defaults on table/modal roots so table-only usage still renders correctly outside the workbench.

## Testing

Add focused tests for pure helpers in `src/data/batchInventory.ts`:

- Summary calculation returns batch count, SKU count, total quantity, warning count, and locked count.
- Filtering handles keyword, warehouse, status, and production date range.
- Pagination slicing behavior remains parent-owned and simple.

Keep the existing `tableInteractionHelpers` tests. Do not over-test Arco table internals.

## Acceptance Criteria

- `/warehouse/batch-inventory` keeps the current UI structure and interactions.
- Other pages can import `BatchInventoryTable` without rendering summary cards, filters, or modals.
- TypeScript build passes.
- Existing and new Vitest tests pass.
