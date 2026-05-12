<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  IconMenuFold,
  IconNotification,
  IconSearch,
} from '@arco-design/web-vue/es/icon'
import brandLogo from '../assets/brand-logo.svg'
import { findSectionByPath, navigationSections } from '../data/navigation'

const router = useRouter()
const route = useRoute()
const collapsed = ref(false)
const expandedSectionKeys = ref(
  navigationSections.filter((section) => !section.path && section.children?.length).map((section) => section.key),
)
const currentSection = computed(() => findSectionByPath(route.path))
const breadcrumbItems = computed(() => {
  const section = currentSection.value
  const title = String(route.meta.title ?? '')

  if (!section) {
    return [title]
  }

  if (section.path === route.path || section.title === title) {
    return [section.title]
  }

  return [section.title, title]
})

const sectionGroups = computed(() =>
  navigationSections.map((section) => ({
    ...section,
    isActiveGroup: currentSection.value?.key === section.key,
    isExpanded: section.path ? true : expandedSectionKeys.value.includes(section.key),
    items: section.path && section.icon
      ? [
          {
            key: section.key,
            title: section.title,
            path: section.path,
            icon: section.icon,
            isActive: route.path === section.path,
          },
        ]
      : (section.children ?? []).map((child) => ({
          ...child,
          isActive: route.path === child.path,
        })),
  })),
)

const handlePageClick = (path: string) => {
  router.push(path)
}

const toggleSection = (key: string) => {
  if (expandedSectionKeys.value.includes(key)) {
    expandedSectionKeys.value = expandedSectionKeys.value.filter((item) => item !== key)
    return
  }

  expandedSectionKeys.value = [...expandedSectionKeys.value, key]
}

const handleResponsiveCollapse = (value: boolean) => {
  collapsed.value = value
}
</script>

<template>
  <a-layout class="admin-layout">
    <a-layout-header class="admin-header">
      <div class="header-left">
        <div class="header-brand">
          <div class="header-brand-copy">
            <img :src="brandLogo" alt="跨境 ERP" class="brand-mark-header" />
            <strong>跨境 ERP</strong>
          </div>
        </div>

        <a-input-search
          class="global-search"
          placeholder="搜索订单、SKU、物流单号..."
          allow-clear
        >
          <template #prefix>
            <icon-search />
          </template>
        </a-input-search>
      </div>

      <div class="header-right">
        <a-select default-value="all-platforms" class="platform-select">
          <a-option value="all-platforms">全平台</a-option>
          <a-option value="wildberries">Wildberries</a-option>
          <a-option value="ozon">Ozon</a-option>
          <a-option value="tiktok">TikTok Shop</a-option>
        </a-select>

        <a-badge :count="3">
          <a-button class="header-icon-button" shape="circle">
            <template #icon>
              <icon-notification />
            </template>
          </a-button>
        </a-badge>

        <a-dropdown trigger="click">
          <div class="user-entry">
            <a-avatar :size="32" class="user-avatar">A</a-avatar>
          </div>
          <template #content>
            <a-doption>个人中心</a-doption>
            <a-doption>偏好设置</a-doption>
            <a-doption>退出登录</a-doption>
          </template>
        </a-dropdown>
      </div>
    </a-layout-header>

    <a-layout class="admin-body">
      <a-layout-sider
        class="admin-sider"
        :width="200"
        :collapsed="collapsed"
        collapsible
        breakpoint="lg"
        :hide-trigger="true"
        :collapsed-width="64"
        @collapse="handleResponsiveCollapse"
      >
        <div class="sider-body">
          <div class="sider-scroll">
            <div class="sider-nav">
              <template v-for="section in sectionGroups" :key="section.key">
                <a-tooltip
                  v-if="section.path && section.items[0]"
                  :content="section.items[0].title"
                  position="right"
                  :disabled="!collapsed"
                >
                  <button
                    type="button"
                    class="sider-page-item sider-page-item-top"
                    :class="{ 'is-active': section.items[0].isActive }"
                    @click="handlePageClick(section.items[0].path)"
                  >
                    <span class="sider-page-icon">
                      <component :is="section.items[0].icon" />
                    </span>
                    <span class="sider-page-label">{{ section.items[0].title }}</span>
                  </button>
                </a-tooltip>

                <section v-else class="sider-section">
                  <button
                    type="button"
                    class="sider-section-heading"
                    :class="{ 'is-current': section.isActiveGroup }"
                    @click="toggleSection(section.key)"
                  >
                    <span>{{ section.title }}</span>
                    <span class="section-arrow" :class="{ 'is-open': section.isExpanded }" />
                  </button>

                  <div v-show="collapsed || section.isExpanded" class="sider-section-items">
                    <a-tooltip
                      v-for="item in section.items"
                      :key="item.path"
                      :content="`${section.title} · ${item.title}`"
                      position="right"
                      :disabled="!collapsed"
                    >
                      <button
                        type="button"
                        class="sider-page-item"
                        :class="{ 'is-active': item.isActive }"
                        @click="handlePageClick(item.path)"
                      >
                        <span class="sider-page-icon">
                          <component :is="item.icon" />
                        </span>
                        <span class="sider-page-label">{{ item.title }}</span>
                      </button>
                    </a-tooltip>
                  </div>
                </section>
              </template>
            </div>
          </div>

          <div class="sider-footer">
            <button
              type="button"
              class="sider-trigger"
              :aria-label="collapsed ? '展开侧栏' : '收起侧栏'"
              @click="collapsed = !collapsed"
            >
              <span class="sider-trigger-icon" :class="{ 'is-collapsed': collapsed }">
                <icon-menu-fold />
              </span>
            </button>
          </div>
        </div>
      </a-layout-sider>

      <a-layout class="admin-main">
        <a-layout-content class="admin-content">
          <div v-if="!route.meta.hideBreadcrumb" class="content-head">
            <a-breadcrumb>
              <a-breadcrumb-item v-for="item in breadcrumbItems" :key="item">
                {{ item }}
              </a-breadcrumb-item>
            </a-breadcrumb>
          </div>

          <router-view />
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-layout>
</template>

