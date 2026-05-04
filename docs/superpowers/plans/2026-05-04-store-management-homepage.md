# Store Management Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `/stores/list` with a real store-management homepage workbench that surfaces health, issues, quick actions, and the store table while preserving the current workbench visual language.

**Architecture:** Keep all store-specific rules in one typed data module, then build the page as a thin route view plus a workbench, action panel, and detail drawer. The router gets one real homepage route and one light `/stores/add` placeholder route so the homepage can point somewhere concrete without dragging full form work into this iteration.

**Tech Stack:** Vue 3, TypeScript, Vue Router, Arco Design Vue, Vitest

---

## File Structure

- Create `src/data/storeManagement.ts`: store types, mock rows, summary cards, issue buckets, filters, sorting, pagination, and status helpers.
- Create `src/views/StoreManagementHomeView.vue`: thin wrapper that renders the homepage workbench.
- Create `src/components/stores/StoreManagementWorkbench.vue`: page shell, metrics, filter bar, table, drawer state, and top-level actions.
- Create `src/components/stores/StoreHealthActionPanel.vue`: left-side issue buckets and right-side quick actions.
- Create `src/components/stores/StoreDetailDrawer.vue`: lightweight store detail drawer.
- Create `src/components/stores/storeManagement.css`: homepage-specific layout and state styling.
- Modify `src/router/index.ts`: swap `/stores/list` from placeholder to real view and add `/stores/add` as a light placeholder route.
- Leave `src/data/navigation.ts` unchanged: the menu entry still reads `店铺列表`.
- Create `tests/storeManagementData.test.ts`: pure helper coverage.
- Create `tests/storeManagementSource.test.ts`: router, view, and workbench source assertions.

## Task 1: Lock the store homepage contract with failing tests

**Files:**
- Create: `tests/storeManagementData.test.ts`
- Create: `tests/storeManagementSource.test.ts`

- [ ] **Step 1: Write the failing data-helper tests**

```ts
import { describe, expect, it } from 'vitest'
import {
  calculateStoreStats,
  createStoreIssueCards,
  filterStoreRows,
  paginateStoreRows,
  type StoreRecord,
} from '../src/data/storeManagement'

const rows: StoreRecord[] = [
  {
    id: '1',
    platform: 'Wildberries',
    storeName: 'WB 旗舰店',
    storeCode: 'WB-001',
    authorizationStatus: 'active',
    syncStatus: 'healthy',
    issueType: undefined,
    region: 'RU',
    lastSyncAt: '2026-05-03 11:00',
    sevenDayOrders: 18,
    owner: 'Alice',
  },
  {
    id: '2',
    platform: 'Ozon',
    storeName: 'OZON 店铺',
    storeCode: 'OZ-002',
    authorizationStatus: 'expired',
    syncStatus: 'failed',
    issueType: 'auth-expired',
    region: 'KZ',
    lastSyncAt: '2026-05-03 08:00',
    sevenDayOrders: 5,
    owner: 'Bob',
  },
  {
    id: '3',
    platform: 'AliExpress',
    storeName: 'AE 店铺',
    storeCode: 'AE-003',
    authorizationStatus: 'active',
    syncStatus: 'warning',
    issueType: 'sync-overdue',
    region: 'EU',
    lastSyncAt: '2026-05-02 09:00',
    sevenDayOrders: 9,
    owner: 'Cindy',
  },
]

describe('storeManagement helpers', () => {
  it('summarizes the homepage health strip', () => {
    expect(calculateStoreStats(rows)).toEqual({
      totalStores: 3,
      healthyStores: 1,
      authIssueStores: 1,
      syncIssueStores: 2,
    })
  })

  it('builds the issue buckets used by the action panel', () => {
    expect(createStoreIssueCards(rows)).toEqual([
      { key: 'auth-expired', label: '授权失效', value: 1, note: '需重新授权' },
      { key: 'api-missing', label: 'API 配置缺失', value: 0, note: '影响同步' },
      { key: 'sync-failed', label: '最近同步失败', value: 0, note: '待处理' },
      { key: 'sync-overdue', label: '超时未同步', value: 1, note: '超过阈值' },
    ])
  })

  it('filters and paginates the store table rows', () => {
    expect(filterStoreRows(rows, {
      keyword: 'oz-002',
      platform: undefined,
      authorizationStatus: undefined,
      syncStatus: undefined,
      issueType: undefined,
    }).map((row) => row.id)).toEqual(['2'])

    expect(paginateStoreRows(rows, { page: 2, pageSize: 2 }).map((row) => row.id)).toEqual(['3'])
  })
})
```

