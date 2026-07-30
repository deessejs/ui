---
name: add-block
description: Add a new block to the @deessejs/ui registry — file scaffolding, registry wiring, codegen, deploy. Parallel to add-component but for ds-block-* items (registry:block type, multi-file capable, composes other ds-* items).
---

Add a new block to the registry at ui.deessejs.com. Walks through the five-surface pattern: showcase tree, consumer tree, registry.json entry (with `registryDependencies`), audit drift entry, aggregator wire-up.

## When to use

- User asks to add a new block to the registry
- User asks to compose existing ds-* items into a reusable piece
- After defining a composition pattern that's worth shipping (login form, pricing card, settings panel, etc.)

For a single-file component (button, input, badge), use the **add-component** skill instead. Blocks differ from components in three ways:

1. **Type `registry:block`** in `registry.json` (not `registry:ui`)
2. **`registryDependencies[]`** declares refs to other ds-* items (not just npm deps)
3. **BlockEntry requires a `Demo` export** so the showcase preview tab renders a realistic example instead of the no-props default

## Workflow

### 1. Create the showcase tree

```
packages/registry/src/blocks/<id>/
├── index.tsx     ← Block implementation + BlockDemo export
└── meta.ts       ← BlockMeta
```

**`index.tsx`** — block implementation with all-props optional + sensible defaults, plus a separate `BlockDemo` export that wraps it with realistic props:

```tsx
"use client"

import * as React from "react"

import { ... } from "@workspace/ui/components/<base>"
import { ... } from "@workspace/registry/components/<composed-ds-X>"

export interface BlockProps {
  title?: string
  description?: string
  // ... block-specific props, all optional
  className?: string
}

export function Block({ title = "Default title", ... }: BlockProps) {
  // composes the ds-* items
}

export function BlockDemo() {
  return <Block title="Realistic title" description="..." />
}
```

The `BlockDemo` export renders in the showcase preview tab and in the category list. Keep it stateless — no hooks needing providers (React Query, theme).

**`meta.ts`** — metadata for registry indexing:

```ts
import type { BlockMeta } from "../../types.ts"

export const meta: BlockMeta = {
  id: "<id>",
  name: "Block",
  description: "Composable block that bundles ds-X + ds-Y.",
  category: "onboarding",  // one of BLOCK_CATEGORIES in packages/registry/src/types.ts
}
```

`BLOCK_CATEGORIES = ["marketing", "application", "auth", "onboarding", "e-commerce", "documentation"] as const`.

### 2. Create the consumer tree

```
registry/base-nova/ds-block-<id>/
└── ds-block-<id>.tsx     ← single file (v1) or multi-file with target placeholders
```

**Hand-curated, no `@workspace/*` imports.** Uses `@/components/ui/ds-<composed>` for composed items (per `registry/CONTRIBUTING.md`).

Multi-file blocks (e.g. login form with separate `use-login-form.ts` hook + `submit-button.tsx` sub-component) cohabit in the same folder. Each file has its own entry in `files[]` with its own `target`:

```json
"files": [
  { "path": "registry/base-nova/ds-block-login-form/login-form.tsx", "type": "registry:component", "target": "@/components/login-form.tsx" },
  { "path": "registry/base-nova/ds-block-login-form/submit-button.tsx", "type": "registry:component", "target": "@/components/login/submit-button.tsx" },
  { "path": "registry/base-nova/ds-block-login-form/use-login-form.ts", "type": "registry:hook", "target": "@/hooks/use-login-form.ts" }
]
```

### 3. Add the registry.json entry

```json
{
  "name": "ds-block-<id>",
  "type": "registry:block",
  "title": "Block Title",
  "description": "One sentence.",
  "dependencies": ["clsx", "tailwind-merge"],
  "registryDependencies": ["ds-empty", "ds-button", "ds-colored-badge"],
  "files": [
    {
      "path": "registry/base-nova/ds-block-<id>/ds-block-<id>.tsx",
      "type": "registry:component",
      "target": "@/components/<id>.tsx"
    }
  ]
}
```

- `type: "registry:block"` is required — shadcn CLI dispatches different installer behavior for multi-file items
- `registryDependencies[]` declares refs to other registry items; the CLI installs them alongside
- `dependencies[]` is for npm packages only, per-item curated
- `target` uses `@/components/<id>.tsx` (NOT `@ui/<id>.tsx`) — blocks live in `components/`, not `components/ui/`

### 4. Add the audit drift entry

`docs/registry/audit-2026-07-29.json` — minimum fields:

```json
"ds-block-<id>": {
  "showcase-category": "block",
  "consumer-path": "registry/base-nova/ds-block-<id>/ds-block-<id>.tsx",
  "showcase-path": "packages/registry/src/blocks/<id>/index.tsx",
  "workspace-source-path": null,
  "drift-axes": ["showcase-vs-consumer-composition"],
  "behavioral-divergence-risk": "low",
  "current-state": "block-composes-ds-X-class-strings-identical-by-construction",
  "per-check": {
    "class-strings-showcase-vs-consumer": "strict-pass",
    "export-name-showcase-vs-consumer": "strict-pass",
    "composed-imports-showcase-vs-consumer": "strict-pass"
  },
  "allowed-divergences": {
    "import-path-showcase-vs-consumer": {
      "showcase": "@workspace/ui/components/<X> + @workspace/registry/components/<Y>",
      "consumer": "@/components/ui/ds-X + @/components/ui/ds-Y + @/lib/utils"
    }
  }
}
```