<style scoped>
.admin-layout {
  --sider-surface: #f5f6f8;
  --sider-item-hover: #eceef2;
  --sider-item-active: #e6f0ff;
  --sider-item-text: #4e5969;
  --sider-item-icon: #86909c;
  --sider-item-active-text: #1664ff;
  height: 100vh;
  min-height: 0;
  padding-top: 48px;
  overflow: hidden;
  background: #ffffff;
}

.admin-header {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 48px;
  padding: 0 16px;
  background: #ffffff;
  box-shadow: 0 2px 10px rgba(29, 33, 41, 0.06);
}

.admin-body {
  height: calc(100vh - 48px);
  min-height: 0;
  overflow: hidden;
  background: #ffffff;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-left {
  min-width: 0;
  flex: 1;
}

.header-brand {
  display: flex;
  align-items: center;
}

.header-brand-copy {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.header-brand-copy strong {
  color: #101828;
  font-size: 15px;
  font-weight: 600;
}

.brand-mark-header {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: block;
  flex-shrink: 0;
}

.header-right {
  flex-shrink: 0;
}

.global-search {
  width: min(360px, 28vw);
}

.global-search :deep(.arco-input-wrapper) {
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  background: #f7f8fa;
  box-shadow: none;
}

.platform-select {
  width: 116px;
}

.platform-select :deep(.arco-select-view-single) {
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  background: #ffffff;
}

.header-icon-button {
  border: 0;
  background: #ffffff;
  box-shadow: none;
}

.header-right :deep(.arco-badge-number) {
  min-width: 14px;
  height: 14px;
  padding: 0 4px;
  border-radius: 999px;
  font-size: 10px;
  line-height: 14px;
}

.header-right :deep(.arco-badge) {
  line-height: 0;
}

.header-right :deep(.arco-badge .arco-badge-number) {
  top: 4px;
  right: 4px;
  transform: translate(50%, -50%);
}

.admin-sider {
  position: sticky;
  top: 48px;
  align-self: flex-start;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 48px);
  overflow: hidden;
  background: var(--sider-surface);
  border-right: 0 !important;
  box-shadow: none !important;
}

.admin-sider:deep(.arco-layout-sider-light) {
  border-right: 0;
  box-shadow: none;
}

.admin-sider :deep(.arco-layout-sider-children) {
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  background: var(--sider-surface);
}

.sider-body {
  display: grid;
  flex: 1;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  grid-template-rows: minmax(0, 1fr) auto;
}

.sider-scroll {
  min-height: 0;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 0 8px 10px 10px;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: rgba(29, 33, 41, 0.1) transparent;
}

.sider-scroll::-webkit-scrollbar {
  width: 2px;
}

.sider-scroll::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(29, 33, 41, 0.1);
}

.sider-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.sider-nav {
  padding: 6px 0 16px;
}

.sider-section + .sider-section {
  margin-top: 10px;
}

.sider-section-heading {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px 0 12px;
  border: 0;
  background: transparent;
  color: #86909c;
  font-size: 12px;
  line-height: 28px;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
  transform-origin: left center;
}

.sider-section-heading:hover,
.sider-section-heading.is-current {
  color: #4e5969;
}

.section-arrow {
  width: 0;
  height: 0;
  border-right: 4px solid transparent;
  border-left: 4px solid transparent;
  border-top: 5px solid #86909c;
}

.section-arrow:not(.is-open) {
  transform: rotate(-90deg);
}

