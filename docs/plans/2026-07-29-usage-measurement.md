---
title: Usage measurement for the deessejs registry
date: 2026-07-29
status: draft
---

# Usage measurement for the deessejs registry

**Date:** 2026-07-29
**Status:** Draft — awaits calibration on what counts as "usage" worth counting.

---

## Why this matters

We currently have no signal that anyone uses the registry. The CI doesn't measure it. The showcase site could go to zero traffic and we'd notice only if a contributor mentioned it. That's a slow failure mode that we've seen play out in many solo-maintained OSS projects.

Two different "use" signals are useful to distinguish:

1. **Catalog discovery.** Someone visits `ui.deessejs.com`, browses, leaves. Top-of-funnel.
2. **Install intent.** Someone runs `npx shadcn add deessejs/ui/ds-button` against the registry. Bottom-of-funnel.

Phase 6 of the main plan ([[2026-07-29-shadcn-registry-adoption]]) — submission to the shadcn registry index — addresses some of #1 (catalog becomes searchable globally via `https://ui.shadcn.com/r/registries.json`), but submission is not the same as measurement. The shadcn index listing does not currently expose per-registry usage counts.

#2 is what tells us if the registry is alive. Today, that signal is unobservable.

## What to measure, what not to

| Signal | Value | Risk |
| --- | --- | --- |
| Number of `/r/<item>.json` GET requests | High — direct install proxy | Low — these are JSON endpoints; legitimate install traffic looks like scripted polling, hard to distinguish |
| Referer (`shadcn-ui/cli`, `raw.githubusercontent.com`) on the above | High — separates installs from pollers | Medium — Referer may be stripped by privacy networks |
| User-Agent on the above | Medium — flags dev tools, only humans/clis set UA | Low |
| IP + (day, item) aggregate | Medium — dedupe across retries and accidental re-installs | Medium — IP is PII in some jurisdictions |
| Per-user identity (npm install counts, etc.) | Highest signal-to-noise | Highest — privacy, legal (GDPR, CCPA), ethical |

Recommend: aggregate `(item, day)` counts with a coarse-geography hint derived from Vercel's edge headers, no IP storage, no UA fingerprinting. That's enough to "is anyone using it" without becoming surveillance.

## Three approaches considered

**(A) Vercel Web Analytics on the JSON endpoints.** Vercel ships turnkey analytics that work on any URL pattern. No code change. Page-level metrics don't differentiate `/r/<item>.json` from a regular page in the dashboard, but in Vercel's edge logs (Functions tab), each request is visible. Cost: zero (Vercel Analytics is free for the basic tier on Vercel).

**(B) Custom route handler that wraps the JSON.** Add `apps/web/app/r/[name].json/route.ts` that proxies a `Response`, logs the request to a destination we control (Tinybird, ClickHouse, even a flat file in a private Vercel KV), then returns. Add a per-route delay of <1ms. Cost: ~1 hour of code; ongoing cost: KV writes (~thousandths of a cent per request at this scale).

**(C) Off-the-shelf analytics.** Plausible, Umami, Fathom — privacy-respecting and lightweight. But designed for HTML pages, not JSON endpoints. Might require a synthetic HTML wrapper. Probably overkill.

Recommend **(A) + a thin custom logger** combined. Vercel Analytics for the broad strokes ("does the JSON endpoint get hit at all"), a custom log line for the per-(item, day) breakdown that gives us the install lens.

## Phase 1 — Vercel Analytics on the showcase site

Discovery-side metrics only — this does NOT measure install traffic. Implementation:

1. Add `import { Analytics } from "@vercel/analytics/react"` to `apps/web/app/layout.tsx` and render `<Analytics />` inside the `<body>`. The package needs to be added explicitly to `apps/web/package.json` (not transitive).
2. Enable Web Analytics in the Vercel dashboard (Project → Analytics → Enable).
3. Deploy.

