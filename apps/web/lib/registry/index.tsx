import {
  Button,
  ButtonDemo,
} from "@workspace/registry/components/button"
import { meta as buttonMeta } from "@workspace/registry/components/button/meta"
import {
  ColoredBadge,
  ColoredBadgeDemo,
} from "@workspace/registry/components/colored-badge"
import { meta as coloredBadgeMeta } from "@workspace/registry/components/colored-badge/meta"
import {
  IconButton,
  IconButtonDemo,
} from "@workspace/registry/components/icon-button"
import { meta as iconButtonMeta } from "@workspace/registry/components/icon-button/meta"
import {
  Breadcrumb,
  BreadcrumbDemo,
} from "@workspace/registry/components/breadcrumb"
import { meta as breadcrumbMeta } from "@workspace/registry/components/breadcrumb/meta"
import {
  Empty,
  EmptyDemo,
} from "@workspace/registry/components/empty"
import { meta as emptyMeta } from "@workspace/registry/components/empty/meta"
import {
  Tabs,
  TabsDemo,
} from "@workspace/registry/components/tabs"
import { meta as tabsMeta } from "@workspace/registry/components/tabs/meta"
import {
  Input,
  InputDemo,
} from "@workspace/registry/components/input"
import { meta as inputMeta } from "@workspace/registry/components/input/meta"
import {
  Textarea,
  TextareaDemo,
} from "@workspace/registry/components/textarea"
import { meta as textareaMeta } from "@workspace/registry/components/textarea/meta"
import {
  EmptyState,
  EmptyStateBlockDemo,
} from "@workspace/registry/blocks/empty-state"
import { meta as emptyStateMeta } from "@workspace/registry/blocks/empty-state/meta"

import { SOURCES } from "./sources"
import type { ComponentMeta, BlockMeta } from "./types"

type ComponentEntry = ComponentMeta & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: React.ComponentType<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Demo: React.ComponentType<any>
  source: string
}

type BlockEntry = BlockMeta & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Block: React.ComponentType<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Demo: React.ComponentType<any>
  source: string
}

const COMPONENT_REGISTRY: ComponentEntry[] = [
  {
    ...buttonMeta,
    Component: Button,
    Demo: ButtonDemo,
    source: SOURCES.components.button,
  },
  {
    ...coloredBadgeMeta,
    Component: ColoredBadge,
    Demo: ColoredBadgeDemo,
    source: SOURCES.components["colored-badge"],
  },
  {
    ...iconButtonMeta,
    Component: IconButton,
    Demo: IconButtonDemo,
    source: SOURCES.components["icon-button"],
  },
  {
    ...breadcrumbMeta,
    Component: Breadcrumb,
    Demo: BreadcrumbDemo,
    source: SOURCES.components.breadcrumb,
  },
  {
    ...emptyMeta,
    Component: Empty,
    Demo: EmptyDemo,
    source: SOURCES.components.empty,
  },
  {
    ...tabsMeta,
    Component: Tabs,
    Demo: TabsDemo,
    source: SOURCES.components.tabs,
  },
  {
    ...inputMeta,
    Component: Input,
    Demo: InputDemo,
    source: SOURCES.components.input,
  },
  {
    ...textareaMeta,
    Component: Textarea,
    Demo: TextareaDemo,
    source: SOURCES.components.textarea,
  },
]

const BLOCK_REGISTRY: BlockEntry[] = [
  {
    ...emptyStateMeta,
    Block: EmptyState,
    Demo: EmptyStateBlockDemo,
    source: SOURCES.blocks["empty-state"],
  },
]

