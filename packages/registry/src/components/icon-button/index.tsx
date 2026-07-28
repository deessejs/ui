"use client"

import { Button as ShadcnButton } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

export interface IconButtonProps
  extends Omit<React.ComponentProps<typeof ShadcnButton>, "children" | "size"> {
  "aria-label": string
  children: React.ReactNode
  size?: "sm" | "md" | "lg"
}

const SIZE_CLASSES: Record<NonNullable<IconButtonProps["size"]>, string> = {
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
}

export function IconButton({
  className,
  size = "md",
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <ShadcnButton
      type={type}
      size="icon"
      className={cn(SIZE_CLASSES[size], className)}
      {...props}
    />
  )
}

export function IconButtonDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <IconButton aria-label="Add" size="sm">
        +
      </IconButton>
      <IconButton aria-label="Edit" size="md">
        ✎
      </IconButton>
      <IconButton aria-label="Delete" size="lg">
        ×
      </IconButton>
    </div>
  )
}