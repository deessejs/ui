import {
  Button,
  ButtonDemo,
} from "@workspace/registry/components/button"
import { meta as buttonMeta } from "@workspace/registry/components/button/meta"
import {
  IconButton,
  IconButtonDemo,
} from "@workspace/registry/components/icon-button"
import { meta as iconButtonMeta } from "@workspace/registry/components/icon-button/meta"

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
    ...iconButtonMeta,
    Component: IconButton,
    Demo: IconButtonDemo,
    source: SOURCES.components["icon-button"],
  },
]

const BLOCK_REGISTRY: BlockEntry[] = []

const CATEGORY_LABELS: Record<string, string> = {
  buttons: "Buttons",
  forms: "Forms",
  layout: "Layout",
  navigation: "Navigation",
  feedback: "Feedback",
  overlay: "Overlay",
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
}

export type EnrichedBlockCategory = {
  id: string
  name: string
  description: string
  items: BlockEntry[]
  count: number
}

function enrichComponent(categoryId: string): EnrichedComponentCategory {
  const items = COMPONENT_REGISTRY.filter((c) => c.category === categoryId)
  return {
    id: categoryId,
    name: CATEGORY_LABELS[categoryId] ?? categoryId,
    description: CATEGORY_DESCRIPTIONS[categoryId] ?? "",
    items,
    count: items.length,
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
  }
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