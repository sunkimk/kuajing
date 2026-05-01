export const reorderColumnKeys = <T extends string>(order: T[], source: T, target: T) => {
  const sourceIndex = order.indexOf(source)
  const targetIndex = order.indexOf(target)

  if (sourceIndex < 0 || targetIndex < 0 || source === target) {
    return [...order]
  }

  const nextOrder = [...order]
  nextOrder.splice(sourceIndex, 1)
  nextOrder.splice(targetIndex, 0, source)
  return nextOrder
}

export const resolveColumnWidth = (
  overrideWidth: number | undefined,
  fallbackWidth: number,
  minWidth: number,
) => Math.max(overrideWidth ?? fallbackWidth, minWidth)

export const getHeaderMinimumWidth = (
  titleWidth: number,
  sortable: boolean,
  options: {
    sidePadding?: number
    sorterWidth?: number
    iconGap?: number
  } = {},
) => {
  const sidePadding = options.sidePadding ?? 12
  const sorterWidth = options.sorterWidth ?? 18
  const iconGap = options.iconGap ?? 4

  return titleWidth + sidePadding * 2 + (sortable ? iconGap + sorterWidth : 0)
}

const clamp = (value: number, minValue?: number, maxValue?: number) => {
  const minClampedValue = minValue === undefined ? value : Math.max(value, minValue)
  return maxValue === undefined ? minClampedValue : Math.min(minClampedValue, maxValue)
}

type ColumnResizeGuideOptions = {
  minLeft?: number
  maxLeft?: number
}

export const getColumnResizeGuideLeft = (
  viewportX: number,
  containerLeft: number,
  options: ColumnResizeGuideOptions = {},
) => clamp(Math.round(viewportX - containerLeft), options.minLeft, options.maxLeft)

export const getColumnResizeGuideLeftFromWidth = (
  startGuideLeft: number,
  startWidth: number,
  nextWidth: number,
  options: ColumnResizeGuideOptions = {},
) => clamp(Math.round(startGuideLeft - startWidth + nextWidth), options.minLeft, options.maxLeft)

export const TABLE_TEXT_SELECTION_GUARD_CLASS = 'configurable-table-is-interacting'

export const setTableTextSelectionGuard = (
  classList: Pick<DOMTokenList, 'add' | 'remove'> | null | undefined,
  enabled: boolean,
) => {
  if (!classList) return

  if (enabled) {
    classList.add(TABLE_TEXT_SELECTION_GUARD_CLASS)
    return
  }

  classList.remove(TABLE_TEXT_SELECTION_GUARD_CLASS)
}
