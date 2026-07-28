import Link from "next/link"

import { ItemCard } from "@/components/cards"
import { CategoryNav } from "@/components/nav"
import {
  getEnrichedComponentCategories,
  findComponentCategory,
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

  const categories = getEnrichedComponentCategories()
  const category = findComponentCategory(category_id)

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
              href="/components"
              className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
            >
              ← Browse all components
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
          basePath="/components"
          categories={categories}
          activeId={category_id}
        />

        <div className="flex flex-col gap-10">
          <Breadcrumb className="font-mono text-xs">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href="/components" />}>
                  components
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
              {category.items.length} components
            </p>
          </section>

          <section className="border-border grid grid-cols-1 divide-y divide-border border sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
            {category.items.map((item, index) => {
              const spansTwo = index === category.items.length - 1 && category.items.length % 2 === 1
              return (
                <ItemCard
                  key={item.id}
                  href={`/components/${category_id}/${item.id}`}
                  name={item.name}
                  description={item.description}
                  count={item.variants?.length ?? 0}
                  countLabel="variants"
                  preview={<item.Demo />}
                  className={spansTwo ? "sm:col-span-2" : undefined}
                  previewClassName={spansTwo ? "sm:h-60" : undefined}
                />
              )
            })}
          </section>
        </div>
      </div>
    </div>
  )
}