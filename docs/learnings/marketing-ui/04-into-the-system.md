---
name: marketing-ui-04-into-the-system
description: Marketing primitives inside the design system — encodeability, layout integration (focal/soutien vs modulation), production economics; how this connects to agent-system/ and the rest of the learnings tree
status: research
created: 2026-07-28
updated: 2026-07-28
---

# Into the System — Primitives, Layout, Production

**Sources:** the entirety of this repo — `../agent-system/`, `../shadcn/`, `../tailwind/`, `../layout/`; Refactoring UI on restraint and finishing touches; Vercel design guidelines on the page as a field.
**Status:** Synthesis. Connects the previous three `marketing-ui/` docs to the rest of the design-system research.

A marketing primitive lives in three planes at once:

- **As an *artifact***: a thing rendered on the page (covered in `01-the-genre.md`).
- **As a *category convention***: a recognizable instance of a kind (covered in `02-tropes-by-category.md`).
- **As a *kind of mock***: snapshot, re-imagining, generic, annotated, compositional (covered in `03-mock-taxonomy.md`).

This doc covers the fourth and last plane: **the primitive inside the design system, the page, and the production pipeline**. The mechanical questions an agent has to answer to produce a primitive that is senior instead of slop.

## The encodeable surface — what makes a primitive senior

Pulling from `../agent-system/03-the-fundamentals.md`, a primitive is senior when:

- **It uses the system's tokens only.** No bespoke colors, no one-off type scales, no outside-radius. The primitive reads as *from the system*, even when it isn't from the runtime product.
- **Its composition is restrained.** One focal element inside the primitive; secondaries support. The trim from `02-tropes-by-category.md` is enforced — 7–12 rows, not 50; 8–15 lines of code, not 200; 4–7 messages, not 40.
- **Its place in the layout is disciplined.** Per `../layout/01-the-problem.md`: the primitive is either *focal* (the cell carries the section) or *soutien* (a counterbalance to text). Never both.
- **It deviates from the centroid deliberately.** The hue is non-canonical or the column is missing or the count is untypical, and the deviation is a deliberate choice rather than an accident.
- **It is internally consistent.** A primitive with peer-equal typography, consistent spacing, and a single separation strategy. Per `../layout/03-cases-and-patterns.md`, the latter means: borders *or* shadows *or* background, never all three.

These are encodeable. Each maps to a rule a tokens/registry/lint stack can enforce. The hard part isn't encoding them — it's *knowing* the agent should encode them, which is what the previous three docs lay out.

## The component model

Marketing primitives should be **real React components**, not images. Three reasons:

1. **They share tokens with the product** — and only components inherit the token system. An image is a CSS island.
2. **They participate in the registry** — so they're discoverable by MCP, queryable by the agent, and substitutable without a deploy.
3. **They render in the browser** — so they participate in the `Code → Render → Inspect → Revise` loop from `../agent-system/04-the-mechanism.md`. Static images do not.

Where they live in the registry:

```
shadcn registry
├── ui/             ← real interactive components
├── blocks/         ← assembled interactive blocks
└── marketing/      ← evocative primitives (this directory's domain)
    ├── log-table.tsx
    ├── user-list.tsx
    ├── code-snippet.tsx
    ├── settings-card.tsx
    ├── course-card-grid.tsx
    ├── message-thread.tsx
    ├── chart-bar.tsx
    ├── table-with-filters.tsx
    └── ...
```

The `marketing/` namespace is the clearest signal — these are not for production use, they are for marketing pages. The boundary is enforced at the registry level.

A primitive receives, at minimum:

- `rows` or `items` — the dataset
- `severity` or `variant` — semantic meaning
- `title` and `meta` — small text fields, optional
- A `className` extension point *only* for layout (positioning) — never for color or type

It does **not** receive: a handler, a URL, a state. It is never wired. Adding these is the most common primitive drift — the primitive becomes a draft component and stops being a primitive.

## Layout integration — focal vs soutien

Per `../layout/01-the-problem.md`, the page modulates by alternating sparse and dense sections. A primitive is the densest possible node a section can carry. The rule:

- **Focal primitive** — a single section is essentially the primitive. Hero-with-pricing-table is the canonical Vercel pattern. Hero copy is secondary; the pricing block carries the section.
- **Soutien primitive** — a section is dominantly copy, with the primitive as evidence. The text says *X*, the primitive shows *X*, the eye reads both.
- **Banned** — section that contains both a focal *and* a soutien primitive. Two visualizations fighting for attention within one section is the centroid's favorite move.

