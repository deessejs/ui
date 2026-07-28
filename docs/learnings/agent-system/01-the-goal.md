---
name: agent-system-01-the-goal
description: What "senior UI by agent" specifically requires — which design judgments are encodeable, which require human review, what "senior" means in concrete terms
status: research
created: 2026-07-28
updated: 2026-07-28
---

# The Goal — What Senior UI By Agent Actually Means

**Sources:** Dieter Rams (10 principles); Adam Wathan & Steve Schoger (*Refactoring UI*, 2018); Shiva Padival, *The Invisible Shift* (2026); Jon Yablonski (*Laws of UX*, 2024, 2nd ed); design-systems.one (AI-ready design systems); Edward Tufte (Envisioning Information, 1990).
**Status:** Working notes. The synthesis below is ours; the source positions are cited where relevant.

## The ambition stated precisely

The goal of this research is to enable a coding agent — Claude Code, Codex, Cursor — to produce UI that an experienced designer would call *senior*. Not "junior that doesn't have obvious flaws." *Senior* — meaning decisions that have been thought through, composition that holds under inspection, restraint that an experienced hand chose deliberately rather than defaulted to.

This is the open problem the notes in `../tailwind/`, `../shadcn/`, `../layout/` (and the pending `../marketing-ui/`) are all in service of. The frame matters: without it, the notes are aesthetic preferences. With it, they're protocol specifications.

## What "senior UI" concretely means

Three independent axes describe the gap between junior and senior output. Articulating them is what makes the goal *encodeable* rather than aspirational.

### Axis 1 — Craft judgments that produce visible quality

These are decisions an agent can be trained on. They are observable in output and have defensible right answers:

- Hierarchy of emphasis in any composition (size, weight, color, position — used in coordinated pairs, not alone)
- Choice between border / shadow / background to separate surfaces, with consistency
- Spacing values drawn from a known scale, not invented
- Typography pairing (display + body, or single family) at deliberate scale ratios
- Color relationships that survive accessibility checks
- Restraint in the number of distinct elements on a single screen

These are the *majority* of senior craft and they are encodeable as rules an agent can follow. *Refactoring UI* (Wathan & Schoger) operates almost entirely on this axis — it is the rare book in the field that explicitly teaches *encodeable tactics* to non-designers. Examples that distill to a single rule: "use fewer borders"; "de-emphasize to emphasize"; "labels are a last resort"; "line-height is proportional"; "don't rely on color alone"; "emulate a light source."

### Axis 2 — Composition over the page that resists inspection

Decisions that operate at a level the agent can be guided toward but cannot make alone without domain context:

- Which sections anchor a page (and how many)
- Modulation — sparse/dense variation across sections
- The macro rhythm — baseline, frame, divider strategy
- When to break consistency for emphasis

These require *brief* inputs from a human (or a clear specification derived from one). An agent can compose well *given a brief*; it cannot write its own brief. Shiva Padival's *The Invisible Shift* names this exactly — the mid-to-senior transition is from "executed a brief well" to "decided which brief needed executing." Encodeability here comes from having asked the question already, in the design system, at build time.

### Axis 3 — Taste and integrity (the parts that remain judgment)

These decisions are not directly encodeable and will continue to require human review at scale:

- Which voice a product should have (warm vs. clinical, dense vs. airy, technical vs. inviting)
- When a precedent should be followed and when it should be broken
- The strategic tradeoffs behind a visual choice ("read it like this because...")

These are the Dieter Rams principles as a rubric — *innovative, useful, aesthetic, understandable, unobtrusive, honest, long-lasting, thorough, environmentally-friendly, as little as possible*. They are quality criteria, not executable rules. The agent's job is to operate inside constraints that satisfy most of them by construction; the human review remains for the residual.

## What this rules in and out

**In scope for the agent:** Hierarchy, spacing scale adherence, semantic token usage, type pairing and ratio, color palette discipline, surface treatment consistency, alignment, accessibility rules, restraint in element counts, restraint in motion, peer equality across instances, the layout vocabulary in `../layout/`, the marketing-page component conventions (forthcoming under `../marketing-ui/`).

**Out of scope for the agent:** Setting the product's voice, choosing the page's modulation curve absent a brief, deciding which sections are focal, the strategic role of a single design decision in a larger product story, executive-level taste calls.

The line between these is the line that defines the system this research is building. Everything that crosses from "out of scope" into the system becomes encodeable through one of three mechanisms: a constraint at the theme layer (see `../tailwind/`), a token/registry entry (see `../shadcn/`), or a checked-in convention file the agent reads at session start. That's how judgment becomes constraint. It's how senior work becomes reachable for an agent that doesn't *have* judgment.

## Why encodeability, not prompts

Prompts decay. Constraints compound. The same property of tokens, registries, and lint rules that fixes "design by slop" (see `../shadcn/05-anti-slop-playbook.md`) is the property that produces senior work over time: each generated screen reinforces the system, the system accumulates, and the next screen inherits. A prompt is a single sentence. A registry is a contract. Over a year, the difference is the difference between a designer who keeps reinventing their colors and one who works inside a system.

## What the remaining docs add

- [`02-the-obstacles.md`](./02-the-obstacles.md): Why this goal is structurally hard — the centroid problem (math), the SVG failure mode (architecture), the no-memory problem.
- [`03-the-fundamentals.md`](./03-the-fundamentals.md): The encodeable design fundamentals — Refactoring UI tactics, encodeable Laws of UX, Rams principles as rubric, layout/spacing/typography rules.
- [`04-the-mechanism.md`](./04-the-mechanism.md): The three pillars (tokens, components, MCP) and the code-native generation loop. The connecting layer between fundamentals and production.
