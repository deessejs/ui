"use client"

import { Button as ShadcnButton } from "@workspace/ui/components/button"

export type ButtonProps = React.ComponentProps<typeof ShadcnButton>

export { ShadcnButton as Button }

export function ButtonDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ShadcnButton variant="default">Default</ShadcnButton>
      <ShadcnButton variant="secondary">Secondary</ShadcnButton>
      <ShadcnButton variant="outline">Outline</ShadcnButton>
      <ShadcnButton variant="ghost">Ghost</ShadcnButton>
      <ShadcnButton variant="destructive">Destructive</ShadcnButton>
    </div>
  )
}