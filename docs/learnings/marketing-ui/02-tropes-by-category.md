---
name: marketing-ui-02-tropes-by-category
description: Per-category encoding of marketing UI primitives — the load-bearing conventions that make each category recognizable, the trim points that distinguish senior from centroid
status: research
created: 2026-07-28
updated: 2026-07-28
---

# Tropes by Category — The Grammars of Recognition

**Sources:** Linear Design System reference (marcus/marcus-skills); Stripe Sessions design assets; Vercel report-site design guidelines; Refactoring UI (Wathan & Schoger); this repo's `../agent-system/03-the-fundamentals.md`.
**Status:** Catalog. Each category compiled from conventions recurring in successful marketing surfaces. Sourced where the convention is documented; *tactical* where it's a senior-deviation from centroid.

The conventions below are what makes a primitive *legible as the category in one second*. The senior move is not adding them but **selecting which to keep** — centroid primitives show every convention; senior primitives show the load-bearing ones.

General rules, all categories:

- **One focal per primitive.** Inside an evocative card, one element is the demonstration. Other elements are supporting cast.
- **Sibling trim.** A primitive showing N items where N+1 would be honest reads as *evidence of curation*. Show enough; show that you chose.
- **Length variance.** At least one short, one long. Pure-uniform rows look generated.
- **Typography peer equality.** All labels at the same size; all values at the same size; the difference between them is *label vs value* semantics, not pixels.
- **Token alignment.** No bespoke colors; no one-off font weights; no outside-radius. Same system as the product.

## Logs and event streams

The grammar:

- **Monospace** is load-bearing. Replace it with sans and the category dies.
- **Timestamps** at the left or on a thin column, formatted ISO or relative ("2m ago") — never both.
- **Severity** by color-coded level badge (`INFO` / `WARN` / `ERROR`) or a left border of 3px in semantic tokens.
- **Right column** the message body, possibly with a code-highlighted substring.
- **Density** is high — comfortably 12–18 rows visible on a 400px-tall primitive.
- **Dark background** often used. A dark log primitive reads more technical than a light one — useful constraint when the rest of the page is light.

Senior deviations from centroid:

- Not every row colored. One severity shown clearly; others neutral.
- Truncate at 200–300px rather than wrap, with a subtle fade.
- A filter input *suggested* at the top — not interactive, but visually present enough to communicate searchability.

## Tables and data lists

The grammar:

- **Header row** separated by a 1px line or a background step, never both.
- **Column headers** with a small label size; cell content larger; peer alignment matters (numbers right, text left, action column fixed right).
- **Row separator** thin (`border` token at low opacity) **or** alternating row tint — never both. The two-for-one is the centroid.
- **One row selected** to communicate interactivity — without it the table reads static.
- **Filter chips** at the top right, suggesting the table is *sliceable*.

Senior deviations from centroid:

- Row count is **7–12**, not 5 (the canonical demo number) and not 50 (the realistic number).
- One column shows variance in width — never equal columns, which reads as template.
- Action column often omitted — primitives that show *actions* invite clicks that don't fire.

## Charts and visualizations

The grammar:

- **Title** small, above the chart, in muted color.
- **Axis labels** if any, in the same muted treatment, not emphasized.
- **No legend** when the data allows direct labels — legend-only charts read as dashboard templates.
- **Color** restrained: 2–3 series max. Centroid charts use rainbow palettes.
- **Y-axis** either starts at zero or shows a visible break. No cropped bars that exaggerate.
- **Attribution** at the bottom in caption-sized text.

Senior deviations from centroid:

- The chart's shape is **the data's shape**, not a smoothed area or a colored gradient. Bars bars, lines lines.
- Annotations only when annotating something specific, never decorative.
- One visualization per primitive — never two stacked, except when one is the *highlighted* and the other is *contextual*.

## User lists and rosters

The grammar:

