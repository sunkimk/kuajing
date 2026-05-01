import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const headerComponentUrl = new URL('../src/components/common/SecondaryPageHeader.vue', import.meta.url)
const productDetailSource = readFileSync(
  new URL('../src/views/ProductDetailView.vue', import.meta.url),
  'utf-8',
)

describe('SecondaryPageHeader source', () => {
  it('provides the PageHeader structure used by second-level pages', () => {
    expect(existsSync(headerComponentUrl)).toBe(true)

    const componentSource = readFileSync(headerComponentUrl, 'utf-8')
    expect(componentSource).toContain('class="secondary-page-header"')
    expect(componentSource).toContain('class="secondary-page-header-breadcrumb"')
    expect(componentSource).toContain('class="secondary-page-header-title-row"')
    expect(componentSource).toContain('class="secondary-page-header-divider"')
    expect(componentSource).toContain('IconArrowLeft')
  })

  it('is used by the product create and edit page', () => {
    expect(productDetailSource).toContain("import SecondaryPageHeader")
    expect(productDetailSource).toContain('<SecondaryPageHeader')
    expect(productDetailSource).toContain(":breadcrumbs=\"['商品管理', '商品列表', pageTitle]\"")
  })
})
