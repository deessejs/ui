---
name: page-content-04-the-brief
description: The interface between human and agent — the brief as structured input; StoryBrand 7-element skeleton; the Value Equation as a routing map for section prioritization; minimum-actionable brief template
status: research
created: 2026-07-28
updated: 2026-07-28
---

# The Brief — Interface Between Human and Agent

**Sources:** StoryBrand (Donald Miller, *Building a StoryBrand*, 2017); Value Equation (Alex Hormozi, *$100M Offers*, 2021); synthesis with `../agent-system/`.
**Status:** Applied synthesis. Bridges the page-content notes with `../agent-system/`. The brief is the single most important *input format* in this folder — what the agent reads to compose a page.

`01-the-problem.md` argued the agent cannot write its own brief — page content is judgment, not encodeable. `02-section-taxonomy.md` gave the agent a vocabulary of section roles. `03-narrative-arcs.md` gave it orders. This doc gives the agent an *input format* — the brief a human writes to drive a page.

The brief is to pages what a positioning statement is to product strategy: a short, structured text that captures the most consequential decisions and leaves detail to composition. The encodeable claim in this doc is: **a brief of ~10 fields, written to a specific schema, is sufficient input for an agent to compose a senior page.**

## Why a brief, and why this schema

Without a brief, the agent has only the *system* (tokens, components, primitives) and the *page role* (e.g. "build a pricing landing"). The output degenerates to the centroid (per `01-the-problem.md`). With a brief, the agent receives the *decisions that distinguish one page from another* — exactly the decisions `01-` named as judgment-only.

The schema below is built from two sources:

- **StoryBrand's 7 elements** (Character, Problem, Guide, Plan, Call to Action, Failure, Success) — the skeleton of the *story*.
- **Value Equation's 4 variables** (Dream Outcome, Perceived Likelihood, Time Delay, Effort & Sacrifice) — the routing map for *which section role acts on what*.

Both lenses are summarized briefly in `01-` for context. The schema below uses them but doesn't depend on the user knowing the source frameworks by name.

## The minimum-actionable brief

The fields below are the smallest set that produces a coherent page. Anything missing falls back to defaults that the agent must surface in review.

```
PRODUCT BRIEF (markdown frontmatter or copy block)

# identity
product:              [name]
audience:             [primary persona — specific enough to picture, in one sentence]
verb:                 [what they're trying to do, in a verb phrase]
change:               [the dream outcome — what becomes true when they're done]

# positioning
for:                 [who this is for — the segment above all else]
not_for:             [who this is *not* for — adjacent segment we won't pursue]
alternative:         [the closest substitute that buyers compare you to]
difference:          [what makes you different — one sentence, specific]

# mechanism (one sentence)
how:                 [how the product makes the change happen]

# evidence (1-3 — pick the strongest)
proof_1:             [metric, named customer, or specific outcome, with specifics]
proof_2:             [second strongest]
proof_3:             [third]

# objection (the one readers will actually have)
real_objection:      [the one genuine hesitation]

# call
primary_cta:         [the verb the reader should do]
cta_qualifiers:      ["No credit card" / "Free forever for N users" / etc.]

# reader state
awareness:           discovering | comparing | deciding

# format
arc:                 feature-first | credibility-anchored | thoroughness | transformation-first | agent's-choice
sections_required:   [list by name, e.g. "hero, two feature sections, pricing tease, testimonials, CTA, mechanism"]
                       (optional — agent may infer if omitted)
```

### Field notes

**identity.** Product name, audience, verb, change. The change is the dream outcome — *what becomes true for the audience when they're done*. StoryBrand's Character + Success in compressed form.

**positioning.** for / not_for / alternative / difference. April Dunford's `positioning` distilled to its functional shape. Difference must be *specific* — not "better" or "faster" but "the only one that lets X happen in Y minutes" or "open-source by default." Without a specific difference, the agent cannot choose which section role acts as the differentiator.

**mechanism.** One sentence. Optional but high-value. Without it, the agent skips the Mechanism section role entirely — a common omission and senior move when included.

**evidence.** 1–3 pieces. Each one with specifics: a metric *with context* ("$1.9T in 2025", not "high throughput"), a named customer *with outcome* ("Hertz unified commerce with Stripe", not "used by Hertz"), or a specific observation ("ships 12× per day per engineer"). Filler evidence ("loved by users") doesn't count.

