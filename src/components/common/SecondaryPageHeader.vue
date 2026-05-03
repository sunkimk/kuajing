<script setup lang="ts">
import { IconArrowLeft } from '@arco-design/web-vue/es/icon'

type SecondaryPageHeaderStatusTone = 'success' | 'warning' | 'neutral'

withDefaults(defineProps<{
  title: string
  description?: string
  statusText?: string
  statusTone?: SecondaryPageHeaderStatusTone
}>(), {
  statusTone: 'neutral',
})

const emit = defineEmits<{
  back: []
}>()
</script>

<template>
  <section class="secondary-page-header">
    <div class="secondary-page-header-title-row">
      <button type="button" class="secondary-page-header-back" aria-label="返回上一页" @click="emit('back')">
        <icon-arrow-left />
      </button>
      <h1 class="secondary-page-header-title">{{ title }}</h1>
      <span v-if="statusText" class="secondary-page-header-status" :class="`is-${statusTone}`">{{ statusText }}</span>
    </div>

    <p v-if="description" class="secondary-page-header-description">{{ description }}</p>
  </section>
</template>

<style scoped>
.secondary-page-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 2px 0 0;
}

.secondary-page-header-title-row {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
}

.secondary-page-header-back {
  display: inline-flex;
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border: 0;
  background: transparent;
  color: var(--workspace-color-text-secondary, var(--color-text-2));
  cursor: pointer;
  font-size: 15px;
  padding: 0;
}

.secondary-page-header-back:hover,
.secondary-page-header-back:focus-visible {
  color: var(--workspace-color-primary, rgb(var(--primary-6)));
  outline: none;
}

.secondary-page-header-title {
  margin: 0;
  color: var(--workspace-color-text, var(--color-text-1));
  font-size: 18px;
  font-weight: 600;
  line-height: 26px;
}

.secondary-page-header-status {
  display: inline-flex;
  min-height: 22px;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  padding: 0 8px;
  border: 1px solid transparent;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 500;
  line-height: 20px;
}

.secondary-page-header-status.is-success {
  border-color: #aff0b5;
  background: #e8ffea;
  color: #00a870;
}

.secondary-page-header-status.is-warning {
  border-color: #ffcf8b;
  background: #fff7e8;
  color: #d25f00;
}

.secondary-page-header-status.is-neutral {
  border-color: var(--workspace-color-border, var(--color-border-2));
  background: var(--color-fill-2);
  color: var(--workspace-color-text-secondary, var(--color-text-2));
}

.secondary-page-header-description {
  min-width: 0;
  margin: 0;
  padding-left: 32px;
  color: var(--workspace-color-text-tertiary, var(--color-text-3));
  font-size: 14px;
  line-height: 22px;
}

@media (max-width: 768px) {
  .secondary-page-header-title-row {
    align-items: flex-start;
    gap: 10px;
  }

  .secondary-page-header-description {
    padding-left: 30px;
  }
}
</style>
