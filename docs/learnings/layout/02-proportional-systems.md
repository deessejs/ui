---
name: layout-02-proportional-systems
description: Math of modular type scales, the 8pt grid, and vertical rhythm — what mathematics gives a page rhythm without inventing values along the way
status: research
created: 2026-07-28
updated: 2026-07-28
---

# 02 — Proportional Systems

**Status:** Reference notes. The math here is from cited sources; the application to
modulation and macro rhythm is our framing, justified but opinionated.
**Sources:** see end of document.
**Written:** 2026-07-28

The question this document answers: *given that we want a rhythm across the page, what
mathematics gives us one without inventing values along the way?*

## Two scales, kept separate

Most interfaces muddy two scales that should be separate:

- The **type scale** — font sizes. Governed by a *modular scale*, a ratio that
  multiplies upward.
- The **spacing scale** — gaps, padding, margins. Governed by a *base unit* (most
  often 4px or 8px) that multiples of that base produce.

The scales interact (line-height × font-size gives a meaningful vertical increment) but
they are not the same. Designing a *type scale* and a *spacing scale* from the same ratio
sounds appealing and usually breaks.

## The type scale and its ratios

A modular type scale starts at a base body size and multiplies by a fixed ratio per step.
The ratio is the entire decision. From the modular-scale literature:

| Ratio | Common name | Feel | 16px base steps |
| --- | --- | --- | --- |
| 1.067 | Minor second | Very tight, almost flat | rarely useful |
| 1.125 | Major second | Tight, dense UI | 16 → 18 → 20.25 → 22.78 |
| 1.25 | Major third | **The safe default.** Balanced | 16 → 20 → 25 → 31.25 |
| 1.333 | Perfect fourth | Editorial, generous room | 16 → 21.3 → 28.4 → 37.9 |
| 1.5 | Perfect fifth | Distinct steps, dramatic | 16 → 24 → 36 → 54 |
| 1.618 | Golden ratio | *Often fails in product UI* | 16 → 25.9 → 41.9 → 67.8 |

The golden ratio figures prominently in design writing and almost never in production
design systems. At step 4 from a 16px base, you reach ~68px — useless for an `h4` in a
settings panel. *Marketing layouts* (where you have 1–2 headings and a hero) tolerate
golden; *product UI* does not.

A scale is a starting grid, not a law. The pragmatic move is to commit to a 1.25 ratio as
a default, and to allow nudges when reality (a particular heading that wraps badly)
demands it. The scale exists to kill *arbitrary values*. It is not there to override the
eye.

### The mobile-width problem

A scale that reads beautifully at 1440px can wrap an `h1` to four ragged lines on a 375px
phone. The check almost everyone skips is to verify the scale at the device widths that
actually ship. CSS `clamp()` can interpolate a step fluidly with the viewport:

```css
font-size: clamp(1.5rem, 1.2rem + 1.5vw, 1.953rem);
```

— grows with viewport instead of snapping at a media query. Useful when the type scale
should breathe at small sizes.

## The spacing scale

Eight pixels is the practical base because:

