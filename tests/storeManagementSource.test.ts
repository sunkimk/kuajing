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

const panelSource = readFileSync(
  new URL('../src/components/stores/StoreHealthActionPanel.vue', import.meta.url),
  'utf-8',
)

const styleSource = readFileSync(
  new URL('../src/components/stores/storeManagement.css', import.meta.url),
  'utf-8',
)

describe('store management homepage source', () => {
  it('keeps the existing store menu label and points /stores/list to the real homepage', () => {
    expect(navigationSource).toContain("{ key: 'store-list', title: '店铺列表', path: '/stores/list'")
    expect(routerSource).toContain("import StoreManagementHomeView from '../views/StoreManagementHomeView.vue'")
    expect(routerSource).toMatch(/\{\s*path:\s*'stores\/list',[\s\S]*?component:\s*StoreManagementHomeView,[\s\S]*?meta:\s*\{[\s\S]*?title:\s*'店铺列表'/)
    expect(routerSource).toContain("path: 'stores/add'")
  })

  it('renders the simplified homepage through the workbench wrapper', () => {
    expect(homeViewSource).toContain('<StoreManagementWorkbench />')
    expect(workbenchSource).toContain('StoreHealthActionPanel')
    expect(workbenchSource).toContain('店铺列表')
    expect(workbenchSource).toContain('我的店铺')
    expect(workbenchSource).toContain('filter-panel-shell volc-design-common-table-query')
    expect(workbenchSource).toContain('volc-design-search-item-wrap')
    expect(panelSource).toContain('a-dropdown')
    expect(panelSource).toContain('store-card-grid')
    expect(panelSource).toContain('创建新店铺')
    expect(panelSource).toContain('store-showcase-toolbar')
    expect(panelSource).toContain("@click=\"emit('createStore')\"")
    expect(workbenchSource).toContain('@create-store="handleCreateStore"')
    expect(workbenchSource).not.toContain('创建新店铺')
    expect(workbenchSource).toContain('集中查看我的店铺、授权状态与同步情况')
    expect(workbenchSource).not.toContain('卡片视图和表格视图之间快速切换')
    expect(workbenchSource).not.toContain('MetricSummaryStrip')
    expect(workbenchSource).not.toContain('ConfigurableDataTable')
    expect(workbenchSource).not.toContain('store-table-section')
    expect(styleSource).toContain('.store-management-workbench .header-left')
    expect(styleSource).not.toContain('\n.header-left {')
    expect(styleSource).not.toMatch(/\.store-showcase\s*\{[^}]*border:/s)
    expect(styleSource).toContain('.store-showcase-head {\n  padding: 0 2px;')
    expect(styleSource).toContain('.store-card-grid {\n  padding: 0;')
    expect(styleSource).toContain('.store-empty-state {\n  display: flex;')
    expect(styleSource).toContain('padding: 20px 0;')
    expect(styleSource).toContain('.store-card:hover,\n.store-card:focus-within {')
    expect(styleSource).toContain('transform: translateY(-2px);')
    expect(styleSource).toContain('.store-showcase-toolbar .arco-btn-primary .arco-icon {')
    expect(styleSource).toContain('color: #fff;')
    expect(styleSource).toContain('.store-card:hover .store-card-title,\n.store-card:focus-within .store-card-title {')
    expect(styleSource).toContain('.store-card:hover .store-more-button,\n.store-card:focus-within .store-more-button {')
    expect(panelSource).not.toContain('卡片视图')
    expect(panelSource).not.toContain('表格视图')
    expect(panelSource).not.toContain('store-table-view')
    expect(panelSource).not.toContain('viewMode')
    expect(workbenchSource).not.toContain('displayMode')
    expect(workbenchSource).not.toContain('toggle-view')
    expect(panelSource).not.toContain('待处理')
    expect(panelSource).not.toContain('快捷入口')
    expect(panelSource).not.toContain('重点店铺')
    expect(panelSource).not.toContain('featured-store-card')
  })
})
