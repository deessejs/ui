---
name: page-content-readme
description: Index and thesis for the page-content research — the most upstream decision: what belongs on a page, and how an agent can be made to choose
status: research
created: 2026-07-28
updated: 2026-07-28
---

# Page Content — Research Notes

The other directories in this repo all answer **how** an idea becomes UI. This one answers **what idea becomes page**.

The question is one level upstream of layout, components, and tokens — and therefore harder to encode. The research targets the part that *is* encodeable: the section vocabulary, the narrative arcs, and the brief-as-input format. The copy itself remains output, produced from those structures.

## Documents

| File | Covers |
| --- | --- |
| [01-the-problem.md](./01-the-problem.md) | The decision of what goes on the page; why it's upstream of everything else; multiple readers, section roles, narrative modulation |
| [02-section-taxonomy.md](./02-section-taxonomy.md) | 14 section roles inferred from observation of Linear / Vercel / Stripe / Resend; what each does; senior vs centroid patterns |
| [03-narrative-arcs.md](./03-narrative-arcs.md) | Three observable arc patterns and a fourth implied one; when each fits; StoryBrand as a routing lens |
| [04-the-brief.md](./04-the-brief.md) | The interface between human input and the agent; StoryBrand's 7-element skeleton; the Value Equation as a routing map; minimum-actionable brief template |

## Sources

The research is grounded in:

- **Empirical observation** of Linear (linear.app), Vercel (vercel.com), Stripe (stripe.com), Resend (resend.com) marketing pages, July 2026.
- **StoryBrand** (Donald Miller, *Building a StoryBrand*, 2017) — the dominant public framework for marketing narrative. 7 elements: *Character, Problem, Guide, Plan, Call to Action, Failure, Success.*
- **The Value Equation** (Alex Hormozi, *$100M Offers*, 2021) — value as `value = (dream outcome × perceived likelihood) / (time delay × effort × sacrifice)`. Each variable is a target a section can act on.

This is the layer where the agent's brief meets the design system. What an agent can do here is bounded — the copy is still output, the strategic voice is still human. But the *structure* that decides *what kind of section goes here* is encodeable, and that is the target.

## Reading order

01 → 02 → 03 → 04. Each builds on the previous. 01 names the problem. 02 gives the agent a vocabulary. 03 gives the agent orders that work. 04 gives the agent an input format it can read.

## Where this sits in the tree

```
agent-system/   ← meta-frame: senior UI by agent, encodeability
   ↑
page-content/   ← content strategy: what goes on a page (THIS FOLDER)
   ↑
marketing-ui/   ← component vocabulary: how evocative elements live
   ↑
layout/         ← composition theory: how the page composes
   ↑
shadcn/, tailwind/  ← primitives and constraints
```

This folder is the link between `agent-system/`'s meta-frame and the rest of the system that already exists. The action below is to attach page-content/ to the rest of the tree by updating the upper folders' references once the structure settles.
