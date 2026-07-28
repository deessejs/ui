# Directives and Functions

**Source:** https://tailwindcss.com/docs/functions-and-directives — verified 2026-07-28

## Directives

### `@import`

```css
@import "tailwindcss";
```

Inlines a CSS file, including Tailwind itself. What you actually get:

```css
@layer theme, base, components, utilities;
@import "./theme.css"     layer(theme);
@import "./preflight.css" layer(base);
@import "./utilities.css" layer(utilities);
```

### `@theme`

Defines design tokens. Covered in detail in [01-theme-and-tokens.md](./01-theme-and-tokens.md).

```css
@theme {
  --font-display: "Satoshi", "sans-serif";
  --breakpoint-3xl: 120rem;
  --color-avocado-500: oklch(0.84 0.18 117.33);
  --ease-snappy: cubic-bezier(0.2, 0, 0, 1);
}
```

Options: `@theme inline`, `@theme static`.

### `@source`

Declares source files that automatic content detection misses — typically a dependency outside the project root.

```css
@source "../node_modules/@my-company/ui-lib";
```

`@source inline(...)` is the v4 replacement for v3's `safelist`. Whitespace around the argument is tolerated as of 4.2.

### `@utility`

Registers a custom utility that participates in the variant system (`hover:`, `focus:`, `lg:`, …).

```css
@utility tab-4 {
  tab-size: 4;
}
```

This is the correct home for a house pattern you want repeated — a focus treatment, a surface elevation, a text truncation clamp. A named utility is greppable, reviewable, and changeable in one place; the equivalent inline class soup is none of those.

Name validation is aligned with the Oxide scanner rules, and escape characters are permitted (added in 4.2, for formatter compatibility with Biome).

### `@variant`

Applies an existing Tailwind variant inside your own CSS.

```css
.my-element {
  background: white;
  @variant dark {
    background: black;
  }
}
```

### `@custom-variant`

Defines a new variant.

```css
@custom-variant theme-midnight (&:where([data-theme="midnight"] *));
```

Enables `theme-midnight:bg-black`, `theme-midnight:text-white`.

shadcn uses exactly this for class-based dark mode:

```css
@custom-variant dark (&:is(.dark *));
```

### `@apply`

Inlines utility classes into custom CSS.

```css
.select2-dropdown {
  @apply rounded-b-lg shadow-md;
}
```

Intended for styling markup you do not control — third-party widget overrides, CMS output. It is not a component abstraction; `@utility` or a real component is the better tool for that.

### `@reference`

Needed to use `@apply` or `@variant` inside a Vue/Svelte `<style>` block or a CSS module. Imports the theme *for reference* without duplicating output CSS.

```vue
<style>
  @reference "../../app.css";
  h1 { @apply text-2xl font-bold; }
</style>
```

If the project has no customizations at all, `@reference "tailwindcss"` is enough. In practice, if you have a theme, reference *your* stylesheet — otherwise your tokens are invisible in that scope.

### Subpath imports

`@import`, `@reference`, `@plugin`, and `@config` support Node subpath imports under the CLI, Vite, and PostCSS.

```json
{
  "imports": {
    "#app.css": "./src/css/app.css"
  }
}
```

```vue
<style>
  @reference "#app.css";
</style>
```

Worth setting up in a monorepo — it removes the `../../../` paths that agents reliably get wrong.

## Functions

### `--alpha()`

```css
.my-element {
  color: --alpha(var(--color-lime-300) / 50%);
}
```

Compiles to:

```css
color: color-mix(in oklab, var(--color-lime-300) 50%, transparent);
```

### `--spacing()`

```css
.my-element {
  margin: --spacing(4);
}
```

Compiles to `calc(var(--spacing) * 4)`. Usable inside arbitrary values:

```html
<div class="py-[calc(--spacing(4)-1px)]"></div>
```

Prefer this over a raw pixel value in an arbitrary class — it keeps the value tied to the spacing scale instead of breaking out of it.

## Compatibility surface (v3 holdovers)

These exist for migration and can be mixed with `@theme` / `@utility`. CSS-defined values merge with, and take precedence over, config-defined ones.

### `@config`

```css
@config "../../tailwind.config.js";
```

`corePlugins`, `safelist`, and `separator` are **not** supported in v4. Safelisting moves to `@source inline()`.

### `@plugin`

```css
@plugin "@tailwindcss/typography";
```

Accepts a package name or a local path.

### `theme()`

```css
.my-element { margin: theme(spacing.12); }
```

**Deprecated.** Use CSS theme variables instead. If an agent writes `theme()` in a v4 project, it is reproducing v3-era training data — a useful signal that its other output may also be stale.
