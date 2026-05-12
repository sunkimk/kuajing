import type { Component } from 'vue'
import {
  IconApps,
  IconBarChart,
  IconBook,
  IconBulb,
  IconCalendarClock,
  IconCommon,
  IconCustomerService,
  IconHome,
  IconDashboard,
  IconNotification,
  IconSettings,
  IconStorage,
  IconThunderbolt,
  IconUserGroup,
} from '@arco-design/web-vue/es/icon'

export interface NavChildItem {
  key: string
  title: string
  path: string
  icon: Component
}

export interface NavSectionItem {
  key: string
  title: string
  path?: string
  icon?: Component
  children?: NavChildItem[]
}

export const navigationSections: NavSectionItem[] = [
  {
    key: 'dashboard',
    title: '运营看板',
    path: '/dashboard',
    icon: IconHome,
  },
  {
    key: 'products',
    title: '商品管理',
    children: [
      { key: 'product-list', title: '商品列表', path: '/products/core-library', icon: IconApps },
      { key: 'product-brands', title: '品牌资料', path: '/products/brands', icon: IconBook },
      { key: 'product-categories', title: '品类资料', path: '/products/categories', icon: IconCommon },
    ],
  },
  {
    key: 'purchase',
    title: '采购管理',
    children: [
      { key: 'purchase-orders', title: '采购订单', path: '/purchase/orders', icon: IconCalendarClock },
      { key: 'purchase-delivery-orders', title: '交货单', path: '/purchase/delivery-orders', icon: IconNotification },
      { key: 'purchase-return-orders', title: '采购退货单', path: '/purchase/return-orders', icon: IconCommon },
      { key: 'purchase-change-logs', title: '采购变更日志', path: '/purchase/change-logs', icon: IconBook },
    ],
  },
  {
    key: 'stores',
    title: '店铺管理',
    children: [
      { key: 'store-list', title: '店铺列表', path: '/stores/list', icon: IconDashboard },
      { key: 'store-inventory', title: '店铺库存', path: '/stores/inventory', icon: IconStorage },
      { key: 'profit-analysis', title: '利润核算', path: '/stores/profit-analysis', icon: IconBarChart },
      { key: 'ads', title: '广告推广', path: '/stores/ads', icon: IconNotification },
      { key: 'ads-overview', title: '广告概述', path: '/stores/ads-overview', icon: IconApps },
      { key: 'wildberries-ads', title: 'Wildberries 广告', path: '/stores/wildberries-ads', icon: IconCommon },
      { key: 'automation-tools', title: '自动化工具', path: '/stores/automation-tools', icon: IconThunderbolt },
      { key: 'insights', title: '分析工具', path: '/stores/insights', icon: IconBulb },
    ],
  },
  {
    key: 'winning-products',
    title: '爆品管理',
    children: [
      { key: 'winning-list', title: '爆品列表', path: '/winning-products/list', icon: IconThunderbolt },
      { key: 'sales-funnel', title: '销售漏斗', path: '/winning-products/sales-funnel', icon: IconBarChart },
      { key: 'product-instances', title: '商品实例', path: '/winning-products/instances', icon: IconApps },
      { key: 'winning-analysis', title: '爆品分析', path: '/winning-products/analysis', icon: IconDashboard },
    ],
  },
  {
    key: 'sales',
    title: '销售管理',
    children: [
      { key: 'sales-orders', title: '销售订单', path: '/sales/orders', icon: IconBook },
      { key: 'upsell', title: '二次销售', path: '/sales/upsell', icon: IconCustomerService },
      { key: 'sales-return', title: '退货管理', path: '/sales/return', icon: IconNotification },
    ],
  },
  {
    key: 'warehouse',
    title: '仓储库存',
    children: [
      { key: 'inventory', title: '产品库存', path: '/warehouse/inventory', icon: IconStorage },
      { key: 'warehouse-inventory', title: '仓库库存', path: '/warehouse/warehouse-inventory', icon: IconStorage },
      { key: 'batch-inventory', title: '批次库存', path: '/warehouse/batch-inventory', icon: IconDashboard },
      { key: 'stock-in', title: '入库管理', path: '/warehouse/stock-in', icon: IconCalendarClock },
      { key: 'stock-out', title: '出库管理', path: '/warehouse/stock-out', icon: IconNotification },
    ],
  },
  {
    key: 'logistics',
    title: '物流管理',
    children: [
      { key: 'shipping', title: '头程发货', path: '/logistics/shipping', icon: IconNotification },
      { key: 'first-mile', title: '物流智能询价', path: '/services/first-mile', icon: IconNotification },
      { key: 'orders', title: '物流订单', path: '/logistics/orders', icon: IconBook },
      { key: 'tracking', title: '物流追踪', path: '/logistics/tracking', icon: IconCommon },
    ],
  },
  {
    key: 'digital-manager',
    title: '数字店长',
    children: [
      { key: 'market-analysis', title: '市场分析', path: '/digital-manager/market-analysis', icon: IconBarChart },
      { key: 'tools', title: '自动化工具', path: '/digital-manager/tools', icon: IconBulb },
    ],
  },
  {
    key: 'suppliers',
    title: '供应商管理',
    children: [
      { key: 'purchase-suppliers', title: '采购供应商', path: '/suppliers/purchase', icon: IconUserGroup },
      { key: 'logistics-suppliers', title: '头程物流供应商', path: '/suppliers/logistics', icon: IconNotification },
      { key: 'overseas-warehouse-suppliers', title: '海外仓供应商', path: '/suppliers/warehouse', icon: IconStorage },
      { key: 'tax-suppliers', title: '财税供应商', path: '/suppliers/tax', icon: IconCommon },
    ],
  },
  {
    key: 'services',
    title: '外部服务商',
    children: [
      { key: 'warehouse-service', title: '海外仓', path: '/services/warehouse', icon: IconStorage },
      { key: 'delivery-service', title: '送仓服务', path: '/services/delivery', icon: IconCalendarClock },
      { key: 'tax-service', title: '财税服务', path: '/services/tax', icon: IconCommon },
      { key: 'registration', title: '企业注册', path: '/services/registration', icon: IconApps },
      { key: 'exchange-rate', title: '汇率资讯', path: '/services/exchange-rate', icon: IconBarChart },
      { key: 'review-service', title: '测评服务', path: '/services/review-service', icon: IconCustomerService },
      { key: 'finance-service', title: '融资服务', path: '/services/finance-service', icon: IconDashboard },
    ],
  },
  {
    key: 'platform',
    title: '平台相关',
    children: [
      { key: 'platform-commission', title: '平台佣金', path: '/platform/commission', icon: IconBarChart },
      { key: 'market-report', title: '市场分析报告', path: '/platform/market-report', icon: IconBook },
      { key: 'profit-calculator', title: '利润测算', path: '/platform/profit-calculator', icon: IconDashboard },
      { key: 'news', title: '新闻资讯', path: '/platform/news', icon: IconNotification },
    ],
  },
  {
    key: 'service',
    title: '客服评价',
    children: [
      { key: 'customer-service', title: '客服管理', path: '/service/customer-service', icon: IconCustomerService },
      { key: 'reviews', title: '评价管理', path: '/service/reviews', icon: IconBook },
    ],
  },
  {
    key: 'settings',
    title: '系统设置',
    children: [
      { key: 'users', title: '用户管理', path: '/settings/users', icon: IconUserGroup },
      { key: 'roles', title: '角色管理', path: '/settings/roles', icon: IconCommon },
      { key: 'permissions', title: '权限管理', path: '/settings/permissions', icon: IconSettings },
      { key: 'entities', title: '主体管理', path: '/settings/entities', icon: IconApps },
    ],
  },
]

export const flattenNavigation = () =>
  navigationSections.flatMap((section) =>
    section.children?.map((child) => ({ ...child, sectionKey: section.key, sectionTitle: section.title })) ?? []
  )

export const findSectionByPath = (path: string) =>
  navigationSections.find((section) => section.path === path || section.children?.some((child) => child.path === path))
