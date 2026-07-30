---
name: add-component
description: Add a new component to the @deessejs/ui registry — file scaffolding, registry wiring, codegen, deploy
---

Add a new component to the registry at ui.deessejs.com. Walks through the four-file pattern: `index.tsx`, `meta.ts`, registry entry, and source codegen.

## When to use

- User asks to add a new component to the registry
- User asks to migrate a component from mock data to a real implementation
- After adding a new component to `packages/ui/` that should be showcased

## Workflow

### 1. Create the component files

```
packages/registry/src/components/<id>/
├── index.tsx     ← React component + Demo export
└── meta.ts      ← ComponentMeta
```

**`index.tsx`** — real implementation OR re-export from `@workspace/ui`:

```tsx
"use client"

import { Button as ShadcnButton } from "@workspace/ui/components/button"

export type ButtonProps = React.ComponentProps<typeof ShadcnButton>

export { ShadcnButton as Button }

export function ButtonDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ShadcnButton variant="default">Default</ShadcnButton>
      {/* ...other variants */}
    </div>
  )
}
```

The `Demo` export renders in the preview tab. Keep it self-contained — no providers, no external state.

**`meta.ts`** — metadata for registry indexing:

```ts
import type { ComponentMeta } from "../../types.ts"

export const meta: ComponentMeta = {
  id: "button",
  name: "Button",
  description: "Default button with variants.",
  category: "buttons",
  variants: ["default", "secondary", "outline", "ghost", "destructive", "link"],
}
```

Categories are typed in `packages/registry/src/types.ts`. If the category doesn't exist yet, add it to `COMPONENT_CATEGORIES`.

### 2. Register in `apps/web`

**`apps/web/lib/registry/index.ts`** — add the entry to `COMPONENT_REGISTRY`:

```ts
import { Button, ButtonDemo } from "@workspace/registry/components/button"
import { meta as buttonMeta } from "@workspace/registry/components/button/meta"

const COMPONENT_REGISTRY: ComponentEntry[] = [
  { ...buttonMeta, Component: Button, Demo: ButtonDemo, source: SOURCES.components.button },
  // ... existing entries
]
```

**`apps/web/lib/registry/sources.ts`** — usually no change needed. The `prebuild` codegen script auto-discovers source files in `packages/registry/src/components/<id>/index.tsx`.

### 3. Verify locally

```bash
npm run typecheck   # must stay green
npm run build       # runs prebuild → registry build → next build
```

`prebuild` regenerates `apps/web/lib/registry/sources.generated.ts` with the new component's source. Commit this generated file (it's checked into git so cold builds work without re-running prebuild).

### 4. Commit and push

```bash
git add \
  packages/registry/src/components/<id>/ \
  apps/web/lib/registry/index.ts \
  apps/web/lib/registry/sources.generated.ts
git commit -m "feat(registry): add <id>"
git push origin main
```

Vercel deploys automatically. Production URL: `https://ui.deessejs.com/components/<category>/<id>`.

## What gets generated

The `prebuild` step (`apps/web/scripts/build-sources.mjs`):
1. Scans `packages/registry/src/components/*/index.tsx` and `packages/registry/src/blocks/*/index.tsx`
2. Emits `apps/web/lib/registry/sources.generated.ts` with each source as a string literal

The generated file gets bundled into the Next.js output. **No `fs.readFileSync` at runtime** — that's why the deployment works on Vercel (where the source files aren't in the bundle).

## Common pitfalls

- **ComponentMeta not exported**: `meta.ts` must have `export const meta` (named export, not default)
- **Category not in the typed list**: add it to `COMPONENT_CATEGORIES` in `packages/registry/src/types.ts`
- **Demo breaks SSR**: avoid hooks needing providers (React Query, theme); keep `Demo` stateless
- **Source code wrong in Code tab**: re-run `npm run build` to regenerate `sources.generated.ts`
- **Build fails with `Module not found @workspace/registry/...`**: confirm `packages/registry/dist/` exists. If not, run `npm run build -w @workspace/registry`
- **New npm peer dep introduced via `dependencies[]` in `registry.json`** (e.g. `lucide-react`, `zod`): the contract test (`apps/web/scripts/contract-test.mjs`) has a hardcoded install list — add the new dep there or `npm run contract-test` (the CI `contract` job) will fail with `Cannot find module`. See memory `feedback_registry_deps_coupling.md` for the full lesson.
- **Composing multiple ds-* items into one distributable piece**: use the **`add-block` skill** instead. Blocks are `type: registry:block`, support `registryDependencies[]`, and have a different aggregator entry shape (BlockEntry requires `Demo`). Components are single-file, no cross-references between registry items.

## Reference

- Registry aggregator: `apps/web/lib/registry/index.ts`
- Types: `packages/registry/src/types.ts`
- Source extraction: `apps/web/scripts/build-sources.mjs`
- Generated sources: `apps/web/lib/registry/sources.generated.ts`
- Page consumer: `apps/web/app/components/[category_id]/[component_id]/page.tsx`
- Live site: https://ui.deessejs.com