- [ ] **Step 2: Write the failing source tests for routing and page wiring**

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const navigationSource = readFileSync(new URL('../src/data/navigation.ts', import.meta.url), 'utf-8')
const routerSource = readFileSync(new URL('../src/router/index.ts', import.meta.url), 'utf-8')
const homeViewSource = readFileSync(new URL('../src/views/StoreManagementHomeView.vue', import.meta.url), 'utf-8')
const workbenchSource = readFileSync(new URL('../src/components/stores/StoreManagementWorkbench.vue', import.meta.url), 'utf-8')

describe('store management homepage source', () => {
  it('keeps the existing store menu label and points /stores/list to the real homepage', () => {
    expect(navigationSource).toContain("{ key: 'store-list', title: '店铺列表', path: '/stores/list'")
    expect(routerSource).toContain("import StoreManagementHomeView from '../views/StoreManagementHomeView.vue'")
    expect(routerSource).toContain("path: 'stores/list'")
    expect(routerSource).toContain('component: StoreManagementHomeView')
    expect(routerSource).toContain("path: 'stores/add'")
  })

  it('renders the homepage through the workbench wrapper', () => {
    expect(homeViewSource).toContain('<StoreManagementWorkbench />')
    expect(workbenchSource).toContain('MetricSummaryStrip')
    expect(workbenchSource).toContain('StoreHealthActionPanel')
    expect(workbenchSource).toContain('ConfigurableDataTable')
    expect(workbenchSource).toContain("新增店铺")
  })
})
```

- [ ] **Step 3: Run the targeted suite and confirm it fails**

Run: `npm test -- tests/storeManagementData.test.ts tests/storeManagementSource.test.ts`

Expected: fail with missing module / missing file errors because `src/data/storeManagement.ts` and the homepage files do not exist yet.

- [ ] **Step 4: Commit the red tests**

```bash
git add tests/storeManagementData.test.ts tests/storeManagementSource.test.ts
git commit -m "test: capture store management homepage contract"
```

## Task 2: Build the shared store data module

**Files:**
- Create: `src/data/storeManagement.ts`
- Modify: `tests/storeManagementData.test.ts`

- [ ] **Step 1: Implement the typed data contract and pure helpers**

```ts
export type StoreAuthorizationStatus = 'active' | 'expired' | 'pending'
export type StoreSyncStatus = 'healthy' | 'warning' | 'failed'
export type StoreIssueType = 'auth-expired' | 'api-missing' | 'sync-failed' | 'sync-overdue'

export type StoreRecord = {
  id: string
  platform: string
  storeName: string
  storeCode: string
  authorizationStatus: StoreAuthorizationStatus
  syncStatus: StoreSyncStatus
  issueType?: StoreIssueType
  region: string
  lastSyncAt: string
  sevenDayOrders: number
  owner: string
}

export type StoreFilterState = {
  keyword: string
  platform?: string
  authorizationStatus?: StoreAuthorizationStatus
  syncStatus?: StoreSyncStatus
  issueType?: StoreIssueType
}

export const createDefaultStoreFilters = (): StoreFilterState => ({
  keyword: '',
  platform: undefined,
  authorizationStatus: undefined,
  syncStatus: undefined,
  issueType: undefined,
})

export const createStoreRows = (): StoreRecord[] => ([
  {
    id: 'wb-ru-01',
    platform: 'Wildberries',
    storeName: 'Wildberries 俄罗斯旗舰店',
    storeCode: 'WB-RU-01',
    authorizationStatus: 'active',
    syncStatus: 'healthy',
    issueType: undefined,
    region: 'RU',
    lastSyncAt: '2026-05-04 10:30',
    sevenDayOrders: 128,
    owner: 'Daria',
  },
])

