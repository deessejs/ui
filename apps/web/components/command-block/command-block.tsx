"use client"

import { useState } from "react"

interface CommandBlockProps {
  code: string
  label?: string
  showCopy?: boolean
  /**
   * Override the default "Copy" / "Copied" label pair (e.g. for localized
   * UI). The function receives the current state and returns the label.
   */
  copyLabel?: (state: "idle" | "copied") => string
}

export function CommandBlock({
  code,
  label = "bash",
  showCopy = true,
  copyLabel,
}: CommandBlockProps) {
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard API can fail in non-secure contexts; silently ignore —
      // the user can still select-and-copy manually.
    }
  }

  return (
    <div className="border-border/60 overflow-hidden rounded-lg border">
      <div className="border-border/60 flex items-center justify-between bg-muted/30 px-4 py-2">
        <span className="text-muted-foreground font-mono text-xs">
          {label}
        </span>
        {showCopy && (
          <button
            type="button"
            onClick={onCopy}
            className="text-muted-foreground hover:text-foreground transition-colors text-xs"
          >
            {copyLabel
              ? copyLabel(copied ? "copied" : "idle")
              : copied
                ? "Copied"
                : "Copy"}
          </button>
        )}
      </div>
      <pre className="bg-muted/10 overflow-x-auto p-4 text-sm [&_code]:font-mono">
        <code>{code}</code>
      </pre>
    </div>
  )
}
