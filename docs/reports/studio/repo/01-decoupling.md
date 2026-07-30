---
title: Decoupling the hand-maintained lists
date: 2026-07-30
status: decisions locked
---

# Decoupling

Every place in this repo that names registry items by hand, measured. Publishing goes from rare to
frequent, so each of these becomes a silent-failure surface.

**Measured:** 2026-07-30. Ground truth is **9 items** — 8 components, 1 block.

```
ds-button  ds-icon-button  ds-colored-badge  ds-breadcrumb  ds-empty
ds-tabs    ds-input        ds-textarea       ds-block-empty-state
```

---

## The inventory

| Location | Items covered | State |
|---|---|---|
| `registry.json` | 9/9 | source of truth for distribution |
| `apps/web/lib/registry/index.tsx` | 9/9 | **second complete list, hand-maintained** |
| `docs/registry/audit-2026-07-29.json` | 9/9 | third complete list — **to be deleted** with the drift apparatus |
| `.github/workflows/ci.yml` `test -f` | **3/9** | **stale** |
| `README.md` component table | **3/9** | **stale** |
| `check-registry-drift.mjs` per-item branches | **3/9 asserted** | **to be deleted** |
| `contract-test.mjs` item list | 9/9 | already dynamic — reads `registry.json` |
| `contract-test.mjs` npm install list | 5/5 declared deps | complete today, hardcoded |
| `build-registry.mjs` | 9/9 | already dynamic — reads `registry.json` |
| `build-sources.mjs` | 9/9 | already dynamic — reads the filesystem |
| `sources.generated.ts` | 9/9 | generated, checked in |
| `apps/web/public/r/*.json` | 9/9 | generated, checked in |
| `CATEGORY_LABELS` / `CATEGORY_DESCRIPTIONS` | 13 category ids | hand-maintained against `types.ts` |

Three of the four build scripts are already dynamic. The problem is narrower than "everything is
hardcoded" — and one item on the usual list of offenders is not actually one.

---

## The list that matters most

`apps/web/lib/registry/index.tsx` is a **second complete registry**, maintained by hand:

- `COMPONENT_REGISTRY` — 8 entries
- `BLOCK_REGISTRY` — 1 entry
- 18 hardcoded import statements
- 9 `SOURCES.*` lookups

It is keyed by short ids (`colored-badge`, `empty-state`) while `registry.json` is keyed by `ds-` names
(`ds-colored-badge`, `ds-block-empty-state`). **Nothing cross-validates the mapping between them.** An
item present in one and absent from the other, or mapped to the wrong id, produces a showcase that
renders the wrong component under the right name — or a published item with no showcase page.

This is the file publishing has to write into, and generating a registration into a hand-written file with
18 imports is the fragile case. Making it derived — from `registry.json` plus the filesystem, the way
`build-sources.mjs` already works — removes both the cross-validation gap and the generation problem at
once.

Two details a generator has to handle, both currently absorbed by the hand-written file:

- **The block's Demo is `EmptyStateBlockDemo`**, not `EmptyStateDemo`. The only item off-convention.
  Validator #4 enforces the convention going forward; the existing item needs renaming.
- **`CATEGORY_LABELS` and `CATEGORY_DESCRIPTIONS`** carry 13 ids against the 13 in
  `packages/registry/src/types.ts`. They currently agree, and nothing checks that they do.

---

## Confirmed stale

### `.github/workflows/ci.yml` — 3 of 9

```yaml
test -f apps/web/public/r/registry.json
test -f apps/web/public/r/ds-button.json
test -f apps/web/public/r/ds-icon-button.json
test -f apps/web/public/r/ds-colored-badge.json
```

Missing: `ds-breadcrumb`, `ds-empty`, `ds-tabs`, `ds-input`, `ds-textarea`, `ds-block-empty-state`.

The `registry validate` step in the same workflow *is* dynamic — the shadcn CLI reads `registry.json`, so
schema coverage is 9/9. Only the artifact-existence assertion under-checks. Replace the literal list with
a loop over `registry.json` items.

### `README.md` — 3 of 9

The component table lists `ds-button`, `ds-icon-button`, `ds-colored-badge`. Same six missing. There is no
block row and no blocks section.

The "Adding a component" section immediately below is also stale in a way that matters more, because it is
what a contributor follows:

- it says to edit `index.ts` — the actual file is `index.tsx`
- it says to "add the `fs.readFileSync` source in `sources.ts`" — `sources.ts` is now a 5-line re-export
  of `sources.generated.ts`, and sources are collected automatically by `build-sources.mjs`
- it omits the `registry.json` and `registry/base-nova/` steps entirely

