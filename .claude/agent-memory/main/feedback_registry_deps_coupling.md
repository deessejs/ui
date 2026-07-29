---
name: feedback-registry-deps-coupling
description: Adding a new registry item with a new peer dep requires updating contract-test.mjs install list in lockstep — refactor target is to derive deps from registry.json
metadata:
  type: feedback
---

When adding a new registry item whose `dependencies[]` introduces a peer dep the contract test hasn't installed, the CI `contract` job fails with TypeScript resolution errors (`Cannot find module 'X'`). Fix: add the new dep to the hardcoded install list in `apps/web/scripts/contract-test.mjs`.

**Why:** during the 3→8 catalog expansion in this session, `ds-breadcrumb` introduced `lucide-react` (for `ChevronRightIcon` and `MoreHorizontalIcon`). The contract test passed locally because `lucide-react` happened to be present in the workspace `node_modules` from another package, but CI on a clean checkout failed. Cost: one fix-commit (`17d5f3d`) + one CI re-run.

**How to apply:**
- Short term: when adding any registry item, audit its `dependencies[]` against the install list in `apps/web/scripts/contract-test.mjs` (lines ~84-99) and add any new ones before pushing.
- Long term: refactor `contract-test.mjs` to read `registry.json`, aggregate the union of `dependencies[]` across all items, and install that. Single source of truth = the catalog. Removes the coupling entirely.

The drift script (`check-registry-drift.mjs`) has the same shape of coupling to `registry.json` but in the opposite direction (reads, doesn't install) — that one is fine as-is.

Related: [[project-design-learnings]], [[project-phase4-validated]].
