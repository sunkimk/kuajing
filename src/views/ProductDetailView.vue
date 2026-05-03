<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { TableColumnData } from '@arco-design/web-vue'
import { Message } from '@arco-design/web-vue'
import { IconDelete, IconPlus } from '@arco-design/web-vue/es/icon'
import { useRoute, useRouter } from 'vue-router'
import SecondaryPageHeader from '../components/common/SecondaryPageHeader.vue'
import ProductSectionCard from '../components/products/ProductSectionCard.vue'
import {
  categoryOptions,
  createEmptyProduct,
  createEmptyPlatformMapping,
  currencyOptions,
  listingStatusOptions,
  logisticsTagOptions,
  platformOptions,
  procurementStatusOptions,
  productStatusOptions,
  purchasableOptions,
  storeOptions,
  useProductCatalogStore,
  type ProductPlatformMapping,
  type ProductRecord,
  type ProductStatus,
} from '../data/productCatalog'

const router = useRouter()
const route = useRoute()
const catalogStore = useProductCatalogStore()

const statusLabelMap: Record<ProductStatus, string> = {
  normal: '正常',
  disabled: '停用',
}

const pageMode = computed(() => route.path.endsWith('/create') ? 'create' : 'edit')
const isCreateMode = computed(() => pageMode.value === 'create')
const routeSku = computed(() => decodeURIComponent(String(route.params.sku ?? '')))

const draft = ref<ProductRecord>(createEmptyProduct())
const missingProduct = ref(false)
const saving = ref(false)

const mappingColumns: TableColumnData[] = [
  { title: '平台', slotName: 'platform', width: 140 },
  { title: '店铺', slotName: 'store', width: 160 },
  { title: '平台商品 ID', slotName: 'platformProductId', width: 170 },
  { title: '平台 SKU ID', slotName: 'platformSkuId', width: 170 },
  { title: '店铺 SKU', slotName: 'storeSku', width: 170 },
  { title: '平台商品链接', slotName: 'productUrl', width: 220 },
  { title: '平台上架状态', slotName: 'listingStatus', width: 150 },
  { title: '操作', slotName: 'actions', width: 90, fixed: 'right' },
]

const overviewMetrics = computed(() => [
  { label: '平台映射', value: `${draft.value.mappings.length} 条` },
  { label: '物流标签', value: draft.value.logistics.logisticsTags.length ? `${draft.value.logistics.logisticsTags.length} 项` : '-' },
  { label: '采购状态', value: procurementStatusOptions.find((item) => item.value === draft.value.procurement.status)?.label ?? '-' },
])

const pageTitle = computed(() => isCreateMode.value ? '新建商品' : '编辑商品')

const loadDraft = () => {
  if (isCreateMode.value) {
    draft.value = createEmptyProduct()
    missingProduct.value = false
    return
  }

  const matched = catalogStore.getProductBySku(routeSku.value)
  if (!matched) {
    missingProduct.value = true
    return
  }

  draft.value = matched
  missingProduct.value = false
}

const trimText = (value: string) => value.trim()
const trimStringList = (value: string[]) => value.map((item) => item.trim()).filter(Boolean)

