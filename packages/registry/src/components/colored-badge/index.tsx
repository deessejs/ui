"use client"

import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

export type ColoredBadgeColor =
  | "blue"
  | "green"
  | "red"
  | "yellow"
  | "orange"
  | "purple"
  | "pink"
  | "gray"

const COLOR_CLASSES: Record<ColoredBadgeColor, string> = {
  blue: "bg-blue-600/10 text-blue-500 border-blue-500/20",
  green: "bg-green-500/10 text-green-500 border-green-500/20",
  red: "bg-red-500/10 text-red-500 border-red-500/20",
  yellow: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  orange: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  pink: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  gray: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

export interface ColoredBadgeProps {
  color: ColoredBadgeColor
  children: React.ReactNode
}

export function ColoredBadge({ color, children }: ColoredBadgeProps) {
  return (
    <Badge variant="outline" className={cn(COLOR_CLASSES[color])}>
      {children}
    </Badge>
  )
}

export function ColoredBadgeDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ColoredBadge color="blue">Blue</ColoredBadge>
      <ColoredBadge color="green">Green</ColoredBadge>
      <ColoredBadge color="red">Red</ColoredBadge>
      <ColoredBadge color="yellow">Yellow</ColoredBadge>
      <ColoredBadge color="orange">Orange</ColoredBadge>
      <ColoredBadge color="purple">Purple</ColoredBadge>
      <ColoredBadge color="pink">Pink</ColoredBadge>
      <ColoredBadge color="gray">Gray</ColoredBadge>
    </div>
  )
}