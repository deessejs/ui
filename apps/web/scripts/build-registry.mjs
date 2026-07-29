// Build-time registry JSON emission.
// Reads the repo-root registry.json and the source files referenced in each
// item's `files[]`, then emits one self-contained JSON per item plus a catalog
// at `apps/web/public/r/`. The shadcn CLI fetches these directly (URL mode),
// and the same artifacts are valid GitHub-registry payloads for GitHub mode.
//
// Run via `registry:build` (or chained through `prebuild`) in
// apps/web/package.json.

import {
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(HERE, "..", "..", "..")
const REGISTRY_JSON = join(REPO_ROOT, "registry.json")
const OUT_DIR = join(HERE, "..", "public", "r")

function readJSON(path) {
  return JSON.parse(readFileSync(path, "utf-8"))
}

mkdirSync(OUT_DIR, { recursive: true })

const catalog = readJSON(REGISTRY_JSON)
const emittedItems = []

for (const item of catalog.items ?? []) {
  const itemPayload = {
    ...item,
    files: (item.files ?? []).map((file) => ({
      ...file,
      // File contents live in the consumer-facing source tree (registry/base-nova/...).
      // Resolve relative to repo root because `path` is repo-relative in registry.json.
      content: readFileSync(join(REPO_ROOT, file.path), "utf-8"),
    })),
  }

  writeFileSync(
    join(OUT_DIR, `${item.name}.json`),
    JSON.stringify(itemPayload, null, 2) + "\n",
    "utf-8"
  )
  emittedItems.push(item.name)
}

// Catalog: items without file content inlined. The CLI uses this for `list`
// and `search`; `view` and `add` fetch the per-item JSON.
writeFileSync(
  join(OUT_DIR, "registry.json"),
  JSON.stringify(catalog, null, 2) + "\n",
  "utf-8"
)

console.log(
  `[build-registry] wrote ${OUT_DIR} (catalog + ${
    emittedItems.length
  } items: ${emittedItems.join(", ") || "none"})`
)
