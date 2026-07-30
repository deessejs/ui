---
title: Preview — rendering untrusted code
date: 2026-07-30
status: decisions locked
---

# Preview — `apps/preview`

**Constrained by:** decision 9 (CSS compiled server-side per draft version), decision 8
(`registryDependencies` resolve to published), and the security model in
[03-security.md](./03-security.md).

`preview.deessejs.com`. No cookies, no session, no database credentials. That absence is the security
property — it is what makes executing generated TSX here acceptable.

This is the surface the whole system exists for. If the agent writes and the human only reviews, the
human's entire job is looking at this frame.

---

## Routes

```
/v/*                vendor bundles — react, base-ui, cva, clsx, tailwind-merge, lucide, cn
/m/<versionId>.js   the transpiled module, served as text/javascript
/c/<versionId>.css  the compiled stylesheet for that version
/f/<versionId>      the frame: HTML + import map + <link> + <script type="module">
```

`/f/<versionId>` is what Studio puts in an iframe. Everything else is fetched by it.

`/v/*` is built once at the preview app's build time from the exact versions the showcase declares.
`/m/*` and `/c/*` serve artifacts Studio computed at save time and stored on the version row — the
preview app does not transpile and does not compile. It has no database credentials, so it could not
read the source even if it wanted to.

---

## Immutable ids make caching free

`versionId` identifies exactly one byte sequence, forever. Version rows are never updated — see
[01-data-model.md](../01-data-model.md#immutability).

So `/m/*`, `/c/*` and `/f/*` are `cacheLife('max')` with no invalidation logic anywhere. Swapping the
iframe to a new draft is changing `src`. There is no cache-busting query parameter, no revalidation tag,
and no stale-preview bug class.

This is the single largest simplification in the design and it comes entirely from the data model
choice. A mutable `draft` row would need cache invalidation on every keystroke of an agent's iteration
loop, in the one place where latency is the product.

---

## The frame

```html
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="/c/<versionId>.css">
    <script type="importmap">{ "imports": { … } }</script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/m/<versionId>.js"></script>
  </body>
</html>
```

The module is a real ES module. No `eval`, no `new Function`, so `script-src 'self'` holds on this
origin. Details in [01-transpile-and-imports.md](./01-transpile-and-imports.md).

The frame mounts the version's `demo_source`, not its `source` — a bare component with no props renders
nothing useful. That is why `Demo` is a required export and why validator #4 enforces it. The Demo is
never shipped to consumers; it exists so this frame has something to show.

---

## Client boundaries

There is no RSC inside the iframe. The module mounts with `createRoot`. Simpler than the showcase, and
it has one real consequence: **the preview cannot validate server-component behaviour.**

For `ds-*` primitives that is a non-issue — Base UI needs mount anyway. A future server-rendered block
would have to route through the PR path to be verified at all.

Worth knowing, because it looks like a contradiction: `"use client"` is present on only **5 of the 9**
shipped `registry/base-nova/*` files. `colored-badge`, `empty`, `input` and `textarea` lack it, while all
nine `packages/registry/src` copies have it. Inside this iframe the directive is inert, so the preview
renders identically either way — but it is load-bearing in a consumer's App Router project, and the
disagreement between the trees is one of the things the single-tree collapse has to settle per item. See
[02-single-tree.md](../02-single-tree.md#smaller-inconsistencies-to-fold-into-the-same-pass).

---

## Resolving `registryDependencies`

Per decision 8, `@/components/ui/ds-*` resolves through the import map to **published** items only.

A block whose dependency is still a draft has nothing to resolve against. The preview does not render a
partial frame and does not silently substitute anything — Studio reports `UNPUBLISHED_DEPENDENCY` and
says which item needs publishing first. The draft was still saved; it just is not renderable yet.

The reasoning: rendering against a draft dependency means the preview is showing something that will
change underneath it, and *"the preview lied"* is a worse failure than *"the preview refused."* The cost
is a real sequencing constraint — see [99-frictions-and-costs.md](../99-frictions-and-costs.md).

---

## Fidelity, stated honestly

High, not perfect. Three gaps, none closable within this design:

| Gap | Consequence |
|---|---|
| Client-only mount | Server-component behaviour unverifiable here |
| CSS via `compile()` with an explicit candidate list | Same compiler as the real build, different entry point |
| Vendored `/v/*` bundles pinned at preview build time | A consumer on a different minor gets different bytes |

**CI remains the source of truth for "does this compile in a consumer project."**
`contract-test.mjs` copies the generated files into a scratch project, installs real npm dependencies and
type-checks. That is a different question from "does this render", and it is the one that matches what a
user experiences.

The Studio UI should say so, in the interface, rather than letting the frame imply it is authoritative.

---

## What the preview app does not have

- **Database credentials.** Studio pushes compiled artifacts; the preview never reads.
- **A session concept.** Access is a signed expiring URL. See [03-security.md](./03-security.md).
- **A transpiler or a Tailwind compiler at runtime.** Both run at save time, in Studio.
- **Any route that takes source as input.** The only inputs are version ids and signatures.

Each of those is an absence that carries weight. A preview origin that could compile arbitrary source on
request would be a public code-execution endpoint.
