import type { TableColumnData } from '@arco-design/web-vue'
import type { ColumnSettingsOption } from './columnSettings'

export type ConfigurableTableColumn<Key extends string = string> = TableColumnData & {
  settingsKey?: Key
}

const getConfigurableTableColumnCandidateKey = <Key extends string>(
  column: ConfigurableTableColumn<Key> | TableColumnData | undefined,
) => {
  const settingsKey = (column as ConfigurableTableColumn<Key> | undefined)?.settingsKey
  if (settingsKey) return settingsKey

  const dataIndex = column?.dataIndex
  if (typeof dataIndex === 'string') return dataIndex as Key

  return undefined
}

export const createConfigurableTableColumnKeys = <Key extends string>(
  columns: ConfigurableTableColumn<Key>[],
) => {
  const keys: Key[] = []

  columns.forEach((column) => {
    const key = getConfigurableTableColumnCandidateKey(column)
    if (key && !keys.includes(key)) keys.push(key)
  })

  return keys
}

export const getConfigurableTableColumnKey = <Key extends string>(
  column: ConfigurableTableColumn<Key> | TableColumnData | undefined,
  validKeys: Set<Key>,
) => {
  const settingsKey = (column as ConfigurableTableColumn<Key> | undefined)?.settingsKey
  if (settingsKey && validKeys.has(settingsKey)) return settingsKey

  const dataIndex = column?.dataIndex
  if (typeof dataIndex === 'string' && validKeys.has(dataIndex as Key)) {
    return dataIndex as Key
  }

  return undefined
}

export const createTableColumnSettingsOptions = <Key extends string>(
  columns: ConfigurableTableColumn<Key>[],
  defaultVisibleKeys: Key[],
): ColumnSettingsOption<Key>[] => {
  const columnKeys = createConfigurableTableColumnKeys(columns)
  const columnKeySet = new Set(columnKeys)
  const defaultVisibleKeySet = new Set(defaultVisibleKeys)
  const optionKeys = [
    ...defaultVisibleKeys.filter((key) => columnKeySet.has(key)),
    ...columnKeys.filter((key) => !defaultVisibleKeySet.has(key)),
  ]

  return optionKeys
    .map((key) => {
      const column = columns.find((item) => getConfigurableTableColumnKey(item, columnKeySet) === key)
      if (!column) return undefined

      return {
        key,
        title: typeof column.title === 'string' ? column.title : key,
      }
    })
    .filter((option): option is ColumnSettingsOption<Key> => Boolean(option))
}

export const mergeConfirmedColumnOrder = <Key extends string>(
  confirmedVisibleKeys: Key[],
  defaultVisibleKeys: Key[],
) => [
  ...confirmedVisibleKeys,
  ...defaultVisibleKeys.filter((key) => !confirmedVisibleKeys.includes(key)),
]

export const isConfigurableTableColumnReorderable = <Key extends string>(
  columnKey: Key | undefined,
  pinnedColumnKeys: Set<Key>,
) => Boolean(columnKey && !pinnedColumnKeys.has(columnKey))

export const getConfigurableTableColumnFixedSide = (
  columnIndex: number,
  columnCount: number,
  options: {
    freezeFirstColumn: boolean
    freezeLastColumn: boolean
    hasOperationColumn: boolean
  },
) => {
  if (options.freezeFirstColumn && columnIndex === 0) return 'left' as const
  if (options.freezeLastColumn && !options.hasOperationColumn && columnIndex === columnCount - 1) return 'right' as const

  return undefined
}
