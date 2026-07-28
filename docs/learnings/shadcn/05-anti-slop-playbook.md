# Anti-Slop Playbook

**Status:** Applied synthesis. The mechanisms are documented (see [01](./01-theming-and-tokens.md)–[04](./04-registries-and-mcp.md) and [../tailwind/](../tailwind/)); the ordering and the judgments are ours.
**Written:** 2026-07-28

## What "slop UI" actually is

Not ugliness. Generated UI is rarely ugly line by line. It is **undifferentiated** — every product looks like every other product, because every agent starts from the same defaults and makes the same locally-reasonable choices.

The recognizable signature:

- `rounded-lg border` on everything
- every block wrapped in a `Card`
- `text-sm text-muted-foreground` for all secondary text
- Inter or Geist at 400/500/600, nothing else
- a three-column feature grid with a Lucide icon in a rounded square
- `max-w-7xl mx-auto px-4` as the only container
- a blue→purple gradient somewhere
- uniform medium density — never dense enough for a tool, never airy enough for a page

None of that is *wrong*. It is what happens when nobody decides.

## Three root causes

**1. The decision space is enormous.** Tailwind's default theme exposes well over a thousand values. Each screen re-picks from all of them. Result: `p-3` here, `p-4` there, `text-gray-500` in one file, `text-zinc-500` in the next. Not wrong individually; arrhythmic in aggregate.

**2. There is no memory across screens.** The agent optimizes locally. It does not know you already have an empty-state pattern, so it invents another. The system lives in your head, not in the repo.

**3. The default is a default, not a choice.** shadcn's neutral/zinc scaffold is a sane starting point that most projects never leave.

## The principle

> Reduce the decision space until the default is correct. Then make the system fetchable rather than remembered.

Prompting fixes none of the three causes. It is advisory, it decays over a long context, and it does not survive a new session. The theme is enforced by the compiler. The registry is fetched on demand. Both outlive the context window.

## Five layers

### Layer 0 — Choose, before anything else

Two decisions, five minutes, disproportionate effect:

**Base color.** `zinc` and `slate` are the sound of generated UI. Tailwind 4.2 added four tinted neutrals — `mauve`, `olive`, `mist`, `taupe` — and shadcn exposes all of them as `baseColor`. Pick a warm or unusual one and the whole app stops reading as default. One token. See [../tailwind/03-whats-new-4.2.md](../tailwind/03-whats-new-4.2.md).

**Radius.** `--radius` drives the entire derived scale. `0.625rem` is the shadcn default and therefore the default look. `0.25rem` reads technical and dense; `1rem` reads soft and consumer. Either is a decision; the default is not.

Build both visually on shadcn/create, capture a `--preset` code, and you have a portable starting point. See [03-cli-v4-and-presets.md](./03-cli-v4-and-presets.md).

### Layer 1 — Semantic tokens only

shadcn's `background`/`foreground` pairing already gives you `bg-primary`, `text-muted-foreground`, `bg-destructive`. Two things to add:

**Fill the gaps.** There is no `success` and no `warning` token. shadcn's own rules tell agents to *ask before adding one* — which is correct, and also means the first thing your project should do is add them, so nobody has to ask. Six lines each, in the file at `tailwindCssFile`. Never a new CSS file. See [01-theming-and-tokens.md](./01-theming-and-tokens.md#adding-custom-tokens).

**Name tokens for your domain, not for shadcn's.** `destructive` describes an action type. If your product reasons in terms of severity, `critical` / `degraded` / `healthy` will be used correctly far more often, by humans and agents alike. The token vocabulary is yours; only the *convention* (`x` + `x-foreground`) is shadcn's.

Then make raw colors impossible:

```css
@theme {
  --color-*: initial;
  --color-transparent: transparent;
  --color-current: currentColor;
  --color-white: #fff;
  --color-black: #000;
}
```

After this, `bg-blue-500` does not compile. shadcn states "use semantic colors" as a rule for agents to obey; deleting the namespace makes obedience unnecessary. Audit third-party components first — see [../tailwind/04-constraining-the-scale.md](../tailwind/04-constraining-the-scale.md).

### Layer 2 — Cut the scales

Full detail in [../tailwind/04-constraining-the-scale.md](../tailwind/04-constraining-the-scale.md). In brief:

