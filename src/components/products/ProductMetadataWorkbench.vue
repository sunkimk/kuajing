<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { IconExport, IconPlus, IconRefresh, IconSettings, IconUpload } from '@arco-design/web-vue/es/icon'
import type { FileItem, RequestOption, UploadRequest } from '@arco-design/web-vue/es/upload/interfaces'
import ConfigurableDataTable from '../common/ConfigurableDataTable.vue'
import QueryActionBar from '../common/QueryActionBar.vue'
import QueryFilterItem from '../common/QueryFilterItem.vue'
import QueryFilterPanel from '../common/QueryFilterPanel.vue'
import {
  createProductMetadataRecord,
  filterProductMetadataRows,
  productMetadataCategoryOptions,
  productMetadataMoveCategoryOptions,
  productMetadataPageConfigs,
  productMetadataRows,
  productMetadataSiteOptions,
  productMetadataStatusOptions,
  type ProductMetadataFormField,
  type ProductMetadataFormPayload,
  type ProductMetadataPageKey,
  type ProductMetadataRow,
  type ProductMetadataStatus,
} from '../../data/productMetadata'
import '../sales/salesWorkbench.css'

const props = defineProps<{
  pageKey: ProductMetadataPageKey
}>()

type MetadataFormState = Record<string, string | undefined>

const modalTitleFallbacks = {
  brand: '新增品牌资料',
  category: '添加品类',
}

const config = computed(() => productMetadataPageConfigs[props.pageKey])
const tableRows = ref<ProductMetadataRow[]>([...productMetadataRows[props.pageKey]])
const filters = reactive({
  keyword: '',
  parentCategory: undefined as string | undefined,
  site: undefined as string | undefined,
  status: undefined as ProductMetadataStatus | undefined,
})
const settingsVisible = ref(false)
const createModalVisible = ref(false)
const importCategoryModalVisible = ref(false)
const moveCategoryModalVisible = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const editingRecordId = ref<string>()
const formState = reactive<MetadataFormState>({})
const currentPage = ref(1)
const pageSize = ref(10)
const selectedRowKeys = ref<(string | number)[]>([])
const moveTargetCategory = ref<string | string[]>()
const categoryImportFileList = ref<FileItem[]>([])
const categoryImportTimer = ref<number>()

const filteredRows = computed(() => filterProductMetadataRows(tableRows.value, filters))
const pagedRows = computed(() =>
  filteredRows.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
)
const tableClass = computed(() => `data-table product-metadata-data-table product-metadata-${props.pageKey}-table`)
const metadataRowSelection = computed(() => props.pageKey === 'category'
  ? {
      type: 'checkbox' as const,
      showCheckedAll: true,
      onlyCurrent: true,
      fixed: true,
      width: 48,
    }
  : undefined
)
const activeModalFields = computed(() =>
  modalMode.value === 'edit' ? config.value.editFormFields : config.value.formFields
)
const activeModalTitle = computed(() =>
  modalMode.value === 'edit' ? config.value.editModalTitle : config.value.modalTitle || modalTitleFallbacks[props.pageKey]
)

const resetFormState = (fields: ProductMetadataFormField[] = activeModalFields.value) => {
  Object.keys(formState).forEach((key) => {
    delete formState[key]
  })

  fields.forEach((field) => {
    formState[field.key] = undefined
  })
}

const resetFilters = () => {
  filters.keyword = ''
  filters.parentCategory = undefined
  filters.site = undefined
  filters.status = undefined
  currentPage.value = 1
}

const applyFilters = () => {
  currentPage.value = 1
}

const exportMetadata = () => {
  Message.info('导出任务已创建')
}

const clearCategoryImportTimer = () => {
  if (categoryImportTimer.value !== undefined) {
    window.clearTimeout(categoryImportTimer.value)
    categoryImportTimer.value = undefined
  }
}

const resetCategoryImportState = () => {
  clearCategoryImportTimer()
  categoryImportFileList.value = []
}

const openImportCategoryModal = () => {
  resetCategoryImportState()
  importCategoryModalVisible.value = true
}

const closeImportCategoryModal = () => {
  importCategoryModalVisible.value = false
  resetCategoryImportState()
}

