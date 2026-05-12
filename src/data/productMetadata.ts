import type { ConfigurableTableColumn } from './configurableTable'

export type ProductMetadataPageKey = 'brand' | 'category'
export type ProductMetadataStatus = '启用' | '停用'
export type ProductMetadataFilterState = {
  keyword?: string
  parentCategory?: string
  site?: string
  status?: ProductMetadataStatus
}
export type ProductMetadataFormFieldKey =
  | 'parentCategory'
  | 'code'
  | 'name'
  | 'site'
  | 'description'
  | 'shortCode'
  | 'status'

export type ProductMetadataFormField = {
  key: ProductMetadataFormFieldKey
  label: string
  kind: 'input' | 'select'
  required?: boolean
  maxLength?: number
  placeholder?: string
  options?: string[]
  tooltip?: string
}

export type ProductMetadataRow = {
  id: string
  kind: ProductMetadataPageKey
  code: string
  name: string
  description?: string
  status: ProductMetadataStatus
  relatedProductCount: number
  updatedAt: string
  createdBy: string
  parentCategory?: string
  site?: string
  shortCode?: string
}

export type ProductMetadataColumnKey =
  | 'code'
  | 'name'
  | 'parentCategory'
  | 'site'
  | 'shortCode'
  | 'description'
  | 'status'
  | 'relatedProductCount'
  | 'updatedAt'

export type ProductMetadataPageConfig = {
  key: ProductMetadataPageKey
  title: string
  description: string
  primaryAction: string
  modalTitle: string
  editModalTitle: string
  keywordPlaceholder: string
  tableColumns: Array<ConfigurableTableColumn<ProductMetadataColumnKey> & { title: string }>
  defaultVisibleKeys: ProductMetadataColumnKey[]
  requiredKeys: ProductMetadataColumnKey[]
  pinnedColumnKeys: ProductMetadataColumnKey[]
  formFields: ProductMetadataFormField[]
  editFormFields: ProductMetadataFormField[]
}

export type ProductMetadataFormPayload = Partial<Record<ProductMetadataFormFieldKey, string>>
type ProductMetadataTableColumn = ConfigurableTableColumn<ProductMetadataColumnKey> & { title: string }

export const productMetadataCategoryOptions = ['数码配件', '车载配件', '家居日用', '厨具用品', '户外露营']
export const productMetadataSiteOptions = ['Amazon US', 'Ozon RU', 'Wildberries RU', 'TikTok Shop']
export const productMetadataStatusOptions: ProductMetadataStatus[] = ['启用', '停用']
export const productMetadataMoveCategoryOptions = [
  {
    label: '家居日用',
    value: '家居日用',
    children: [
      { label: '厨具用品', value: '厨具用品' },
      { label: '收纳整理', value: '收纳整理' },
      { label: '日用百货', value: '日用百货' },
    ],
  },
  {
    label: '数码配件',
    value: '数码配件',
    children: [
      { label: '手机配件', value: '手机配件' },
      { label: '电脑配件', value: '电脑配件' },
      { label: '音频设备', value: '音频设备' },
    ],
  },
  {
    label: '车载配件',
    value: '车载配件',
    children: [
      { label: '车载收纳', value: '车载收纳' },
      { label: '车载充电', value: '车载充电' },
    ],
  },
  {
    label: '户外露营',
    value: '户外露营',
    children: [
      { label: '露营照明', value: '露营照明' },
      { label: '户外装备', value: '户外装备' },
    ],
  },
]

const commonColumns: Record<
  'code' | 'name' | 'description' | 'status' | 'relatedProductCount' | 'updatedAt',
  ProductMetadataTableColumn
> = {
  code: { settingsKey: 'code', title: '编码', dataIndex: 'code', slotName: 'code', width: 168, minWidth: 132 },
  name: { settingsKey: 'name', title: '名称', dataIndex: 'name', slotName: 'name', width: 220, minWidth: 160 },
  description: { settingsKey: 'description', title: '描述', dataIndex: 'description', width: 260, minWidth: 180, ellipsis: true, tooltip: true },
  status: { settingsKey: 'status', title: '状态', dataIndex: 'status', slotName: 'status', width: 72, minWidth: 64, align: 'center' as const },
  relatedProductCount: { settingsKey: 'relatedProductCount', title: '关联商品数', dataIndex: 'relatedProductCount', width: 116, minWidth: 104, align: 'right' as const },
  updatedAt: { settingsKey: 'updatedAt', title: '更新时间', dataIndex: 'updatedAt', width: 168, minWidth: 140 },
}