const buildPayload = () => {
  const payload = structuredClone(draft.value)
  payload.basicInfo.sku = trimText(payload.basicInfo.sku)
  payload.basicInfo.chineseName = trimText(payload.basicInfo.chineseName)
  payload.basicInfo.englishName = trimText(payload.basicInfo.englishName)
  payload.basicInfo.shortName = trimText(payload.basicInfo.shortName)
  payload.basicInfo.barcode = trimText(payload.basicInfo.barcode)
  payload.basicInfo.brand = trimText(payload.basicInfo.brand)
  payload.basicInfo.specModel = trimText(payload.basicInfo.specModel)
  payload.basicInfo.color = trimText(payload.basicInfo.color)
  payload.basicInfo.material = trimText(payload.basicInfo.material)
  payload.basicInfo.mainImage = trimText(payload.basicInfo.mainImage)
  payload.basicInfo.internalRemark = trimText(payload.basicInfo.internalRemark)
  payload.basicInfo.galleryImages = trimStringList(payload.basicInfo.galleryImages)

  payload.logistics.customsChineseName = trimText(payload.logistics.customsChineseName)
  payload.logistics.customsEnglishName = trimText(payload.logistics.customsEnglishName)
  payload.logistics.hsCode = trimText(payload.logistics.hsCode)
  payload.logistics.countryOfOrigin = trimText(payload.logistics.countryOfOrigin)
  payload.logistics.sensitiveTags = trimStringList(payload.logistics.sensitiveTags)

  payload.procurement.defaultPurchaseUrl = trimText(payload.procurement.defaultPurchaseUrl)
  payload.procurement.recentSupplier = trimText(payload.procurement.recentSupplier)
  payload.procurement.currency = trimText(payload.procurement.currency)
  payload.procurement.recentPurchaseDate = trimText(payload.procurement.recentPurchaseDate)
  payload.procurement.note = trimText(payload.procurement.note)

  payload.mappings = payload.mappings
    .map((mapping) => ({
      ...mapping,
      platform: trimText(mapping.platform),
      store: trimText(mapping.store),
      platformProductId: trimText(mapping.platformProductId),
      platformSkuId: trimText(mapping.platformSkuId),
      storeSku: trimText(mapping.storeSku),
      productUrl: trimText(mapping.productUrl),
    }))
    .filter((mapping) =>
      [
        mapping.platform,
        mapping.store,
        mapping.platformProductId,
        mapping.platformSkuId,
        mapping.storeSku,
        mapping.productUrl,
      ].some(Boolean)
    )

  return payload
}

const validatePayload = (payload: ProductRecord) => {
  if (!payload.basicInfo.sku) return '请填写 SKU'
  if (!payload.basicInfo.chineseName) return '请填写商品中文名'
  if (!payload.basicInfo.mainImage) return '请填写商品主图'
  if (!payload.basicInfo.category) return '请选择商品类目'
  if (!payload.basicInfo.status) return '请选择商品状态'

  if (payload.packaging.grossWeight === undefined || payload.packaging.grossWeight <= 0) return '请填写毛重'
  if (payload.packaging.packageLength === undefined || payload.packaging.packageLength <= 0) return '请填写包装长度'
  if (payload.packaging.packageWidth === undefined || payload.packaging.packageWidth <= 0) return '请填写包装宽度'
  if (payload.packaging.packageHeight === undefined || payload.packaging.packageHeight <= 0) return '请填写包装高度'

  if (!payload.logistics.customsChineseName) return '请填写报关中文名'

  if (!payload.procurement.defaultPurchaseUrl) return '请填写默认采购链接'
  if (typeof payload.procurement.purchasable !== 'boolean') return '请选择是否可采购'

  for (const [index, mapping] of payload.mappings.entries()) {
    if (!mapping.platform || !mapping.store || !mapping.storeSku) {
      return `请完善第 ${index + 1} 条平台店铺映射的必填字段`
    }
  }

  return undefined
}

const goBackToList = () => {
  router.push('/products/core-library')
}

const addGalleryImage = () => {
  draft.value.basicInfo.galleryImages.push('')
}

const removeGalleryImage = (index: number) => {
  draft.value.basicInfo.galleryImages.splice(index, 1)
}

const addMapping = () => {
  draft.value.mappings.push(createEmptyPlatformMapping())
}

const removeMapping = (mappingId: string) => {
  draft.value.mappings = draft.value.mappings.filter((mapping) => mapping.id !== mappingId)
}

const saveProduct = async (returnToList: boolean) => {
  const payload = buildPayload()
  const validationMessage = validatePayload(payload)

  if (validationMessage) {
    Message.warning(validationMessage)
    return
  }

  try {
    saving.value = true
    const savedSku = catalogStore.saveProduct({
      mode: isCreateMode.value ? 'create' : 'edit',
      originalSku: routeSku.value,
      product: payload,
    })

    Message.success('商品已保存')

    if (returnToList) {
      await router.push('/products/core-library')
      return
    }

    if (isCreateMode.value) {
      await router.replace(`/products/core-library/${encodeURIComponent(savedSku)}/edit`)
      return
    }

    const latest = catalogStore.getProductBySku(savedSku)
    if (latest) {
      draft.value = latest
    }
  } catch (error) {
    Message.error(error instanceof Error ? error.message : '保存失败，请稍后重试。')
  } finally {
    saving.value = false
  }
}

const seedPreviewImage = () => {
  if (draft.value.basicInfo.mainImage) return
  draft.value.basicInfo.mainImage = 'https://images.unsplash.com/photo-1585837575652-267c041d77d4?auto=format&fit=crop&w=800&q=80'
}