const isCategoryImportFile = (file: File) => /\.(xls|xlsx)$/i.test(file.name)

const validateCategoryImportFile = (file: File) => {
  if (!isCategoryImportFile(file)) {
    Message.warning('仅支持 xls/xlsx 文件')
    return false
  }
  return true
}

const handleCategoryImportUploadChange = (fileList: FileItem[]) => {
  categoryImportFileList.value = fileList.slice(-1)
}

const handleCategoryImportExceedLimit = () => {
  Message.warning('一次只能导入一个文件')
}

const handleCategoryImportRequest = (option: RequestOption): UploadRequest => {
  clearCategoryImportTimer()
  option.onProgress(45)

  const timerId = window.setTimeout(() => {
    option.onProgress(100)
    option.onSuccess()
    categoryImportTimer.value = undefined
    Message.success(`已成功导入 ${option.fileItem.name || option.fileItem.file?.name || '导入文件'}`)
  }, 900)

  categoryImportTimer.value = timerId

  return {
    abort: () => {
      window.clearTimeout(timerId)
      if (categoryImportTimer.value === timerId) {
        categoryImportTimer.value = undefined
      }
    },
  }
}

const downloadCategoryImportTemplate = () => {
  Message.success('导入模板已开始下载')
}

const clearCategorySelection = () => {
  selectedRowKeys.value = []
}

const moveSelectedCategories = () => {
  moveTargetCategory.value = undefined
  moveCategoryModalVisible.value = true
}

const exportSelectedCategories = () => {
  Message.info(`已创建 ${selectedRowKeys.value.length} 条所选品类导出任务`)
}

const deleteSelectedCategories = () => {
  const selectedKeys = selectedRowKeys.value.map(String)
  const selectedCount = selectedRowKeys.value.length
  if (!selectedCount) return

  Modal.confirm({
    title: '确认删除品类',
    titleAlign: 'start',
    content: `当前已选 ${selectedCount} 条品类，删除后将从列表移除，是否继续？`,
    okText: '删除',
    cancelText: '取消',
    modalClass: 'metadata-confirm-modal',
    okButtonProps: {
      status: 'danger',
    },
    onOk: () => {
      const selectedKeySet = new Set(selectedKeys)
      const nextRows = tableRows.value.filter((row) => !selectedKeySet.has(row.id))
      tableRows.value = nextRows
      selectedRowKeys.value = []
      currentPage.value = Math.min(
        currentPage.value,
        Math.max(1, Math.ceil(filterProductMetadataRows(nextRows, filters).length / pageSize.value))
      )
      Message.success(`已删除 ${selectedCount} 条品类`)
    },
  })
}

const closeMoveCategoryModal = () => {
  moveCategoryModalVisible.value = false
  moveTargetCategory.value = undefined
}

const getMoveTargetCategory = () => {
  if (Array.isArray(moveTargetCategory.value)) {
    return moveTargetCategory.value.at(-1)
  }

  return moveTargetCategory.value
}

const submitMoveCategoryModal = () => {
  const targetCategory = getMoveTargetCategory()
  if (!targetCategory) {
    Message.warning('请选择移动至的父品类')
    return false
  }

  const selectedKeySet = new Set(selectedRowKeys.value.map(String))
  tableRows.value = tableRows.value.map((row) =>
    selectedKeySet.has(row.id)
      ? { ...row, parentCategory: targetCategory, updatedAt: '刚刚' }
      : row
  )
  Message.success(`已移动 ${selectedRowKeys.value.length} 条品类`)
  clearCategorySelection()
  moveTargetCategory.value = undefined
  return true
}

const openCreateModal = () => {
  modalMode.value = 'create'
  editingRecordId.value = undefined
  resetFormState(config.value.formFields)
  createModalVisible.value = true
}

const closeMetadataModal = () => {
  createModalVisible.value = false
  editingRecordId.value = undefined
}

const getRecordFormValue = (record: ProductMetadataRow, fieldKey: ProductMetadataFormField['key']) => {
  const value = record[fieldKey as keyof ProductMetadataRow]
  return typeof value === 'number' ? String(value) : value?.toString()
}