export const productMetadataPageConfigs: Record<ProductMetadataPageKey, ProductMetadataPageConfig> = {
  brand: {
    key: 'brand',
    title: '品牌资料',
    description: '维护品牌编码、名称与描述，供商品主数据和采购链路统一引用。',
    primaryAction: '新增品牌',
    modalTitle: '新增品牌资料',
    editModalTitle: '编辑品牌资料',
    keywordPlaceholder: '品牌编码 / 名称 / 描述',
    tableColumns: [
      commonColumns.code,
      commonColumns.name,
      commonColumns.description,
      commonColumns.status,
      commonColumns.relatedProductCount,
      commonColumns.updatedAt,
      { title: '操作', slotName: 'operation', width: 96, align: 'center' },
    ],
    defaultVisibleKeys: ['code', 'name', 'description', 'status', 'relatedProductCount', 'updatedAt'],
    requiredKeys: ['code', 'name'],
    pinnedColumnKeys: ['code'],
    formFields: [
      { key: 'code', label: '编码', kind: 'input', required: true, maxLength: 30, placeholder: '编码' },
      { key: 'name', label: '名称', kind: 'input', required: true, maxLength: 30, placeholder: '名称' },
      { key: 'description', label: '描述', kind: 'input', maxLength: 45, placeholder: '描述' },
    ],
    editFormFields: [
      { key: 'code', label: '编码', kind: 'input', required: true, maxLength: 30, placeholder: '编码' },
      { key: 'name', label: '名称', kind: 'input', required: true, maxLength: 30, placeholder: '名称' },
      { key: 'description', label: '描述', kind: 'input', maxLength: 45, placeholder: '描述' },
      { key: 'status', label: '状态', kind: 'select', placeholder: '状态', options: productMetadataStatusOptions },
    ],
  },
  category: {
    key: 'category',
    title: '品类资料',
    description: '维护品类层级、站点和简码，帮助 SKU 建档时快速选择标准品类。',
    primaryAction: '添加品类',
    modalTitle: '添加品类',
    editModalTitle: '编辑品类',
    keywordPlaceholder: '品类编码 / 名称 / 简码',
    tableColumns: [
      commonColumns.code,
      commonColumns.name,
      { settingsKey: 'parentCategory', title: '父品类', dataIndex: 'parentCategory', width: 150, minWidth: 128 },
      { settingsKey: 'site', title: '站点', dataIndex: 'site', width: 140, minWidth: 118 },
      { settingsKey: 'shortCode', title: '简码', dataIndex: 'shortCode', width: 100, minWidth: 88 },
      commonColumns.description,
      commonColumns.status,
      commonColumns.relatedProductCount,
      commonColumns.updatedAt,
      { title: '操作', slotName: 'operation', width: 96, align: 'center' },
    ],
    defaultVisibleKeys: ['code', 'name', 'parentCategory', 'site', 'shortCode', 'description', 'status', 'relatedProductCount', 'updatedAt'],
    requiredKeys: ['code', 'name'],
    pinnedColumnKeys: ['code'],
    formFields: [
      { key: 'parentCategory', label: '父品类', kind: 'select', placeholder: '父品类', options: productMetadataCategoryOptions },
      { key: 'code', label: '编码', kind: 'input', required: true, maxLength: 100, placeholder: '编码' },
      { key: 'name', label: '名称', kind: 'input', required: true, maxLength: 100, placeholder: '名称' },
      { key: 'site', label: '站点', kind: 'select', placeholder: '站点', options: productMetadataSiteOptions },
      { key: 'description', label: '描述', kind: 'input', maxLength: 45, placeholder: '描述' },
      { key: 'shortCode', label: '简码', kind: 'input', maxLength: 10, placeholder: '简码', tooltip: '用于快速检索和导入时匹配品类。' },
    ],
    editFormFields: [
      { key: 'parentCategory', label: '父品类', kind: 'select', placeholder: '父品类', options: productMetadataCategoryOptions },
      { key: 'code', label: '编码', kind: 'input', required: true, maxLength: 100, placeholder: '编码' },
      { key: 'name', label: '名称', kind: 'input', required: true, maxLength: 100, placeholder: '名称' },
      { key: 'site', label: '站点', kind: 'select', placeholder: '站点', options: productMetadataSiteOptions },
      { key: 'description', label: '描述', kind: 'input', maxLength: 45, placeholder: '描述' },
      { key: 'shortCode', label: '简码', kind: 'input', maxLength: 10, placeholder: '简码', tooltip: '用于快速检索和导入时匹配品类。' },
      { key: 'status', label: '状态', kind: 'select', placeholder: '状态', options: productMetadataStatusOptions },
    ],
  },
}

