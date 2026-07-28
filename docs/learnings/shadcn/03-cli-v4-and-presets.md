# CLI v4 and Presets

**Source:** https://ui.shadcn.com/docs/changelog/2026-03-cli-v4 — verified 2026-07-28

The March 2026 release, stated purpose: *"More capable, easier to use. Built for you and your coding agents."*

## `--preset`

A preset packs an entire design system config into a short code: colors, theme, icon library, fonts, radius.

```bash
pnpm dlx shadcn@latest init --preset a1Dg5eFl
```

Build presets visually on shadcn/create, preview against real components, copy the code.

Key property: **the code is portable across tools.** Claude, Codex, v0, Replit. Drop it in a prompt and the agent starts from your system rather than from the shadcn default. This is a meaningful answer to "how do I stop re-explaining my design system every session."

**Named presets:** `nova`, `vega`, `maia`, `lyra`, `mira`, `luma`
**Preset codes:** version-prefixed base62 strings, e.g. `a2r6bw`, `b0`

### Switching

```bash
pnpm dlx shadcn@latest apply a2r6bw                     # overwrite components + fonts + CSS vars
pnpm dlx shadcn@latest apply a2r6bw --only theme        # theme only
pnpm dlx shadcn@latest apply a2r6bw --only theme,font   # theme + font
```

`--only` supports `theme` and `font`. **`icon` is intentionally unsupported** — icon changes may require a full component reinstall and code transforms.

Four documented strategies when switching, and the skill instructs agents to *ask which one first*:

| Strategy | Command | Effect |
| --- | --- | --- |
| Overwrite | `apply <code>` | Replaces detected components, fonts, CSS vars |
| Partial | `apply <code> --only theme,font` | Config only, components untouched |
| Merge | `init --preset <code> --force --no-reinstall`, then per-component `--dry-run`/`--diff` | Manual smart merge |
| Skip | `init --preset <code> --force --no-reinstall` | Config and CSS only |

### Inspecting presets

```bash
npx shadcn@latest preset decode a2r6bw    # what's in it
npx shadcn@latest preset url a2r6bw       # shareable URL
npx shadcn@latest preset open a2r6bw      # open the builder
npx shadcn@latest preset resolve          # current project's preset
npx shadcn@latest preset resolve --json
```

**Rule from the skill:** never decode preset codes or construct preset URLs manually. Use the CLI.

Caveat: preset codes **do not encode the `base`** (Radix vs Base UI). In an existing project the CLI preserves it from `components.json`; in a scratch directory you must pass `--base` explicitly.

## `shadcn/skills`

```bash
pnpm dlx skills add shadcn/ui
```

Covers both Radix and Base UI primitives, updated APIs, component patterns, registry workflows, and CLI usage — including which flags to pass and when. Detailed in [02-agent-rules.md](./02-agent-rules.md).

Example prompts the skill is designed to handle:

- "create a new vite monorepo"
- "find me a hero from tailark, add it to the homepage, animate the text using an animation from react-bits"
- "install and configure a sign in page from @clerk"

## Preview flags

```bash
pnpm dlx shadcn@latest add button --dry-run   # every file that would be written
npx shadcn@latest add button --diff           # upstream vs local
npx shadcn@latest add button --view           # inspect the payload
```

Documented use: *"Review the payload yourself or pipe it to your coding agent for a second look."*

`--diff` doubles as the update-check mechanism: "check for updates from @shadcn and merge with my local changes."

## Templates

```bash
pnpm dlx shadcn@latest init

Select a template ›
❯ Next.js
  Vite
  TanStack Start
  React Router
  Astro
  Laravel
```

Dark mode included for Next.js and Vite. Monorepo support:

```bash
pnpm dlx shadcn@latest init -t next --monorepo
```

All templates support `--monorepo` except Laravel.

## `--base`

Choose the primitive library:

```bash
pnpm dlx shadcn@latest init --base radix   # or --base base
```

This is consequential for agents: Radix uses `asChild` for custom triggers, Base UI uses `render`. An agent that guesses wrong produces code that fails at runtime. The `base` field in `shadcn info` is how it should know.

## `shadcn info`

```bash
npx shadcn@latest info
npx shadcn@latest info --json
```

Reports framework, version, CSS vars, installed components, and doc/example locations for every component. The skill injects this automatically at load time.

This is the highest-value command for agent correctness. It replaces every assumption an agent would otherwise make about aliases, RSC, Tailwind version, icon library, and file paths.

## `shadcn docs`

```bash
npx shadcn@latest docs combobox

combobox
  - docs      https://ui.shadcn.com/docs/components/radix/combobox
  - examples  https://ui.shadcn.com/code/apps/v4/registry/bases/radix/examples/combobox-example.tsx
  - api       https://base-ui.com/react/components/combobox
```

Returns URLs; the agent fetches them. Directly attacks the failure mode where an agent writes a component API from stale training data.

## `registry:base` and `registry:font`

**`registry:base`** — distribute an entire design system as one payload: components, dependencies, CSS vars, fonts, config. One install, everything configured.

This is the mechanism for turning your house system into a fetchable artifact. See [04-registries-and-mcp.md](./04-registries-and-mcp.md).

**`registry:font`** — fonts as a first-class registry type:

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "font-inter",
  "type": "registry:font",
  "font": {
    "family": "'Inter Variable', sans-serif",
    "provider": "google",
    "import": "Inter",
    "variable": "--font-sans",
    "subsets": ["latin"]
  }
}
```

```bash
pnpm dlx shadcn@latest add font-inter
```

## Quick reference

```bash
# New project
npx shadcn@latest init --name my-app --preset base-nova
npx shadcn@latest init --name my-app --preset a2r6bw --template vite
npx shadcn@latest init --name my-app --preset base-nova --monorepo

# Existing project
npx shadcn@latest init --preset base-nova
npx shadcn@latest init --defaults          # = --template=next --preset=nova

# Presets
npx shadcn@latest apply a2r6bw
npx shadcn@latest apply a2r6bw --only theme,font
npx shadcn@latest preset decode a2r6bw
npx shadcn@latest preset resolve --json

# Components
npx shadcn@latest add button card dialog
npx shadcn@latest add @magicui/shimmer-button
npx shadcn@latest add owner/repo/item
npx shadcn@latest add --all

# Preview
npx shadcn@latest add button --dry-run
npx shadcn@latest add button --diff button.tsx
npx shadcn@latest add @acme/form --view button.tsx

# Search
npx shadcn@latest search @shadcn -q "sidebar"
npx shadcn@latest search @tailark -q "stats"
npx shadcn@latest search owner/repo -q "login"
npx shadcn@latest search                          # all configured registries
npx shadcn@latest search @shadcn -q "menu" -t ui  # filter by type

# Docs and inspection
npx shadcn@latest docs button dialog select
npx shadcn@latest view @shadcn/button
npx shadcn@latest view owner/repo/item
npx shadcn@latest info --json
```

Use the project's package runner — `npx`, `pnpm dlx`, or `bunx --bun` — based on `packageManager`.
