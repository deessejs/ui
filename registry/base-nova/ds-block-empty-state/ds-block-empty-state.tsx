"use client"

import * as React from "react"

import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/ds-empty"
import { DsButton } from "@/components/ui/ds-button"
import {
  DsColoredBadge,
  type DsColoredBadgeColor,
} from "@/components/ui/ds-colored-badge"
import { cn } from "@/lib/utils"

export interface DsEmptyStateProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  badge?: { label: string; color: DsColoredBadgeColor }
  action?: { label: string; onClick?: () => void }
  className?: string
}

export function DsEmptyState({
  title = "Nothing here yet",
  description,
  icon,
  badge,
  action,
  className,
}: DsEmptyStateProps) {
  const hasHeader = icon !== undefined || badge !== undefined
  return (
    <Empty className={cn(className)}>
      {hasHeader ? (
        <EmptyHeader>
          {icon && <EmptyMedia variant="icon">{icon}</EmptyMedia>}
          {badge && (
            <DsColoredBadge color={badge.color}>{badge.label}</DsColoredBadge>
          )}
          <EmptyTitle>{title}</EmptyTitle>
          {description && <EmptyDescription>{description}</EmptyDescription>}
        </EmptyHeader>
      ) : (
        <>
          <EmptyTitle>{title}</EmptyTitle>
          {description && <EmptyDescription>{description}</EmptyDescription>}
        </>
      )}
      {action && (
        <EmptyContent>
          <DsButton onClick={action.onClick}>{action.label}</DsButton>
        </EmptyContent>
      )}
    </Empty>
  )
}