---
name: project-studio-decisions
description: Nine locked decisions (2026-07-30) for the agent-authored draft/preview studio — DB as authoring surface, PR publishing, collapsed dual tree
metadata:
  type: project
---

Nine decisions locked on **2026-07-30** for the draft/preview/admin layer. Full reasoning, per-subsystem,
lives in `docs/reports/studio/` — start at its `README.md`. The original single-file report at
`docs/reports/2026-07-30-draft-preview-admin-architecture.md` is now a stub pointing there.

**Why this exists:** components in this repo are authored by **AI agents, not by hand**. The
maintainer is the reviewer. The friction being removed is having to open an editor, launch an
agent, and run `next dev` (~1 GB RAM) just to see whether a component looks right.

## The decisions

1. The agent runs **locally**. No server-side agent orchestration — Studio is an API + a preview surface.
2. The **database is the authoring surface**. The agent writes no files.
3. Publishing **opens a PR**. The public registry stays static JSON — no Postgres on the consumer install path.
4. The agent contract is **both a CLI and an MCP server** over one core library.
5. The **dual tree collapses into one** (see [[project-design-learnings]] — this reverses a locked decision).
   Arbitration is **per item**, not blanket: `icon-button` and `colored-badge` are the two where the
   consumer copy is the degraded one, so the workspace copy wins there.
6. **One account**, `emailAndPassword.disableSignUp: true`. No `admin()` plugin, no roles, no email.
7. Migrate the repo to **pnpm 11 + catalogs** (the saas-template's model).
8. `registryDependencies` **always resolve to the published version** — a draft block whose dependency is still a draft cannot preview.
9. CSS is **compiled server-side** per draft version, not by `@tailwindcss/browser`.

## Consequences that are easy to forget

- **Live rendering is the product, not a later phase.** If the agent writes and the human only
  reviews, the human's entire job is visual.
- **Write-path validators are the only gate.** With no PR between generated code and stored state,
  token discipline / import allow-list / self-containment / required `Demo` must be enforced in the
  oRPC mutation or they cease to exist.
- **Three origins are mandatory**, not stylistic: `ui.` (public), `studio.` (session), `preview.`
  (cookieless, runs untrusted code). Same-origin preview = session theft.
- **Tailwind's `compile()` is undocumented internal API.** Maintainers said so on record; the return
  field was renamed in a *minor* (4.1.0). Pin the exact version, contract-test the output, isolate
  behind one module.
- **Decision 8 imposes a sequence**: a new primitive must be published (PR + CI + redeploy, ~4 min)
  before a block using it can preview. Version pinning is the escape hatch if that becomes common.

**How to apply:** treat these as settled — do not re-derive or re-litigate them. Phase 0 (decoupling
the hardcoded item lists, deleting the drift apparatus, pnpm migration, Next → 16.2.12) is blocking
for everything else. Related: [[project-design-learnings]], [[feedback-registry-deps-coupling]].
