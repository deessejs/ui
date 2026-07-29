// Phase 4 contract test: type-checks the consumer-facing registry sources in a
// stub consumer project that mirrors a typical shadcn install environment.
// Catches regressions where a ds-<id>.tsx would not compile in a real
// consumer's project (typos in `cn` imports, wrong peer deps, alias drift).
//
// Run by the `contract` job in .github/workflows/ci.yml.

import { spawnSync } from "node:child_process"
import {
  cpSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(HERE, "..", "..", "..")
const SOURCE_DIR = join(REPO_ROOT, "registry", "base-nova")
const REGISTRY_JSON = join(REPO_ROOT, "registry.json")
const SHIM = join(REPO_ROOT, ".contract-test")

rmSync(SHIM, { recursive: true, force: true })
mkdirSync(join(SHIM, "components", "ui"), { recursive: true })
mkdirSync(join(SHIM, "lib"), { recursive: true })

// `cn` shim — mirrors what `shadcn init` writes at `lib/utils.ts` in a consumer
// project. This is the only file the contract test authores against the real
// `cn` semantics; nothing else gets fabricated.
writeFileSync(
  join(SHIM, "lib", "utils.ts"),
  [
    'import { clsx, type ClassValue } from "clsx"',
    'import { twMerge } from "tailwind-merge"',
    "",
    "export function cn(...inputs: ClassValue[]) {",
    "  return twMerge(clsx(inputs))",
    "}",
    "",
  ].join("\n")
)

// Mirror registry sources into the consumer's @/components/ui. We honor each
// item's `target` field from registry.json — the same renaming the shadcn CLI
// applies at install time — so blocks that import other ds-* components
// resolve correctly (`@/components/ui/ds-empty` → `components/ui/ds-empty.tsx`,
// not `components/ui/ds-empty/ds-empty.tsx`).
const catalog = JSON.parse(readFileSync(REGISTRY_JSON, "utf-8"))

function resolveTarget(target) {
  return target
    .replace(/^@ui\//, "components/ui/")
    .replace(/^@components\//, "components/")
    .replace(/^@lib\//, "lib/")
    .replace(/^@hooks\//, "hooks/")
    .replace(/^@\//, "./")
}

for (const item of catalog.items ?? []) {
  for (const file of item.files ?? []) {
    const sourcePath = join(REPO_ROOT, file.path)
    const destPath = join(SHIM, resolveTarget(file.target))
    mkdirSync(dirname(destPath), { recursive: true })
    cpSync(sourcePath, destPath)
  }
}

writeFileSync(
  join(SHIM, "tsconfig.json"),
  JSON.stringify(
    {
      compilerOptions: {
        strict: true,
        target: "ES2022",
        module: "esnext",
        moduleResolution: "bundler",
        jsx: "preserve",
        lib: ["dom", "es2022"],
        noEmit: true,
        paths: { "@/*": ["./*"] },
        skipLibCheck: true,
      },
      include: ["lib/**/*.ts", "components/**/*.tsx"],
    },
    null,
    2
  )
)

writeFileSync(
  join(SHIM, "package.json"),
  JSON.stringify(
    {
      name: "registry-contract-test",
      version: "0.0.0",
      private: true,
      type: "module",
    },
    null,
    2
  )
)

console.log(`[contract-test] shim project at ${SHIM}`)

const install = spawnSync(
  "npm",
  [
    "install",
    "--save-exact",
    "react@^19",
    "react-dom@^19",
    "@types/react@^19",
    "@types/react-dom@^19",
    "@base-ui/react@^1.6.0",
    "class-variance-authority",
    "clsx",
    "tailwind-merge",
    "lucide-react",
    "typescript@^5",
  ],
  { cwd: SHIM, stdio: "pipe", shell: true }
)
if (install.stdout) process.stdout.write(install.stdout)
if (install.stderr) process.stderr.write(install.stderr)
if (install.status !== 0) {
  console.error(`[contract-test] npm install failed (status ${install.status}, signal ${install.signal})`)
  if (install.error) console.error(`[contract-test] error: ${install.error.stack || install.error.message}`)
  process.exit(install.status ?? 1)
}

const tsc = spawnSync("npx", ["tsc", "--noEmit"], {
  cwd: SHIM,
  stdio: "pipe",
  shell: true,
})
if (tsc.stdout) process.stdout.write(tsc.stdout)
if (tsc.stderr) process.stderr.write(tsc.stderr)
if (tsc.status !== 0) {
  console.error(`[contract-test] tsc failed (status ${tsc.status}, signal ${tsc.signal})`)
  if (tsc.error) console.error(`[contract-test] error: ${tsc.error.stack || tsc.error.message}`)
  process.exit(tsc.status ?? 1)
}

console.log("[contract-test] OK")
rmSync(SHIM, { recursive: true, force: true })
