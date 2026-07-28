# Constraining the Scale

**Status:** Applied synthesis, not vendor documentation. The mechanisms below are documented Tailwind features (see [01](./01-theme-and-tokens.md), [02](./02-directives-and-functions.md)); the recommendations are ours and should be argued with.
**Written:** 2026-07-28

## The problem in one sentence

An agent asked to "add a settings panel" makes roughly forty independent styling decisions, each drawn from a default theme offering over a thousand values, with no memory of the forty decisions it made on the previous screen.

The output is not wrong line by line. It is *unrhythmic* — `p-3` here and `p-4` there, `gap-2` then `gap-6`, `text-gray-500` in one file and `text-zinc-500` in the next. Incoherence at scale reads as carelessness, even when every individual choice is defensible.

Prompting does not fix this. Prompts are advisory and decay across a long context. The theme is enforced by the compiler and does not decay.

## The principle

> Reduce the decision space until the default is correct.

A constrained agent produces adequate work without taste. An unconstrained agent produces slop regardless of how well you prompt it.

Every value you leave in the theme is a value that will eventually appear in the codebase.

## Levers, ordered by strength

### 1. Delete the raw color palette

The single highest-impact change. This makes it *impossible* to write `bg-blue-500`.

```css
@import "tailwindcss";

@theme {
  --color-*: initial;

  /* Only what the system actually needs. */
  --color-transparent: transparent;
  --color-current: currentColor;
  --color-white: #fff;
  --color-black: #000;
}
```

Then reintroduce colors **only as semantic aliases** (see [../shadcn/01-theming-and-tokens.md](../shadcn/01-theming-and-tokens.md)). After this, `bg-primary` and `text-muted-foreground` are not a convention an agent may or may not follow — they are the only spelling that compiles.

This is the mechanical version of shadcn's "use semantic colors" rule. shadcn states it as a rule for agents to obey; deleting the namespace makes obedience unnecessary.

**Caveat:** third-party registry components, chart libraries, and syntax highlighters may reference raw palette classes. Audit before deleting, or keep a narrow allowlist.

### 2. Cut the type scale

The default ships thirteen font sizes (`text-xs` → `text-9xl`). Most products need four or five.

A scale with real contrast, as opposed to the 14/16/18 mush that characterizes generated UI:

```css
@theme {
  --text-*: initial;

  --text-xs:   0.8125rem;  /* 13px — captions, table meta */
  --text-sm:   0.875rem;   /* 14px — dense UI, secondary */
  --text-base: 1rem;       /* 16px — body */
  --text-lg:   1.375rem;   /* 22px — section headings */
  --text-xl:   2rem;       /* 32px — page titles */
  --text-2xl:  3rem;       /* 48px — display */
}
```

Six steps, each visibly distinct. The heuristic: **if you hesitate between two adjacent sizes, you have one too many.** Ambiguity is what produces drift.

### 3. Cut font weights

Nine defaults (`thin` → `black`). Almost no interface needs more than three.

```css
@theme {
  --font-weight-*: initial;
  --font-weight-normal:   400;
  --font-weight-medium:   500;
  --font-weight-semibold: 600;
}
```

`font-thin` and `font-black` in a product UI are nearly always a mistake. Removing them prevents the mistake rather than catching it in review.

### 4. Constrain elevation to one strategy

Separation between surfaces can be expressed by border, by background, or by shadow. Pick **one**. Generated UI stacks all three and the result is mush.

If the strategy is borders:

```css
@theme {
  --shadow-*: initial;
  --inset-shadow-*: initial;
  --drop-shadow-*: initial;

  /* Overlays only — the one place a shadow earns its place. */
  --shadow-popover: 0 8px 24px -4px oklch(0 0 0 / 0.12);
}
```

`shadow-md` on a card is no longer expressible. `shadow-popover` names the single sanctioned use.

### 5. Reduce the radius scale

The default has eight steps. A coherent system generally has three, all derived from one source of truth. shadcn already does this — see [../shadcn/01-theming-and-tokens.md](../shadcn/01-theming-and-tokens.md).

### 6. Keep the spacing scale, constrain its *use*

Unlike color and type, the spacing scale is a single multiplier (`--spacing: 0.25rem`) and pruning it is awkward. This one is better handled by a written rule plus lint: a small allowlist such as `1, 2, 3, 4, 6, 8, 12, 16, 24` covers essentially all real layout, and anything outside it is a signal to look.

Adjusting the base unit is a legitimate global move:

```css
@theme {
  --spacing: 0.25rem;  /* default 4px grid */
  /* --spacing: 0.2rem;  denser, 3.2px grid — good for data tools */
}
```

## Turn house patterns into named utilities

Anything repeated across screens should be a `@utility`, not a memorized class string. Named utilities are greppable, reviewable, and changeable in one place.

```css
@utility surface {
  background-color: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

@utility text-numeric {
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
}
```

`text-numeric` uses the `font-features-*` capability added in 4.2 — see [03-whats-new-4.2.md](./03-whats-new-4.2.md). Misaligned digits in a data table is one of the clearest tells that nobody looked at the screen.

## Enforce what you cannot delete

Some things survive the theme cut and need lint.

| Rule | Why |
| --- | --- |
| No arbitrary values (`p-[13px]`, `text-[#f43f5e]`) | Escape hatch straight out of the system |
| No `start-*` / `end-*` | Deprecated in 4.2 → `inset-s-*` / `inset-e-*` |
| No `theme()` function | Deprecated → CSS variables |
| No `space-x-*` / `space-y-*` | shadcn house rule → `flex gap-*` |
| No `w-N h-N` when N is equal | → `size-N` |
| No manual `dark:` color overrides | Semantic tokens already handle both modes |

The last three are shadcn's own rules — see [../shadcn/02-agent-rules.md](../shadcn/02-agent-rules.md).

**A rule that is not mechanically checked will be violated within days.** Prettier's Tailwind plugin, `eslint-plugin-tailwindcss`, or a plain regex in CI all work. The tool matters less than the fact that something fails.

## Sequencing

1. Delete `--color-*`. Rebuild the palette as semantic tokens only.
2. Cut the type scale to five or six steps with visible contrast.
3. Cut font weights to three.
4. Pick one elevation strategy and delete the others.
5. Add lint for arbitrary values and deprecated utilities.
6. Promote repeated class strings to `@utility`.
7. Only then write agent rules — and only for what the compiler cannot enforce.

Step 7 last is the point. Most teams do it first, and it does not hold.

## Honest caveats

- **Aggressive pruning breaks third-party components.** Registry items, chart libraries, and prose plugins may reference raw palette utilities. Audit before deleting; keep a documented allowlist where needed.
- **`--*: initial` is a large hammer.** It removes container queries, breakpoints, and easing along with everything else. Prefer per-namespace `initial` unless you are starting from scratch and intend to redefine everything.
- **A constrained theme cannot produce good design.** It removes the noise floor. Hierarchy, density, and restraint are still judgment calls, and no compiler enforces those.
