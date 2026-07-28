import Link from "next/link"

import { ItemCard } from "@/components/cards"
import { CategoryNav } from "@/components/nav"
import {
  getEnrichedBlockCategories,
  findBlockCategory,
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

type Params = Promise<{ category_id: string }>

export default async function Page({ params }: { params: Params }) {
  const { category_id } = await params

  const categories = getEnrichedBlockCategories()
  const category = findBlockCategory(category_id)

  if (!category) {
    return (
      <div className="mx-auto flex w-full max-w-7xl px-6 py-16">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Category not found</EmptyTitle>
            <EmptyDescription>
              No category matches{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                {category_id}
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
                <BreadcrumbPage>{category.name.toLowerCase()}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <section className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              {category.name}
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              {category.description}
            </p>
            <p className="text-muted-foreground font-mono text-xs">
              {category.items.length} blocks
            </p>
          </section>

          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {category.items.map((item) => (
              <ItemCard
                key={item.id}
                href={`/blocks/${category_id}/${item.id}`}
                name={item.name}
                description={item.description}
                previewAspect="4/3"
              />
            ))}
          </section>
        </div>
      </div>
    </div>
  )
}