# AGENTS.md

## Project Overview

This project is a Vue 3 + TypeScript + Vite ERP admin prototype for cross-border commerce workflows. It uses Arco Design Vue with the `@arco-themes/vue-kjerp` theme, Vue Router, and Vitest.

The app is mostly frontend-only: domain data lives in `src/data`, business workbenches live in `src/components`, and route views in `src/views` are intentionally thin.

## Commands

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Run tests: `npm run test`
- Build: `npm run build`
- Preview production build: `npm run preview`

Vite defaults to `http://localhost:5173/`. If that port is occupied, it will automatically use the next available port.

## Important Directories

- `src/main.ts`: app bootstrap. Registers Arco Vue, theme CSS, global CSS, and router.
- `src/App.vue`: root router outlet only.
- `src/router/index.ts`: route definitions and placeholder route generation.
- `src/data/navigation.ts`: sidebar navigation tree. Keep this in sync with implemented routes.
- `src/layouts/AdminLayout.vue`: fixed top header, sidebar, content shell, responsive sidebar behavior.
- `src/views`: route-level components. Prefer keeping these as wrappers that pass a `pageKey` or route context into a workbench component.
- `src/components/common`: shared UI primitives, especially filters, page headers, configurable tables, metrics, and column settings.
- `src/components/products`, `src/components/purchase`, `src/components/sales`, `src/components/warehouse`, `src/components/stores`: domain workbench components and domain CSS.
- `src/data`: mock records, page configs, type definitions, filters, pagination helpers, and pure table/data utilities.
- `tests`: Vitest tests. Many tests assert source structure and exact snippets, not only runtime behavior.
- `docs/superpowers`: existing product/design specs and implementation plans from prior work.

## Architecture Conventions

- Use Vue SFCs with `<script setup lang="ts">`, Composition API, and typed props/emits.
- Keep route views thin. Put reusable page logic in workbench components, and reusable data/filter logic in `src/data`.
- Prefer config-driven workbenches when pages share structure. Examples: `ProductMetadataWorkbench.vue` uses `ProductMetadataPageKey`; `PurchaseWorkbench.vue` uses `PurchasePageKey`.
- Keep domain rows, page configs, option lists, and filter helpers in `src/data/*.ts`.
- Use type-only imports for TypeScript types where possible.
- Existing style uses no semicolons, single quotes, and two-space indentation. Match nearby code.
- Avoid introducing new dependencies unless the task clearly requires it.

## Routing And Navigation

When adding a real page:

- Add a route in `src/router/index.ts`.
- Add or update the sidebar item in `src/data/navigation.ts`.
- Exclude implemented paths from `placeholderRoutes` in `src/router/index.ts`.
- Set route metadata consistently: `title`, `sectionKey`, `sectionTitle`, and usually `hideBreadcrumb: true`.

Placeholder pages are generated from navigation items that are not explicitly implemented.

## Shared Components To Prefer

- Tables needing configurable columns, resize/reorder, freeze columns, custom footer, or row selection should use `src/components/common/ConfigurableDataTable.vue`.
- Simpler tables may use `src/components/common/AppDataTable.vue`.
- Filters should use `QueryFilterPanel.vue`, `QueryFilterItem.vue`, and `QueryActionBar.vue`.
- Summary metrics should use `MetricSummaryStrip.vue` when a compact metric strip is required.
- Secondary/detail headers should use `SecondaryPageHeader.vue` where appropriate.
- Column visibility/settings should go through `ColumnSettingsModal.vue` and the helpers in `src/data/columnSettings.ts`.

Be especially careful with `ConfigurableDataTable.vue`: column resize, reorder, hover guides, frozen columns, and source tests are tightly coupled.

## UI And Styling

- The visual language is a compact Chinese ERP admin UI using Arco components, neutral surfaces, blue primary actions, and restrained spacing.
- Prefer Arco components over custom primitives for Modal, Drawer, Upload, Select, Table, Form, Button, Switch, and Pagination.
- For upload flows, use Arco `Upload`; do not create hidden file input workarounds unless there is a strong reason.
- Most new modal dialogs should default to `width="600px"`, `simple`, `align-center`, `title-align="start"`, and right-aligned footer actions unless the design says otherwise.
- Use CSS variables already established in each domain, such as `--workspace-*`, `--metadata-*`, and Arco tokens like `var(--color-border-2)` or `rgb(var(--primary-6))`.
- Keep responsive rules aligned with existing patterns: usually 3 columns on desktop, 2 columns below `1199px`, and 1 column below `767px` or `768px`.
- Do not add summary header strips to every new page by default. Several metadata pages intentionally omit metric headers.
- Preserve existing design systems and page patterns before inventing new visual treatments.

## Testing Notes

- Tests are Vitest-based and often inspect source files with `readFileSync`.
- When intentionally changing structure, class names, route names, modal props, or wording, update the related source tests in `tests`.
- Run `npm run test` after meaningful changes.
- Run `npm run build` before claiming a larger UI or TypeScript change is complete.
- For table interaction changes, also check tests around `configurableTable`, `tableInteractionHelpers`, and `configurableTableStyles`.

## Domain Notes

- Product list and detail data lives in `src/data/productCatalog.ts`.
- Product detail is a larger page in `src/views/ProductDetailView.vue`; reuse its helper components such as `ProductDetailInfoGrid.vue` and `ProductSectionCard.vue` rather than duplicating patterns.
- Brand and category metadata pages share `ProductMetadataWorkbench.vue` and `src/data/productMetadata.ts`.
- Purchase pages share `PurchaseWorkbench.vue` and `src/data/purchase.ts`.
- Sales pages share styles in `src/components/sales/salesWorkbench.css`.
- Store and warehouse features follow the same pattern: data in `src/data`, domain workbench in `src/components/<domain>`, thin route views in `src/views`.

## Agent Workflow

- Inspect existing code and tests before editing. This codebase has many source-level expectations.
- Make small, targeted patches. Avoid broad refactors unless explicitly requested.
- Do not revert or overwrite unrelated work.
- If a change affects UI behavior, verify in the local browser after tests when practical.
- If a requested design references an existing page pattern, search for and reuse that implementation before recreating it.
- Keep final responses concise: summarize what changed, mention tests/builds run, and call out anything not verified.

