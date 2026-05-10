<script setup lang="ts">
import { ref } from 'vue'
import { IconCheck, IconClose, IconEdit } from '@arco-design/web-vue/es/icon'

export type ProductDetailInfoControl = 'readonly' | 'text' | 'select' | 'combobox' | 'number' | 'dimension' | 'multiselect' | 'tag' | 'date' | 'textarea'
export type ProductDetailInfoValue = string | number | boolean | string[] | [number | undefined, number | undefined, number | undefined] | undefined

export type ProductDetailInfoOption = {
  label: string
  value: string | boolean
}

export type ProductDetailInfoItem = {
  key: string
  label: string
  value: string
  control: ProductDetailInfoControl
  href?: string
  editValue?: ProductDetailInfoValue
  required?: boolean
  mono?: boolean
  options?: ProductDetailInfoOption[]
  statusTone?: 'green' | 'orange' | 'red'
  span?: 'wide' | 'full'
}

const { items } = defineProps<{
  items: ProductDetailInfoItem[]
}>()

const emit = defineEmits<{
  save: [key: string, value: ProductDetailInfoValue]
}>()

const editingKeys = ref<Record<string, true>>({})
const fieldDrafts = ref<Record<string, any>>({})
const dimensionDrafts = ref<Record<string, [number | undefined, number | undefined, number | undefined]>>({})

const cloneValue = (value: ProductDetailInfoValue): ProductDetailInfoValue => {
  if (!Array.isArray(value)) return value
  if (value.every((item) => typeof item === 'string')) return [...value]

  return [
    typeof value[0] === 'number' ? value[0] : undefined,
    typeof value[1] === 'number' ? value[1] : undefined,
    typeof value[2] === 'number' ? value[2] : undefined,
  ]
}

const startEdit = (item: ProductDetailInfoItem) => {
  if (item.control === 'readonly') return

  editingKeys.value = { ...editingKeys.value, [item.key]: true }

  if (item.control === 'dimension') {
    const nextValue = Array.isArray(item.editValue) ? item.editValue : []
    dimensionDrafts.value = {
      ...dimensionDrafts.value,
      [item.key]: [nextValue[0] as number | undefined, nextValue[1] as number | undefined, nextValue[2] as number | undefined],
    }
    return
  }

  fieldDrafts.value = { ...fieldDrafts.value, [item.key]: cloneValue(item.editValue) }
}

const isEditing = (key: string) => Boolean(editingKeys.value[key])

const cancelEdit = (key: string) => {
  const { [key]: removedEditingKey, ...nextEditingKeys } = editingKeys.value
  const { [key]: removedFieldDraft, ...nextFieldDrafts } = fieldDrafts.value
  const { [key]: removedDimensionDraft, ...nextDimensionDrafts } = dimensionDrafts.value

  void removedEditingKey
  void removedFieldDraft
  void removedDimensionDraft

  editingKeys.value = nextEditingKeys
  fieldDrafts.value = nextFieldDrafts
  dimensionDrafts.value = nextDimensionDrafts
}

const saveEdit = (item: ProductDetailInfoItem) => {
  emit(
    'save',
    item.key,
    item.control === 'dimension'
      ? (dimensionDrafts.value[item.key] ?? [undefined, undefined, undefined])
      : cloneValue(fieldDrafts.value[item.key]),
  )
  cancelEdit(item.key)
}
</script>

