import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const navigationSource = readFileSync(
  new URL('../src/data/navigation.ts', import.meta.url),
  'utf-8',
)

const routerSource = readFileSync(
  new URL('../src/router/index.ts', import.meta.url),
  'utf-8',
)

const homeViewSource = readFileSync(
  new URL('../src/views/StoreManagementHomeView.vue', import.meta.url),
  'utf-8',
)

const workbenchSource = readFileSync(
  new URL('../src/components/stores/StoreManagementWorkbench.vue', import.meta.url),
  'utf-8',
)

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
    expect(workbenchSource).toContain('新增店铺')
  })
})
