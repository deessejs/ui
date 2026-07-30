---
title: CSS — server-side Tailwind compile
date: 2026-07-30
status: decisions locked
---

# CSS compilation

**Decision 9:** CSS is compiled **server-side** per draft version, using Tailwind's `compile()`.
`@tailwindcss/browser` is disqualified.

The decisive argument turned out to be architecture, not fidelity. `@tailwindcss/browser` is not merely
riskier — it structurally cannot express per-draft isolation.

This is also the one place the whole design rests on undocumented API, and the mitigation is detection
rather than prevention. Read the whole file before touching this code.

---

## The API

`tailwindcss@4.3.3` (installed in this repo) exports:

```
[ 'Features', 'Polyfills', '__unstable__loadDesignSystem', 'compile', 'compileAst' ]
```

Verified against the installed copy on 2026-07-30, Node v22.22.0. Usage:

```js
compile(themeCss, { base, loadStylesheet, loadModule })
  .build(extractedCandidates)   // → compiled_css
```

A minimal compile with a custom `@theme` and an explicit candidate list produces correct CSS — custom
tokens, arbitrary variants, opacity modifiers (`/50`) and responsive prefixes all resolve.
`compiler.sources` is `[]` when candidates are supplied explicitly, confirming **no disk globbing**.

One compiler instance per draft version, its own `@theme`, its own output. Stored in `compiled_css` on
the version row and served by the preview origin as a stylesheet. Cached forever, because the version id
is immutable.

---

## It is not public API

This is not a "probably fine" caveat. It is on the record, repeatedly, from maintainers.

- `https://tailwindcss.com/docs/api/compile` returns **404**. There is no Programmatic API page anywhere
  in the docs. The entire documented integration story is Vite, PostCSS, CLI, and the Play CDN.