watch([() => route.params.sku, () => route.path], loadDraft, { immediate: true })
</script>

<template>
  <div class="product-detail-page">
    <template v-if="!missingProduct">
      <SecondaryPageHeader
        :title="pageTitle"
        @back="goBackToList"
      />

      <section class="overview-card">
        <div class="overview-profile">
          <div class="image-preview">
            <img v-if="draft.basicInfo.mainImage" :src="draft.basicInfo.mainImage" :alt="draft.basicInfo.chineseName || draft.basicInfo.sku" />
            <div v-else class="image-empty">主图待补充</div>
          </div>

          <div class="overview-identity">
            <div class="overview-title-row">
              <strong>{{ draft.basicInfo.chineseName || '未命名商品' }}</strong>
              <a-tag :color="draft.basicInfo.status === 'normal' ? 'green' : 'gray'">{{ statusLabelMap[draft.basicInfo.status] }}</a-tag>
              <a-tag :color="draft.procurement.purchasable ? 'arcoblue' : 'gray'">
                {{ draft.procurement.purchasable ? '可采购' : '不可采购' }}
              </a-tag>
              <a-tag color="purple">{{ draft.basicInfo.category || '未选类目' }}</a-tag>
            </div>
            <span>{{ draft.basicInfo.sku || '请先填写 SKU' }}</span>
          </div>
        </div>

        <div class="overview-stats">
          <div v-for="metric in overviewMetrics" :key="metric.label" class="overview-stat">
            <strong>{{ metric.value }}</strong>
            <span>{{ metric.label }}</span>
          </div>
        </div>
      </section>

      <a-alert class="mapping-tip" type="info" show-icon>
        后续订单导入时，这里的平台、店铺、店铺 SKU 和平台 SKU ID 会作为内部 SKU 的反查入口。
      </a-alert>

      <ProductSectionCard title="基础信息" description="先建立 SKU 主数据，后续订单、库存和采购都围绕这里的唯一 SKU 展开。">
        <a-form :model="draft" layout="vertical">
          <a-grid :cols="{ xs: 1, md: 2, xl: 3 }" :col-gap="16" :row-gap="4">
            <a-grid-item>
              <a-form-item label="SKU" required>
                <a-input v-model="draft.basicInfo.sku" :disabled="!isCreateMode" placeholder="请输入内部 SKU" />
              </a-form-item>
            </a-grid-item>
            <a-grid-item>
              <a-form-item label="商品中文名" required>
                <a-input v-model="draft.basicInfo.chineseName" placeholder="请输入商品中文名" />
              </a-form-item>
            </a-grid-item>
            <a-grid-item>
              <a-form-item label="商品类目" required>
                <a-select v-model="draft.basicInfo.category" placeholder="请选择类目">
                  <a-option v-for="option in categoryOptions" :key="option.value" :value="option.value">{{ option.label }}</a-option>
                </a-select>
              </a-form-item>
            </a-grid-item>
            <a-grid-item>
              <a-form-item label="商品英文名">
                <a-input v-model="draft.basicInfo.englishName" placeholder="请输入商品英文名" />
              </a-form-item>
            </a-grid-item>
            <a-grid-item>
              <a-form-item label="商品简称">
                <a-input v-model="draft.basicInfo.shortName" placeholder="请输入商品简称" />
              </a-form-item>
            </a-grid-item>
            <a-grid-item>
              <a-form-item label="商品条码">
                <a-input v-model="draft.basicInfo.barcode" placeholder="请输入商品条码" />
              </a-form-item>
            </a-grid-item>
            <a-grid-item>
              <a-form-item label="品牌">
                <a-input v-model="draft.basicInfo.brand" placeholder="请输入品牌" />
              </a-form-item>
            </a-grid-item>
            <a-grid-item>
              <a-form-item label="规格型号">
                <a-input v-model="draft.basicInfo.specModel" placeholder="请输入规格型号" />
              </a-form-item>
            </a-grid-item>
            <a-grid-item>
              <a-form-item label="商品状态" required>
                <a-select v-model="draft.basicInfo.status" placeholder="请选择商品状态">
                  <a-option v-for="option in productStatusOptions" :key="option.value" :value="option.value">{{ option.label }}</a-option>
                </a-select>
              </a-form-item>
            </a-grid-item>
            <a-grid-item>
              <a-form-item label="颜色">
                <a-input v-model="draft.basicInfo.color" placeholder="请输入颜色" />
              </a-form-item>
            </a-grid-item>
            <a-grid-item>
              <a-form-item label="材质">
                <a-input v-model="draft.basicInfo.material" placeholder="请输入材质" />
              </a-form-item>
            </a-grid-item>
            <a-grid-item>
              <a-form-item label="主图链接" required>
                <a-input v-model="draft.basicInfo.mainImage" placeholder="请输入商品主图链接" />
                <div class="field-helper">
                  <a-link @click="seedPreviewImage">填入示例图</a-link>
                </div>
              </a-form-item>
            </a-grid-item>
            <a-grid-item :span="3">
              <a-form-item label="商品多图">
                <div class="gallery-editor">
                  <div v-for="(_, index) in draft.basicInfo.galleryImages" :key="index" class="gallery-row">
                    <a-input v-model="draft.basicInfo.galleryImages[index]" placeholder="请输入图片链接" />
                    <a-button status="danger" @click="removeGalleryImage(index)">删除</a-button>
                  </div>
                  <a-button @click="addGalleryImage">
                    <template #icon>
                      <icon-plus />
                    </template>
                    新增图片
                  </a-button>
                </div>
              </a-form-item>
            </a-grid-item>
            <a-grid-item :span="3">
              <a-form-item label="内部备注">
                <a-textarea v-model="draft.basicInfo.internalRemark" :max-length="200" placeholder="记录内部协同备注" allow-clear />
              </a-form-item>
            </a-grid-item>
          </a-grid>
        </a-form>
      </ProductSectionCard>

      <ProductSectionCard title="包装和重量" description="用于后续物流费用估算和发货体积计算。">
        <a-form :model="draft" layout="vertical">
          <a-grid :cols="{ xs: 1, md: 2, xl: 5 }" :col-gap="16" :row-gap="4">
            <a-grid-item>
              <a-form-item label="毛重（kg）" required>
                <a-input-number v-model="draft.packaging.grossWeight" :min="0" :precision="2" hide-button placeholder="请输入毛重" />
              </a-form-item>
            </a-grid-item>
            <a-grid-item>
              <a-form-item label="净重（kg）">
                <a-input-number v-model="draft.packaging.netWeight" :min="0" :precision="2" hide-button placeholder="请输入净重" />
              </a-form-item>
            </a-grid-item>
            <a-grid-item>
              <a-form-item label="包装长度（cm）" required>
                <a-input-number v-model="draft.packaging.packageLength" :min="0" :precision="1" hide-button placeholder="请输入长度" />
              </a-form-item>
            </a-grid-item>
            <a-grid-item>
              <a-form-item label="包装宽度（cm）" required>
                <a-input-number v-model="draft.packaging.packageWidth" :min="0" :precision="1" hide-button placeholder="请输入宽度" />
              </a-form-item>
            </a-grid-item>
            <a-grid-item>
              <a-form-item label="包装高度（cm）" required>
                <a-input-number v-model="draft.packaging.packageHeight" :min="0" :precision="1" hide-button placeholder="请输入高度" />
              </a-form-item>
            </a-grid-item>
          </a-grid>
        </a-form>
      </ProductSectionCard>

      <ProductSectionCard title="报关和物流属性" description="保留报关基础字段和物流属性标签，为后续履约和清关链路预留结构。">
        <a-form :model="draft" layout="vertical">
          <a-grid :cols="{ xs: 1, md: 2, xl: 3 }" :col-gap="16" :row-gap="4">
            <a-grid-item>
              <a-form-item label="报关中文名" required>
                <a-input v-model="draft.logistics.customsChineseName" placeholder="请输入报关中文名" />
              </a-form-item>
            </a-grid-item>
            <a-grid-item>
              <a-form-item label="报关英文名">
                <a-input v-model="draft.logistics.customsEnglishName" placeholder="请输入报关英文名" />
              </a-form-item>
            </a-grid-item>
            <a-grid-item>
              <a-form-item label="HS Code">
                <a-input v-model="draft.logistics.hsCode" placeholder="请输入 HS Code" />
              </a-form-item>
            </a-grid-item>
            <a-grid-item>
              <a-form-item label="原产地">
                <a-input v-model="draft.logistics.countryOfOrigin" placeholder="请输入原产地" />
              </a-form-item>
            </a-grid-item>
            <a-grid-item :span="2">
              <a-form-item label="物流属性标签">
                <a-select v-model="draft.logistics.logisticsTags" multiple allow-clear placeholder="请选择物流属性">
                  <a-option v-for="option in logisticsTagOptions" :key="option.value" :value="option.value">{{ option.label }}</a-option>
                </a-select>
              </a-form-item>
            </a-grid-item>
            <a-grid-item :span="3">
              <a-form-item label="敏感货标签">
                <a-input-tag v-model="draft.logistics.sensitiveTags" placeholder="输入后回车，可自定义标签" allow-clear />
              </a-form-item>
            </a-grid-item>
          </a-grid>
        </a-form>
      </ProductSectionCard>

      <ProductSectionCard title="采购参考" description="第一版允许手工维护最近采购信息，后续做采购单时再自动回写。">
        <a-form :model="draft" layout="vertical">
          <a-grid :cols="{ xs: 1, md: 2, xl: 3 }" :col-gap="16" :row-gap="4">
            <a-grid-item :span="2">
              <a-form-item label="默认采购链接" required>
                <a-input v-model="draft.procurement.defaultPurchaseUrl" placeholder="请输入默认采购链接" />
              </a-form-item>
            </a-grid-item>
            <a-grid-item>
              <a-form-item label="是否可采购" required>
                <a-select v-model="draft.procurement.purchasable" placeholder="请选择">
                  <a-option v-for="option in purchasableOptions" :key="String(option.value)" :value="option.value">{{ option.label }}</a-option>
                </a-select>
              </a-form-item>
            </a-grid-item>
            <a-grid-item>
              <a-form-item label="最近采购供应商">
                <a-input v-model="draft.procurement.recentSupplier" placeholder="请输入最近采购供应商" />
              </a-form-item>
            </a-grid-item>
            <a-grid-item>
              <a-form-item label="最近采购价">
                <a-input-number v-model="draft.procurement.recentPrice" :min="0" :precision="2" hide-button placeholder="请输入最近采购价" />
              </a-form-item>
            </a-grid-item>
            <a-grid-item>
              <a-form-item label="采购币种">
                <a-select v-model="draft.procurement.currency" placeholder="请选择币种">
                  <a-option v-for="option in currencyOptions" :key="option.value" :value="option.value">{{ option.label }}</a-option>
                </a-select>
              </a-form-item>
            </a-grid-item>
            <a-grid-item>
              <a-form-item label="最近采购日期">
                <a-date-picker v-model="draft.procurement.recentPurchaseDate" value-format="YYYY-MM-DD" style="width: 100%" />
              </a-form-item>
            </a-grid-item>
            <a-grid-item>
              <a-form-item label="采购状态">
                <a-select v-model="draft.procurement.status" allow-clear placeholder="请选择采购状态">
                  <a-option v-for="option in procurementStatusOptions" :key="option.value" :value="option.value">{{ option.label }}</a-option>
                </a-select>
              </a-form-item>
            </a-grid-item>
            <a-grid-item :span="2">
              <a-form-item label="采购备注">
                <a-textarea v-model="draft.procurement.note" placeholder="记录最近采购情况或风险提示" allow-clear />
              </a-form-item>
            </a-grid-item>
          </a-grid>
        </a-form>
      </ProductSectionCard>

      <ProductSectionCard title="平台店铺映射" description="一个内部 SKU 可以绑定多个平台、多个店铺、多个平台商品。">
        <template #extra>
          <a-button size="small" @click="addMapping">
            <template #icon>
              <icon-plus />
            </template>
            新增映射
          </a-button>
        </template>

        <a-table :columns="mappingColumns" :data="draft.mappings" row-key="id" :pagination="false" :scroll="{ x: 1280 }" class="mapping-table">
          <template #platform="{ record }">
            <a-select v-model="(record as ProductPlatformMapping).platform" allow-clear placeholder="平台">
              <a-option v-for="option in platformOptions" :key="option.value" :value="option.value">{{ option.label }}</a-option>
            </a-select>
          </template>

          <template #store="{ record }">
            <a-select v-model="(record as ProductPlatformMapping).store" allow-clear placeholder="店铺">
              <a-option v-for="option in storeOptions" :key="option.value" :value="option.value">{{ option.label }}</a-option>
            </a-select>
          </template>

          <template #platformProductId="{ record }">
            <a-input v-model="(record as ProductPlatformMapping).platformProductId" placeholder="选填" />
          </template>

          <template #platformSkuId="{ record }">
            <a-input v-model="(record as ProductPlatformMapping).platformSkuId" placeholder="选填" />
          </template>

          <template #storeSku="{ record }">
            <a-input v-model="(record as ProductPlatformMapping).storeSku" placeholder="必填" />
          </template>

          <template #productUrl="{ record }">
            <a-input v-model="(record as ProductPlatformMapping).productUrl" placeholder="选填" />
          </template>

          <template #listingStatus="{ record }">
            <a-select v-model="(record as ProductPlatformMapping).listingStatus" placeholder="状态">
              <a-option v-for="option in listingStatusOptions" :key="option.value" :value="option.value">{{ option.label }}</a-option>
            </a-select>
          </template>

          <template #actions="{ record }">
            <a-button status="danger" size="small" @click="removeMapping((record as ProductPlatformMapping).id)">
              <template #icon>
                <icon-delete />
              </template>
            </a-button>
          </template>
        </a-table>

        <div v-if="draft.mappings.length === 0" class="mapping-empty">
          暂未绑定平台店铺商品，点击右上角“新增映射”开始维护。
        </div>
      </ProductSectionCard>

      <div class="sticky-footer">
        <a-space wrap>
          <a-button :loading="saving" type="primary" @click="saveProduct(false)">保存</a-button>
          <a-button :loading="saving" @click="saveProduct(true)">保存并返回</a-button>
          <a-button @click="goBackToList">返回列表</a-button>
        </a-space>
      </div>
    </template>

    <a-result v-else status="404" title="未找到商品" subtitle="当前 SKU 不存在，可能已经被删除或链接已失效。">
      <template #extra>
        <a-button type="primary" @click="goBackToList">返回商品列表</a-button>
      </template>
    </a-result>
  </div>
