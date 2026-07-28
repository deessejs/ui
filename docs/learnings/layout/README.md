---
name: layout-research-index
description: Index and framing for four layout-theory docs covering density/spacing/rhythm, proportional systems, Vercel and Linear cases, and perception
status: research
created: 2026-07-28
updated: 2026-07-28
---

# Layout — Research Notes

Research toward a real theory of layout for marketing pages and application shells — separate
from any framework or style.

**Researched:** 2026-07-28
**Status:** Research phase. Pure theory, no implementation choices yet. Implementation comes
in a later round, when these notes converge with the tooling notes under `../tailwind/` and `../shadcn/`.

## Documents

| File | Covers |
| --- | --- |
| [01-the-problem.md](./01-the-problem.md) | The framing: density vs spacing vs rhythm; why "etouffe vs vide" is a modulation failure, not an absolute one; the macro/section/micro layering |
| [02-proportional-systems.md](./02-proportional-systems.md) | Modular type scales (1.125, 1.25, 1.333, 1.5, 1.618), the 8pt grid, vertical rhythm, the math of a baseline |
| [03-cases-and-patterns.md](./03-cases-and-patterns.md) | Reading Vercel and Linear as opposite answers to the same problem; the recurring vocabulary across modern web surfaces |
| [04-rhythm-and-perception.md](./04-rhythm-and-perception.md) | Gestalt principles applied to layout; the page as something read in time; modulation as the perceptual answer to density |

## The thesis in one sentence

> Layout fails not when there is too much or too little space, but when the *modulation of
> space across the page* does not establish a macro rhythm that the reader can feel.

This repo treats this as a problem of *composition over time*, not of *measure at a moment*.
The consequences are concrete: the decision space at the page level is different from the
decision space at the section level is different from the decision space inside a card.
A unified "spacing scale" is necessary but not sufficient. What scales must *vary in
controlled ways* across the page, and a single base module must generate those variations
without inventing values along the way.

## How to read this

Documents 01–04 should be read in order. The first two are foundational — they are the
problem and its mathematical resources. 03 is empirical — what people who ship pages at scale
actually do. 04 returns to the perceptual layer, where the rhythm either lands or doesn't.

Two reference cases anchor the notes throughout: **Vercel** and **Linear**, because they
represent opposite solutions to the same composition problem (editorial restraint vs. data
density), and the contrast reveals what is load-bearing in each.

## What this is not

This is not a design system, not a CSS framework, not a code generator. Nothing here
constrains any variable in `globals.css`. The tokens, utilities, and linting rules belong
to `../tailwind/` and `../shadcn/`. When the time comes to apply these notes to a real
project, the bridge will be one CSS variable — the page-level vertical module — and one
rule: edits inside a section are local; edits to the module are global and review-worthy.
