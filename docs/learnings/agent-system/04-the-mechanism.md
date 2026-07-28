---
name: agent-system-04-the-mechanism
description: The three pillars (tokens, components, MCP) and the code-native generation loop that turn the encodeable fundamentals into a working system — how senior UI becomes deliverable by an agent
status: research
created: 2026-07-28
updated: 2026-07-28
---

# The Mechanism — Tokens, Components, Loop

**Sources:** Yoko Li / a16z (*The Next Frontier of Visual AI Is Code*, June 2026); design-systems.one (AI-ready design systems, 2026); Vercel blog (*AI prototyping with design systems*, Aug 2025); shadcn/ui docs (`../shadcn/`); tailwindcss docs (`../tailwind/`).
**Status:** Synthesis tying together prior notes with the agent-system lens.

The previous three docs argued that senior UI is encodeable in principle. This doc shows how the encoding ships in practice — the three pillars and the loop.

## The architectural argument

Yoko Li's piece at a16z (*The Next Frontier of Visual AI Is Code*, June 2026) names the architectural shift clearly: visual AI is moving from generating pixels to generating *programs that produce pixels*. The latter is editable, reusable, versioned, integratable, and *validatable*. The former is none of these.

For UI specifically: a screenshot is inspiration. A component is a deliverable. The browser is the renderer, and it gives feedback every frame.

The loop is:

```
Code → Render → Inspect → Revise
```

A model that emits a React component renders in the browser, can be inspected, can be revised by editing the source. Each iteration improves the *artifact*, not just the output. The artifact is the unit of work.

This is the loop the system has to support. The rest is how each pillar serves it.

## Pillar 1 — Tokens

Tokens are the substrate. Without them, the rest collapses.

- **[SOURCED, design-systems.one]** *Tokens that LLMs can read* — W3C Design Tokens Format (`.tokens.json`), semantic naming, machine-parseable types.
- **[SOURCED, design-systems.one]** The agent reaches for `var(--color-bg-accent)` instead of hallucinating `#4F46E5`.
- **[SOURCED, design-systems.one]** Semantic > primitive. `color.action.primary` is a contract. `color.brand.500` is a guess.

How this works concretely in `../tailwind/04-constraining-the-scale.md`: delete the raw palette namespace (`--color-*: initial`), only semantic tokens remain as utility generators. The encoded fundamental "color usage only through semantic tokens" is enforced at the compiler level — a rule without a build-time check is decoration; with one, it's a constraint.

Tokens have a taxonomy `../tailwind/` and `../shadcn/01-theming-and-tokens.md` already detail: primitives → semantic → component variants. The agent reads the semantic layer; humans read the primitive layer when adjusting it (or for inspection).

The readiness test (from design-systems.one, slightly adapted):

> Can a fresh Cursor session find your tokens without browsing your Storybook?

If no, the tokens are decoration.

## Pillar 2 — Components

Components are where the rules from [`03-the-fundamentals.md`](./03-the-fundamentals.md) become contract.

- **[SOURCED, design-systems.one]** *"Components agents can use without drift"* — discriminated-union props, machine-readable docs, registry endpoints.
- **[SOURCED, design-systems.one]** `size: "huge"` is a string. `size: "sm" | "md" | "lg"` rejects at type-check. *Constrained APIs are the only ones that survive automated editing.*

This is *Refactoring UI*'s tactics *expressed in TypeScript*: the components that exist, the variants they expose, the props they accept — these are the encoded decisions about hierarchy, restraint, spacing, color usage. The component API *is* the design system's interface with the agent. New variants cost negotiation; new components cost another registry item.

The taxonomy the agent navigates (from `../shadcn/02-agent-rules.md`):

| Need | Use |
| --- | --- |
| Action | `Button` with a variant |
| Form input | `Input`, `Select`, `Combobox`, `Switch`, … |
| Data display | `Table`, `Card`, `Badge`, `Avatar` |
| Layout | `Sidebar`, `Tabs`, `Resizable`, `Separator` |
| Feedback | `sonner`, `Alert`, `Skeleton`, `Spinner`, `Empty` |

This is the positive side. The negative side lives in `../shadcn/02-agent-rules.md` — what *not* to do. A rule that is not mechanically checked violates within days; the rule file is the contract; the build verifies it.

## Pillar 3 — MCP / Registry

Distribution without a delivery channel is shelf-ware.

- **[SOURCED, design-systems.one]** *MCP servers for design systems* — `list_tokens`, `find_component`, `get_pattern` tools the agent calls during a session.
- **[SOURCED, design-systems.one]** Resources the agent reads: token catalog, component contracts, decisions doc.
- **[SOURCED, Vercel blog, Aug 2025]** Registries with MCP support keep model generations grounded; a design system becomes machine-readable across Cursor, Windsurf, v0.

This is where `../shadcn/04-registries-and-mcp.md` and the GitHub registry direction intersect with the agent-system: a registry can ship *everything* — components, tokens, fonts, `AGENTS.md`, conventions docs, lint configs, codemods. The design system becomes a single installable artifact.

The minimum viable architecture:

```
project/
├── app/
├── components/ui/         ← shadcn components
├── lib/utils.ts
├── tokens.css             ← semantic tokens + primitives
├── AGENTS.md              ← what the agent reads at session start
├── .agents/skills/        ← distributed agent-rules (curated pieces)
└── .mcp.json              ← MCP server connecting to design system
```

`AGENTS.md` and `.mcp.json` are the *delivery* mechanisms. `tokens.css` and `components/ui/` are the *artifacts*. The first two are not optional.

## The loop in practice

For UI specifically, the loop is:

```
1. Agent reads AGENTS.md, fetches MCP token catalog, lists components
2. Agent composes a screen from the available registry — adds new ones if missing
3. Renderer (browser/preview) displays the screen
4. Agent or human inspects with visual feedback
5. Iterate on the source code — not the screenshot
6. New patterns become registry items; new heuristics become rules
7. Repeat
```

The key property: every iteration improves the *artifact*. If the output is wrong, you edit the source. If the source is wrong, you lint it. If the lint rule is wrong, you refine it. Each layer is fixable on its own terms.

Pixel-native generation has no equivalent fix: each retry is a new image. Code-native has test-time compute at the *program* layer, not the *pixel* layer. This is the structural argument that most agent failure modes cannot fix themselves with prompts.

## What the existing notes provide

- `../tailwind/` — token mechanics, theme constraint, what's deletable. Pillar 1 implementation.
- `../shadcn/` — component model, registry, MCP, agent rules. Pillars 2 + 3 implementation.
- `../layout/` — composition theory. The half of fundamentals `03` doesn't cover.
- `../marketing-ui/` (pending) — the conventions for the *evocative* components that distinguish a senior product page from a junior one. Doesn't exist yet.

Together these cover the bottom half of the obstacle map in `02-the-obstacles.md`. The remaining gaps — where this research series has open questions — are tracked in each doc's "What remains open" section.

## The unread piece

The mechanism is solid for *components* — Vercel/Cursor/Anthropic have demonstrated it at that scope. The unresolved work is: how to express a brief — page-level composition, modulation, focal objects — in a form an agent can ingest once and execute across a build. *Refactoring UI* and `../layout/` together sketch the grammar; what is missing is the *vocabulary for the agent* (the page recipe format, the modulation-curve parameter, the focal-set declaration). That is the next phase of research, and the open question the marketing-ui/ docs would have to address.