- **Adam Wathan, 2025-02-16** ([discussion #16581](https://github.com/tailwindlabs/tailwindcss/discussions/16581)):
  > "You can probably just use `tailwindcss` or maybe `@tailwindcss/node` if you are willing to mess around with the **internal/undocumented/not public APIs** we use for everything."
- **Philipp Spiess, 2025-03-03** ([tailwindcss.com#2122](https://github.com/tailwindlabs/tailwindcss.com/issues/2122)):
  > "**We don't really provide stable APIs for this use case** … Our IntelliSense plugins use APIs from the `tailwindcss` package which are **very low level**."
- The open request for a public programmatic API ([#17970](https://github.com/tailwindlabs/tailwindcss/discussions/17970))
  was re-pinged three times through 2025 with no maintainer answer. The position has not moved in roughly
  17 months.

**The surface has already broken in a minor release.** `compile()`'s return field was renamed
`globs` → `sources` in **4.1.0**. Code on a `^4.0.0` range broke. Tailwind does not treat this API as
covered by semver. The installed 4.3.3 types confirm the current name — `dist/lib.d.mts` has `sources`
and no `globs`.

### A trap worth documenting

Search engines surface `tailwindlabs-tailwindcss.mintlify.app/api/compile`, which renders a polished API
reference with a full `CompileOptions` table. It is an **auto-generated Mintlify wiki mirror**, not
Tailwind documentation, and carries no stability guarantee.

It is the single most likely route to someone concluding this is supported API and dropping the
mitigations below.

---

## Why `@tailwindcss/browser` cannot do this

Independent of stability, it cannot express the use case:

- **One global compiler, one global output sheet.** `document.head.append(sheet)`, singular.
- **Whole-document scanning only.** `document.querySelectorAll('[class]')` plus two `MutationObserver`s
  on `document.documentElement`. No subtree scoping, no init function, no options object — the module
  self-executes and [deliberately exposes nothing](https://github.com/tailwindlabs/tailwindcss/pull/15978).
- **Classes are cumulative and never evicted** (`let classes = new Set()`). Switching between drafts
  leaks the previous draft's utilities into the output — which is exactly the iteration loop this system
  is built around.
- **Per-draft `@theme` is inexpressible.** All `<style type="text/tailwindcss">` blocks in the document
  concatenate into one compiler.
- `loadModule` always throws (no plugins, no `@config`); `loadStylesheet` accepts only four ids, so you
  cannot `@import` your own CSS.
- Documented as *"development purposes only, not intended for production."*

Getting per-draft isolation out of it would require one iframe per draft, each paying a full client-side
Tailwind compile. Strictly worse than compiling once on the server and caching on an immutable row.

---

## Precedent

`react-email` (Resend) calls `compile()` from a shipped npm package in production
([`setup-tailwind.ts`](https://raw.githubusercontent.com/resend/react-email/canary/packages/tailwind/src/utils/tailwindcss/setup-tailwind.ts)),
vendoring the four Tailwind CSS files as JS strings so it works in bundled and serverless contexts. That
is the pattern to copy.

Tailwind Play itself is closed-source and, per Spiess, runs on the same low-level internals. Even
first-party tooling lives here.

---

## Mitigations

Three, and they map onto conventions this repo already has.

**Pin `tailwindcss` to an exact version.** Not `^4`. Tailwind Labs already does this internally:
`@tailwindcss/node` and `@tailwindcss/postcss` depend on `"tailwindcss": "4.3.3"` with no caret.

Current state: `tailwindcss` is declared as **`^4`** in `packages/ui` devDependencies, and `apps/web`
declares only `@tailwindcss/postcss: ^4` — it does not declare `tailwindcss` at all. **Nothing is pinned
and no package owns the dependency.** Studio needs it as a real, exact dependency, which makes this a
prerequisite rather than a later hardening step.

**Add a contract test asserting known output.** For example, that `.text-brand` resolves to
`var(--color-brand)`, that an opacity modifier emits the expected `color-mix`, that a custom `@theme`
token produces a utility. This turns a silent upgrade break into a red CI run — the exact role
`contract-test.mjs` already plays for the registry.

**Isolate the call behind one module.** A signature change should be a one-file fix. Nothing outside that
module imports `tailwindcss` directly.

Together these mean an upgrade can still break the preview — but it breaks in CI, in one file, with a
test naming what changed.

---

## The cheaper alternative, and why it does not apply

tweakcn (the shadcn theme editor) compiles no Tailwind at all. It sets CSS custom properties on the root
element and toggles `.dark`, because the shadcn token model routes everything through variables that
already-compiled utilities consume.

That is the zero-risk path, and it works when drafts vary in **token values**. Here, every new component
introduces new **utility classes** by definition — a component nobody has written yet uses class
combinations nobody has compiled yet. Variables cannot conjure a rule that does not exist.

So compilation is genuinely required. The risk is not accepted for convenience.

---

## Candidate extraction

`build()` takes an explicit candidate list, which is why there is no disk globbing and no
`MutationObserver`. The candidates come from scanning the version's `source` and `demo_source` for class
strings.

Two things to get right:

- **Extraction must cover both columns.** A Demo-only utility that is missing from the stylesheet makes
  the preview wrong in exactly the pane the maintainer is looking at.
- **Dynamic class construction defeats it.** A component computing class names at runtime produces
  candidates a static scan cannot see. Every current item uses static strings or a lookup record — that
  is a convention worth keeping deliberately rather than by accident, and a plausible future validator.

---

## Output size

Next.js Runtime Cache has a 2 MB per-item ceiling. Compiled CSS for a single component is kilobytes. It
would only approach the limit if a draft pulled in preflight wholesale — worth asserting rather than
assuming, since the failure mode is a cache write that silently does not happen. See
[repo/03-nextjs-16.md](../repo/03-nextjs-16.md).

---

## Sources

- https://github.com/tailwindlabs/tailwindcss/discussions/16581 — Adam Wathan, 2025-02-16
- https://github.com/tailwindlabs/tailwindcss.com/issues/2122 — Philipp Spiess, 2025-03-03
- https://github.com/tailwindlabs/tailwindcss/pull/15978 — browser build exposes nothing
- https://github.com/tailwindlabs/tailwindcss/pull/14150 — `compile` / `__unstable__loadDesignSystem` unified
- https://github.com/tailwindlabs/tailwindcss/discussions/17970 — open request for a public programmatic API
- https://tailwindcss.com/docs/installation/play-cdn — "development purposes only"
- https://raw.githubusercontent.com/resend/react-email/canary/packages/tailwind/src/utils/tailwindcss/setup-tailwind.ts
- https://raw.githubusercontent.com/jnsahaj/tweakcn/main/utils/apply-theme.ts — the CSS-variable approach
- Empirical: `tailwindcss@4.3.3`, `dist/lib.d.mts`, Node v22.22.0 — verified 2026-07-30