export const calculateStoreStats = (rows: StoreRecord[]) => ({
  totalStores: rows.length,
  healthyStores: rows.filter((row) => row.authorizationStatus === 'active' && row.syncStatus === 'healthy').length,
  authIssueStores: rows.filter((row) => row.authorizationStatus !== 'active').length,
  syncIssueStores: rows.filter((row) => row.syncStatus !== 'healthy').length,
})

export const createStoreSummaryCards = (rows: StoreRecord[]) => {
  const stats = calculateStoreStats(rows)

  return [
    { label: '已接入店铺', value: String(stats.totalStores), note: '全部店铺' },
    { label: '正常运行', value: String(stats.healthyStores), note: '授权和同步正常' },
    { label: '授权异常', value: String(stats.authIssueStores), note: '需重新授权' },
    { label: '同步异常', value: String(stats.syncIssueStores), note: '待处理' },
  ]
}
```

Then add:

```ts
export const createStoreIssueCards = (rows: StoreRecord[]) => [
  { key: 'auth-expired', label: '授权失效', value: rows.filter((row) => row.issueType === 'auth-expired').length, note: '需重新授权' },
  { key: 'api-missing', label: 'API 配置缺失', value: rows.filter((row) => row.issueType === 'api-missing').length, note: '影响同步' },
  { key: 'sync-failed', label: '最近同步失败', value: rows.filter((row) => row.issueType === 'sync-failed').length, note: '待处理' },
  { key: 'sync-overdue', label: '超时未同步', value: rows.filter((row) => row.issueType === 'sync-overdue').length, note: '超过阈值' },
]

export const filterStoreRows = (rows: StoreRecord[], filters: StoreFilterState) => rows.filter((row) => {
  const keyword = filters.keyword.trim().toLowerCase()
  const matchesKeyword = keyword === ''
    || [row.platform, row.storeName, row.storeCode, row.region, row.owner].join(' ').toLowerCase().includes(keyword)

  return matchesKeyword
    && (filters.platform ? row.platform === filters.platform : true)
    && (filters.authorizationStatus ? row.authorizationStatus === filters.authorizationStatus : true)
    && (filters.syncStatus ? row.syncStatus === filters.syncStatus : true)
    && (filters.issueType ? row.issueType === filters.issueType : true)
})

export const paginateStoreRows = (rows: StoreRecord[], pagination: { page: number; pageSize: number }) =>
  rows.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize)
```

- [ ] **Step 2: Add mock seed rows and status label/class helpers**

Add a small deterministic seed set and helper functions such as:

```ts
export const getStoreAuthorizationStatusLabel = (status: StoreAuthorizationStatus) => ({
  active: '正常',
  expired: '已失效',
  pending: '待授权',
})[status]

export const getStoreSyncStatusLabel = (status: StoreSyncStatus) => ({
  healthy: '正常',
  warning: '需关注',
  failed: '失败',
})[status]
```

Keep the labels short so the table pills stay compact.

- [ ] **Step 3: Re-run the helper tests until they pass**

Run: `npm test -- tests/storeManagementData.test.ts`

Expected: PASS once `src/data/storeManagement.ts` exists and exports the helpers used by the test.

- [ ] **Step 4: Commit the data module**

```bash
git add src/data/storeManagement.ts tests/storeManagementData.test.ts
git commit -m "feat: add store management data module"
```

## Task 3: Build the homepage workbench and drawer

**Files:**
- Create: `src/views/StoreManagementHomeView.vue`
- Create: `src/components/stores/StoreManagementWorkbench.vue`
- Create: `src/components/stores/StoreHealthActionPanel.vue`
- Create: `src/components/stores/StoreDetailDrawer.vue`
- Create: `src/components/stores/storeManagement.css`
- Modify: `tests/storeManagementSource.test.ts`

- [ ] **Step 1: Add the thin route wrapper**

```vue
<script setup lang="ts">
import StoreManagementWorkbench from '../components/stores/StoreManagementWorkbench.vue'
</script>

<template>
  <StoreManagementWorkbench />
