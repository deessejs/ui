import Link from "next/link"

import { cn } from "@workspace/ui/lib/utils"

interface CategoryCardProps {
  href: string
  name: string
  count: number
  countLabel?: string
  description?: string
  previewAspect?: "4/3" | "video"
}

export function CategoryCard({
  href,
  name,
  count,
  countLabel = "items",
  description,
  previewAspect = "4/3",
}: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="border-border/60 bg-card hover:border-foreground/20 group flex flex-col overflow-hidden rounded-lg border transition-colors"
    >
      <div
        className={cn(
          "bg-muted/30",
          previewAspect === "video" ? "aspect-video" : "aspect-[4/3]"
        )}
      />
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