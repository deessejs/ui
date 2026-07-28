# Official Agent Rules

**Sources:** https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/SKILL.md · https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/rules/styling.md — verified 2026-07-28

shadcn maintains a skill for coding agents. It is worth reading in full and worth adopting rather than reinventing: it is upstream-maintained and tracks API changes you would otherwise discover by breaking.

```bash
pnpm dlx skills add shadcn/ui
```

The skill declares `user-invocable: false` and is scoped to `Bash(npx shadcn@latest *)` and equivalents. It auto-triggers on any project containing `components.json`.

Notably, the skill injects live project context by executing `npx shadcn@latest info --json` at load time — so the agent gets the *actual* installed components and config, not a guess.

## The four principles

Quoted from `SKILL.md`:

1. **Use existing components first.** Search registries before writing custom UI. Check community registries too.
2. **Compose, don't reinvent.** Settings page = Tabs + Card + form controls. Dashboard = Sidebar + Card + Chart + Table.
3. **Use built-in variants before custom styles.** `variant="outline"`, `size="sm"`.
4. **Use semantic colors.** `bg-primary`, `text-muted-foreground` — never raw values like `bg-blue-500`.

Principle 2 is the one that most directly counters slop. Generated UI tends to invent a bespoke arrangement per screen. Composition from a fixed vocabulary produces consistency for free.

## Styling rules

Verbatim from `rules/styling.md`.

### Semantic colors

```tsx
// Incorrect
<div className="bg-blue-500 text-white">
  <p className="text-gray-600">Secondary text</p>
</div>

// Correct
<div className="bg-primary text-primary-foreground">
  <p className="text-muted-foreground">Secondary text</p>
</div>
```

### No raw colors for status indicators

```tsx
// Incorrect
<span className="text-emerald-600">+20.1%</span>
<span className="text-green-500">Active</span>
<span className="text-red-600">-3.2%</span>

// Correct
<Badge variant="secondary">+20.1%</Badge>
<Badge>Active</Badge>
<span className="text-destructive">-3.2%</span>
```

> If you need a success/positive color that doesn't exist as a semantic token, use a Badge variant or **ask the user** about adding a custom CSS variable to the theme.

That instruction — ask, don't invent — is the correct default. An agent that silently adds `text-emerald-600` has forked your palette. See [01-theming-and-tokens.md](./01-theming-and-tokens.md#adding-custom-tokens) for the sanctioned path.

### Built-in variants first

```tsx
// Incorrect
<Button className="border border-input bg-transparent hover:bg-accent">Click me</Button>

// Correct
<Button variant="outline">Click me</Button>
```

### `className` is for layout, not styling

```tsx
// Incorrect
<Card className="bg-blue-100 text-blue-900 font-bold">
  <CardContent>Dashboard</CardContent>
</Card>

// Correct
<Card className="max-w-md mx-auto">
  <CardContent>Dashboard</CardContent>
</Card>
```

Customization preference order:

1. Built-in variants — `variant="outline"`, `variant="destructive"`
2. Semantic tokens — `bg-primary`, `text-muted-foreground`
3. CSS variables — define in the global CSS file

This is the single most useful rule to internalize. **`className` carries position and size. It does not carry color or type.** It is a clean line, easy to review, and easy to lint.

### No `space-x-*` / `space-y-*`

```tsx
<div className="flex flex-col gap-4">
  <Input />
  <Input />
  <Button>Submit</Button>
</div>
```

`space-y-4` → `flex flex-col gap-4`. `space-x-2` → `flex gap-2`.

### `size-*` over `w-* h-*` when equal

`size-10`, not `w-10 h-10`. Applies to icons, avatars, skeletons.

### `truncate` shorthand

`truncate`, not `overflow-hidden text-ellipsis whitespace-nowrap`.

### No manual `dark:` color overrides

`bg-background text-foreground`, not `bg-white dark:bg-gray-950`. Semantic tokens already handle both modes.

