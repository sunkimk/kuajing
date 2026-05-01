<script setup lang="ts">
import { IconArrowLeft } from '@arco-design/web-vue/es/icon'

defineProps<{
  title: string
  description?: string
  breadcrumbs: string[]
}>()

const emit = defineEmits<{
  back: []
}>()
</script>

<template>
  <section class="secondary-page-header">
    <nav class="secondary-page-header-breadcrumb" aria-label="面包屑">
      <template v-for="(breadcrumb, index) in breadcrumbs" :key="`${breadcrumb}-${index}`">
        <span
          class="secondary-page-header-breadcrumb-item"
          :class="{ 'is-current': index === breadcrumbs.length - 1 }"
        >
          {{ breadcrumb }}
        </span>
        <span v-if="index < breadcrumbs.length - 1" class="secondary-page-header-breadcrumb-separator">/</span>
      </template>
    </nav>

    <div class="secondary-page-header-title-row">
      <button type="button" class="secondary-page-header-back" aria-label="返回上一页" @click="emit('back')">
        <icon-arrow-left />
      </button>
      <h1 class="secondary-page-header-title">{{ title }}</h1>
      <span v-if="description" class="secondary-page-header-divider" aria-hidden="true" />
      <p v-if="description" class="secondary-page-header-description">{{ description }}</p>
    </div>
  </section>
</template>

<style scoped>
.secondary-page-header {
  padding: 16px 18px 18px;
  border: 1px solid var(--workspace-color-border, var(--color-border-2));
  border-radius: 8px;
  background: var(--workspace-color-bg, var(--color-bg-2));
  box-shadow: none;
}

.secondary-page-header-breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0;
  margin-bottom: 12px;
  color: var(--workspace-color-text-secondary, var(--color-text-2));
  font-size: 14px;
  line-height: 22px;
}

.secondary-page-header-breadcrumb-item.is-current {
  color: var(--workspace-color-text, var(--color-text-1));
  font-weight: 500;
}

.secondary-page-header-breadcrumb-separator {
  margin: 0 12px;
  color: var(--workspace-color-text-tertiary, var(--color-text-3));
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
  font-size: 16px;
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
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
}

.secondary-page-header-divider {
  width: 1px;
  height: 18px;
  flex: 0 0 auto;
  background: var(--workspace-color-border, var(--color-border-2));
}

.secondary-page-header-description {
  min-width: 0;
  margin: 0;
  color: var(--workspace-color-text-tertiary, var(--color-text-3));
  font-size: 14px;
  line-height: 22px;
}

@media (max-width: 768px) {
  .secondary-page-header-title-row {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .secondary-page-header-divider {
    display: none;
  }

  .secondary-page-header-description {
    flex-basis: 100%;
    padding-left: 32px;
  }
}
</style>
