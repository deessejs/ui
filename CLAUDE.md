# Project conventions

## Branch workflow

- `main` is protected. Direct push is rejected by GitHub.
- Always work on a feature branch:
  ```sh
  git checkout -b feat/<short-name>
  ```
- Push the branch and open a PR — never commit to `main` directly.
- After merge, the feature branch stays around; clean up with `git branch -d <name>` if desired.
- `git checkout main && git pull` syncs the merged result locally.

## Commit messages

Bash interprets backticks as command substitution. Writing commit messages inline with `-m "..."` loses any content inside backticks (paths like `@ui/`, `@components/` will silently break).

Use a heredoc for any non-trivial message:

```sh
cat > /tmp/commit-msg.txt <<'CMSEOF'
feat(scope): short title

Body line 1.
Body line 2 with @ui/ path.
CMSEOF
git commit -F /tmp/commit-msg.txt
```

Inline `-m` is fine for one-line commit titles.

## Don't push without explicit confirmation

`git push` and `gh pr create` require explicit user sign-off each time. Local commits don't — only outbound network operations.

## Build pipeline (must run in this order)

```sh
# 1. Workspace registry package — produces dist/
npm run build -w @workspace/registry

# 2. Source extraction — emits sources.generated.ts (bundled at build time, no runtime fs reads)
node apps/web/scripts/build-sources.mjs

# 3. Registry JSON emission — emits public/r/<item>.json
node apps/web/scripts/build-registry.mjs

# 4. Next.js build — bundles apps/web
cd apps/web && npm run build
```

Steps 2-4 are chained via `apps/web/package.json`'s `prebuild` script. Step 1 must run separately because it produces dist that apps/web imports.

## Validation before pushing

```sh
node apps/web/scripts/check-registry-drift.mjs   # consumer vs showcase drift
node apps/web/scripts/contract-test.mjs         # consumer-shim type-check against registry sources
cd apps/web && npx tsc --noEmit                  # apps/web typecheck
cd apps/web && npm run build                     # full Next build
```

If a registry item introduces a new npm peer dep, the contract test (`contract-test.mjs`) install list must mirror it — see memory `feedback_registry_deps_coupling.md` and the `add-component` skill's Common pitfalls section.

## Skills

- `.claude/skills/add-component/SKILL.md` — adding a single-file ds-* component
- `.claude/skills/add-block/SKILL.md` — adding a ds-block-* block (composes other ds-* items)

## Memory

Project-level memories live at `.claude/agent-memory/main/`:
- `MEMORY.md` — index
- `project_design_learnings.md` — architecture, conventions, what's locked
- `project_phase4_validated.md` — Phase 4 (external install) validation, Phase 6 gate status
- `feedback_concrete_over_theory.md` — design-talk framing preference
- `feedback_registry_deps_coupling.md` — contract test install list coupling
- `user_profile.md` — user role, language preference, stack

## Related plan docs

- `docs/plans/2026-07-29-shadcn-registry-adoption.md` — registry adoption decisions (locked)
- `docs/plans/2026-07-29-drift-detection.md` — drift detection tolerance policy
- `docs/plans/2026-07-29-organizational-continuity.md`
- `docs/plans/2026-07-29-trust-boundary.md`
- `docs/plans/2026-07-29-usage-measurement.md`
- `docs/registry/audit-2026-07-29.json` — drift audit, per-item paths
