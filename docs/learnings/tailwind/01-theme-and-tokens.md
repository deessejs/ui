# Theme Variables and Design Tokens

**Source:** https://tailwindcss.com/docs/theme — verified 2026-07-28

## `@theme` vs `:root`

Both declare CSS variables. Only `@theme` generates utility classes.

```css
@import "tailwindcss";

@theme {
  --color-mint-500: oklch(0.72 0.11 178);
}
```

Now available: `bg-mint-500`, `text-mint-500`, `fill-mint-500`, `border-mint-500`, etc. Tailwind also emits a plain CSS variable, so `style="background-color: var(--color-mint-500)"` works too.

Rules and constraints:

- `@theme` blocks must be **top-level**. Not nested under a selector or media query. The directive exists partly so this can be enforced.
- Use `@theme` when a token should map to a utility class.
- Use `:root` when you want a plain variable with **no** corresponding utility.

That second point is the mechanism shadcn relies on: raw values live in `:root`/`.dark`, and only the semantic aliases get promoted to utilities via `@theme inline`.

## Namespaces

Each namespace drives a family of utilities or variants. Defining a variable in a namespace creates the matching class.

| Namespace | Generates |
| --- | --- |
| `--color-*` | `bg-*`, `text-*`, `border-*`, `fill-*`, `ring-*`, … |
| `--font-*` | `font-sans`, `font-mono`, … |
| `--text-*` | `text-xl` (font size) |
| `--font-weight-*` | `font-bold`, … |
| `--tracking-*` | `tracking-wide`, … |
| `--leading-*` | `leading-tight`, … |
| `--tab-size-*` | `tab-github`, … |
| `--breakpoint-*` | Responsive variants `sm:*`, `md:*`, … |
| `--container-*` | Container query variants `@sm:*` and `max-w-md` |
| `--spacing-*` | `px-4`, `max-h-16`, and most sizing utilities |
| `--radius-*` | `rounded-sm`, … |
| `--shadow-*` | `shadow-md`, … |
| `--inset-shadow-*` | `inset-shadow-xs`, … |
| `--drop-shadow-*` | `drop-shadow-md`, … |
| `--blur-*` | `blur-md`, … |
| `--perspective-*` | `perspective-near`, … |
| `--zoom-*` | `zoom-compact`, … |
| `--aspect-*` | `aspect-video`, … |
| `--ease-*` | `ease-out`, … |
| `--animate-*` | `animate-spin`, … |

Note `--text-*` also supports a paired line-height: `--text-sm` and `--text-sm--line-height`.

## Customizing

### Extend

```css
@import "tailwindcss";

@theme {
  --font-script: Great Vibes, cursive;
}
```

### Override a single value

```css
@theme {
  --breakpoint-sm: 30rem;
}
```

### Wipe an entire namespace

```css
@import "tailwindcss";

@theme {
  --color-*: initial;
  --color-white: #fff;
  --color-purple: #3f3cbb;
  --color-midnight: #121063;
}
```

Every default color utility (`bg-red-500`, `text-slate-700`, …) stops existing. Only `bg-midnight` and friends remain.

### Wipe everything

```css
@import "tailwindcss";

@theme {
  --*: initial;
  --spacing: 4px;
  --font-body: Inter, sans-serif;
  --color-lagoon: oklch(0.72 0.11 221.19);
}
```

No default theme-driven utilities at all. Static utilities like `flex` and `pointer-events-none` survive — they are hardcoded in the framework, not theme-driven.

This is the strongest constraint available and it is a one-line change.

## `@theme inline`

Use `inline` when a theme variable **references another variable**.

```css
@theme inline {
  --font-sans: var(--font-inter);
}
```

Output:

```css
.font-sans {
  font-family: var(--font-inter);
}
```

Without `inline`, the utility references `var(--font-sans)`, which resolves *where `--font-sans` is defined*. If `--font-inter` is only defined deeper in the tree, resolution fails and you silently fall back.

The documented failure case:

```html
<div id="parent" style="--font-sans: var(--font-inter, sans-serif);">
  <div id="child" style="--font-inter: Inter; font-family: var(--font-sans);">
    This text will use sans-serif, not Inter.
  </div>
</div>
```