const openEditModal = (record: ProductMetadataRow) => {
  modalMode.value = 'edit'
  editingRecordId.value = record.id
  resetFormState(config.value.editFormFields)
  config.value.editFormFields.forEach((field) => {
    formState[field.key] = getRecordFormValue(record, field.key)
  })
  createModalVisible.value = true
}

const getFieldOptions = (field: ProductMetadataFormField) => {
  if (field.options) return field.options
  if (field.key === 'parentCategory') return productMetadataCategoryOptions
  if (field.key === 'site') return productMetadataSiteOptions
  if (field.key === 'status') return productMetadataStatusOptions
  return []
}

const getFieldTooltip = (field: ProductMetadataFormField) =>
  field.key === 'shortCode' ? field.tooltip : undefined

const isFieldDisabled = (field: ProductMetadataFormField) =>
  modalMode.value === 'edit' && field.key === 'code'

const createFormPayload = () =>
  activeModalFields.value.reduce((payload, field) => ({
    ...payload,
    [field.key]: formState[field.key]?.trim(),
  }), {} as ProductMetadataFormPayload)

const updateMetadataRecord = (row: ProductMetadataRow, payload: ProductMetadataFormPayload): ProductMetadataRow => ({
  ...row,
  code: payload.code ?? row.code,
  name: payload.name ?? row.name,
  description: payload.description ?? row.description,
  parentCategory: payload.parentCategory ?? row.parentCategory,
  site: payload.site ?? row.site,
  shortCode: payload.shortCode ?? row.shortCode,
  status: (payload.status as ProductMetadataStatus | undefined) ?? row.status,
  updatedAt: '刚刚',
})

const toggleRowStatus = (record: ProductMetadataRow, status: string | number | boolean) => {
  const nextStatus: ProductMetadataStatus = status === '启用' ? '启用' : '停用'
  tableRows.value = tableRows.value.map((row) =>
    row.id === record.id
      ? { ...row, status: nextStatus, updatedAt: '刚刚' }
      : row
  )
  Message.success(nextStatus === '启用' ? '已开启' : '已停用')
}

const submitMetadataModal = () => {
  const missingField = activeModalFields.value.find((field) => field.required && !formState[field.key]?.trim())
  if (missingField) {
    Message.warning(`请填写${missingField.label}`)
    return false
  }

  const payload = createFormPayload()
  if (modalMode.value === 'edit' && editingRecordId.value) {
    tableRows.value = tableRows.value.map((row) =>
      row.id === editingRecordId.value ? updateMetadataRecord(row, payload) : row
    )
    Message.success('保存成功')
  } else {
    tableRows.value = [
      createProductMetadataRecord(props.pageKey, payload),
      ...tableRows.value,
    ]
    currentPage.value = 1
    Message.success('新增成功')
  }

  editingRecordId.value = undefined
  return true
}

watch(() => props.pageKey, () => {
  tableRows.value = [...productMetadataRows[props.pageKey]]
  selectedRowKeys.value = []
  resetFilters()
  resetFormState()
})

watch(filteredRows, (rows) => {
  const rowKeySet = new Set(rows.map((row) => row.id))
  selectedRowKeys.value = selectedRowKeys.value.filter((rowKey) => rowKeySet.has(String(rowKey)))
})

onBeforeUnmount(() => {
  clearCategoryImportTimer()
})
</script>

