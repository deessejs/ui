---
name: marketing-ui-01-the-genre
description: Define the marketing UI primitive — evocative components that suggest a category without functioning; the four alternatives and why each fails; the three design tensions that make them hard
status: research
created: 2026-07-28
updated: 2026-07-28
---

# The Genre — Marketing UI Primitives

**Sources:** Vercel public design guidelines for report sites; Linear Design System reference (marcus/marcus-skills); Stripe Sessions design DNA (across multiple Behance/Dribbble studies); Refactoring UI (Wathan & Schoger, 2018); ux-skill (*centroid problem*, 2026); this repo's `../agent-system/` and `../layout/` notes.
**Status:** Synthesis. Definitions and framing are ours; conventions are sourced to the case studies cited.

A *marketing UI primitive* is a UI component on a sales page that **suggests a category of product behavior without itself behaving**. It exists to be *recognized* — log table, user list, course card, dashboard mock — in under a second, by a reader who isn't going to interact with it.

The category is old (Vercel shipped its first log-table marketing mock in 2018), but the term is still useful because the *encoded version* of these primitives is what `../agent-system/04-the-mechanism.md` cannot produce without conventions being explicit.

## Why they exist on the page

A marketing page has to communicate three things at once: **what the product is, what it looks like, and that it is real software rather than a render**. Copy can do the first. Photography can do the second. Neither does the third. A primitive does all three — at the cost of being inert.

Without primitives, the page tilts into one of two failure modes:

- **All copy, no visualization** — reads as a brochure, not as software. Pages like this look like they were written by a content team, not built by engineers.
- **All illustration** — abstract scenes ("team standing in a colored void") do not communicate that this is a working product. They communicate that the company has a brand budget.

The primitive is the *minimum-evidence* move. It says: this is what the product *would* look like if you logged in.

## Four alternatives, four defects

Each alternative answer to "what fills this grid cell" has a specific defect:

| Alternative | Defect |
| --- | --- |
| Screenshot of the real product | Rigid, unthemable, reveals unfinished corners. Per `../agent-system/02-the-obstacles.md`: a senior-design move that exposes a junior-fidelity product is worse than either alone. |
| Hand-drawn SVG illustration | Decorative, doesn't read as "software". The user sees a scene, not a product. |
| Geometric placeholder (gray rectangle) | Honest but projects emptiness. The competency claim vanishes. |
| Copy describing the feature | Works for one-liners; fails when the feature is a workflow or state. |

The primitive closes this gap. It is a UI-shaped simulation that says *real software* without *being* real software.

## The three tensions

These are the design constraints that make marketing primitives hard. Every primitive navigates them; senior primitives handle them deliberately; centroid primitives ignore them.

### Tension 1 — Fidelity without commitment

A primitive that is **too realistic** engages expectations it cannot keep: a reader taps a button, nothing happens, and the trust claim collapses. A primitive that is **too abstract** loses category recognition — it stops reading as a log table and starts reading as a generic block.

The window is narrow. The signal that the primitive nails the window: every visible element looks *like* the real product but no element invites interaction. The primitive is recognizable as a category at one glance and inert at the next.

### Tension 2 — Recognition by genre convention

Each category — logs, tables, charts, users, code, settings, courses, messages — has its own *grammar*. The grammar is what makes a log table recognizable as a log table: timestamps, monospace, level badges, soft severity color, recent-first order. Without that grammar, the primitive reads as a block with no category. With too much, it becomes parodic.

`02-tropes-by-category.md` catalogs these grammars. The senior move is knowing which conventions are *load-bearing* (monospace in logs) and which are *generic* (a header row in tables). Strip the generic; keep the load-bearing.

### Tension 3 — Alignment with the system

The primitive lives inside a design system. Its colors, type, spacing, radius, and shadows come from that system's tokens. A primitive that drifts from the system becomes a *debt of coherence* — one more thing future updates have to remember to keep aligned.

The senior move (per `../agent-system/03-the-fundamentals.md`) is to make the primitive read *exactly* as the real product's components read, minus interactivity. Stripped items (labels, hover states, the third column) should look absent because of *trimming*, not because of *substitution*. They should look like a footnote on the design system, not a cousin of it.

## The centroid trap, marketing-specific

The centroid problem (per `../agent-system/02-the-obstacles.md`) is acute on marketing pages. LogSnag-style green dot, GitHub-style avatar + commit hash, Stripe-style pricing table with gradient borders — these are *the words in the vocabulary*, and the model reaches for them by default.

What makes a primitive senior is **restraint against the centroid**: choosing a hue other than the canonical emerald, dropping the third column, varying the row count. The senior primitive is *legible as the category* without being *the canonical example of it*. It is the same category through a less-average lens.

## Where this lives

Marketing primitives are *not* application components. They share *tokens* with the product (same color semantic variables, same type scale, same spacing scale) but they are not interactive and not exported to user code. They should live under a distinct namespace in the registry (`marketing/`) — see `04-into-the-system.md` for the production rules and how this intersects with `../shadcn/04-registries-and-mcp.md`.

The next doc (`02-tropes-by-category.md`) catalogs the genre conventions per data type. The doc after (`03-mock-taxonomy.md`) names five distinct kinds of primitives (snapshot / re-imagining / generic / annotated / compositional). The closing doc (`04-into-the-system.md`) maps them onto the agent system — what makes a primitive encodeable, where it lives in the layout, how it gets built.
