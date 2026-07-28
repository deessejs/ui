---
name: layout-03-cases-and-patterns
description: Reading Vercel and Linear as opposite solutions to the same composition problem; extracting the recurring modern SaaS vocabulary and the dimensions where each chooses
status: research
created: 2026-07-28
updated: 2026-07-28
---

# 03 — Cases and Patterns

**Status:** Reference notes. The reading of Vercel and Linear here draws on the public
guidelines linked at the end of the document. We separate what is documented from what
we infer.
**Written:** 2026-07-28

The right way to ground a layout theory is in pages that ship at scale. Two reference
cases — Vercel and Linear — represent opposite answers to the same problem. Reading
them in opposition reveals what is load-bearing in each.

## Two poles of the same problem

Both have to compose a page where distinct types of content (typography-heavy, data-
heavy, interactive) coexist. They solve this with opposing instincts.

**Vercel — the editorial pole.** Sparse. Generous. Frame-led. The page is a *field*.
Sections are delimited by breath and faint rules. Color is monochrome and *earned* — only
present when it carries meaning. Density varies section by section. Modulation is the
primary tool.

**Linear — the data-density pole.** Dense. Tile-led. Edges, not gaps. The page is a
*grid*. Cells tile edge-to-edge with zero margin and 1px borders. Whitespace inside a
cell; precision between cells. Density is the primary tool; modulation comes from view
modes, not section variation.

The contrast tells us what is *necessary* (both must contain content, both must
communicate hierarchy) versus *chosen* (the form of the container).

## Vercel — the layout vocabulary

Sourced from Vercel's public design guidelines for report-style sites — a published
style system meant to be reused across dozens of generated pages. The document is
explicitly a *generative* spec, so its anti-patterns are as informative as its rules.

**Frame and field, not stack.** *"Compose the page as a field, not a stack of
components. Establish one page-level throughline and one focal relationship in each
reading moment or major section. Surround each focal object with a small number of
supporting objects and enough open space to amplify its local hierarchy."*

Translation for a landing page: the page is one composition, not five plus a final
banner. Each viewport-height reads as one *moment* with a focal object and supporting
elements around it. The vertical transitions are *between moments*, not between
independent sections.

**Pacing the scroll.** *"Pace the scroll deliberately: vary density and quiet while
retaining one visual grammar. Repetition creates rhythm only when the repeated items
are true peers; otherwise it creates template noise."*

This is the modulation principle in published form. Density varies. Rhythm (visual
grammar) does not. *True peers* is the criterion for repeating a section shape — if the
content differs in any meaningful way, the section's outer shape must differ too. This
is why a generic SaaS site looks generic: every section is structurally identical
even when the content isn't.

**The squint and text-mask tests.** *"Use a squint test: at a glance, the dominant
claim or evidence should be obvious and the reading path should be stable. Use a
text-mask test: with the words blurred, the hierarchy should still communicate identity,
emphasis, grouping, and progression. If every block has equal weight, redesign before
coding."*

Both are diagnostic. The squint test catches density problems (everything competing).
The text-mask test catches typography problems (typography doing the work that
**surfaces** were doing). The intent is the same: hierarchy should survive blurring the
text. If it doesn't, the design is leaning on decoration.

**The role order.** The guidelines name roles — `display`, `title`, `heading-24/20/16`,
`lede`, `body`, `label`, `caption`, `metadata` — and instruct:
*"Equivalent peers always share role, size, weight, line-height, and numeric
treatment; never resize one because its string is longer or its value is larger."*

This is the answer to the bento problem. The bento fails because every cell gets
visually equal treatment regardless of importance. Named roles with peer-equal
treatment produce hierarchy by *grouping*: peers look alike, non-peers look different.

**Restraint as a noun.** *"Diagnose quantity separately from intensity. If the page
feels busy, remove, combine, or reorder content. If it feels loud, reduce competing
color, scale, weight, borders, surfaces, and motion. Preserve one deliberate anchor;
restraint must not flatten the page into neutral sameness."*

