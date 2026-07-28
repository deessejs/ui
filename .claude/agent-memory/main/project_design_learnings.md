---
name: project-design-learnings
description: Purpose of this repo — a knowledge base + working monorepo for the deessejs UI registry at ui.deessejs.com
metadata:
  type: project
---

This repo (`design/`) is both a **knowledge base** and the **working monorepo** for the deessejs UI registry. Started as research notes under `learnings/<topic>/` (anti-slop design system thesis), now also contains the actual implementation: registry components, the showcase site, and shared config packages.

**Public destination:** the monorepo will be migrated to **https://github.com/deessejs/ui** and deployed via **Vercel** at **ui.deessejs.com**. The repo will be self-contained: `packages/registry/` (the component library) + `apps/web/` (the showcase site) + `packages/ui/` (shadcn primitives).

**Why:** the user builds UI with agents and the output was coherent per-screen but drifted across screens. The working thesis: prompting cannot fix this because it decays across context, so the fix must be *enforced* (theme namespaces deleted at the compiler level) and *fetchable* (system distributed as a registry, not re-explained).

**Architecture (current):**
- `learnings/` — research notes (Tailwind, shadcn, layout, page-content, marketing-ui, agent-system). Source URL + verification date convention.
- `apps/web/` — Next.js 16 showcase site. Header, footer, nav, cards, code-block (Shiki), pager (previous/next), all on shadcn/Base UI + Tailwind v4.
- `packages/ui/` — shadcn primitives (Base UI, not Radix), tokens, globals.css. Don't touch — this is the foundation.
- `packages/registry/` — the deessejs registry components. Currently has Button (re-export) + IconButton (real impl). Each component has `index.tsx` + `meta.ts`. Source extraction via `fs.readFileSync` at module load.
- `apps/web/lib/registry/` — types, sources, aggregator. The seam for future DB-backed registry.
- `docs/product/README.md` — product-facing README for the registry site.

**How to apply:**
- Doc convention: source URL + verification date at the top, vendor-documented facts separated from our own judgment, applied synthesis docs explicitly labelled as opinion.
- Components: each `packages/registry/src/components/<id>/` has `index.tsx` (component + Demo export) and `meta.ts` (ComponentMeta). New components are added to `apps/web/lib/registry/{index,sources}.ts`.
- Conventions: semantic tokens only (no raw palette), `flex + gap-*` (no `space-*`), `font-mono text-xs` for technical labels, no `dark:` variants (tokens handle both modes), `cn()` helper for conditional classes.
- Typecheck must stay green at every step.

See [[user-profile]] and [[feedback-concrete-over-theory]].