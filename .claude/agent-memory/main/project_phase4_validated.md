---
name: project-phase4-validated
description: External install end-to-end validation completed 2026-07-29 — Phase 6 (submit to official shadcn registry index) gate is now satisfied
metadata:
  type: project
---

Phase 4 of [[project-design-learnings]] validated on 2026-07-29: a fresh Next.js 16 + Tailwind v4 + shadcn consumer sandbox installed all 3 ds-* components from `https://ui.deessejs.com/r/*.json`, built clean, and rendered SSR with correct tokens.

**Sandbox:** `temp/sandbox-validate/` (Next 16.2.12, React 19.2.4, Tailwind v4, shadcn init `--defaults` → preset `base-nova`).

**Evidence:**
- `npx shadcn@latest add https://ui.deessejs.com/r/ds-button.json` → `components/ui/ds-button.tsx`, peer deps (`@base-ui/react`, `cva`, `clsx`, `tailwind-merge`) installed
- Same for `ds-icon-button.json`, `ds-colored-badge.json`
- `npm run build` → "Compiled successfully in 3.4s", TypeScript clean, 4 static pages
- `npx next start -p 3939` + `curl` → HTTP 200, 18.7 KB HTML containing `data-slot="button"`, `bg-primary`, `bg-blue-600/10`, `aria-label`, "variant helper OK" (proves `dsButtonVariants` runtime helper works)

**Drift fixes confirmed shipped in prod:**
- `d90b7d9` — `ds-colored-badge` consumer inlined workspace Badge class strings
- `e2e47a4` — blue shade bumped from `bg-blue-500` to `bg-blue-600` across both trees
Both fixes visible in the deployed JSON at `https://ui.deessejs.com/r/ds-colored-badge.json`.

**Why:** the Phase 6 gate in `docs/plans/2026-07-29-shadcn-registry-adoption.md` explicitly defers submission to `https://ui.shadcn.com/r/registries.json` until *"at least one external user has confirmed an install end-to-end."* That gate is now formally satisfied — independent verification against the deployed registry, not just the contract test shim.

**How to apply:**
- Phase 6 PR is now legitimate to open. The submission entry is locked in the plan: `{ "name": "deessejs", "url": "https://ui.deessejs.com/r/{name}.json", "homepage": "https://ui.deessejs.com", "description": "DeesseJS components — Base UI on shadcn base-nova tokens." }`
- Reuse the `temp/sandbox-validate/` pattern for any future regression check (refresh `node_modules`, re-add, re-curl) — non-disruptive, lives outside the workspace tree
- The Turbopack multi-lockfile warning during build was sandbox-specific (parent repo + sandbox both have lockfiles), not a registry issue — do not chase it

Related: [[project-design-learnings]]