**real_objection.** Naming the genuine hesitation. The senior page addresses it; the centroid page doesn't. Common forms: price (alternatives are cheaper), switching cost (already invested), fit (works for some teams but maybe not this one), trust (newer product).

**call.** Primary CTA verb (Start a trial, Schedule a demo, Get the playbook). cta_qualifiers remove the friction the reader expects ("No credit card", "Cancel anytime", "14-day response").

**awareness.** One of three — *discovering* (problem-aware, no specific comparison yet), *comparing* (the buyer has named you against 1–3 alternatives), *deciding* (the buyer is in active selection, often having met with sales). Each implies a different opening section and a different role for the testimonials. See below.

**arc + sections_required.** The arc is the dominant narrative pattern from `03-narrative-arcs.md`. The agent can pick one if not specified (`agent's-choice` mode). sections_required is optional — when present, it overrides the agent's selection and pins the section roles in order.

## How the agent reads the brief

Walking through what the agent does with this input:

1. **Choose the arc** if not specified. Default heuristic: *credibility-anchored* if `proof_1` includes a named customer with strong brand recognition; *feature-first* if `audience` describes engineers; *transformation-first* if `change` is highly specific and visual; *thoroughness* otherwise.
2. **Select section roles** from `02-` based on the arc and the brief's content. Always include Hero, Pillar or use-case, ≥1 Feature section, ≥1 Proof type (logos, stories, quotes, metrics — at least one), Final CTA. Add Mechanism if `how` is present. Add Pricing tease if pricing is on the page. Add Comparison if `alternative` is specific.
3. **Order** per the arc's pattern from `03-`.
4. **Fill content** from the brief's fields into each role's section. Apply the section-specific surface conventions (sparse / dense / focal / supporting) per `02-`.
5. **Modulate** per `../layout/01-the-problem.md`. The arc name determines the modulation pattern.

## What the brief forces the human to decide

Most of what makes a page *senior* instead of centroid are decisions that belong upstream — and that the brief captures as fields. Specifically:

- **Whom this is for** — forces specificity. A generic audience produces a generic page.
- **Whom this is not for** — the most-cited positioning lever; underweighted in agent prompts.
- **What makes us different** — forces articulation. If the human cannot specify the difference, no agent can produce a senior page.
- **The one real objection** — naming it is half of addressing it.

A brief with empty fields here produces a centroid page regardless of how good the agent is. The brief is not enabling the senior page so much as *forcing the human to make the decisions a senior page requires.*

## Awareness state — the one field that's easy to forget

The `awareness` field is the most-leverage, least-asked field. It determines:

- **discovering.** The Hero must do heavy lifting — name the problem, then the solution. Mechanisms matter more than logos. Pricing doesn't appear yet.
- **comparing.** The Hero can be short; the meat is the *Comparison* section. Logos and case studies carry weight. Pricing tease is essential.
- **deciding.** The page reads as a procurement document. Customer stories, security docs, and FAQs dominate. The Hero is sparse and impatient.

Get this wrong and every subsequent decision compounds the error. An agent reading a `comparing` brief with a `discovering` Hero produces a page that opens weak and stays that way.

## Mapping back to StoryBrand and Hormozi

For the reader's orientation, here is how the brief's fields correspond to the two source frameworks:

| Brief field | StoryBrand slot | Value Equation variable |
| --- | --- | --- |
| `audience` | Character | — |
| `verb` / `change` | Character's Goal + Success | Dream outcome (num.) |
| `for` / `not_for` | Character refinement | — |
| `alternative` / `difference` | Problem + Guide | Perceived likelihood (num.) |
| `how` | Plan | Effort & Time Delay (denom.) |
| `proof_*` | Guide credibility | Perceived likelihood (num.) |
| `real_objection` | Failure | Sacrifice (denom.) |
| `primary_cta` | Call to Action | — |

Once this mapping is internal, the field names matter less than the questions each one answers. A brief can be written field-by-field from a StoryBrand worksheet; an agent reads it field-by-field and produces a page. They are the same skeleton, viewed from two sides.

## The brief in practice

A senior page begins with a brief that is at most 30 lines of markdown. A centroid page begins with a one-line "build a landing page" prompt. The brevity is misleading — the brief is the most expensive artifact in the process because every decision downstream is constrained by its fields.

When the brief is empty on `difference` or `real_objection`, the agent should halt and ask. Per `01-`, these are judgment calls that cannot be safely invented. Inventing them produces the centroid. Asking produces a Senior page or a no-page.
