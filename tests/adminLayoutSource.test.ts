import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const adminLayoutSource = readFileSync(
  new URL('../src/layouts/AdminLayout.vue', import.meta.url),
  'utf-8',
)

const getStyleRule = (selector: string) => {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return adminLayoutSource.match(new RegExp(`${escapedSelector}\\s*\\{(?<style>[^}]*)\\}`, 's'))?.groups?.style ?? ''
}

describe('AdminLayout content spacing source', () => {
  it('keeps desktop workspace content inset at 32px on both sides', () => {
    const adminContentRule = getStyleRule('.admin-content')

    expect(adminContentRule).toContain('padding: 0 32px 24px;')
    expect(adminContentRule).not.toContain('padding: 0 22px 24px;')
    expect(adminContentRule).not.toContain('scrollbar-gutter: stable;')
  })
})