</template>

<style scoped>
.product-detail-page {
  --product-color-primary: rgb(var(--primary-6));
  --product-color-text: var(--color-text-1);
  --product-color-text-secondary: var(--color-text-2);
  --product-color-text-tertiary: var(--color-text-3);
  --product-color-bg: var(--color-bg-2);
  --product-color-fill: var(--color-fill-1);
  --product-color-border: var(--color-border-2);
  --product-color-control-border: var(--color-border-2);
  --product-control-height: var(--size-default, 32px);
  --product-radius: var(--border-radius-medium);
  --workspace-color-primary: var(--product-color-primary);
  --workspace-color-text: var(--product-color-text);
  --workspace-color-text-secondary: var(--product-color-text-secondary);
  --workspace-color-text-tertiary: var(--product-color-text-tertiary);
  --workspace-color-bg: var(--product-color-bg);
  --workspace-color-border: var(--product-color-border);
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 16px;
  padding-bottom: 24px;
}

.overview-card {
  display: flex;
  min-height: 104px;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 28px;
  border: 1px solid var(--product-color-border);
  border-radius: 12px;
  background: var(--product-color-bg);
  box-shadow: none;
}

.overview-profile {
  display: flex;
  align-items: center;
  flex: 1 1 auto;
  min-width: 0;
  gap: 16px;
}

