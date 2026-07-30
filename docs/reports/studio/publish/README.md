---
title: Publishing — from database to pull request
date: 2026-07-30
status: decisions locked
---

# Publishing

**Decision 3:** publishing **opens a PR**; the public registry stays static JSON.

The consequence of decision 2 is that the repo is not needed to *author* a component — which means the
repo has to be *written* when one is published. Publishing is a code-generation step.

---

## Why a PR and not a direct write

The public install path keeps zero runtime dependencies:

```
npx shadcn add https://ui.deessejs.com/r/ds-button.json
```

That resolves to a static JSON file on a CDN. **A database outage cannot break it.** No Postgres on the
consumer install path, no runtime rendering of registry items, no availability coupling between the
authoring system and the distribution system.

The PR also restores the one human checkpoint decision 2 removed. The agent writes drafts freely; nothing
reaches `main` without the maintainer opening it and CI passing. That is why the machine token cannot
reach `publish` — see [admin/01-auth.md](../admin/01-auth.md).

---

## The loop

```
publish(itemId, versionId)
  → validators re-run, hard fail
  → generate files
  → GitHub App: branch + commit + PR
  → existing CI: registry-validate, lint, typecheck, build-showcase, contract
  → merge → Vercel redeploy → live
  → webhook flips status, records commit SHA
```

**Validators re-run and hard-fail**, even though they ran at save time. The version row is immutable so
the source cannot have changed — but the *rules* can have. A validator added after a draft was written
must not let that draft through, and re-running is cheaper than tracking which validator version each row
was checked against.

---

## What gets generated

Post-collapse there is one source text (decision 5), so the generated files are not two copies of a
component — they are one component plus the showcase's wrapper around it.

| File | Content |
|---|---|
| `registry/base-nova/ds-<name>/ds-<name>.tsx` | `source`, verbatim. The single source of truth. |
| `packages/registry/src/<kind>/<id>/index.tsx` | the `Demo` from `demo_source`, plus a re-export of the source above |
| `packages/registry/src/<kind>/<id>/meta.ts` | `ComponentMeta` / `BlockMeta` — id, name, description, category, variants |
| `registry.json` | the item entry, from `manifest` |
| `apps/web/lib/registry/index.tsx` | registration in `COMPONENT_REGISTRY` or `BLOCK_REGISTRY` |
| `README.md` | the component table row |

The last two are the ones that make this harder than it looks.

### The aggregator is hand-maintained today

`apps/web/lib/registry/index.tsx` holds `COMPONENT_REGISTRY` (8 entries) and `BLOCK_REGISTRY` (1), with
**18 hardcoded import statements** and 9 `SOURCES.*` lookups. It is keyed by short ids (`colored-badge`)
while `registry.json` is keyed by `ds-` names (`ds-colored-badge`), and **nothing cross-validates the
mapping between them.**

Generating a registration into a hand-written file is fragile in a way generating a whole file is not. The
practical resolution is to make this file derived rather than authored — which is
[repo/01-decoupling.md](../repo/01-decoupling.md) work, and it has to land before publishing becomes
frequent, not after.

The block also breaks the naming convention every generator would assume: it exports
`EmptyStateBlockDemo`, not `EmptyStateDemo`. Validator #4 enforces the convention going forward
precisely so generated code does not have to know about exceptions. See
[agent/01-validators.md](../agent/01-validators.md#4-demo-present-and-correctly-named).

### Generated artifacts that are checked in

Two build outputs live in git so cold builds work:

- `apps/web/lib/registry/sources.generated.ts` — emitted by `build-sources.mjs`
- `apps/web/public/r/*.json` — emitted by `build-registry.mjs`

Both are downstream of the files above, and both are checked in. So the publish PR either includes them
(run the two scripts as part of generation) or CI regenerates and commits them. **Including them is
better**: it keeps the PR self-describing, and a reviewer can see the JSON a consumer will actually
install rather than trusting that a script will produce it.

Both scripts derive their item lists dynamically — `build-sources.mjs` reads the filesystem,
`build-registry.mjs` reads `registry.json` — so neither needs changing when an item is added. That is
already true today.

---

## The GitHub App

A GitHub App, not a personal access token. Scoped to one repository, with contents and pull-request write
permissions. Credentials live in Studio's environment (`GITHUB_APP_*`), never in the preview app.

One branch per publish, named from the item and version (`publish/ds-icon-button-v7`). One commit. The PR
body carries the version id, the diff summary against the currently published version, and a link to the
preview URL — the reviewer should be able to see the rendered result without checking anything out.

---

## CI on the PR

Five jobs, all of which exist today:

| Job | Question it answers |
|---|---|
| `registry-validate` | does `registry.json` satisfy the shadcn schema? |
| `lint` | — |
| `typecheck` | does `apps/web` compile? |
| `build-showcase` | does the full Next build succeed? |
| `contract` | **does this install and type-check in a real consumer project?** |

The sixth job, `drift`, is deleted — it compared the two trees that decision 5 collapses. See
[02-single-tree.md](../02-single-tree.md#what-gets-deleted).

`contract` is the one that cannot be replaced by write-path validation. `contract-test.mjs` copies the
generated files into a scratch project, installs real npm dependencies, and runs `tsc`. The write path
validates against an import map and a vendored dependency set; CI validates against npm. Different
questions, and CI's matches what a user experiences.

Its npm install list is hardcoded. All five dependencies the nine items declare are currently present, so
it is complete today — but a new item introducing a new peer dependency fails with a module-resolution
error rather than a useful message. See [repo/01-decoupling.md](../repo/01-decoupling.md).

Two stale assertions must be fixed before publishing gets frequent: the `test -f` list in `ci.yml`
asserts 3 of 9 item JSONs, and the README table lists 3 of 9. Both silently under-check as items are
added.

---

## After merge

Vercel redeploys `apps/web`. A webhook then:

- sets `registry_item.status = 'published'`
- sets `published_version_id` to the published version
- writes `publish_commit_sha` on the version row
- writes an `audit_log` entry

`publish_commit_sha` is the only link between the database world and the static registry world. It
survives because the row it is written on is immutable — see
[01-data-model.md](../01-data-model.md#immutability).

The status flip also makes the item resolvable as a `registryDependency` for other drafts, which is the
sequencing constraint decision 8 imposes. A block waiting on a primitive becomes previewable at this
moment and not before.

---

## Rollback

Publishing an older version. `published_version_id` moves, a new PR reverts the files, CI runs, merge
redeploys.

There is no separate revert mechanism, and there should not be — a rollback that skipped CI would be the
one publish path nobody tested.

---

## Failure modes

| Failure | Result |
|---|---|
| Validators fail on re-run | no branch, no PR; `errors[]` surfaced in Studio |
| GitHub API unavailable | publish fails cleanly; nothing partial. Retryable — the version row is unchanged |
| CI fails on the PR | PR stays open; item stays `draft`; nothing in the database moved |
| Merged but Vercel build fails | item is `published` in the database but not live. **The one genuinely bad state** |

That last row is worth designing around: the webhook fires on merge, not on successful deploy. Keying the
status flip to a deployment-success signal rather than a merge signal closes it, at the cost of another
integration.

---

## Sources

- https://ui.shadcn.com/docs/registry/registry-item-json — verified 2026-07-30
- https://ui.shadcn.com/docs/registry/authentication — for the deferred draft-install namespace
