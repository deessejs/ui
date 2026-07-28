// Source code extraction via fs.readFileSync at module load time.
// Server-side only (Next.js server components).
// Resolves paths relative to this file's location, so it works regardless
// of process.cwd() (which varies between `next dev`, `next build`, `turbo dev`).

import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const HERE = dirname(fileURLToPath(import.meta.url))
const SRC_ROOT = join(HERE, "..", "..", "..", "..", "packages", "registry", "src")

function readSource(relativePath: string): string {
  return readFileSync(join(SRC_ROOT, relativePath), "utf-8")
}

export const SOURCES = {
  components: {
    button: readSource("components/button/index.tsx"),
    "icon-button": readSource("components/icon-button/index.tsx"),
  },
  blocks: {} as Record<string, string>,
}