"use client"

import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const iconButtonVariants = cva("", {
  variants: {
    size: {
      sm: "size-8",
      md: "size-10",
      lg: "size-12",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

export interface DsIconButtonProps
  extends ButtonPrimitive.Props,
    VariantProps<typeof iconButtonVariants> {
  "aria-label": string
  className?: string
  children: React.ReactNode
}

function DsIconButton({
  className,
  size,
  type = "button",
  children,
  ...props
}: DsIconButtonProps) {
  return (
    <ButtonPrimitive
      type={type}
      data-slot="icon-button"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/80",
        iconButtonVariants({ size }),
        className
      )}
      {...props}
    >
      {children}
    </ButtonPrimitive>
  )
}

export { DsIconButton, iconButtonVariants as dsIconButtonVariants }