What you get: page-view analytics on `ui.deessejs.com` (homepage, components index, individual component detail pages). Tells you discovery shape — which pages get visited, where drop-off happens, whether the new `README.md` install section pulls traffic back to the site. Does NOT measure `/r/<item>.json` traffic: the Analytics snippet is client-side HTML and does not fire on JSON endpoints. Phase 2 covers the install-side measurement.

Effort: 15 minutes. Code change: one import line + one component in the layout.

## Phase 2 — Aggregate from Vercel edge logs

**The original draft of this phase proposed a custom route handler at `apps/web/app/r/[name].json/route.ts`. That approach is wrong, for two architectural reasons that interact:**

1. **Static delivery takes priority over route handlers.** The build pipeline emits `apps/web/public/r/<item>.json`, and Vercel's CDN edge serves those files directly. A route handler at `app/r/[name].json/route.ts` only intercepts if the static file is absent. Result: either the handler is dead code (static wins), or we delete the static files and lose fast delivery.
2. **Edge cache hides traffic from any application code we write.** With `cache-control: public, max-age=...` at the edge, repeat installs are served from the CDN cache without invoking any function. Even a working route handler would only count cache misses, not installs — undercounting by a large factor.

The fix is to consume Vercel's edge logs directly, where every request — including cache hits — shows up. Implementation:

1. Confirm the project's edge logs include `/r/*.json` paths. (Vercel dashboard → Observability → Logs. The path should appear in the standard access log without further config.)
2. Provision Vercel KV (Storage → KV → Create) for the aggregated counts. One database, free tier is more than enough at this scale.
3. Write `scripts/aggregate-usage.mjs`:
   - Pulls the last 24h of edge logs via Vercel API (`/v1/projects/:id/logs` or whatever the current endpoint is — check Vercel docs at implementation time; the exact endpoint changes across versions).
   - Filters to paths matching `^/r/[a-z0-9-]+\.json$`.
   - Groups by `(item, day)` where `day` is the request's UTC date.
   - For each `(item, day)`, increments `usage:<day>:<item>` in Vercel KV atomically (or idempotently — see below).
4. Schedule it. Two viable approaches:
   - **(a) Vercel cron job** (`vercel.json` `crons` config). Runs daily at 03:00 UTC. Requires Vercel Pro plan for cron (free tier has 1 cron job but Vercel schedule cost). Use the cron job to call a tiny Vercel-protected endpoint (`/api/aggregate-usage?key=...`) that itself runs the aggregation. Or have the aggregation run as a long-lived process if Vercel Functions supports it.
   - **(b) GitHub Actions scheduled workflow** (e.g., `schedule: cron: "0 3 * * *"`). Runs outside Vercel. Reads edge logs via Vercel API using a project-scoped token (Vercel → Settings → Tokens). Writes to Vercel KV using a KV token.

   Choose **(b)** GitHub Actions. It avoids Vercel plan friction and uses the same CI infrastructure as the rest of the project. Schedule: daily at 03:00 UTC.

Idempotency: the aggregation script should be runnable multiple times per day without double-counting. The simplest design is to derive `(item, day)` from the request timestamp, store the count in `usage:<day>:<item>` in KV, and on each run re-run the aggregation for the previous 24h, overwriting the day's counter. This is idempotent within a day. Cross-day corrections are possible by re-running with a different time window, which is fine.

What we do NOT log per request — privacy shape:

- No IP storage.
- No User-Agent storage.
- No referer storage.
- Aggregation buckets are `(item, day)` only, with the bucket count. Anything finer would require re-identifying the request, which we don't do.

Effort: 1 day for the aggregation script + the GitHub Actions workflow file. The KV setup is a 5-minute dashboard click.

**Subsequent phases in this plan (dashboard, alerts, privacy disclosure) operate on the data shape produced here, which is `(item, day, count)` in KV — not on per-request data.**

## Phase 3 — Aggregation

Daily rollup. Pick a window:

- **(3a)** Compute at query time. Slow when data grows. Fine until ~100K rows.
- **(3b)** Compute on write. A scheduled function that aggregates the day's logs into a `daily_item_counts` table. Faster reads, more code.

