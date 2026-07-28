import Link from "next/link"

import { cn } from "@workspace/ui/lib/utils"

interface ItemCardProps {
  href: string
  name: string
  description?: string
  count?: number
  countLabel?: string
  previewAspect?: "square" | "4/3"
}

export function ItemCard({
  href,
  name,
  description,
  count,
  countLabel,
  previewAspect = "square",
}: ItemCardProps) {
  return (
    <Link
      href={href}
      className="border-border/60 bg-card hover:border-foreground/20 group flex flex-col overflow-hidden rounded-lg border transition-colors"
    >
      <div
        className={cn(
          "bg-muted/30",
          previewAspect === "square" ? "aspect-square" : "aspect-[4/3]"
        )}
      />
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
          <p
            className={cn(
              "text-muted-foreground text-xs",
              previewAspect === "square" ? "line-clamp-1" : "line-clamp-2"
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
    </Link>
  )
}