---
name: agent-system-03-the-fundamentals
description: The encodeable design fundamentals — Refactoring UI tactics, encodeable Laws of UX, Rams principles as rubric, layout/spacing/typography/color/hierarchy rules distilled from decades of design literature
status: research
created: 2026-07-28
updated: 2026-07-28
---

# The Fundamentals — Encodeable Design Principles

**Sources:** Adam Wathan & Steve Schoger (*Refactoring UI*, 2018); Dieter Rams (10 principles, 1976/2024); Jon Yablonski (*Laws of UX*, 2024); Robert Bringhurst (*Elements of Typographic Style*); Edward Tufte (*Envisioning Information*, 1990); Don Norman (*Design of Everyday Things*); Wilson Miner (A List Apart, 2007); NN/g (10 Usability Heuristics); Timothy Graf (8-Point Grid, 2026).
**Status:** Synthesis. Each principle labelled `[SOURCED]` (named source) or `[TACTICAL]` (our restatement as encodeable rule).

This document does the work of transforming design literature — much of it decades old — into an *encodeable* interface. The goal is not to introduce new principles. The goal is to make a centuries-old craft legible to a system that doesn't have taste.

## On encoding principles

A design principle is encodeable when it has a form an agent can verify mechanically: a value chosen from a scale, a pattern taken from a list, a class of decision that resolves without judgment. *"Use good fonts"* is not encodeable. *"Use one of these 8 typefaces that pair with each other at these scale ratios"* is.

The work below is selective — many fine-sounding principles were left out because they cannot be expressed as a rule. Most of what survives the encoding test is what Wathan & Schoger call a *tactic*: a small, concrete move with a clear correct application.

## Hierarchy is everything

> "Hierarchy is the most fundamental design decision. Every screen has a level-zero element — the thing the eye lands on first. If you don't designate one, the eye picks for you." — *Refactoring UI*

- **[TACTICAL]** Exactly one visual focal point per view, per discrete moment of the page. Reviewers test this by squinting at the page — the focal must dominate the blur.
- **[TACTICAL]** Hierarchy is communicated through *coordinated* size, weight, color, position — never by one signal alone.
- **[SOURCED, Refactoring UI]** *"Not all elements are equal"* — and neither should they look equal. Most junior work gives every element similar weight.
- **[SOURCED, Laws of UX — Von Restorff Effect]** The element that differs from the rest is remembered most — so de-emphasize to emphasize, as *Refactoring UI* puts it.
- **[TACTICAL]** `className` carries layout only (position, width, padding). Color and typography are component variants or tokens. The rule lives in `../shadcn/02-agent-rules.md`.

## Spacing and scale

The most junior-of-junior decisions are spacing invented on the page. The first senior move is to commit to a scale and refuse values outside it.

- **[SOURCED, Refactoring UI]** *"Start with too much white space"* — then shrink. Junior work under-spaces.
- **[SOURCED, Refactoring UI]** *"Establish a spacing and sizing system"*. Without one, every spacing decision is a re-decision.
- **[SOURCED, Refactoring UI]** *"Avoid ambiguous spacing"* — when you can't tell which gap is which, the spacing is misleading. Add whitespace or a divider.
- **[SOURCED, Timothy Graf 2026 / widespread practice]** 8pt grid (or 4pt for dense tools) — every spacing value is a multiple. See `../tailwind/01-theme-and-tokens.md` for the mechanism that makes this enforceable.
- **[SOURCED, Refactoring UI]** *"Relative sizing doesn't scale"* — sizing components against each other (`flex-1` patterns) produces uneven results. Use a constrained set of sizes.
- **[SOURCED, Refactoring UI]** *"Emulate a light source"* — shadows are consistent across a system; they imply a single directional light.
- **[TACTICAL]** Use `flex` + `gap-*`; never `space-x-*` / `space-y-*`. Rule lives in `../shadcn/02-agent-rules.md`.
- **[TACTICAL]** Use `size-*` when width equals height. Rule in `../shadcn/02-agent-rules.md`.

## Typography

Typography is the most disproportionate lever on perceived quality for the smallest cost. Most agent output is mediocre on this axis alone.

