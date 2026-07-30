---
title: Studio — draft authoring, live preview, and publishing
date: 2026-07-30
status: decisions locked
---

# Studio

The system that lets an AI agent author a registry component into a database, renders it live for
the maintainer without a dev server, and publishes it through a pull request.

**Verified against the repo:** 2026-07-30
**Current at time of writing:** `next@16.2.6`, `tailwindcss@4.3.3`, `@base-ui/react@1.6.0`, npm 10.9.4
workspaces, 9 registry items (8 components + 1 block)

---

## The problem

Components in this repo are authored by **AI agents**, not by hand. The maintainer is the reviewer,
not the developer. The friction being removed is the ritual: open the editor, launch the agent,
explain the task, run `next dev` — which costs ~1 GB of RAM and a large share of attention — just to
see whether a component looks right.

The target loop: the agent iterates against an API, the maintainer watches the result render live,
neither needs a dev server running.

Two consequences follow, and they shape every document in this folder.

**Live rendering is not a deferrable phase — it is the product.** If the agent writes and the human
only reviews, the human's entire job is visual. A system that stores drafts but cannot render them
delivers nothing.

**The safety net is gone.** With the agent writing straight to the database, there is no PR review
between generated code and stored state. Every rule this project enforces — semantic tokens, no
`dark:` variants, no raw palette, required `Demo` export — moves to the write path or ceases to
exist. See [agent/01-validators.md](./agent/01-validators.md).

---

## The nine decisions

| # | Decision | What it forecloses |
|---|---|---|
| 1 | The agent runs **locally**; no server-side agent orchestration | No Agent SDK, no job queue, no streaming. Studio is an API plus a preview surface. |
| 2 | The **database is the authoring surface** — the agent writes no files | The repo is not needed to create a component. Publishing must therefore generate files. |
| 3 | Publishing **opens a PR**; the public registry stays static JSON | No Postgres on the consumer install path. All six CI jobs survive. |
| 4 | The agent talks to the API through **both a CLI and an MCP server** | One core library, two façades. Neither may hold logic the other lacks. |
| 5 | The **dual tree collapses into one** | The drift apparatus is deleted. Arbitration happens per item, not once. |
| 6 | **One account**, signup closed | `emailAndPassword.disableSignUp: true`. No `admin()` plugin, no roles, no email, no Resend. |
| 7 | Migrate the repo to **pnpm 11 + catalogs** | Template packages drop in unchanged; npm workspaces go away. |
| 8 | `registryDependencies` **always resolve to the published version** | A draft block whose dependency is still a draft cannot preview. Sequential by design. |
| 9 | CSS is compiled **server-side** per draft version | `@tailwindcss/browser` is disqualified — it cannot express per-draft isolation. |

Decision 5 overrides a decision locked in
[`docs/plans/2026-07-29-shadcn-registry-adoption.md`](../../plans/2026-07-29-shadcn-registry-adoption.md);
that plan carries a dated addendum explaining why.

---

## Topology

```
ui.deessejs.com        apps/web       public showcase + static /r/*.json   published only, no DB
studio.deessejs.com    apps/studio    single session, signup closed        drafts, versions, publish  ← to build
preview.deessejs.com   apps/preview   NO cookies, NO session               compiled modules + CSS + frame  ← to build
```

**Status as of 2026-07-30:** only `apps/web` exists today. `apps/studio` and `apps/preview` are
forward-looking — they are the shape the design lands in, not the state of the repo.

Three separate Vercel projects. The split is forced by two independent constraints that happen to
converge on the same answer:

1. **Security.** Untrusted TSX must not execute on the same origin as the authenticated session, or
   it can read `document.cookie` and call the API as the maintainer.
2. **"Not in production."** A separate domain makes it structurally impossible for a draft to
   surface on `ui.deessejs.com`.

Either constraint alone would justify the split. See [preview/03-security.md](./preview/03-security.md).

---

## Documents

### Cross-cutting

| File | Covers |
|---|---|
| [01-data-model.md](./01-data-model.md) | Tables, immutable versions, what immutability buys, `audit_log` |
| [02-single-tree.md](./02-single-tree.md) | Collapsing the dual tree — per-item arbitration, what actually diverges |
| [99-frictions-and-costs.md](./99-frictions-and-costs.md) | Known limits, what the design gives up, costs, still-unverified claims |

### `admin/` — the maintainer's surface

| File | Covers |
|---|---|
| [admin/README.md](./admin/README.md) | `apps/studio`: pages, review surface, version history, what the maintainer does |
| [admin/01-auth.md](./admin/01-auth.md) | One account, closed signup, the machine token, why no roles |

### `agent/` — the write path

| File | Covers |
|---|---|
| [agent/README.md](./agent/README.md) | The contract: core library, `saveVersion`, the `errors[]` return |
| [agent/01-validators.md](./agent/01-validators.md) | The write-path gate — the only enforcement left |
| [agent/02-cli.md](./agent/02-cli.md) | The CLI façade: commands, exit codes, the debuggable surface |
| [agent/03-mcp.md](./agent/03-mcp.md) | The MCP façade: tools, schemas as the contract |

### `preview/` — rendering untrusted code

