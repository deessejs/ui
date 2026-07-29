---
title: Organizational continuity for the deessejs registry
date: 2026-07-29
status: draft
---

# Organizational continuity for the deessejs registry

**Date:** 2026-07-29
**Status:** Draft — most of this plan is organizational, not technical. Some phases are non-actions until a co-maintainer appears.

---

## Why this matters

The deessejs registry today has one maintainer. The repo, the showcase site, the shadcn registry submission (when it happens), the npm publisher identity (if it ever exists), the community expectation, and the trust boundary all run through one identity. If that identity goes quiet for a year — for any reason, voluntary or not — the registry goes into cold storage. The code stays readable, the GitHub raw URL still serves JSON, but no new fixes, no new components, no answers in issues, and CI will eventually fail when an upstream bumps a major version.

This is the most common failure mode for solo-maintained OSS projects. It doesn't usually announce itself. It just fades.

## What this plan is — and isn't

This is not a recruitment plan. There is no way to mandate that a co-maintainer appears. This is a **readiness plan**: when a future maintainer wants to step in (because they like the project, because they're asked, because the current maintainer asks them to), the path is documented and the cost of stepping in is measured in hours, not weeks.

If no second person ever appears, the project still dies the slow death it would have. The plan cannot prevent that. It can only shorten the bus-factor-related delay and make it reversible.

## Phase 1 — Public statement of governance

A short file at `GOVERNANCE.md` (or as a section of `README.md` — either is fine, both have precedent). Captures:

- Who decides what. Today: the maintainer. Tomorrow: maintainers team.
- What kind of decisions require which level of consent. Adding a component: any maintainer. Changing the registry schema: maintainers team + announce on the project discussion surface. Cutting a release: any maintainer.
- How to escalate if the maintainer is unresponsive for >30 days. The path is documented even if no one is around to act on it today.

This is not legally binding. It's a social artifact — it sets expectations for contributors who want to know who they'll be talking to.

Skeleton:

```md
# Governance

Decision rights:
- Any maintainer can merge a PR with at least one approving review.
- The maintainers team (currently: @username) is the only group with merge rights on `main`.
- Schema or governance changes require a 7-day comment window on the PR.

If the project is unresponsive:
- After 30 days without maintainer activity on issues or PRs, anyone with a closed PR that was approved but unmerged can self-merge after a 14-day silence on a request-for-review comment.
- After 90 days, the project is considered in a frozen state. The recovery path is **repository transfer** (`Settings → Transfer ownership` on GitHub) by a known-trusted account — not a fork. Forks lose the namespace `deessejs/ui`, which is the discovery surface for the registry and the shadcn registry index entry (once Phase 6 lands). A transfer preserves both. A transfer can also happen earlier if the maintainer proactively nominates a successor.
```

Effort: 30 minutes. Worth doing now because governance by silence is worse than governance by document.

## Phase 2 — Recruit a backup maintainer

This is the only phase that has no defined end state. Either a second maintainer appears or it doesn't. Strategy:

- **Look at PR authors.** Anyone who has submitted a substantive PR is a candidate. They showed they care. Send a private message: "Want co-maintainer access? Here's what it would mean."
- **Look at issue reporters.** People who report bugs coherently are people who understand the system.
- **Don't recruit for the sake of it.** Two uninterested maintainers are worse than one motivated one. A co-maintainer who goes quiet after three months is a net negative because someone has to clean up later.
- **Make the ask small.** "Watch this repo for the next six months, merge uncontentious PRs, ping me on the questionable ones." That's a sustainable commitment for someone who'd be open to it.

If no candidate appears in 6 months: document that, accept the bus-factor risk, and re-plan.

## Phase 3 — Onboarding playbook

When a co-maintainer says yes, what do they need? A short doc at `docs/maintainers.md`:

- Access: GitHub team membership, Vercel team access (for the showcase site deploys).
- Knowledge transfer: read [[2026-07-29-shadcn-registry-adoption]] (the plan-of-record), the existing docs in `docs/learnings/`, the recent commit log.
- Operating agreements: when can you merge, when do you ask for a second review, where do secrets live, how do you run the deploy.
- Cadence: who handles issues, who answers in the discussion surface.

Effort to write: half a day. Effort to onboard a new co-maintainer with this doc: 1-2 days of overlap.

## Phase 4 — Issue triage ritual

A weekly 30-minute block, even if there's nothing to do. Purpose: keep the issue tracker fresh. A repo with 200 open issues and no responses reads dead. A repo with 50 open issues that someone triages weekly reads alive.

Triage is mostly mechanical: label, prioritize, ask for repro on bug reports, close stale issues with a "no activity in 60 days, reopen if needed" comment. Even one person doing this once a week is enough.

## Phase 5 — Bus-factor protocol

Worst case: maintainer becomes unreachable (hospital, accident, life event). Two safeguards:

- **(a) Trusted person has repo admin access.** A friend or family member listed in a sealed note with credentials. Not active in the project, but able to transfer ownership or unblock someone if needed.
- **(b) Documented hand-off.** A short `HANDOFF.md` that says who to contact, what the project's state is, what commitments exist. Updated quarterly, stored outside the repo (one copy on Google Drive, one in 1Password, or equivalent). Pointless if only the maintainer can read it.

Both of these are zero-tech, high-psychological-cost. But the alternative — and the moment of needing them is exactly when you can't make decisions — is worse. Implement them once and forget about them.

## Phase 6 — Periodic governance review

Once a year, walk through:

- Is the maintainers team list current?
- Is `GOVERNANCE.md` still accurate?
- Has the project's communication surface changed (Discord, GitHub Discussions, etc.)?
- Has anything important happened that the governance doc should reflect?

This is best done before the year-end. Cheap: 1 hour, once.

## What this plan does NOT do

- It does not promise continuity in the face of total disinterest. If the project genuinely has no user base and no second maintainer, it should be archived with grace, not kept on life support. The 90-day frozen-state line in Phase 1 is about that.
- It does not specify the technical scope of a co-maintainer's access — the [[2026-07-29-trust-boundary]] plan does that. The two plans overlap on the CODEOWNERS team membership; that's a feature, not a duplication.
- It does not prescribe how a co-maintainer should respond to a security incident. That's in [[2026-07-29-trust-boundary]] and in the future SECURITY.md if it gets written.

## Verification

| Phase | Verified by |
| --- | --- |
| 1 | `GOVERNANCE.md` exists, linked from `README.md` |
| 2 | A second GitHub user with the `Maintain` role exists in the repo (today: 0, accept the lack) |
| 3 | `docs/maintainers.md` exists and is referenced from `GOVERNANCE.md` |
| 4 | A weekly triage issue label exists, the latest triage issue is <7 days old |
| 5 | A sealed off-repo record of repo-admin credentials exists; documented in PERSONAL notes, not in the repo |
| 6 | Calendar entry for the year-end review exists |

## Cross-references

- [[2026-07-29-trust-boundary]] Phase 2 (CODEOWNERS) — depends on a maintainers team existing with at least one member, possibly two.
- [[2026-07-29-shadcn-registry-adoption]] — the plan-of-record that any new maintainer should read first.
