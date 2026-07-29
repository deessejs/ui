---
title: Drift detection between consumer and showcase trees
date: 2026-07-29
status: draft
---

# Drift detection between consumer and showcase trees

**Date:** 2026-07-29
**Status:** Draft — design phase. Awaits confirmation on tolerance policy.

---

## Why this matters

Two trees carry (mostly) the same components:

- `registry/base-nova/ds-<id>/ds-<id>.tsx` — what the shadcn CLI ships to consumers
- `packages/registry/src/components/<id>/index.tsx` — what the showcase site at `ui.deessejs.com` renders

They were hand-written independently. Today they look aligned because both are fresh. Over six months of organic changes — fix a typo on one side, rename a class on the other, accept a dependency change in one tree only — the two paths diverge. The showcase then shows a button that is `bg-primary` while the consumer's installed copy is `bg-primary/90`. Visitors say "looks like the docs" but the install doesn't match. That erodes trust invisibly. A user who tries `ds-button` and gets a different visual than what they saw on the showcase will not file a bug — they'll silently move on.

The current defense is the [[2026-07-29-shadcn-registry-adoption]] plan's "duplication is accepted; drift is mitigated by PR review" line. That is not a real defense. PR review can't notice a class difference the reviewer didn't read on the other side.

## Three approaches considered

**(A) Drift detection script.** A `scripts/check-registry-drift.mjs` that diffs the two trees, applies a tolerance policy, and fails CI on unexpected divergence. Cheap to build, runs every push. Doesn't fix the divergence, just makes it loud.

**(B) Single source of truth.** Make the consumer tree the only authored one. The showcase tree gets auto-generated (probably an `index.tsx` shim that re-exports from a packaged form of the consumer source). Removes the duplication entirely. Expensive to retrofit: the showcase tree's `Demo` exports and `meta.ts` files have a different role that doesn't drop cleanly out of the consumer tree.

**(C) Compile-time guarantee by structural equivalence.** A type-level rule that constrains the showcase tree to "a wrapping re-export of the consumer tree". Doesn't catch behavioral divergence but enforces the layered relationship.

This plan recommends **(A) now, with a long-term path toward (B)**. Going straight to (B) is the cleaner end-state but has too many open questions about `Demo` and `meta.ts` to land in one PR. Drift detection gives us signal first; the elimination is a follow-up.

## Tolerance policy (proposed — needs confirmation)

The drift script should NOT fail on every textual difference. The showcase tree is allowed to legitimately differ in ways that don't affect what consumers receive:

| Behavior | Tolerance | Rationale |
| --- | --- | --- |
| **Exported symbols match** | Strict | The shape of the public API is what consumers see |
| **CVA variant strings** (`variant`, `size` keys and their class names) | Strict | Variants drive what consumers can render |
| **Class string tokens** (`"bg-primary"`, `"bg-primary/80"`, etc.) | Strict | A change here is a visual change |
| **Import statements** | Permissive in showcase, strict in consumer | Showcase can import from `@workspace/ui/components/button`; consumer must not import workspace paths |
| **Showcase tree classified as `category: showcase-shim`** | Permissive in source body | Today `packages/registry/src/components/<id>/index.tsx` is a re-export of `@workspace/ui/components/<id>` (`import { Button as ShadcnButton } from "@workspace/ui/components/button"`), not an implementation. Drift detection permits any content in showcase-shim files but requires the re-export target to resolve. If the showcase tree ever transitions to a structural duplicate, re-classify in `scripts/registry-drift.allowlist.json`. |
| **Comments** | Ignored | Documentation drift is not behavioral drift |
| **Whitespace** | Ignored | Formatting drift is not behavioral drift |
| **The `Demo` and showcase-only exports** | Allow-list | Showcase tree can have additional exports the consumer tree does not |

This is more nuanced than naive `diff -u`. A real implementation parses both `.tsx` files with a TS-aware AST extractor and compares structural properties rather than text. Phase 1 below produces the per-item classification that the tolerance rules will be applied against.

## Phase 1 — Audit current alignment

Before writing the script, capture what the existing two-tree footprint actually looks like for `ds-button`. This tells us what the tolerance policy should match.

Create `docs/registry/audit-2026-07-29.md` (private notes if preferred). For each item already shipped:

- Side-by-side source listing of both trees
- Manual identification of the differences
- Classification: structural (must match), behavioral (drift-prone), incidental (cosmetic)

Output: an empirical allow-list for the script in Phase 2. For each item already shipped, classify the showcase tree as one of:

- `category: showcase-shim` — showcase tree is a re-export of `@workspace/ui/components/<id>`. Permissive tolerance.
- `category: showcase-structural` — showcase tree is its own implementation, parallel to the consumer tree. Strict tolerance.

Today (July 2026), all three shipped items (`button`, `icon-button`, `colored-badge`) are `showcase-shim`. The classification is the audit's primary output and feeds the script's behavior in Phase 2.

Effort: 30 minutes.

## Phase 2 — `scripts/check-registry-drift.mjs`

A standalone Node script at `apps/web/scripts/check-registry-drift.mjs` (sibling of `build-registry.mjs` and `contract-test.mjs`).

