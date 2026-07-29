"use client"

import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
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
Input.displayName = "Input"

export function InputDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Input placeholder="Default" />
      <Input type="email" placeholder="Email" />
      <Input type="file" />
      <Input disabled placeholder="Disabled" />
      <Input
        aria-invalid="true"
        placeholder="Invalid"
        defaultValue="wrong-value"
      />
    </div>
  )
}