### `cn()` for conditional classes

```tsx
// Incorrect
<div className={`flex items-center ${isActive ? "bg-primary text-primary-foreground" : "bg-muted"}`}>

// Correct
import { cn } from "@/lib/utils"
<div className={cn("flex items-center", isActive ? "bg-primary text-primary-foreground" : "bg-muted")}>
```

`cn()` merges conflicting Tailwind classes correctly. A template literal does not — it produces `p-2 p-4` and lets CSS source order decide.

### No manual z-index on overlays

`Dialog`, `Sheet`, `Drawer`, `AlertDialog`, `DropdownMenu`, `Popover`, `Tooltip`, `HoverCard` manage their own stacking. Never `z-50` or `z-[999]`.

### Use built-in utilities, not custom animations

`shimmer` for loading text. `scroll-fade` / `scroll-fade-x` / `scroll-fade-b` for scroll edge fading.

```tsx
// Incorrect
<span className="animate-pulse bg-gradient-to-r from-muted-foreground/40 via-foreground/70 to-muted-foreground/40 bg-clip-text text-transparent [animation:shimmer_1.6s_infinite]">
  Thinking…
</span>

// Correct
<span className="shimmer">Thinking…</span>
```

## Composition rules

- Items always inside their Group: `SelectItem` → `SelectGroup`, `DropdownMenuItem` → `DropdownMenuGroup`, `CommandItem` → `CommandGroup`.
- Custom triggers use `asChild` (Radix) or `render` (Base UI). Check the `base` field from `shadcn info`.
- `Dialog` / `Sheet` / `Drawer` **always need a Title** for accessibility. Use `className="sr-only"` if visually hidden.
- Use full `Card` composition — `CardHeader` / `CardTitle` / `CardDescription` / `CardContent` / `CardFooter`. Don't dump everything into `CardContent`.
- `Button` has no `isPending` / `isLoading`. Compose `Spinner` + `data-icon` + `disabled`.
- `TabsTrigger` must be inside `TabsList`.
- `Avatar` always needs `AvatarFallback`.

## Use components, not custom markup

| Instead of | Use |
| --- | --- |
| Custom styled callout div | `Alert` |
| Custom empty state markup | `Empty` |
| Custom toast | `toast()` from `sonner` |
| `&nbsp;` or a styled divider | `Separator` |
| Custom `animate-pulse` div | `Skeleton` |
| Custom styled span | `Badge` |

This table is a direct antidote to the "everything is a bespoke div" failure mode.

## Form rules

- Forms use `FieldGroup` + `Field`. **Never** raw `div` with `space-y-*` or `grid gap-*`.
- `InputGroup` uses `InputGroupInput` / `InputGroupTextarea`. Never raw `Input` / `Textarea` inside.
- Buttons inside inputs use `InputGroup` + `InputGroupAddon`.
- Option sets of 2–7 choices use `ToggleGroup`. Don't loop `Button` with manual active state.
- `FieldSet` + `FieldLegend` for grouping checkboxes/radios. Not a `div` with a heading.
- Validation: `data-invalid` on `Field`, `aria-invalid` on the control. Disabled: `data-disabled` on `Field`, `disabled` on the control.

```tsx
<FieldGroup>
  <Field>
    <FieldLabel htmlFor="email">Email</FieldLabel>
    <Input id="email" />
  </Field>
</FieldGroup>

<Field data-invalid>
  <FieldLabel>Email</FieldLabel>
  <Input aria-invalid />
  <FieldDescription>Invalid email.</FieldDescription>
</Field>
```

## Icon rules

- Icons in `Button` use `data-icon="inline-start"` or `data-icon="inline-end"`.
- **No sizing classes on icons inside components.** Components handle icon sizing via CSS. No `size-4`, no `w-4 h-4`.
- Pass icons as objects: `icon={CheckIcon}`, not a string lookup.
- **Never assume `lucide-react`.** Read `iconLibrary` from `shadcn info` — could be `@tabler/icons-react`, `hugeicons`, etc.

