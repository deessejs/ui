# Theming and Tokens

**Sources:** https://ui.shadcn.com/docs/theming · https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/customization.md — verified 2026-07-28

## How it works

Three layers:

1. CSS variables in `:root` (light) and `.dark` (dark) — raw values, no utilities generated.
2. `@theme inline` promotes them to Tailwind's `--color-*` namespace — utilities appear.
3. Components consume the utilities — `bg-primary`, `text-muted-foreground`.

Change a variable, every component that references it changes. No component source is edited.

Enabled by `tailwind.cssVariables: true` in `components.json` — the default.

```json
{
  "style": "base-nova",
  "rsc": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  }
}
```

**Why `@theme inline` and not plain `@theme`:** the tokens point at other variables (`--color-primary: var(--primary)`), and `.dark` overrides those in a nested scope. Without `inline`, the utility would reference `var(--primary)` resolved at the point of definition, and dark mode would silently fail. See [../tailwind/01-theme-and-tokens.md](../tailwind/01-theme-and-tokens.md#theme-inline).

## The background/foreground convention

Every color is a pair. The base token is the surface; the `-foreground` token is the text and icons sitting on it. The word "background" is omitted from the surface token.

```css
--primary: oklch(0.205 0 0);
--primary-foreground: oklch(0.985 0 0);
```

```tsx
<div className="bg-primary text-primary-foreground">Hello</div>
```

The consequence: **contrast is a property of the token pair, not of the component**. Choose the pair correctly once and every usage is legible in both modes. This is the mechanism that eliminates `text-white` guessing.

## Token reference

| Token | Controls | Used by |
| --- | --- | --- |
| `background` / `foreground` | Default app background and text | Page shell, sections, default text |
| `card` / `card-foreground` | Elevated surfaces | `Card`, dashboard panels, settings panels |
| `popover` / `popover-foreground` | Floating surfaces | `Popover`, `DropdownMenu`, `ContextMenu`, overlays |
| `primary` / `primary-foreground` | High-emphasis actions, brand surfaces | Default `Button`, selected states, badges, active accents |
| `secondary` / `secondary-foreground` | Lower-emphasis filled actions | Secondary buttons and badges, supporting UI |
| `muted` / `muted-foreground` | Subtle surfaces, lower-emphasis content | Descriptions, placeholders, empty states, helper text |
| `accent` / `accent-foreground` | Interactive hover / focus / active surfaces | Ghost buttons, menu highlights, hovered rows, selected items |
| `destructive` | Destructive actions and error emphasis | Destructive buttons, invalid states, destructive menu items |
| `border` | Default borders and separators | Cards, menus, tables, separators, dividers |
| `input` | Form control borders and input surface | `Input`, `Textarea`, `Select`, outline controls |
| `ring` | Focus rings and outlines | Buttons, inputs, checkboxes, menus, focusables |
| `chart-1` … `chart-5` | Default chart palette | Charts, chart-driven blocks |
| `sidebar` / `sidebar-foreground` | Sidebar surface and text | `Sidebar` container |
| `sidebar-primary` / `-foreground` | High-emphasis sidebar actions | Active items, icon tiles, sidebar CTAs |
| `sidebar-accent` / `-foreground` | Sidebar hover and selected states | Menu hover, open items, interactive rows |
| `sidebar-border` | Sidebar borders | Sidebar headers, groups, dividers |
| `sidebar-ring` | Sidebar focus rings | Focused controls in the sidebar |
| `radius` | Base corner radius | Cards, inputs, buttons, popovers, derived `radius-*` |

### Two documented inconsistencies

Worth knowing before an agent trips on them:

- **`destructive-foreground`.** The theming docs list `destructive` with no pair. The `customization.md` skill file lists `destructive` / `destructive-foreground`. There is an open discussion on whether the variable is actually used ([#9123](https://github.com/shadcn-ui/ui/discussions/9123)). Verify against your installed component source rather than assuming.
- **`surface` / `surface-foreground`.** Appears in `customization.md` as "secondary surface" but not in the theming docs token table. May be style-dependent. Check `npx shadcn@latest info` for what your project actually has.

### What is missing

**No `success` token. No `warning` token.** This is deliberate but incomplete, and the styling rules address it directly: for status indicators, use a `Badge` variant or a semantic token, and if you need a success color that does not exist, *ask the user before adding one*.

In practice this is the first extension almost every project makes.

## Adding custom tokens

Define in `:root` and `.dark`, then expose via `@theme inline`. Three steps, and it is how you would get `bg-critical`, `bg-success`, or any other name your domain needs.

```css
/* 1 — raw values in the global CSS file */
:root {
  --warning: oklch(0.84 0.16 84);
  --warning-foreground: oklch(0.28 0.07 46);
}

.dark {
  --warning: oklch(0.41 0.11 46);
  --warning-foreground: oklch(0.99 0.02 95);
}
```

```css
/* 2 — promote to utilities (Tailwind v4) */
@theme inline {
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
}
```

```tsx
/* 3 — use */
<div className="bg-warning text-warning-foreground">Warning</div>
```

For Tailwind v3 projects (`tailwindVersion: "v3"` from `shadcn info`), register in `tailwind.config.js` instead:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        warning: "oklch(var(--warning) / <alpha-value>)",
        "warning-foreground": "oklch(var(--warning-foreground) / <alpha-value>)",
      },
    },
  },
}
```

**Hard rule from the skill docs:** add these to the file at `tailwindCssFile` (from `npx shadcn@latest info`) — typically `globals.css`. *Never create a new CSS file for this.* Agents love to create `theme.css` and split the source of truth. That is exactly the drift this rule prevents.

## The radius scale

`--radius` is the single source of truth. Everything else derives:

```css
@theme inline {
  --radius-sm:  calc(var(--radius) * 0.6);
  --radius-md:  calc(var(--radius) * 0.8);
  --radius-lg:  var(--radius);
  --radius-xl:  calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
}
```

Default `--radius: 0.625rem` (10px). Change it and the entire scale moves proportionally. `radius-lg` is the base.

This is a good template for other scales — one root value, derived steps, one place to change.

## OKLCH

All colors use OKLCH: `oklch(L C H)` where L is lightness 0–1, C is chroma (0 = grey), H is hue 0–360.

```css
--primary: oklch(0.205 0 0);              /* near-black, no chroma */
--destructive: oklch(0.577 0.245 27.325); /* mid-lightness, high chroma, red */
--border: oklch(1 0 0 / 10%);             /* white at 10% — dark mode borders */
```

Why it matters here: lightness in OKLCH is perceptually uniform. Two colors at `L=0.55` look equally bright regardless of hue, which is not true in HSL. That makes it practical to build a palette by holding L constant and varying H — and to reason about contrast without a checker at every step.

Note the alpha pattern in dark mode: `oklch(1 0 0 / 10%)` — a translucent white border rather than an opaque grey. It composites correctly over whatever surface sits beneath.

## Base colors

`tailwind.baseColor` sets the generated token values on `init` or preset apply.

Available: **Neutral, Stone, Zinc, Mauve, Olive, Mist, Taupe**

The last four are the tinted neutrals added in Tailwind 4.2 ([../tailwind/03-whats-new-4.2.md](../tailwind/03-whats-new-4.2.md)). This is the cheapest single move away from the default look: `zinc` is what everything generated looks like; `taupe` and `olive` are not.

## Default theme scaffold

The full neutral scaffold, verbatim from the docs. Note the `@import "shadcn/tailwind.css"` line and the `@custom-variant dark` declaration.

```css
@import "tailwindcss";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
}

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

Two details in that base layer worth noting: `border-border` is applied to `*`, so every element already has the right border color and you only need `border` to turn it on. And `outline-ring/50` gives a consistent focus treatment globally.

## Dark mode

Class-based, via `.dark` on the root. In Next.js:

```tsx
import { ThemeProvider } from "next-themes"

<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  {children}
</ThemeProvider>
```

Because every token has a `.dark` override, **components need no `dark:` variants at all**. Any `dark:bg-*` in component code is a bug — see [02-agent-rules.md](./02-agent-rules.md).

## Opting out of CSS variables

Possible, and a bad idea for this use case:

```bash
pnpm dlx shadcn@latest init --no-css-variables
```

Sets `cssVariables: false`, and components are generated with inline utilities:

```tsx
<div className="bg-zinc-950 text-zinc-50 dark:bg-white dark:text-zinc-950" />
```

That is the slop pattern by construction — raw colors, manual dark variants, no single source of truth. It is also an **install-time choice**: switching an existing project requires deleting and reinstalling every component.
