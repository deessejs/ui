---
title: Frictions, costs, and unverified claims
date: 2026-07-30
status: decisions locked
---

# Frictions, costs, and unverified claims

What this design gives up, what it costs, and which of its supporting claims are not first-hand.

---

## Frictions accepted

### Decision 8 reintroduces a wait, on one case

If the agent creates a primitive *and* a block that uses it, the primitive must be published — PR, CI,
merge, redeploy, roughly four minutes — before the block can preview. `registryDependencies` resolve
to the published version, always, so a draft dependency has nothing to resolve against.

This partially reintroduces the wait the whole system exists to remove. It is accepted because the
alternative is a resolution mode where a preview renders against draft dependencies that later change
underneath it, and "the preview lied" is a worse failure than "the preview refused."

The escape hatch, if this turns out to be the common case rather than the rare one, is version pinning
for `registryDependencies` — deferred, not rejected. See
[publish/01-shadcn-registry.md](./publish/01-shadcn-registry.md#registrydependencies-resolve-to-published).

### Preview fidelity is high, not perfect

Three gaps, none closable within this design:

- **Client-only mount.** No RSC inside the iframe, so server-component behaviour is unverifiable
  there. Fine for `ds-*` primitives; a future server-rendered block has to route through the PR path.
- **Runtime-compiled CSS.** Compiled by Tailwind's `compile()` with an explicit candidate list, not by
  the PostCSS pipeline the real build uses. Same compiler, different entry point.
- **Vendored dependency bundles.** `/v/*` is built from the versions the showcase declares, pinned at
  the preview app's build time. A consumer on a different minor gets different bytes.

CI remains the source of truth for "does this compile in a consumer project." The Studio UI should say
so rather than implying the preview is authoritative.

### The Tailwind dependency is undocumented API

`compile()` is not public API, has already broken in a minor release, and Tailwind maintainers have
declined on record to stabilise it. Pinned to an exact version, contract-tested, and isolated behind
one module — but the mitigation is **detection, not prevention**. An upgrade can break the preview, and
the design accepts that in exchange for per-draft CSS isolation being possible at all. Full reasoning
in [preview/02-css-compile.md](./preview/02-css-compile.md).

### A second rendering path that can diverge from the real build

The showcase renders through Next.js and PostCSS. The preview renders through sucrase, an import map,
and `compile()`. They can drift, and nothing detects it automatically. The single-tree collapse closes
the *source* half of this gap — both paths execute the same text — but not the *toolchain* half.

### Publishing is now a code-generation step

Decision 2 means the repo is not needed to author a component, which means the repo has to be
*written* on publish. Generated files land in a PR, so a human still sees them, but the file layout,
the `registry.json` entry shape, and the aggregator registration all become code that has to stay
correct as the repo evolves. See [publish/README.md](./publish/README.md).

---

## Costs

| Item | Cost |
|---|---|
| Postgres | Neon or Vercel free tier is ample. Sources are kilobytes; version rows are the only growth. |
| Two extra Vercel projects | Both low traffic. `preview` serves cached immutable artifacts. |
| Runtime Cache | Free within the 2 MB per item / 128 tag envelope. See [repo/03-nextjs-16.md](./repo/03-nextjs-16.md). |
| Vercel Sandbox | $0 — not used until the deferred "drafts needing new npm deps" case. |
| GitHub App | Free. |

### Maintenance, quantified

The dollar cost table is the cheap part. The real cost is maintenance hours and incident probability.
The figures below are estimates, not measurements — replace with measured numbers after the first six
months in production.

| Surface | Estimated hours/month | Notes |
|---|---|---|
| Schema migrations (`registry_item*`, `audit_log`) | 2–4 h | Triggered by shadcn schema additions and decisions made under decision 2. Quarterly cadence expected. |
| Validator updates | 4–8 h | New anti-slop rules land as the agent's failure modes surface. Validators 1–8 are not a closed set. |
| Tailwind `compile()` break handling | 4–16 h/year | Per the [exit path](#tailwind-exit-path) below, every minor-version bump needs the contract test re-run and probably a code patch. |
| Template re-sync | 4–8 h/quarter | `temp/saas-template` is the upstream for `packages/{auth,api,database,env}`. New commits there become PRs here. |
| Drift between Showcase and Preview rendering paths | 2–4 h/month | Manual diff when the second-rendering-path trap surfaces — see [below](#second-rendering-path-drift-handling). |
| `apps/studio` / `apps/preview` dependency bumps | 2–4 h/month | Two extra Vercel projects means two extra Next.js upgrade cycles per quarter. |
| On-call rotation burden | 0–2 h/quarter | Expected to be near zero unless the tail of decisions (rate limiting absent, public preview URLs) becomes an incident. |

**Total estimated maintenance:** roughly **20–35 hours per month** for one maintainer working
part-time. This is roughly half a person-day per week. It is the line item that has to fit inside the
maintainer's calendar, not the dollar amounts above.

### Expected incident frequency

| Incident class | Expected/year | Recovery time |
|---|---|---|
| Tailwind minor-version `compile()` rename | 1–2 | 1–4 hours |
| Validator false negative (a bad draft saved) | 1–4 | depends on detection — could be 0 (caught at publish) to 2 days (shipped before caught) |
| Showcase/Preview rendering-path divergence | 1–2 | 1–2 hours |
| GitHub App webhook missed or duplicated | 1–2 | < 1 hour (idempotent on retry) |
| Vercel preview origin transient failure | rare | < 1 hour |

### When this becomes the wrong design

These are the trip-wires. None of them is a bug; they are conditions under which the design's
trade-offs stop being the right ones and a re-derivation is needed.

| Trigger | Reconsider |
|---|---|
| Publishing cadence exceeds **3 PRs/week** sustained | The hand-maintained `apps/web/lib/registry/index.tsx` stops being tractable. Decouple-or-automate becomes urgent, not optional. |
| More than **30%** of agent `saveVersion` calls hit `UNPUBLISHED_DEPENDENCY` | Decision 8's sequencing constraint is dominating iteration. Design the version-pinning escape hatch — see [decision 8 revisit](#decision-8-revisit-trigger). |
| **Two** maintainers simultaneously | One account, no roles, one machine token — the design assumes a singleton. Add roles + a second machine token, or accept that concurrency is impossible. |
| A `compile()` break takes **more than a day** to repair | The Tailwind dependency has stopped being a manageable risk. Implement the [exit path](#tailwind-exit-path) rather than another workaround. |
| **One** consumer project reports a real bug from preview/showcase divergence | The "high, not perfect" fidelity claim has stopped holding. Either fix the divergence or document the limit honestly in Studio. |

### Tailwind exit path

Detection is the current mitigation. The exit paths below are ordered by what would be implemented
first if `compile()` breaks again and the contract test does not catch it in time.

**Exit 1 — Contract test catches it.** The contract test pins known output for a few canonical
inputs (`.text-brand`, an opacity modifier, a custom `@theme` token). When Tailwind renames a return
field again, the test fails, the upgrade is held, and the code is patched to the new field name.
This is where we want to live — detection at upgrade time, repair in hours.

**Exit 2 — Isolate behind a versioned module.** If detection alone is not enough, wrap the call in
a `@workspace/studio-tailwind` package with its own pinned `tailwindcss` dependency. Studio imports
that package, never `tailwindcss` directly. An upgrade to the wrapper is a separate PR with its own
contract test. The cost: one extra package, an extra boundary to maintain.

**Exit 3 — Per-draft `@theme` becomes static.** If `compile()`'s `@theme` parameter is the part
that breaks, fall back to a static `@theme` block built once at preview-app build time from the union
of all currently-declared tokens, and pass only the candidate list to `compile()`. New tokens still
require a preview-app redeploy, which is a real cost — but it removes the per-version `@theme`
parameter from the call entirely. Reasonable if only one or two tokens are added per quarter.

**Exit 4 — Variable substitution only.** The `tweakcn` approach: set CSS custom properties on a root
element, no per-draft compilation. Works when drafts vary only in **token values**, not in
**utility classes**. Since every new component introduces new classes, this is a partial exit — it
covers theme changes but not new components. It is the right answer for a *theme editor*, not for
Studio. Worth flagging only to make clear it is **not** an exit path for this system.

**Exit 5 — Pull out of the preview entirely.** If Tailwind Labs never stabilises the API and the
contract test cannot keep up, the preview falls back to "render the showcase page instead" — meaning
diffs between draft and current are visible only after a Vercel deploy of `apps/web`. This loses the
"no dev server" property the system exists to provide, but it is the floor. Document it now so the
trade-off is understood before it has to be made under pressure.

### Second-rendering-path drift handling

The Showcase renders through Next.js + PostCSS. The Preview renders through sucrase + import map +
`compile()`. They execute the same bytes but through different toolchains. Nothing detects drift
automatically.

**Mitigation today:** a draft that passes the contract test (`contract-test.mjs`) will install in a
real consumer project — that is the canonical "did this actually compile" check. CI runs it on every
publish PR, and CI is the source of truth for fidelity. The Preview's value is fast iteration, not
fidelity — that should be said in Studio's UI, not implied.

**Mitigation if drift becomes frequent:** add a regression test that renders a known item (e.g.
`ds-button`) through both paths and asserts the resulting DOM is byte-identical. Cost: a Playwright
suite in CI, ~10 seconds per run. Worth adding if two or more drift incidents occur in a quarter.

### Decision 8 revisit trigger

Decision 8 (`registryDependencies` resolve to published) accepts a 4-minute wait when a primitive
must be published before a block can preview. The escape hatch — version pinning — is deferred. The
trigger to design and implement the pinning:

- **More than 30% of `saveVersion` calls hit `UNPUBLISHED_DEPENDENCY`** in a one-week window.
- **OR** the maintainer reports "I shipped 3+ blocks in a session and the wait was the slowest part."
- **OR** a new block type is added whose dependencies are typically drafts.

When any of these fires, the design for pinning is: a draft may opt into `registryDependencies: ["ds-x@draft:abc123"]`
where `abc123` is a version id, and the preview resolves the alias against that exact version. The
public registry still resolves to the published version, so a draft block that ships still ships
against pinned published dependencies — pinning is preview-only. This is roughly one week of work
plus a validator extension.

### Studio org-shape trigger

The design assumes one maintainer, one machine token, one session, one person watching the frame.
That assumption holds for one person. It does not hold for two.

The trigger to re-derive:

- A second maintainer is added (either for resilience, vacation coverage, or onboarding a
  contributor).
- A contributor other than the maintainer wants to publish (the PR path is unchanged, but the
  machine token now has two holders, and "the maintainer's machine" is no longer singular).
- An auditor or reviewer needs read-only access to versions without write capability.

When this fires, the work is roughly: add a `role` column on `user`, split the machine token into
per-user tokens, scope write paths by role. One to two weeks of work. Document now, implement when
triggered — do not implement pre-emptively, because the shape of the future org is not knowable
from a singleton.

---

## Deferred, deliberately

Each deferred item now carries an explicit trigger for when to design it. "Deferred" without a
trigger is "deferred forever, and forgotten"; "deferred, with a trigger" is "scheduled, but later."

- **Authenticated draft install.** A `@deessejs-draft` namespace with a Bearer token, so a draft can
  be installed into a real consumer project before publication. **Trigger:** the maintainer asks
  "can a beta-tester try this draft before I publish?" more than once. This is the only way to close
  the fidelity gap above, and it is a lot of surface for a problem the PR path already solves.
- **Version pinning for `registryDependencies`.** The escape hatch for decision 8. **Trigger:** see
  [decision 8 revisit trigger](#decision-8-revisit-trigger) — 30% of `saveVersion` calls hitting
  `UNPUBLISHED_DEPENDENCY` in a week, or three blocks shipped in a session where wait dominated.
- **Vercel Sandbox for drafts needing new npm dependencies.** Today a new peer dependency means
  "open a PR" — validator #2 says so explicitly. Sandbox would let such a draft preview, at the cost
  of a real container per preview. **Trigger:** the maintainer wants to author a component that
  needs a library not yet in the registry, and the PR round-trip is blocking iteration.
- **Rate limiting on the machine token.** Absent from the template and not in scope, but the write
  path is a compile-on-demand endpoint reachable with a long-lived token. **Trigger:** the token
  leaves the maintainer's machine — second holder, shared CI use, a CI integration that calls
  `saveVersion` from a build agent. Implementation cost: an in-memory rate limiter on the
  `saveVersion` route, roughly 50 lines.
- **Roles and a second account.** See [Studio org-shape trigger](#studio-org-shape-trigger).
  **Trigger:** a second maintainer joins, or a non-maintainer contributor needs publish access.

---

## Unverified or not first-hand

Everything in this section is carried forward from research, not measured against the repo. Flagged so
that nobody treats it as established.

**Tailwind**

- The maintainer quotes (Adam Wathan 2025-02-16, Philipp Spiess 2025-03-03), the docs 404 for
  `/docs/api/compile`, and the absence of any Programmatic API page. Web claims, plausible and
  consistent, not re-checked here.
- The `globs` → `sources` rename in 4.1.0 was established by diffing published `.d.mts` at 4.0.9 vs
  4.1.0. **The rename is certain** — the installed 4.3.3 types have `sources` and no `globs`. The claim
  that *no CHANGELOG entry announced it* is a negative finding that could not be exhaustively
  confirmed.
- Tailwind Play's internals are closed source; that it runs on the same low-level APIs rests on a
  maintainer statement.
- `compile()` was tested on Node v22.22.0 only. Not tested under Deno, Bun, or an edge runtime. The
  core is fs-free when `loadStylesheet` is supplied so it should port; `@tailwindcss/node` and the
  native `@tailwindcss/oxide` binary would not.

**Next.js CVEs**

The advisory identifiers, severities, affected ranges and patch versions in
[repo/02-pnpm-and-versions.md](./repo/02-pnpm-and-versions.md) come from published advisories and
release notes. They were not independently reproduced. What *was* verified locally: `next@16.2.6` is
both declared and installed, and `apps/web/next.config.ts` enables nothing — no `cacheComponents`, no
`experimental` block.

**Elsewhere**

- `temp/sandbox-validate/`, referenced by the Phase 4 validation memory, no longer exists on disk. The
  end-to-end external install was confirmed on 2026-07-29; the harness that confirmed it is gone and
  would have to be recreated as a script.
- The `react-email` precedent for calling `compile()` from a shipped package was read from a canary
  branch URL, not from an installed copy.

---

## Sources

- https://github.com/tailwindlabs/tailwindcss/discussions/16581 — Adam Wathan, 2025-02-16
- https://github.com/tailwindlabs/tailwindcss.com/issues/2122 — Philipp Spiess, 2025-03-03
- https://github.com/tailwindlabs/tailwindcss/discussions/17970 — open request for a public programmatic API
- https://nextjs.org/blog/july-2026-security-release — verified 2026-07-30
- https://vercel.com/docs/caching/runtime-cache — verified 2026-07-30
