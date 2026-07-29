// Drift detection between the consumer-facing source tree
// (registry/base-nova/), the showcase tree (packages/registry/...), and
// optionally the workspace source (packages/ui/...). Run as part of CI
// to catch silent divergence introduced by edits to either side
// without a corresponding update on the other.
//
// Tolerance policy: docs/plans/2026-07-29-drift-detection.md.
// Audit input:    docs/registry/audit-2026-07-29.json
// (snapshot from initial classification — the script does NOT re-derive
// it; new items require a manual audit update before this script will
// cover them).

import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(HERE, "..", "..", "..")

function read(path) {
  return readFileSync(path, "utf-8")
}

// Strip block comments, line comments, and collapse whitespace. Used
// to make textual comparisons robust to formatting drift.
function strip(s) {
  return s
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "")
    .replace(/\s+/g, " ")
    .trim()
}

function pass(reason) {
  console.log(`  PASS ${reason}`)
  return true
}

function fail(reason, detail = "") {
  console.error(`  FAIL ${reason}`)
  if (detail) console.error(`       ${detail}`)
  return false
}

const audit = JSON.parse(read(join(REPO_ROOT, "docs/registry/audit-2026-07-29.json")))
const catalog = JSON.parse(read(join(REPO_ROOT, "registry.json")))

let allOk = true

for (const item of catalog.items) {
  console.log(`\n[${item.name}]`)

  const entry = audit.items[item.name]
  if (!entry) {
    allOk = fail(
      "no audit entry",
      `rerun docs/registry/audit-2026-07-29.{md,json} for new items before they ship`
    ) && allOk
    continue
  }

  const consumerPath = join(REPO_ROOT, entry["consumer-path"])
  const showcasePath = join(REPO_ROOT, entry["showcase-path"])
  const workspacePath = entry["workspace-source-path"]
    ? join(REPO_ROOT, entry["workspace-source-path"])
    : null

  const consumerSrc = strip(read(consumerPath))
  const showcaseSrc = strip(read(showcasePath))
  const workspaceSrc = workspacePath ? strip(read(workspacePath)) : null

  // --- Check 1: workspace source ↔ consumer cva() equivalence ---
  // Applies when a workspace source exists. The drift audit marked
  // ds-button as the only item with a workspace source carrying a
  // comparable cva() today.
  if (workspaceSrc) {
    const wsCvas = []
    const csCvas = []
    const wsRe = /(?:export\s+)?const\s+(\w+)\s*=\s*cva\s*\(([\s\S]+?)\)\s*;/g
    const csRe = /(?:export\s+)?const\s+(\w+)\s*=\s*cva\s*\(([\s\S]+?)\)\s*;/g
    let m
    while ((m = wsRe.exec(workspaceSrc))) wsCvas.push({ name: m[1], body: strip(m[2]) })
    while ((m = csRe.exec(consumerSrc))) csCvas.push({ name: m[1], body: strip(m[2]) })

    for (const ws of wsCvas) {
      const cs = csCvas.find((c) => c.name === ws.name)
      if (!cs) {
        allOk = fail(
          `cva "${ws.name}" exists in workspace source but not in consumer`,
          `Add the same cva() definition to ${entry["consumer-path"]} or update the audit if intentional.`
        ) && allOk
        continue
      }
      if (ws.body !== cs.body) {
        allOk = fail(
          `cva "${ws.name}" body differs between workspace source and consumer`,
          `diff base+options:\n  ws: ${ws.body.slice(0, 200)}...\n  cs: ${cs.body.slice(0, 200)}...`
        ) && allOk
      } else {
        allOk = pass(`cva "${ws.name}" matches between workspace source and consumer`)
      }
    }
  }

  // --- Check 2: showcase re-export sanity for workspace-backed items ---
  // The showcase tree should re-export the workspace component, so
  // visual updates to the workspace source propagate automatically.
  if (workspaceSrc && item.name === "ds-button") {
    allOk = (/from\s+["']@workspace\/ui\/components\/button["']/.test(read(showcasePath))
      ? pass(`showcase tree re-exports from @workspace/ui/components/button`)
      : fail(`showcase tree does not re-export from @workspace/ui/components/button`,
             `Edit ${entry["showcase-path"]} so its import target is the workspace source.`)) && allOk
  }

  // --- Check 3: ds-icon-button size mapping parity ---
  // Showcase uses `SIZE_CLASSES` (typed map); consumer uses
  // `iconButtonVariants` cva. Both should encode the same size → size-N
  // mapping for sm/md/lg.
  if (item.name === "ds-icon-button") {
    const showcaseSizes = strip(
      String(read(showcasePath).match(/const\s+SIZE_CLASSES[^=]*=\s*\{([\s\S]+?)\}\s*;?/)?.[1] || "")
    )
    const consumerSizes = strip(
      String(read(consumerPath).match(/variants:\s*\{\s*size:\s*\{([\s\S]+?)\}\s*,/)?.[1] || "")
    )
    if (!showcaseSizes || !consumerSizes) {
      allOk = fail(
        "could not extract size maps",
        `showcase found: ${!!showcaseSizes}, consumer found: ${!!consumerSizes}`
      ) && allOk
    } else if (showcaseSizes !== consumerSizes) {
      allOk = fail(
        "size mapping differs between showcase SIZE_CLASSES and consumer iconButtonVariants",
        `showcase: ${showcaseSizes}\nconsumer: ${consumerSizes}`
      ) && allOk
    } else {
      allOk = pass(`size mapping matches between showcase and consumer`)
    }
  }

  // --- Check 4: ds-colored-badge COLOR_CLASSES parity ---
  // Both trees carry a typed `COLOR_CLASSES = { blue: '...', green: '...', ... }`.
  // They must be byte-identical (modulo whitespace) — any drift is a
  // visual regression because the same color maps to different
  // Tailwind classes between showcase and consumer.
  if (item.name === "ds-colored-badge") {
    const showcaseColors = strip(
      String(read(showcasePath).match(/const\s+COLOR_CLASSES[^=]*=\s*\{([\s\S]+?)\}\s*;?/)?.[1] || "")
    )
    const consumerColors = strip(
      String(read(consumerPath).match(/const\s+COLOR_CLASSES[^=]*=\s*\{([\s\S]+?)\}\s*;?/)?.[1] || "")
    )
    if (!showcaseColors || !consumerColors) {
      allOk = fail(
        "could not extract COLOR_CLASSES",
        `showcase found: ${!!showcaseColors}, consumer found: ${!!consumerColors}`
      ) && allOk
    } else if (showcaseColors !== consumerColors) {
      allOk = fail(
        "COLOR_CLASSES differs between showcase and consumer",
        `showcase: ${showcaseColors}\nconsumer: ${consumerColors}`
      ) && allOk
    } else {
      allOk = pass(`COLOR_CLASSES matches between showcase and consumer`)
    }
  }
}

if (!allOk) {
  console.error("\nDrift detected.")
  process.exit(1)
}
console.log("\nNo drift detected.")
