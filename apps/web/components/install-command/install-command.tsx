import { CodeBlock } from "@/components/code-block"

interface InstallCommandProps {
  itemId: string
}

export function InstallCommand({ itemId }: InstallCommandProps) {
  const shadcnId = itemId.replace(/^ds-/, "")
  const githubCmd = `npx shadcn@latest add deessejs/ui/${itemId}`
  const urlCmd = `npx shadcn@latest add https://ui.deessejs.com/r/${shadcnId}.json`
  const namespaceSetup = `npx shadcn@latest registry add @deessejs=https://ui.deessejs.com/r/{name}.json`
  const namespaceUse = `npx shadcn@latest add @deessejs/${itemId}`

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-medium">Install</h2>
      </div>
      <p className="text-muted-foreground text-sm">
        Add this component to your project with the shadcn CLI. Pick the
        mode that matches how you installed the registry.
      </p>
      <CodeBlock code={githubCmd} lang="bash" />
      <details className="text-muted-foreground text-sm">
        <summary className="cursor-pointer select-none">
          Other install modes
        </summary>
        <div className="mt-3 flex flex-col gap-4 pl-1">
          <div className="flex flex-col gap-2">
            <p className="text-xs">
              URL mode — works against the deployed showcase site:
            </p>
            <CodeBlock code={urlCmd} lang="bash" />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs">
              Namespace mode — register once, then any item by short name:
            </p>
            <CodeBlock code={namespaceSetup} lang="bash" />
            <CodeBlock code={namespaceUse} lang="bash" />
          </div>
        </div>
      </details>
    </section>
  )
}