Busy = wrong content. Loud = wrong styling. Different problems, different fixes.

**Reading prose width.** *"Keep prose near 60–68 characters per line. Rewrite before
shrinking."*

The most concrete single rule in the document, and the easiest to test. Long lines kill
reading speed; shrinking the type to *look* like it fits is a defensive move that
damages the entire hierarchy. If a paragraph is too long for 68 chars at the
site's body size, the paragraph is too long.

**Macro rhythm.** *"Build vertical rhythm from relationships: heading → its first
paragraph: close. Paragraph → paragraph or list: one body rhythm. Label → value →
detail: identical across peers. Content group → new section: clearly larger. Caption
or source → evidence it qualifies: close enough to read together. Do not apply one
uniform gap to every child."*

These gaps are *named roles*. The lack of a single "section gap" is the point — the
gap between a heading and its first paragraph is a different kind of relationship
than the gap between two sections, and naming them removes the ambiguity that produces
the etouffe/vide oscillation.

**The negative definition.** The document ends with a list of *anti-patterns*. We list
the ones with layout geometry rather than just typographic decoration:

- "Generic centered hero copy followed by a card grid." (the canonical slop)
- "Cards nested inside cards, or borders used to repair weak hierarchy." (cards as
  band-aid)
- "Identical section silhouettes across unrelated reader questions." (template noise)
- "Repeated full-width bars that do not share a scale or encode a visible difference."
- "A narrow table floating inside a wide section, or a wide table compressed into
  broken words." (width handling)
- "Tiny muted prose, arbitrary font sizes, inconsistent peer values, or misaligned
  baselines." (related to scale and rhythm)

These are not aesthetic complaints. Each names a *failure mode* that the positive rules
above prevent.

## Linear — the layout vocabulary

The Linear reference describes a system designed for *packed information*, not
marketing. The vocabulary is different because the goal is.

**Tiled grids over gaps.** *"Content panels sit edge-to-edge with zero gaps and zero
border-radius. Grid cells tile like a spreadsheet — separated by 1px border lines, not
whitespace. No gap between cells, no padding around the grid container. Every pixel
is content space."*

The opposite decision from Vercel: where Vercel uses breath to separate, Linear uses
*borders*. Where Vercel's density varies section by section, Linear's density is
constant within a view, varied by *view mode* (list / board / split / timeline).

**Borders as structure, three tiers.**

| Tier | Use |
| --- | --- |
| Strong | Section and component boundaries: sidebar edges, headers, metric grid outer borders |
| Default | Internal component borders: inputs, buttons, table headers |
| Subtle | Lightest separators: table rows, activity items, detail panel internals |

Structure from border, not from spacing or elevation. The eye groups by line-weight
hierarchy rather than by air.

**Sharp edges on data, rounded only when floating.** *"Rounded corners are reserved
exclusively for floating/elevated surfaces (modals, dropdowns, command palette,
popovers)."*

Borders carry structure; border-radius signals a different *state* — floating, modal,
transient. Same principle at smaller scale: rounded corners are not decoration, they
are a *semantic marker* that an element lives outside the data field.

**The flat-vs-elevated two-tier.** *"Shadows and border-radius are reserved for
elements that literally float above the page — modals, popovers, dropdowns, command
palettes. Everything else is flat. This creates a clear two-tier system: the tiled
data surface (sharp, flat, dense) and the occasional overlay (rounded, shadowed,
elevated)."*

This is the closest the reference comes to the Vercel *modulation* principle — the
two tiers of surface *are* the modulation. The eye knows immediately which surface it
is on. Same job as Vercel's name roles, different mechanism.

**The anti-patterns, applied to layout:**

- "Container nesting … breaks the flat grid pattern. If you find yourself writing
  `.card > .card-body`, stop."
- "Decorative shadows" on tables, cards, panels, or any data surface.
- "Rounded data surfaces" on tables, grids, list items.
- "max-width content containers" — content fills its column; the grid handles width.
- "Color absence" — restraint misread as monochrome.

