# 商品管理 V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a frontend-only product management v1 with a product list page, product detail/edit page, mock catalog state, SKU uniqueness checks, and platform-store mapping maintenance.

**Architecture:** Keep product business rules in a shared catalog module with typed mock data and pure helpers for filtering, saving, and mapping lookup. Build the list and detail pages on top of that module while matching the existing inventory-management visual language.

**Tech Stack:** Vue 3, TypeScript, Vue Router, Arco Design Vue, Vitest

---

### Task 1: Product catalog test skeleton

**Files:**
- Create: `tests/productCatalog.test.ts`
- Modify: `package.json`

- [ ] Write failing tests for product filtering, SKU uniqueness, and mapping lookup
- [ ] Run the targeted test command and confirm failure

### Task 2: Shared product catalog module

**Files:**
- Create: `src/data/productCatalog.ts`

- [ ] Implement product types, mock seed data, option constants, and pure helpers
- [ ] Add a lightweight singleton state wrapper for list/detail page sharing
- [ ] Re-run the targeted tests until green

### Task 3: Product list page

**Files:**
- Create: `src/views/ProductListView.vue`

- [ ] Implement inventory-style summary, filters, and table
- [ ] Wire list actions into create/edit routes
- [ ] Use shared catalog helpers for filtering and row display

### Task 4: Product detail page

**Files:**
- Create: `src/views/ProductDetailView.vue`
- Create: `src/components/products/ProductSectionCard.vue`

- [ ] Build the five detail sections
- [ ] Implement create/edit shared behavior and SKU uniqueness validation
- [ ] Support dynamic platform mapping rows with add/remove actions

### Task 5: Router integration and cleanup

**Files:**
- Modify: `src/router/index.ts`

- [ ] Point `products/core-library` to the new list page
- [ ] Add create/edit routes
- [ ] Keep existing placeholder routing behavior intact

### Task 6: Verification

**Files:**
- Modify: `package.json`

- [ ] Run the focused tests
- [ ] Run the production build
- [ ] Fix any regressions found during verification
