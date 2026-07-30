---
title: pnpm, catalogs, and versions
date: 2026-07-30
status: decisions locked
---

# pnpm and versions

**Decision 7:** migrate the repo to **pnpm 11 + catalogs**, matching `temp/saas-template`, so its packages
drop in unchanged.

**Measured:** 2026-07-30.

---

## Current state vs template

| | `design/` | `temp/saas-template` | Target |
|---|---|---|---|
| Package manager | npm 10.9.4, `workspaces: ["apps/*","packages/*"]` | **pnpm 11.0.0, `catalogMode: strict`** | template |
| Next.js | 16.2.6 (declared and installed) | ^16.2.10 (catalog) | **16.2.12** |
| React | 19.2.4 declared exact everywhere | 19.2.7 exact (catalog) | reconcile — see below |
| TypeScript | `^5` | `^6.0.3` (catalog) | 6 |
| Node engines | `>=20` | `>=22.0.0` | **`>=22`** |
| Tailwind | `^4` in `packages/ui` devDeps only | — | **exact pin, owned** |

---

## Catalogs, and why `catalogMode: strict` is the point

The template declares every shared dependency once in `pnpm-workspace.yaml` under `catalog:`, and each
package references `"catalog:"` instead of a version range. `catalogMode: strict` makes that mandatory — a
package cannot declare its own version for a catalogued dependency.

That is the property worth having here. The current repo declares `react: "19.2.4"` in three places
(`apps/web`, `packages/ui`, `packages/registry`) and `lucide-react: "^1.27.0"` in two. They agree today
because someone kept them agreeing. A catalog makes agreement structural.

