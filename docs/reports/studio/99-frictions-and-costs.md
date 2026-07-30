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

**The real cost is maintenance.** Three deployables, a database to migrate, an auth surface to patch,
a second rendering path that can diverge, and a dependency on an undocumented Tailwind API. None of
that is priced in dollars.

---

## Deferred, deliberately

- **Authenticated draft install.** A `@deessejs-draft` namespace with a Bearer token, so a draft can
  be installed into a real consumer project before publication. This is the only way to close the
  fidelity gap above, and it is a lot of surface for a problem the PR path already solves.
- **Version pinning for `registryDependencies`.** The escape hatch for decision 8.
- **Vercel Sandbox for drafts needing new npm dependencies.** Today a new peer dependency means
  "open a PR" — validator #2 says so explicitly. Sandbox would let such a draft preview, at the cost of
  a real container per preview.
- **Rate limiting on the machine token.** Absent from the template and not in scope, but the write path
  is a compile-on-demand endpoint reachable with a long-lived token. Worth revisiting before the token
  ever leaves the maintainer's machine.

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
