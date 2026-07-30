---
title: Repo — what changes in the existing monorepo
date: 2026-07-30
status: decisions locked
---

# Repo changes

Work in the existing monorepo that has to land before Studio can exist. Not a schedule — a description of
what is currently true, what has to become true, and why.

**Measured against the repo:** 2026-07-30.

---

## Why the existing repo needs work at all

Studio changes one thing about this repo that changes the requirements for everything else:
**publishing goes from rare to frequent.**

Every hand-maintained list is fine at nine items published by a human who was in the room. At an item a
day, published by a generator, each one becomes a silent-failure surface — a list that under-checks and
reports green. Two are already stale, and the drift apparatus already reports green while asserting on a
third of the items.

The other three changes are prerequisites rather than consequences:

- **The single tree** — Studio stores one source; the repo currently holds two.
- **pnpm 11 + catalogs** — so the template's packages drop in unchanged.
- **An exact `tailwindcss` dependency** — nothing pins it today, and nothing owns it.

---

## Documents

| File | Covers |
|---|---|
| [01-decoupling.md](./01-decoupling.md) | Every hand-maintained item list, measured. What is stale, what is already dynamic, what gets deleted |
| [02-pnpm-and-versions.md](./02-pnpm-and-versions.md) | pnpm 11 + catalogs, Next 16.2.12, engines, the react version drift, pinning Tailwind |
| [03-nextjs-16.md](./03-nextjs-16.md) | `cacheComponents`, `"use cache"` constraints, cache limits, the traps that apply here |
| [04-template-reuse.md](./04-template-reuse.md) | What to lift from `temp/saas-template`, what not to, and what it does not contain |

The single-tree collapse is documented at [02-single-tree.md](../02-single-tree.md) rather than here,
because it is a cross-cutting fidelity guarantee that preview and publish both depend on — not just repo
hygiene.

---

## What blocks what

Three of these are independent and one is not.

**The single tree gates the data model.** `registry_item_version.source` is singular (decision 5). Storing
one source while the repo holds two divergent copies means the first publish has to pick one silently.
The per-item arbitration has to happen with a human reading both files — twice, for `icon-button` and
`colored-badge`, where the consumer copy is the degraded one.

**Decoupling gates publishing, not Studio.** Studio can be built against the current lists. The first
generated publish is where a hand-maintained aggregator with 18 hardcoded imports becomes a problem.

**pnpm gates the template lift.** The template is pnpm 11 with `catalogMode: strict`; lifting its packages
into npm workspaces means rewriting every `catalog:` reference. Migrating first is less work than
migrating later.

**Pinning Tailwind gates the preview.** Studio needs `tailwindcss` as a real, exact dependency — see
[preview/02-css-compile.md](../preview/02-css-compile.md#mitigations). Currently it is declared as `^4` in
`packages/ui` devDependencies and `apps/web` does not declare it at all.

---

## What does not change

Worth stating, because the surface area of this work invites scope creep.

- **`packages/ui` stays, on Base UI.** It is the showcase's own UI kit and Studio's. The template's Radix
  `packages/ui` is not lifted. See [04-template-reuse.md](./04-template-reuse.md).
- **The public install path stays static.** Decision 3. No database on the consumer path, ever.
- **The build chain ordering stays.** `npm run build -w @workspace/registry` before `next build`, because
  `apps/web` imports the registry through `dist/`. The pnpm migration has to preserve this, and it is the
  main thing that migration can break.
- **`apps/web` keeps its `?raw`-free source extraction.** `build-sources.mjs` codegen exists because
  `?raw` imports do not work in this Next.js + Turbopack + workspaces combination and `fs.readFileSync` is
  not available at runtime on Vercel. Both constraints still hold.
