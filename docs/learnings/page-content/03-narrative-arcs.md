---
name: page-content-03-narrative-arcs
description: Four observable narrative arc patterns from Linear/Vercel/Stripe and the implied transformation-first arc; when each fits; StoryBrand 7-element flow as a routing lens
status: research
created: 2026-07-28
updated: 2026-07-28
---

# Narrative Arcs — Three Patterns That Ship

**Sources:** empirical observation of Linear, Vercel, Stripe, July 2026; StoryBrand (Donald Miller); Value Equation (Alex Hormozi); synthesis.
**Status:** Empirical. The arcs are observed across the same four pages that produced `02-section-taxonomy.md`. A fourth arc is implied but not directly observed in the 2026 homepages; included for completeness.

The taxonomy in `02-` gave the agent a vocabulary. This doc gives it *orders* — three arch patterns that ship today, plus a fourth the framework supports but isn't dominant in current SaaS marketing.

## How to read each arc

Each arc is described as:

- **The shape.** The high-level order of section roles.
- **When it fits.** The conditions that make this arc the right choice.
- **Senior pattern.** What makes a page using this arc senior rather than centroid.
- **Centroid trap.** The default failure when this arc is applied without judgment.
- **StoryBrand mapping.** Which of Miller's 7 elements the arc emphasizes.

## Arc A — Feature-first (Linear pattern)

**Shape:** Hero → Pillars (3) → Numbered feature sections (3–5) → Changelog → Testimonials → Final CTA.

**Anatomy:** The page opens with the claim, anchors it in 3 value pillars, then *demonstrates itself* through 3–5 feature sections each with a marketing primitive. Social proof comes late — testimonials land on the reader after they've already seen the product's substance. A live changelog says: *we ship, we're current.*

**When it fits:** The product's *feature surface is the differentiator*. Linear's product is dense and opinionated; the features are the story. Vercel at certain points used a similar shape. Useful when the alternative is feature-light competitors whose claim is vague — being feature-dense is the moat.

**Senior pattern:** Each feature section is *kind-different* from the others (per `../marketing-ui/02-tropes-by-category.md` and `../marketing-ui/03-mock-taxonomy.md`) — a log table next to a code diff next to a chart next to a project timeline. Not five icon-card feature sections in a row.

**Centroid trap:** Five near-identical feature cards. Reads as "we have features, here is the list." Loses the demonstration effect.

**StoryBrand mapping:** Heavy on **Plan** (the steps/features), light on **Failure**. Risk: features without stakes.

## Arc B — Credibility-anchored (Vercel pattern)

**Shape:** Hero → [Use case block: claim + named customer quote + features list] × 3 → Recently-shipped (product announcements) → Final CTA.

**Anatomy:** The page is *built around a customer name per major section*. Each use-case block opens with one big claim, immediately proves it by naming a customer that embodies it, then lists the supporting features. The reader lands on credibility at every beat. Recently-shipped at the end tells the reader the product is alive.

**When it fits:** The product competes on infrastructure, scale, or performance — categories where named customer usage is the strongest evidence. Best when there is at least one *very* recognizable customer (OpenAI, Notion, Zapier). The product has few or no "alternatives" — credibility comes from prestige, not comparison.

**Senior pattern:** Each use-case block names a *specific dimension* the use case proves (Vercel: agents, scale, multi-tenancy). Not "customers love us," but "customers love us for X — and Y is also there." The customer quote names the *dimension*.

**Centroid trap:** Three customer quotes saying the same thing. Or use-case blocks that mix claims and risks to credibility — if the customer quote says "easy to use" and the features list reads as complex, the section undercuts itself.

**StoryBrand mapping:** Heavy on **Guide** (we are the helper to your team), heavy on **Character** (named customers in their role). Risk: trust without enough **Plan**.

## Arc C — Thoroughness (Stripe pattern)

**Shape:** Hero → Product cards (6) → Big metrics → Heavy customer story section (5+ named stories, each with metrics) → Testimonials (4+ attributed quotes) → Resources → Final CTA.