<template>
  <div class="basic-detail-grid">
    <div
      v-for="item in items"
      :key="item.key"
      class="basic-detail-field"
      :class="{
        'is-editing': isEditing(item.key),
        'is-readonly': item.control === 'readonly',
        'is-wide': item.span === 'wide',
        'is-full': item.span === 'full',
      }"
    >
      <span class="basic-detail-label">
        {{ item.label }}
      </span>

      <div class="basic-detail-main">
        <div v-if="isEditing(item.key)" class="basic-detail-editor">
          <a-input
            v-if="item.control === 'text'"
            v-model="fieldDrafts[item.key]"
            class="basic-detail-editor-control"
            size="small"
            allow-clear
            :class="{ 'is-mono-editor': item.mono }"
          />
          <a-select
            v-else-if="item.control === 'select'"
            v-model="fieldDrafts[item.key]"
            class="basic-detail-editor-control"
            size="small"
            allow-clear
          >
            <a-option v-for="option in item.options" :key="String(option.value)" :value="option.value">{{ option.label }}</a-option>
          </a-select>
          <a-select
            v-else-if="item.control === 'combobox'"
            v-model="fieldDrafts[item.key]"
            class="basic-detail-editor-control"
            size="small"
            allow-search
            allow-create
            allow-clear
          >
            <a-option v-for="option in item.options" :key="String(option.value)" :value="option.value">{{ option.label }}</a-option>
          </a-select>
          <a-select
            v-else-if="item.control === 'multiselect'"
            v-model="fieldDrafts[item.key]"
            class="basic-detail-editor-control"
            size="small"
            multiple
            allow-clear
          >
            <a-option v-for="option in item.options" :key="String(option.value)" :value="option.value">{{ option.label }}</a-option>
          </a-select>
          <a-input-tag
            v-else-if="item.control === 'tag'"
            v-model="fieldDrafts[item.key]"
            class="basic-detail-editor-control"
            size="small"
            allow-clear
          />
          <a-input-number
            v-else-if="item.control === 'number'"
            v-model="fieldDrafts[item.key]"
            class="basic-detail-editor-control"
            :min="0"
            :precision="3"
            :step="0.001"
            size="small"
            hide-button
          />
          <a-date-picker
            v-else-if="item.control === 'date'"
            v-model="fieldDrafts[item.key]"
            class="basic-detail-editor-control"
            value-format="YYYY-MM-DD"
            size="small"
          />
          <a-textarea
            v-else-if="item.control === 'textarea'"
            v-model="fieldDrafts[item.key]"
            class="basic-detail-editor-control is-textarea"
            size="small"
            auto-size
            allow-clear
          />
          <div v-else-if="item.control === 'dimension'" class="dimension-editor">
            <a-input-number v-model="dimensionDrafts[item.key][0]" class="basic-detail-editor-control" :min="0" :precision="1" size="small" hide-button />
            <span>×</span>
            <a-input-number v-model="dimensionDrafts[item.key][1]" class="basic-detail-editor-control" :min="0" :precision="1" size="small" hide-button />
            <span>×</span>
            <a-input-number v-model="dimensionDrafts[item.key][2]" class="basic-detail-editor-control" :min="0" :precision="1" size="small" hide-button />
          </div>

          <div class="basic-detail-actions">
            <button
              type="button"
              class="basic-detail-action is-save"
              :aria-label="`保存${item.label}`"
              @click="saveEdit(item)"
            >
              <icon-check />
            </button>
            <button
              type="button"
              class="basic-detail-action is-cancel"
              aria-label="取消编辑"
              @click="cancelEdit(item.key)"
            >
              <icon-close />
            </button>
          </div>
        </div>

        <div v-else class="basic-detail-display">
          <span
            v-if="item.statusTone"
            class="basic-detail-status"
            :class="`is-${item.statusTone}`"
          >
            <span class="basic-detail-status-dot" />
            {{ item.value }}
          </span>
          <a
            v-else-if="item.href && item.value !== '-'"
            class="basic-detail-link"
            :href="item.href"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ item.value }}
          </a>
          <span v-else class="basic-detail-value" :class="{ 'is-mono': item.mono }">{{ item.value }}</span>
          <button
            v-if="item.control !== 'readonly'"
            type="button"
            class="basic-detail-edit-button"
            :aria-label="`编辑${item.label}`"
            @click="startEdit(item)"
          >
            <icon-edit />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.basic-detail-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: start;
  row-gap: 14px;
  column-gap: 48px;
  padding-bottom: 20px;
}

