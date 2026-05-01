import { reorderColumnKeys } from './tableInteractionHelpers'

export type ColumnSettingsPanelMode = 'selected' | 'unselected'

export type ColumnSettingsOption<Key extends string = string> = {
  key: Key
  title: string
}

export type ColumnSettingsPayload<Key extends string = string> = {
  visibleKeys: Key[]
  autoWrap: boolean
  freezeFirstRow: boolean
  freezeFirstColumn: boolean
  freezeLastColumn: boolean
}

export const filterColumnSettingsOptions = <Key extends string>(
  options: ColumnSettingsOption<Key>[],
  visibleKeys: Key[],
  panelMode: ColumnSettingsPanelMode,
  keyword: string,
) => {
  const visibleKeySet = new Set(visibleKeys)
  const panelOptions = panelMode === 'selected'
    ? visibleKeys
        .map((key) => options.find((option) => option.key === key))
        .filter((option): option is ColumnSettingsOption<Key> => Boolean(option))
    : options.filter((option) => !visibleKeySet.has(option.key))

  const normalizedKeyword = keyword.trim().toLowerCase()
  if (!normalizedKeyword) return panelOptions

  return panelOptions.filter((option) =>
    option.title.toLowerCase().includes(normalizedKeyword)
      || option.key.toLowerCase().includes(normalizedKeyword)
  )
}

export const toggleColumnSettingsKey = <Key extends string>(
  visibleKeys: Key[],
  key: Key,
  checked: boolean | (string | number | boolean)[],
  requiredKeys: Key[] = [],
) => {
  if (requiredKeys.includes(key)) return [...visibleKeys]

  const isChecked = Array.isArray(checked) ? checked.includes(key) : checked
  if (isChecked && !visibleKeys.includes(key)) return [...visibleKeys, key]
  if (!isChecked) return visibleKeys.filter((item) => item !== key)
  return [...visibleKeys]
}

export const moveColumnSettingsKey = <Key extends string>(
  visibleKeys: Key[],
  sourceKey: Key | undefined,
  targetKey: Key,
) => {
  if (!sourceKey || sourceKey === targetKey) return [...visibleKeys]
  return reorderColumnKeys(visibleKeys, sourceKey, targetKey)
}

export const getColumnSettingsCounts = <Key extends string>(
  options: ColumnSettingsOption<Key>[],
  visibleKeys: Key[],
) => ({
  selectedCount: visibleKeys.length,
  hiddenCount: Math.max(0, options.length - visibleKeys.length),
})
