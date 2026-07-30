---
title: Admin — the maintainer's surface
date: 2026-07-30
status: decisions locked
---

# Admin — `apps/studio`

**Constrained by:** decision 1 (the agent runs locally), decision 6 (one account, signup closed),
decision 2 (the database is the authoring surface).

`studio.deessejs.com`. One user, one session. Not a CMS — the maintainer does not author here.

---

## What the maintainer actually does

Under decision 2 the agent writes and the human reviews. That makes the maintainer's job **visual**,
and it means Studio has exactly four responsibilities:

1. **Look at the rendered draft.** The preview iframe is the primary surface, not a tab.
2. **Compare it to the previous version.** Both visually and as a source diff.
3. **Publish, or not.** One button that opens a PR.
4. **Read what the agent was told and what came back.** Validator failures, compile errors, the
   `errors[]` payload from the last save.

Everything else — creating items, editing source, setting categories — happens through the agent
contract. Studio has no editor. If it grew one, decision 2 would quietly stop being true and the
write-path validators would stop being the only gate.

---

## Surface

```
/                        item list — status, head version, published version, last save
/items/<name>            the review surface: preview iframe + metadata + validator state
/items/<name>/versions   version history, immutable rows, publish-from-here
/items/<name>/diff/<a>/<b>   source diff between two versions
/items/<name>/source     Shiki-highlighted source of a version
/publishes               open and merged publish PRs, with commit SHAs
```

