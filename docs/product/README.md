# deessejs UI Registry

The official component registry of [deessejs.com](https://deessejs.com), published at **[ui.deessejs.com](https://ui.deessejs.com)**.

A showcase of every UI component used across the deessejs.com product surface. Each component is rendered live, grouped by category, and presented with its source code.

## What this is

`design/` is a monorepo that hosts the registry site (`apps/web`) and the component library it consumes (`packages/ui`).

The registry is **local-first**: components live in this repository, and adding a new component ships on the next deploy. There is no runtime registration, no admin API, no database. The site is fully static from the user's perspective.

## Components and blocks

The registry lists two kinds of items, both following the same routing pattern:

- **Components** — atomic UI primitives (buttons, inputs, dialogs, …). What other registries typically call "components" or "ui".
- **Blocks** — composed, larger pieces that wire components together (a pricing card, a hero-with-claim, a feature grid, a settings panel). What other registries typically call "blocks" or "sections".

The distinction is size and intent, not technology: a block is a React component that lives in the same workspace and uses the same tokens. The taxonomy here is the same one unpacked in `docs/learnings/marketing-ui/`.

## The pages

```
/                                       Homepage — grid of components and blocks
/components                             Components index — all categories
/components/[category_id]               Component category page
/components/[category_id]/[component_id] Component detail page — visual + source code
/blocks                                 Blocks index — all categories
/blocks/[category_id]                   Block category page
/blocks/[category_id]/[block_id]        Block detail page — visual + source code
```

The category and item IDs are slug-style identifiers that match the entries in the registry manifest — the single source of truth that drives the home grid and the category pages.

## The deploy-to-add model

Components and blocks are not registered at runtime. They are committed to this repository and ship when the site is deployed.

To add a new component:

1. Add the component to `packages/ui/src/components/`.
2. Register it in the registry manifest (the single source of truth for what the site lists).
3. Open a pull request. The new component ships on the next deploy.

To add a new block:

1. Add the block to `packages/ui/src/blocks/`.
2. Register it in the registry manifest under the blocks section.
3. Open a pull request. The new block ships on the next deploy.

This is the deliberate trade-off. The registry is read-only at runtime, so the public site needs no API, no auth, and no persistence. The cost is that every addition is a code change — reviewable, versionable, and visible in the git history.

## Stack

- **Next.js 16** (App Router) — see the root `AGENTS.md` for the warning on breaking changes in this version.
- **React 19**
- **Tailwind CSS v4** with semantic tokens; raw palette utilities are not used.
- **shadcn/ui** on **Base UI** (not Radix), `base-nova` style, `neutral` base color, `lucide` icons.
- **Turbo** for the monorepo. Workspaces: `apps/*` and `packages/*`.

The design system that backs the components is documented under `docs/learnings/`. The short version: tokens are enforced at the compiler level (`--color-*: initial`), components are real React components living in the workspace, and the layout theory follows the Vercel/Linear playbook captured in `docs/learnings/layout/`.

## Repository layout

```
design/
├── apps/
│   └── web/                       The registry site (Next.js 16)
│       ├── app/                   App Router routes (/, /components/...)
│       ├── components/            App-level components
│       └── components.json        shadcn config — tied to packages/ui
├── packages/
│   ├── ui/                        @workspace/ui — the component library
│   │   └── src/components/        Where new components are added
│   │   └── src/blocks/            Where new blocks are added
│   ├── eslint-config/             Shared ESLint config
│   └── typescript-config/         Shared TypeScript configs
├── docs/
│   ├── product/                   Product documentation (this README)
│   └── learnings/                 Research notes — back the design system
├── AGENTS.md                      Agent context for the repository
└── turbo.json                     Monorepo task graph
```

## Where to start

- **Adding a component:** see the existing components in `packages/ui/src/components/` for the pattern, then update the registry manifest.
- **Adding a block:** see `packages/ui/src/blocks/` (when populated) and the conventions in `docs/learnings/marketing-ui/`. The block should compose existing components and stay within the design system tokens.
- **Design system reference:** see `docs/learnings/`. The `agent-system/` folder states the encodeable design rules; `layout/` covers the composition theory; `marketing-ui/` catalogs the evocative primitives; `page-content/` covers section content.
- **Agent instructions:** see `AGENTS.md` at the root before writing any Next.js code.
