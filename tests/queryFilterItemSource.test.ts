import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const queryFilterItemSource = readFileSync(
  new URL('../src/components/common/QueryFilterItem.vue', import.meta.url),
  'utf-8',
)

const advertisingStyleSource = readFileSync(
  new URL('../src/components/stores/storeAdvertising.css', import.meta.url),
  'utf-8',
)

describe('QueryFilterItem source', () => {
  it('keeps filter control corners aligned with the product list controls', () => {
    expect(queryFilterItemSource).toContain('--query-filter-radius: var(--workspace-filter-radius, var(--border-radius-medium, 4px));')
    expect(queryFilterItemSource).toContain('border-radius: var(--query-filter-radius) 0 0 var(--query-filter-radius);')
    expect(queryFilterItemSource).toContain('border-radius: 0 var(--query-filter-radius) var(--query-filter-radius) 0;')
    expect(queryFilterItemSource).not.toContain('border-radius: 0 var(--workspace-radius')
  })

  it('keeps multiple selects visually aligned with other filter controls', () => {
    expect(queryFilterItemSource).toContain('.query-filter-item:hover :deep(.arco-select-view-multiple)')
    expect(queryFilterItemSource).toContain('.query-filter-item :deep(.arco-select-view-multiple)')
    expect(queryFilterItemSource).toContain('.query-filter-item :deep(.arco-select-view-multiple .arco-select-view-inner)')
    expect(queryFilterItemSource).toContain('.query-filter-item :deep(.arco-select-view-multiple .arco-select-view-tag)')
    expect(queryFilterItemSource).toMatch(/\.query-filter-item :deep\(\.arco-select-view-multiple \.arco-select-view-inner\)\s*{[^}]*display: flex;[^}]*height: 100%;[^}]*align-items: center;[^}]*flex-wrap: nowrap;[^}]*overflow: hidden;/)
    expect(queryFilterItemSource).toMatch(/\.query-filter-item :deep\(\.arco-select-view-multiple \.arco-select-view-tag\),[\s\S]*\.query-filter-item :deep\(\.arco-select-view-multiple \.arco-select-view-input\)\s*{[^}]*flex-shrink: 0;/)
    expect(queryFilterItemSource).toMatch(/\.query-filter-item :deep\(\.arco-select-view-multiple \.arco-select-view-tag:first-child\)\s*{[^}]*flex-shrink: 0;/)
    expect(advertisingStyleSource).not.toContain('.advertising-filter-panel .arco-select-view-multiple')
  })
})
