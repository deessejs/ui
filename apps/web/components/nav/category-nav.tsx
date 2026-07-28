import Link from "next/link"

import { cn } from "@workspace/ui/lib/utils"

type CategoryNavItem = {
  id: string
  name: string
  count: number
}

interface CategoryNavProps {
  basePath: "/components" | "/blocks"
  categories: CategoryNavItem[]
  activeId?: string
  label?: string
}

export function CategoryNav({
  basePath,
  categories,
  activeId,
  label = "Categories",
}: CategoryNavProps) {
  return (
    <nav aria-label={label} className="flex flex-col gap-1">
      <h2 className="text-muted-foreground mb-2 px-3 text-xs font-medium uppercase tracking-wide">
        {label}
      </h2>
      {categories.map((cat) => {
        const isActive = cat.id === activeId
        return (
          <Link
            key={cat.id}
            href={`${basePath}/${cat.id}`}
            className={cn(
              "flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <span>{cat.name}</span>
            <span className="font-mono text-xs">{cat.count}</span>
          </Link>
        )
      })}
    </nav>
  )
}