**Anatomy:** Everything at volume. 6 product cards. 4 metric cards. 5 named customer stories with their own metrics. 8 named mini-customer mentions. 4 named testimonials. 4 resource blocks. The page is *saturated with evidence*; the modulation pattern is *constant density with selective depth*. Stripe's audience expects thoroughness — finance buyers evaluate infrastructure on completeness of coverage.

**When it fits:** The product is sold to *skeptical, thorough buyers* — finance, enterprise, regulated industries. When the buyer persona researches before talking to sales. When the alternative vendors all have similarly complete marketing pages — thoroughness is table stakes.

**Senior pattern:** Each customer story is *kind-different* — Hertz for retail scale, URBN for multi-brand, Instacart for logistics, Le Monde for international. Not five case studies of the same kind of customer. The variance is what makes the volume feel curated rather than padded.

**Centroid trap:** Volume without discrimination. Twelve resources, none distinguished. Five testimonials, all praising speed. Reads as a vendor evaluation document, which is exactly the format the buyer already has from competitors.

**StoryBrand mapping:** Heavy on **Plan** (full scope of capabilities) and on **Character** (named customers in their domain). Risk: no narrative thread, just a catalog.

## Arc D — Transformation-first (implied, StoryBrand in pure form)

**Shape:** Hero (the dream outcome) → Mechanism (how the transformation happens) → Testimonial (proof of the transformation) → Final CTA.

**Anatomy:** The page is *narrow and deep*. Less than ten sections. Every section in service of one transformation arc. StoryBrand's 7 elements compressed into ~5 sections: Character (the hero customer is named), Problem (named explicitly), Guide (named briefly), Plan (one section), Call to Action (final). Failure and Success are wrapped into the Hero.

**When it fits:** The product is *one clear thing* for *one clear customer* with *one clear outcome*. Resend might fit this. Smaller developer tools that have a specific use case.

**Senior pattern:** The dream outcome is *specific and visual*. Not "manage your finances better" — "see every dollar in one place, in three minutes a week." The mechanism is a real diagram. The testimonial names what the customer became.

**Centroid trap:** Vague dream outcome ("transform your workflow"). Missing mechanism. Testimonials that could be from anyone.

**StoryBrand mapping:** This *is* StoryBrand's full flow. Maximum alignment with Miller's framework.

## Choosing among the arcs

| Condition | Default arc |
| --- | --- |
| Feature surface is the moat | A — Feature-first |
| Credibility is the moat (one big customer is enough) | B — Credibility-anchored |
| Thoroughness is the moat (regulated / enterprise / finance) | C — Thoroughness |
| One clear thing for one clear customer | D — Transformation-first |

Most pages combine arcs — A's feature blocks followed by B's customer anchoring at the testimonials, for instance. The point isn't to pick *one* arc but to know which one is *primary* — the dominant rhythm the others support.

## Modulation per arc

Per `../layout/01-the-problem.md`, every page modulates. Each arc modulates differently:

- **A** densifies through the feature sections, then opens up at testimonials.
- **B** modulates by *alternating* claim-then-quote-then-features — each block restarts the rhythm.
- **C** *doesn't* modulate much; sustained density throughout. Works because the audience expects it.
- **D** is the steepest — dense mechanism in the middle, sparse everywhere else.

The senior move per arc is *the right modulation pattern*, not just any modulation. Arc A with sparse feature sections reads as "we don't have features." Arc D with even density reads as confused about its own thesis.

## What StoryBrand gives us, in 30 seconds

The 7 elements (Character, Problem, Guide, Plan, Call to Action, Failure, Success) are *slots*, not section roles — they describe *what part of the story each section plays*, which is a different axis from what kind of content it holds. A feature section can be Plan in one arc and Mechanism in another. The mapping between StoryBrand slots and section roles is context-dependent.

The lens is useful because it forces a *coverage check*. If a page has no Failure element, the reader can imagine a world where doing nothing is fine — and may choose that. If there is no Guide, the brand has no role in the reader's story. If there is no Success, the page never completes the imagined future. A senior page, regardless of arc, has all 7 — at least implicitly.
