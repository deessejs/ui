---
title: Make deessejs components installable via the `shadcn` CLI
date: 2026-07-29
status: decisions-locked
---

# Plan: Make deessejs components installable via the `shadcn` CLI

**Date:** 2026-07-29
**Status:** Decisions locked (2026-07-29) — ready for Phase 1.
**Author:** generated from fresh-cli research, refined after a survey of how the largest shadcn registries actually structure their monorepos.

---

## Decisions log (2026-07-29)

Locked in this conversation. No more re-litigation unless something materially changes the picture.

- **Repo URL:** `https://github.com/deessejs/ui` (user-confirmed, not re-verified at the time of locking).
- **Scope at launch:** 3 components in a single PR — `ds-button`, `ds-colored-badge`, `ds-icon-button`.
- **Item prefix:** `ds-` on every item name (folder name, file name, and `target` path).
- **Combo name:** `base-nova` for the initial registry tree (matches `apps/web/components.json` `style: "base-nova"`).
- **Generated JSON:** committed in git, matching the existing `sources.generated.ts` pattern in this repo.
- **Blocks convention:** locked now even though no block exists yet — see **Blocks extension point** below.
- **Dependencies:** per-item curated — each item declares only what it actually uses (no global default).
- **Cross-item import alias:** `@/components/ui/...` (matches what `shadcn init` generates by default). Matters only once blocks land; v1 has no cross-item imports to make.
- **Build script location:** `apps/web/scripts/build-registry.mjs`, sibling of the existing `build-sources.mjs`.
- **Source layout:** flat `registry/base-nova/<id>/<id>.tsx` — one file per item, no `index.tsx` barrel, no `Demo` export (the `Demo` requirement on the showcase side is satisfied separately by `packages/registry/src/components/<id>/index.tsx`).
- **Existing showcase tree:** `packages/registry/src/components/<id>/` and its `meta.ts` files stay untouched. They continue to feed `apps/web/lib/registry/index.tsx`'s `COMPONENT_REGISTRY`, which powers the showcase at `ui.deessejs.com`. `registry.json` is a parallel manifest for the shadcn CLI. Duplication is accepted; drift is caught by PR review.
- **README documents the registry:** the `Install` section (3 modes, one example each) and the `Available components` table sit before the project structure. Discoverability — the original silent failure of the v1 PR — is now in the README body.
- **CONTRIBUTING captures the addition flow:** `registry/CONTRIBUTING.md` co-located with the registry source is the canonical "how to add a new item" doc. Future contributors do not have to re-derive the rules from the plan.
- **CI runs 5 jobs in parallel** (registry-validate, lint, typecheck, build-showcase, contract). The original PR had only the first; lint/typecheck/build were added on user request, and contract is the Phase 4 deliverable that was deferred.

## Goal

Let any developer install a deessejs component into their own Next.js / shadcn project with a single command, and have the right file land in the right shadcn directory with the right peer dependencies installed (Base UI + tokens), without us maintaining a separate install pipeline.

```sh
pnpm dlx shadcn@latest add @deessejs/ds-button
# or
pnpm dlx shadcn@latest add https://ui.deessejs.com/r/ds-button.json
# or
pnpm dlx shadcn@latest add deessejs/ui/ds-button
```

All three should land the same `ds-button.tsx` in the consumer's `components/ui/`.

## Approach (revised after OSS research)

The first draft proposed Path A (GitHub-resident `registry.json`) as v1 with Path B (built static JSON via `shadcn build`) deferred to Phase 6. The OSS survey invalidated that: **every registry with real adoption uses the build pipeline** (shadcn themselves, ReUI, 8bitcn). Path A is strictly a subset of Path B — choosing it first means rewriting in a year.

We commit to **Path B from v1** but the produced JSON also serves Path A (GitHub registry mode) for free, since the same artifact is consumable both ways.

## What the OSS research established

Survey of registries with the largest install bases. Findings:

