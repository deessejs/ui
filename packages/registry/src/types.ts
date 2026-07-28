export const COMPONENT_CATEGORIES = [
  "buttons",
  "forms",
  "layout",
  "navigation",
  "feedback",
  "overlay",
  "badges",
] as const

export const BLOCK_CATEGORIES = [
  "marketing",
  "application",
  "auth",
  "onboarding",
  "e-commerce",
  "documentation",
] as const

export type ComponentCategoryId = (typeof COMPONENT_CATEGORIES)[number]
export type BlockCategoryId = (typeof BLOCK_CATEGORIES)[number]

export type ComponentMeta = {
  id: string
  name: string
  description: string
  category: ComponentCategoryId
  variants?: string[]
}

export type BlockMeta = {
  id: string
  name: string
  description: string
  category: BlockCategoryId
}