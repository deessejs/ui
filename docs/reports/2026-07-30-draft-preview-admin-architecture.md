---
title: Draft components, admin accounts, and live preview without redeploy
date: 2026-07-30
status: superseded — decomposed into ./studio/
---

# Superseded

This report has been decomposed into **[`./studio/`](./studio/)**, one document per subsystem.

It was a single 653-line document covering the data model, the agent contract, the preview renderer, the
publish path, the shadcn registry contract, the security model, and the changes needed in the existing
monorepo. That is seven subsystems, and keeping them in one file meant every reader loaded all of it to
answer one question.

**Start at [`./studio/README.md`](./studio/README.md)** — it carries the problem statement, the nine locked
decisions, the topology, and an index of the rest.

## Where each section went

| Was | Is now |
|---|---|
| §1 the problem, §2 locked decisions, §3.1 topology | [studio/README.md](./studio/README.md) |
| §3.2 data model | [studio/01-data-model.md](./studio/01-data-model.md) |
| §4, §9 the dual tree and the `ds-button` arbitration | [studio/02-single-tree.md](./studio/02-single-tree.md) |
| §3.3 the write loop, decision 4 | [studio/agent/README.md](./studio/agent/README.md), [cli](./studio/agent/02-cli.md), [mcp](./studio/agent/03-mcp.md) |
| §6 write-path validators | [studio/agent/01-validators.md](./studio/agent/01-validators.md) |
| §5.1–5.2 transpiling and imports | [studio/preview/01-transpile-and-imports.md](./studio/preview/01-transpile-and-imports.md) |
| §5.3, §7 Tailwind `compile()` | [studio/preview/02-css-compile.md](./studio/preview/02-css-compile.md) |
| §5.4 client boundaries | [studio/preview/README.md](./studio/preview/README.md) |
| §11 security model | [studio/preview/03-security.md](./studio/preview/03-security.md) |
| §3.4 the publish loop | [studio/publish/README.md](./studio/publish/README.md) |
| the shadcn registry contract | [studio/publish/01-shadcn-registry.md](./studio/publish/01-shadcn-registry.md) |
| decision 6, the admin surface | [studio/admin/README.md](./studio/admin/README.md), [auth](./studio/admin/01-auth.md) |
| §13 Phase 0 | [studio/repo/01-decoupling.md](./studio/repo/01-decoupling.md) |
| §8, §18 Next.js versions and CVEs, §10 migration deltas | [studio/repo/02-pnpm-and-versions.md](./studio/repo/02-pnpm-and-versions.md) |
| §12 Next.js 16 mechanics | [studio/repo/03-nextjs-16.md](./studio/repo/03-nextjs-16.md) |
| §10 template reuse | [studio/repo/04-template-reuse.md](./studio/repo/04-template-reuse.md) |
| §14 frictions, §15 costs, §17 unverified | [studio/99-frictions-and-costs.md](./studio/99-frictions-and-costs.md) |
| §16 sources | distributed — each document cites its own, with verification dates |

## What changed in the content

The decomposition is not a copy. Every factual claim was re-measured against the repo on 2026-07-30, and
several did not survive:

- **§4's arbitration was too broad.** "The showcase file is a re-export with no design content to lose"
  holds for 4 items of 9. Five carry real implementation, and for `input`, `textarea`, `colored-badge` and
  `icon-button` there is no `packages/ui` primitive to re-export at all. The arbitration is now per item,
  and for `icon-button` and `colored-badge` the workspace copy wins — the consumer copies are the degraded
  ones.
- **The drift apparatus was not guarding "one import specifier."** It asserts on 3 items of 9 and reports
  green, while a real divergence sits in `ds-icon-button`'s base class string.
- **§5.4's "all nine items begin with `use client`"** is true of the showcase tree and false of the shipped
  one, where it is 5 of 9.
- **§13's `contract-test.mjs` item list is already dynamic** (9/9). Only its npm install list is hardcoded,
  and that list is currently complete.
- **§8's claim that the v16.2.6 release page lists the CVE fix** was corrected — the fix is on the v16.2.5
  page; v16.2.6 is a Turbopack follow-up. The recommendation to move to 16.2.12 is unchanged. §18 of this
  report noted this but left §8 uncorrected.
- **The button cva has 8 sizes, not nine.**

`docs/plans/2026-07-29-shadcn-registry-adoption.md` carries an addendum reversing its dual-tree decision.
That addendum repeats the first two points above and needs the same correction.
