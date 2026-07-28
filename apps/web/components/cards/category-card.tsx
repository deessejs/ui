import type { ReactNode } from "react"

import Link from "next/link"

interface CategoryCardProps {
  href: string
  name: string
  count: number
  preview: ReactNode
  countLabel?: string
  description?: string
}

export function CategoryCard({
  href,
  name,
  count,
  preview,
  countLabel = "items",
  description,
}: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="group bg-background hover:bg-muted/30 flex flex-col overflow-hidden transition-colors"
    >
      <div className="border-b-border flex h-60 items-center justify-center overflow-hidden border-b p-6">
        {preview}
      </div>
      <div className="flex flex-col gap-1 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">{name}</h2>
          <span className="text-muted-foreground font-mono text-xs">
            {count} {countLabel}
          </span>
        </div>
        {description ? (
          <p className="text-muted-foreground line-clamp-2 text-xs">
            {description}
          </p>
        ) : null}
      </div>
    </Link>
  )
}