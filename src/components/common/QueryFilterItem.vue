<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import type { CSSProperties, HTMLAttributes } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  label: string
  width?: string
  minWidth?: string
}>(), {
  width: '300px',
  minWidth: '300px',
})

const attrs = useAttrs()

const itemStyle = computed<CSSProperties>(() => ({
  width: props.width,
  minWidth: props.minWidth,
}))

const itemClass = computed(() => attrs.class as HTMLAttributes['class'])
</script>

<template>
  <div
    v-bind="{ ...attrs, class: undefined, style: undefined }"
    class="query-filter-item"
    :class="itemClass"
    :style="[itemStyle, attrs.style as CSSProperties]"
  >
    <div class="query-filter-label">
      <span>{{ label }}</span>
    </div>
    <slot />
  </div>
</template>

<style scoped>
.query-filter-item {
  display: flex;
  max-width: none;
  align-items: stretch;
}

.query-filter-item:hover :deep(.arco-select-view-single),
.query-filter-item:focus-within :deep(.arco-select-view-single),
.query-filter-item:hover :deep(.arco-input-wrapper),
.query-filter-item:focus-within :deep(.arco-input-wrapper),
.query-filter-item:hover :deep(.arco-input-number),
.query-filter-item:focus-within :deep(.arco-input-number),
.query-filter-item:hover :deep(.arco-picker),
.query-filter-item:focus-within :deep(.arco-picker) {
  border-color: var(--workspace-color-primary, rgb(var(--primary-6)));
  box-shadow: 0 4px 10px rgba(var(--primary-6), 0.12);
}

.query-filter-label {
  display: flex;
  height: var(--workspace-control-height, var(--size-default, 32px));
  align-items: center;
  flex-shrink: 0;
  padding: 0 16px;
  border: 1px solid var(--workspace-color-control-border, var(--color-border-2));
  border-right: 0;
  border-radius: var(--workspace-radius, var(--border-radius-medium)) 0 0 var(--workspace-radius, var(--border-radius-medium));
  background: var(--workspace-color-bg, var(--color-bg-2));
  color: var(--workspace-color-text-secondary, var(--color-text-2));
  font-size: 14px;
  line-height: var(--workspace-control-height, var(--size-default, 32px));
  white-space: nowrap;
}

.query-filter-label span {
  display: inline-flex;
  align-items: center;
}

.query-filter-item :deep(.arco-select),
.query-filter-item :deep(.arco-input-search),
.query-filter-item :deep(.arco-picker),
.query-filter-item :deep(.arco-input-number) {
  min-width: 0;
  flex: 1;
  width: 100%;
}

.query-filter-item :deep(.arco-select-view-single),
.query-filter-item :deep(.arco-input-wrapper),
.query-filter-item :deep(.arco-input-number),
.query-filter-item :deep(.arco-picker) {
  height: var(--workspace-control-height, var(--size-default, 32px));
  border-color: var(--workspace-color-control-border, var(--color-border-2));
  border-radius: 0 var(--workspace-radius, var(--border-radius-medium)) var(--workspace-radius, var(--border-radius-medium)) 0;
  background: var(--workspace-color-bg, var(--color-bg-2));
  box-shadow: none;
}

.query-filter-item :deep(.arco-select-view-single),
.query-filter-item :deep(.arco-input-wrapper),
.query-filter-item :deep(.arco-picker) {
  margin-left: -1px;
}

.query-filter-item :deep(.arco-select-view-value),
.query-filter-item :deep(.arco-input),
.query-filter-item :deep(.arco-input-number-input) {
  font-size: 13px;
}

@media (max-width: 768px) {
  .query-filter-item {
    width: 100% !important;
    max-width: 100%;
  }
}
</style>
