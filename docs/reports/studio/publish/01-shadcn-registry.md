---
title: The shadcn registry contract
date: 2026-07-30
status: decisions locked
---

# The shadcn registry contract

What `ui.deessejs.com` distributes, and the rules the publish step has to satisfy. This is the boundary
where the Studio world ends and the public artifact begins.

**Measured against the repo:** 2026-07-30, all 9 items.

---

## The public surface

```
https://ui.deessejs.com/r/registry.json      the catalog
https://ui.deessejs.com/r/ds-button.json     one item, self-contained
```

Static files, emitted at build time by `apps/web/scripts/build-registry.mjs` from the root
`registry.json`, checked into `apps/web/public/r/`. No database, no server rendering, no auth.

Validated end-to-end on 2026-07-29: an external project installed from the deployed registry and
type-checked. The install path works and is not theoretical.

---

## Item shape

```json
{
  "name": "ds-icon-button",
  "type": "registry:ui",
  "title": "Icon Button",
  "description": "A square button that contains only an icon.",
  "dependencies": ["@base-ui/react@^1.6.0", "class-variance-authority", "clsx", "tailwind-merge"],
  "files": [
    {
      "path": "registry/base-nova/ds-icon-button/ds-icon-button.tsx",
      "type": "registry:ui",
      "target": "@ui/ds-icon-button.tsx"
    }
  ]
}
```

Current inventory: **8 `registry:ui` + 1 `registry:block`.** `path` is always
`registry/base-nova/<name>/<name>.tsx` — one file per item, which is what "self-contained" buys.

`manifest` on the version row holds exactly the fields above that vary per item, so generating this entry
is a projection rather than a transformation. See [01-data-model.md](../01-data-model.md#manifest).

---

## Dependencies, as actually declared

| Dependency | Items |
|---|---|
| `clsx`, `tailwind-merge` | all 9 |
| `@base-ui/react@^1.6.0` | `ds-button`, `ds-icon-button`, `ds-breadcrumb`, `ds-tabs` |
| `class-variance-authority` | `ds-button`, `ds-icon-button`, `ds-empty`, `ds-tabs` |
| `lucide-react` | `ds-breadcrumb` |

Cross-checked against the bare-module imports in all nine source files: **they match exactly**, no
under- or over-declaration. That agreement is maintained by hand today and becomes validator #7's job
under decision 2 — see [agent/01-validators.md](../agent/01-validators.md#7-manifest-agreement).

Note `@base-ui/react` carries an explicit range and the others do not. Deliberate: Base UI is the one
dependency where a major shift would change component behaviour, so the constraint is stated. The
utility packages are stable and unpinned on purpose.

---

## Targets and aliases

`target` uses shadcn's placeholder aliases, never a bare path. The consumer's `components.json` decides
where they land.

| Alias | Resolves to |
|---|---|
| `@ui/` | the consumer's UI component directory |
| `@components/` | the consumer's component directory |
| `@lib/`, `@hooks/` | supported by the contract test's resolver, unused today |
| `@/` | the consumer's source root |

Eight items target `@ui/<name>.tsx`. The block targets `@/components/empty-state.tsx`.

Two inconsistencies in the block's entry, both cosmetic today and both the kind of thing a generator
would propagate:

- its `files[0].type` is `registry:component`, while the item's `type` is `registry:block`
- its target filename is `empty-state.tsx` while the exported symbol is `DsEmptyState` — every other item
  matches file name to symbol

Validator #5 covers the alias requirement. The type and naming consistency are worth folding into it.

---

## `registryDependencies` resolve to published

**Decision 8.** `registryDependencies` name other registry items, and they always resolve to the
**published** version — never to a draft.

One array exists in the whole repo:

```json
"registryDependencies": ["ds-empty", "ds-button", "ds-colored-badge"]
```

on `ds-block-empty-state`. Its source imports `@/components/ui/ds-empty`, `ds-button` and
`ds-colored-badge`, so the declaration and the imports agree — again, by hand.

Three consequences, in increasing order of how easy they are to forget:

**On the consumer side**, `shadcn add ds-block-empty-state` installs four files. The public JSON has to
be complete or the install produces a component importing files that are not there.

**In the preview**, `@/components/ui/*` resolves through the import map to published items only. A draft
block whose primitive is still a draft cannot render — Studio reports `UNPUBLISHED_DEPENDENCY`, saves the
draft anyway, and says which item needs publishing first. See
[preview/01-transpile-and-imports.md](../preview/01-transpile-and-imports.md#componentsui-resolves-to-published-items-only).

**In sequencing**, a new primitive must be published before a block using it can preview. PR, CI, merge,
redeploy — roughly four minutes. This partially reintroduces the wait the system exists to remove, on
that one case. Version pinning is the escape hatch if it becomes common;
[99-frictions-and-costs.md](../99-frictions-and-costs.md) covers the trade.

---

## Self-containment is a distribution requirement

A published file may import:

- npm packages declared in `dependencies[]`
- `@/lib/utils` for `cn`
- `@/components/ui/ds-*` for declared `registryDependencies`

Nothing else. In particular **no `@workspace/*`** — a consumer has no workspace. Validator #3 enforces
this, and post-collapse it stops being a convention and becomes the definition of the stored source. See
[02-single-tree.md](../02-single-tree.md).

The `@/lib/utils` allowance is what makes the single tree possible at all: it is the one specifier that
resolves in the showcase, in the preview, and in a consumer project, each to a different file with the
same export. That identity is the fidelity guarantee.

---

## Known shadcn CLI constraints

**The monorepo surface has open bugs** (#9239, #11002 and related, 2026). The defense is that authored
sources ship as-is: no runtime transform of workspace imports, no reliance on the CLI rewriting anything.
Self-containment is not only a distribution rule, it is what keeps the CLI's monorepo handling out of the
path.

**The schema grows.** Registry `include` and `validate` landed in May 2026, and shadcn adds optional
fields on its own schedule. `manifest` is stored as `jsonb` rather than normalized columns for exactly
this reason — a new optional field should not be a database migration.

**`registry-validate` in CI validates the schema, not the semantics.** It runs the shadcn CLI against
`registry.json`, so it covers all 9 items dynamically and catches shape errors. It cannot catch a target
pointing at the wrong place, or `dependencies[]` disagreeing with the imports — those are validator
territory.

---

## What the public registry deliberately does not have

- **A database.** Decision 3. A Postgres outage cannot break a consumer install.
- **Authenticated items.** Deferred: a `@deessejs-draft` namespace with a Bearer token would let a draft
  install into a real consumer project. shadcn supports registry authentication; the reason to defer is
  that the PR path already answers the question this would answer, more slowly and more safely.
- **Drafts, in any form.** They live on a different origin with different credentials. Structurally, not
  by policy — see [preview/03-security.md](../preview/03-security.md).

---

## Sources

- https://ui.shadcn.com/docs/registry/registry-item-json — verified 2026-07-30
- https://ui.shadcn.com/docs/registry/authentication — verified 2026-07-30
- https://ui.shadcn.com/docs/changelog/2026-05-registry-include — 2026-05
- `docs/plans/2026-07-29-shadcn-registry-adoption.md` — the locked adoption decisions and the CLI bug list
