<template>
  <section class="query-filter-panel-shell">
    <div class="query-filter-panel">
      <div class="query-filter-row">
        <slot />
      </div>
    </div>
  </section>
</template>

<style scoped>
.query-filter-panel-shell {
  padding-top: 2px;
}

.query-filter-panel {
  padding: 0;
  background: var(--workspace-color-bg, var(--color-bg-2));
}

.query-filter-row {
  display: flex;
  align-items: flex-start;
  gap: 12px 16px;
  flex-wrap: wrap;
}
</style>
