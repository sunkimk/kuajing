<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <a-card class="product-section-card" :bordered="false">
    <template #title>
      <div class="section-heading">
        <div class="section-copy">
          <span>{{ title }}</span>
          <small v-if="description">{{ description }}</small>
        </div>
        <slot name="extra" />
      </div>
    </template>

    <slot />
  </a-card>
</template>

<style scoped>
.product-section-card {
  overflow: hidden;
  border: 1px solid var(--color-border-2);
  border-radius: 8px;
  background: var(--color-bg-2);
  box-shadow: none;
}

.product-section-card :deep(.arco-card-header) {
  height: auto;
  min-height: auto;
  align-items: flex-start;
  padding: 14px 18px 12px;
  border-bottom: 1px solid #f2f3f5;
  overflow: visible;
}

.product-section-card :deep(.arco-card-header-title) {
  width: 100%;
  overflow: visible;
}

.product-section-card :deep(.arco-card-body) {
  padding: 18px;
}

.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.section-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
  overflow: visible;
}

.section-copy span {
  color: var(--color-text-1);
  font-size: 16px;
  font-weight: 600;
}

.section-copy small {
  display: block;
  color: var(--color-text-3);
  font-size: 12px;
  line-height: 18px;
  white-space: normal;
}
</style>
