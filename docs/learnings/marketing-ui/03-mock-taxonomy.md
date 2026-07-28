---
name: marketing-ui-03-mock-taxonomy
description: Five distinct kinds of marketing primitives — snapshot, re-imagining, generic, annotated, compositional — with rules, costs, and appropriate contexts for each
status: research
created: 2026-07-28
updated: 2026-07-28
---

# Mock Taxonomy — Five Kinds of Primitive

**Sources:** Vercel design guidelines; Linear Design System reference; Resend marketing surfaces (behance captures, 2025-26); Cursor and Cal.com marketing pages; Refactoring UI's "detail comes later".
**Status:** Taxonomy. The five categories were named by walking ~30 modern SaaS marketing surfaces and finding the kind repeatedly used. The rules and costs are inferred from those examples.

Not all marketing primitives are alike. The same grid cell can hold five structurally different things, and the design choices that produce senior outcomes change by kind. The doc `01-the-genre.md` defined what makes a primitive hard. `02-tropes-by-category.md` is what makes one *recognizable*. This doc is what makes one *true*.

## Snapshot

A primitive that comes from the real product. Typically a cropped, lightly cleaned image (often a styled screenshot or an in-app capture) of an actual surface. The most faithful kind.

**Where it shines.** Products whose real interface is genuinely good — Linear, Vercel, Stripe. The snapshot then doubles as evidence of production quality.

**Where it fails.** Products whose real interface has unfinished corners. The snapshot then *reveals* the things the primitive was meant to *evade*. Per `../agent-system/02-the-obstacles.md`: "a senior design move that exposes a junior-fidelity product is worse than either alone."

**Senior rules.**

- The crop is intentional. Cut either exactly the focal area, or include one peripheral element to show context. Partial crops read as reveal.
- Trim the chrome — the URL bar, the action bar, the third tab — unless they carry meaning.
- Light/dark consistency with the page's mode. A snapshot in light mode on a dark-mode page reads as pasted in.
- Color and typography are real — no re-coloring to match the site.

**Encodeability.** Snapshot primitives are images. The agent cannot generate snapshots, only retrieve them. The encodeable surface is the *catalog* of which snapshots exist and which to use where — a registry of approved screenshots, versioned with product changes.

## Re-imagining

A primitive that depicts a *desired* surface — one that doesn't exist in the product yet but should. Used to communicate an upcoming feature, an aspirational workflow, or a future system.

**Where it shines.** Roadmap pages, fundraising decks, "what we're building next" sections. Also used when the product is too early to have a recognizable interface yet — the re-imagining becomes the design seed the team actually builds against.

**Where it fails.** When the aspiration diverges from the real product. The roadmap promise becomes a liability at GA.

**Senior rules.**

- The re-imagining uses the same components, tokens, and spacing as the production primitives. *Same system, future feature.*
- Annotations or callouts are *expected*, not optional — see *annotated*, below.
- Don't ship a re-imagining without a feature doc behind it; the marketing primitive becomes evidence a PM must defend.

**Encodeability.** Re-imagining primitives are *the same kind of code as the product*. The agent can generate them because they are real components in the design system, used ahead of build. The encodeable surface is the same as product surfaces — the registry entry is just unfinished-feature-flagged.

## Generic

A primitive that resembles a UI without referring to a specific product. Log table that isn't Vercel's, user list that isn't Linear's — recognizable as the category, deliberately non-specific.

**Where it shines.** Side-illustrating features whose product implementation doesn't matter — "we have observability" is better shown by *any* log table than by your actual log table, if your actual one is mid-redesign. Also used in early-stage products that don't have a real interface to snapshot.

**Where it fails.** Anywhere the marketing claim depends on *showing this product*. A generic dashboard primitive on a B2B analytics landing page reads as *the product doesn't exist*.

**Senior rules.**

