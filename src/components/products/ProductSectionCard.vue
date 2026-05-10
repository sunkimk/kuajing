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
  overflow: visible;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.product-section-card :deep(.arco-card-header) {
  height: auto;
  min-height: auto;
  align-items: flex-start;
  padding: 24px 0 8px;
  border-bottom: 0;
  overflow: visible;
}

.product-section-card :deep(.arco-card-header-title) {
  width: 100%;
  overflow: visible;
}

.product-section-card :deep(.arco-card-body) {
  padding: 14px 0 0;
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