.sider-section-items {
  display: grid;
  gap: 2px;
  margin-top: 4px;
}

.sider-page-item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  height: 36px;
  padding: 0 10px 0 12px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--sider-item-text);
  cursor: pointer;
  text-align: left;
  transform-origin: left center;
}

.sider-page-item-top {
  margin-bottom: 12px;
}

.sider-page-item:hover {
  background: var(--sider-item-hover);
}

.sider-page-item.is-active {
  background: var(--sider-item-active);
  color: var(--sider-item-active-text);
}

.sider-page-icon {
  display: flex;
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 8px;
  color: var(--sider-item-icon);
  transform: translateX(0);
}

.sider-page-item.is-active .sider-page-icon {
  color: var(--sider-item-active-text);
}

.sider-page-icon :deep(.arco-icon) {
  display: flex;
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.sider-page-label {
  min-width: 0;
  overflow: hidden;
  font-size: 13px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 1;
  transform: translateX(0);
}

.sider-footer {
  margin-top: auto;
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: flex-start;
  flex-shrink: 0;
  padding: 10px 10px 14px 12px;
  border-top: 1px solid #ebedf0;
  background: var(--sider-surface);
}

.admin-sider.arco-layout-sider-collapsed .sider-footer {
  padding-right: 10px;
  padding-left: 12px;
}

.admin-sider.arco-layout-sider-collapsed .sider-scroll {
  padding-right: 0;
  padding-left: 0;
  scrollbar-gutter: stable both-edges;
}

.admin-sider.arco-layout-sider-collapsed .sider-nav {
  padding-top: 6px;
}

.admin-sider.arco-layout-sider-collapsed .sider-section + .sider-section {
  margin-top: 4px;
}

.admin-sider.arco-layout-sider-collapsed .sider-section-heading {
  max-height: 0;
  margin: 0;
  padding-top: 0;
  padding-bottom: 0;
  opacity: 0;
  transform: translateX(-8px);
  pointer-events: none;
}

.admin-sider.arco-layout-sider-collapsed .sider-section-items {
  margin-top: 0;
}

.admin-sider.arco-layout-sider-collapsed .sider-page-item {
  width: 100%;
  justify-content: flex-start;
  gap: 0;
  margin: 0;
  padding: 0;
  background: transparent;
}

.admin-sider.arco-layout-sider-collapsed .sider-page-item-top {
  margin-bottom: 6px;
}

.admin-sider.arco-layout-sider-collapsed .sider-page-item:hover,
.admin-sider.arco-layout-sider-collapsed .sider-page-item.is-active {
  background: transparent;
}

.admin-sider.arco-layout-sider-collapsed .sider-page-icon {
  width: 36px;
  height: 36px;
  margin-right: auto;
  margin-left: auto;
  transform: translateX(0);
}

.admin-sider.arco-layout-sider-collapsed .sider-page-item:hover .sider-page-icon {
  background: var(--sider-item-hover);
}

.admin-sider.arco-layout-sider-collapsed .sider-page-item.is-active .sider-page-icon {
  background: var(--sider-item-active);
}

.admin-sider.arco-layout-sider-collapsed .sider-page-label {
  max-width: 0;
  margin: 0;
  opacity: 0;
  transform: translateX(-8px);
}

.sider-trigger {
  display: flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--sider-item-text);
  box-shadow: none;
  cursor: pointer;
}

.sider-trigger:hover {
  background: var(--sider-item-hover);
}

.sider-trigger-icon {
  display: flex;
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  transform: rotate(0deg);
}

.sider-trigger-icon.is-collapsed {
  transform: rotate(180deg);
}

.sider-trigger-icon :deep(.arco-icon) {
  display: flex;
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.admin-main {
  min-width: 0;
  height: calc(100vh - 48px);
  min-height: 0;
  overflow: hidden;
  background: #ffffff;
}

.user-entry {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  box-shadow: none;
  cursor: pointer;
}

.user-avatar {
  flex-shrink: 0;
  background: linear-gradient(135deg, #165dff, #00b42a);
}

.admin-content {
  height: 100%;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 0 32px 24px;
  background: #ffffff;
}

.content-head {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 36px;
  padding: 10px 0 8px;
}

.content-head :deep(.arco-breadcrumb-item) {
  color: #86909c;
  font-size: 12px;
}

.content-head :deep(.arco-breadcrumb-item:last-child) {
  color: #1d2129;
}

@media (max-width: 1024px) {
  .admin-header {
    padding: 0 18px;
  }

  .admin-content {
    padding: 0 18px 18px;
  }

  .platform-select,
  .user-meta {
    display: none;
  }

  .global-search {
    width: min(100%, 320px);
  }
}

@media (max-width: 768px) {
  .header-right {
    gap: 10px;
  }

  .content-head {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
