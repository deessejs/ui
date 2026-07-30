---
name: project-design-learnings
description: Purpose of this repo — knowledge base + working monorepo for the deessejs UI registry at ui.deessejs.com
metadata:
  type: project
---

This repo (`design/`) is both a **knowledge base** and the **working monorepo** for the deessejs UI registry. Started as research notes under `learnings/<topic>/` (anti-slop design system thesis), now also contains the actual implementation: registry components, the showcase site, and shared config packages.

**Public destination:** deployed via **Vercel** at **https://ui.deessejs.com**. Repo: **https://github.com/deessejs/ui**. Self-contained: `packages/registry/` (component library) + `apps/web/` (showcase site) + `packages/ui/` (shadcn primitives).

**Stack (locked in):**
- npm 10 workspaces (not pnpm)
- Next.js 16 App Router + React 19 + Turbopack
- Tailwind v4, semantic tokens only (no raw palette)
- shadcn/ui on **Base UI** (NOT Radix) — `packages/ui/` only
- TypeScript strict, Node 22+

**Why:** the user builds UI with agents and the output was coherent per-screen but drifted across screens. The thesis: prompting cannot fix this because it decays across context, so the fix must be *enforced* (theme namespaces deleted at the compiler level) and *fetchable* (system distributed as a registry, not re-explained).

## Architecture (current)

- `learnings/` — research notes (Tailwind, shadcn, layout, page-content, marketing-ui, agent-system). Source URL + verification date convention.
- `apps/web/` — Next.js 16 showcase site. Header, footer, nav, cards, code-block (Shiki), pager (previous/next), all on shadcn/Base UI + Tailwind v4.
- `packages/ui/` — shadcn primitives (Base UI, not Radix), tokens, globals.css. Don't touch — this is the foundation.
- `packages/registry/` — deessejs registry components. 8 components (button, colored-badge, icon-button, breadcrumb, empty, tabs, input, textarea) + 1 block (empty-state), as of 2026-07-30. Each has `index.tsx` (component + Demo export) and `meta.ts` (ComponentMeta).
- `apps/web/lib/registry/` — types, sources, aggregator. The seam for future DB-backed registry.
- `apps/web/scripts/build-sources.mjs` — build-time codegen that reads `packages/registry/src/**/*.tsx` and emits `apps/web/lib/registry/sources.generated.ts`.

## Timeless patterns (apply to all future work on this project)

### Encodeability at the type level

**Required fields, no fallback.** Every `ComponentEntry` has `Demo: React.ComponentType` (required). Every card takes `preview: ReactNode` (required). Every category has `Preview: React.ComponentType`. There is no "placeholder if missing" — TS errors at compile time if anyone adds a component without a Demo. This is the project's *anti-slop* principle applied: don't let the system degrade to a default.

**Add a component** = create `index.tsx` + `meta.ts` + register in `apps/web/lib/registry/index.tsx`. See `.claude/skills/add-component/SKILL.md`.

### Build pipeline (do not break this chain)

1. `prebuild`: `node scripts/build-sources.mjs` — reads sources, writes `sources.generated.ts`
2. `npm run build -w @workspace/registry` — produces `packages/registry/dist/`
3. `next build` — bundles everything

All three steps are chained in `apps/web/package.json`'s `build` script. **Do not split them** — Vercel's auto-detected turbo scope is `web` only, so the registry needs to be built by npm-workspace before next runs. The generated `sources.generated.ts` is **checked into git** so cold builds work without re-running prebuild.

### Vercel-specific gotchas

- **No `fs.readFileSync` at runtime.** `packages/registry/src/**` is not in the deployed bundle. Source extraction happens at build time via the codegen script.
- **`?raw` imports don't work in this Next.js + Turbopack + workspaces combo.** Tested and confirmed.
- **`@workspace/registry/*` must resolve via `dist/`** — the registry needs to be built before the web build.

### Card system (visual language)

- Flat: no `rounded-lg`, no per-card borders
- `bg-background` on cards (blends with page)
- Dividers via Tailwind: `divide-y divide-border sm:divide-y-0 sm:divide-x` on the grid container, `border-b border-border` on the inner preview/body separator
- Preview area: `h-60 sm:aspect-square` with `previewClassName="sm:h-60"` override when the card spans 2 cols
- Last item in odd-count grids gets `sm:col-span-2 sm:border-t sm:border-border` for the row separator

### Layout principles (from `docs/learnings/layout/`)

- **Modulation**: sparse → dense → sparse. Not uniform `gap-X` everywhere.
- **One focal anchor** per page (the H1 on the homepage, the Preview tab on detail pages). Rest is subordinate.
- **Named relationships**: H1 → subtitle (`gap-12`), subtitle → CTA (`gap-8`), section → section (`pt-24 pb-24`). Not all the same gap.
- **Macro frame**: `border-t border-border` to delimit page-level sections.

### Brand

- Display name: **DeesseJS** (capital D, S)
- URLs and repo paths: lowercase `deessejs.com`, `github.com/deessejs/ui`
- Repo package: `@workspace/registry`

### Conventions

- Components organized in folders with `index.ts` barrel: `headers/`, `footers/`, `nav/`, `cards/`, `pager/`
- JSX needs `.tsx` files. **Never put JSX in `.ts` files** — rename to `.tsx`
- Server components by default. `"use client"` only when needed
- `cn()` helper for conditional classes (from `@workspace/ui/lib/utils`)
- Semantic tokens only. No raw palette utilities. No `dark:` variants (tokens handle both modes)
- Typecheck from `apps/web/`, not repo root: `cd apps/web && npx tsc --noEmit`

### Workflow

- **Don't commit/push without explicit confirmation** from the user
- Memory updates without code changes are fine
- Skill files live in `.claude/skills/<name>/SKILL.md`

See [[user-profile]] and [[feedback-concrete-over-theory]].