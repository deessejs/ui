"use client"

import {
  Empty as ShadcnEmpty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@workspace/ui/components/empty"

export {
  ShadcnEmpty as Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
}

export function EmptyDemo() {
  return (
    <ShadcnEmpty>
      <EmptyHeader>
        <EmptyMedia variant="icon">⊙</EmptyMedia>
        <EmptyTitle>No projects yet</EmptyTitle>
        <EmptyDescription>
          Create your first project to start tracking work.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <button
          type="button"
          className="bg-primary text-primary-foreground hover:bg-primary/80 inline-flex h-8 items-center rounded-md px-3 text-sm font-medium transition-colors"
        >
          Create project
        </button>
      </EmptyContent>
    </ShadcnEmpty>
  )
}
