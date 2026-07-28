---
name: page-content-01-the-problem
description: Frame the problem of what goes on a page — most upstream decision in the production chain; why naive approach produces a uniform centroid page; lens from StoryBrand and Value Equation
status: research
created: 2026-07-28
updated: 2026-07-28
---

# The Problem — What Goes On The Page

**Sources:** empirical observation of Linear (linear.app), Vercel (vercel.com), Stripe (stripe.com), Resend (resend.com) marketing pages, July 2026; StoryBrand (Donald Miller, *Building a StoryBrand*, 2017); *100M Offers* (Alex Hormozi, 2021); discussion with the user 2026-07-28.
**Status:** Synthesis. User has no prior framework and is starting from scratch, so this doc introduces the two most useful lenses (StoryBrand, Value Equation) briefly before applying them.

## The problem, named

What goes on the page is *the most upstream decision* in producing a marketing page. Layout (`../layout/`), components (`../shadcn/`, `../tailwind/`), primitives (`../marketing-ui/`) all answer *how*. This folder answers *what*. Without a clear answer to *what*, the rest of the system produces a page that is well-composed but says nothing in particular — the aesthetic equivalent of a Wikipedia article.

The most common failure is the **uniform page** — five sections of equal importance, equal density, equal weight, each one a feature card with icon + title + paragraph. This is the content-domain equivalent of the centroid: a model trained on every SaaS landing page returns the *average landing page*. The result is competent, forgettable, and unsuited to any specific positioning.

## Three things that make the problem hard

### 1. The reader is multiple readers

A single page serves 3–5 audiences simultaneously — by persona (engineering lead vs PM vs buyer), by awareness stage (heard-of-us vs comparing vs signing), and by use case (their version of the problem may be several distinct versions). They arrive with different baggage and expect different evidence. The naive fix — segmentation — produces a page per audience and loses the cumulative narrative. The real fix is **ordonnancement** — the page is sequential, not parallel, and the order is what differentiates readers by the time they reach CTA.

### 2. Sections have roles, not contents

The failure mode is a *content-first* approach: each section is filled with whatever fits the available space. The senior approach is a *role-first* approach: each section is named for its job — claim, proof, mechanism, objection, CTA — and its content follows from that role. A page with named section roles cannot become a uniform list of features even by accident. Naming the roles is upstream of choosing the content.

### 3. Modulation is narrative, not visual

`../layout/01-the-problem.md` introduced modulation at the *visual* level (sparse/dense variation). Modulation also operates at the *narrative* level — the page alternates between sections that *claim* (sparse, opinionated copy) and sections that *prove* (dense, concrete, observed). A page that only claims reads as marketing. A page that only proves reads as documentation. The page that alternates reads as *thought through*. The alternation is the structural backbone that the layout modulates around.

## The two lenses

Neither lens is a rule; both are *frameworks for thinking*. The folder uses them but is not bound by them.

### StoryBrand

Donald Miller (*Building a StoryBrand*, 2017) — the dominant public framework for marketing narrative. Seven elements:

1. **Character** — the customer is the hero, never the brand.
2. **Problem** — the conflict the character faces.
3. **Guide** — the brand's role: *not* the hero, but Yoda to the customer's Luke.
4. **Plan** — the steps to resolve the conflict.
5. **Call to Action** — the next step.
6. **Failure** — what is lost by inaction.
7. **Success** — what is gained by acting.

The framework's force is the inversion of who the hero is. Most pages spend 80% of vertical space on the brand, treating the customer as a typology. StoryBrand inverts that: the page is for the customer, the brand is the helper. The seven elements are also a *checklist* — a page missing any of them is likely weaker for it.

### The Value Equation

Alex Hormozi (*$100M Offers*, 2021) — value as a ratio:

```
             Dream Outcome × Perceived Likelihood of Achievement
    Value = ─────────────────────────────────────────────────────
                          Time Delay × Effort & Sacrifice
```

A page improves value by acting on one of the four variables in either direction: *increase* the dream outcome, *increase* the perceived likelihood, *decrease* the time delay, or *decrease* the effort and sacrifice. This implies that **each section optimizes one factor**. A case-study section increases perceived likelihood. A "1-minute setup" section reduces time delay and effort. A before/after section raises the dream outcome. Used together, StoryBrand shapes the *story* and Value Equation shapes the *per-factor optimization*. Neither one runs the page alone; together they cover most of the design space.

## What this folder encodes and what it doesn't

**Encodes:**

- A vocabulary of section roles (`02-section-taxonomy.md`).
- A library of narrative orders that work (`03-narrative-arcs.md`).
- A structured interface between human and agent — the brief (`04-the-brief.md`).

**Does not encode:**

- The copy itself — produced by the agent from the brief and product context, evaluated by humans at PR time.
- The product positioning — done before the page exists (April Dunford's territory, *Obviously Awesome*).
- The strategic voice — the brand's voice precedes the page, lives in the design system via tokens and tone-of-voice docs, not in this folder.

The folder's claim is narrower: **the structure that decides what kind of section a slot should be can be encoded.** With that structure, the agent can compose a page that respects the brief. Without it, the agent defaults to the centroid.

## Why this is the right folder name

Page *content*, not page *design*. The design is `../layout/`. The components are `../shadcn/`. The vocabulary, the arc, the brief — that is *what belongs on the page*, which is what this folder is for. The two lenses (StoryBrand, Value Equation) are introduced as starting points but not embraced as gospel. The empirical observation that follows in `02-` and `03-` is what gives the folder its own argument.

The next doc, `02-section-taxonomy.md`, is the agent's *vocabulary* — a catalog of section roles with what each does and its senior vs centroid patterns. The doc after, `03-narrative-arcs.md`, gives the *orders* that ship in modern SaaS and when each fits. The closing doc, `04-the-brief.md`, gives the *input format* an agent reads to compose a page.
