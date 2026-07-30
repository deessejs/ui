---
title: Collapsing the dual tree
date: 2026-07-30
status: decisions locked
---

# Collapsing the dual tree

**Constrained by:** decision 5 (the dual tree collapses into one), decision 2 (the agent writes no
files).

**Measured against the repo:** 2026-07-30, all 9 items read in full.

Today every registry item exists twice: once under `packages/registry/src/` (what the showcase
renders) and once under `registry/base-nova/` (what `shadcn add` ships). Decision 5 makes one of them
the source of truth and derives the other.

The collapse itself is uncontroversial. **Which copy wins is not — and it is not the same answer for
every item.**

---

## Why the duplication has to go now

The earlier decision to accept it (`docs/plans/2026-07-29-shadcn-registry-adoption.md`) said
*"duplication is accepted; drift is caught by PR review."* Decision 2 removes the PR from the
authoring loop. The stated mitigation no longer has a place to run — its premise is gone, not merely
inconvenient.

The fallback mitigation, `apps/web/scripts/check-registry-drift.mjs`, does not cover the gap:

| Check | Fires for |
|---|---|
| cva equivalence (when `workspace-source-path != null`) | `ds-button`, `ds-colored-badge`, `ds-breadcrumb`, `ds-empty`, `ds-tabs` |
| `if (workspaceSrc && item.name === "ds-button")` | `ds-button` |
| `if (item.name === "ds-icon-button")` | `ds-icon-button` |
| `if (item.name === "ds-colored-badge")` | `ds-colored-badge` |

`ds-input`, `ds-textarea` and `ds-block-empty-state` have complete entries in
`docs/registry/audit-2026-07-29.json` and hit **zero assertions** — the loop prints the item name and
passes. `registry/CONTRIBUTING.md` states the script *"fails closed for un-audited items rather than
silently skipping them"*; it fails closed on a missing **entry**, not on a missing **check**. An entry
with no matching branch passes silently.

So the apparatus asserts on 3 of 9 items and reports green. That is the argument for deleting it —
not that there is nothing to guard.

---

## What actually diverges

Read all nine pairs, comparing every string literal byte-for-byte.

| Item | `packages/registry/src/` copy | In sync with `base-nova`? |
|---|---|---|
| `button` | thin re-export of `@workspace/ui` Button + Demo | yes — cva base string byte-identical, 602 chars |
| `breadcrumb` | thin re-export of 7 symbols + Demo | yes — 2 of 2 strings identical |
| `tabs` | thin re-export of 4 symbols + Demo | yes — 6 of 6 strings identical |
| `empty` | re-export of 6 symbols + Demo | yes — 7 of 7 strings identical |
| `input` | **real implementation** (`forwardRef`, `displayName`, full class string) | yes — identical |
| `textarea` | **real implementation** (same shape) | yes — identical |
| `colored-badge` | **real implementation** — owns the `ColoredBadgeColor` union and an 8-entry `COLOR_CLASSES` map | **no — 8 strings vs 10** |
| `icon-button` | **real implementation** — `SIZE_CLASSES`, required `aria-label`, `Omit<…, "children" \| "size">` | **no — trimmed base string** |
| `blocks/empty-state` | **real implementation** — `EmptyStateProps`, `hasHeader` branching, composition | structurally, yes |

Four items are thin re-exports. **Five carry real implementation**, and for `input`, `textarea`,
`colored-badge` and `icon-button` there is **no `packages/ui` primitive to re-export at all** —
`packages/ui/src/components/` contains exactly five files (`badge`, `breadcrumb`, `button`, `empty`,
`tabs`). For those four, `packages/registry` *is* the upstream.

### `ds-icon-button` — the case that decides the rule

The showcase version delegates to `<ShadcnButton size="icon">` and therefore inherits the full
607-character button base. The `base-nova` version hand-inlines a **strict subset** of it. Missing:

```
group/button
text-sm
active:not-aria-[haspopup]:translate-y-px
all aria-invalid:*  rules
all [&_svg]         rules
```

It also uses `cva` for sizes where the showcase uses a plain `SIZE_CLASSES` record. The installed
component does not render identically to the showcase preview.

### `ds-colored-badge` — self-documented copy-paste

The `base-nova` copy adds two inlined strings absent from the workspace copy:

```
BADGE_BASE    = "inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden
                 rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium …"
BADGE_OUTLINE = "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground"
```

The file documents this itself (lines 26–32) as a manual copy-paste, with a drift warning pointing at
`docs/plans/2026-07-29-drift-detection.md`. It renders a raw `<span>` where the showcase renders the
`Badge` component, and `DsColoredBadgeProps` **accepts `className`** while the showcase
`ColoredBadgeProps` does not — an API divergence, not just a styling one.

### `empty` — clean primitive, drifted demo

The component pair is byte-identical. The showcase **Demo** hand-rolls a raw `<button>` with its own
class string using `rounded-md`, where the real Button uses `rounded-lg`. Demos are not shipped, so
this affects only what the maintainer sees — but the maintainer's eye is the whole review, so it is
worth fixing in the same pass.

---

## Arbitration, per item

The blanket rule "the consumer version wins" holds for the four re-exports and for `input` /
`textarea` / the block, where the trees agree anyway. It **fails** on the two divergent items,
because in both cases the consumer copy is the degraded one. Adopting it wholesale would publish the
trimmed `icon-button` base string as the single source of truth — the anti-slop principle inverted.

