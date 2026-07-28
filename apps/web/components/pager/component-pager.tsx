import Link from "next/link"

import { cn } from "@workspace/ui/lib/utils"

type PagerItem = {
  id: string
  name: string
  href: string
}

interface ComponentPagerProps {
  previous?: PagerItem
  next?: PagerItem
  type?: "component" | "block"
}

function PagerCard({
  side,
  item,
  className,
}: {
  side: "previous" | "next"
  item: PagerItem
  className?: string
}) {
  return (
    <Link
      href={item.href}
      className={cn(
        "border-border/60 hover:border-foreground/20 flex flex-col gap-1 rounded-lg border p-4 transition-colors",
        className
      )}
    >
      <span className="text-muted-foreground font-mono text-xs">
        {side === "previous" ? "← Previous" : "Next →"}
      </span>
      <span className="text-sm font-medium">{item.name}</span>
    </Link>
  )
}

export function ComponentPager({
  previous,
  next,
}: ComponentPagerProps) {
  if (!previous && !next) return null

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3">
      <div>{previous ? <PagerCard side="previous" item={previous} /> : null}</div>
      <div className="sm:text-right">
        {next ? <PagerCard side="next" item={next} /> : null}
      </div>
    </div>
  )
}