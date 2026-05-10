import { describe, expect, it } from 'vitest'
import {
  createMockProducts,
  createProductCatalogStore,
  filterProducts,
} from '../src/data/productCatalog'

describe('filterProducts', () => {
  it('supports filtering by SKU and name keyword', () => {
    const products = createMockProducts()

    const skuMatches = filterProducts(products, { keyword: 'SKU-BLEND-001' })
    const nameMatches = filterProducts(products, { keyword: '蓝牙键盘' })
    const russianNameMatches = filterProducts(products, { keyword: 'Блендер' })

    expect(skuMatches).toHaveLength(1)
    expect(skuMatches[0]?.basicInfo.sku).toBe('SKU-BLEND-001')
    expect(nameMatches).toHaveLength(1)
    expect(nameMatches[0]?.basicInfo.sku).toBe('SKU-KEYBOARD-003')
    expect(russianNameMatches).toHaveLength(1)
    expect(russianNameMatches[0]?.basicInfo.sku).toBe('SKU-BLEND-001')
  })

  it('supports category, status, and purchasable filters together', () => {
    const products = createMockProducts()

    const filtered = filterProducts(products, {
      category: '办公文具',
      status: 'normal',
      purchasable: true,
    })

    expect(filtered).toHaveLength(1)
    expect(filtered[0]?.basicInfo.sku).toBe('SKU-KEYBOARD-003')
  })
})

describe('createProductCatalogStore', () => {
  it('rejects duplicate SKU when creating a new product', () => {
    const store = createProductCatalogStore(createMockProducts())

    expect(() =>
      store.saveProduct({
        mode: 'create',
        product: {
          ...store.createEmptyProduct(),
          basicInfo: {
            ...store.createEmptyProduct().basicInfo,
            sku: 'SKU-BLEND-001',
            chineseName: '重复 SKU 商品',
            mainImage: 'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=400&q=80',
            category: '厨具用品',
            status: 'normal',
          },
          packaging: {
            ...store.createEmptyProduct().packaging,
            grossWeight: 1.2,
            packageLength: 20,
            packageWidth: 10,
            packageHeight: 10,
          },
          logistics: {
            ...store.createEmptyProduct().logistics,
            customsChineseName: '便携榨汁机',
          },
          procurement: {
            ...store.createEmptyProduct().procurement,
            defaultPurchaseUrl: 'https://1688.example.com/item/juice',
            purchasable: true,
          },
        },
      }),
    ).toThrowError(/SKU 已存在/)
  })

  it('finds internal SKU from platform, store, and store SKU mapping', () => {
    const store = createProductCatalogStore(createMockProducts())

    expect(
      store.findInternalSkuByMapping({
        platform: 'Ozon',
        store: '俄区家居店',
        storeSku: 'OZ-KB-003-RU',
      }),
    ).toBe('SKU-KEYBOARD-003')
  })

  it('falls back to platform SKU ID lookup when store SKU is absent', () => {
    const store = createProductCatalogStore(createMockProducts())

    expect(
      store.findInternalSkuByMapping({
        platform: 'TikTok Shop',
        store: '东南亚厨房店',
        platformSkuId: 'TTS-SKU-99102',
      }),
    ).toBe('SKU-BLEND-001')
  })
})
