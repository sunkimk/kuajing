import { describe, expect, it } from 'vitest'
import {
  TABLE_TEXT_SELECTION_GUARD_CLASS,
  getColumnResizeGuideLeft,
  getColumnResizeGuideLeftFromWidth,
  getHeaderMinimumWidth,
  reorderColumnKeys,
  resolveColumnWidth,
  setTableTextSelectionGuard,
} from '../src/data/tableInteractionHelpers'

describe('reorderColumnKeys', () => {
  it('moves the source column before the target column', () => {
    expect(reorderColumnKeys(['sku', 'name', 'status', 'updatedAt'], 'updatedAt', 'name')).toEqual([
      'sku',
      'updatedAt',
      'name',
      'status',
    ])
  })

  it('returns the original order when source or target is missing', () => {
    expect(reorderColumnKeys(['sku', 'name'], 'status', 'name')).toEqual(['sku', 'name'])
  })
})

describe('resolveColumnWidth', () => {
  it('uses the override width when it is larger than the minimum', () => {
    expect(resolveColumnWidth(220, 160, 120)).toBe(220)
  })

  it('never returns a width smaller than the minimum width', () => {
    expect(resolveColumnWidth(90, 160, 120)).toBe(120)
    expect(resolveColumnWidth(undefined, 100, 140)).toBe(140)
  })
})

describe('getHeaderMinimumWidth', () => {
  it('includes sorter width only for sortable columns', () => {
    expect(getHeaderMinimumWidth(64, true)).toBe(110)
    expect(getHeaderMinimumWidth(64, false)).toBe(88)
  })
})

describe('setTableTextSelectionGuard', () => {
  it('adds and removes the global guard class while interacting with table headers', () => {
    const classes = new Set<string>()
    const classList = {
      add: (className: string) => classes.add(className),
      remove: (className: string) => classes.delete(className),
    }

    setTableTextSelectionGuard(classList, true)
    expect(classes.has(TABLE_TEXT_SELECTION_GUARD_CLASS)).toBe(true)

    setTableTextSelectionGuard(classList, false)
    expect(classes.has(TABLE_TEXT_SELECTION_GUARD_CLASS)).toBe(false)
  })
})

describe('getColumnResizeGuideLeft', () => {
  it('converts a viewport column boundary into a table-relative guide position', () => {
    expect(getColumnResizeGuideLeft(420.4, 120.2)).toBe(300)
  })

  it('keeps the guide inside the visible table area', () => {
    expect(getColumnResizeGuideLeft(90, 120, { minLeft: 0, maxLeft: 500 })).toBe(0)
    expect(getColumnResizeGuideLeft(780, 120, { minLeft: 0, maxLeft: 500 })).toBe(500)
  })
})

describe('getColumnResizeGuideLeftFromWidth', () => {
  it('tracks the actual resolved column width instead of the raw mouse position', () => {
    expect(getColumnResizeGuideLeftFromWidth(240, 160, 120)).toBe(200)
  })
})