**This is why shadcn's generated `globals.css` uses `@theme inline`** — the tokens in `@theme` all point at `:root`/`.dark` variables, and dark mode overrides those in a nested scope. Without `inline`, dark mode would break. See [../shadcn/01-theming-and-tokens.md](../shadcn/01-theming-and-tokens.md).

## `@theme static`

By default only *used* CSS variables reach the output. `static` forces all of them to be emitted.

```css
@theme static {
  --color-primary: var(--color-red-500);
  --color-secondary: var(--color-blue-500);
}
```

Useful when variables are read at runtime — by JS, by a third-party widget, or by CSS you do not control.

## Keyframes

Define `@keyframes` inside `@theme` alongside the `--animate-*` variable so it ships only when used:

```css
@theme {
  --animate-fade-in-scale: fade-in-scale 0.3s ease-out;

  @keyframes fade-in-scale {
    0%   { opacity: 0; transform: scale(0.95); }
    100% { opacity: 1; transform: scale(1); }
  }
}
```

Keyframes defined *outside* `@theme` are always included.

## Sharing across projects

Theme variables are plain CSS, so a shared theme is just a file:

```css
/* packages/brand/theme.css */
@theme {
  --*: initial;
  --spacing: 4px;
  --font-body: Inter, sans-serif;
  --color-lagoon: oklch(0.72 0.11 221.19);
}
```

```css
/* packages/admin/app.css */
@import "tailwindcss";
@import "../brand/theme.css";
```

Publishable to npm like any CSS package. This is the low-tech alternative to shadcn's `registry:base` distribution.

## Consuming tokens outside utilities

All theme variables compile to real CSS variables on `:root`.

**In custom CSS** — for markup you do not control (rendered Markdown, third-party HTML):

```css
@layer components {
  .typography {
    p  { font-size: var(--text-base); color: var(--color-gray-700); }
    h1 { font-size: var(--text-2xl--line-height); font-weight: var(--font-weight-semibold); }
  }
}
```

**In arbitrary values** — notably for concentric radii:

```html
<div class="relative rounded-xl">
  <div class="absolute inset-px rounded-[calc(var(--radius-xl)-1px)]"></div>
</div>
```

**In JS** — usually just pass the variable through:

```jsx
<motion.div animate={{ backgroundColor: "var(--color-blue-500)" }} />
```

If you need a resolved value:

```js
const styles = getComputedStyle(document.documentElement)
const shadow = styles.getPropertyValue("--shadow-xl")
```

## Default theme reference (abbreviated)

The full default lives in `node_modules/tailwindcss/theme.css`. Key non-color scales:

```
--spacing: 0.25rem

--breakpoint-sm/md/lg/xl/2xl: 40 / 48 / 64 / 80 / 96 rem
--container-3xs … --container-7xl: 16rem … 80rem

--text-xs 0.75  --text-sm 0.875  --text-base 1     --text-lg 1.125
--text-xl 1.25  --text-2xl 1.5   --text-3xl 1.875  --text-4xl 2.25
--text-5xl 3    --text-6xl 3.75  --text-7xl 4.5    --text-8xl 6   --text-9xl 8   (rem)

--font-weight-thin 100 … --font-weight-black 900   (9 steps)
--tracking-tighter -0.05em … --tracking-widest 0.1em   (6 steps)
--leading-tight 1.25 … --leading-loose 2   (5 steps)

--radius-xs 0.125  --radius-sm 0.25  --radius-md 0.375  --radius-lg 0.5
--radius-xl 0.75   --radius-2xl 1    --radius-3xl 1.5   --radius-4xl 2   (rem)

--shadow-2xs … --shadow-2xl        (7 steps)
--inset-shadow-2xs/xs/sm           (3 steps)
--drop-shadow-xs … --drop-shadow-2xl (6 steps)
--text-shadow-2xs … --text-shadow-lg (5 steps)
--blur-xs … --blur-3xl             (7 steps)

--ease-in / --ease-out / --ease-in-out
--animate-spin / ping / pulse / bounce
```

Colors: 22 hues × 11 steps, plus `black` and `white`. As of 4.2 the hues are red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose, slate, gray, zinc, neutral, stone, **mauve, olive, mist, taupe**.

That is roughly 250 color utilities available by default per property. Counting the scales above, the default theme exposes well over a thousand distinct utility values. This is the number to shrink — see [04-constraining-the-scale.md](./04-constraining-the-scale.md).
