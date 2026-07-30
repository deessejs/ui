---
title: Next.js 16 mechanics that apply
date: 2026-07-30
status: decisions locked
---

# Next.js 16 mechanics

The framework behaviours that constrain Studio and Preview. **None of this is enabled in the repo today** —
`apps/web/next.config.ts` is seven lines and sets only `transpilePackages: ["@workspace/ui",
"@workspace/registry"]`. Everything below applies to `apps/studio` and `apps/preview` as they are built,
and to `apps/web` if it ever adopts `cacheComponents`.

---

## `cacheComponents`

`cacheComponents: true` replaces the removed `experimental.dynamicIO` and `experimental.ppr`.

Under it, **dynamic code runs at request time by default** and caching is opt-in via `"use cache"`. That
inversion is the right default for both new apps here:

- **Studio** is session-dependent on every page. Dynamic is correct.
- **Preview** serves immutable artifacts keyed by version id. Everything is cacheable, explicitly.

The two apps sit at opposite ends of the same switch, which is a good sign the split in
[README.md](../README.md#topology) is along the right seam.

---

## `"use cache"` cannot read the request

A cached function may not call `cookies()` or `headers()`, and may not read `searchParams`. Values have to
be passed in as arguments.

**Studio pages are therefore dynamic by construction.** Every page reads the session. There is no version
of Studio that is mostly static with a dynamic hole in it, and trying to build one means threading session
values into cached functions as arguments — which defeats the purpose and is easy to get subtly wrong.

One user, so there is nothing to gain anyway.

**Preview routes are the mirror image.** `/m/<versionId>.js`, `/c/<versionId>.css` and `/f/<versionId>`
depend only on a path parameter. Nothing about them reads the request, so `"use cache"` applies cleanly
with `cacheLife('max')` — the version id names exactly one byte sequence forever. See
[01-data-model.md](../01-data-model.md#immutability).

---

## Revalidation

`revalidateTag(tag, profile)` takes **two arguments** in 16. The one-argument form is deprecated.

`updateTag(tag)` — Server Actions only — gives **read-your-writes** semantics. That is the right primitive
for "agent saves, maintainer immediately sees," and it is also the one this system cannot straightforwardly
use.

The agent does not call a Server Action. It calls the oRPC mutation through the CLI or MCP, so the write
happens outside any React request scope. Revalidation has to be triggered from the oRPC handler, and the
browser has to learn about it by asking or by being pushed.

The constraint is fixed regardless of how it is implemented: **the write originates from a non-browser
client.** Any design that assumes the mutation and the render share a request scope will be wrong here. See
[admin/README.md](../admin/README.md#the-live-update-path).

---

## Cache limits

| Limit | Value |
|---|---|
| Per cache item | **2 MB** |
| Tags per item | 128 |
| Tag length | 256 bytes |
| Propagation | ~300 ms |

Component sources are kilobytes, so version rows and compiled JS are nowhere near the ceiling.

**Compiled CSS is the one thing to check against 2 MB.** A draft that pulled in preflight wholesale could
approach it. The failure mode is quiet — the cache write does not happen and every request recompiles or
refetches — so it is worth asserting the size rather than assuming it. See
[preview/02-css-compile.md](../preview/02-css-compile.md#output-size).

The ~300 ms propagation figure is **not documented at that number** in Vercel's published runtime-cache
docs as of 2026-07-30 — Vercel describes LRU eviction behaviour but does not commit to a propagation
latency. Treat it as an empirical estimate from prior projects; the live update path should measure it
under real load rather than relying on the figure. See
[admin/README.md](../admin/README.md#the-live-update-path).

---

## `generateStaticParams` must return at least one param

Under `cacheComponents`, returning an empty array is a **build error**.

This is a live trap for `apps/web` specifically. It renders a page per registry item, and if that item list
ever becomes database-derived, an empty or failed query at build time turns into a build failure rather
than an empty list. Decision 3 keeps the public showcase on static JSON, which avoids it — but the trap is
worth knowing about, because "read the items from Studio at build time" is an obvious-looking
simplification that would introduce it.

---

## Reading `cookies()` makes a route uncacheable for everyone

Reading `cookies()` forces `Cache-Control: private, no-store`. There is no first-party way to opt back
into public caching with `Vary`
([discussion #82571](https://github.com/vercel/next.js/discussions/82571), still unanswered).

So a route that serves the maintainer one thing and the public another is uncacheable **for both**. The
public showcase would pay, in cache misses, for the existence of the admin surface.

This is the third independent reason Studio is a separate app rather than a `draftMode()` toggle on
`ui.deessejs.com` — the other two being session isolation and "not in production." See
[preview/03-security.md](../preview/03-security.md#three-origins-and-why-two-independent-constraints-demand-it).

---

## `draftMode()` is not authorization

It is a cache-bypass shared secret. Anyone with the token bypasses the cache; it says nothing about who
they are.

Not used anywhere here, and named so that nobody reaches for it as the cheap version of the three-origin
split. It would provide neither the session isolation nor the structural guarantee that a draft cannot
appear on the public site.

---

## The `@next/env` monorepo cache bug

`loadEnvConfig` caches per process, and the cache key does **not include the `dir` argument**. In a
monorepo, Next.js calls it internally with `apps/<app>/` first — no `.env` there, empty result — and a
later call with the repo root hits the stale cache and silently returns empty. The root `.env` is ignored.

Fixed in `@next/env@16.2.11+`. The template works around it by passing `forceReload: true` as the fourth
argument, in `packages/env/src/loader.ts`. Going to 16.2.12 means the bug is fixed, but the workaround
arrives with the lifted package and is harmless — see
[04-template-reuse.md](./04-template-reuse.md).

Worth knowing because the symptom is "my environment variables are empty in one app and fine in another,"
which reads as a configuration mistake rather than a framework bug.

---

## Sources

- https://nextjs.org/blog/next-16 — 2025-10-21
- https://nextjs.org/docs/app/api-reference/directives/use-cache — v16.2.12, verified 2026-07-30
- https://nextjs.org/docs/app/api-reference/functions/revalidateTag — v16.2.12, 2026-07-22
- https://vercel.com/docs/caching/runtime-cache — 2026-06-29
- https://github.com/vercel/next.js/discussions/82571 — the `Vary` constraint, unanswered
- https://github.com/vercel/next.js/issues/92040 — `@next/env` cache key omits `dir`
