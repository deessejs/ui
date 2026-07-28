---
name: layout-01-the-problem
description: Frames the layout problem as a modulation failure rather than an absolute spacing one; distinguishes density, spacing, and rhythm; introduces the macro/section/micro layering
status: research
created: 2026-07-28
updated: 2026-07-28
---

# 01 — The Problem

**Status:** Framed notes. The diagnosis below is ours; the references are at the end and
are referenced again in [02-proportional-systems.md](./02-proportional-systems.md) and
[04-rhythm-and-perception.md](./04-rhythm-and-perception.md).
**Written:** 2026-07-28

## The two failure modes

A page arrives either **too dense** (elements compete for attention, the eye cannot rest,
there is no clear hierarchy) or **too empty** (large dead rectangles, no focal object,
the page feels abandoned). Naive designers reach for the obvious lever — more space, or
less — and oscillate between the two.

The lever is wrong. The actual variable is **modulation**: the *pattern* by which density
changes across the page. A page of uniform medium density reads as mediocre. A page that
modulates — sparse, dense, sparse, dense — reads as designed.

## Three concepts to keep separate

The failure modes come from confusing three different things, all of which get called
"spacing":

**Density** — how much information occupies a unit of surface. A data table is dense; a
hero with a headline and a CTA is sparse. Density is a property of *content*.

**Spacing** — the magnitudes of the gaps between elements. Spacing is a property of *the
mechanical scale* the designer chose (8pt grid, modular scale, arbitrary values).

**Rhythm** — the *regularity across the page*. Rhythm is a property of *the pattern of
choices*, which can only be perceived when you look at more than one section at a time.

These decompose the problem sharply:

- Changing spacing changes how each individual section *reads* but not how the page
  *composes*.
- Changing density is mostly a content decision (do you ship fewer testimonials, or
  shorter ones, or group them differently).
- Changing rhythm changes how the page reads as a whole — and that is what "design"
  actually does at the page level.

Most interface work moves the spacing slider and hopes rhythm will follow. It doesn't.
Rhythm is its own thing and requires page-level decisions.

## The three scales a page actually has

Layout decisions happen simultaneously at three scales, and confusing them is the second
most common failure mode:

**Macro** — the page as a whole. How are sections delimited? What is the page frame?
Where is the eye drawn first? This is where the *border-x / divider-y* vocabulary lives,
where the macro baseline units are set, and where the modulation pattern is decided.

**Section** — the *kind* of section. A pricing table and a hero do not share a grid and
should not share a spacing scale's content distribution. Each section has a *grid family*
(1-col / 2-col / 3-col / 4-col / asymmetric) and a *vertical rhythm within itself*.

**Micro** — inside a card, button, table row. This is where the 8pt grid and component
padding actually live.

The naive mistake is to drive all three from one spacing scale. They must share *values*
but they must not share *behavior*. A 24px gap means something different between
sections (a separation) than inside a card (a padding) than inside a button (an
alignment to a label icon).

The trap: an agent (or designer) given one scale has no way to express that 24px in three
contexts should feel different. The math is identical; the role is not.

## Frame, divider, breath

There are three ways to say *this is a different thing*. They are not interchangeable.

**Frame (the macro border, border-x):** A continuous line down the page's left and right
that contains everything. Its job is *containment and constraint* — not decoration. It
tells the eye where the page ends. It also implicitly defines the *reading width*, which
is finer than `max-w-*` because it is a line the eye tracks, not an abstraction.

**Divider (between sections, divider-y):** A 1px line, often at low opacity, that marks
section boundaries. *Carries semantic information*. A thin line means a peer section —
still in the same chapter. A heavier line or background change means a jump — a new
chapter. Whitespace-only between sections can also work, but it then needs to be *the
largest whitespace in the page* to read as separation, which constrains the rest of the
composition.

**Breath (whitespace alone):** Vertical space without any line. The most expensive
separation. It says *pause here* — used sparingly, around moments that need to land.
Used everywhere, it says *I'm not sure where I am*.

A page that separates only with lines becomes labyrinthine. A page that separates only
with breath becomes abstract. The variety itself is the tool.

## The modulation problem in concrete form

Given a page of N sections, two questions must have answers before the page is built:

1. **Which sections dominate?** A page has roughly 1–3 dominant sections (hero, the main
   proof, the CTA). Everything else is in service. Modulation is largely the design of
   how the dominant sections appear after (or before) supporting sections.

2. **What is the modulation curve?** Dense → sparse → dense → sparse across the page
   is the simplest usable curve. So is sparse → dense → sparse. But mid → mid → mid
   reads as a wall; if you ever feel the page is uniform, look for this pattern.

The naive answer to N=5 sections is "give them all equal vertical space." The designed
answer is "the first and last are sparse, the middle one is dense, the two between are
breathes." Even sections at equal spacing feel different when the *content density* of
each varies.

## Why prompts do not fix this

This problem does not yield to spec. "Make it feel less cramped" has no actionable
content. "Add more whitespace" produces the void problem. "Use a proper grid" produces
the bento problem. The only thing that works is a *sequence of specific decisions at the
macro level* — and the system has to expose those decisions as choices, not as outputs of
reasoning.

## What this document asks of the others

- **02** should give us the math for the *modulation*. Modular scales for type; an 8pt
  grid (or finer) for spacing; vertical rhythm for the macro baseline.
- **03** should give us empirical case studies of pages that work. What do Vercel and
  Linear actually do? What patterns recur?
- **04** should answer the perceptual question. Why does modulation work? What does
  the eye actually do?

## References (used across the doc set)

- Wilson Miner — *Setting Type on the Web to a Baseline Grid* (A List Apart, 2007). The
  clearest available statement of vertical rhythm and line-height math.
- Timothy Graf — *Mastering the 8-Point Grid* (2026). Pragmatic defense of 8pt grids,
  industry lineage, density modes, audit practices.
- Modular type scale guidance (multiple sources). The math of musical ratios applied to
  font sizes.
- Vercel's report-site design guidelines (the public domain `--vbg-*` style system) —
  explicit named anti-patterns that constitute a negative definition of Vercel restraint.
- Linear Design System reference (marcus/marcus-skills). The vocabulary for the
  data-density pole of the spectrum.
- Gestalt primers (Smashing, Figma). The perceptual foundations called on in
  [04-rhythm-and-perception.md](./04-rhythm-and-perception.md).
