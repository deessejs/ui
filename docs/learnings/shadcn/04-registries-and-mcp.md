# Registries and MCP

**Sources:** https://ui.shadcn.com/docs/mcp · https://ui.shadcn.com/docs/changelog/2026-05-registry-include · https://ui.shadcn.com/docs/changelog/2026-06-github-registries — verified 2026-07-28

## GitHub registries (June 2026)

Any public GitHub repository can be a registry. Add a `registry.json` at the root and it is installable.

```bash
npx shadcn@latest add <username>/<repo>/<item>
npx shadcn@latest add acme/toolkit/project-conventions
```

**No build step, no publish, no registry server.** These are *source* registries — the CLI reads the root `registry.json`, resolves `include` entries, finds the item, installs the declared files.

### Registry items are not just components

This is the part that matters most for the anti-slop workflow. From the changelog:

> A GitHub registry can distribute components, hooks, utilities, **design tokens**, feature kits, **project conventions**, **agent instructions**, testing setup, CI workflows, release workflows, templates, codemods, migration kits and other project files.

Example — distributing conventions and agent instructions:

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "acme-toolkit",
  "homepage": "https://github.com/acme/toolkit",
  "items": [
    {
      "name": "project-conventions",
      "type": "registry:item",
      "files": [
        { "path": "AGENTS.md",           "type": "registry:file", "target": "~/AGENTS.md" },
        { "path": ".editorconfig",       "type": "registry:file", "target": "~/.editorconfig" },
        { "path": "docs/conventions.md", "type": "registry:file", "target": "~/docs/conventions.md" }
      ]
    }
  ]
}
```

So your design rules, your `AGENTS.md`, your lint config, and your components all ship through one channel and version together. That is the difference between a design system that is documented and one that is *installable*.

### Commands

```bash
npx shadcn@latest list   acme/toolkit
npx shadcn@latest search acme/toolkit --query conventions
npx shadcn@latest view   acme/toolkit/project-conventions
npx shadcn@latest add    acme/toolkit/project-conventions
```

## Registry `include` and `validate` (May 2026)

### `include`

Compose a large registry from multiple `registry.json` files instead of maintaining one giant file:

```
registry.json
components/ui/
  ├── button.tsx
  ├── input.tsx
  └── registry.json
hooks/
  ├── registry.json
  ├── use-media-query.ts
  └── use-toggle.ts
```

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "acme",
  "homepage": "https://acme.com",
  "include": ["components/ui/registry.json", "hooks/registry.json"]
}
```

Included files may omit `name` and `homepage` — only the root defines registry metadata.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "items": [
    {
      "name": "button",
      "type": "registry:ui",
      "files": [{ "path": "button.tsx", "type": "registry:ui" }]
    }
  ]
}
```

`shadcn build` flattens includes and writes a `registry.json` without `include`. File paths are preserved relative to the root, so `components/ui/registry.json` declaring `button.tsx` yields `components/ui/button.tsx`.

### `validate`

```bash
pnpm dlx shadcn registry validate
```

Runs against source files directly — no `build` needed first. Checks the root `registry.json`, included files, item schema errors, duplicate names, include rules, and local file paths. Reports **all** actionable errors in one run.

Put this in CI. A registry is a contract; a broken one breaks every consumer silently.

### Registry loaders

For dynamic registry routes:

```ts
// app/r/registry.json/route.ts
import { loadRegistry } from "shadcn/registry"

export async function GET() {
  const registry = await loadRegistry()
  return Response.json(registry)
}
```

```ts
// app/r/[name].json/route.ts
import { loadRegistryItem } from "shadcn/registry"

export async function GET(
  _: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params
  const item = await loadRegistryItem(name)
  return Response.json(item)
}
```

## MCP server

Lets an AI assistant browse, search, and install from registries in natural language.

```bash
pnpm dlx shadcn@latest mcp init --client claude
```

Then restart the client.

### Manual configuration

**Claude Code** — `.mcp.json`:

```json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    }
  }
}
```

Verify with `/mcp` — you want `Connected`.

**Cursor** — `.cursor/mcp.json`, same shape.

**VS Code** — `.vscode/mcp.json`, key is `servers` not `mcpServers`.

**Codex** — `~/.codex/config.toml`, must be added manually (the CLI cannot write this file):

```toml
[mcp_servers.shadcn]
command = "npx"
args = ["shadcn@latest", "mcp"]
```

### Namespaced registries

```json
{
  "registries": {
    "@acme": "https://registry.acme.com/{name}.json",
    "@internal": {
      "url": "https://internal.company.com/{name}.json",
      "headers": {
        "Authorization": "Bearer ${REGISTRY_TOKEN}"
      }
    }
  }
}
```

Env vars go in `.env.local`:

```
REGISTRY_TOKEN=your_token_here
```

No configuration needed for the standard `@shadcn` registry.

### What it enables

- "Show me all available components in the shadcn registry"
- "Find me a login form from the shadcn registry"
- "Install `@internal/auth-form`"
- "Build me a landing page using hero, features and testimonials sections from the acme registry"

**Important pairing with the rules:** the skill instructs agents to *never guess a registry*. If the user says "add a login block" without naming a source, the agent should ask. MCP makes many registries reachable; the rule prevents the agent from silently pulling from a random one. Both halves are needed.

### Troubleshooting

| Symptom | Try |
| --- | --- |
| No response | Verify config, restart client, confirm `shadcn` is installed, check network |
| Components won't load | Check `components.json` URLs, env vars, registry availability, `@namespace` syntax |
| Install failures | Valid `components.json`, target dirs exist, write permissions, deps installed |
| "No tools or prompts" | `npx clear-npx-cache`, re-enable the server, check logs (Cursor: View → Output → `MCP: project-*`) |

## Assembling this into a system

The pieces compose into a distributable house system:

1. **`registry:base`** — components, CSS vars, fonts, deps, config as one payload.
2. **`registry:item` with `AGENTS.md` and rule docs** — your conventions travel with the code.
3. **GitHub registry** — hosted from a repo, no infrastructure.
4. **`registry validate` in CI** — the contract stays intact.
5. **MCP configured per client** — agents reach it conversationally.
6. **`--preset` code** — the config travels into prompts and across tools.

The end state: a new project or a new agent session starts from your system rather than from the shadcn default. That is the structural fix for "my agent doesn't know my design system" — better than any prompt, because it is fetched rather than remembered.
