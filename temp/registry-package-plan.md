# Registry Package — Implementation Plan

> Created before a long context-window session. Resuming work should start here.

## Project context

- **Repo:** `C:\Users\dpereira\Documents\github\design` (Next.js 16 + React 19 monorepo, Turbo 2.9.18, npm workspaces).
- **Purpose:** Registry site for `deessejs.com` UI components at `ui.deessejs.com`. Components are local; adding one requires a deploy.
- **Stack:** Next.js 16 App Router (async `params`), shadcn/ui on **Base UI** (not Radix), Tailwind v4, npm (not pnpm).
- **Author preferences:** French-speaking, English deliverables, prefers concrete over abstract.

## Goal of this work

Move from mocked registry data to real React components stored in a dedicated workspace package, with the actual component source code shown on the detail pages. Long-term: components will live in a DB; this package becomes the seed/fallback.

## Decisions made

| Decision | Value | Notes |
|---|---|---|
| Package name | `@workspace/registry` | Lives at `packages/registry/` |
| Build | **Yes**, ESM + .d.ts | Cleaner seam for future DB swap |
| Source code extraction | `?raw` imports | Use relative path from `apps/web/lib/registry/sources.ts` |
| Versions | None | `0.0.0`, no semver |
| Tests | None | Visual + smoke only |
| Future state | DB-backed | `getComponent()` is the seam — API doesn't change |
| Path A vs B (component identity) | **Path A** for now | Registry = re-exported shadcn primitives, themed via tokens. Wrapper components per-component only if a specific need arises |

## Current state (files to know)

### Mock data (to replace)
- `apps/web/lib/mock-registry.ts` — hardcoded categories, items, blocks. Provides `getEnrichedComponentCategories`, `findComponentCategory`, `findComponentItem`, etc.
- Pages consume this from `apps/web/app/{components,blocks}/.../page.tsx`.

### Foundation packages (don't touch)
- `packages/ui/` — shadcn primitives. Exports configured via `package.json`:
  ```json
  "./components/*": "./src/components/*.tsx",
  "./lib/*": "./src/lib/*.ts",
  "./hooks/*": "./src/hooks/*.ts",
  "./globals.css": "./src/styles/globals.css"
  ```
- `packages/eslint-config/`, `packages/typescript-config/` — shared configs.

### App
- `apps/web/` consumes `@workspace/ui`, has the showcase site (header, footer, nav, cards, code-block, Tabs, Breadcrumb, Empty — all extracted to `apps/web/components/` and `packages/ui/src/components/`).

### Turbo
- `turbo.json` already has tasks: `build`, `lint`, `format`, `typecheck`, `dev`. Will need `outputs` extended for the new package.

## Target architecture

### Directory layout

```
packages/registry/
├── package.json              # name: @workspace/registry, type: module, exports
├── tsconfig.json             # base, references config
├── tsconfig.build.json       # emits to dist/ with .d.ts
└── src/
    ├── index.ts              # barrel re-exports
    ├── components/
    │   ├── button/
    │   │   ├── index.tsx     # re-export from @workspace/ui
    │   │   └── meta.ts       # ComponentMeta { id, name, description, category, variants }
    │   ├── input/
    │   │   ├── index.tsx
    │   │   └── meta.ts
    │   └── ...               # one folder per component
    └── blocks/
        ├── hero-with-pricing/
        │   ├── index.tsx
        │   └── meta.ts
        └── ...               # one folder per block
```

### Types

```ts
// apps/web/lib/registry/types.ts
export type ComponentMeta = {
  id: string
  name: string
  description: string
  category: ComponentCategoryId
  variants?: string[]
}

export type BlockMeta = {
  id: string
  name: string
  description: string
  category: BlockCategoryId
}

// ComponentCategoryId and BlockCategoryId are string literal unions
// (e.g. "buttons" | "forms" | ...). Enumerate from the mock.
```

### Registry entry in app

```ts
// apps/web/lib/registry/index.ts (replaces mock-registry.ts)
import { Button } from "@workspace/registry/components/button"
import { meta as buttonMeta } from "@workspace/registry/components/button/meta"
import buttonSource from "../../../../packages/registry/src/components/button/index.tsx?raw"

export const COMPONENT_REGISTRY = [
  { ...buttonMeta, Component: Button, source: buttonSource },
  // ...
]

// Same helpers as before: getEnrichedComponentCategories,
// findComponentCategory, findComponentItem, etc.
// These don't change shape — pages don't need to be edited
// (except to swap the import path).
```

### Future DB seam

```ts
// Phase 1: reads from registry
export async function getComponent(categoryId: string, componentId: string) {
  return REGISTRY.find(...)
}

// Phase 2: DB first, registry fallback
export async function getComponent(categoryId: string, componentId: string) {
  const fromDb = await db.query...
  if (fromDb) return fromDb
  return REGISTRY.find(...)  // fallback
}
```

