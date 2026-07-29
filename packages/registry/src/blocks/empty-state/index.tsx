"use client"

import * as React from "react"

import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@workspace/ui/components/empty"
import { Button as DsButton } from "@workspace/ui/components/button"
import {
  ColoredBadge,
  type ColoredBadgeColor,
} from "@workspace/registry/components/colored-badge"

export interface EmptyStateProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  badge?: { label: string; color: ColoredBadgeColor }
  action?: { label: string; onClick?: () => void }
  className?: string
}

export function EmptyState({
  title = "Nothing here yet",
  description,
  icon,
  badge,
  action,
  className,
}: EmptyStateProps) {
  const hasHeader = icon !== undefined || badge !== undefined
  return (
    <Empty className={className}>
      {hasHeader ? (
        <EmptyHeader>
          {icon && <EmptyMedia variant="icon">{icon}</EmptyMedia>}
          {badge && (
            <ColoredBadge color={badge.color}>{badge.label}</ColoredBadge>
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