import { ref, toRaw } from 'vue'

export type ProductStatus = 'normal' | 'disabled'
export type ProcurementStatus = 'normal' | 'temporary-out-of-stock' | 'stopped' | 'risk'
export type LogisticsAttribute = 'general' | 'battery-included' | 'pure-battery' | 'liquid' | 'powder' | 'magnetic' | 'fragile'
export type ListingStatus = 'listed' | 'unlisted' | 'unknown'

export interface SelectOption<T extends string | boolean = string> {
  label: string
  value: T
}

export interface ProductBasicInfo {
  sku: string
  chineseName: string
  englishName: string
  shortName: string
  barcode: string
  brand: string
  specModel: string
  color: string
  material: string
  mainImage: string
  galleryImages: string[]
  category: string
  status: ProductStatus
  internalRemark: string
}

export interface ProductPackagingInfo {
  grossWeight: number | undefined
  netWeight: number | undefined
  packageLength: number | undefined
  packageWidth: number | undefined
  packageHeight: number | undefined
}

export interface ProductLogisticsInfo {
  customsChineseName: string
  customsEnglishName: string
  hsCode: string
  countryOfOrigin: string
  logisticsTags: LogisticsAttribute[]
  sensitiveTags: string[]
}

export interface ProductProcurementInfo {
  defaultPurchaseUrl: string
  purchasable: boolean | undefined
  recentSupplier: string
  recentPrice: number | undefined
  currency: string
  recentPurchaseDate: string
  note: string
  status: ProcurementStatus | ''
}

export interface ProductPlatformMapping {
  id: string
  platform: string
  store: string
  platformProductId: string
  platformSkuId: string
  storeSku: string
  productUrl: string
  listingStatus: ListingStatus
}

export interface ProductRecord {
  basicInfo: ProductBasicInfo
  packaging: ProductPackagingInfo
  logistics: ProductLogisticsInfo
  procurement: ProductProcurementInfo
  mappings: ProductPlatformMapping[]
  updatedAt: string
}

export interface ProductFilters {
  keyword?: string
  sku?: string
  name?: string
  category?: string
  status?: ProductStatus
  purchasable?: boolean
}

export interface MappingLookupInput {
  platform: string
  store: string
  storeSku?: string
  platformSkuId?: string
}

export interface SaveProductInput {
  mode: 'create' | 'edit'
  product: ProductRecord
  originalSku?: string
}

const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

const cloneValue = <T>(value: T): T => JSON.parse(JSON.stringify(toRaw(value))) as T

const normalizeText = (value: string | undefined) => value?.trim().toLowerCase() ?? ''