```tsx
<Button>
  <SearchIcon data-icon="inline-start" />
  Search
</Button>
```

## Component selection table

| Need | Use |
| --- | --- |
| Button / action | `Button` with a variant |
| Form inputs | `Input`, `Select`, `Combobox`, `Switch`, `Checkbox`, `RadioGroup`, `Textarea`, `InputOTP`, `Slider` |
| Toggle between 2–5 options | `ToggleGroup` + `ToggleGroupItem` |
| Data display | `Table`, `Card`, `Badge`, `Avatar` |
| Navigation | `Sidebar`, `NavigationMenu`, `Breadcrumb`, `Tabs`, `Pagination` |
| Overlays | `Dialog` (modal), `Sheet` (side), `Drawer` (bottom), `AlertDialog` (confirm) |
| Feedback | `sonner`, `Alert`, `Progress`, `Skeleton`, `Spinner` |
| Command palette | `Command` inside `Dialog` |
| Charts | `Chart` (wraps Recharts) |
| Layout | `Card`, `Separator`, `Resizable`, `ScrollArea`, `Accordion`, `Collapsible` |
| Empty states | `Empty` |
| Menus | `DropdownMenu`, `ContextMenu`, `Menubar` |
| Tooltips / info | `Tooltip`, `HoverCard`, `Popover` |
| Chat UI | `MessageScroller`, `Message`, `Bubble`, `Attachment`, `Marker` |

## Project context fields

From `npx shadcn@latest info --json`. These are the fields that stop an agent from guessing:

| Field | Why it matters |
| --- | --- |
| `aliases` | Actual import prefix (`@/`, `~/`). Never hardcode. |
| `isRSC` | If true, components with `useState`/`useEffect`/handlers need `"use client"`. |
| `tailwindVersion` | `v4` → `@theme inline`; `v3` → `tailwind.config.js`. |
| `tailwindCssFile` | The global CSS file. **Always edit this one, never create a new one.** |
| `style` | Visual treatment (`nova`, `vega`, …). |
| `base` | `radix` or `base` — changes component APIs (`asChild` vs `render`). |
| `iconLibrary` | Determines icon imports. |
| `resolvedPaths` | Exact filesystem destinations. |
| `framework` | Next.js App Router vs Vite SPA vs … |
| `packageManager` | For non-shadcn installs. |
| `preset` | Resolved preset code and values. |

## The prescribed workflow

1. Get project context (`shadcn info`).
2. **Check installed components first** — don't re-add, don't import what isn't there.
3. Find components — `shadcn search`.
4. Get docs — `shadcn docs <component>`, then fetch the URLs. The skill is emphatic: *"When creating, fixing, debugging, or using a component, always run `shadcn docs` and fetch the URLs first"* — rather than guessing the API.
5. Install or update — `shadcn add`, with `--dry-run` / `--diff` when updating.
6. Fix imports in third-party components — community registry items often hardcode `@/components/ui/...` which won't match your aliases.
7. **Review added components.** Read the files. Check for missing sub-components, missing imports, wrong composition, rule violations. Swap icon imports to the project's `iconLibrary`.
8. **Registry must be explicit.** If the user doesn't name a registry, *ask*. Never default on their behalf.

Steps 6 and 7 are the ones that get skipped and shouldn't. Registry code is not automatically house-conformant — it is a starting point that needs the same review as generated code.

## Updating components

```bash
npx shadcn@latest add button --dry-run          # what would be touched
npx shadcn@latest add button --diff button.tsx  # upstream vs local
```

- No local changes → safe to overwrite.
- Local changes → read the file, analyze the diff, merge manually.
- **Never `--overwrite` without explicit approval.**
- **Never fetch raw files from GitHub manually** — always use the CLI.
