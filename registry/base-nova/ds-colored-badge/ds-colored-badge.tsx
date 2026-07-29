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
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium",
        COLOR_CLASSES[color],
        className
      )}
    >
      {children}
    </span>
  )
}
