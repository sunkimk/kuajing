import { describe, expect, it } from 'vitest'
import {
  createProductMetadataRecord,
  filterProductMetadataRows,
  getProductMetadataSummary,
  productMetadataMoveCategoryOptions,
  productMetadataPageConfigs,
  productMetadataRows,
} from '../src/data/productMetadata'

describe('product metadata data', () => {
  it('defines separate brand and category page configs with add modal fields', () => {
    expect(productMetadataPageConfigs.brand.title).toBe('品牌资料')
    expect(productMetadataPageConfigs.brand.primaryAction).toBe('新增品牌')
    expect(productMetadataPageConfigs.brand.modalTitle).toBe('新增品牌资料')
    expect(productMetadataPageConfigs.brand.editModalTitle).toBe('编辑品牌资料')
    expect(productMetadataPageConfigs.brand.formFields.map((field) => field.key)).toEqual([
      'code',
      'name',
      'description',
    ])
    expect(productMetadataPageConfigs.brand.editFormFields.map((field) => field.key)).toEqual([
      'code',
      'name',
      'description',
      'status',
    ])

    expect(productMetadataPageConfigs.category.title).toBe('品类资料')
    expect(productMetadataPageConfigs.category.primaryAction).toBe('添加品类')
    expect(productMetadataPageConfigs.category.modalTitle).toBe('添加品类')
    expect(productMetadataPageConfigs.category.formFields.map((field) => field.key)).toEqual([
      'parentCategory',
      'code',
      'name',
      'site',
      'description',
      'shortCode',
    ])
  })

  it('filters metadata rows by keyword and select filters', () => {
    expect(filterProductMetadataRows(productMetadataRows.brand, { keyword: 'Blend' })).toHaveLength(1)
    expect(filterProductMetadataRows(productMetadataRows.category, { parentCategory: '数码配件' }).every((row) => row.parentCategory === '数码配件')).toBe(true)
    expect(filterProductMetadataRows(productMetadataRows.category, { site: 'Ozon RU' }).every((row) => row.site === 'Ozon RU')).toBe(true)
    expect(filterProductMetadataRows(productMetadataRows.category, { status: '停用' }).every((row) => row.status === '停用')).toBe(true)
  })

  it('provides hierarchical options for moving selected categories', () => {
    expect(productMetadataMoveCategoryOptions).toEqual(expect.arrayContaining([
      expect.objectContaining({
        label: '家居日用',
        value: '家居日用',
        children: expect.arrayContaining([
          expect.objectContaining({ label: '厨具用品', value: '厨具用品' }),
        ]),
      }),
    ]))
  })

  it('creates new brand and category records from modal payloads', () => {
    expect(createProductMetadataRecord('brand', {
      code: 'BR-NEW',
      name: 'New Brand',
      description: '测试品牌',
    })).toMatchObject({
      code: 'BR-NEW',
      name: 'New Brand',
      description: '测试品牌',
      kind: 'brand',
      status: '启用',
    })

    expect(createProductMetadataRecord('category', {
      parentCategory: '数码配件',
      code: 'CAT-NEW',
      name: '新品类',
      site: 'Amazon US',
      description: '测试品类',
      shortCode: 'NP',
    })).toMatchObject({
      parentCategory: '数码配件',
      code: 'CAT-NEW',
      name: '新品类',
      site: 'Amazon US',
      kind: 'category',
    })
  })

  it('summarizes records for top metric cards', () => {
    expect(getProductMetadataSummary(productMetadataRows.brand)[0].label).toBe('资料总数')
    expect(getProductMetadataSummary(productMetadataRows.category)[1].label).toBe('启用项')
  })
})
