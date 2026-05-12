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

describe('product metadata navigation source', () => {
  it('adds brand and category data pages under product management', () => {
    expect(navigationSource).toContain("{ key: 'product-brands', title: '品牌资料', path: '/products/brands'")
    expect(navigationSource).toContain("{ key: 'product-categories', title: '品类资料', path: '/products/categories'")
  })

  it('routes product metadata pages to real views instead of placeholders', () => {
    expect(routerSource).toContain("import ProductBrandView from '../views/ProductBrandView.vue'")
    expect(routerSource).toContain("import ProductCategoryView from '../views/ProductCategoryView.vue'")
    expect(routerSource).toContain("item.path !== '/products/brands'")
    expect(routerSource).toContain("item.path !== '/products/categories'")
    expect(routerSource).toContain("path: 'products/brands'")
    expect(routerSource).toContain("component: ProductBrandView")
    expect(routerSource).toContain("path: 'products/categories'")
    expect(routerSource).toContain("component: ProductCategoryView")
  })
})
