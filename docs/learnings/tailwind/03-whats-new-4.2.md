# What's New in Tailwind CSS 4.2

**Source:** https://github.com/tailwindlabs/tailwindcss/releases/tag/v4.2.0
**Released:** 2026-02-18 · **Verified:** 2026-07-28 (v4.2.2 tag observed, patch releases since)

## Added

### Four new neutral palettes

`mauve`, `olive`, `mist`, `taupe` ([#19627](https://github.com/tailwindlabs/tailwindcss/pull/19627))

Each is a full 50–950 scale. They are **tinted neutrals**, not chromatic hues:

```
--color-mauve-500: oklch(54.2% 0.034 322.5)   /* neutral pulled toward magenta */
--color-olive-500: oklch(58%   0.031 107.3)   /* toward yellow-green */
--color-mist-500:  oklch(56%   0.021 213.5)   /* toward cyan */
--color-taupe-500: oklch(54.7% 0.021 43.1)    /* toward orange */
```

Compare to the existing neutrals: `neutral` is chroma 0 (truly achromatic), `zinc` ~0.016 toward violet, `gray` ~0.027 toward blue, `slate` ~0.046 toward blue, `stone` ~0.013 toward orange.

**Why this matters for the anti-slop problem.** The default look of AI-generated UI is `zinc` or `slate` — a cool blue-grey. It reads as "unstyled Tailwind" because it is the path of least resistance. Choosing a warm neutral (`taupe`, `stone`) or an unusual one (`olive`, `mauve`) shifts the entire feel of an interface with a one-token change, before any other design decision is made. It is the highest-leverage single edit available.

shadcn picked these up immediately — its `baseColor` options are now Neutral, Stone, Zinc, **Mauve, Olive, Mist, Taupe**.

### Webpack plugin

`@tailwindcss/webpack` ([#19610](https://github.com/tailwindlabs/tailwindcss/pull/19610)) — Tailwind as a first-party webpack plugin, joining the Vite / PostCSS / CLI options.

### Logical property utilities

Block-direction and inline-direction utilities ([#19601](https://github.com/tailwindlabs/tailwindcss/pull/19601), [#19612](https://github.com/tailwindlabs/tailwindcss/pull/19612), [#19613](https://github.com/tailwindlabs/tailwindcss/pull/19613)):

| Utility | CSS property |
| --- | --- |
| `pbs-*` / `pbe-*` | `padding-block-start` / `padding-block-end` |
| `mbs-*` / `mbe-*` | `margin-block-start` / `margin-block-end` |
| `scroll-pbs-*` / `scroll-pbe-*` | `scroll-padding-block-start` / `-end` |
| `scroll-mbs-*` / `scroll-mbe-*` | `scroll-margin-block-start` / `-end` |
| `border-bs-*` / `border-be-*` | `border-block-start` / `border-block-end` |
| `inline-*`, `min-inline-*`, `max-inline-*` | `inline-size`, `min-inline-size`, `max-inline-size` |
| `block-*`, `min-block-*`, `max-block-*` | `block-size`, `min-block-size`, `max-block-size` |
| `inset-s-*`, `inset-e-*`, `inset-bs-*`, `inset-be-*` | `inset-inline-start/end`, `inset-block-start/end` |

This completes logical-property coverage. Relevant for RTL support and vertical writing modes.

### `font-features-*`

Utility for `font-feature-settings` ([#19623](https://github.com/tailwindlabs/tailwindcss/pull/19623)).

Worth noting for typography quality: this is how you turn on tabular figures (`tnum`) in data tables, or disable a variable font's default ligatures. Small detail, visible result — misaligned numerals in a table is one of the tells of UI nobody looked at.

## Deprecated

- `start-*` and `end-*` → use `inset-s-*` and `inset-e-*` ([#19613](https://github.com/tailwindlabs/tailwindcss/pull/19613))

An agent writing `start-0` is producing pre-4.2 output. Add this to the lint list.

## Fixed (selected)

- No more double `@supports` wrapper for `color-mix` values ([#19450](https://github.com/tailwindlabs/tailwindcss/pull/19450))
- Whitespace allowed around `@source inline()` arguments ([#19461](https://github.com/tailwindlabs/tailwindcss/pull/19461))
- Utilities with capital letters followed by numbers are now detected ([#19465](https://github.com/tailwindlabs/tailwindcss/pull/19465))
- Class extraction fixed for Rails strict locals ([#19525](https://github.com/tailwindlabs/tailwindcss/pull/19525))
- `@utility` name validation aligned with Oxide scanner rules ([#19524](https://github.com/tailwindlabs/tailwindcss/pull/19524))
- Escape characters allowed in `@utility` names, for formatters such as Biome ([#19626](https://github.com/tailwindlabs/tailwindcss/pull/19626))
- Infinite loop fixed when using `@variant` inside `@custom-variant` ([#19633](https://github.com/tailwindlabs/tailwindcss/pull/19633))
- `.25` multiples allowed in `aspect-*` fractions, e.g. `aspect-8.5/11` ([#19688](https://github.com/tailwindlabs/tailwindcss/pull/19688))
- `@source` external file changes now trigger a full reload under `@tailwindcss/vite` ([#19670](https://github.com/tailwindlabs/tailwindcss/pull/19670))
- Oxide scanner performance improved on large projects via fewer filesystem walks ([#19632](https://github.com/tailwindlabs/tailwindcss/pull/19632))
- Astro v5 import aliases no longer crash `@tailwindcss/vite` ([#19677](https://github.com/tailwindlabs/tailwindcss/issues/19677))
- Canonicalization is now idempotent across repeated runs ([#19675](https://github.com/tailwindlabs/tailwindcss/pull/19675))
- `.jj` added to default ignored content directories ([#19687](https://github.com/tailwindlabs/tailwindcss/pull/19687))

## Takeaways

1. **Try a new neutral before anything else.** `taupe`, `olive`, `mist`, and `mauve` are the cheapest escape from the default-Tailwind look. One token, whole-app effect.
2. **`font-features-*` is a typography-quality lever**, especially `tnum` for numeric tables.
3. **`start-*`/`end-*` is now a staleness marker** in agent output.
4. Logical properties are complete — if internationalization is on the roadmap, the utilities are all there now.
