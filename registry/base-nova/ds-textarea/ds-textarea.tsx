import * as React from "react"

import { cn } from "@/lib/utils"

export interface DsTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const DsTextarea = React.forwardRef<
  HTMLTextAreaElement,
  DsTextareaProps
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    data-slot="textarea"
    className={cn(
      "border-input bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex field-sizing-content min-h-16 w-full min-w-0 rounded-lg border px-2.5 py-2 text-sm transition-colors outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20",
      className
    )}
    {...props}
  />
))
DsTextarea.displayName = "DsTextarea"
