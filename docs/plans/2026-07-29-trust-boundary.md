---
title: Trust boundary for the deessejs shadcn registry
date: 2026-07-29
status: draft
---

# Trust boundary for the deessejs shadcn registry

**Date:** 2026-07-29
**Status:** Draft — awaiting calibration on threat model.

---

## Why this matters

A shadcn registry is not a packaged npm dependency. When a consumer runs `npx shadcn add deessejs/ui/ds-button`, the CLI fetches a JSON file from `raw.githubusercontent.com` (GitHub mode) or `ui.deessejs.com/r/ds-button.json` (URL mode) and **copy-pastes the `.tsx` files into the consumer's project**. They become executable TypeScript in third-party production apps. A malicious or compromised commit on `main` propagates into every project that installs it, with no central audit gate (no `npm install` provenance, no signed tarball, no install-warning flow).

The realistic threat for this project is not nation-state or organized crime. It is:

1. **Compromised maintainer credential.** A leaked GitHub PAT, an attacker who phishes the maintainer once, or a takeover via a vulnerable session cookie.
2. **Compromised local dev environment.** A npm post-install script or an IDE plugin that exfiltrates cookies / tokens.
3. **Sloppy review under fatigue.** A real PR with malicious intent slipping through because the maintainer was in a hurry.
4. **Subtle supply-chain attack via dependencies.** A `clsx@2.x` upgrade that quietly changes behavior on certain inputs.

None of these requires dedicated attacker infrastructure. All of them are within reach of an opportunistic attacker.

## Threat model — calibrated

| Target | Effort to attack | Attacker payoff |
| --- | --- | --- |
| Push malicious code to `main` without PR | Low if no branch protection | Medium — installs land in consumer apps within hours |
| Sneak malicious code in a plausible PR | Medium (requires bypassing review) | High — passes casual review |
| Compromise a maintainer account | High | Very high |
| Subtle dependency upgrade | Low (PR automation, low review attention) | Medium — affects all consumers at once |

The goal is not zero-risk (impossible) but to raise the cost of attack above the median level for a maintained-by-one-person OSS registry. That median is "trust the maintainer + CI catches breakage". We already have CI; we are missing the maintainer-side defenses.

## Approach

Defense in depth, four layers:

1. **Branch protection** — required reviews, required status checks, no direct push to `main`. The cheapest, highest-leverage move.
2. **CODEOWNERS** — explicit ownership of `registry/` and `apps/web/scripts/` so a PR touching them automatically requests review from the right people (today, one person; eventually two).
3. **2FA + signed commits** for maintainers. Lower friction than branch protection because it's a per-person config.
4. **Periodic audit cadence** — quarterly review of who has access, what permissions, what got merged recently that didn't follow process. Catches the slow drift.

Each layer is small in isolation; together they make the realistic attacks above uncomfortable to attempt.

## Phase 1 — Branch protection on `main`

Two paths:

**(a) GitHub UI.** Settings → Branches → Branch protection rules → Add rule for `main`. Enable:

- Require a pull request before merging
- **Require review from Code Owners** — this is the critical choice, not the misleadingly-named "Require approvals". "Require approvals: N" alone lets the author self-approve their own PR on GitHub. "Require review from Code Owners" makes a code-owner-member review mandatory and the author cannot satisfy that requirement for their own PR.
- Dismiss stale pull request approvals when new commits are pushed (prevents stale approvals sticking after force-pushes)
- Require status checks to pass before merging: pick the 5 jobs from the CI workflow by name (`Registry validate`, `Lint`, `Typecheck`, `Contract test`, `Build showcase`)
- Require linear history (no merge commits into `main`)
- Do not allow bypassing the above settings

**(b) GitHub Rulesets API (preferred at scale).** Encodes the same rules as YAML, version-controllable, can apply across multiple repos. Skip until we have ≥2 repos. The UI path is fine for one repo.

### Critical caveat — solo mode

Branch protection is only as strong as the people reviewable for it. With a single maintainer, **even "Require review from Code Owners" cannot be effective** because there is no second person to do the review. The minimum effective setup requires:

1. A `@deessejs/maintainers` GitHub team with **2 members minimum**.
2. Code Owner files (Phase 2) covering the protected paths.
3. Branch protection with "Require review from Code Owners" enabled.

If you're solo today, Phase 1 alone gives you no defense against your own compromised session. Three acceptable paths:

- **(a)** Defer enabling branch protection (or only enforce status checks, not approvals) until you have a co-maintainer (see [[2026-07-29-organizational-continuity]] Phase 2). Status checks alone catch breakage, not malicious commits.
- **(b)** Enable full branch protection now and recruit a co-maintainer as a hard prerequisite. Slow but safe.
- **(c)** Enable protection with status checks only (no approval requirement), as a partial defense — accepts the malicious-commit risk in exchange for catching regressions.

