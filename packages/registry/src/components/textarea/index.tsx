"use client"

import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        "border-input bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex field-sizing-content min-h-16 w-full min-w-0 rounded-lg border px-2.5 py-2 text-sm transition-colors outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
)
Textarea.displayName = "Textarea"

export function TextareaDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Textarea placeholder="Default" />
      <Textarea disabled placeholder="Disabled" />
      <Textarea
        aria-invalid="true"
        placeholder="Invalid"
        defaultValue="wrong-value"
      />
    </div>
  )
}