.image-preview {
  display: flex;
  width: 64px;
  height: 64px;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  overflow: hidden;
  border-radius: 50%;
  background: #eef4ff;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-empty {
  padding: 0 12px;
  color: #5a78a8;
  font-size: 11px;
  line-height: 16px;
  text-align: center;
}

.overview-identity {
  display: flex;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
}

.overview-title-row {
  display: flex;
  min-width: 0;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.overview-title-row strong {
  color: var(--product-color-text);
  font-size: 18px;
  font-weight: 600;
  line-height: 26px;
}

.overview-identity > span {
  color: var(--product-color-text-secondary);
  font-size: 13px;
  line-height: 20px;
}

.overview-title-row :deep(.arco-tag) {
  height: 20px;
  padding: 0 6px;
  font-size: 12px;
  line-height: 18px;
}

.overview-stats {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: flex-end;
  gap: clamp(32px, 4vw, 64px);
}

.overview-stat {
  min-width: 82px;
  text-align: left;
}

.overview-stat strong {
  display: block;
  color: var(--product-color-text);
  font-size: 18px;
  font-weight: 600;
  line-height: 26px;
}

.overview-stat span {
  display: block;
  font-size: 13px;
  line-height: 20px;
  color: var(--product-color-text-tertiary);
}

.mapping-tip {
  border-radius: 8px;
}

.field-helper {
  margin-top: 6px;
}

.gallery-editor {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.gallery-row {
  display: flex;
  gap: 10px;
}

.product-detail-page :deep(.arco-form-item-label-col > label) {
  color: var(--product-color-text-secondary);
  font-size: 13px;
}

.product-detail-page :deep(.arco-input-wrapper),
.product-detail-page :deep(.arco-select-view-single),
.product-detail-page :deep(.arco-textarea-wrapper),
.product-detail-page :deep(.arco-input-number),
.product-detail-page :deep(.arco-picker) {
  border-color: var(--product-color-control-border);
  background: var(--product-color-bg);
  box-shadow: none;
}

.product-detail-page :deep(.arco-input-wrapper),
.product-detail-page :deep(.arco-select-view-single),
.product-detail-page :deep(.arco-input-number),
.product-detail-page :deep(.arco-picker) {
  min-height: var(--product-control-height);
}

.product-detail-page :deep(.arco-textarea-wrapper),
.product-detail-page :deep(.arco-input-number),
.product-detail-page :deep(.arco-picker) {
  border-radius: var(--product-radius);
}

.product-detail-page :deep(.arco-input-wrapper:hover),
.product-detail-page :deep(.arco-input-wrapper.arco-input-focus),
.product-detail-page :deep(.arco-select-view-single:hover),
.product-detail-page :deep(.arco-select-view-single.arco-select-view-focus),
.product-detail-page :deep(.arco-textarea-wrapper:hover),
.product-detail-page :deep(.arco-textarea-wrapper-focus),
.product-detail-page :deep(.arco-input-number:hover),
.product-detail-page :deep(.arco-input-number-focus),
.product-detail-page :deep(.arco-picker:hover),
.product-detail-page :deep(.arco-picker-focused) {
  border-color: var(--product-color-primary);
  box-shadow: 0 4px 10px rgba(var(--primary-6), 0.12);
}

.product-detail-page :deep(.arco-input),
.product-detail-page :deep(.arco-textarea),
.product-detail-page :deep(.arco-select-view-value),
.product-detail-page :deep(.arco-input-number-input),
.product-detail-page :deep(.arco-picker input) {
  font-size: 13px;
}

.mapping-table :deep(.arco-table-th) {
  background: var(--product-color-fill);
  color: var(--product-color-text-secondary);
}

.mapping-table :deep(.arco-table-border .arco-table-container::before),
.mapping-table :deep(.arco-table-border .arco-table-container::after),
.mapping-table :deep(.arco-table-border .arco-table-container .arco-table),
.mapping-table :deep(.arco-table-border .arco-table-tr::after),
.mapping-table :deep(.arco-table-border .arco-table-th),
.mapping-table :deep(.arco-table-border .arco-table-td) {
  border-color: #e9edf3;
}

.mapping-table :deep(.arco-table-td) {
  background: var(--product-color-bg);
}

.mapping-empty {
  padding-top: 12px;
  color: var(--product-color-text-tertiary);
  font-size: 12px;
}

.sticky-footer {
  position: sticky;
  bottom: 0;
  z-index: 5;
  display: flex;
  justify-content: flex-end;
  padding: 16px 18px;
  border: 1px solid var(--product-color-border);
  border-radius: 8px;
  background: var(--product-color-bg);
  box-shadow: none;
}

@media (max-width: 1200px) {
  .overview-card {
    align-items: stretch;
    flex-direction: column;
    padding: 20px 24px;
  }

  .overview-stats {
    justify-content: flex-start;
    gap: 32px;
  }
}

@media (max-width: 768px) {
  .overview-profile {
    align-items: flex-start;
    flex-direction: column;
  }

  .overview-card {
    padding: 18px;
  }

  .overview-stats {
    display: grid;
    width: 100%;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }

  .overview-stat {
    min-width: 0;
  }

  .gallery-row {
    flex-direction: column;
  }

  .sticky-footer {
    justify-content: flex-start;
  }
}
</style>