| File | Covers |
|---|---|
| [preview/README.md](./preview/README.md) | `apps/preview`: routes, the frame, client boundaries, fidelity limits |
| [preview/01-transpile-and-imports.md](./preview/01-transpile-and-imports.md) | sucrase, the import map as allow-list, vendor bundles |
| [preview/02-css-compile.md](./preview/02-css-compile.md) | Tailwind's `compile()`, why it is internal API, pin + contract test |
| [preview/03-security.md](./preview/03-security.md) | Three origins, sandbox flags, CSP, signed URLs, `postMessage` |

### `publish/` — leaving the database

| File | Covers |
|---|---|
| [publish/README.md](./publish/README.md) | File generation, GitHub App, PR, CI, the webhook that flips status |
| [publish/01-shadcn-registry.md](./publish/01-shadcn-registry.md) | `registry.json`, targets and aliases, `registryDependencies`, the consumer install path |

### `repo/` — what changes in the existing monorepo

| File | Covers |
|---|---|
| [repo/README.md](./repo/README.md) | The blocking work, and why publishing frequency changes the requirements |
| [repo/01-decoupling.md](./repo/01-decoupling.md) | Every hand-maintained item list, measured; what gets deleted |
| [repo/02-pnpm-and-versions.md](./repo/02-pnpm-and-versions.md) | pnpm 11 + catalogs, Next 16.2.12, engines, the react version drift |
| [repo/03-nextjs-16.md](./repo/03-nextjs-16.md) | `cacheComponents`, `"use cache"` constraints, cache limits, traps |
| [repo/04-template-reuse.md](./repo/04-template-reuse.md) | What to lift from `temp/saas-template`, what not to, and the deltas |

---

## Reading order

If you are new to this: **README → 01-data-model → agent/README → agent/01-validators →
preview/README**. That path covers the write loop end to end.

If you are about to touch the existing repo: **02-single-tree → repo/01-decoupling** first. Those two
describe work that must land before anything else, and both correct assumptions that look safe.

If you are evaluating the risk: **preview/02-css-compile → 99-frictions-and-costs**. The Tailwind
dependency is the one place this design rests on undocumented API.

---

## What is settled and what is not

**Settled:** the nine decisions above. They are not re-derived in these documents; each file states
which decisions constrain it and moves on.

**Not settled, deliberately deferred (with triggers):** authenticated draft install, version pinning
for `registryDependencies`, Vercel Sandbox for drafts needing new npm deps, rate limiting on the
machine token, and a second account with roles. Each item carries an explicit trigger in
[99-frictions-and-costs.md](./99-frictions-and-costs.md#deferred-deliberately) — "deferred, with a
trigger" rather than "deferred forever."

## Cost model, in numbers

The full maintenance model and incident-rate estimates are in
[99-frictions-and-costs.md](./99-frictions-and-costs.md#maintenance-quantified). The headline figures
worth keeping in mind when reading this folder:

- **~20–35 hours/month** of maintenance work for one part-time maintainer. Roughly half a person-day
  per week, mostly driven by Tailwind `compile()` break handling, validator updates as new failure
  modes surface, and the `temp/saas-template` re-sync.
- **~1–4 incidents/year** expected across all classes combined. Tailwind `compile()` renames are the
  most likely to land; validator false negatives are the most likely to be silent.
- **Three deployables** (apps/web, apps/studio, apps/preview) means three Next.js upgrade cycles per
  quarter. This is the line item that does not shrink with maintenance discipline.

## What "success" looks like, and the second-order effects

The system is built around the assumption of frequent publishing. "Frequent" is not defined; the
shape of success is what matters.

**Working assumption:** roughly 1 published component per week, sustained, with bursts of 3–5 during
block composition. Below that cadence, the existing manual workflow was viable. Above it, the
system exists.

**Second-order effects at that cadence:**

| Effect | Manifestation | What to watch |
|---|---|---|
| Database row growth | Version rows for each agent iteration. 5–20 versions per published item is normal. After 6 months at 1/week: ~500 version rows, kilobytes each. Negligible on Neon free tier. | Total row count, archived-item version count |
| `audit_log` becomes load-bearing | Multiple `saveVersion` calls per session, diff-able only via audit_log when versions are deleted. | Read patterns on `audit_log` |
| Contract-test runtime | `contract-test.mjs` runs on every PR. At 1 PR/week: ~10 min CI time. At 5/week: still fine. At 20/week: noticeable. | CI wall-clock time on the `contract` job |
| Agent iteration quality | The agent improves over time. Validators 1–8 are calibrated for today's failure modes; new modes appear and the validators must follow. | Number of validator updates per quarter |
| Drift between Showcase and Preview | Two rendering paths execute the same bytes through different toolchains. The longer the system runs without an explicit drift check, the more likely they diverge silently. | Number of "renders correctly in preview, fails in showcase" reports |
| Hand-maintained aggregator fragility | `apps/web/lib/registry/index.tsx` has 18 hardcoded imports. At 1/week it survives; at 3/week it strains; at 5/week the per-add friction starts to dominate. | Time to author a new component end-to-end |

None of these is a failure mode that should trigger panic today. They are the things that, if
ignored for 12 months, become the next architecture problem.

## The property to preserve under change

The whole design rests on one invariant, and the documentation assumes it without restating it:

> **Generated code never executes on an origin that has the maintainer's session.**

Any change that introduces a session, cookie, or database credential on `preview.deessejs.com`
invalidates [preview/03-security.md](./preview/03-security.md) and the three-origin split. Any change
that introduces server-side storage of unpublished drafts on `ui.deessejs.com` invalidates decision
3 and the publish-via-PR model. Both are recoverable, but neither is local — they would re-derive
roughly half of this folder.
