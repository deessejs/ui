# Contributing to the deessejs registry

This is the source of truth for what ships in the [deessejs](https://github.com/deessejs/ui) shadcn registry. Every component listed in [`registry.json`](../registry.json) at the repo root lives as a hand-curated source file under `registry/base-nova/`. The build pipeline reads those files and emits the JSON artifacts at `apps/web/public/r/` that the [shadcn CLI](https://ui.shadcn.com/docs/cli) consumes.

## Layout

```
registry/
└── base-nova/
    └── <item-name>/         # one folder per item
        └── <item-name>.tsx  # the consumer-facing source (one file per item for now)
registry.json                # catalog at the repo root
```

Item names use the `ds-` prefix to distinguish them from built-in shadcn primitives (e.g. `ds-button`, never just `button`).

## Authoring rules

These come from decisions documented in [`docs/plans/2026-07-29-shadcn-registry-adoption.md`](../docs/plans/2026-07-29-shadcn-registry-adoption.md). Don't bend them without re-litigating the plan.

- **No `@workspace/*` imports.** Sources ship to consumers verbatim, so workspace paths will not resolve outside this repo.
- **Cross-item aliases use `@/components/ui/...`** — the default written by `shadcn init`. (Optional `~/components/...` works too; `@/` is the locked convention.)
- **Self-contained for v1.** Each `ds-*` component imports only npm packages plus `@/lib/utils`. Cross-item imports inside a single item are not allowed yet — the layout will be relaxed when blocks land.
- **Real components, not re-exports.** Don't write `ds-button.tsx` as `export { Button } from "@workspace/ui/components/button"`. Ship the actual implementation; the showcase tree `packages/registry/src/components/<id>/index.tsx` keeps using the workspace imports for the docs site.
- **`cn` from `@/lib/utils`.** Consumers running `shadcn init` get a `cn` helper there. If you need something fancier, add it to your item's `dependencies` (npm) — don't ship a registry:lib alongside unless you mean to.

## Adding a new `ds-*` component

1. **Author the source.** Create `registry/base-nova/ds-<id>/ds-<id>.tsx`. Stay self-contained, no `@workspace/*` imports, no cross-item imports.
2. **Mirror it in the showcase tree.** Create `packages/registry/src/components/<id>/{index.tsx,meta.ts}`. The `index.tsx` re-exports from `@workspace/ui/components/<id>` (or wires the workspace imports however it likes); the `meta.ts` exports `ComponentMeta` for the showcase site at `ui.deessejs.com`. Register the entry in `apps/web/lib/registry/index.ts`'s `COMPONENT_REGISTRY`.
3. **Add the item to `registry.json`** with this shape:

   ```json
   {
     "name": "ds-<id>",
     "type": "registry:ui",
     "title": "Title Case Name",
     "description": "One sentence.",
     "dependencies": [
       "@base-ui/react@^1.6.0",
       "class-variance-authority",
       "clsx",
       "tailwind-merge"
     ],
     "files": [
       {
         "path": "registry/base-nova/ds-<id>/ds-<id>.tsx",
         "type": "registry:ui",
         "target": "@ui/ds-<id>.tsx"
       }
     ]
   }
   ```

   Per-item curated dependencies — only list what this item actually imports. `ds-colored-badge` does not list `@base-ui/react`; `ds-button` and `ds-icon-button` do. Don't copy-paste from a sibling item.
4. **Run the build.**

   ```sh
   npm run registry:build --workspace web
   ```

   This reads `registry.json`, inlines each item's source content, and writes:

   - `apps/web/public/r/registry.json` — the catalog (no file `content`)
   - `apps/web/public/r/<item-name>.json` — one per item, with file `content` inlined so the CLI can install from a single fetch
5. **Commit the generated JSON.** Same rationale as `apps/web/lib/registry/sources.generated.ts` — cold Vercel builds work without re-running the build step.
6. **Validate.** Run the same command CI runs, locally:

   ```sh
   npx --yes shadcn@latest registry validate "deessejs/ui#$(git branch --show-current)"
   ```

   Then run `tsc --noEmit` from `apps/web/` to ensure the showcase site still compiles.

## Adding a block (later)

Blocks use the `ds-block-*` prefix, cohabit in the same `registry/base-nova/` tree (no separate `blocks/` subfolder), and live as `registry:block` items. Each item is multi-file with `target` placeholders (`@ui/`, `@components/`, `@lib/`, `@hooks/`) per file. Mirror the entry in `BLOCK_REGISTRY` inside `apps/web/lib/registry/index.ts` so the showcase picks it up. See the **Blocks extension point** section of the plan for the full convention.

## Submission to the shadcn directory (Phase 6)

To appear in the official registry index at `https://ui.shadcn.com/r/registries.json`, we submit a small JSON entry to `shadcn-ui/ui` via PR to `apps/v4/registry/directory.json`. Requirements:

1. Repo must be public.
2. `registry.json` and per-item JSONs at the registry root (the build pipeline already emits them under `apps/web/public/r/`, served at `https://ui.deessejs.com/r/`).
3. The catalog's `files[]` arrays must NOT include a `content` property. The per-item install JSONs DO include content — both are produced by the build, they have different roles.

Until at least one external user has confirmed an install end-to-end, we keep Phase 6 deferred. When we submit, the entry will look like:

```json
{
  "name": "deessejs",
  "url": "https://ui.deessejs.com/r/{name}.json",
  "homepage": "https://ui.deessejs.com",
  "description": "DeesseJS components — Base UI on shadcn base-nova tokens."
}
```

## Local commands

```sh
# Build the registry catalog + per-item JSONs
npm run registry:build --workspace web

# Validate the catalog against the shadcn schema
npx --yes shadcn@latest registry validate "deessejs/ui#$(git branch --show-current)"

# Type-check the showcase site
cd apps/web && npx tsc --noEmit
```

CI runs all three on every push and PR.