const createImageDataUrl = (label: string, colors: [string, string], subtitle: string) => {
  const [from, to] = colors
  const svg = `
    <svg width="112" height="112" viewBox="0 0 112 112" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="112" height="112" rx="24" fill="url(#paint0_linear_1_1)"/>
      <circle cx="92" cy="20" r="22" fill="rgba(255,255,255,0.12)"/>
      <circle cx="18" cy="92" r="28" fill="rgba(255,255,255,0.10)"/>
      <rect x="23" y="26" width="66" height="44" rx="12" fill="rgba(255,255,255,0.92)"/>
      <rect x="31" y="36" width="50" height="8" rx="4" fill="rgba(29,33,41,0.18)"/>
      <rect x="31" y="50" width="30" height="6" rx="3" fill="rgba(29,33,41,0.10)"/>
      <text x="56" y="87" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="rgba(255,255,255,0.92)">${label}</text>
      <text x="56" y="100" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" font-weight="600" fill="rgba(255,255,255,0.72)">${subtitle}</text>
      <defs>
        <linearGradient id="paint0_linear_1_1" x1="8" y1="8" x2="96" y2="104" gradientUnits="userSpaceOnUse">
          <stop stop-color="${from}"/>
          <stop offset="1" stop-color="${to}"/>
        </linearGradient>
      </defs>
    </svg>
  `

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const nowTimestamp = () => dateFormatter.format(new Date()).replace(/\//g, '-')

const categories = ['厨具用品', '办公文具', '收纳整理', '家居清洁']

export const categoryOptions: SelectOption[] = categories.map((value) => ({ label: value, value }))

export const productStatusOptions: SelectOption<ProductStatus>[] = [
  { label: '正常', value: 'normal' },
  { label: '停用', value: 'disabled' },
]

export const purchasableOptions: SelectOption<boolean>[] = [
  { label: '是', value: true },
  { label: '否', value: false },
]

export const logisticsTagOptions: SelectOption<LogisticsAttribute>[] = [
  { label: '普货', value: 'general' },
  { label: '带电', value: 'battery-included' },
  { label: '纯电池', value: 'pure-battery' },
  { label: '液体', value: 'liquid' },
  { label: '粉末', value: 'powder' },
  { label: '磁性', value: 'magnetic' },
  { label: '易碎', value: 'fragile' },
]

export const procurementStatusOptions: SelectOption<ProcurementStatus>[] = [
  { label: '正常', value: 'normal' },
  { label: '临时缺货', value: 'temporary-out-of-stock' },
  { label: '不再采购', value: 'stopped' },
  { label: '采购风险', value: 'risk' },
]

export const listingStatusOptions: SelectOption<ListingStatus>[] = [
  { label: '已上架', value: 'listed' },
  { label: '已下架', value: 'unlisted' },
  { label: '未知', value: 'unknown' },
]

export const currencyOptions: SelectOption[] = [
  { label: 'CNY', value: 'CNY' },
  { label: 'USD', value: 'USD' },
  { label: 'RUB', value: 'RUB' },
]

export const platformOptions: SelectOption[] = [
  { label: 'TikTok Shop', value: 'TikTok Shop' },
  { label: 'Ozon', value: 'Ozon' },
  { label: 'Wildberries', value: 'Wildberries' },
  { label: 'AliExpress', value: 'AliExpress' },
]

export const storeOptions: SelectOption[] = [
  { label: '东南亚厨房店', value: '东南亚厨房店' },
  { label: '俄区家居店', value: '俄区家居店' },
  { label: '欧洲办公店', value: '欧洲办公店' },
  { label: '中东生活店', value: '中东生活店' },
]

export const createEmptyPlatformMapping = (): ProductPlatformMapping => ({
  id: `mapping-${Math.random().toString(36).slice(2, 10)}`,
  platform: '',
  store: '',
  platformProductId: '',
  platformSkuId: '',
  storeSku: '',
  productUrl: '',
  listingStatus: 'unknown',
})

export const createEmptyProduct = (): ProductRecord => ({
  basicInfo: {
    sku: '',
    chineseName: '',
    englishName: '',
    shortName: '',
    barcode: '',
    brand: '',
    specModel: '',
    color: '',
    material: '',
    mainImage: '',
    galleryImages: [],
    category: '',
    status: 'normal',
    internalRemark: '',
  },
  packaging: {
    grossWeight: undefined,
    netWeight: undefined,
    packageLength: undefined,
    packageWidth: undefined,
    packageHeight: undefined,
  },
  logistics: {
    customsChineseName: '',
    customsEnglishName: '',
    hsCode: '',
    countryOfOrigin: '',
    logisticsTags: [],
    sensitiveTags: [],
  },
  procurement: {
    defaultPurchaseUrl: '',
    purchasable: true,
    recentSupplier: '',
    recentPrice: undefined,
    currency: 'CNY',
    recentPurchaseDate: '',
    note: '',
    status: 'normal',
  },
  mappings: [],
  updatedAt: nowTimestamp(),
})

export const createMockProducts = (): ProductRecord[] => [
  {
    basicInfo: {
      sku: 'SKU-BLEND-001',
      chineseName: '便携无线榨汁杯',
      englishName: 'Portable Blender Travel Cup',
      shortName: '无线榨汁杯',
      barcode: '6939901001001',
      brand: 'BlendGo',
      specModel: 'BG-380ML',
      color: '珊瑚橙',
      material: 'Tritan + ABS',
      mainImage: createImageDataUrl('BL', ['#ff8f6b', '#f43f5e'], 'BLENDER'),
      galleryImages: [
        createImageDataUrl('BL', ['#ff8f6b', '#f43f5e'], 'ANGLE A'),
        createImageDataUrl('BL', ['#ffb078', '#fb7185'], 'ANGLE B'),
      ],
      category: '厨具用品',
      status: 'normal',
      internalRemark: '主推款，适合 TikTok Shop 短视频带货。',
    },
    packaging: {
      grossWeight: 0.98,
      netWeight: 0.72,
      packageLength: 24,
      packageWidth: 10.5,
      packageHeight: 10.5,
    },
    logistics: {
      customsChineseName: '便携式榨汁机',
      customsEnglishName: 'Portable Blender',
      hsCode: '8509409000',
      countryOfOrigin: '中国',
      logisticsTags: ['battery-included', 'fragile'],
      sensitiveTags: ['锂电池'],
    },
    procurement: {
      defaultPurchaseUrl: 'https://supplier.example.com/blender/bg-380ml',
      purchasable: true,
      recentSupplier: '深圳优越电器',
      recentPrice: 49.8,
      currency: 'CNY',
      recentPurchaseDate: '2026-04-22',
      note: '最近一批供货周期 5 天。',
      status: 'normal',
    },
    mappings: [
      {
        id: 'mapping-blend-1',
        platform: 'TikTok Shop',
        store: '东南亚厨房店',
        platformProductId: 'TTS-PROD-88219',
        platformSkuId: 'TTS-SKU-99102',
        storeSku: 'TTS-BL-001-SEA',
        productUrl: 'https://shop.example.com/tiktok/blender',
        listingStatus: 'listed',
      },
      {
        id: 'mapping-blend-2',
        platform: 'Wildberries',
        store: '中东生活店',
        platformProductId: 'WB-PROD-10332',
        platformSkuId: 'WB-SKU-10082',
        storeSku: 'WB-BL-001-AE',
        productUrl: 'https://shop.example.com/wb/blender',
        listingStatus: 'unknown',
      },
    ],
    updatedAt: '2026-04-30 00:18',
  },
  {
    basicInfo: {
      sku: 'SKU-KEYBOARD-003',
      chineseName: '静音蓝牙键盘',
      englishName: 'Silent Bluetooth Keyboard',
      shortName: '蓝牙键盘',
      barcode: '6939901003003',
      brand: 'KeyMood',
      specModel: 'KM-84',
      color: '雾灰',
      material: 'ABS + PBT',
      mainImage: createImageDataUrl('KB', ['#4f7cff', '#2563eb'], 'KEYBOARD'),
      galleryImages: [
        createImageDataUrl('KB', ['#4f7cff', '#2563eb'], 'TOP VIEW'),
        createImageDataUrl('KB', ['#7aa2ff', '#3b82f6'], 'SIDE VIEW'),
      ],
      category: '办公文具',
      status: 'normal',
      internalRemark: '用于办公品类，适合 Ozon 和欧洲站。',
    },
    packaging: {
      grossWeight: 0.85,
      netWeight: 0.7,
      packageLength: 33,
      packageWidth: 14,
      packageHeight: 4.5,
    },
    logistics: {
      customsChineseName: '无线键盘',
      customsEnglishName: 'Wireless Keyboard',
      hsCode: '8471607100',
      countryOfOrigin: '中国',
      logisticsTags: ['general', 'battery-included'],
      sensitiveTags: [],
    },
    procurement: {
      defaultPurchaseUrl: 'https://supplier.example.com/keyboard/km84',
      purchasable: true,
      recentSupplier: '东莞精密制造',
      recentPrice: 68,
      currency: 'CNY',
      recentPurchaseDate: '2026-04-19',
      note: '键帽可换色，支持定制包装。',
      status: 'normal',
    },
    mappings: [
      {
        id: 'mapping-keyboard-1',
        platform: 'Ozon',
        store: '俄区家居店',
        platformProductId: 'OZON-PROD-82198',
        platformSkuId: 'OZON-SKU-82198',
        storeSku: 'OZ-KB-003-RU',
        productUrl: 'https://shop.example.com/ozon/keyboard',
        listingStatus: 'listed',
      },
      {
        id: 'mapping-keyboard-2',
        platform: 'AliExpress',
        store: '欧洲办公店',
        platformProductId: 'AE-PROD-66290',
        platformSkuId: 'AE-SKU-66290',
        storeSku: 'AE-KB-003-EU',
        productUrl: 'https://shop.example.com/aliexpress/keyboard',
        listingStatus: 'listed',
      },
    ],
    updatedAt: '2026-04-29 18:42',
  },
  {
    basicInfo: {
      sku: 'SKU-STORAGE-008',
      chineseName: '折叠抽屉收纳盒',
      englishName: 'Foldable Drawer Organizer',
      shortName: '抽屉收纳盒',
      barcode: '6939901008008',
      brand: 'HomeEase',
      specModel: 'HE-3L',
      color: '奶油白',
      material: 'PP',
      mainImage: createImageDataUrl('ST', ['#22c55e', '#15803d'], 'STORAGE'),
      galleryImages: [
        createImageDataUrl('ST', ['#22c55e', '#15803d'], 'STACKABLE'),
      ],
      category: '收纳整理',
      status: 'disabled',
      internalRemark: '供应稳定性一般，当前已停用。',
    },
    packaging: {
      grossWeight: 1.35,
      netWeight: 1.1,
      packageLength: 38,
      packageWidth: 28,
      packageHeight: 8,
    },
    logistics: {
      customsChineseName: '塑料收纳盒',
      customsEnglishName: 'Plastic Storage Box',
      hsCode: '3924900000',
      countryOfOrigin: '中国',
      logisticsTags: ['general'],
      sensitiveTags: [],
    },
    procurement: {
      defaultPurchaseUrl: 'https://supplier.example.com/storage/he3l',
      purchasable: false,
      recentSupplier: '宁波锦纳塑业',
      recentPrice: 15.6,
      currency: 'CNY',
      recentPurchaseDate: '2026-03-08',
      note: '已暂停补货，待新供应商替换。',
      status: 'risk',
    },
    mappings: [
      {
        id: 'mapping-storage-1',
        platform: 'Ozon',
        store: '俄区家居店',
        platformProductId: 'OZON-PROD-19288',
        platformSkuId: 'OZON-SKU-19288',
        storeSku: 'OZ-ST-008-RU',
        productUrl: 'https://shop.example.com/ozon/storage',
        listingStatus: 'unlisted',
      },
    ],
    updatedAt: '2026-04-27 11:06',
  },
]

export const filterProducts = (products: ProductRecord[], filters: ProductFilters = {}) => {
  const keyword = normalizeText(filters.keyword)
  const skuKeyword = normalizeText(filters.sku)
  const nameKeyword = normalizeText(filters.name)

  return products.filter((product) => {
    if (skuKeyword && !normalizeText(product.basicInfo.sku).includes(skuKeyword)) return false
    if (nameKeyword) {
      const nameMatched = [
        product.basicInfo.chineseName,
        product.basicInfo.englishName,
        product.basicInfo.shortName,
      ].some((field) => normalizeText(field).includes(nameKeyword))

      if (!nameMatched) return false
    }

    if (keyword) {
      const searchable = [
        product.basicInfo.sku,
        product.basicInfo.chineseName,
        product.basicInfo.englishName,
        product.basicInfo.shortName,
      ]
      const keywordMatched = searchable.some((field) => normalizeText(field).includes(keyword))
      if (!keywordMatched) return false
    }

    if (filters.category && product.basicInfo.category !== filters.category) return false
    if (filters.status && product.basicInfo.status !== filters.status) return false
    if (typeof filters.purchasable === 'boolean' && product.procurement.purchasable !== filters.purchasable) {
      return false
    }

    return true
  })
}

const assertUniqueSku = (products: ProductRecord[], sku: string, ignoreSku?: string) => {
  const normalizedSku = sku.trim()
  const duplicated = products.some((product) =>
    product.basicInfo.sku === normalizedSku && product.basicInfo.sku !== ignoreSku
  )

  if (duplicated) {
    throw new Error('SKU 已存在，请更换后再保存。')
  }
}

export const findInternalSkuByMapping = (products: ProductRecord[], input: MappingLookupInput) => {
  const matchedByStoreSku = input.storeSku?.trim()
    ? products.find((product) =>
        product.mappings.some((mapping) =>
          mapping.platform === input.platform
          && mapping.store === input.store
          && mapping.storeSku === input.storeSku?.trim()
        )
      )
    : undefined

  if (matchedByStoreSku) {
    return matchedByStoreSku.basicInfo.sku
  }

  const matchedByPlatformSkuId = input.platformSkuId?.trim()
    ? products.find((product) =>
        product.mappings.some((mapping) =>
          mapping.platform === input.platform
          && mapping.store === input.store
          && mapping.platformSkuId === input.platformSkuId?.trim()
        )
      )
    : undefined

  return matchedByPlatformSkuId?.basicInfo.sku
}

export const upsertProduct = (products: ProductRecord[], input: SaveProductInput) => {
  const normalizedSku = input.product.basicInfo.sku.trim()
  const payload = cloneValue(input.product)
  payload.basicInfo.sku = normalizedSku
  payload.updatedAt = nowTimestamp()

  if (input.mode === 'create') {
    assertUniqueSku(products, normalizedSku)
    return [payload, ...cloneValue(products)]
  }

  const originalSku = input.originalSku ?? normalizedSku
  assertUniqueSku(products, normalizedSku, originalSku)

  return products.map((product) => product.basicInfo.sku === originalSku ? payload : cloneValue(product))
}

export const createProductCatalogStore = (initialProducts = createMockProducts()) => {
  const products = ref<ProductRecord[]>(cloneValue(initialProducts))

  return {
    products,
    createEmptyProduct,
    createEmptyPlatformMapping,
    getProducts: () => cloneValue(products.value),
    getProductBySku: (sku: string) => {
      const matched = products.value.find((product) => product.basicInfo.sku === sku)
      return matched ? cloneValue(matched) : undefined
    },
    saveProduct: (input: SaveProductInput) => {
      products.value = upsertProduct(products.value, input)
      return input.product.basicInfo.sku.trim()
    },
    findInternalSkuByMapping: (input: MappingLookupInput) => findInternalSkuByMapping(products.value, input),
  }
}

const sharedProductCatalogStore = createProductCatalogStore()

export const useProductCatalogStore = () => sharedProductCatalogStore
