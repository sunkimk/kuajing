import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const productDetailSource = readFileSync(
  new URL('../src/views/ProductDetailView.vue', import.meta.url),
  'utf-8',
)

describe('ProductDetailView overview card source', () => {
  it('uses the account-style reference layout for the product overview card', () => {
    expect(productDetailSource).toContain('class="overview-profile"')
    expect(productDetailSource).toContain('class="overview-identity"')
    expect(productDetailSource).toContain('class="overview-title-row"')
    expect(productDetailSource).toContain('class="overview-stats"')
    expect(productDetailSource).toContain('class="overview-stat"')

    expect(productDetailSource).not.toContain('class="overview-right"')
    expect(productDetailSource).not.toContain('class="overview-metric"')
  })

  it('keeps the overview stats focused on three right-side summary values', () => {
    expect(productDetailSource).toContain("label: '平台映射'")
    expect(productDetailSource).toContain("label: '物流标签'")
    expect(productDetailSource).toContain("label: '采购状态'")
    expect(productDetailSource).not.toContain("label: '更新时间'")
  })

  it('keeps the overview card visually compact like the reference console card', () => {
    expect(productDetailSource).toContain('min-height: 104px')
    expect(productDetailSource).toContain('padding: 20px 28px')
    expect(productDetailSource).toContain('width: 64px')
    expect(productDetailSource).toContain('height: 64px')
    expect(productDetailSource).toContain('font-size: 18px')
    expect(productDetailSource).not.toContain('min-height: 152px')
    expect(productDetailSource).not.toContain('padding: 32px 44px')
    expect(productDetailSource).not.toContain('font-size: 24px')
    expect(productDetailSource).not.toContain('font-size: 26px')
  })
})