- **Avatar** at the left, fixed width, with monogram fallback if image absent.
- **Name + email** or **name + role** centered in the row; peer typography.
- **Status indicator** to the right of the name (online dot, role badge, presence line).
- **Hover state** suggested by a subtle background tint on the second or last row.
- **Padding** is the system's standard row height — bigger looks like a directory, smaller looks like data.

Senior deviations from centroid:

- One row's text *truncated* with the standard `truncate` utility (per `../shadcn/02-agent-rules.md`).
- One avatar maybe missing or showing initials — proves the system tolerates incomplete data without breaking visually.
- Status color used **once** — no rainbow row of status dots.

## Code and snippets

The grammar:

- **Monospace** again, load-bearing.
- **Syntax highlighting** restrained — 4–6 colors, never the full rainbow.
- **Line numbers** optional; if present, also faint.
- **Filename tab** in the top-left of the primitive ("auth.ts") suggesting it lives in a repo.
- **No copy button** or a *suggested* one — never both (functional primitives invite interaction).
- **Window chrome** (rounded top, traffic-light dots *or* none) optional. The "browser frame" is a centroid tell.

Senior deviations from centroid:

- Only 8–15 lines visible. Full file primitives read as code dumps.
- One line longer than the others; one line shorter. Length uniformity is the slug of code primitives.
- A commented-out line (`// disabled in prod`) or a `TODO` — signals real code without saying anything specific.

## Settings and forms

The grammar:

- **Label** above input (vertical layout) **or** label-in-input (placeholder-only). Two columns of label-left-input-right reads form-template.
- **One input shows a value already** — empty forms look like templates, populated forms look like real configurations.
- **Toggle / select** state shown distinctly — one switch on, one off; one select showing first option; one field disabled or pre-filled.
- **Save/cancel row** at the bottom, often muted, the action *not* primary.
- **Section dividers** between groups, often a thin rule plus a section title.

Senior deviations from centroid:

- Only 3–6 settings shown. Full settings pages read as inventory.
- One setting shows a subtle "verified" or "synced" tag — proves state, not input.
- One toggle's state is the *non-default* — proves the control matters.

## Product and course cards

The grammar:

- **Image or thumbnail** at the top, fixed aspect ratio (4:3 or 16:9 most common).
- **Title** second, larger than body.
- **Metadata row** (instructor name, duration, badge level) in muted treatment.
- **Action** at the bottom right ("Enroll", "View") — muted, not primary.
- **One card in the primitive** may show *price* or *level*; the others may not. Variance, not uniformity.

Senior deviations from centroid:

- 3–5 cards, not 3 (the centroid row).
- One card's image is *missing or alt-tinted* — proves robustness.
- One card has a *secondary* indicator ("New", "Pro") — restrained, not a giant badge.
- Asymmetric image heights where appropriate — equal images read as catalog.

## Messages and chat

The grammar:

- **Header** with avatar, name, status, last-active timestamp.
- **Bubble alignment** — own messages right, others' left; never centered (centroid tell).
- **Timestamp** between clusters of messages, in muted caption-sized type.
- **Reaction / status row** below bubbles, small icons with counter-style numbers.
- **Typing indicator** suggested by three animated dots (optional — interactive invites engagement).

Senior deviations from centroid:

- 4–7 messages, mixed lengths, with one short reply and one long.
- One message shows *attachment preview* (file card, link preview) — not every message is text.
- One message marked as *edited* or showing a single checkmark vs. double — proves state without inviting actions.

## Across all categories: what makes primitives senior

Senior primitives share a pattern that has nothing to do with category:

- **Restraint against the centroid.** Different hue when canonical, missing column when typical, different count when expected.
- **Trim not substitution.** Stripping items looks intentional; replacing them with placeholders looks unfinished.
- **Variance over uniformity.** Different lengths, one absent piece, one odd state.
- **Same tokens, different trim.** Reads as design-system-faithful and product-honest at once.

`03-mock-taxonomy.md` catalogs the *kinds* of primitives beyond these per-category distinctions: snapshot / re-imagining / generic / annotated / compositional. Each kind navigates the three tensions of `01-the-genre.md` differently.
