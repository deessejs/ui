---
name: agent-system-02-the-obstacles
description: Why the senior-UI-by-agent goal is structurally hard — the centroid problem (math), the SVG failure mode (architecture), the no-memory problem; why prompts cannot fix what constraints must
status: research
created: 2026-07-28
updated: 2026-07-28
---

# The Obstacles — Why Senior UI By Agent Is Structurally Hard

**Sources:** ux-skill (*The centroid problem*, May 2026); Yoko Li / a16z (*The Next Frontier of Visual AI Is Code*, June 2026); design-systems.one (AI-ready design systems, 2026); msteja / dev.to (*Why AI agents can't draw SVG*, June 2026); Vercel (*AI-powered prototyping with design systems*, Aug 2025).
**Status:** Synthesis. Sources cited inline.

## The obstacle in one sentence

AI agents generate the centroid of their training distribution; senior UI lives in the tails of it; the mechanisms used to bridge the gap — pixel-prompting, SVG emission, free-form generation — all fail at the structural level, not the prompt level.

This doc categorizes the failure modes so the rest of the docs can prescribe by category.

## 1. The centroid problem

A generative model returns the most probable continuation. For UI, "most probable" is the average of every UI it has seen. The average of millions of Tailwind starter templates, shadcn demos, and Dribbble shots is the violet-gradient, three-card, centered-hero page. The model is not being lazy; it is doing exactly what it was trained to do.

The centroid has a fingerprint. Machine-checkable:

- Inter (or system stack) as the only typeface
- A violet → indigo gradient (`#6366f1 → #8b5cf6` or near neighbors)
- Three equal cards in a row, each with an icon, a heading, and two lines of body
- A centered hero (eyebrow, headline, subhead, button — all centered)
- `rounded-2xl` on everything, a soft drop shadow, a faint glass blur
- Emoji standing in for icons
- Filler copy ("leverage," "seamless," "empower")

Four structural causes (Sailop):

1. Regression to training mean
2. Shared scaffolding across models (shadcn + Tailwind defaults = shared identity)
3. Identical briefs producing identical output
4. No memory between generations

Each cause has an inverse fix. None of the four inverses is "better prompting":

- Differentiate the brief to continuous brand values
- Use real brand systems as training data (not templates)
- Lint the fingerprints out of every output
- Close the loop so memory compounds

The play is structural, not linguistic. See [`03-the-fundamentals.md`](./03-the-fundamentals.md) for the lint side, [`04-the-mechanism.md`](./04-the-mechanism.md) for the loop side.

## 2. The SVG failure mode

For graphics design, UI design, and 3D modeling, the end representation users want is not the rendered pixels — it is the *program* that produces them. An SVG file is a program; so is a React component, an HTML page, a Lottie JSON, a Blender script.

For agents, attempting to emit SVG directly produces the failure mode documented by msteja on dev.to: "boxes overlapping, labels spilling past their borders, arrows cutting through other shapes." The model wrote valid SVG. It just can't see — it predicts tokens, not pixels. Asking it to route an edge around three other nodes blind is asking for collision detection in language.

The correct architecture is **separate meaning from layout**: the agent emits typed JSON describing structure (nodes, edges, labels), a layout engine does the spatial reasoning. This is the design of tools like Glyphic, OmniLottie, and VIGA, and it is the architecture shadcn's registry + v0 implements for UI: the agent emits code primitives, the renderer (the browser) handles layout.

For our system this means: **SVG-based mock generation is the wrong layer.** Components render in the browser using real CSS, real tokens, real layout. Senior UI is produced at the component level, not the SVG level. The browser is the renderer in the loop.

See [`04-the-mechanism.md`](./04-the-mechanism.md) for how this becomes a feedback loop.

## 3. The no-memory problem

Even with a good brief and real-component generation, every session is fresh. Yesterday's senior decisions don't carry forward. The system is amnesiac by design — and that's a feature of statelessness, not a flaw in the agent.

The fix is external memory that the agent can read at session start. A design system encoded as a registry is exactly this — components, tokens, rules, conventions, and history of decisions. Every session that reads the registry inherits. Every session that produces work extends it.

This is the `../shadcn/` direction: turn the design system into a fetchable artifact. See also `../shadcn/04-registries-and-mcp.md` for the distribution mechanism and `../shadcn/03-cli-v4-and-presets.md` for the preset-as-prompt format.

## 4. The prompt ceiling

Senior design knowledge has two halves: the encodeable half (craft judgments that produce visible quality) and the judgment half (decisions about voice, scope, role). Prompts can gesture at both, but they have no enforcement mechanism. A prompt says "use semantic colors." A deleted token namespace makes `bg-blue-500` not compile.

Even a perfectly crafted prompt produces a different output on a different model, in a different session, with different context pressure. Prompts are *advisory*. Tokens, namespaces, registries, and lint rules are *enforced*. The goal is not "better prompts." The goal is "no part of senior UI that could be enforced is left as a prompt."

## The map of what's left

After acknowledging the four obstacles, the productive question becomes: for each kind of decision, *who* makes it and *how is it encoded*?

| Decision kind | Made by | Encoding mechanism |
| --- | --- | --- |
| Page-level composition, voice, scope | Human review | Design brief or product doc |
| Macro rhythm, focal sections, modulation | Human input → encoded | Layout template, page recipes |
| Hierarchy within a section | Agent | Token system + component variants |
| Spacing values | Agent | Constrained scale (theme deletion) |
| Color usage | Agent | Semantic tokens, no raw palette utilities |
| Type pairing, scale | Agent | Modular scale + restrained token set |
| Element count, restraint | Agent | Component discipline (`className` for layout only) |
| Accessibility | Agent | Mechanical rules (lint) |
| Strategic visual choice | Human review | PR-time critique |

The bottom half is the agent's job. The top half is the human's job. The system this research builds maximizes the bottom half so the human's attention goes to the top.

This is where the encodeable fundamentals live — see [`03-the-fundamentals.md`](./03-the-fundamentals.md).