Recommendation: **(a) or (b)**. (c) is acceptable if you accept the structural risk and prioritize regression-prevention.

Effort: 10 minutes in the UI.

Verification: a direct push to `main` via `git push origin main` from your local should be rejected with a "remote rejected" message. Open a PR on a feature branch and confirm the merge button is greyed out until CI is green.

## Phase 2 — CODEOWNERS

Create `CODEOWNERS` at the repo root:

```
# Default owners for the whole repo
* @deessejs/maintainers

# Registry source tree — the highest-impact path. Every change here
# ships to consumers and must be reviewed by at least one maintainer
# other than the author.
/registry/ @deessejs/maintainers
/registry.json @deessejs/maintainers

# Build pipeline — emits what consumers install. Same review bar.
/apps/web/scripts/ @deessejs/maintainers

# CI workflow — gates the registry itself.
/.github/ @deessejs/maintainers
```

`@deessejs/maintainers` is a GitHub team. If solo today, that's a one-person team. Two-person once we recruit (see [[2026-07-29-organizational-continuity]]).

**Action:** Create the team under the org (Settings → Teams → New team: `@deessejs/maintainers`, privacy: visible). Add yourself. Add code-review permissions on the repo.

Effort: 15 minutes.

## Phase 3 — 2FA + signed commits

2FA: enforce it for yourself and for any maintainer added later. GitHub org-wide enforcement is under Settings → Organization security → Two-factor authentication → Require 2FA for all members.

Signed commits: each maintainer sets up GPG or SSH signing on their commits, then enables "Require signed commits" in branch protection (toggle in the same screen as Phase 1). This adds a friction: a forgotten GPG key blocks your own commits. Worth it for security, optional for solo if it gets in the way.

Effort per person: ~30 minutes one-time. CI / tooling impact: zero.

## Phase 4 — Provenance attestation (if available)

Some shadcn-compatible registries sign their JSON manifests with a provenance token that the CLI can verify. shadcn's `registry validate` does not yet verify provenance at the time of writing. Re-check when `shadcn@3.x` ships. Treat as out-of-scope for now.

## Phase 5 — Periodic audit

A 30-minute quarterly ritual. Walking checklist:

- Who has `maintain` or `write` access to the repo? Should match the maintainer team roster, nothing more.
- Any personal access tokens still active for users who left the team?
- Last 30 days of merges: any pattern of "merged by X without review"? That means branch protection regressed.
- Dependency updates merged without review? Should be none, since dependabot/renovate PRs also need a review.
- `registry/` directory: any commit not authored by a maintainer? Should be none.

Save the checklist as `docs/security-audit.md` so it can be re-run without re-deriving.

## What this plan does NOT do

- It does not introduce additional build-time security scanning (e.g., CodeQL). Worth considering later if the project grows. The cost is CI minutes + maintenance of false positives; the benefit at current scale is marginal.
- It does not require signed releases for the showcase site — those are gated by Vercel + domain, not by our registry.
- It does not implement any runtime safety on the consumer end. Once someone installs `ds-button`, our defense stops.

## Verification

| Phase | Verified by |
| --- | --- |
| 1 | Direct `git push origin main` rejected; PR can't merge until 5 CI jobs green |
| 2 | A PR that touches `registry/base-nova/` auto-requests `@deessejs/maintainers` review |
| 3 | GitHub user admin shows 2FA enabled for every org member |
| 4 | n/a — deferred to shadcn schema evolution |
| 5 | Quarterly audit doc updated, no surprises |

## Open questions

- **Q1.** Solo today — which of the three paths in Phase 1 (defer, recruit first, or partial)? Drives whether Phase 2 (CODEOWNERS) is immediately useful or lands later.
- **Q2.** Branch protection requires status checks to be present in the workflow file first. Today we have all 5 named jobs in `.github/workflows/ci.yml`. Confirm with a test PR that branch protection actually blocks merge until the 5 jobs report green.

## Cross-references

- [[2026-07-29-organizational-continuity]] — Phase 2 (`CODEOWNERS`) and Phase 1 (`@deessejs/maintainers` team) both depend on having at least one maintainer beyond you. The team exists with one member today; recruitment is the continuity plan.
- [[2026-07-29-drift-detection]] — Phase 4 of the drift plan (the `scripts/check-registry-drift.mjs`) lives in `apps/web/scripts/`, which Phase 2 of this plan flags as protected. Make sure both protections apply.