Pages don't change between phases.

## Step-by-step plan

### Step 1 — Create `packages/registry/` skeleton

Files to create:
1. `packages/registry/package.json` — name, type, exports, scripts (`build`, `dev`, `lint`, `typecheck`), dependency on `@workspace/ui`.
2. `packages/registry/tsconfig.json` — extends `@workspace/typescript-config/react-library`.
3. `packages/registry/tsconfig.build.json` — emits to `dist/` with declarations.
4. `packages/registry/src/index.ts` — placeholder barrel.

### Step 2 — Update `turbo.json`

Add `outputs: ["dist/**"]` to the `build` task so Turbo caches the registry package's build.

### Step 3 — Add the package to workspace

`package.json` at root already has workspaces `apps/*` and `packages/*`. No change needed.

### Step 4 — Define types

Create `apps/web/lib/registry/types.ts` with `ComponentMeta`, `BlockMeta`, category ID unions.

### Step 5 — Create source extractor

Create `apps/web/lib/registry/sources.ts` with `?raw` imports for each component/block.

### Step 6 — Create registry aggregator

Create `apps/web/lib/registry/index.ts` — assemble all entries with `Component`, `source`, meta. Re-implement helpers from `mock-registry.ts` (`getEnrichedComponentCategories`, `findComponentCategory`, `findComponentItem`, etc.).

### Step 7 — Migrate one component (Button) as proof

1. `packages/registry/src/components/button/index.tsx` — `export { Button } from "@workspace/ui/components/button"`
2. `packages/registry/src/components/button/meta.ts` — meta object
3. Add to `apps/web/lib/registry/sources.ts`
4. Add to `apps/web/lib/registry/index.ts`
5. Typecheck

### Step 8 — Update pages to use new registry

In each page file in `apps/web/app/{components,blocks}/...`, change:
```ts
import { ... } from "@/lib/mock-registry"
// to
import { ... } from "@/lib/registry"
```

Then delete `apps/web/lib/mock-registry.ts`.

### Step 9 — Migrate remaining components and blocks

Same pattern as Button. List of components to migrate:

**Components (28 total):**
- buttons: button (done), icon-button, link-button, split-button, toggle-button
- forms: input, textarea, select, checkbox, radio-group, switch, combobox, slider
- layout: card, separator, aspect-ratio, resizable, scroll-area, accordion
- navigation: tabs, breadcrumb, pagination, navigation-menu
- feedback: alert, toast, progress
- overlay: dialog, sheet

**Blocks (19 total):**
- marketing: hero-with-pricing, feature-grid, testimonial-section, cta-banner
- application: settings-panel, dashboard-shell, data-table, kanban-board, filter-bar
- auth: login-form, signup-form, password-recovery
- onboarding: empty-state, welcome-screen
- e-commerce: product-card, cart-drawer, checkout-form
- documentation: doc-page, code-block

Note: not all of these exist in shadcn yet. For ones that don't, either:
- Skip them (don't list in registry until shadcn has them)
- Add a `// TODO: implement` stub component

### Step 10 — Visual smoke test

Build the registry package, build the app, render a few detail pages, verify:
- Component preview shows the real rendered component
- Code tab shows the actual source code with syntax highlighting
- Light/dark switch works
- All categories show correctly in the nav

## Open questions (not blocking)

1. **DB connection details** — when ready, what ORM? Where does the DB live? (out of scope for now)
2. **Variant source of truth** — hardcoded in `meta.ts` (current plan), or stories files? Start with hardcoded; add stories only if pain shows up.
3. **Page d'accueil (`/`)** — currently template default. Decide later what goes there.
4. **Multi-version support** — not needed; one canonical version per component.
5. **i18n** — not in scope.

## Conventions to maintain

- Server components by default. `"use client"` only when interactivity demands it.
- `cn()` helper for conditional class composition.
- Semantic tokens (`bg-muted`, `text-muted-foreground`, `border-border/60`). No raw palette utilities.
- `flex` + `gap-*`, never `space-x-*` / `space-y-*`.
- `font-mono text-xs` for technical labels.
- No `dark:` variants (tokens handle both modes).
- Typecheck must stay green at every step.

## Resuming checklist

When picking this up again:
1. Re-read this file.
2. Verify `packages/registry/` skeleton still exists (steps 1-2 done?).
3. Check `apps/web/lib/registry/` for current state.
4. Check pages for `@/lib/mock-registry` vs `@/lib/registry` imports.
5. Run `npx tsc --noEmit` in `apps/web` to confirm baseline.
6. Continue from the first incomplete step.