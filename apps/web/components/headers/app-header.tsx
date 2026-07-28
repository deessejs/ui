import Link from "next/link"

import { cn } from "@workspace/ui/lib/utils"

export function AppHeader({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "border-border/60 flex h-14 items-center justify-between border-b px-6",
        className,
      )}
    >
      <div className="flex items-center gap-6">
        <Link href="/" className="font-medium tracking-tight">
          DeesseJS UI
        </Link>
        <nav
          aria-label="Primary"
          className="text-muted-foreground hidden items-center gap-4 text-sm sm:flex"
        >
          <Link
            href="/components"
            className="hover:text-foreground transition-colors"
          >
            Components
          </Link>
          <Link
            href="/blocks"
            className="hover:text-foreground transition-colors"
          >
            Blocks
          </Link>
        </nav>
      </div>
      <span className="text-muted-foreground font-mono text-xs">
        ui.deessejs.com
      </span>
    </header>
  )
}