- **[SOURCED, Refactoring UI]** *"Establish a type scale"* — body, captions, headings, display, drawn from a single ratio. See `../tailwind/04-constraining-the-scale.md`.
- **[SOURCED, Refactoring UI]** *"Use good fonts"* — narrowed to a small vetted list, matched by use case. UI fonts and headline fonts are different categories.
- **[SOURCED, Refactoring UI]** *"Keep your line length in check"* — 50–75 characters per line, hard rule.
- **[SOURCED, Refactoring UI]** *"Baseline, not center"* — vertical alignment to text baseline, not element center.
- **[SOURCED, Refactoring UI]** *"Line-height is proportional"* — line-height as a ratio (1.2 dense, 1.6 reading) not a pixel value.
- **[SOURCED, Refactoring UI]** *"Use letter-spacing effectively"* — tight on display, normal on body, tracked on caps.
- **[SOURCED, Refactoring UI]** *"Not every link needs a color"* — color is not the only emphasis channel.
- **[SOURCED, Refactoring UI]** *"Align with readability in mind"* — alignment to text, not to element bounding boxes.
- **[SOURCED, Bringhurst]** Vertical rhythm — text sitting on a shared baseline across columns and pages. See `../layout/02-proportional-systems.md`.

## Color

The centroid article has a long section on color failure modes. The encodeable interface:

- **[SOURCED, Refactoring UI]** *"Ditch hex for HSL"* — and even better, OKLCH (current best). Reasoning: lightness is a perceptually-uniform axis.
- **[SOURCED, Refactoring UI]** *"You need more colors than you think"* — 10 shades per hue, not 5.
- **[SOURCED, Refactoring UI]** *"Define your shades up front"* — the palette is a system, not a discovery.
- **[SOURCED, Refactoring UI]** *"Don't let lightness kill your saturation"* — high-lightness colors need chroma to remain readable.
- **[SOURCED, Refactoring UI]** *"Greys don't have to be grey"* — tinted greys (warm, cool) read more deliberately.
- **[SOURCED, Refactoring UI]** *"Accessible doesn't have to mean ugly"* — accessibility is a constraint, not a style.
- **[SOURCED, Refactoring UI]** *"Don't rely on color alone"* — every color signal needs a paired non-color signal.
- **[TACTICAL]** Color usage only through semantic tokens (`bg-destructive`, `text-muted-foreground`). Raw palette utilities (`bg-red-500`) are not expressible — see `../tailwind/04-constraining-the-scale.md`.

## Layout and density

Beyond what `../layout/` covers, the everyday encoding rules:

- **[SOURCED, Refactoring UI]** *"Start with a feature, not a layout"* — design the meaningful content first; layout follows.
- **[SOURCED, Refactoring UI]** *"Don't design too much"* — junior designers fill pages; senior designers edit pages.
- **[SOURCED, Refactoring UI]** *"Choose a personality"* — every product has one, and most design accidentally shows a different one.
- **[SOURCED, Refactoring UI]** *"You don't have to fill the whole screen"* — empty space is content. Massive screens don't need filling.
- **[SOURCED, Refactoring UI]** *"Grids are overrated"* as a forcing function; they are useful for consistency, not for invention.
- **[TACTICAL]** Macro rhythm comes from `../layout/` — what counts is modulation, focal objects, the frame, dividers.

## Depth and layering

The decision of *how many layers exist* is a strategic one. The encodeable surface:

- **[SOURCED, Refactoring UI]** *"Use shadows to convey elevation"* — sparingly and consistently.
- **[SOURCED, Refactoring UI]** *"Shadows can have two parts"* — close + ambient.
- **[SOURCED, Refactoring UI]** *"Even flat designs can have depth"* — depth via color step, not shadow.
- **[SOURCED, Refactoring UI]** *"Overlap elements to create layers"* — depth without elevation.
- **[TACTICAL]** Per Linear (referenced in `../layout/03-cases-and-patterns.md`): shadows are reserved for floating surfaces only. Data surfaces are flat.

## Working with images

