import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'
import PlaceholderView from '../views/PlaceholderView.vue'
import DashboardView from '../views/DashboardView.vue'
import QueryTableView from '../views/QueryTableView.vue'
import WarehouseInventoryView from '../views/WarehouseInventoryView.vue'
import BatchInventoryView from '../views/BatchInventoryView.vue'
import { flattenNavigation } from '../data/navigation'

const placeholderRoutes = flattenNavigation()
  .filter((item) => item.path !== '/products/core-library' && item.path !== '/warehouse/inventory' && item.path !== '/warehouse/batch-inventory')
  .map((item) => ({
    path: item.path,
    component: PlaceholderView,
    meta: {
      title: item.title,
      sectionKey: item.sectionKey,
      sectionTitle: item.sectionTitle,
    },
  }))

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: AdminLayout,
      redirect: '/products/core-library',
      children: [
        {
          path: 'dashboard',
          component: DashboardView,
          meta: {
            title: '运营看板',
            sectionKey: 'dashboard',
            sectionTitle: '运营看板',
          },
        },
        {
          path: 'products/core-library',
          component: QueryTableView,
          meta: {
            title: '核心产品库',
            sectionKey: 'products',
            sectionTitle: '商品管理',
          },
        },
        {
          path: 'warehouse/inventory',
          component: WarehouseInventoryView,
          meta: {
            title: '库存管理',
            sectionKey: 'warehouse',
            sectionTitle: '仓储库存',
            hideBreadcrumb: true,
          },
        },
        {
          path: 'warehouse/batch-inventory',
          alias: '/warehouse/batch',
          component: BatchInventoryView,
          meta: {
            title: '批次库存',
            sectionKey: 'warehouse',
            sectionTitle: '仓储库存',
            hideBreadcrumb: true,
          },
        },
        ...placeholderRoutes,
      ],
    },
  ],
})

export default router
