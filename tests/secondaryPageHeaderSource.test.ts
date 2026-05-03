import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const headerComponentUrl = new URL('../src/components/common/SecondaryPageHeader.vue', import.meta.url)
const productDetailSource = readFileSync(
  new URL('../src/views/ProductDetailView.vue', import.meta.url),
  'utf-8',
)

describe('SecondaryPageHeader source', () => {
  it('provides a compact detail header structure used by second-level pages', () => {
    expect(existsSync(headerComponentUrl)).toBe(true)

    const componentSource = readFileSync(headerComponentUrl, 'utf-8')
    expect(componentSource).toContain('class="secondary-page-header"')
    expect(componentSource).toContain('class="secondary-page-header-title-row"')
    expect(componentSource).toContain('class="secondary-page-header-status"')
    expect(componentSource).toContain('statusTone')
    expect(componentSource).toContain('IconArrowLeft')
    expect(componentSource).not.toContain('secondary-page-header-breadcrumb')
  })

  it('is used by the product create and edit page', () => {
    expect(productDetailSource).toContain("import SecondaryPageHeader")
    expect(productDetailSource).toContain('<SecondaryPageHeader')
    expect(productDetailSource).not.toContain(':description=')
    expect(productDetailSource).not.toContain('pageDescription')
    expect(productDetailSource).not.toContain(':status-text=')
    expect(productDetailSource).not.toContain(':status-tone=')
    expect(productDetailSource).not.toContain('pageStatusText')
    expect(productDetailSource).not.toContain('pageStatusTone')
    expect(productDetailSource).not.toContain(':breadcrumbs=')
  })
})