- It divides neatly into common device widths
- It produces both coarse (48, 64) and fine (8, 16) steps
- It survives both web and native (Material's traditional multiplier) on the same numbers
- Powers of two align with type and icon scales derived from the same number

Multiples: **8, 16, 24, 32, 40, 48, 56, 64, 72, 80** and so on. A typical interface uses
5–8 of these values; the others are tokens, not daily choices. Most design systems do
**not** ship all 20 — they ship 6–8 named ones (`spacing-sm`, `spacing-md`, …) and
accept that large gaps will need a calculation.

When teams feel cramped, they typically reach for one extra step. When they feel empty,
they are usually using one too many. The scale should be *small enough that picking the
"next" value feels obviously wrong if it isn't on the scale*.

### Density modes

Useful pattern: apply a *global multiplier* to the spacing scale rather than redeclaring
it for each density. A compact mode multiplies everything by 0.75 (24px → 18px, may break
the 8pt grid but preserves proportion). An accessible mode multiplies by 1.25 or 1.5.
The grid stays intact; the *visual density* adapts.

Caveat: the resulting values won't always fall on a strict 8pt grid. That is a tradeoff
— for density, proportionality matters more than strict snapping.

## Vertical rhythm and the baseline

A baseline grid is older than 8pt grids and addresses a different question: *where do
lines of text sit*? Wilson Miner's classic treatment (2007, A List Apart): choose a base
font size, choose a base line-height, multiply. For 12px text at 1.5 leading the
baseline is **18px**. Every vertical dimension in the document — margins, padding,
floats' heights, image dimensions — must sum to multiples of 18.

```
p   { margin-bottom: 18px; }
h1  { font-size: 24px; line-height: 36px; margin-bottom: 18px; }
h2  { font-size: 18px; line-height: 18px; margin-bottom: 18px; }
```

Critically: "any time you add vertical space with a margin or padding, you need to add
it in units of 18 pixels to maintain the baseline grid. You don't always have to add it
in one place, but you need to add it in pairs that add up to 18" — i.e., 6+12, 8+10,
etc. The constraint applies to *sums*, not absolute values.

In a marketing page the baseline matters less than inside long-form text (there the
reader scans lines, not modules), but the principle matters more: any time two text
elements are vertically adjacent, their baselines + any gap between them must land on
the grid. This is why *display headings* are paired with *body** at *specific* gaps in
design systems, not at *near* gaps.

### The baseline vs the spacing grid — they're different

The vertical rhythm is about *typography*. The 8pt grid is about *modules*. They can
coincide (a 16px module is divisible by an 8px or 4px baseline, both common) but they
serve different purposes. Most modern interfaces:

- Keep a baseline grid for everything *textual*
- Keep an 8pt (or 4pt) grid for everything *modular* (cards, gaps, padding)
- Allow different breakpoints to *multiply* the baseline but not change it — i.e., a
  mobile page still has its 4px baseline; only the multiplier applied to it changes

The temptation to unify them into one scale usually produces a number (often 8) that
satisfies neither job perfectly.

## What the math gives us

Three things that scale alone cannot:

1. **A single base from which all values descend.** No invented numbers. Every spacing
   and every type size is derived. The audit is a multiplication, not a measurement.
2. **A documented vocabulary for new values.** "Justify it against the scale" is a
   falsifiable claim. Most arguments about spacing end at "show me the calculation."
3. **The modulation curve.** Multiple scales (a small and a large, or two ratios)
   can be combined to generate the dense-sparse-dense pattern described in
   [01-the-problem.md](./01-the-problem.md).

The curve is the most important of the three. Two scales — one tight, one generous —
that trade density at section boundaries produces the *modulation* without any hand
tuning.

## Picking numbers for a project

A reasonable default, suitable for a long-form marketing page in 2026:

- Type scale: 1.25 ratio, base 16px, steps 14/16/20/25/31/39/49 (`text-xs/sm/base/lg/xl/2xl/3xl`)
- Spacing module: 4px (`--spacing: 0.25rem`), used as Tailwind already uses it
- Macro rhythm: 96px / 128px / 192px between sections — large, deliberate, *modulating*
  rather than uniform
- Border opacity: 0.08–0.12 in light mode, 0.10–0.16 in dark — enough to read as
  structure, faint enough to recede
- Type baseline: 24px (the most common module) — every adjacent text element pairs
  against a 24px unit

Everything else is interpretation.

## What this does not give us

- A page-level answer about *which* sections get more space — that's [01](./01-the-problem.md)'s question.
- A perception of rhythm — that's [04](./04-rhythm-and-perception.md)'s question.
- An empirical vocabulary for modern web — that's [03](./03-cases-and-patterns.md)'s question.

## Sources

- **Wilson Miner** — *Setting Type on the Web to a Baseline Grid*, A List Apart № 235
  (2007-04-10). The line-height math, the sum rule, the worked examples for paragraphs,
  headers, lists, floats, callouts. Read in full.
- **Timothy Graf** — *Mastering the 8-Point Grid: Building Scalable Spacing Systems for
  Modern Design Systems* (2026-05-25). The 8pt rationale, density modes, common pitfalls,
  the case-study references to Material, Carbon, Atlassian, Primer, Polaris.
- **iotools.cloud** — *Modular type scales in CSS: pick a ratio, then check it against real
  copy* (2026-06-07). The ratio table, the worked 1.25 math from 16px, the
  golden-ratio-fails-in-product argument, the mobile-width and clamp() section.
- **Tim Brown** — *Modular Scale* (modularscale.com), pioneer of the web-side modular
  scale.
- **Robert Bringhurst** — *The Elements of Typographic Style* (4th ed.). Theurival reference
  for vertical rhythm and musical proportions in type. Not directly web-readable, but the
  conceptual source.
- **Josef Müller-Brockmann** — *Grid Systems in Graphic Design* (1981). The authoritative
  treatment of grid systems in editorial design. Cited but not fetched; referenced via
  secondary sources. Worth its own fetch when the empirical question in
  [03](./03-cases-and-patterns.md) asks about precedents.
- **Material Design, Carbon, Atlassian, Primer, Polaris spacing systems** — referenced in
  Graf's case studies, not read individually here. Worth a follow-up read when applying.