</template>
```

- [ ] **Step 2: Implement the homepage workbench shell**

Use the same workbench rhythm as the existing sales and warehouse pages:

```ts
const filters = ref(createDefaultStoreFilters())
const pagination = ref({ page: 1, pageSize: 10 })
const settingsVisible = ref(false)
const detailVisible = ref(false)
const currentRow = ref<StoreRecord>()
const allRows = ref(createStoreRows())

const filteredRows = computed(() => filterStoreRows(allRows.value, filters.value))
const summaryCards = computed(() => createStoreSummaryCards(filteredRows.value))
const issueCards = computed(() => createStoreIssueCards(filteredRows.value))
const pagedRows = computed(() => paginateStoreRows(filteredRows.value, pagination.value))
```

The table columns should be fixed up front so the homepage can be tested against a stable surface:

```ts
const columns = [
  { settingsKey: 'platform', title: '平台', slotName: 'platform', width: 120, minWidth: 108 },
  { settingsKey: 'storeName', title: '店铺名称', slotName: 'storeName', width: 220, minWidth: 180 },
  { settingsKey: 'storeCode', title: '店铺编号', dataIndex: 'storeCode', width: 160, minWidth: 140 },
  { settingsKey: 'authorizationStatus', title: '授权状态', slotName: 'authorizationStatus', width: 110, minWidth: 96, align: 'center' },
  { settingsKey: 'syncStatus', title: '同步状态', slotName: 'syncStatus', width: 110, minWidth: 96, align: 'center' },
  { settingsKey: 'region', title: '站点 / 区域', dataIndex: 'region', width: 120, minWidth: 108 },
  { settingsKey: 'lastSyncAt', title: '最近同步时间', dataIndex: 'lastSyncAt', width: 160, minWidth: 150, align: 'center' },
  { settingsKey: 'sevenDayOrders', title: '近 7 天订单', slotName: 'sevenDayOrders', width: 140, minWidth: 120, align: 'right' },
  { title: '操作', slotName: 'operation', width: 110, align: 'center' },
]
```

Render order in the template:

1. `h1` page title + description
2. `MetricSummaryStrip`
3. `StoreHealthActionPanel`
4. `QueryFilterPanel`
5. `ConfigurableDataTable`
6. `StoreDetailDrawer`

- [ ] **Step 3: Implement the issue panel and detail drawer**

`StoreHealthActionPanel.vue` should accept the issue cards and emit selection events for `auth-expired`, `api-missing`, `sync-failed`, and `sync-overdue`. The right side should expose four quick actions:

```ts
['新增店铺', '平台配置', '同步策略', '接入说明']
```

`StoreDetailDrawer.vue` should stay lightweight and show exactly three groups:

- 基础信息
- 状态信息
- 快捷动作

Use `a-drawer` plus compact definition lists so the drawer feels like the rest of the admin app instead of a modal wizard.

Wire the quick actions this way:

- `新增店铺`: `router.push('/stores/add')`
- `平台配置`: `Message.info('平台配置将在下一阶段接入')`
- `同步策略`: `Message.info('同步策略将在下一阶段接入')`
- `接入说明`: `Message.info('接入说明将在下一阶段接入')`

- [ ] **Step 4: Finish the homepage styling**

The stylesheet should define the homepage layout and keep the look aligned with the existing workbench pages:

```css
.store-management-workbench {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 16px;
}