export const productMetadataRows: Record<ProductMetadataPageKey, ProductMetadataRow[]> = {
  brand: [
    { id: 'brand-blendgo', kind: 'brand', code: 'BR-BLEND', name: 'BlendGo', description: '便携厨电和榨汁杯品牌', status: '启用', relatedProductCount: 18, updatedAt: '2026-05-08 14:20', createdBy: '商品运营' },
    { id: 'brand-soundmax', kind: 'brand', code: 'BR-SOUND', name: 'SoundMax', description: '消费电子音频品牌', status: '启用', relatedProductCount: 26, updatedAt: '2026-05-07 16:45', createdBy: '商品运营' },
    { id: 'brand-camplite', kind: 'brand', code: 'BR-CAMP', name: 'CampLite', description: '露营照明和户外配件', status: '启用', relatedProductCount: 12, updatedAt: '2026-05-06 11:32', createdBy: '采购专员' },
    { id: 'brand-homely', kind: 'brand', code: 'BR-HOME', name: 'Homely', description: '家居收纳与日用小件', status: '启用', relatedProductCount: 31, updatedAt: '2026-05-05 09:18', createdBy: '商品运营' },
    { id: 'brand-archived', kind: 'brand', code: 'BR-OLD', name: 'OldPeak', description: '历史归档品牌，暂不用于新建商品', status: '停用', relatedProductCount: 3, updatedAt: '2026-04-30 18:06', createdBy: '系统管理员' },
  ],
  category: [
    { id: 'cat-kitchen', kind: 'category', code: 'CAT-KITCHEN', name: '厨具用品', parentCategory: '家居日用', site: 'Amazon US', description: '厨房小电和厨房配件', shortCode: 'KT', status: '启用', relatedProductCount: 42, updatedAt: '2026-05-08 15:22', createdBy: '商品运营' },
    { id: 'cat-digital', kind: 'category', code: 'CAT-DIGI', name: '数码配件', parentCategory: '数码配件', site: 'Amazon US', description: '耳机、支架和移动设备配件', shortCode: 'DG', status: '启用', relatedProductCount: 76, updatedAt: '2026-05-08 10:18', createdBy: '商品运营' },
    { id: 'cat-auto', kind: 'category', code: 'CAT-AUTO', name: '车载配件', parentCategory: '车载配件', site: 'Ozon RU', description: '车载收纳、充电和清洁用品', shortCode: 'AU', status: '启用', relatedProductCount: 19, updatedAt: '2026-05-06 17:12', createdBy: '采购专员' },
    { id: 'cat-home', kind: 'category', code: 'CAT-HOME', name: '家居日用', parentCategory: '家居日用', site: 'Wildberries RU', description: '收纳整理和日常家居用品', shortCode: 'HM', status: '启用', relatedProductCount: 58, updatedAt: '2026-05-04 13:36', createdBy: '商品运营' },
    { id: 'cat-camp', kind: 'category', code: 'CAT-CAMP', name: '户外露营', parentCategory: '户外露营', site: 'TikTok Shop', description: '露营灯、户外桌椅和装备', shortCode: 'CP', status: '停用', relatedProductCount: 9, updatedAt: '2026-04-29 19:50', createdBy: '系统管理员' },
  ],
}

export const filterProductMetadataRows = (
  rows: ProductMetadataRow[],
  filters: ProductMetadataFilterState,
) => {
  const keyword = filters.keyword?.trim().toLowerCase()

  return rows.filter((row) => {
    const matchesKeyword = !keyword
      || [row.code, row.name, row.description, row.parentCategory, row.site, row.shortCode]
        .some((value) => value?.toLowerCase().includes(keyword))
    const matchesParentCategory = !filters.parentCategory || row.parentCategory === filters.parentCategory
    const matchesSite = !filters.site || row.site === filters.site
    const matchesStatus = !filters.status || row.status === filters.status

    return matchesKeyword && matchesParentCategory && matchesSite && matchesStatus
  })
}

export const getProductMetadataSummary = (rows: ProductMetadataRow[]) => [
  { label: '资料总数', value: String(rows.length), note: '当前可维护资料' },
  { label: '启用项', value: String(rows.filter((row) => row.status === '启用').length), note: '可用于商品建档' },
  { label: '关联商品', value: String(rows.reduce((total, row) => total + row.relatedProductCount, 0)), note: '已关联 SKU 数' },
  { label: '停用项', value: String(rows.filter((row) => row.status === '停用').length), note: '仅历史数据保留' },
]

export const createProductMetadataRecord = (
  kind: ProductMetadataPageKey,
  payload: ProductMetadataFormPayload,
): ProductMetadataRow => ({
  id: `${kind}-${Date.now()}`,
  kind,
  code: payload.code?.trim() ?? '',
  name: payload.name?.trim() ?? '',
  description: payload.description?.trim(),
  parentCategory: payload.parentCategory,
  site: payload.site,
  shortCode: payload.shortCode?.trim(),
  status: '启用',
  relatedProductCount: 0,
  updatedAt: '刚刚',
  createdBy: '当前用户',
})
