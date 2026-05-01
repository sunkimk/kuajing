<script setup lang="ts">
import { computed } from 'vue'
import type { CSSProperties } from 'vue'

const props = withDefaults(defineProps<{
  cards: Array<{
    label: string
    value: string | number
    note: string
  }>
  columns?: number
}>(), {
  columns: 4,
})

const gridStyle = computed<CSSProperties>(() => ({
  '--metric-summary-columns': String(props.columns),
}))
</script>

<template>
  <section class="metric-summary-strip">
    <div class="metric-summary-grid" :style="gridStyle">
      <div v-for="card in cards" :key="card.label" class="metric-summary-item">
        <span>{{ card.label }}</span>
        <strong>{{ card.value }}</strong>
        <small>{{ card.note }}</small>
      </div>
    </div>
  </section>
</template>

<style scoped>
.metric-summary-strip {
  overflow: hidden;
  padding: 18px 0;
  border: 1px solid var(--workspace-color-border, var(--color-border-2));
  border-radius: 8px;
  background: var(--workspace-color-bg, var(--color-bg-2));
  box-shadow: none;
}

.metric-summary-grid {
  display: grid;
  grid-template-columns: repeat(var(--metric-summary-columns), minmax(0, 1fr));
}

.metric-summary-item {
  display: flex;
  min-height: 86px;
  flex-direction: column;
  justify-content: center;
  padding: 0 28px;
}

.metric-summary-item + .metric-summary-item {
  border-left: 1px solid var(--workspace-color-border, var(--color-border-2));
}

.metric-summary-item span {
  margin-bottom: 8px;
  color: var(--workspace-color-text-secondary, var(--color-text-2));
  font-size: 13px;
  line-height: 20px;
}

.metric-summary-item strong {
  margin-bottom: 6px;
  color: var(--workspace-color-text, var(--color-text-1));
  font-size: 26px;
  font-weight: 600;
  line-height: 32px;
}

.metric-summary-item small {
  color: var(--workspace-color-text-tertiary, var(--color-text-3));
  font-size: 12px;
  line-height: 18px;
}

@media (max-width: 1200px) {
  .metric-summary-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .metric-summary-item:nth-child(4) {
    border-left: 0;
  }
}

@media (max-width: 768px) {
  .metric-summary-grid {
    grid-template-columns: 1fr;
  }

  .metric-summary-item + .metric-summary-item {
    border-left: 0;
    border-top: 1px solid var(--workspace-color-border, var(--color-border-2));
  }
}
</style>