| Item | Winner | Reason |
|---|---|---|
| `button` | consumer | identical bodies; consumer is what ships and what `contract-test.mjs` type-checks |
| `breadcrumb`, `tabs`, `empty` | consumer | identical strings; showcase side is a re-export with nothing to lose |
| `input`, `textarea` | consumer | identical; and `packages/ui` has no primitive here either way |
| `blocks/empty-state` | consumer | structurally equivalent; consumer already resolves `@/components/ui/ds-*` |
| **`icon-button`** | **workspace** | the consumer copy is a strict subset of the button base — adopting it loses `group/button`, `text-sm`, the active translate, every `aria-invalid:*` and every `[&_svg]` rule |
| **`colored-badge`** | **workspace** | the consumer copy inlines a stale `Badge` snapshot and widens the props type with `className` |

For the two workspace winners, the merge is not a file move: the workspace implementation has to be
rewritten into self-contained form (`@/lib/utils`, no `@workspace/*`) **before** it becomes the single
source. That is real work on two items, and it is the part the "one import specifier" framing hides.

---

## What the collapse does *not* mean

**`packages/ui/src/components/button.tsx` stays.** The site chrome — `app-header`, `app-footer`,
cards, pager — imports `@workspace/ui/components/button`. That package is the showcase's own UI kit;
`ds-button` is the distributed artifact. Two different consumers, both legitimate.

The collapse is between the **showcase registry tree** and the **consumer tree**. It is not between
`packages/ui` and the registry.

---

## Mechanism

One source text per item, self-contained, importing `cn` from `@/lib/utils`. Three environments
resolve that specifier three ways and execute the same bytes:

| Environment | Resolution |
|---|---|
| showcase (`apps/web`) | `apps/web/lib/utils.ts` re-exporting `cn` from `@workspace/ui/lib/utils` |
| preview | import map entry `"@/lib/utils": "/v/cn.js"` — see [preview/01-transpile-and-imports.md](./preview/01-transpile-and-imports.md) |
| consumer project | the `@/lib/utils` that `shadcn add` already expects |

`apps/web/tsconfig.json` maps `@/*` to `["./*"]`, so the bridge resolves with no further config:

```ts
// apps/web/lib/utils.ts
export { cn } from "@workspace/ui/lib/utils"
```

**This file does not exist yet.** It is two lines, but it is two lines that have to be written.

One contradiction to resolve in the same pass: `apps/web/components.json` declares
`"utils": "@workspace/ui/lib/utils"`, while every published item imports `@/lib/utils`. The showcase's
own shadcn alias disagrees with the artifact it distributes.

---

## The blind spot the collapse inherits

`registry/base-nova/**` sits outside every workspace (`"workspaces": ["apps/*", "packages/*"]`) and
outside every tsconfig `include`. `turbo typecheck` runs `tsc --noEmit` per workspace, so **that tree
is never type-checked.**

That is why `@/lib/utils` resolving to a non-existent file has been invisible: nothing ever tried to
resolve it. It was tolerable while the tree was a build artifact. Once it becomes the single source of
truth, it becomes the primary blind spot.

`contract-test.mjs` is the only thing that type-checks these files, and it does so by copying them
into a scratch consumer project with a stubbed `@/lib/utils` — which validates the consumer story and
nothing else. Post-collapse, either the tree joins a tsconfig `include` or the contract test becomes
the sole gate for it. See [repo/01-decoupling.md](./repo/01-decoupling.md).

---

## Smaller inconsistencies to fold into the same pass

- **`"use client"` disagrees across the trees.** All 9 `packages/registry/src` copies have it; only 5
  of 9 `base-nova` copies do (`colored-badge`, `empty`, `input`, `textarea` lack it). Post-collapse
  this becomes one directive per item, decided once. Inside the preview iframe it is inert — there is
  no RSC there — but it is load-bearing in a consumer's App Router project.
- **Two dead imports.** `ds-button.tsx` and `ds-tabs.tsx` both `import * as React from "react"` with
  zero `React.*` usages.
- **`packages/ui/button.tsx` expresses defaults twice** — `defaultVariants` inside the `cva` *and*
  destructuring defaults in the signature. Behaviourally redundant; pick one when merging.
- **The block's Demo breaks the naming convention.** Every item exports `<Name>Demo` except the block,
  which exports `EmptyStateBlockDemo`. Harmless today because
  `apps/web/lib/registry/index.tsx` imports it explicitly; fatal to any codegen that replaces that
  hand-written aggregator.
- **The button cva has 6 variants and 8 sizes** (`default, xs, sm, lg, icon, icon-xs, icon-sm,
  icon-lg`). Earlier notes say nine; there are eight.

---

## What gets deleted

Once the trees are one, these have nothing left to compare:

- `apps/web/scripts/check-registry-drift.mjs`
- `docs/registry/audit-2026-07-29.json` and `docs/registry/audit-2026-07-29.md`
- the `drift` job in `.github/workflows/ci.yml`
- the drift sections of `registry/CONTRIBUTING.md` and `.claude/skills/add-block/SKILL.md`

`docs/plans/2026-07-29-drift-detection.md` stays as a record of a design that a later decision made
unnecessary. See [repo/01-decoupling.md](./repo/01-decoupling.md) for the full removal list.

**Status as of 2026-07-30:** none of the above has been deleted yet. The script, both audit files,
the `drift` CI job, and the skill/CONTRIBUTING drift references are all still on disk. Deletion is part
of the single-tree-collapse PR, not separate from it.