.store-management-main {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(280px, 1fr);
  gap: 16px;
}
```

Keep the border radius at 8px or less, use the same neutral surfaces as the inventory pages, and do not introduce a separate visual system for the homepage.

- [ ] **Step 5: Re-run the source test**

Run: `npm test -- tests/storeManagementSource.test.ts -t "renders the homepage through the workbench wrapper"`

Expected: PASS once the homepage wrapper and component imports exist, even before the router assertions are completed in Task 4.

- [ ] **Step 6: Commit the homepage workbench**

```bash
git add src/views/StoreManagementHomeView.vue src/components/stores/StoreManagementWorkbench.vue src/components/stores/StoreHealthActionPanel.vue src/components/stores/StoreDetailDrawer.vue src/components/stores/storeManagement.css tests/storeManagementSource.test.ts
git commit -m "feat: add store management homepage workbench"
```

## Task 4: Wire the router and reserve `/stores/add`

**Files:**
- Modify: `src/router/index.ts`
- Modify: `tests/storeManagementSource.test.ts`

- [ ] **Step 1: Replace the placeholder route for `/stores/list` with the real homepage**

```ts
import StoreManagementHomeView from '../views/StoreManagementHomeView.vue'
```

Then add the route before `placeholderRoutes`:

```ts
{
  path: 'stores/list',
  component: StoreManagementHomeView,
  meta: {
    title: '店铺管理',
    sectionKey: 'stores',
    sectionTitle: '店铺管理',
    hideBreadcrumb: true,
  },
},
```

Also keep `/stores/list` out of the placeholder route generator:

```ts
const placeholderRoutes = flattenNavigation()
  .filter((item) =>
    item.path !== '/products/core-library'
    && item.path !== '/warehouse/inventory'
    && item.path !== '/warehouse/warehouse-inventory'
    && item.path !== '/warehouse/batch-inventory'
    && item.path !== '/sales/orders'
    && item.path !== '/sales/upsell'
    && item.path !== '/sales/return'
    && item.path !== '/stores/list'
  )
```

- [ ] **Step 2: Add the light placeholder route for `/stores/add`**

```ts
{
  path: 'stores/add',
  component: PlaceholderView,
  meta: {
    title: '新增店铺',
    sectionKey: 'stores',
    sectionTitle: '店铺管理',
    hideBreadcrumb: true,
  },
},
```

This gives the homepage button a real destination without introducing the full add workflow yet.

- [ ] **Step 3: Refresh the source assertions**

Keep the source test focused on the route contract:

```ts
expect(routerSource).toContain("path: 'stores/list'")
expect(routerSource).toContain('component: StoreManagementHomeView')
expect(routerSource).toContain("path: 'stores/add'")
expect(routerSource).toContain("title: '新增店铺'")
```

- [ ] **Step 4: Commit the routing change**

```bash
git add src/router/index.ts tests/storeManagementSource.test.ts
git commit -m "feat: route store management homepage"
```

## Task 5: Final verification

**Files:**
- Modify: none

- [ ] **Step 1: Run the full test suite**

Run: `npm test`

Expected: all Vitest suites pass, including the new store management tests and the existing sales / warehouse coverage.

- [ ] **Step 2: Run the production build**

Run: `npm run build`

Expected: `vue-tsc` and Vite both complete without type or bundling errors.

- [ ] **Step 3: Do a final browser pass**

Open `http://localhost:5173/stores/list` and verify the homepage is no longer a placeholder. Then open `http://localhost:5173/stores/add` and verify the light placeholder route resolves cleanly.

- [ ] **Step 4: Commit the finished branch state**

```bash
git add src docs tests
git commit -m "feat: ship store management homepage"
```

## Self-Review

### Spec Coverage

- Homepage goals and workbench positioning: Task 3
- Summary strip and actionable health metrics: Tasks 2 and 3
- Issue buckets and quick actions: Tasks 2 and 3
- Filter bar and table state: Task 3
- Detail drawer: Task 3
- `/stores/list` route replacement: Task 4
- `/stores/add` placeholder route: Task 4
- Navigation label stays `店铺列表`: Task 1 assertion plus no navigation edits
- Pure helper coverage: Tasks 1 and 2
- Browser verification and build verification: Task 5

### Placeholder Scan

No `TBD`, `TODO`, or vague "handle edge cases later" placeholders are left in the plan.

### Type Consistency

The plan uses one consistent store data vocabulary throughout:

- `StoreRecord`
- `StoreFilterState`
- `StoreAuthorizationStatus`
- `StoreSyncStatus`
- `StoreIssueType`

The helper names also stay consistent across tests and implementation:

- `createDefaultStoreFilters`
- `createStoreRows`
- `calculateStoreStats`
- `createStoreSummaryCards`
- `createStoreIssueCards`
- `filterStoreRows`
- `paginateStoreRows`
