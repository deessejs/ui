---
name: page-content-02-section-taxonomy
description: Catalog of 14 section roles observed in modern SaaS marketing pages — what each does (Value Equation factor), what content fits, surface conventions, senior vs centroid patterns
status: research
created: 2026-07-28
updated: 2026-07-28
---

# Section Taxonomy — The Vocabulary of Roles

**Sources:** empirical observation of Linear (linear.app), Vercel (vercel.com), Stripe (stripe.com), Resend (resend.com) marketing pages, July 2026; StoryBrand (Donald Miller); Value Equation (Alex Hormozi); synthesis.
**Status:** Catalog. Roles are *inferred* from walking the four observed pages and naming what each section does. Roles not present in any of the four are left out by design.

This document is the agent's vocabulary. When it builds a page, it picks which section roles to include and in what order — `03-narrative-arcs.md` covers the order. Here, each role gets its job, its Value Equation factor, the content it holds, surface conventions, and senior vs centroid patterns.

## How to read each role

Each is described as:

- **What it does.** The job in the page.
- **Value Equation factor.** Which variable it primarily moves.
- **Content it holds.** The kind of information inside.
- **Surface.** Sparse, medium, or dense; focal or supporting (per `../layout/01-the-problem.md`).
- **Senior patterns.** What makes one senior instead of centroid.
- **Centroid trap.** The default the model reaches for.

## The roles (14, in page order)

### 1. Hero / Claim

The opening section. Names the product, claims what it is for, gives the entry CTA.

- **Value factor:** Dream outcome (numerator).
- **Content:** One claim sentence + one primary CTA. Maybe one secondary link or one supporting primitive (per `../marketing-ui/01-the-genre.md`).
- **Surface:** Sparse. The focal object of the page.
- **Senior:** One clear claim, one CTA. Possibly one supporting visual.
- **Centroid trap:** Three stacked subtitles, a logo wall, two CTAs of equal weight. Confuses *intro* with *first impression of a product catalog*.

### 2. Pillar / Value summary

Three or four bullet positioning claims that name what makes the product distinctive. Often appears immediately after the hero. Linear uses this, as does Stripe in some form.

- **Value factor:** Dream outcome + perceived likelihood.
- **Content:** A small set of bullet claims, each a noun-phrase.
- **Surface:** Sparse to medium. Peer-equal typography on the bullets.
- **Senior:** Each pillar is *one distinct thing*, not three synonyms. ("AI-native. Built for teams. Fast as hell." *is* three distinct; "Smart. Powerful. Reliable." is not.)
- **Centroid trap:** Three icons + three sentences that say the same thing. Proof quantity without proof signal.

### 3. Feature section

A single feature demonstrated with a marketing primitive. Most pages have 3–5 of these. Linear has 5; that's the upper limit before the page becomes a feature catalog.

- **Value factor:** Perceived likelihood (proof by demonstration).
- **Content:** Feature headline + 1–2 sentence explanation + a marketing primitive + a navigational or deeper-link.
- **Surface:** Mixed. Hero copy sparse; primitive dense; the *interplay* is the section.
- **Senior:** Each feature section differs in *kind* (per `../marketing-ui/02-tropes-by-category.md`). Not "icon-card #2 of N."
- **Centroid trap:** Numbered feature sections that are *structurally identical* — same gap, same primitive size, same copy length. Reads as a table of contents.

### 4. Use case

A *persona-anchored* section: a specific user type with a specific outcome. Closest to StoryBrand's "Plan" element.

- **Value factor:** Dream outcome + perceived likelihood.
- **Content:** A persona brief, a workflow narrative, an outcome metric.
- **Surface:** Sparse copy + a primitive. Less dense than a feature section.
- **Senior:** *One anchor persona per section.* Not "developers" — "the platform engineer at a 30-person startup shipping a release tonight."
- **Centroid trap:** "Built for {every role}" with an icon for each — communicates nothing by committing to nothing.

### 5. Mechanism

Explains *how* the product works — the operational model, not the features. Often missing entirely. The senior move is having one.

- **Value factor:** Time delay and effort (denominator).
- **Content:** An architecture or flow diagram; a primitive that shows the operating model.
- **Surface:** Sparse copy, dense primitive. Often annotated (see `../marketing-ui/03-mock-taxonomy.md`).
- **Senior:** A real diagram (data flow, request lifecycle, deployment topology), not "1, 2, 3, succeed."
- **Centroid trap:** Missing entirely — the second-most common omission after Modulation.

### 6. Metrics / Proof by number

Quantitative evidence: revenue, customers, uptime, scale. Stripe uses four in a row.

- **Value factor:** Perceived likelihood.
- **Content:** 3–6 large numbers with a one-line label each.
- **Surface:** Sparse. Each metric peer-equal.
- **Senior:** Numbers imply a context that makes them legible — not "100+ features" but "100+ features used by 37,000 product teams." One metric per claim, ideally with a comparator.
- **Centroid trap:** Four big numbers unrelated to the claim. Reads like a profile card.

### 7. Customer logos

A row of recognizable customer marks as immediate social proof. Often placed early, sometimes twice (hero-adjacent and before the case studies).

- **Value factor:** Perceived likelihood.
- **Content:** Customer logos + a one-sentence footer ("Trusted by 37,000 teams").
- **Surface:** Sparse.
- **Senior:** Logos are *recognizable* in the target audience — not the biggest customers, the most credible ones.
- **Centroid trap:** Asymmetric sizing (one logo huge, fifteen tiny) reads as pandering. Equally-sized illegible logos read as wallpaper.

### 8. Customer story / Case study

A *named* customer's use of the product, with a metric or specific outcome. Stripe places 13 of these across the page.