<template>
  <div class="sales-workbench product-metadata-page">
    <section class="page-header product-metadata-header">
      <div class="header-left">
        <h1 class="page-title">{{ config.title }}</h1>
      </div>

      <div class="metadata-header-actions">
        <a-button
          v-if="pageKey === 'category'"
          type="outline"
          class="action-button"
          @click="openImportCategoryModal"
        >
          导入新增品类
        </a-button>
        <a-button type="primary" class="action-button" @click="openCreateModal">
          <template #icon>
            <icon-plus />
          </template>
          {{ config.primaryAction }}
        </a-button>
      </div>
    </section>

    <QueryFilterPanel>
      <QueryFilterItem label="关键词" width="420px" min-width="320px">
        <a-input-search
          v-model="filters.keyword"
          allow-clear
          :placeholder="config.keywordPlaceholder"
          @search="applyFilters"
          @press-enter="applyFilters"
          @clear="applyFilters"
        />
      </QueryFilterItem>

      <QueryFilterItem v-if="pageKey === 'category'" label="父品类" width="300px" min-width="240px">
        <a-select v-model="filters.parentCategory" allow-clear placeholder="全部父品类" @change="applyFilters">
          <a-option v-for="option in productMetadataCategoryOptions" :key="option" :value="option">{{ option }}</a-option>
        </a-select>
      </QueryFilterItem>

      <QueryFilterItem v-if="pageKey === 'category'" label="站点" width="300px" min-width="240px">
        <a-select v-model="filters.site" allow-clear placeholder="全部站点" @change="applyFilters">
          <a-option v-for="option in productMetadataSiteOptions" :key="option" :value="option">{{ option }}</a-option>
        </a-select>
      </QueryFilterItem>

      <QueryFilterItem label="状态" width="220px" min-width="180px">
        <a-select v-model="filters.status" allow-clear placeholder="全部" @change="applyFilters">
          <a-option v-for="option in productMetadataStatusOptions" :key="option" :value="option">
            {{ option === '启用' ? '开启' : option }}
          </a-option>
        </a-select>
      </QueryFilterItem>

      <QueryActionBar>
        <a-button class="action-button" @click="resetFilters">重置</a-button>
        <a-tooltip content="定制列">
          <a-button size="small" class="icon-button" aria-label="定制列" @click="settingsVisible = true">
            <template #icon>
              <icon-settings />
            </template>
          </a-button>
        </a-tooltip>
        <a-tooltip content="刷新">
          <a-button size="small" class="icon-button" aria-label="刷新" @click="applyFilters">
            <template #icon>
              <icon-refresh />
            </template>
          </a-button>
        </a-tooltip>
        <a-tooltip content="导出">
          <a-button size="small" class="icon-button" aria-label="导出" @click="exportMetadata">
            <template #icon>
              <icon-export />
            </template>
          </a-button>
        </a-tooltip>
      </QueryActionBar>
    </QueryFilterPanel>

    <ConfigurableDataTable
      v-model:selected-keys="selectedRowKeys"
      v-model:settings-visible="settingsVisible"
      :columns="config.tableColumns"
      :default-visible-keys="config.defaultVisibleKeys"
      :required-keys="config.requiredKeys"
      :pinned-column-keys="config.pinnedColumnKeys"
      :default-freeze-last-column="true"
      :data="pagedRows"
      :row-selection="metadataRowSelection"
      row-key="id"
      :pagination="false"
      :table-class="tableClass"
      wrapper-class="product-metadata-table"
    >
      <template #code="{ record }">
        <span class="metadata-code-cell">{{ record.code }}</span>
      </template>

      <template #name="{ record }">
        <span class="metadata-name-cell">{{ record.name }}</span>
      </template>

      <template #status="{ record }">
        <a-switch
          :model-value="record.status"
          checked-value="启用"
          unchecked-value="停用"
          class="metadata-status-switch"
          @change="toggleRowStatus(record, $event)"
        />
      </template>

      <template #operation="{ record }">
        <a-button type="text" size="small" @click="openEditModal(record)">编辑</a-button>
      </template>

      <template #footer>
        <div class="metadata-table-footer-row">
          <div v-if="pageKey === 'category' && selectedRowKeys.length" class="metadata-bulk-action-bar">
            <span class="metadata-bulk-selected-count">
              已选 <span>{{ selectedRowKeys.length }}</span> / {{ filteredRows.length }} 条
            </span>
            <span
              class="arco-link metadata-bulk-cancel"
              role="button"
              tabindex="0"
              @click="clearCategorySelection"
              @keydown.enter.prevent="clearCategorySelection"
              @keydown.space.prevent="clearCategorySelection"
            >
              取消选择
            </span>
            <a-button @click="moveSelectedCategories">移动品类</a-button>
            <a-button @click="deleteSelectedCategories">批量删除</a-button>
            <a-button @click="exportSelectedCategories">导出所选品类</a-button>
          </div>
          <span v-else class="metadata-bulk-action-placeholder" aria-hidden="true" />

          <a-pagination
            v-model:current="currentPage"
            v-model:page-size="pageSize"
            class="metadata-pagination"
            :total="filteredRows.length"
            :page-size-options="[10, 20, 50]"
            show-total
            show-jumper
            show-page-size
          />
        </div>
      </template>
    </ConfigurableDataTable>

    <a-modal
      v-model:visible="createModalVisible"
      :title="activeModalTitle"
      width="600px"
      simple
      align-center
      modal-class="metadata-simple-modal"
      title-align="start"
      :on-before-ok="submitMetadataModal"
      @cancel="closeMetadataModal"
    >
      <div class="metadata-modal-content">
        <a-form
          :model="formState"
          layout="horizontal"
          :label-col-props="{ span: 5 }"
          :wrapper-col-props="{ span: 19 }"
          class="metadata-create-form"
        >
          <a-form-item
            v-for="field in activeModalFields"
            :key="field.key"
            :field="field.key"
            :label="field.label"
            :required="field.required"
            :tooltip="getFieldTooltip(field)"
          >
            <a-select
              v-if="field.kind === 'select'"
              v-model="formState[field.key]"
              allow-clear
              :disabled="isFieldDisabled(field)"
              :placeholder="field.placeholder || field.label"
              class="metadata-create-control"
            >
              <a-option v-for="option in getFieldOptions(field)" :key="option" :value="option">{{ option }}</a-option>
            </a-select>

            <a-input
              v-else
              v-model="formState[field.key]"
              allow-clear
              show-word-limit
              :disabled="isFieldDisabled(field)"
              :max-length="field.maxLength"
              :placeholder="field.placeholder || field.label"
              class="metadata-create-control"
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <a-modal
      v-model:visible="importCategoryModalVisible"
      title="导入新增品类"
      width="600px"
      simple
      align-center
      :footer="false"
      modal-class="metadata-simple-modal metadata-import-category-modal"
      title-align="start"
      @cancel="closeImportCategoryModal"
    >
      <div class="metadata-import-category-content">
        <section class="metadata-import-action-panel">
          <div class="metadata-import-action-main">
            <a-upload
              v-model:file-list="categoryImportFileList"
              class="metadata-import-upload"
              accept=".xls,.xlsx"
              :limit="1"
              :show-upload-button="{ showOnExceedLimit: true }"
              :custom-request="handleCategoryImportRequest"
              :on-before-upload="validateCategoryImportFile"
              :show-retry-button="false"
              @change="handleCategoryImportUploadChange"
              @exceed-limit="handleCategoryImportExceedLimit"
            >
              <template #upload-button>
                <span class="metadata-import-upload-row">
                  <a-button type="primary">
                    <template #icon>
                      <icon-upload />
                    </template>
                    点击导入
                  </a-button>
                  <a-link class="metadata-import-template-link" @click.stop="downloadCategoryImportTemplate">
                    下载导入模板
                  </a-link>
                  <span class="metadata-import-date">模板版本：2025.10 更新</span>
                </span>
              </template>
            </a-upload>
          </div>
        </section>

        <div class="metadata-import-notes">
          <strong>注意事项</strong>
          <ul>
            <li>支持导入格式为 xls/xlsx 的文件</li>
            <li>模板中的表头不可更改，不能删除</li>
            <li>同一个编码存在多条记录，以第一条记录为准</li>
            <li>导入文件不能超过1000行</li>
          </ul>
        </div>
      </div>
    </a-modal>

    <a-modal
      v-model:visible="moveCategoryModalVisible"
      title="移动品类"
      width="600px"
      simple
      align-center
      modal-class="metadata-simple-modal metadata-move-category-modal"
      title-align="start"
      :on-before-ok="submitMoveCategoryModal"
      @cancel="closeMoveCategoryModal"
    >
      <div class="metadata-modal-content metadata-move-category-content">
        <a-form
          :model="{ targetCategory: moveTargetCategory }"
          layout="horizontal"
          :label-col-props="{ span: 5 }"
          :wrapper-col-props="{ span: 19 }"
          class="metadata-create-form"
        >
          <a-form-item label="移动至" required tooltip="选择批量移动后的父品类。">
            <a-cascader
              v-model="moveTargetCategory"
              allow-clear
              allow-search
              :options="productMetadataMoveCategoryOptions"
              placeholder="父品类"
              class="metadata-create-control metadata-move-category-cascader"
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<style src="./productMetadata.css"></style>