Recommend **(3b)** once the volume justifies it. For now, **(3a)** is enough — a quick `SELECT item, count(*) FROM logs WHERE day >= now() - INTERVAL '7 days' GROUP BY item` is fine on a few thousand rows.

The data shape is `(item, day, count)`. Stored daily. Retention: indefinite at this scale (1 row per item per day ≈ 365 rows/item/year; 3 items * 365 * 5 years = 5,475 rows, trivial).

## Phase 4 — Internal dashboard

A `/admin/usage` page on the showcase site (gated by a middleware that requires a `?key=...` query string the maintainer can supply). Shows:

- Last 7 days: per-item fetch counts (bar chart)
- Last 30 days: total unique items fetched across all days
- Last 90 days: trend line

This is a small Next page that reads from Vercel KV. The dashboard URL is unguessable-by-default and only known to the maintainer. Not a secret that ships to users; if it leaks, rotate the key.

Effort: half a day.

## Phase 5 — Threshold alerts

Once you have data, set guard-rails:

- **Alert if total per-day fetches drop to 0 for 7 consecutive days.** Probably means either the registry is unused (need to publish more, or accept it's dead) OR the endpoint is broken (need to fix).
- **Alert if any single day exceeds the 30-day average by 5x.** Likely a viral spike or possibly an attack; either way worth a look.
- **Weekly summary email.** A Monday-morning email with last week's totals. 5 minutes of code if using Resend/SendGrid, or just a manual copy-paste from the dashboard.

The alerts don't need to be elaborate. A weekly summary is the high-leverage one. The others are nice-to-have.

## Phase 6 — Privacy disclosure

Add a one-liner to `README.md` and to a new `PRIVACY.md`:

> The deessejs registry logs anonymous fetch counts on its public JSON endpoints. No personal data, no IP storage, no fingerprinting. Logs retained for 12 months. See `/admin/usage` methodology for details.

That's the entire privacy commitment. We don't need a cookie banner, GDPR data subject rights machinery, or anything else — we're not collecting personal data.

If the project ever operates under GDPR (likely, if it serves EU consumers), confirm with a privacy review that the data collection shape is genuinely anonymous. Edge cases to consider: a small enough daily count that an item fetch could be reverse-linked to a specific consumer. Mitigate by aggregating at the (item, day) level only and dropping request-level data after aggregation.

## What this plan does NOT do

- It does not install Google Analytics, Segment, or any cross-site tracker. The privacy disclosure above would be a lie if we did.
- It does not measure individual installs across registries (impossible without consumer-side telemetry). It only measures traffic to our own endpoint, which is an upper bound on installs because GitHub-registry mode never touches our endpoint.
- It does not tell us *who* is using the registry. Anonymity is the trade for honesty.

## Verification

| Phase | Verified by |
| --- | --- |
| 1 | Vercel Analytics dashboard shows non-zero traffic on `ui.deessejs.com` |
| 2 | A `curl https://ui.deessejs.com/r/ds-button.json` appears in the next edge-log aggregation's input; after the daily cron runs, the `(ds-button, day)` count in Vercel KV increments |
| 3 | Aggregated row count matches raw log count for a 24h window |
| 4 | Dashboard renders at `/admin/usage?key=...` with sensible numbers |
| 5 | Threshold alerts fire on a synthetic zero-traffic day (test) and on a 5x spike (test) |
| 6 | `PRIVACY.md` present; the disclosure matches the data actually collected |

## Cross-references

- [[2026-07-29-shadcn-registry-adoption]] — Phase 6 of the main plan mentions measurement as a precondition for `shadcn registry index` submission. This plan covers that measurement.
- [[2026-07-29-trust-boundary]] — The custom route handler in Phase 2 lives in `apps/web/`, which is in the `CODEOWNERS` trust zone. Logging code that filters on `name` (defensive coding in the route handler) reads similarly to the security model in the trust-boundary plan.
