# shadcn/ui — Research Notes

Research snapshot for building a design system that AI agents can work inside without producing generic output.

**Researched:** 2026-07-28
**Current at time of research:** shadcn CLI v4 (March 2026), GitHub registries (June 2026), registry `include`/`validate` (May 2026)

## Documents

| File | Covers |
| --- | --- |
| [01-theming-and-tokens.md](./01-theming-and-tokens.md) | Full token table, background/foreground convention, adding custom tokens, radius scale, base colors |
| [02-agent-rules.md](./02-agent-rules.md) | The official `skills/shadcn` rules — what shadcn itself tells agents to do |
| [03-cli-v4-and-presets.md](./03-cli-v4-and-presets.md) | CLI v4, `--preset`, templates, `info`, `docs`, `--dry-run`/`--diff` |
| [04-registries-and-mcp.md](./04-registries-and-mcp.md) | Registries, GitHub registries, `registry:base`, MCP server |
| [05-anti-slop-playbook.md](./05-anti-slop-playbook.md) | Applied: assembling the above into an agent workflow |

## What changed, and why it changes the problem

shadcn has repositioned from "a set of components you copy" to **a distribution platform explicitly designed for coding agents**. The March 2026 CLI v4 release says so directly: *"Built for you and your coding agents."*

Three developments matter for the anti-slop problem:

**1. shadcn ships its own agent rules.** `skills/shadcn/rules/styling.md` in the repo is a list of Incorrect/Correct pairs written for agents. The first rule is "use semantic colors, never raw values." These are enforced rules, not suggestions, and they are maintained upstream. You do not have to invent them — see [02-agent-rules.md](./02-agent-rules.md).

**2. A design system is now a single installable payload.** `registry:base` distributes components, dependencies, CSS variables, fonts, and config in one install. `--preset` compresses an entire design config into a short code that travels across Claude, Codex, v0, and Replit. Your system becomes a thing agents can *fetch* rather than a thing you re-explain each session.

**3. Any GitHub repo can be a registry** — and registry items are not limited to components. A repo can distribute `AGENTS.md`, editor config, conventions docs, and codemods. Your design rules and your components ship through the same channel.

## On the semantic token question

The starting premise for this research was right: with modern shadcn, you do not write `bg-red-500` — you write a semantic token.

One correction worth stating precisely. shadcn's built-in error token is **`destructive`**, not `critical`. There is no `bg-critical` out of the box. If you want that name — and there are good reasons to prefer it, since "critical" describes severity while "destructive" describes an action type — it is a custom token you define. The mechanism is documented and takes six lines. See [01-theming-and-tokens.md](./01-theming-and-tokens.md#adding-custom-tokens).

There is also a gap worth knowing about: shadcn ships **no success or warning token**. Its own rules acknowledge this and tell agents to use a `Badge` variant or ask the user before adding one. In practice this is the first custom token nearly every project needs.

## Sources

- https://ui.shadcn.com/docs/theming
- https://ui.shadcn.com/docs/mcp
- https://ui.shadcn.com/docs/changelog/2026-03-cli-v4
- https://ui.shadcn.com/docs/changelog/2026-05-registry-include
- https://ui.shadcn.com/docs/changelog/2026-06-github-registries
- https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/SKILL.md
- https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/rules/styling.md
- https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/customization.md
