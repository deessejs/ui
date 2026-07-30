---
title: Transpiling and import resolution
date: 2026-07-30
status: decisions locked
---

# Transpiling and import resolution

How stored TSX becomes a running module without a bundler and without `unsafe-eval`.

---

## sucrase, not esbuild-wasm

`sucrase` 3.35.1 (published 2025-11-19), roughly 700 KB, token-based.

```js
transform(source, { transforms: ["typescript", "jsx"], jsxRuntime: "automatic" })
```

Runs server-side in Studio at save time; the output is stored in `compiled_js` on the version row.

`esbuild-wasm` (0.28.1) was the alternative and is roughly 9 MB, because it is a full bundler.
**Bundling is unnecessary here** — imports are resolved by an import map in the browser, not by a build
step. Paying for a bundler to then not bundle is the wrong trade.

sucrase drops types rather than checking them. That is fine: type checking is CI's job on the PR
(`contract-test.mjs`, `tsc --noEmit`), and the write path only needs to know the source parses. See
[agent/01-validators.md](../agent/01-validators.md#6-compile-clean).

---

## The import map

The transpiled output stays a real ES module and is served as `text/javascript`. Bare specifiers resolve
in the browser:

```html
<script type="importmap">
{ "imports": {
    "react":                   "/v/react.js",
    "react/jsx-runtime":       "/v/jsx-runtime.js",
    "react-dom/client":        "/v/react-dom-client.js",
    "@base-ui/react/":         "/v/base-ui/",
    "clsx":                    "/v/clsx.js",
    "class-variance-authority":"/v/cva.js",
    "tailwind-merge":          "/v/twmerge.js",
    "lucide-react":            "/v/lucide.js",
    "@/lib/utils":             "/v/cn.js",
    "@/components/ui/":        "/v/ds/"
} }
</script>
<script type="module" src="/m/<versionId>.js"></script>
```

**No `eval`, no `new Function`**, so `script-src 'self'` holds on the preview origin. That is the whole
reason for choosing an import map over a module shim that evaluates strings. See
[03-security.md](./03-security.md).

---

## The import map *is* the allow-list

A draft importing anything outside the map fails loudly at load. That is the desired behaviour, and it
is the mechanical basis for validator #2.

This matters more than it looks. The alternative is a hand-maintained deny-list in the validator, which
would drift from what the preview can actually resolve — and the direction it drifts is the dangerous
one: a validator that permits an import the frame cannot load produces a draft that saves clean and
renders blank.

Deriving the validator from the map means the two cannot disagree. One list, two readers.

```
validator #2  reads the map → rejects at save time with a useful error
the browser   reads the map → rejects at load time as a backstop
```

---

## Vendor bundles

`/v/*` is built once at the preview app's build time, from the exact versions the showcase declares:

| Bundle | Version source |
|---|---|
| `react`, `react-dom` | `19.2.4`, declared exact in `apps/web`, `packages/ui`, `packages/registry` |
| `@base-ui/react` | `^1.6.0`, installed 1.6.0 |
| `lucide-react` | `^1.28.0`, installed 1.28.0 (was `^1.27.0` at the time of the 2026-07-30 writeup; 1.28.0 is the current published version) |
| `clsx`, `tailwind-merge`, `class-variance-authority` | as declared |
| `cn` | vendored from `@workspace/ui/lib/utils` |

**One inconsistency to resolve before building these.** The root `node_modules/react` is **19.2.8**,
while `package-lock.json` pins 19.2.4 and every workspace has a nested 19.2.4. The string `19.2.8`
appears zero times in the lockfile. Builds resolve the nested copies so nothing is currently broken, but
"the exact versions the showcase ships" has two answers right now. Reconcile it during the pnpm
migration, which will surface it as a conflict rather than a silent hoist. See
[repo/02-pnpm-and-versions.md](../repo/02-pnpm-and-versions.md).

---

## `@/lib/utils` and the three resolutions

The stored source imports `cn` from `@/lib/utils` — the specifier a consumer project already expects
after `shadcn add`. Three environments resolve it three ways and execute the same bytes:

| Environment | Resolution |
|---|---|
| showcase | `apps/web/lib/utils.ts` re-exporting from `@workspace/ui/lib/utils` — **does not exist yet** |
| preview | import map entry `"@/lib/utils": "/v/cn.js"` |
| consumer | the project's own `@/lib/utils` |

That identity is the fidelity guarantee the deleted drift checker was approximating. See
[02-single-tree.md](../02-single-tree.md#mechanism).

---

## `@/components/ui/` resolves to published items only

The trailing-slash mapping `"@/components/ui/": "/v/ds/"` serves compiled **published** items, per
decision 8.

`/v/ds/` is therefore not a build-time bundle like the rest of `/v/*` — it tracks
`published_version_id` and changes when something is published. It is the one part of the vendor surface
that is not immutable, which is why it lives behind a directory mapping rather than being inlined into
each module.

A block importing `@/components/ui/ds-empty` when `ds-empty` has never been published resolves to
nothing. Studio catches this at save time as `UNPUBLISHED_DEPENDENCY` rather than letting the frame fail
— see [agent/01-validators.md](../agent/01-validators.md#soft-failures).

---

## Sources

- https://www.npmjs.com/package/sucrase — 3.35.1, 2025-11-19, verified 2026-07-30
- https://www.npmjs.com/package/esbuild-wasm — 0.28.1, 2026-06-11, verified 2026-07-30
- https://github.com/codesandbox/sandpack/issues/1301 — Tailwind v4 unsupported in Sandpack, open 2026-04-23
