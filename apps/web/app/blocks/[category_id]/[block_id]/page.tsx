import Link from "next/link"

import { CodeBlock } from "@/components/code-block"
import { CategoryNav } from "@/components/nav"
import { ComponentPager } from "@/components/pager"
import {
  getEnrichedBlockCategories,
  findBlockItem,
} from "@/lib/registry"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@workspace/ui/components/empty"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"

type Params = Promise<{ category_id: string; block_id: string }>

export default async function Page({ params }: { params: Params }) {
  const { category_id, block_id } = await params

  const categories = getEnrichedBlockCategories()
  const result = findBlockItem(category_id, block_id)

  if (!result) {
    return (
      <div className="mx-auto flex w-full max-w-7xl px-6 py-16">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Block not found</EmptyTitle>
            <EmptyDescription>
              No block matches{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                {category_id}/{block_id}
              </code>
              .
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link
              href="/blocks"
              className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
            >
              ← Browse all blocks
            </Link>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  const { category, item: block } = result
  const sampleCode = block.source

  const currentIndex = category.items.findIndex((i) => i.id === block.id)
  const previousItem = category.items[currentIndex - 1]
  const nextItem = category.items[currentIndex + 1]
  const previous = previousItem
    ? {
        id: previousItem.id,
        name: previousItem.name,
        href: `/blocks/${category_id}/${previousItem.id}`,
      }
    : undefined
  const next = nextItem
    ? {
        id: nextItem.id,
        name: nextItem.name,
        href: `/blocks/${category_id}/${nextItem.id}`,
      }
    : undefined

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 py-16">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[14rem_1fr] lg:gap-12">
        <CategoryNav
          basePath="/blocks"
          categories={categories}
          activeId={category_id}
        />

        <div className="flex flex-col gap-10">
          <Breadcrumb className="font-mono text-xs">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href="/blocks" />}>
                  blocks
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href={`/blocks/${category.id}`} />}>
                  {category.name.toLowerCase()}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{block.id}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <section className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              {block.name}
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              {block.description}
            </p>
            <p className="text-muted-foreground font-mono text-xs">
              Block {currentIndex + 1} of {category.items.length}
            </p>
          </section>

          <Tabs defaultValue="preview">
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>
            <TabsContent value="preview">
              <div className="border-border/60 bg-muted/10 flex min-h-[400px] flex-col rounded-lg border">
                <div className="border-border/60 flex items-center justify-between border-b px-4 py-2">
                  <span className="text-muted-foreground font-mono text-xs">
                    Preview
                  </span>
                  <span className="text-muted-foreground font-mono text-xs">
                    default
                  </span>
                </div>
                <div className="flex flex-1 items-center justify-center p-12">
                  <div className="text-muted-foreground flex flex-col items-center gap-2 font-mono text-xs">
                    <span className="text-foreground text-sm font-medium">
                      {block.name}
                    </span>
                    <span>rendered block placeholder</span>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="code">
              <div className="border-border/60 overflow-hidden rounded-lg border">
                <div className="border-border/60 flex items-center justify-between bg-muted/30 px-4 py-2">
                  <span className="text-muted-foreground font-mono text-xs">
                    example.tsx
                  </span>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground transition-colors text-xs"
                  >
                    Copy
                  </button>
                </div>
                <CodeBlock code={sampleCode} lang="tsx" />
              </div>
            </TabsContent>
          </Tabs>

          <ComponentPager previous={previous} next={next} />
        </div>
      </div>
    </div>
  )
}