import { toJsxRuntime } from "hast-util-to-jsx-runtime"
import { Fragment } from "react"
import { jsx, jsxs } from "react/jsx-runtime"

import { getHighlighter } from "@/lib/shiki"

type SupportedLang = "tsx" | "typescript" | "jsx" | "javascript"

interface CodeBlockProps {
  code: string
  lang?: SupportedLang
}

export async function CodeBlock({ code, lang = "tsx" }: CodeBlockProps) {
  const highlighter = await getHighlighter()

  const hast = highlighter.codeToHast(code, {
    lang,
    themes: {
      light: "github-light",
      dark: "github-dark",
    },
    defaultColor: false,
  })

  return (
    <div className="bg-muted/10 overflow-x-auto p-4 text-sm [&_code]:font-mono [&_pre]:m-0">
      {toJsxRuntime(hast, {
        Fragment,
        jsx,
        jsxs,
      })}
    </div>
  )
}