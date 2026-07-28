import type { ReactNode } from "react"

import Link from "next/link"

import { cn } from "@workspace/ui/lib/utils"

interface ItemCardProps {
  href: string
  name: string
  preview: ReactNode
  description?: string
  count?: number
  countLabel?: string
  className?: string
  previewClassName?: string
}

export function ItemCard({
  href,
  name,
  preview,
  description,
  count,
  countLabel,
  className,
  previewClassName,
}: ItemCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group bg-background hover:bg-muted/30 flex flex-col overflow-hidden transition-colors",
        className
      )}
    >
      <div
        className={cn(
          "border-b-border flex items-center justify-center overflow-hidden border-b p-6",
          "h-60 sm:aspect-square",
          previewClassName
        )}
      >
        {preview}
      </div>
      <div className="flex flex-col gap-1 p-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium">{name}</h3>
          {count !== undefined && countLabel ? (
            <span className="text-muted-foreground font-mono text-xs">
              {count} {countLabel}
            </span>
          ) : null}
        </div>
        {description ? (
          <p className="text-muted-foreground line-clamp-1 text-xs">
            {description}
          </p>
        ) : null}
      </div>
    </Link>
  )
}