- The generic primitive *deliberately* looks like a category example, not a product. Avoid product-specific UI signatures (Linear's command-K bar, Vercel's deployment timeline) in generic primitives.
- Apply the centroid deviations from `02-tropes-by-category.md` *harder*. The generic primitive's only signal is its recognizability without affiliation.
- The token system should still be the project's — colors and type reflect the brand, not a generic palette.

**Encodeability.** Generic primitives are *the most encodeable kind*. They reduce to parameterized templates — `<LogTable rows={...} severity={...} />`. The agent can generate by filling parameters. This is where the agent system's mechanism can do the heaviest lifting.

## Annotated

A primitive overlaid with callouts, arrows, or labels that point to specific features. The product surface is *real* (or re-imagined), the annotation is the marketing layer.

**Where it shines.** Feature-as-screenshot is the canonical SaaS "this is what we built" pattern. Vercel does this for infrastructure; Notion does this for AI features; Linear has for its speed.

**Where it fails.** When annotations overwhelm the surface — five callouts for one screen reads as a fact sheet, not a product. Centroid annotation primitives show every feature with the same weight.

**Senior rules.**

- *One* primary callout (the differentiation claim). Others secondary.
- Annotations sit in **negative space** — in margins, between sections, in the empty regions of the screenshot. Never over the focal content.
- The primitive is *legible without the annotations*. Annotation overlay should be optional, not load-bearing.
- Annotation typography is the marketing system's, not the product's. Smaller, lighter, sometimes italic — signals "this is commentary, not interface."

**Encodeability.** Annotations are positioned overlays. The agent can place them by reading the user's brief ("highlight what differentiates us") and then needing rules about *where on the surface* annotations live (margins, not over content). This is partially encodeable; the *content* of the annotation is marketing copy and stays in the brief.

## Compositional

A primitive composed of multiple panels — typically a primary panel and a smaller contextual one (e.g., a dashboard with its settings panel visible, a chat thread with a command palette open, an email composer with a contact picker suggested).

**Where it shines.** Showing interaction states, multi-component workflows, or "after this, then that" sequences. Reduces three sequential screenshots to one composition.

**Where it fails.** Compositional primitives are easy to *overcompose*. Three panels rarely need four. Two panels rarely need three. The bias is to start at two and add only when the third carries new meaning.

**Senior rules.**

- One panel is the focal (the one the reader looks at first). The others are supporting — smaller, dimmer, *visually subordinate*.
- The relationship between panels is **compositional**, not stacked. They sit in the same scene, not layered over each other (which looks like modal soup).
- The crop is honest about both panels. Centroid compositional primitives show one panel cropped and one floating in the void.

**Encodeability.** Compositional primitives are the hardest to encode. They require the agent to compose multiple panels — which requires the layout system from `../layout/` to work, plus a focal-vs-supporting distinction. Encodeable at the surface but with the highest *coordination cost*.

## How to choose among the five

| Need | Default kind |
| --- | --- |
| Show a real workflow that exists | Snapshot |
| Announce an upcoming feature | Re-imagining |
| Illustrate a generic capability | Generic |
| Show what a feature does that text can't | Annotated |
| Show a flow that needs >1 surface | Compositional |

Most marketing pages will use *several* kinds in different sections. The kind is part of the section's macro composition (per `../layout/01-the-problem.md`), not just a content choice.

## How the centroid bites each kind

Each kind has its own centroid failure:

- **Snapshot** → untrimmed, full-chrome screenshots that show everything, including the unfinished corners the marketing was meant to hide.
- **Re-imagining** → product UI that was never built, shown with no signal of being future work — looks like a broken current state.
- **Generic** → the canonical-example-of-the-category that the centroid hands out, varied only by the brand's primary color.
- **Annotated** → five-eighths-of-the-screen callouts that prove every detail is interesting to nobody.
- **Compositional** → three panels equal-weighted, cropped whimsically, looking like an inventory.

The senior counter is the same in every case: *intentional trim + restraint against the canonical*. Restated for the encoding layer: primitives get one focal element, rest is trimmed, the deviations from centroid are picked deliberately.
