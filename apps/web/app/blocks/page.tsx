import { CategoryCard } from "@/components/cards"
import { CategoryNav } from "@/components/nav"
import { getEnrichedBlockCategories } from "@/lib/registry"

const CATEGORIES = getEnrichedBlockCategories()
const TOTAL_COUNT = CATEGORIES.reduce((sum, c) => sum + c.count, 0)

export default function Page() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 py-16">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[14rem_1fr] lg:gap-12">
        <CategoryNav basePath="/blocks" categories={CATEGORIES} />

        <div className="flex flex-col gap-10">
          <section className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">Blocks</h1>
            <p className="text-muted-foreground max-w-2xl">
              Composed UI blocks built from the component library.
            </p>
            <p className="text-muted-foreground font-mono text-xs">
              {TOTAL_COUNT} blocks across {CATEGORIES.length} categories.
            </p>
          </section>

          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {CATEGORIES.map((category) => (
              <CategoryCard
                key={category.id}
                href={`/blocks/${category.id}`}
                name={category.name}
                count={category.count}
                description={category.description}
                previewAspect="video"
              />
            ))}
          </section>
        </div>
      </div>
    </div>
  )
}