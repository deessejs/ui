import * as React from "react"

import { cn } from "@/lib/utils"

export interface DsInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const DsInput = React.forwardRef<HTMLInputElement, DsInputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      data-slot="input"
      className={cn(
        "border-input bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex h-8 w-full min-w-0 rounded-lg border px-2.5 py-1 text-sm transition-colors outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        className
      )}
      {...props}
    />
  )
)
DsInput.displayName = "DsInput"
