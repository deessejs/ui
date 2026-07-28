---
name: layout-04-rhythm-and-perception
description: Gestalt principles applied to layout; the page read in time; modulation as the perceptual answer to density
status: research
created: 2026-07-28
updated: 2026-07-28
---

# 04 — Rhythm and Perception

**Status:** Reference notes with synthesis. The Gestalt principles are well-established
(sources at end). The application of them to *page composition in time* is our framing.
**Written:** 2026-07-28

The mathematical resources in [02](./02-proportional-systems.md) and the empirical
patterns in [03](./03-cases-and-patterns.md) are necessary but not sufficient. The
question this document answers: **why does modulation work, and what does the eye
actually do when it scans a page?**

## Part 1 — Perception is the constraint

The eye doesn't read a page the way a designer draws it. It reads *Gestalt patterns* —
wholes it constructs automatically. The page is built locally and perceived globally.
When the two disagree, perception wins.

The most useful principles for layout, named once and translated to web:

**Proximity.** Things close together are seen as related. Things farther apart are seen
as separate. *The most important principle for the spacing scale* — it is the rule that
makes a card a card. If two cards are separated by less than the gap inside a card, the
perception breaks down.

**Similarity.** Things sharing color, shape, or size are seen as related. This is why
*peer equality* matters for typography — a heading at 24px next to a body at 16px next
to a label at 14px next to a caption at 12px produces four similarity groups, and the
eye uses them to organize hierarchy. Two headings at slightly different sizes produce
*one* group (similar) plus a distinction (different size). Two labels at exactly the
same size are a *list*. Similarity is doing the hierarchy work.

**Common region.** Things inside the same closed area are seen as related. The card.
The grouped form field. The pricing tier. *Any visible boundary is itself a grouping
mechanism.* This is why "every section in a card" produces a region-bounded page
where the cards become the hierarchy; the page-level structure vanishes behind them.
Linear's choice to *not* card is also a choice to *not* impose the common-region
heuristic on its hierarchy.

**Figure and ground.** An element is either figure (the focus) or ground (the
background). The smaller and the more convex, the more likely to be figure. On a
marketing page, the *focal object* (the hero claim, the CTA, the proof) must be
figure; everything else must be ground. This is harder than it sounds — if every
element is the same size, weight, and color, *all of them are figure*, and the eye
has no place to land.

**Focal point.** A unique or different element captures attention. Hierarchy is
literally built from this — *one element is different*, therefore the eye goes there.
If you ever feel the page is "competing for attention," you have too many focal
points. Modulation is, mechanically, *controlling the number of focal points*.

**Continuity.** Elements on a line or curve are seen as related. The eye follows
visual lines. Borders are the strongest continuity device. A faint horizontal divider
across the page is a continuity line that says *these things are peers*. A column grid
is a set of vertical continuity lines that say *these things are co-equal*. The page
rhythm is, in part, made of these invisibly-converging lines.

**Closure.** The eye fills in gaps. A three-segment line is seen as continuous even at
zero gap. A 2px dot pattern reads as a line. Cards with internal padding feel like
cards even with no border. The closure principle is what lets us leave *negative
space* in compositions without losing grouping — the eye fills in the boundary.

**The key takeaway from Gestalt.** *The eye groups automatically. Design is choosing
which groupings you want, and then making them obvious.* If the layout fights
perception — if proximity says "group these" but similarity says "differentiate" — the
page will read ambiguously. The work is to choose which cues to use and to use them
consistently.

## Part 2 — Modulation is perceptual, not measurable

The etouffe/vide problem is mechanical until you describe it perceptually:

**A page of uniform density is, perceptually, a wall.** Every element is in figure. No
element stands out. There is no anchor. The reader's eye drifts. Even if the *absolute*
density is moderate, the *uniformity* reads as oppressive. Removing 30% of the elements
would not fix it; you need to vary it.

**A page with modulation reads as composed.** When density changes, the eye registers
a *rhythm*. The sparse moments are perceived as breath; the dense moments as
substance. The page has contrast — across the dimension of density. This is what a
piece of music does with loud and quiet. What a film does with long shots and tight
ones.

The first draft of any page is a wall. The job is to find the modulation *between*
sections — usually by identifying the 2–3 sections that matter most and making their
contexts sparser.

## Part 3 — The page is read in time

A page is not seen all at once. It is scrolled. Read. Re-scanned. Skipped and returned
to. This makes layout a *compositional* question in the musical sense: it has **tempo**,
**dynamics**, and **phrasing**.

**Tempo** — the rhythm at which new content appears as the reader scrolls. A page
whose sections are all 600px tall has a mechanical tempo. A page whose sections
alternate between 600 and 900px has phrasing. This is where the vertical module and
the macro baseline connect: the spacing between sections *is* the rest between
beats. The phrase lengths are the section heights.