It also matters for the preview vendor bundles, which are built from "the exact versions the showcase
ships" — see
[preview/01-transpile-and-imports.md](../preview/01-transpile-and-imports.md#vendor-bundles). With a
catalog there is one answer to that question. Today there are several.

---

## The react drift to reconcile first

```
node_modules/react                    19.2.8   ← hoisted, not in the lockfile
apps/web/node_modules/react           19.2.4
packages/ui/node_modules/react        19.2.4
packages/registry/node_modules/react  19.2.4
package-lock.json                     19.2.4   ("19.2.8" appears zero times)
```

Every workspace declares `19.2.4` exact and resolves its own nested copy, so nothing is currently broken.
But the root tree holds a version the lockfile does not know about, which means **"the version the
showcase ships" has two answers right now.**

pnpm will surface this as a conflict rather than a silent hoist, which is the useful outcome. Reconcile it
deliberately before the migration rather than discovering it mid-install: decide on 19.2.4 or move to the
template's 19.2.7, put it in the catalog, and delete the stray.

---

## What the migration must not break

The build chain has a hard ordering:

```sh
npm run build -w @workspace/registry      # produces packages/registry/dist/
node apps/web/scripts/build-sources.mjs   # emits sources.generated.ts
node apps/web/scripts/build-registry.mjs  # emits public/r/<item>.json
cd apps/web && npm run build              # next build
```

Step 1 sits inside `apps/web`'s own `build` script (`npm run build -w @workspace/registry && next
build`, `apps/web/package.json`), not as a separate manual step. Steps 2–3 are chained through
`apps/web`'s `prebuild` (`node scripts/build-sources.mjs && node scripts/build-registry.mjs`). Step 1
runs first because `apps/web` imports the registry through `dist/`, so the workspace package must be
built before Next consumes it. The ordering is therefore `build-sources` → `build-registry` →
`@workspace/registry build` → `next build`, all on one `npm run build` invocation.

Three constraints that make this fragile under a package-manager change:

- **`@workspace/registry/*` must resolve via `dist/`.** A pnpm setup that resolves it to `src/` would work
  locally and fail on Vercel.
- **Vercel's auto-detected turbo scope is `web` only.** The registry build has to be triggered by the
  workspace tooling, not assumed.
- **`sources.generated.ts` is checked into git** so cold builds work without re-running prebuild. It has to
  stay checked in and stay current.

Validating the chain after migration is the actual acceptance test for decision 7 — not `pnpm install`
succeeding.

Two known constraints that pnpm's stricter resolution could expose, both already load-bearing:
`?raw` imports do not work in this Next.js + Turbopack + workspaces combination, and
`packages/registry/src/**` is not in the deployed bundle, so no `fs.readFileSync` at runtime. Both are why
`build-sources.mjs` exists.

---

## Next.js 16.2.12

Currently 16.2.6, declared and installed. `apps/web/next.config.ts` is seven lines and sets only
`transpilePackages: ["@workspace/ui", "@workspace/registry"]` — no `cacheComponents`, no
`experimental` block, no other config keys.

### CVE-2026-44576 — not affected

| Field | Value |
|---|---|
| CVE / GHSA | CVE-2026-44576 / GHSA-wfc6-r584-vfw7 |
| Severity | Moderate, CVSS 5.4, CWE-436 |
| Affected | `>= 14.2.0 < 15.5.16`, `>= 16.0.0 < 16.2.5` |
| Patched | 15.5.16, 16.2.5 |
| This repo | **16.2.6 — outside the affected range** |

The fix ships in **v16.2.5** (2026-05-06), alongside twelve sibling advisories, as a coordinated May 2026
bundle. **v16.2.6** (2026-05-07) is a Turbopack follow-up — six commits, all Turbopack backports and test
infrastructure, no security fixes. Both 16.2.5 and 16.2.6 are safe; 16.2.6 did not add anything 16.2.5
missed.

The attack requires a shared cache that does not partition on the RSC request header. The advisory does not
mention `cacheComponents`, and enabling it does not change exposure to this CVE.

### Two advisories that do matter before enabling Cache Components

**CVE-2026-44579 / GHSA-mg66-mrh9-m8jx** — High, 7.5. DoS via connection exhaustion **in Cache Components**
(request-body deadlock). Fixed in 16.2.5, so 16.2.6 already covers it. Relevant because Studio will enable
`cacheComponents`.

**CVE-2026-64647 / CVE-2026-64648** — Medium. Server-side `fetch` returning a cached body from a
*different* request to the same URL. Fixed in **16.2.11**. Directly relevant to a session-aware app: if
session data ever reaches a request body used by a cached server `fetch`, this is a cross-request leak.
Studio is session-aware by construction.

### The recommendation

Move `apps/web` from 16.2.6 to **16.2.12**. Not for CVE-2026-44576, which is already behind us, but for the
July 2026 bundle — nine CVEs including two SSRF and the `fetch` cache-confusion pair above.

`apps/studio` and `apps/preview` start on 16.2.12.

The advisory identifiers, severities and ranges here come from published advisories and release notes; they
were not independently reproduced. See
[99-frictions-and-costs.md](../99-frictions-and-costs.md#unverified-or-not-first-hand).

---

## Tailwind needs an owner and an exact pin

Current state: `tailwindcss` is declared as **`^4`** in `packages/ui` devDependencies. `apps/web` declares
only `@tailwindcss/postcss: ^4` and does not declare `tailwindcss` at all. Installed: **4.3.3**.

So nothing is pinned and no package owns it. Studio calls `compile()` — undocumented API whose return field
was renamed in a *minor* — and needs `tailwindcss` as a real, exact dependency.

```
"tailwindcss": "4.3.3"      // no caret
```

Tailwind Labs pins it this way internally: `@tailwindcss/node` and `@tailwindcss/postcss` both depend on
`"tailwindcss": "4.3.3"` with no range. Full reasoning and the accompanying contract test in
[preview/02-css-compile.md](../preview/02-css-compile.md#mitigations).

In a catalog world this is one entry, which is the right place for it — Studio, the preview app and
`packages/ui` must not be able to resolve different Tailwind versions.

---

## Node engines

Root `package.json` declares `>=20`. The template requires `>=22.0.0`, and this project's conventions
already assume Node 22+.

Bump to `>=22`. It is a one-line change that is easy to leave out of a migration and awkward to discover
later, when a contributor on Node 20 gets a failure from a template package rather than from an engine
check.

---

## Sources

- https://github.com/vercel/next.js/security/advisories/GHSA-wfc6-r584-vfw7 — 2026-05-06
- https://nvd.nist.gov/vuln/detail/CVE-2026-44576 — 2026-05-13, modified 2026-06-17
- https://github.com/vercel/next.js/releases/tag/v16.2.5 — 2026-05-06
- https://github.com/vercel/next.js/releases/tag/v16.2.6 — 2026-05-07
- https://github.com/vercel/next.js/compare/v16.2.5...v16.2.6 — six commits, no security fixes, fetched 2026-07-30
- https://github.com/vercel/next.js/releases/tag/v16.2.12 — 2026-07-25
- https://nextjs.org/blog/july-2026-security-release — 2026-07-20
- https://github.com/vercel/next.js/security/advisories/GHSA-mg66-mrh9-m8jx — Cache Components DoS
- https://github.com/vercel/next.js/issues/92040 — `@next/env` monorepo cache bug, fixed in 16.2.11
