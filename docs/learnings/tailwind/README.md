# Tailwind CSS — Research Notes

Research snapshot for building a constrained design system that AI agents can work inside without producing generic output.

**Researched:** 2026-07-28
**Current version at time of research:** v4.2.x (v4.2.0 released 2026-02-18, v4.2.2 tag observed)

## Documents

| File | Covers |
| --- | --- |
| [01-theme-and-tokens.md](./01-theme-and-tokens.md) | `@theme`, namespaces, `inline`/`static`, overriding and disabling defaults |
| [02-directives-and-functions.md](./02-directives-and-functions.md) | `@source`, `@utility`, `@variant`, `@custom-variant`, `@apply`, `@reference`, `--alpha()`, `--spacing()` |
| [03-whats-new-4.2.md](./03-whats-new-4.2.md) | v4.2.0 additions, deprecations, new palettes |
| [04-constraining-the-scale.md](./04-constraining-the-scale.md) | Applied: narrowing the decision space so agents can't drift |

## The one idea that matters

In v4, **theme variables are the design token API**. `@theme` does not just declare a CSS variable — it declares which utility classes exist in the project.

```css
@theme {
  --color-mint-500: oklch(0.72 0.11 178);
}
```

This creates `bg-mint-500`, `text-mint-500`, `fill-mint-500`, and so on. Nothing was configured; a token was defined and the utilities followed.

The corollary is the lever for controlling agent output: **utilities you remove from the theme cannot be typed by anyone**, agent or human. `--color-*: initial` deletes every default color utility. What does not exist cannot be used. This is enforcement at the compiler level, not at the review level.

See [04-constraining-the-scale.md](./04-constraining-the-scale.md) for how to apply this deliberately.

## Sources

- https://tailwindcss.com/docs/theme
- https://tailwindcss.com/docs/functions-and-directives
- https://github.com/tailwindlabs/tailwindcss/releases/tag/v4.2.0