| Scale | Default | Target | Note |
| --- | --- | --- | --- |
| Colors | ~250 | ~20 semantic | Delete the namespace |
| Font sizes | 13 | 5–6 | Visible jumps, not 14/16/18 |
| Font weights | 9 | 3 | 400 / 500 / 600 |
| Shadows | 21 across 4 namespaces | 1–2 | Pick *one* elevation strategy |
| Radius | 8 | 3–4 | Already derived from `--radius` |

The test for the type scale: if you hesitate between two adjacent sizes, you have one too many. Ambiguity is what produces drift.

### Layer 3 — Adopt the upstream rules, add your own

```bash
pnpm dlx skills add shadcn/ui
```

Do not rewrite these — they are maintained upstream and track API changes. The full set is in [02-agent-rules.md](./02-agent-rules.md). The load-bearing ones:

- **`className` carries layout, never color or typography.** Clean line, easy to lint.
- Built-in variants before custom classes.
- `gap-*`, never `space-x-*` / `space-y-*`.
- `size-*` when width equals height.
- No manual `dark:` color overrides.
- `cn()` for conditional classes — a template literal produces `p-2 p-4` and lets source order decide.
- No manual z-index on overlays.
- Use `Alert`, `Empty`, `Badge`, `Skeleton`, `Separator` — not bespoke divs.

Then add what upstream cannot know: your density rules, your hierarchy rules, your "one primary action per view" rule.

### Layer 4 — Make it fetchable

The structural fix for "my agent doesn't know my design system": stop explaining it, start distributing it.

A GitHub repo with a `registry.json` can ship components, CSS vars, fonts, config, **and** `AGENTS.md`, conventions docs, and editor config — as one versioned install, with no build step and no server. See [04-registries-and-mcp.md](./04-registries-and-mcp.md).

```bash
npx shadcn@latest add your-org/design/house-system
```

Add `shadcn registry validate` to CI. Configure the MCP server per client. Keep a `--preset` code handy to drop into prompts.

## Enforcement

A rule that is not mechanically checked will be violated within days. Something must fail.

| Check | Catches |
| --- | --- |
| No arbitrary values (`p-[13px]`, `text-[#f43f5e]`) | Escaping the system |
| No raw color classes | Redundant if Layer 1 is done — keep as belt-and-braces for v3 or partial migrations |
| No `space-x-*` / `space-y-*` | shadcn rule |
| No `w-N h-N` where N is equal | shadcn rule |
| No `dark:` on color utilities | Tokens already handle it |
| No `start-*` / `end-*` | Deprecated in Tailwind 4.2 |
| No `theme()` | Deprecated in v4 |
| `shadcn registry validate` | Broken registry contract |

The last two double as **staleness detectors**: an agent writing `theme()` or `start-0` is reproducing pre-4.2 training data, which means its other output deserves a closer look.

## The review loop

Everything above is static analysis. It cannot see the screen.

An agent has no visual feedback by default — it emits markup and never learns what it looked like. The single highest-value addition to the pipeline is a screenshot step: render, capture, critique, correct.

The critique prompt should ask specific questions, not "does this look good":

- What is the primary action, and is it the most visually prominent element?
- How many distinct font sizes appear? How many weights?
- Is separation between surfaces achieved by border, background, or shadow — and is it consistent?
- Is the density appropriate for the content type?
- Which elements are competing for attention that shouldn't be?

Verifying claims about a UI is exactly the kind of work that benefits from independent passes — a reviewer that did not write the code catches things the author cannot see.

## Sequencing

Do these in order. The common failure is starting at step 6.

1. Pick a base color that is not `zinc` or `slate`. Pick a radius.
2. Add the missing semantic tokens (`success`, `warning`, anything domain-specific).
3. Delete `--color-*`. Verify third-party components still build.
4. Cut type, weight, and shadow scales.
5. Add lint for arbitrary values and deprecated utilities.
6. Install `shadcn/ui` skills; add your house rules on top.
7. Package the system as a registry with `AGENTS.md` included.
8. Add the screenshot review loop.

Steps 6 and 7 are last because they are the layer that decays. Steps 1–5 do not.

## What this does not do

Constraint removes the noise floor. It does not produce good design.

Hierarchy, density, restraint, and knowing when to break the grid remain judgment calls, and no compiler enforces those. A perfectly constrained system will still produce a boring screen if nobody decided what should be prominent.

The claim here is narrower and worth stating plainly: **a constrained agent produces adequate, coherent work without taste. An unconstrained agent produces slop regardless of how well you prompt it.** Getting to "adequate and coherent" mechanically is what frees the judgment for the parts that actually need it.