- **Source of truth lives in a dedicated tree**, separated from the web/next app's source code. shadcn: `apps/v4/registry/bases/`. ReUI: `registry-reui/`. Nobody shares files between the showcase site and the installable registry.
- **Build pipelines are custom**, not vanilla `shadcn build`. shadcn ships `scripts/build-registry.mts`. ReUI ships `pnpm registry:build` plus a separate `registry:verify` step. They need matrix generation (base × style), runtime indexes, and validation.
- **Dual Base UI / Radix = duplicated sources**. shadcn keeps `bases/base/` and `bases/radix/` as parallel trees. ReUI same. Nobody trusts a runtime transform from one to the other.
- **Style tokens are separate files**, composed with bases by the build matrix (shadcn: `styles/style-nova.css` × every base).
- **Items are prefixed** to avoid collision with built-in shadcn names. ReUI: `c-button`, `c-data-grid-9`. Installed as `@reui/c-button-10`.
- **`@ui/`, `@components/`, `@lib/`, `@hooks/` placeholders in `target`** are the modern way to write consumer-relative paths. Shipped May 2026 (PR #10528 / changelog `2026-05-package-imports-target-aliases`). Use them in preference to literal `components/ui/...` paths.
- **The shadcn CLI's monorepo handling is rough** even in mid-2026 — see open issues #9239, #11002 plus related fixes. Any architecture that relies on runtime transformation of workspace imports is on a fragile surface.
- **`registry validate` is standard CI.** ReUI uses `pnpm registry:verify`; the shadcn CLI exposes `registry validate`. Both belong in CI from day one.

## What is already in place

Verified by reading the repo:

- `apps/web/components.json` uses shadcn's aliases (`aliases.ui`, `aliases.lib`, `aliases.components`, `aliases.hooks`) and `style: "base-nova"`.
- `@workspace/registry` ships `button`, `colored-badge`, `icon-button` under `packages/registry/src/components/`.
- `packages/ui` exposes shadcn primitives on `@base-ui/react` + Tailwind v4 tokens + `cn()`.
- `apps/web/scripts/build-sources.mjs` already builds generated content from registry sources at build time. The shape of what we need for the registry is the same shape — extend, don't replace.
- `README.md` documents the install modes (GitHub registry, URL, namespace) and lists the available `ds-*` components at the top of the file. Contribution pointer to `registry/CONTRIBUTING.md`.
- `registry/CONTRIBUTING.md` documents the authoring rules, the per-item curated dependency convention, the build pipeline, the local validation loop, and how to add a `ds-block-*` when blocks land.

## Phase 1 — Author the consumer-facing source tree

New directory at the repo root:

```
registry/
└── base-nova/
    ├── ds-button/
    │   └── ds-button.tsx
    ├── ds-colored-badge/
    │   └── ds-colored-badge.tsx
    └── ds-icon-button/
        └── ds-icon-button.tsx
```

Authoring rules:

- **No `@workspace/*` imports anywhere in these files.** They use the exact imports a typical shadcn consumer would: `@/components/ui/...` for shared primitives (the default produced by `shadcn init`), plus package imports (`@base-ui/react/button`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`). `~/` is supported too, but `@/` is the chosen convention because it is guaranteed by every project that ran `shadcn init`.
- Each file is a real, distributable component. Where the existing `packages/registry/src/components/<id>/index.tsx` is a thin re-export (button), the `ds-button.tsx` here imports the underlying primitive directly — it is still real code, just minimal.
- One file per item for v1. Composed blocks (`registry:block`) come later.
- The `ds-` prefix on item names (folder, file, `target`) clearly distinguishes deessejs items from built-in shadcn items in any catalog browser.

The existing `packages/registry/src/components/*` tree stays untouched — it still powers the showcase site at `ui.deessejs.com`.

### Existing showcase tree (untouched)

`packages/registry/src/components/<id>/` and its `meta.ts` files are deliberately not in this scope. They continue to feed `apps/web/lib/registry/index.tsx`'s `COMPONENT_REGISTRY`, which the showcase site renders at `ui.deessejs.com`. `registry.json` is a parallel manifest for the shadcn CLI — duplication of `id`, `name`, `description`, `category` between the two is accepted. Drift is mitigated by PR review (Phase 5's `registry validate` will catch missing or malformed `registry.json` entries; missing showcase updates are a human-review concern, not a tooling one).

## Phase 2 — Add `registry.json` at the repo root

Schema: `https://ui.shadcn.com/schema/registry.json`.

Required fields:

- `$schema`
- `name` → `deessejs`
- `homepage` → `https://github.com/deessejs/ui` (decided; no need to re-verify at lock time)

Each `items[]` entry follows this shape:

```json
{
  "name": "ds-button",
  "type": "registry:ui",
  "title": "Button",
  "description": "DeesseJS button on base-nova tokens.",
  "dependencies": [
    "@base-ui/react@^1.6.0",
    "class-variance-authority",
    "clsx",
    "tailwind-merge"
  ],

Per-item curated — each item lists only the packages it actually imports. The list shown is `ds-button`'s; `ds-icon-button` declares the same; `ds-colored-badge` does not include `@base-ui/react` because it does not import it. Do not copy-paste from a sibling item.
  "files": [
    {
      "path": "registry/base-nova/ds-button/ds-button.tsx",
      "type": "registry:ui",
      "target": "@ui/ds-button.tsx"
    }
  ]
}
```

The `target` uses the `@ui/` placeholder so the file lands in the consumer's configured `aliases.ui` directory (typically `components/ui/ds-button.tsx`). This is portable across monorepo and single-package consumers without modification.

When the catalog grows past ~10 items, migrate to `include` mode (per-directory `registry.json`s composed by the root). Same machinery, distributed layouts. ReUI and shadcn both do this.

## Phase 3 — Extend the build pipeline

Two changes, additive only:

1. **Add `apps/web/scripts/build-registry.mjs`.** Reads `registry.json` at the repo root, reads each item's `files[].path`, and emits under `apps/web/public/r/`:
   - `apps/web/public/r/registry.json` (the catalog)
   - `apps/web/public/r/<item-name>.json` (one per item)
   - Optionally per-style subdirs if we ever ship style-specific catalogs

   Pattern is the same as the existing `apps/web/scripts/build-sources.mjs` — read sources, write generated artifacts.

2. **Wire into the existing build chain** in `apps/web/package.json`:

   ```json
   {
     "scripts": {
       "registry:build": "node scripts/build-registry.mjs",
       "prebuild": "node scripts/build-sources.mjs && node scripts/build-registry.mjs"
     }
   }
   ```

   The web build already runs `prebuild` first, so the generated artifacts are produced before Next bundling. Vercel serves everything in `apps/web/public/` at the site root, so `https://ui.deessejs.com/r/ds-button.json` becomes available on the next deploy — no extra server work.

The generated JSON files are **committed in git** (decision). That means the build script re-emits them on every build, but the version-controlled copy is the canonical state for cold-build Vercel deploys and for any consumer fetching the raw file via GitHub. Same model as the existing `sources.generated.ts`. The drift risk is real (someone could edit a `.tsx` without rebuilding) — Phase 5 CI addresses that by failing on a stale or missing generated artifact.

## Phase 4 — Local validation

From the repo root, sanity-check the source tree:

```sh
pnpm dlx shadcn@latest registry validate deessejs/ui
```

The CLI reads `registry.json` from the GitHub URL (or locally), resolves items, confirms every referenced file exists.

Then in a throwaway Next.js + shadcn consumer project, smoke-test all three install modes:

```sh
# URL mode — works against the deployed site or a local port
pnpm dlx shadcn@latest add https://ui.deessejs.com/r/ds-button.json

# Namespace mode — one-time setup, then any item
pnpm dlx shadcn@latest registry add @deessejs=https://ui.deessejs.com/r/{name}.json
pnpm dlx shadcn@latest add @deessejs/ds-button

# GitHub mode — works against the public repo before deployment
pnpm dlx shadcn@latest add deessejs/ui/ds-button
```

For each: confirm the file lands at `components/ui/ds-button.tsx`, `dependencies` install, `pnpm dev` renders the component with our tokens. Capture a screenshot for the team's `docs/registry/` notes (private — not committed if undesired).

## Phase 5 — CI gate

Five jobs run in parallel on every push and PR. They cover the full surface area of a registry change:

1. **`registry-validate`** — runs `apps/web/scripts/build-registry.mjs`, asserts all four emitted JSONs exist, then runs the official `npx shadcn@latest registry validate deessejs/ui#<branch>` against the PR head ref. Schema-level guarantee.
2. **`lint`** — `npx turbo lint`. Workspace ESLint. Catches style or rule regressions across all packages.
3. **`typecheck`** — `npx turbo typecheck`. Catches type regressions across the workspace (registry package + apps/web). Note: the new `registry/base-nova/**.tsx` files are deliberately NOT in any workspace tsconfig — they're shipped as artifacts, not compiled here. The Phase 4 contract test covers their type story from a consumer's perspective.
4. **`build-showcase`** — `npx turbo build`. Builds `packages/registry` first (since apps/web depends on it), then `apps/web`. Asserts `apps/web/.next/` exists. This is the job that catches "registry changes broke the showcase" regressions.
5. **`contract`** — runs `apps/web/scripts/contract-test.mjs`. Builds a stub consumer project at `.contract-test/` that mirrors a typical shadcn install (real `cn` helper at `@/lib/utils`, real Base UI + cva + clsx + tailwind-merge), copies the registry sources into it, runs `tsc --noEmit`. Catches typos in cross-item imports, wrong peer deps, alias drift. Phase 4 deliverable, was deferred from the original PR and added once the user asked for it.

Concurrency is handled by `concurrency: { group: ci-${{ github.workflow }}-${{ github.ref }}, cancel-in-progress: true }` so a new push kills the previous in-flight run on the same ref.

Actions are pinned to `actions/checkout@v5` and `actions/setup-node@v5` (the v4s use Node 20 internally, which GitHub has deprecated and forces them onto Node 24 with a warning).

Optional, not added yet: `scripts/check-registry-drift.mjs` that diffs `packages/registry/src/components/<id>/index.tsx` against `registry/base-nova/ds-<id>/ds-<id>.tsx` and fails on unintended changes. Skip in v1, add if the parallel-trees approach starts to drift.

## Phase 6 — Submit to the official registry index

Submission is not via a form — it's a PR against `shadcn-ui/ui` that adds a single entry to `apps/v4/registry/directory.json`. Two paths, both produce the same directory entry:

- **Path A — submission.** Open a PR on `https://github.com/shadcn-ui/ui` adding a JSON entry like:

  ```json
  {
    "name": "deessejs",
    "url": "https://ui.deessejs.com/r/{name}.json",
    "homepage": "https://ui.deessejs.com",
    "description": "DeesseJS components — Base UI on shadcn base-nova tokens."
  }
  ```

- **Path B — discovery.** Once submitted (or once a reviewer adds it), the directory is published at `https://ui.shadcn.com/r/registries.json`. The shadcn CLI consults this when a user runs `shadcn add` or `shadcn search` with a bare namespace, so they don't have to paste the `{name}.json` URL template.

### Hard requirements (verified by `pnpm validate:registries` upstream)

1. The registry must be open source and publicly accessible.
2. `registry.json` must conform to the official registry schema.
3. The registry must be a flat registry — `registry.json` and `<item>.json` files at the root of the registry endpoint.
4. The `files[]` array on the catalog entries must NOT include a `content` property.

### Catalogue vs install artifact — why this is satisfied by construction

Our build pipeline emits two flavors under `apps/web/public/r/`:

- `registry.json` — the catalog. `files[]` has `path` + `type` + `target` only. No `content`. Compliant with requirement #4.
- `<item>.json` — the install artifact. `files[]` has `content` inlined so the CLI can install from a single fetch. This is the per-item artifact, not the catalog; the submission rule applies to the catalog only.

Same source tree (`registry/base-nova/`), same build, two roles. Submission reviewers inspect the catalog and don't see content; the install CLI fetches the per-item JSON and does. The split is intentional.

### Submission checklist

Before opening the PR upstream:

- [ ] At least one external user has confirmed an install works end-to-end (sandbox or production).
- [ ] The catalog has no `content` keys in any `files[]` (a CI check in `registry-validate` already enforces this — verify green).
- [ ] `https://ui.deessejs.com/r/registry.json` returns a valid response (post-deploy sanity).
- [ ] The entry to be submitted lists `deessejs` (per the Phase 2 `name` in `registry.json`) and points to the live URL.
- [ ] A reviewer contact is in the PR description (typically the GitHub handle of the maintainer).

Defer until (1) is met — the user explicitly asked to plan this thoroughly but no submission was committed.

## Phase 7 — (Deferred) Extend the matrix

When/if the need arises — the structure is built for it:

- Add `registry/base-sera/`, `registry/base-vega/`, etc. for additional style tokens
- Add `registry/radix-nova/` mirror for Radix consumers (dual-base model from shadcn's `bases/base/` + `bases/radix/`)
- Add composed items that consume the `ds-*` primitives

The cost of v1 is the same as the cost of the matrix because the layout is the same.

## Blocks extension point

The registry code already models blocks (`BlockMeta`, `BlockEntry`, `findBlockItem`, the route `apps/web/app/blocks/[category_id]/page.tsx`) but `BLOCK_REGISTRY` is `[]`. There is no block content yet — this section locks the convention so the first one slots in cleanly instead of triggering a re-litigation.

Convention:

- **Naming.** Prefix `ds-block-<id>` for every block item (folder, file, `target`). Distinct from the `ds-*` prefix used by single-file components, so a catalog browser separates them at a glance. Folder and item name are the same: `registry/base-nova/ds-block-login-form/` is registered as `ds-block-login-form`.
- **Layout.** Blocks cohabit in the same `registry/base-nova/` tree as components — no separate `registry/base-nova/blocks/` subfolder. The `ds-block-*` prefix is the sole filesystem-level signal. (We chose prefix-only over folder separation to keep Phase 1's pattern intact and not bifurcate the source-of-truth layout.)
- **Type.** `"registry:block"` in `registry.json`. Shadcn's CLI uses this to dispatch the right installer behavior for multi-file items.
- **Files.** `files[]` is multi-entry. Each entry has its own `path` and its own `target` (with the modern `@ui/`, `@components/`, `@lib/`, `@hooks/` placeholders). Example layout for a hypothetical auth block:

  ```
  registry/base-nova/ds-block-login-form/
  ├── login-form.tsx              # the composed component
  ├── submit-button.tsx           # a block-specific sub-component
  └── use-login-form.ts           # block-specific hook
  ```

  ```json
  {
    "name": "ds-block-login-form",
    "type": "registry:block",
    "title": "Login Form",
    "description": "Email + password sign-in with rate-limit handling.",
    "dependencies": ["zod", "react-hook-form", "@base-ui/react@^1.6.0"],
    "registryDependencies": ["ds-button"],
    "files": [
      {
        "path": "registry/base-nova/ds-block-login-form/login-form.tsx",
        "type": "registry:component",
        "target": "@/components/login-form.tsx"
      },
      {
        "path": "registry/base-nova/ds-block-login-form/submit-button.tsx",
        "type": "registry:component",
        "target": "@/components/login/submit-button.tsx"
      },
      {
        "path": "registry/base-nova/ds-block-login-form/use-login-form.ts",
        "type": "registry:hook",
        "target": "@/hooks/use-login-form.ts"
      }
    ]
  }
  ```

- **Dependencies.** Same rules as components: explicit `dependencies` (npm) at item level, `registryDependencies` for refs to other items (e.g. `ds-button`).
- **Showcase parity.** Since the web app already has `BLOCK_REGISTRY`, blocks added to the shadcn registry should also be appended to `apps/web/lib/registry/index.tsx`'s `BLOCK_REGISTRY` — one seam, two consumers. No divergence between what shows on `ui.deessejs.com/blocks` and what can be installed via the CLI.
- **No new build pipeline work.** The same `build-registry.mjs` (Phase 3) emits `registry.json` and per-item JSON regardless of `type`. Blocks add zero build complexity.
- **No new CI work.** `registry validate` covers blocks the same as components.

## Open questions

None at v1 launch. All relevant questions have been answered in the **Decisions log** above.

The deferred items from the **Phase 7** section (multi-style, multi-base, blocks) are not open questions — they are explicit non-goals for v1.

## Resolved by this revision

- **Q3 — Import strategy.** Hand-curated dual source under `registry/base-nova/`. No runtime transformation. Peer dependencies declared explicitly in each item's `dependencies`. Defensive against the shadcn CLI's open monorepo bugs.
- **Q4 — Naming collision.** Two layers of insulation: (1) `registry/` lives at repo root, separated from `@workspace/registry`; (2) item prefix `ds-` prevents collision with built-in shadcn names.
- **Q5 — The button re-export.** Resolved structurally. `registry/base-nova/ds-button/ds-button.tsx` is hand-curated and imports `~/components/ui/button` directly — even when minimal, it is a real distributable component. We can grow it later without re-architecting.

## Verification summary

| Phase | Verified by |
|---|---|
| 1 | `tree registry/base-nova/` matches; each `.tsx` typechecks with no `@workspace/*` imports |
| 2 | `shadcn registry validate deessejs/ui#<ref>` exits 0 |
| 3 | `npm run registry:build --workspace web` produces `apps/web/public/r/<item>.json` for every item |
| 4 | `apps/web/scripts/contract-test.mjs` types consumer-shim against registry sources (CI `contract` job) |
| 5 | CI: 5 jobs all green (registry-validate + lint + typecheck + build-showcase + contract) |
| 6 | (deferred) `@deessejs/ds-button` resolves in a real external project + index submission PR opened |
| 7 | n/a for v1 |

## Non-goals (v1)

- Publishing `@workspace/ui` as an npm package (deferred — Option 3 from Q3).
- Multi-base or multi-style content (architecture accommodates, content does not).
- Replacing `@workspace/registry` (the internal npm package) with anything else.
- Replacing the showcase site's component imports — they keep using the workspace path.

## Risks

- **Buggy monorepo surface in the shadcn CLI.** Multiple open 2026 bugs (#9239, #11002, related). Mitigation: authored consumer sources ship as-is — no runtime transform of workspace imports. The decoupling is the defense.
- **Drift between `packages/registry/src/components/<id>/index.tsx` (showcase) and `registry/base-nova/ds-<id>/ds-<id>.tsx` (registry).** Mitigation: drift-check script added if drift shows up in Phase 5.
- **Schema evolution.** The `registry.json` schema may grow new required fields. The validator in Phase 5 catches drift per CI run.

---

# Addendum — 2026-07-30: the dual-tree decision is reopened and reversed

**Status of this addendum:** supersedes the "Existing showcase tree" entry in the decisions log
above. Everything else in this plan stands.

## What was locked

From the decisions log (2026-07-29):

> **Existing showcase tree:** `packages/registry/src/components/<id>/` and its `meta.ts` files stay
> untouched. […] `registry.json` is a parallel manifest for the shadcn CLI. **Duplication is
> accepted; drift is caught by PR review.**

And from the Risks section:

> **Drift between `packages/registry/src/components/<id>/index.tsx` (showcase) and
> `registry/base-nova/ds-<id>/ds-<id>.tsx` (registry).** Mitigation: drift-check script added if
> drift shows up in Phase 5.

That mitigation shipped: `apps/web/scripts/check-registry-drift.mjs`, `docs/registry/audit-2026-07-29.json`,
and the CI `drift` job.

## What materially changed

The decisions log opens with *"no more re-litigation unless something materially changes the
picture."* Two things did:

1. **Components are now authored by AI agents writing to an API, not by humans writing files.**
   See `docs/reports/2026-07-30-draft-preview-admin-architecture.md`.
2. **PR review is no longer in the authoring loop.** The locked decision's stated mitigation —
   *"drift is caught by PR review"* — no longer has a PR to run in. Its premise is gone, not merely
   inconvenient.

Duplication was acceptable when a human read both files before merge. With an agent writing both,
it doubles the surface where generated code can diverge silently, and the only remaining detector is
a script whose per-item assertions are hardcoded to three item names.

## What the divergence actually was

Measured on 2026-07-30 by reading all three files:

| File | Content |
|---|---|
| `packages/ui/src/components/button.tsx` | Full `cva`; `cn` from `@workspace/ui/lib/utils`; exports `Button` / `buttonVariants` |
| `registry/base-nova/ds-button/ds-button.tsx` | **Identical `cva` body**; `cn` from `@/lib/utils`; exports `DsButton` / `dsButtonVariants` |
| `packages/registry/src/components/button/index.tsx` | Three-line re-export of the workspace Button, plus `ButtonDemo` |

The `cva` bodies are byte-equivalent — same 607-character base string, same six variants, same eight
sizes. The differences are the `cn` import specifier, the export names, defaults expressed by
destructuring vs `defaultVariants`, and a named `DsButtonProps` interface on the consumer side. **For
`ds-button` there is no design divergence.**

**`ds-button` is not representative.** Reading all nine items on 2026-07-30 rather than only the three
above: four are thin re-exports (`button`, `breadcrumb`, `tabs`, `empty`) and **five carry real
implementation** (`colored-badge`, `icon-button`, `input`, `textarea`, `blocks/empty-state`). For
`input`, `textarea`, `colored-badge` and `icon-button` there is no `packages/ui` primitive to re-export
at all — `packages/ui/src/components/` holds only five files.

Two items genuinely diverge, and in both the consumer copy is the degraded one: `ds-icon-button` inlines
a **strict subset** of the button base string (missing `group/button`, `text-sm`, the active translate,
every `aria-invalid:*` and every `[&_svg]` rule), and `ds-colored-badge` inlines a stale `Badge` snapshot
while widening its props type with `className`.

The drift apparatus caught neither, because its per-item assertions are hardcoded to three names while
three other items get zero assertions and the run still reports green. That — not the absence of
divergence — is the argument for deleting it.

## The new decision

**The two trees collapse into one.** The self-contained, consumer-facing source becomes the single
source of truth. The showcase imports it rather than maintaining a parallel version.

Arbitration is **per item**, not blanket:

- The consumer copy wins for `button`, `breadcrumb`, `tabs`, `empty`, `input`, `textarea` and
  `blocks/empty-state`. It is the artifact that actually ships, that `contract-test.mjs` type-checks, and
  that the Phase 4 sandbox validated end-to-end against the deployed registry on 2026-07-29. It is
  already self-contained; the only workspace coupling is the `cn` import, which the `@/lib/utils` alias
  exists to resolve.
- **The workspace copy wins for `icon-button` and `colored-badge`**, where the consumer copy is the
  degraded one. Adopting it wholesale would publish a trimmed button base string as the single source of
  truth — the anti-slop principle inverted. Those two implementations must be rewritten into
  self-contained form before they can become the source, which is real work rather than a file move.

Per-item measurement and the full arbitration table: `docs/reports/studio/02-single-tree.md`.

Mechanism: a two-line bridge at `apps/web/lib/utils.ts` re-exporting `cn` from
`@workspace/ui/lib/utils`. `apps/web/tsconfig.json` already maps `@/*` to the app root. The preview
origin's import map points the same specifier at a vendored `cn`. Showcase, preview, and consumer
then execute **the same source text**.

## What this does not change

- **`packages/ui/src/components/button.tsx` stays.** The site chrome (`app-header`, `app-footer`,
  cards, pager) imports `@workspace/ui/components/button`. That package is the showcase's own UI
  kit; `ds-*` is the distributed artifact. Two legitimate consumers, two legitimate files.
- **The catalog / install-artifact split stays.** `registry.json` carries no `content`; per-item
  JSONs do. Requirement #4 of the Phase 6 submission is unaffected.
- **The `Demo` stays out of the shipped artifact.** Consumers do not receive demos; the Demo becomes
  a separate field alongside the source, not part of `files[]`.
- **Phases 1–5 and the Phase 6 submission entry stand as written.**

## Consequences

Deleted as obsolete:

- `apps/web/scripts/check-registry-drift.mjs`
- `docs/registry/audit-2026-07-29.json` and `docs/registry/audit-2026-07-29.md`
- the CI `drift` job

Superseded:

- `docs/plans/2026-07-29-drift-detection.md` — its tolerance policy no longer has two trees to
  tolerate a difference between. The parts describing *what counts as a meaningful divergence*
  should be recycled into the write-path validators in `docs/reports/studio/agent/01-validators.md`.

The OSS survey finding recorded in this plan — *"Nobody shares files between the showcase site and
the installable registry"* — remains accurate about those registries. It is knowingly departed from
here, because those registries are authored by humans through pull requests and this one is not.

Full context: `docs/reports/studio/` — start at its `README.md`.