The throughline is *every layer costs*. Containers, shadows, radii, and max-widths are
all places content can leak into decoration. Linear's answer is to remove every layer
that isn't load-bearing.

## Reading the two together

Same problem, different constraints, different choices. Both come out *composed*
because they made firm decisions about which *dimension* to solve layout in.

| Dimension | Vercel | Linear |
| --- | --- | --- |
| Macro rhythm | Density-curve; breath + faint rules | Single surface; tight tiling |
| Section delimiter | Air + ~1px line at low opacity | 1px line at full visibility |
| Cell separation | Gap | Border |
| Hierarchy signal | Named type roles + size + spacing | Edge weight + position |
| Density modulation | Section-to-section | View-mode swap |
| Decoration budget | Effectively zero; "earn a surface" | Effectively zero; "every pixel is content" |

What is striking is how many cells in this table are the same. The differences are
*which dimension* got chosen as primary. The decisiveness is shared.

## The recurring vocabulary across modern web

Patterns that survive the two cases and recur in design-quality SaaS pages in 2026:

- **Named typography roles with peer equality.** Vercel explicitly, Linear implicitly
  via Inter Display / Inter / Mono. Roles rather than arbitrary sizes.
- **A typographic baseline, even at module scale.** Not necessarily a hard baseline grid,
  but a consistent *gap to adjacent text*. Linear describes this as "label → value →
  detail: identical across peers."
- **Container width from layout, not from `max-w`.** Both systems handle width through
  the grid, not through inner constraints.
- **One anchor per moment.** Vercel: "one focal relationship in each reading moment."
  Linear: the cell.
- **Borders as structure.** Either Vercel-faint or Linear-strong. Never both, never
  gaps-and-borders together for the same boundary.
- **No decorative shadows on content.** Floating elements may cast shadows. Content
  surfaces don't.
- **Quantitative restraint.** Color and weight are scarce, not plentiful. One accent
  per screen.
- **The modulation principle.** Either at the section level (Vercel) or the view-mode
  level (Linear). Both refuse uniform density.
- **The macro frame.** Either borders-x (Vercel) or the sidebar+content grid (Linear).
  Both *contain*.

What to test for in any new layout: does it have all nine? Where it lacks one, what is
doing the work instead, and is it intentional?

## What we still don't know

- The exact relationship between the baseline and the 8pt grid in modern systems. They
  align at 24 / 8 = 3 steps of 8, which is unusually convenient. Is this load-bearing or
  coincidence?
- The exact mechanism of *how* Vercel moves from sparse to dense within a page. The
  guidelines say *to* vary density but not the structure of variation. This is the most
  important open question for [01](./01-the-problem.md)'s modulation problem.
- Whether the modern SaaS vocabulary generalizes to *non-marketing* content types
  (docs, settings pages, e-commerce listing). The two cases here are both
  *narrative*; a theory should explain whether docs should look like Linear or Vercel,
  and where.

## Sources

- **Vercel report-site design guidelines** (public, generative spec). The source of
  every quote marked "Vercel" above. Read in full; the document is long but most of it
  is *operational*, not aspirational, and reads cleanly.
- **marcus/marcus-skills · linear-design-system.md** — third-party synthesis of Linear's
  design system from public blog posts and direct observation. The source for every
  quote marked "Linear" above. Strong on observable patterns (sharp edges, three-tier
  borders, density modes) and weaker on internal values (specific pixels, token names).
- **BestSaaSWebdesigns, Shadcn.io, Open-Design.ai, designMD, WebUIPrompt** —
  case-study listings with visual snapshots of Vercel and similar surfaces. Not
  individually fetched; useful for visual reference but not authoritative on intent.
- The Vercel guidelines directly recommend what the modern SaaS vocabulary is — it
  is, in effect, Vercel's own. The job is to test whether Linear is on the same
  vocabulary or a parallel one.
