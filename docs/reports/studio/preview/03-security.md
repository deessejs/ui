---
title: Security model
date: 2026-07-30
status: decisions locked
---

# Security model

The failure mode to design against is not *"someone breaks the preview."*

It is **an agent generates a component that exfiltrates the maintainer's Studio session** — and under
decision 2, no human reads that code before it executes.

That is not a hypothetical threat model bolted onto the design. It is the direct consequence of removing
the PR from the authoring loop, and it is what forces the three-origin split.

---

## Three origins, and why two independent constraints demand it

```
ui.deessejs.com        public showcase          published only, no DB
studio.deessejs.com    authenticated session    drafts, publish
preview.deessejs.com   NO cookies, NO session   executes untrusted code
```

**Constraint one — security.** Untrusted TSX must not execute on the same origin as the authenticated
session. Same-origin means it can read `document.cookie` and call the API as the maintainer. Session
theft, with the generated code as the vector.

**Constraint two — "not in production."** A separate domain makes it structurally impossible for a draft
to surface on `ui.deessejs.com`. Not "unlikely because of a status check" — impossible, because the
public app has no database credentials and no route that could serve one.

Either constraint alone justifies the split. They converge, which is the strongest form of an
architectural argument: the answer does not depend on which one you weight more.

There is a third, quieter reason. Reading `cookies()` forces `Cache-Control: private, no-store`, with no
first-party way to opt back into public caching with `Vary`
([discussion #82571](https://github.com/vercel/next.js/discussions/82571), still unanswered). Serving one
route differently to the maintainer and to the public would make it uncacheable for everyone. A
`draftMode()` toggle on the public site would have made the showcase pay for the admin surface.

---

## The eight rules

### 1. Separate origin, always

Better Auth cookies scoped to the Studio host only. No cookie the preview origin can read.

### 2. `sandbox="allow-scripts"`, never together with `allow-same-origin`

Those two flags **together** let the framed document remove its own sandbox attribute and reach the parent
origin. This is the single most commonly-made mistake in this shape of system, and it silently undoes rule
1.

`allow-scripts` alone is correct: the module needs to run, and it stays in an opaque origin.

### 3. No `unsafe-eval`

The ESM-plus-import-map design makes `script-src 'self'` achievable on the preview origin. This is why
sucrase output is served as a real module rather than evaluated from a string — see
[01-transpile-and-imports.md](./01-transpile-and-imports.md).

A design that needed `eval` would put arbitrary generated code one CSP bypass away from the parent frame.

### 4. `frame-ancestors`

`frame-ancestors https://studio.deessejs.com` on preview — only Studio may frame it.
`frame-ancestors 'none'` on Studio — nothing may frame Studio.

### 5. Preview access is a signed expiring URL, never a cookie

The preview origin **has no session concept**. That is what makes it safe to run arbitrary code there:
there is no identity to steal and no credential to replay.

Signed URLs are minted by Studio, from the human session. The machine token cannot mint them — see
[admin/01-auth.md](../admin/01-auth.md). An agent able to mint preview URLs could publish render access to
arbitrary compiled code.

### 6. `postMessage` validates origin and shape on both sides

Preview → Studio messages carry render errors and measured height. **They are untrusted input**, authored
by the same generated code the sandbox exists to contain.

Validate the origin, validate the message shape, and treat a measured height as a number to clamp rather
than a number to trust. A frame that reports a height of 10⁹ pixels should not be able to break the Studio
layout.

### 7. The preview app holds no database credentials

Studio pushes compiled artifacts. The preview never reads. Even with full code execution on that origin,
there is nothing reachable behind it.

### 8. The agent's machine token is not a session

Scoped to writing drafts. It cannot publish, cannot read the `user` table, cannot mint preview tokens. Not
a session row, not a session cookie — a distinct credential type, so the two callers stay
distinguishable at the point where `publish` has to reject one of them. Detail in
[admin/01-auth.md](../admin/01-auth.md).

---

## What is deliberately not defended

**Malicious npm dependencies.** A draft can only import what the import map allows, and those bundles are
built from the showcase's own declared versions. A new dependency requires a PR — validator #2 says so
explicitly. The supply chain is defended by the PR path, not by the preview.

**Denial of service on `saveVersion`.** It transpiles and compiles CSS on every call, and nothing rate
limits it. The token is single-holder and lives on the maintainer's machine, so this is an accepted gap
rather than an oversight — but it is the first thing to add if the token ever travels. See
[99-frictions-and-costs.md](../99-frictions-and-costs.md).

**Exfiltration of draft source.** A signed preview URL that leaks exposes an unpublished component's
rendered output. The consequence is disclosure of a design in progress, which is not the kind of secret
this system holds.

**`draftMode()` as authorization.** It is a cache-bypass shared secret, not an authorization mechanism.
Not used anywhere here, and worth naming so nobody reaches for it later.

---

## The property to preserve under change

Every rule above is downstream of one invariant:

> **Untrusted code executes only on an origin that has no session, no cookies, and no database
> credentials.**

If a future change puts a session on the preview origin — for authenticated draft install, say, which is
in the deferred list — the entire model has to be re-derived. That deferred feature is not merely more
work; it is the one change that would invalidate this document.

---

## Sources

- https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe — sandbox flag semantics, verified 2026-07-30
- https://7asecurity.com/blog/2026/06/iframe-xss-security/ — 2026-06
- https://github.com/vercel/next.js/discussions/82571 — the `Vary` constraint, unanswered
