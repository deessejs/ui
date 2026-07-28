import Link from "next/link"

import { CategoryCard } from "@/components/cards"
import { ItemCard } from "@/components/cards"
import {
  getEnrichedBlockCategories,
  getEnrichedComponentCategories,
} from "@/lib/registry"

const COMPONENT_CATEGORIES = getEnrichedComponentCategories()
const POPULATED_COMPONENT_CATEGORIES = COMPONENT_CATEGORIES.filter(
  (c) => c.count > 0,
)
const FEATURED_COMPONENTS = COMPONENT_CATEGORIES.flatMap((c) => c.items).slice(
  0,
  6,
)

export default function Page() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col">
      {/* HERO — sparse, dominant anchor */}
      <section className="flex flex-col gap-12 px-6 pt-24 pb-24">
        <h1 className="text-7xl font-semibold tracking-tight">DeesseJS UI</h1>
        <div className="flex max-w-xl flex-col gap-8">
          <p className="text-muted-foreground text-base leading-relaxed">
            Component registry for DeesseJS.com. Real components, live preview,
            source shown verbatim.
          </p>
          <div>
            <Link
              href="/components"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center rounded-md px-4 text-sm font-medium transition-colors"
            >
              Browse components →
            </Link>
          </div>
        </div>
      </section>

      {/* MACRO FRAME — divider between hero and content */}
      <div className="border-t border-border" />

      {/* FEATURED — dense, contained */}
      {FEATURED_COMPONENTS.length > 0 && (
        <section className="flex flex-col gap-6 px-6 pt-16 pb-24">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-medium">Featured</h2>
            <span className="text-muted-foreground font-mono text-xs">
              {FEATURED_COMPONENTS.length} of{" "}
              {COMPONENT_CATEGORIES.reduce((sum, c) => sum + c.count, 0)}
            </span>
          </div>

          <div className="border-border grid grid-cols-1 divide-y divide-border border sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
            {FEATURED_COMPONENTS.map((item, index) => {
              const category = COMPONENT_CATEGORIES.find((c) =>
                c.items.some((i) => i.id === item.id),
              )
              const spansTwo =
                index === FEATURED_COMPONENTS.length - 1 &&
                FEATURED_COMPONENTS.length % 2 === 1
              return (
                <ItemCard
                  key={item.id}
                  href={category ? `/components/${category.id}/${item.id}` : "#"}
                  name={item.name}
                  description={item.description}
                  count={item.variants?.length ?? 0}
                  countLabel="variants"
                  preview={<item.Demo />}
                  className={
                  spansTwo ? "sm:col-span-2 sm:border-t sm:border-border" : undefined
                }
                  previewClassName={spansTwo ? "sm:h-60" : undefined}
                />
              )
            })}
          </div>
        </section>
      )}

      {/* CATEGORIES — light inventory list */}
      {POPULATED_COMPONENT_CATEGORIES.length > 0 && (
        <section className="flex flex-col gap-6 px-6 pt-16 pb-24">
          <h2 className="text-sm font-medium">Categories</h2>
          <ul className="text-muted-foreground font-mono text-xs">
            {POPULATED_COMPONENT_CATEGORIES.map((category) => (
              <li
                key={category.id}
                className="border-b border-border flex items-baseline justify-between py-3 last:border-b-0"
              >
                <Link
                  href={`/components/${category.id}`}
                  className="text-foreground hover:text-primary transition-colors"
                >
                  {category.name}
                </Link>
                <span>{category.count} items</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="border-t border-border" />
    </div>
  )
}