- **Value factor:** Perceived likelihood.
- **Content:** Customer name, attribution, the problem they had, what they did, the result, one or two product details.
- **Surface:** Medium. Sparse copy, one primitive or photo.
- **Senior:** Named attribution (real person, real role, real company). Specific metric. A *what changed* verb, not "leverage our platform" passive voice.
- **Centroid trap:** Filler copy no real customer said. "They've been an incredible partner on our journey" — never a real sentence.

### 9. Testimonial / Quote

A single attributed quote used as proof in compressed form. Often used to *punctuate* longer stretches of content.

- **Value factor:** Perceived likelihood.
- **Content:** One quote + attribution (name, role, often photo or company logo).
- **Surface:** Sparse.
- **Senior:** The quote *says something specific* — a claim the customer is making about themselves that the product enables. (Linear/OpenAI: *"you'll probably build a better product, just because of the craft that using Linear infuses on your brain"* — note that this is a claim about what *they* become, not about Linear's feature set.)
- **Centroid trap:** Quotes that could be said about any tool. "Great product, easy to use."

### 10. Changelog / Recently shipped

A feed of recent product announcements as live proof of activity. Linear and Vercel both surface this prominently.

- **Value factor:** Perceived likelihood — we are still shipping; we are alive.
- **Content:** 3–6 dated entries with a short headline each. Sometimes a one-line summary.
- **Surface:** Medium — chronological, peer-equal.
- **Senior:** Real, dated, brief. Names features concretely.
- **Centroid trap:** Static "Recent Updates" that hasn't changed in two years. Visible staleness.

### 11. Objection-handling / Failure cost

Addresses *what you lose by not acting*. Often implicit (in pricing, in cadence), but strong pages name it explicitly.

- **Value factor:** Time delay and sacrifice (denominator).
- **Content:** A concrete cost framing — what the reader is paying *by doing nothing*. A specific scenario, not generic.
- **Surface:** Sparse. Often the densest *idea* per square inch.
- **Senior:** Spelled-out scenarios: "Every quarter you delay a CRM migration is X in churn." Not "Don't miss out."
- **Centroid trap:** FOMO copy. Tells the reader fear, not information.

### 12. Pricing tease / Pricing

Either an entry into a pricing page or an in-page summary pricing block.

- **Value factor:** Effort (the friction of starting).
- **Content:** 3–4 tiers with peer structure. Specific numbers. A CTA per tier.
- **Surface:** Dense. The page's most information-dense section.
- **Senior:** Same number of tiers regardless of audience size. Tier names signal *use case*, not prestige (Free / Pro / Enterprise; Solo / Team / Business).
- **Centroid trap:** Three identical-tier cards with random prices.

### 13. Resources / Learn

A section pointing to deeper materials — docs, changelog, blog, comparisons, integrations. Useful for SEO, useful for buyers who want to verify.

- **Value factor:** Perceived likelihood and effort.
- **Content:** 4–6 links, often image-thumbnail-led or recently-updated-led.
- **Surface:** Medium, grid-like.
- **Senior:** Items point at *answerable* external questions ("Migrating from Heroku", "SOC 2 compliance docs"), not just "our blog."
- **Centroid trap:** Generic resource cards ("Engineering Blog", "Customer Stories") that don't say what they are for.

### 14. Final CTA

The closing section that asks for the conversion. The page's last modulation moment.

- **Value factor:** Effort — friction of starting.
- **Content:** One short copy sentence + one primary CTA + maybe one secondary CTA + presence text ("No credit card required", "Free for up to 5 users", "Cancel anytime").
- **Surface:** Sparse.
- **Senior:** Removes *every* remaining objection. Echoes the hero's claim. Often restates the dream outcome in one sentence.
- **Centroid trap:** Vague CTA ("Get Started") with no qualifier. Two CTAs of equal weight forcing a choice rather than ending one.

### 15. (Optional) Comparison / Migration

Names how the product compares to alternatives or how to switch from a competitor. Not always present; very strong when it is.

- **Value factor:** Perceived likelihood.
- **Content:** A direct comparison table, a migration guide link, or a testimonial from a switcher.
- **Surface:** Dense (table) or medium.
- **Senior:** Names the alternatives explicitly — doesn't pretend they're not an option.
- **Centroid trap:** A "vs us" comparison that doesn't name names.

## How the agent uses the taxonomy

The taxonomy is the agent's *menu*. Building a page:

1. Read the brief (see `04-the-brief.md`).
2. From the brief, infer which roles are needed (usually 6–10 of the 15).
3. From the brief, derive a narrative arc (see `03-narrative-arcs.md`).
4. From the arc, determine the order.
5. For each role slot, fill content from the brief's inputs and apply the section-specific surface conventions.

The taxonomy is encodeable; the *selection* of which roles to include is the brief's job — `04-the-brief.md`.

## Senior vs centroid across roles

Three patterns distinguish senior from centroid across all observed roles:

- **Specificity.** Centroid names "*100+ features used by 37,000 teams*" generically; senior names "*37,000 product teams at OpenAI, Ramp, and Opendoor ship releases 2.3× faster when they...*"
- **Honest trim.** Centroid shows everything; senior shows the load-bearing few. Per Refactoring UI's *"don't design too much."*
- **Variance.** Centroid pages have equal-weight sections, equal-length paragraphs, equal-density primitives. Senior pages *modulate* — claim sections and proof sections differ in length and density; sparse and dense alternate.

The centroid fails on every role by the same mechanism. The senior move on every role is the same: *be specific, trim deliberately, vary the rhythm.* Refactoring UI's finishing-touches chapter ("supercharge the defaults", "don't overlook empty states", "use fewer borders") applies at the section level: most sections' defaults are mediocre, most sections' emptiness is more senior than their fullness.
