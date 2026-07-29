import * as React from "react"

import { cn } from "@/lib/utils"

export type DsColoredBadgeColor =
  | "blue"
  | "green"
  | "red"
  | "yellow"
  | "orange"
  | "purple"
  | "pink"
  | "gray"

const COLOR_CLASSES: Record<DsColoredBadgeColor, string> = {
  blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  green: "bg-green-500/10 text-green-500 border-green-500/20",
  red: "bg-red-500/10 text-red-500 border-red-500/20",
  yellow: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  orange: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  pink: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  gray: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

// Inlined from packages/ui/src/components/badge.tsx so the consumer's
// installed copy renders the same visual as the showcase, which wraps
// the workspace Badge primitive (variant="outline" + color overlay).
// Drift note: if the workspace Badge primitive updates, this class
// string must be re-pasted. The drift-detection script in
// docs/plans/2026-07-29-drift-detection.md will fail on the mismatch
// once Phase 2 lands.
const BADGE_BASE =
  "inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!"

const BADGE_OUTLINE =
  "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground"

export interface DsColoredBadgeProps {
  color: DsColoredBadgeColor
  className?: string
  children: React.ReactNode
}

export function DsColoredBadge({
  color,
  className,
  children,
}: DsColoredBadgeProps) {
  return (
    <span
      className={cn(
        BADGE_BASE,
        BADGE_OUTLINE,
        COLOR_CLASSES[color],
        className
      )}
    >
      {children}
    </span>
  )
}
