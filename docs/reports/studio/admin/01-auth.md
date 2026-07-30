---
title: Auth — one account, one machine token
date: 2026-07-30
status: decisions locked
---

# Auth

**Constrained by:** decision 6 (one account, signup closed), decision 1 (the agent runs locally).

Two credentials exist and they are different kinds of thing: a **human session** for the maintainer,
and a **machine token** for the agent. Conflating them would make `publish` unguardable.

---

## The human session

Better Auth with the Drizzle adapter, lifted from `temp/saas-template` largely unchanged.

```
emailAndPassword: {
  enabled: true,
  disableSignUp: true,          // ← added; the template does not set this
  requireEmailVerification: false,
}
session: { expiresIn: 7d, updateAge: 1d }
plugins: [nextCookies()]
```

Seeded with one row. `disableSignUp` defaults to `false` in Better Auth, so it must be set explicitly —
the template leaves signup open.

**No `admin()` plugin.** It was evaluated and rejected: it exists to manage users, roles and
impersonation, and with one account there is nothing to manage. There is no `role` column on `user`
either, in the template or here.

**No email transport.** Decision 6 removes verification and password reset, which removes the only two
flows that used Resend. `packages/email` is not lifted.

The operational consequence is worth stating plainly: **without an email transport, a lost password
means database surgery.** A GitHub OAuth provider restricted to a single account avoids that, and is
the recommended shape if the tradeoff feels wrong later. It is not a decision this document forecloses.

### Branded session types

The template defines `SessionToken`, `SessionRowId` and `CurrentSessionToken` as branded string types
with explicit boundary casters, after an audit bug where `session.id` was passed where a token was
expected. Worth lifting verbatim — the bug class it prevents does not get less likely with one user.

### The edge gate

`apps/app/proxy.ts` in the template gates routes by calling `authClient.getSession` **over HTTP**
against `/api/auth/get-session`, rather than touching the database. That is what lets the build succeed
with no `DATABASE_URL` present. Reusable as-is; note it is Next.js's `proxy.ts` convention, not
`middleware.ts`.

---

## The machine token

The agent runs on the maintainer's machine (decision 1) and authenticates with a long-lived token, not
a session cookie.

**It is not a session.** Not a session row, not a session cookie, not a `user` the middleware narrows
to. The template's `authMiddleware` narrows context to a non-null `user` and `session`; the machine
path needs a sibling middleware that narrows to a token context instead. Minting a real session for the
agent would be simpler and is the wrong move — it would make the two callers indistinguishable exactly
where they need to be distinguished.

**Scope: write drafts, nothing else.**

| Procedure | Session | Machine token |
|---|---|---|
| `items.list`, `items.get` | yes | yes |
| `versions.*` | yes | yes |
| `saveVersion` | yes | **yes** |
| `publish` | yes | **no** |
| `previewToken.mint` | yes | **no** |
| anything reading `user` / `session` | yes | **no** |

Three of those denials are load-bearing:

- **`publish` denied** keeps decision 3 meaningful. If the agent could publish, the PR would be
  agent-opened and agent-mergeable, and the last human checkpoint in the system would be gone.
- **`previewToken.mint` denied** keeps the preview origin's trust story intact. Preview access is a
  signed expiring URL handed out by the human's session; an agent that could mint them could publish
  render access to arbitrary compiled code.
- **Reading the `user` table denied** because there is exactly one row in it and it is the maintainer's
  credentials.

**Rotation.** One token, stored hashed, revocable from Studio. No expiry — an expiring machine token in
a local agent loop just becomes an outage the maintainer has to debug mid-iteration. Revocation is the
mechanism, not rotation on a timer.

**Rate limiting is absent** and worth flagging. `saveVersion` transpiles and compiles CSS on every call.
The template ships no rate-limiting middleware, so nothing bounds a runaway agent loop. Not in scope,
but it is the first thing to add if the token ever leaves the maintainer's machine. See
[99-frictions-and-costs.md](../99-frictions-and-costs.md).

---

## Why the preview origin has no auth at all

`preview.deessejs.com` has no session concept, no cookies, and no database credentials. That absence is
the security property, not a gap in it — it is what makes running arbitrary generated TSX there
acceptable.

Access is a **signed expiring URL** issued by Studio. The preview app verifies the signature and serves
the compiled artifacts Studio pushed to it. It cannot read the database, cannot identify the caller, and
has nothing to steal.

Full reasoning in [preview/03-security.md](../preview/03-security.md).

---

## Sources

- https://better-auth.com/docs/reference/options — `emailAndPassword.disableSignUp`, default `false`, verified 2026-07-30
- https://www.better-auth.com/docs/plugins/admin — evaluated, not adopted
