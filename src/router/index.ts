import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'
import PlaceholderView from '../views/PlaceholderView.vue'
import DashboardView from '../views/DashboardView.vue'
import WarehouseInventoryView from '../views/WarehouseInventoryView.vue'
import BatchInventoryView from '../views/BatchInventoryView.vue'
import ProductListView from '../views/ProductListView.vue'
import ProductDetailView from '../views/ProductDetailView.vue'
import ProductBrandView from '../views/ProductBrandView.vue'
import ProductCategoryView from '../views/ProductCategoryView.vue'
import PurchaseOrderView from '../views/PurchaseOrderView.vue'
import PurchaseDeliveryView from '../views/PurchaseDeliveryView.vue'
import PurchaseReturnView from '../views/PurchaseReturnView.vue'
import PurchaseChangeLogView from '../views/PurchaseChangeLogView.vue'
import SalesOrderView from '../views/SalesOrderView.vue'
import SalesSecondaryView from '../views/SalesSecondaryView.vue'
import SalesReturnView from '../views/SalesReturnView.vue'
import StoreManagementHomeView from '../views/StoreManagementHomeView.vue'
import StoreDetailView from '../views/StoreDetailView.vue'
import FirstMileQuoteView from '../views/FirstMileQuoteView.vue'
import { flattenNavigation } from '../data/navigation'

const placeholderRoutes = flattenNavigation()
  .filter((item) =>
    item.path !== '/products/core-library'
    && item.path !== '/products/brands'
    && item.path !== '/products/categories'
    && item.path !== '/warehouse/inventory'
    && item.path !== '/warehouse/warehouse-inventory'
    && item.path !== '/warehouse/batch-inventory'
    && item.path !== '/purchase/orders'
    && item.path !== '/purchase/delivery-orders'
    && item.path !== '/purchase/return-orders'
    && item.path !== '/purchase/change-logs'
    && item.path !== '/sales/orders'
    && item.path !== '/sales/upsell'
    && item.path !== '/sales/return'
    && item.path !== '/stores/list'
    && item.path !== '/services/first-mile'
  )
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
          component: ProductListView,
          meta: {
            title: '商品列表',
            sectionKey: 'products',
            sectionTitle: '商品管理',
            hideBreadcrumb: true,
          },
        },
        {
          path: 'products/core-library/create',
          component: ProductDetailView,
          meta: {
            title: '新建商品',
            sectionKey: 'products',
            sectionTitle: '商品管理',
            hideBreadcrumb: true,
          },
        },
        {
          path: 'products/core-library/:sku/edit',
          component: ProductDetailView,
          meta: {
            title: '商品详情',
            sectionKey: 'products',
            sectionTitle: '商品管理',
            hideBreadcrumb: true,
          },
        },
        {
          path: 'products/brands',
          component: ProductBrandView,
          meta: {
            title: '品牌资料',
            sectionKey: 'products',
            sectionTitle: '商品管理',
            hideBreadcrumb: true,
          },
        },
        {
          path: 'products/categories',
          component: ProductCategoryView,
          meta: {
            title: '品类资料',
            sectionKey: 'products',
            sectionTitle: '商品管理',
            hideBreadcrumb: true,
          },
        },
        {
          path: 'warehouse/inventory',
          component: WarehouseInventoryView,
          meta: {
            title: '产品库存',
            inventoryTab: 'product',
            sectionKey: 'warehouse',
            sectionTitle: '仓储库存',
            hideBreadcrumb: true,
          },
        },
        {
          path: 'warehouse/warehouse-inventory',
          component: WarehouseInventoryView,
          meta: {
            title: '仓库库存',
            inventoryTab: 'warehouse',
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
        {
          path: 'purchase/orders',
          component: PurchaseOrderView,
          meta: {
            title: '采购订单',
            sectionKey: 'purchase',
            sectionTitle: '采购管理',
            hideBreadcrumb: true,
          },
        },
        {
          path: 'purchase/delivery-orders',
          component: PurchaseDeliveryView,
          meta: {
            title: '交货单',
            sectionKey: 'purchase',
            sectionTitle: '采购管理',
            hideBreadcrumb: true,
          },
        },
        {
          path: 'purchase/return-orders',
          component: PurchaseReturnView,
          meta: {
            title: '采购退货单',
            sectionKey: 'purchase',
            sectionTitle: '采购管理',
            hideBreadcrumb: true,
          },
        },
        {
          path: 'purchase/change-logs',
          component: PurchaseChangeLogView,
          meta: {
            title: '采购变更日志',
            sectionKey: 'purchase',
            sectionTitle: '采购管理',
            hideBreadcrumb: true,
          },
        },
        {
          path: 'sales/orders',
          component: SalesOrderView,
          meta: {
            title: '销售订单',
            sectionKey: 'sales',
            sectionTitle: '销售管理',
            hideBreadcrumb: true,
          },
        },
        {
          path: 'sales/upsell',
          component: SalesSecondaryView,
          meta: {
            title: '二次销售',
            sectionKey: 'sales',
            sectionTitle: '销售管理',
            hideBreadcrumb: true,
          },
        },
        {
          path: 'sales/return',
          component: SalesReturnView,
          meta: {
            title: '退货管理',
            sectionKey: 'sales',
            sectionTitle: '销售管理',
            hideBreadcrumb: true,
          },
        },
        {
          path: 'stores/list',
          component: StoreManagementHomeView,
          meta: {
            title: '店铺列表',
            sectionKey: 'stores',
            sectionTitle: '店铺管理',
            hideBreadcrumb: true,
          },
        },
        {
          path: 'stores/add',
          component: PlaceholderView,
          meta: {
            title: '新增店铺',
            sectionKey: 'stores',
            sectionTitle: '店铺管理',
            hideBreadcrumb: true,
          },
        },
        {
          path: 'stores/:storeId',
          component: StoreDetailView,
          meta: {
            title: '店铺详情',
            sectionKey: 'stores',
            sectionTitle: '店铺管理',
            hideBreadcrumb: true,
          },
        },
        {
          path: 'stores/:storeId/settings',
          component: PlaceholderView,
          meta: {
            title: '平台配置',
            sectionKey: 'stores',
            sectionTitle: '店铺管理',
            hideBreadcrumb: true,
          },
        },
        {
          path: 'stores/:storeId/authorize',
          component: PlaceholderView,
          meta: {
            title: '重新授权',
            sectionKey: 'stores',
            sectionTitle: '店铺管理',
            hideBreadcrumb: true,
          },
        },
        {
          path: 'stores/:storeId/sync',
          component: PlaceholderView,
          meta: {
            title: '同步策略',
            sectionKey: 'stores',
            sectionTitle: '店铺管理',
            hideBreadcrumb: true,
          },
        },
        {
          path: 'services/first-mile',
          component: FirstMileQuoteView,
          meta: {
            title: '物流智能询价',
            sectionKey: 'logistics',
            sectionTitle: '物流管理',
            hideBreadcrumb: true,
          },
        },
        ...placeholderRoutes,
      ],
    },
  ],
})

export default router