Under decision 2 this section is superseded anyway: components are authored through the API, not the
filesystem. It should describe the API, or point at
[agent/README.md](../agent/README.md) and stop.

---

## Not stale, contrary to expectation

**`contract-test.mjs` already derives its item list dynamically.** It reads `registry.json` at line 50 and
loops `catalog.items`, copying each `files[].path` to its resolved `target`. Coverage is **9/9**.

What *is* hardcoded is the npm install list:

```
react@^19  react-dom@^19  @types/react@^19  @types/react-dom@^19
@base-ui/react@^1.6.0  class-variance-authority  clsx  tailwind-merge  lucide-react
typescript@^5
```

Five of those are toolchain. The other five are exactly the union of what the nine items declare — so the
list is **complete today**, not stale. It is a latent coupling: a new item declaring a new peer dependency
fails the contract test with a module-resolution error rather than a useful message.

The fix is to derive the install list from the union of `dependencies[]` across `registry.json` items, and
keep the toolchain entries literal. Small, and it converts a confusing failure into a correct pass.

Two incidental findings in the same file: `SOURCE_DIR` at line 21 is dead code, left from a version that
predated `registry.json`; and the `resolveTarget()` alias map handles `@ui/`, `@components/`, `@lib/`,
`@hooks/` and `@/`, of which only two are used.

---

## The drift apparatus, and why it goes

`apps/web/scripts/check-registry-drift.mjs` walks all 9 items from `registry.json`. Its *assertions* are
hardcoded per item:

| Check | Fires for |
|---|---|
| cva equivalence, when `workspace-source-path != null` | `ds-button`, `ds-colored-badge`, `ds-breadcrumb`, `ds-empty`, `ds-tabs` |
| `if (workspaceSrc && item.name === "ds-button")` | `ds-button` |
| `if (item.name === "ds-icon-button")` | `ds-icon-button` |
| `if (item.name === "ds-colored-badge")` | `ds-colored-badge` |

`ds-input`, `ds-textarea` and `ds-block-empty-state` have complete audit entries and hit **zero
assertions**. The loop prints the item name and passes.

`registry/CONTRIBUTING.md` states the script *"fails closed for un-audited items rather than silently
skipping them."* It fails closed on a missing **entry**, not a missing **check**. An entry with no matching
branch passes silently — which is how a real divergence in `ds-icon-button`'s base class string has been
sitting in a green build.

Deleted under decision 5, along with:

- `docs/registry/audit-2026-07-29.json` and `audit-2026-07-29.md`
- the `drift` job in `.github/workflows/ci.yml` (leaving five jobs after deletion)
- the drift sections of `registry/CONTRIBUTING.md` and `.claude/skills/add-block/SKILL.md`
- the `check-registry-drift` reference in root `CLAUDE.md`

**Status as of 2026-07-30:** none of the above has been deleted yet. The script, both audit files,
the `drift` CI job, the CONTRIBUTING drift section (`registry/CONTRIBUTING.md:89,93,131`), and the
`add-block` skill drift references (`.claude/skills/add-block/SKILL.md:119,177,213`) are all still
present. Deletion is bundled into the single-tree-collapse PR — running the script after the trees
merge would be a no-op or worse.

`docs/plans/2026-07-29-drift-detection.md` stays as the record of a design a later decision made
unnecessary. So does `docs/registry/audit-2026-07-29.md`'s finding about `ds-colored-badge`, which is the
one thing the apparatus actually caught — folded into
[02-single-tree.md](../02-single-tree.md) so it is not lost with the files.

---

## The blind spot no list covers

`registry/base-nova/**` is outside every workspace (`"workspaces": ["apps/*", "packages/*"]`) and outside
every tsconfig `include`. `turbo typecheck` runs `tsc --noEmit` per workspace, so **that tree is never
type-checked.**

`contract-test.mjs` is the only thing that type-checks those files, and it does so by copying them into a
scratch consumer project — which validates the consumer story and nothing else. That is why
`@/lib/utils` resolving to a file that does not exist has never surfaced.

Tolerable while the tree is a build artifact. **Not tolerable once decision 5 makes it the single source of
truth.** Either it joins a tsconfig `include`, or the contract test is consciously accepted as the sole
gate for it. Choosing by default is the failure mode.

---

## The principle

Every hand-maintained list in this repo either covers 9 of 9 or is stale. There is no middle state, and
there is no list that stayed current by attention.

The ones that are current are the ones that are **derived**: `contract-test.mjs`, `build-registry.mjs`,
`build-sources.mjs`, and the generated artifacts. The ones that drifted are the ones a human had to
remember. That pattern is the whole argument for decoupling — not that the current lists are wrong, but
that being right required someone to notice, and publishing is about to happen more often than someone
notices.