**Dynamics** — the change in *information intensity* between moments. A hero is a
forte; a divider is a silence; a feature list is a mezzo; a proof is another forte.
Same vocabulary the music uses. A page that holds one dynamic reads as a press
release. A page that modulates dynamics reads as an experience.

**Phrasing** — the section's end and the next section's beginning. A section that
ends with breath and a section that begins with breath has no phrasing — the page
becomes a continuous murmur. A section that ends with breath and the next that
begins with a heading creates a *phrase*. The divider-y line is the barline.

**Tempo and dynamics are the same problem.** A page whose tempo is irregular has
dynamics. A page whose dynamics are irregular has tempo. They cannot be designed
independently.

## Part 4 — Modulation across three scales

Tying this back to [01](./01-the-problem.md)'s macro/section/micro layering:

**At the macro level**, modulation is the *phrasing* of the page. Some sections are
*sparse* (a hero, a CTA); others are *dense* (a feature list, a comparison table);
others are *breath* (a testimonial, a divider). At this level the page reads as a
composition.

**At the section level**, modulation is the *internal pacing* — a hero that starts
with breathing room, escalates to the claim, and resolves to the CTA. A pricing table
that groups tiers by visual rhythm. Each section has its own internal modulation.

**At the micro level**, modulation is mostly the absence of it — *peer equality*.
Two icons in a list should have equal spacing and equal weight. Three buttons in a row
should be symmetrical. At micro scale, *consistency* (not modulation) creates the
perception of rhythm. The exception is when an element must break the rule to be
figure — a delete button in a row of secondary buttons, a primary CTA among
secondaries.

This is why a "spacing scale" can't do all the work. Macro and section need *flexible*
spacing (modulation). Micro needs *uniform* spacing (peer equality). A single scale
can express both only if used with different intent — which no agent can encode
without being told.

## Part 5 — The scroll test

A page is correctly composed when:

1. The reader can identify the *first focal object* on a 2-second glance (squint test).
2. The reader can identify the *next four focal objects* in the order they appear, before
   reading the page (text-mask test + scan test).
3. The reader feels a *change in energy* between sections — a perception of pacing, not
   a perception of uniformity.
4. The reader can describe the page as *one thing*, not "a hero, then features, then
   testimonials" — the macro composition lands.
5. The reader can paraphrase any section's *role* (hero, proof, FAQ) from its visual
   weight alone, without seeing the section's content.

These are subjective, but they are reproducible: ask a stranger to perform (2) and (5)
on a page you have not edited. The result is a useful measure.

## Part 6 — The tool the agent doesn't have

A working layout theory needs an agent or designer to make page-level decisions
*before* coding any section. The decisions in question are not stylistic — they are
structural. They cannot be inferred from the content alone.

The minimum set of *upstream* decisions a page must have:

- Which 2–3 sections are the focal anchors
- What kind of modulation curve is intended (sparse-dense-sparse, or sparse-dense-
  dense-dense-sparse, etc.)
- The macro baseline and module — and which module sizes are *reserved* for macro
  rhythm (typically the 2–3 largest values in the spacing scale)
- Where the page frame lives (the border-x or its equivalent)
- The semantic vocabulary for separators (breath / faint line / strong line /
  background shift) and which transitions get which

Without these, every section is built without context, and the page becomes the
default — uniform, defensible, generic.

## Sources

- **Steven Bradley** — *Design Principles: Visual Perception And The Principles Of Gestalt*,
  Smashing Magazine (2014-03-29). The clearest single-source treatment of Gestalt for web
  designers. All Gestalt principles named here are from this article.
- **Figma** — *What Are The Gestalt Principles?* Resource library article. Parallel
  treatment with cleaner examples; useful as a refresher rather than primary read.
- **Andy Rutledge** — five-part series on Gestalt principles
  (figure-ground, similarity, proximity/continuation, common fate, closure) cited within
  Bradley's article. Worth following up for the figure-ground and proximity treatments,
  which apply most directly to layout.
- The musical and cinematic analogies in Part 3 are ours. They appear to generalize, but
  this is *applied synthesis*, not documented source.

## What this leaves open

- A vocabulary for *kinds* of section beyond the coarse sparse/dense classification.
  Hero, proof, comparison, FAQ, CTA — each has a typical *internal pacing* that
  hasn't been formalized.
- Whether *visual salience* can be measured. Some research (Yeh and others, on
  saliency maps for UI) suggests eye-tracking-equivalent scores are extractable from
  images. Whether that's worth the cost relative to subjective testing is unclear.