### 5. Wire the aggregator

`apps/web/lib/registry/index.tsx`:

```tsx
import { Block, BlockDemo } from "@workspace/registry/blocks/<id>"
import { meta as blockMeta } from "@workspace/registry/blocks/<id>/meta"

const BLOCK_REGISTRY: BlockEntry[] = [
  {
    ...blockMeta,
    Block,
    Demo: BlockDemo,        // ← required for blocks; absent for v1 of registry, added in 7f55aee
    source: SOURCES.blocks["<id>"],
  },
]
```

`deriveBlockPreview` renders `<Demo />` (not `<Block />`). Without `Demo`, the preview tab shows the no-props default rendering of the block, which is usually a placeholder.

Also update the two block pages that render blocks directly (they MUST use `<item.Demo />`, not `<item.Block />`):

- `apps/web/app/blocks/[category_id]/page.tsx` — ItemCard preview slot
- `apps/web/app/blocks/[category_id]/[block_id]/page.tsx` — Preview tab inside the `<Tabs>`

The components equivalent (`apps/web/app/components/[category_id]/page.tsx`) already uses `<item.Demo />` correctly. Don't repeat the placeholder-pattern discovery (see commit `e2172b5`).

### 6. Verify locally

```bash
npm run build -w @workspace/registry   # block must compile standalone
node apps/web/scripts/build-sources.mjs   # regenerates sources.generated.ts
node apps/web/scripts/build-registry.mjs  # regenerates public/r/*.json
node apps/web/scripts/check-registry-drift.mjs
cd apps/web && npx tsc --noEmit
cd apps/web && npm run build
node apps/web/scripts/contract-test.mjs   # consumer-shim type-checks the block
```

## What gets generated

- `apps/web/lib/registry/sources.generated.ts` — block source as string literal
- `apps/web/public/r/<id>.json` — per-block install artifact (committed)

## Common pitfalls

- **Missing `Demo` export** — `deriveBlockPreview` renders `<Block />` with no props by default, showing the no-props default rendering. Always export `BlockDemo` with realistic props.

- **Missing `rootDir` in `packages/registry/tsconfig.json`** — when the block imports `@workspace/registry/components/<composed>` (self-reference), `npm run typecheck` fails locally and in CI with `error TS2209: The project root is ambiguous`. The build tsconfig had `rootDir: "./src"` but the typecheck tsconfig did not. Symptom: `npm run build` works, `npm run typecheck` doesn't.

  Fix: ensure `packages/registry/tsconfig.json` includes `"rootDir": "./src"`. This is currently in place; if you regenerate the tsconfig, preserve this.

- **New npm peer dep not installed by contract test** — if the block uses a package the shim doesn't have, `node apps/web/scripts/contract-test.mjs` fails with `Cannot find module`. Update the install list in `apps/web/scripts/contract-test.mjs` (lines ~84-99) to mirror the new `dependencies[]` in `registry.json`. The feedback memory `feedback_registry_deps_coupling.md` captures this in detail.

- **Wrong `target` placeholder** — blocks use `@/components/<id>.tsx`, not `@ui/<id>.tsx` (which is for single-file components). The shadcn CLI's `@ui/` placeholder maps to `components/ui/`, while `@/components/` maps to `components/`. Blocks live in `components/`, not `components/ui/`.

- **Hardcoded "placeholder" text in detail page** — if you copy-paste from a templates or scaffold, the `Preview` tab in the block detail page may show a literal "rendered block placeholder" string. Replace with `<block.Demo />` (see commit `e2172b5` for the canonical fix).

- **`registryDependencies[]` missing or wrong** — the shadcn CLI uses this to install composed ds-* items alongside the block. Without it, consumers get import errors after install.

## Reference

- Skill: `add-component` (parallel, for single-file ds-* items)
- Showcase aggregator: `apps/web/lib/registry/index.tsx`
- Block pages: `apps/web/app/blocks/page.tsx`, `[category_id]/page.tsx`, `[category_id]/[block_id]/page.tsx`
- Types: `packages/registry/src/types.ts` (BlockMeta, BLOCK_CATEGORIES)
- BlockEntry: `apps/web/lib/registry/index.tsx` (must include `Demo`)
- Source extraction: `apps/web/scripts/build-sources.mjs`
- Registry JSON emission: `apps/web/scripts/build-registry.mjs`
- Drift detection: `apps/web/scripts/check-registry-drift.mjs`
- Contract test: `apps/web/scripts/contract-test.mjs`
- Live site: https://ui.deessejs.com/blocks
