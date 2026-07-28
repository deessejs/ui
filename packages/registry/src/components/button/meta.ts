import type { ComponentMeta } from "../../types.ts"

export const meta: ComponentMeta = {
  id: "button",
  name: "Button",
  description: "Default button with variants.",
  category: "buttons",
  variants: ["default", "secondary", "outline", "ghost", "destructive", "link"],
}