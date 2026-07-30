---
title: Reusing temp/saas-template
date: 2026-07-30
status: decisions locked
---

# Template reuse

`temp/saas-template` is a working pnpm 11 monorepo with the auth, database and API layer Studio needs.
Lifting it is most of the reason decision 7 exists.

**Measured:** 2026-07-30, every claim below read from the template.

---

## Lift

| Package | What you get | Change needed |
|---|---|---|
| `packages/database` | Drizzle + postgres-js, lazy client `Proxy` with `prepare: false` (PgBouncer/Neon transaction mode), `db:generate/migrate/push/studio/check`, pg-mem test runner | Add the three tables from [01-data-model.md](../01-data-model.md) |
| `packages/auth` | Better Auth ^1.6.25 + Drizzle adapter, `nextCookies()`, session 7d / updateAge 1d, branded `SessionToken` types, fire-and-forget email with async error logging | Add `disableSignUp: true`; drop email verification and reset |
| `packages/api` | Hono ^4.12.28 + oRPC ^1.14.7, `base` context, `authMiddleware` throwing `ORPCError`, the body-parser `Proxy` that avoids "Body Already Used" | Add the machine-token path, separate from the human session |
| `packages/env` | Zod server/client schemas, lazy validation `Proxy` with a browser-leak guard, the `@next/env` `forceReload` workaround | Add `DATABASE_URL`, `PREVIEW_SIGNING_SECRET`, `GITHUB_APP_*` |
| `apps/app/proxy.ts` | Edge session gate calling `authClient.getSession` over HTTP, so builds need no `DATABASE_URL` | Reuse verbatim |

Note `proxy.ts` is Next.js's convention here — there is no `middleware.ts` anywhere in the template.

---

## Patterns worth copying that are easy to miss

These are not packages, they are decisions inside packages. Each one solves a problem that will otherwise
be rediscovered.

### Schema is generated

```
pnpm exec auth generate --config ./src/auth.ts \
  --output ../database/src/schema/auth.ts --yes
```

Better Auth's Drizzle schema is **code-generated**, not hand-written. That changes how the three Studio
tables get added: they live alongside a generated file, and editing the generated one gets overwritten.
Knowing this before the first `db:generate` saves an afternoon.

### Lazy `Proxy` for both the DB client and the env

`packages/database/src/client.ts` defers `postgres()` + `drizzle()` until first property access, and returns
`{} as DrizzleDb` when `DATABASE_URL` is missing — so CLI tools and CI migrations can import the package
without crashing.

`packages/env/src/server.ts` does the same for env validation, and adds a runtime guard that fails loudly if
the server env ever leaks into a browser bundle (it checks `toString`, `valueOf`, and symbol property
access).

Both patterns exist so that `pnpm build` works with no secrets present. Worth keeping for the same reason.

### Session populated once per request

`packages/api/src/index.ts` calls `auth.api.getSession({ headers })` once in the Hono handler and sets
`c.set("user")` / `c.set("session")`. `authMiddleware` reads from context rather than re-fetching.

Without this, every protected oRPC procedure pays a session lookup. With Studio's router surface that would
be a lookup per call in a loop an agent is driving.

### `/health` vs `/ready`

`/health` is unconditional. `/ready` executes `db.execute(sql\`SELECT 1\`)` and returns 503 on failure. Two
different questions — "is the process up" and "can it serve" — and worth keeping separate.

### `logEmailFailure` as an observability seam

An explicit shim with structured `{ userId, flow, error }` JSON and a comment saying *"hook your
observability vendor here."* The email flows themselves are dropped under decision 6, but the pattern —
one named function rather than scattered `console.error` calls — is the part to keep.

### CI splits unit and integration tests

`.github/workflows/ci.yml` runs unit tests with no database, then integration tests against
`services: postgres:16-alpine` with `db:generate` + `db:migrate` first. There is also a `pnpm env:check`
step that enforces production env invariants at build time.

Studio needs the same split: validators are unit-testable, and the write path is not.

### Branded session types

`SessionToken`, `SessionRowId`, `CurrentSessionToken`, with three explicit boundary casters. Added after a
real audit bug where `session.id` was passed where a token was expected. That bug class does not get less
likely with one user.

---

## Do not lift

**`packages/ui`.** The template is `radix-nova` on **Radix** (`radix-ui ^1.6.1`, `Slot.Root` in
`button`/`badge`/`breadcrumb`/`sidebar`, primitives imported directly elsewhere). This repo is locked on
**Base UI** (`@base-ui/react ^1.6.0`, `base-nova`). Studio consumes the existing `packages/ui`.

**`packages/email` and Resend.** With one account and signup closed there is no verification or reset flow,
which are the only two consumers of `sendAuthEmail`. The operational consequence is stated in
[admin/01-auth.md](../admin/01-auth.md): without an email transport, a lost password means database
surgery.

**The oRPC client.** `apps/app/lib/orpc.ts` builds a typed `createORPCClient` and has **zero call sites** in
the entire template. It is scaffolding, not a worked example — useful as a shape to copy, not as evidence
that a pattern is proven.

**`packages/cookies`.** Easy to misread from the name: it is a GDPR cookie-consent UI (Zustand store,
banner, preferences dialog), not Better Auth cookie helpers. Lift it only if Studio needs consent UX, which
it does not.

---

## Two corrections worth carrying

**The RPC mount path is `/rpc/*`, not `/api/rpc`.** oRPC is mounted at `/rpc/*` on the Hono app;
`API_RPC_PATH = "/api/rpc"` is the *client-side* target, reached through the catch-all at
`apps/app/app/api/[[...route]]/route.ts`. Conflating them produces a 404 that looks like a routing bug in
oRPC.

**`disableSignUp` is genuinely absent.** Better Auth defaults it to `false`, and the template does not set
it. Signup is open in the template. Decision 6 requires adding it explicitly — it is not inherited.

---

## What the template does not contain

Do not plan around these; they are absent:

- **Rate limiting.** No middleware, no store. Relevant: `saveVersion` transpiles and compiles CSS on every
  call, and the machine token is long-lived. See
  [99-frictions-and-costs.md](../99-frictions-and-costs.md).
- **Observability.** No Sentry, no OpenTelemetry. Only the `logEmailFailure` seam described above.
- **Background jobs.** No queue, no scheduler. Fine — decision 1 means there is nothing to schedule.
- **File upload.** Not needed.
- **MSW, Storybook, test factories.** A studio wanting fixtures wires them itself. `packages/auth/tests/`
  (`session`, `email`, `providers`) is a working Better Auth test surface and the fastest path to a test
  harness for a new schema.

---

## One more thing to check

`apps/app/app/api/[[...route]]/route.ts` sets `force-dynamic`, with a comment about `cacheComponents` in
Next.js 16 — the template is mid-migration on that flag. Copying the file verbatim locks Studio into a
specific render contract before deciding what it wants. Read the comment before copying the line. See
[03-nextjs-16.md](./03-nextjs-16.md).