The item detail page is the one that matters. It is the page the maintainer has open while the agent
iterates, and its refresh behaviour is the whole ergonomics of the system — see
[the live update path](#the-live-update-path) below.

---

## The review surface

Three panes, in priority order:

**The preview.** A sandboxed iframe pointed at `preview.deessejs.com/f/<versionId>`. Never
same-origin, never cookie-authenticated. The version id in the URL means the iframe swaps by changing
`src`, with no cache invalidation anywhere — that is what immutable version rows buy. Height is
negotiated over `postMessage`; both sides validate origin and shape. See
[preview/03-security.md](../preview/03-security.md).

**The metadata.** Title, description, category, variants, and the `manifest` — `dependencies[]`,
`registryDependencies[]`, `files[].target`. Read-only. Wrong metadata is an agent bug to be fixed
through the agent, not patched here.

**The validator state.** Which of the write-path validators passed, and the structured failures if any.
This is the same payload the agent received on its last `saveVersion`, rendered for a human. If the
agent is iterating unattended, this pane is how the maintainer sees it is stuck. See
[agent/01-validators.md](../agent/01-validators.md).

---

## Version history and diff

Version rows are immutable and numbered per item (`n`), so history is a list, not a graph. No
branches, no merges, no rebasing.

Three affordances:

- **Diff two versions.** Text diff over `source` and `demo_source`. `manifest` diffs as JSON.
- **Preview any version.** Every row has a permanently valid preview URL. Comparing v3 and v7 visually
  means opening two iframes, which works because neither URL ever goes stale.
- **Publish from any version.** Publishing sets `published_version_id`; it does not require the version
  to be `head`. Rollback is publishing an older row, and it goes through the same PR path as any other
  publish — no special case, no "revert" mechanism.

---

## The live update path

The maintainer has the item page open. The agent saves. The page has to notice.

`saveVersion` is a Server Action away from being able to use `updateTag(tag)`, which gives
read-your-writes semantics — the right primitive for "agent saves, maintainer immediately sees."
`revalidateTag(tag, profile)` takes two arguments in Next.js 16; the one-argument form is deprecated.
See [repo/03-nextjs-16.md](../repo/03-nextjs-16.md).

The complication is that the agent does not call a Server Action — it calls the oRPC mutation through
the CLI or MCP. So the write happens outside any React request scope, and cache revalidation has to be
triggered from the oRPC handler rather than from a Server Action. Practically this means the item page
polls or subscribes rather than relying on tag revalidation alone. Whichever way it lands, the
constraint is fixed: **the write originates from a non-browser client**, so the browser has to learn
about it by asking or by being pushed, not by having its cache invalidated in-band.

---

## Studio pages are dynamic by construction

Every page reads the session. Under `cacheComponents`, `"use cache"` cannot call `cookies()` or
`headers()` or read `searchParams` — values must be passed as arguments. Session-dependent pages are
therefore dynamic, and that is fine: there is one user.

This is also the reason Studio is a separate app rather than a `draftMode()` toggle on
`ui.deessejs.com`. Reading `cookies()` forces `Cache-Control: private, no-store`, with no first-party
way to opt back into public caching with `Vary`. Serving one route differently to the maintainer and to
the public would make it uncacheable **for everyone** — the public showcase would pay for the admin
surface. Two apps avoids the question entirely.

`draftMode()` itself is a cache-bypass shared secret, not authorization. Not used here.

---

## Routers

oRPC over Hono, lifted from `temp/saas-template` — see
[repo/04-template-reuse.md](../repo/04-template-reuse.md).

```
items.list          / items.get
versions.list       / versions.get / versions.diff
saveVersion         ← the write path; the agent's only mutation
publish             ← human-only; the machine token cannot reach it
previewToken.mint   ← human-only; mints a signed expiring preview URL
```

The split matters more than the shape. `saveVersion` is the only procedure the machine token can
reach; `publish` and `previewToken.mint` are session-only. See [01-auth.md](./01-auth.md).

The template's `authMiddleware` throws `ORPCError("UNAUTHORIZED")` and narrows the context to a
non-null user and session. The machine-token path needs a sibling middleware that narrows to a
*token* context instead — not a fake session, because a fake session would make the two paths
indistinguishable at the point where `publish` has to reject one of them.

Session is populated once per request in the Hono handler and read from context by the middleware, so
protected procedures do not each re-fetch it. That pattern comes from the template and is worth
keeping.

---

## What Studio deliberately does not have

- **An editor.** See above.
- **Roles or permissions.** One account. See [01-auth.md](./01-auth.md).
- **Agent orchestration.** Decision 1. The agent runs on the maintainer's machine; Studio never spawns
  one, never streams one, never queues one.
- **Its own component library.** Studio consumes the existing `packages/ui` (Base UI). The template's
  `packages/ui` is Radix and is not lifted.

## Organizational shape (one maintainer, today)

The design assumes a single human role: **the maintainer**. Decisions 1, 2, 6, and the machine-token
model all collapse to that assumption. This section makes the assumption explicit and names what has
to change when it stops holding.

### Today

| Concern | Owner |
|---|---|
| `apps/web` deploys | The maintainer, via Vercel. |
| Studio machine token | The maintainer, on their machine. |
| Database access (Neon) | The maintainer. |
| GitHub App credentials | The maintainer (env vars in the Studio deployment). |
| Publish PR review | The maintainer. No external reviewer, no approver. |
| On-call for incidents | The maintainer. |
| Schema migrations | The maintainer, manual `db:migrate` against Neon. |
| Validator rule updates | The maintainer, code review by themselves. |

### The "one person" cost

A singleton maintainer is the cheapest org shape but has three structural costs:

- **Bus factor of one.** If the maintainer is unavailable, no one can publish, no one can rotate the
  machine token, no one can fix an incident. Vacation, illness, or departure halts the system.
- **No review before deploy.** Decisions on validator changes, schema migrations, and Tailwind
  bumps are made and shipped by the same person. Validator #1 (token discipline) is meant to catch
  this for generated code; the validator code itself is not under that guard.
- **No second perspective on schema migrations.** `db:migrate` against production Postgres is a
  destructive operation with no roll-forward path. Review by another pair of eyes is the cheapest
  mitigation.

### When this stops holding

Triggers to re-derive the org-shape. Implementation is roughly one to two weeks of work; the
re-derivation is the hard part.

| Trigger | What changes |
|---|---|
| A second maintainer is added | `role` column on `user`, two machine tokens, write paths scoped by role. See [Studio org-shape trigger](../99-frictions-and-costs.md#studio-org-shape-trigger). |
| A contributor outside the maintainer pair wants publish access | Same as above, scoped to one role. The publish procedure must remain human-only. |
| The bus factor becomes uncomfortable | Add a co-maintainer with read access to Neon + Vercel + GitHub App. Do not split write authority until necessary. |
| An incident requires out-of-hours response | Define an on-call rotation. Today, "out of hours" means "wait for the maintainer to wake up." |

What does **not** change in any of these scenarios: the agent still runs locally, the database is
still the authoring surface, and the preview still has no session. Those three properties survive
the org-shape trigger unchanged.

### What the maintainer does *not* do alone

For completeness — things that are external to the system today and stay external:

- Marketing, design-system adoption, consumer support: out of scope of Studio.
- Vercel account management, domain registration: out of scope.
- GitHub repository settings, branch protection: out of scope.
- npm publish credentials (if the registry ever ships as an npm package rather than a JSON
  catalog): out of scope.