Inputs:

- `registry/base-nova/<id>/<id>.tsx` (consumer)
- `packages/registry/src/components/<id>/index.tsx` (showcase, if it exists)
- An allow-list of permitted differences (loaded from `scripts/registry-drift.allowlist.json`)

Output:

- Exit code 0 if all items pass
- Exit code 1 with a structured JSON report on stderr if any drift detected, listing for each item: which checks failed, what the diff is, what classification it falls under

How to compare:

- Use TypeScript's compiler API to parse each file into an AST. Avoids the noise of text diff.
- Walk the AST: collect exported names, top-level `cva()` calls, their variant keys and class values, the literal class strings in JSX `className` props.
- Compare the two collections per item. Anything in the consumer tree should appear identically in the showcase tree (or fail).

Effort: half a day for someone comfortable with the TS compiler API. Earlier versions of the project used `ts-morph` which simplifies this — check if it's already in `node_modules` for free.

## Phase 3 — Wire into CI

Two options:

- **(3a)** Add a new job `drift` to `.github/workflows/ci.yml`, runs the script.
- **(3b)** Fold it into the existing `contract` job.

Recommend **(3a)** — separate job keeps failure attribution clear in the PR. Cost: one more `npm ci`, but parallel with the other jobs so wall time barely moves.

Phase 2 of the [[2026-07-29-trust-boundary]] plan marks `apps/web/scripts/` as owned. Drift script in that directory inherits the same CODEOWNERS protection.

Effort: 10 minutes.

## Phase 4 — Tolerate legitimate divergence, fail on suspicious

The first run after Phase 3 deployment will report every difference in the existing two trees. Two responses:

- **Real bug**: classify as strict, fix the show tree or the consumer tree, re-run.
- **Legitimate divergence**: classify as permissive, append to `scripts/registry-drift.allowlist.json` with a comment explaining why.

The allow-list should be human-reviewable: each entry has a comment, a date, an author. No "permit everything in this file" — too easy to abuse.

The TODO explicitly: do not normalize the existing two trees until drift detection is in place. Otherwise we discover divergence as a side effect of normalization and can't tell which divergence is pre-existing vs introduced.

## Phase 5 — Long-term: collapse the two trees

Once drift detection is stable and emitting a clean allow-list, reconsider collapsing.

Direction of collapse: **consumer tree → showcase tree**, not the other way. Because the consumer tree has stricter invariants (no workspace imports) and the showcase tree can loosen by adopting a thin re-export shim:

```ts
// packages/registry/src/components/<id>/index.tsx
import * as Consumer from "../../../../registry/base-nova/<id>/<id>.tsx"
export const Component = Consumer.DsButton
// ... existing app code keeps working
```

Limits and decisions taken upfront so Phase 5 has an end state:

- **`meta.ts` location:** stays under `packages/registry/src/components/<id>/meta.ts`. Not duplicated into the consumer tree. The consumer tree does not need a `ComponentMeta` (the showcase tree's aggregation system is the only consumer). Drift detection's per-item check continues to verify `meta.ts` matches the latest `registry.json` entry's `id`/`name`/`category`.
- **`Demo` function:** stays under `packages/registry/src/components/<id>/index.tsx` (showcase tree). Not duplicated into the consumer tree. The shadcn CLI does not execute `Demo`; it only ships the public API. After collapse, `Demo` lives in the showcase tree's re-export shim as a sibling export.
- **TypeScript `.tsx` direct import:** works in Next 16 + Turbopack but may need a `transpilePackages` config tweak. Validate with a sample PR before starting Phase 5 proper.
- **Public API:** the collapse must preserve every public name (`DsButton`, `buttonVariants`, type names) verbatim — drift detection still enforces this strict.

Effort: 1-2 days once drift detection is in place. Before starting, fix any pending question about where `buttonVariants`, `DsButtonProps`, etc. live — they stay in the consumer tree under their original names.

## What this plan does NOT do

- It does not enforce **visual** parity (a class string can match while a token's value changes in the consumer's tailwind config). That requires visual regression testing, which is a much heavier investment.
- It does not generate the showcase tree from the consumer tree in this phase. Phase 5 is the long-term direction; not implemented in this plan.
- It does not detect drift inside a single tree (e.g., a single `ds-button.tsx` that uses different class names for the same visual variant in two branches). That's a separate concern.

## Verification

| Phase | Verified by |
| --- | --- |
| 1 | Audit doc exists with side-by-side for all shipped items |
| 2 | Script runs locally, exits 0 against current tree |
| 3 | CI fails on a deliberately introduced divergence (test PR) |
| 4 | Allow-list populated only with documented exceptions; explicit-comment requirement enforced |
| 5 | TBD once Phase 4 stable |

## Cross-references

- [[2026-07-29-trust-boundary]] — `scripts/check-registry-drift.mjs` lives under `apps/web/scripts/` which is in the `CODEOWNERS` trust zone.
- [[2026-07-29-shadcn-registry-adoption]] — Risks section already names drift as a known gap. This plan is the implementation.