- **[SOURCED, Refactoring UI]** *"Text needs consistent contrast"* — overlay text uses known contrast formulas, not best-effort.
- **[SOURCED, Refactoring UI]** *"Everything has an intended size"* — don't let images scale freely.

## Finishing touches (the senior surface area)

These are the moves that distinguish senior from junior in a single comparison:

- **[SOURCED, Refactoring UI]** *"Supercharge the defaults"* — date pickers, selects, modals — every default UI can be improved.
- **[SOURCED, Refactoring UI]** *"Add color with accent borders"* — 3px left border, not a panel.
- **[SOURCED, Refactoring UI]** *"Decorate your backgrounds"* — subtle texture, not blank walls.
- **[SOURCED, Refactoring UI]** *"Don't overlook empty states"* — junior designer ships empty and full states; senior ships empty, first-use, partial, error, success, archived.
- **[SOURCED, Refactoring UI]** *"Use fewer borders"* — borders compete; shadows, contrast, and space are alternatives.
- **[SOURCED, Refactoring UI]** *"Think outside the box"* — the design constraint is rarely the box itself.

## On Dieter Rams' ten principles

These are *criteria for evaluating generated UI*, not executable rules. The most operationally relevant for our purposes:

- *"Unobtrusive"* — restraint is senior. Decoration is junior.
- *"Honest"* — components don't promise more than they are. A `<Skeleton>` for loading, not a stylized spinner that looks better than the loaded state.
- *"Thorough down to the last detail"* — empty states, focus rings, hover states, dark mode, edge cases.
- *"As little design as possible"* — the system should minimize what it adds.

The other six (innovative, useful, aesthetic, understandable, long-lasting, environmentally-friendly) live mostly in the brief and the human review, not the encodeable surface. They are the rubric the human applies at PR time.

## On Laws of UX

The *Laws of UX* site lists 30+ principles. Most are descriptive of human cognition, not directly encodeable. The ones that translate to rules:

- **Fitts's Law** — interactive targets must have known minimum sizes (≥ 44×44 px for touch). Encode: component-level minimum.
- **Hick's Law** — choices cost linearly; group by relevance, defer less-relevant options.
- **Jakob's Law** — users prefer your site to work like others. Encode: convention compliance. Pickers should look like pickers. Back buttons should go back. *Following established conventions beats novel ones.* Refactoring UI's "default-first" derives from this.
- **Tesler's Law (Conservation of Complexity)** — every system carries irreducible complexity; either the user or the system bears it.
- **Doherty Threshold** — system response < 400ms. Mostly a perf concern, but visible in optimistic UI patterns.

Most others (Aesthetic-Usability, Peak-End, Zeigarnik, Goal-Gradient, Von Restorff, etc.) inform brief-writing and review, not encoding.

## From NN/g's 10 usability heuristics

Don Norman's *Design of Everyday Things* and Nielsen's ten heuristics supply the interaction principles that distinguish *usable* from *just-looking*. The agent's role on these is mostly mechanical:

- Visibility of system status → skeleton states / spinners
- Match between system and the real world → conventions borrowed from outside
- User control and freedom → undo, back, cancel affordances on every action
- Consistency and standards → enforced via the component registry
- Error prevention → defaults + validation, not after-the-fact corrections
- Recognition rather than recall → component shells rather than free-form input
- Flexibility and shortcuts → keyboard parity, command-K
- Aesthetic and minimalist design → restraint from the lint layer
- Help users recognize, diagnose, recover from errors → error copy is a token, not bespoke
- Help and documentation → link from anywhere notable to docs

These become encodeable as lint rules more than as tokens. The agent's job is to install them; the system's job is to verify them.

## What this is not

This document is not a substitute for taste. It is the *floor*, not the ceiling. Every rule here can be followed and still produce mediocre output — the wrong composition, the wrong tone, the wrong moment. Senior work uses these as the floor and adds judgement on top. The system this research builds makes the floor easy to stay on, so judgement has room to apply elsewhere.

See [`04-the-mechanism.md`](./04-the-mechanism.md) for how these fundamentals ride on tokens, components, and the generation loop.