The decision (focal or soutien) is a page-recipe decision, made by the brief. The primitive itself doesn't carry the decision — the section does. The agent can be told via the brief which role the primitive plays; the layout system enforces that there is at most one focal primitive per section and one soutien primitive total in a sparse section.

## Production economics — who builds them, when

Three modes of production:

**Mode 1 — Designers in Figma.** Fastest to iterate, hardest to keep aligned with the token system. Drift is the failure mode.

**Mode 2 — Engineers in React.** Slowest to produce first, easiest to keep aligned. Drift on visual decisions is the failure mode.

**Mode 3 — Hybrid: design in Figma, build in code at promotion.** First-class primitives ship as code; one-off campaign variants may stay as Figma mockups. The promotion criterion is whether the marketing page is permanent enough to be worth a code primitive.

The senior move is to bias toward Mode 3 and resist one-off designs in Figma that bypass the system. Per `../agent-system/02-the-obstacles.md`, the centroid fight is won by accumulating in the system over time — every campaign-specific Figma mock that doesn't become a primitive is a *loss* of system coverage.

The agent's role in this:

- Designers and PMs write briefs that include *primitive category + kind + focal/soutien role*.
- The agent reads the registry, picks the primitive, fills parameters from the brief, and composes.
- New primitive requests flow back into the registry — when a brief asks for something not in the catalog, the primitive becomes a registry addition before the page is built.

This is the *closed-loop memory* dimension from `../agent-system/02-the-obstacles.md`: each campaign that needs a new primitive makes the system more capable of the next campaign.

## Anti-patterns specific to marketing primitives

Beyond the general anti-patterns in `../shadcn/05-anti-slop-playbook.md` and `../layout/03-cases-and-patterns.md`, primitives have their own:

- **Decorative chrome.** Browser frames, window controls, *"this looks like a real screenshot"* artifacts. A senior primitive doesn't pretend to be a screenshot.
- **Curated-to-the-point-of-fake.** Five testimonials all 11 words long. Five metrics all exactly +20%. The imitation of evidence becomes its own tell.
- **The wrong axis of restraint.** A primitive showing only one item is *not* restrained — it is unfinished. Restraint is the count *slightly below honest*, not *way below*.
- **The icon-stand-in.** Replacing a row's missing data with an emoji or vague placeholder. The token-aligned pattern is to show what the system would show — a `Skeleton`, an `Empty` state, an `AvatarFallback`, never a Unicode glyph.
- **Generic-but-not-yours.** A generic primitive that *also* doesn't reflect the brand's tokens. Reads as both generic and unbranded — the worst combination.

## How this connects to the rest of the tree

The marketing-ui/ docs are the most specific layer of this research. They depend on:

- **`../agent-system/01-the-goal.md`** for the encodeability framing — what's senior and what isn't.
- **`../agent-system/02-the-obstacles.md`** for the centroid problem — the worst case is here, on the marketing page.
- **`../agent-system/03-the-fundamentals.md`** for the encodeable fundamentals — every primitive craftsman rule lives there first.
- **`../agent-system/04-the-mechanism.md`** for the registry/MCP delivery model — primitives live in the registry or they don't ship.
- **`../shadcn/`** for the component model, the token system, the registry specification.
- **`../tailwind/`** for the constraint that makes "tokens only" enforceable.
- **`../layout/`** for the focal/soutien distinction, the modulation curve, the anti-patterns of page composition.

What the marketing-ui/ docs add back to the rest of the tree is the *enumerated grammar of evocative components* — the per-category conventions and the five-kind taxonomy — that the other notes abstract over. Where `layout/03-cases-and-patterns.md` says "the surface inside a grid cell can be many things," this folder says what those things are, how each is recognized, and how each kind navigates the encodeable surface.

## Open questions

The remaining questions for marketing primitives:

- **Lifespan.** When does a primitive deserve promotion from Figma to code? When does a code primitive deserve deprecation?
- **Per-campaign variants.** When the same primitive needs minor visual variation (a holiday palette, a campaign-specific color), how is that expressed — `variant` props, or new primitives?
- **Animation budget.** Per `../layout/03-cases-and-patterns.md`, Linear animates its marketing primitives; Resend doesn't. The encodeable answer to "should this primitive be animated" is unsettled.
- **The boundary with snapshots.** A snapshot of a real feature is still a primitive when cropped and used on a marketing page. When does a snapshot become "the primitive" and when does it sit beside the rendered primitive?

These are the next questions for this folder, not blocking what is here.