.basic-detail-field {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  min-height: 32px;
  min-width: 0;
  border: 0;
  background: transparent;
}

.basic-detail-field.is-wide {
  grid-column: span 2;
}

.basic-detail-field.is-full {
  grid-column: 1 / -1;
}

.basic-detail-field:hover,
.basic-detail-field.is-editing {
  background: transparent;
  box-shadow: none;
}

.basic-detail-field.is-readonly:hover {
  box-shadow: none;
}

.basic-detail-main {
  min-width: 0;
}

.basic-detail-label {
  min-width: 0;
  color: var(--product-color-text-tertiary);
  font-size: 13px;
  font-weight: 500;
  line-height: 22px;
  white-space: nowrap;
}

.basic-detail-edit-button {
  display: inline-flex;
  width: 14px;
  height: 14px;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border: 0;
  border-radius: 0;
  appearance: none;
  background: transparent;
  color: var(--color-text-4);
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 0;
  opacity: 1;
  transition: color 0.16s ease;
}

.basic-detail-edit-button:hover {
  color: var(--product-color-primary);
}

.basic-detail-edit-button :deep(svg) {
  width: 14px;
  height: 14px;
}

.basic-detail-display {
  display: flex;
  min-height: 32px;
  min-width: 0;
  align-items: center;
  gap: 4px;
}

.basic-detail-value {
  min-width: 0;
  color: var(--product-color-text);
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
  overflow-wrap: anywhere;
}

.basic-detail-link {
  min-width: 0;
  color: var(--product-color-primary);
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
  overflow-wrap: anywhere;
  text-decoration: none;
}

.basic-detail-link:hover {
  text-decoration: underline;
}

.basic-detail-value.is-mono {
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

.basic-detail-editor {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.basic-detail-editor :deep(.arco-input-wrapper),
.basic-detail-editor :deep(.arco-select-view-single),
.basic-detail-editor :deep(.arco-input-number),
.basic-detail-editor :deep(.arco-picker),
.basic-detail-editor :deep(.arco-input-tag) {
  width: 100%;
  height: 28px;
  min-height: 28px;
  line-height: 28px;
}

.basic-detail-editor :deep(.arco-textarea-wrapper) {
  width: 100%;
  min-height: 28px;
}

.basic-detail-editor-control {
  height: 28px;
  min-height: 28px;
}

.basic-detail-editor-control.is-textarea {
  height: auto;
}

.basic-detail-editor .is-mono-editor :deep(.arco-input) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.dimension-editor {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 6px;
}

.dimension-editor span {
  color: var(--product-color-text-tertiary);
  font-size: 12px;
}

.basic-detail-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.basic-detail-action {
  display: inline-flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  padding: 0;
  border: 0;
  border-radius: 0;
  appearance: none;
  background: transparent;
  color: var(--product-color-text-secondary);
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  transition: opacity 0.16s ease;
}

.basic-detail-action.is-save {
  color: #00b42a;
}

.basic-detail-action.is-cancel {
  color: #f53f3f;
}

.basic-detail-action:hover {
  opacity: 0.78;
}

.basic-detail-action :deep(svg) {
  width: 14px;
  height: 14px;
}

.basic-detail-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 1px 10px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
}

.basic-detail-status.is-green {
  background: rgba(0, 180, 42, 0.12);
  color: #00b42a;
}

.basic-detail-status.is-orange {
  background: rgba(255, 125, 0, 0.12);
  color: #ff7d00;
}

.basic-detail-status.is-red {
  background: rgba(245, 63, 63, 0.12);
  color: #f53f3f;
}

.basic-detail-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

@media (max-width: 1199px) {
  .basic-detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 32px;
  }

  .basic-detail-field.is-wide,
  .basic-detail-field.is-full {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .basic-detail-grid {
    grid-template-columns: 1fr;
  }

  .basic-detail-field {
    min-height: auto;
  }
}
</style>