const CATEGORY_LABELS: Record<string, string> = {
  buttons: "Buttons",
  forms: "Forms",
  layout: "Layout",
  navigation: "Navigation",
  feedback: "Feedback",
  overlay: "Overlay",
  badges: "Badges",
  marketing: "Marketing",
  application: "Application",
  auth: "Auth",
  onboarding: "Onboarding",
  "e-commerce": "E-commerce",
  documentation: "Documentation",
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  buttons: "Action triggers and interactive controls.",
  forms: "Inputs, selects, and field composition.",
  layout: "Containers, grids, and stacking primitives.",
  navigation: "Tabs, breadcrumbs, and step indicators.",
  feedback: "Alerts, toasts, and status indicators.",
  overlay: "Modals, sheets, popovers, and drawers.",
  badges: "Status, count, and category labels.",
  marketing: "Hero, pricing, and feature grids.",
  application: "Settings panels, dashboards, and tables.",
  auth: "Login, signup, and password recovery flows.",
  onboarding: "Empty states and first-use flows.",
  "e-commerce": "Product cards, cart, and checkout.",
  documentation: "Doc pages and code blocks.",
}

export type EnrichedComponentCategory = {
  id: string
  name: string
  description: string
  items: ComponentEntry[]
  count: number
  Preview: React.ComponentType
}

export type EnrichedBlockCategory = {
  id: string
  name: string
  description: string
  items: BlockEntry[]
  count: number
  Preview: React.ComponentType
}

function enrichComponent(categoryId: string): EnrichedComponentCategory {
  const items = COMPONENT_REGISTRY.filter((c) => c.category === categoryId)
  return {
    id: categoryId,
    name: CATEGORY_LABELS[categoryId] ?? categoryId,
    description: CATEGORY_DESCRIPTIONS[categoryId] ?? "",
    items,
    count: items.length,
    Preview: deriveComponentPreview(items),
  }
}

function enrichBlock(categoryId: string): EnrichedBlockCategory {
  const items = BLOCK_REGISTRY.filter((b) => b.category === categoryId)
  return {
    id: categoryId,
    name: CATEGORY_LABELS[categoryId] ?? categoryId,
    description: CATEGORY_DESCRIPTIONS[categoryId] ?? "",
    items,
    count: items.length,
    Preview: deriveBlockPreview(items),
  }
}

/**
 * Derives a category Preview from the items it contains. Picks the first item's
 * Demo so every populated category shows something. Categories with no items
 * are filtered out by callers (the index page only renders categories with count > 0).
 */
function deriveComponentPreview(items: ComponentEntry[]): React.ComponentType {
  const First = items[0]!
  const Demo = First.Demo
  return () => <Demo />
}

function deriveBlockPreview(items: BlockEntry[]): React.ComponentType {
  const First = items[0]!
  const Demo = First.Demo
  return () => <Demo />
}

export function getEnrichedComponentCategories(): EnrichedComponentCategory[] {
  return Array.from(
    new Set(COMPONENT_REGISTRY.map((c) => c.category))
  ).map(enrichComponent)
}

export function getEnrichedBlockCategories(): EnrichedBlockCategory[] {
  return Array.from(
    new Set(BLOCK_REGISTRY.map((b) => b.category))
  ).map(enrichBlock)
}

export function findComponentCategory(
  id: string
): EnrichedComponentCategory | null {
  if (!CATEGORY_LABELS[id]) return null
  return enrichComponent(id)
}

export function findBlockCategory(
  id: string
): EnrichedBlockCategory | null {
  if (!CATEGORY_LABELS[id]) return null
  return enrichBlock(id)
}

export function findComponentItem(
  categoryId: string,
  itemId: string
): { category: EnrichedComponentCategory; item: ComponentEntry } | null {
  const category = findComponentCategory(categoryId)
  if (!category) return null
  const item = category.items.find((i) => i.id === itemId)
  return item ? { category, item } : null
}

export function findBlockItem(
  categoryId: string,
  itemId: string
): { category: EnrichedBlockCategory; item: BlockEntry } | null {
  const category = findBlockCategory(categoryId)
  if (!category) return null
  const item = category.items.find((i) => i.id === itemId)
  return item ? { category, item } : null
}