<template>
  <div class="query-action-bar">
    <slot />
  </div>
</template>

<style scoped>
.query-action-bar {
  display: flex;
  min-width: max-content;
  flex: 1 0 240px;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-left: auto;
}

.query-action-bar :deep(.arco-btn) {
  border-radius: 4px;
}

.query-action-bar :deep(.arco-btn:not(.arco-btn-primary)) {
  border-color: var(--workspace-color-control-border, var(--color-border-2));
  background: var(--workspace-color-bg, var(--color-bg-2));
  color: var(--workspace-color-text-secondary, var(--color-text-2));
  box-shadow: none;
}

.query-action-bar :deep(.arco-btn-primary) {
  height: var(--workspace-control-height, var(--size-default, 32px));
}

.query-action-bar :deep(.arco-btn-size-small) {
  width: var(--workspace-control-height, var(--size-default, 32px));
  height: var(--workspace-control-height, var(--size-default, 32px));
  padding: 0;
}

.query-action-bar :deep(.arco-btn-size-small:hover),
.query-action-bar :deep(.arco-btn-size-small:focus-visible) {
  border-color: var(--workspace-color-primary, rgb(var(--primary-6)));
  background: var(--workspace-color-bg, var(--color-bg-2));
  color: var(--workspace-color-text-secondary, var(--color-text-2));
  box-shadow: 0 4px 10px rgba(var(--primary-6), 0.16);
}

@media (max-width: 768px) {
  .query-action-bar {
    width: 100%;
    justify-content: flex-start;
    margin-left: 0;
  }
}
</style>
