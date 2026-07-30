---
title: Data model
date: 2026-07-30
status: decisions locked
---

# Data model

**Constrained by:** decision 2 (the database is the authoring surface), decision 5 (one tree),
decision 3 (publishing opens a PR).

The schema is small. The single load-bearing choice is that version rows are immutable.

---

## Tables

```
user, session, account, verification    -- Better Auth, seeded with one row, signup disabled

registry_item
  id, name (ds-*), kind (component|block), category,
  status (draft | published | archived),
  published_version_id, head_version_id,
  created_at, updated_at

registry_item_version                   -- IMMUTABLE, one row per agent save
  id, item_id, n,
  title, description, category, variants[],
  source        text,                   -- THE component (single tree, self-contained)
  demo_source   text,                   -- the showcase Demo, never shipped to consumers
  manifest      jsonb,                  -- dependencies[], registryDependencies[], files[].target
  compiled_js   text,                   -- sucrase output, cached
  compiled_css  text,                   -- Tailwind compile output, cached
  created_at, publish_commit_sha

audit_log
  action, entity, before, after, at
```

The Better Auth tables are **code-generated**, not hand-written — see
[repo/04-template-reuse.md](./repo/04-template-reuse.md#schema-is-generated). Adding the three tables
above means writing them alongside a generated file, not editing it.

---

## `source` is singular

Per decision 5 there is one source text per version, not a showcase copy and a consumer copy. The
file that would previously have lived at `registry/base-nova/ds-<name>/ds-<name>.tsx` is the whole
truth; the showcase renders that same text. [02-single-tree.md](./02-single-tree.md) covers what
"self-contained" has to mean for this to work, and the per-item arbitration that has to happen once
before it can.

`demo_source` stays a separate column because a `Demo` is never part of a registry item's `files[]` —
consumers do not receive demos. Keeping it in its own column means the publish step never has to
strip anything out of `source`, and the validator for "does a Demo exist" checks a column rather than
parsing exports.

---

## Immutability

**Version rows are never updated.** Every agent save inserts a new row and advances
`registry_item.head_version_id`. This is the highest-leverage decision in the model, and it pays for
itself four separate ways:

**Preview URLs become permanently cacheable.** `preview.deessejs.com/f/<versionId>` describes exactly
one byte-sequence forever. `cacheLife('max')` applies with no invalidation logic, and an entire class
of stale-preview bug never exists. Without immutability the preview needs cache busting on every
save, which is precisely the loop this system is trying to make fast.

**Compilation caches on the row.** `compiled_js` and `compiled_css` are computed once at save time
and read thereafter. See [preview/01-transpile-and-imports.md](./preview/01-transpile-and-imports.md)
and [preview/02-css-compile.md](./preview/02-css-compile.md).

**Diff and rollback come free.** Two version rows and a text diff. No history table, no soft-delete
column, no "restore" logic — publishing an older version is setting `published_version_id`.

**"What exactly did we publish" is answerable.** `publish_commit_sha` on the version row ties a stored
draft to a git commit. That link is the only thing connecting the database world to the static
registry world, and it survives because the row it is written on never changes.

The cost is row count. Sources are kilobytes and an agent iterating on one component might produce
dozens of versions; that is nothing against a Neon free tier. If pruning ever matters, archived items'
non-published versions are the safe thing to drop.

---

## `head_version_id` vs `published_version_id`

Two pointers on `registry_item`, and they answer different questions:

- `head_version_id` — what the agent last wrote. What the maintainer is looking at in Studio.
- `published_version_id` — what `ui.deessejs.com` and `/r/<name>.json` serve. `NULL` until the first
  successful publish.

They are independent. An item can be `published` with `head_version_id` pointing at a newer draft —
that is the normal state while a revision is in review. `status` describes the item's lifecycle, not
the relationship between the two pointers, which is why `status` cannot be derived from them.

Decision 8 reads `published_version_id`, never `head_version_id`, when resolving
`registryDependencies`. A block whose dependency has never been published has no version to resolve
against, and the preview says so rather than rendering something misleading. See
[publish/01-shadcn-registry.md](./publish/01-shadcn-registry.md#registrydependencies-resolve-to-published).

---

## `manifest`

`jsonb`, holding what `registry.json` needs per item: `dependencies[]`, `registryDependencies[]`, and
the `files[].target` value.

Storing this as a document rather than normalized tables is deliberate — it is the shadcn schema, it
is owned upstream, and it grows new optional fields on shadcn's release schedule rather than ours.
Normalizing it would mean a migration every time shadcn adds a field.

Two invariants on it are not free and must be enforced at write time:

- `dependencies[]` must match the bare-module imports actually present in `source`. Today this
  agreement holds across all nine items and is maintained by hand; post-decision-2 nothing maintains
  it. See [agent/01-validators.md](./agent/01-validators.md).
- `registryDependencies[]` must match the `@/components/ui/*` imports in `source`. Decision 8 makes
  this load-bearing: a missing entry becomes a preview render failure rather than a validation error.

---

## `audit_log`

`action, entity, before, after, at`. One writer, one reader, no roles — so this is not access control
forensics. Its job is narrower: reconstructing what an agent did across a burst of saves when
something looks wrong in the rendered output.

Publishes and status transitions are the entries that matter. Individual `saveVersion` calls are
already recoverable from the immutable version rows, so logging them is redundant.

---

## Category is a closed set

`packages/registry/src/types.ts` defines 13 category ids (7 component, 6 block). `category` on both
the item and the version row must be one of them. `apps/web/lib/registry/index.tsx` carries
hand-maintained `CATEGORY_LABELS` and `CATEGORY_DESCRIPTIONS` maps against those 13 ids — they
currently agree, and nothing checks that they do.

Once categories live in a database column, the closed set has to be enforced there too. This is
validator territory, not a schema constraint, because the source of truth for the list stays in
TypeScript — see [repo/01-decoupling.md](./repo/01-decoupling.md).
