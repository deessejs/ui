import { CategoryCard } from "@/components/cards"
import { CategoryNav } from "@/components/nav"
import { getEnrichedComponentCategories } from "@/lib/registry"

const CATEGORIES = getEnrichedComponentCategories().filter(
  (c) => c.count > 0,
)
const TOTAL_COUNT = CATEGORIES.reduce((sum, c) => sum + c.count, 0)

export default function Page() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 py-16">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[14rem_1fr] lg:gap-12">
        <CategoryNav basePath="/components" categories={CATEGORIES} />

        <div className="flex flex-col gap-10">
          <section className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">Components</h1>
            <p className="text-muted-foreground max-w-2xl">
              The DeesseJS.com component library.
            </p>
            <p className="text-muted-foreground font-mono text-xs">
              {TOTAL_COUNT} components across {CATEGORIES.length} categories.
            </p>
          </section>

          <section className="border-border grid grid-cols-1 divide-y divide-border border sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
            {CATEGORIES.map((category) => (
              <CategoryCard
                key={category.id}
                href={`/components/${category.id}`}
                name={category.name}
                count={category.count}
                description={category.description}
                preview={<category.Preview />}
              />
            ))}
          </section>
        </div>
      </div>
    </div>
  )
}