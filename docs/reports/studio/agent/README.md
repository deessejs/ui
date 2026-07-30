---
title: The agent contract
date: 2026-07-30
status: decisions locked
---

# The agent contract

**Constrained by:** decision 4 (both a CLI and an MCP server over one core library), decision 1 (the
agent runs locally), decision 2 (the agent writes no files).

The agent is the author. This is the only interface it has.

---

## One core, two façades

```
@workspace/studio-core        the logic: validate, transpile, compile, persist
   ├── CLI       ds-studio <command>      → 02-cli.md
   └── MCP       stdio server, tools      → 03-mcp.md
```

Both façades are thin. Neither may hold logic the other lacks — the moment one of them validates
something the other does not, there are two contracts and the agent's behaviour depends on which
transport it happened to pick.

The division of labour:

| Layer | Owns |
|---|---|
| core | validators, sucrase, Tailwind `compile()`, oRPC calls, the shape of `errors[]` |
| CLI | argument parsing, exit codes, human-readable output |
| MCP | tool schemas, JSON payloads |

The **MCP schemas are the contract** — they are what a model reads to decide what is possible. The
**CLI is the debuggable surface** — it is what a human runs when the agent's behaviour makes no sense.
Both matter, for different readers.

---

## The write loop

```
agent (local) → CLI or MCP → oRPC saveVersion()
  → write-path validators                           ← the only gate that now exists
  → sucrase transpile        → compiled_js
  → tailwind compile         → compiled_css
  → insert immutable version row, advance head_version_id
  → returns { versionId, previewUrl, errors[] }
  → maintainer's browser iframe swaps to the new versionId
```

Latency is a database write plus two compiles — tens of milliseconds. Nothing touches git, Vercel, or a
bundler. That is the entire point of decision 2: the loop is fast because it is short.

Validators run **before** transpilation, so a token-discipline failure does not pay for a compile.
Transpilation runs before CSS compilation, because the candidate list for `compile()` is extracted from
source that has already been proven to parse.

---

## `saveVersion` is the whole write surface

One mutation. It takes a complete version, not a patch:

```
saveVersion({
  name,                    // ds-*, kebab-case
  kind,                    // component | block
  category,                // one of the 13 ids in packages/registry/src/types.ts
  title, description,
  variants?,
  source,                  // the self-contained component
  demoSource,              // the showcase Demo
  manifest: {
    dependencies[],        // npm; must match bare-module imports in source
    registryDependencies[],// ds-* names; must match @/components/ui/* imports in source
    files: [{ target }],
  },
})
```

No partial update, no `patchSource`, no `setCategory`. Every save is a complete version because version
rows are immutable — see [01-data-model.md](../01-data-model.md#immutability). An agent that wants to
change one line reads the current version, edits it, and saves the whole thing. That is more bytes over
the wire and it removes the entire question of how to merge concurrent partial edits.

Creating an item and revising it are the same call. If `name` does not exist, `saveVersion` creates the
`registry_item` row as `draft` with `n = 1`.

### Who owns the `manifest` content

The chicken-and-egg: who is the source of truth for `manifest.dependencies[]` and
`manifest.registryDependencies[]` — the agent that provides it, or the validator that derives it
from `source`?

**The agent provides it; the validator verifies it.** Reasoning:

- **Validation requires a comparison, not a derivation.** Validator #7's job is to catch the case
  where the declared `dependencies[]` does not match the actual imports. If the validator derived the
  list, there is nothing to compare — the failure mode that validator #7 exists to prevent becomes
  impossible to express.
- **The agent already knows what it imported.** Composing the manifest is mechanical: scan `source`
  for bare-module imports, scan for `@/components/ui/ds-*` imports, package them into the manifest
  shape. The agent's tools already do this in CI today (`build-registry.mjs` projects the same
  fields); replicating the logic in the agent's compose step is straightforward.
- **The agent also knows `files[].target`.** The target alias (`@ui/`, `@components/`, `@/`) is a
  choice the agent makes based on what kind of file it is. Deriving it from the file path would mean
  re-deriving the agent's intent.
- **The published registry entry is a projection of `manifest`.** If the manifest is the truth and
  the registry entry is a view of it, every downstream consumer reads the same fields. Reversing the
  relationship — deriving the manifest from the registry entry — would create a circular dependency
  on `registry.json` at save time.

**What the agent does *not* own:** the validator enforces that what the agent provides is internally
consistent. A draft where `source` imports `date-fns` and `manifest.dependencies[]` does not declare
it fails validator #2 (import not in allow-list) and validator #7 (manifest mismatch). The agent
fixes both by aligning the manifest with the source. The system does not auto-correct; the agent
gets a structured error and acts on it.

This split is the reason validator #7's `errors[]` includes `found` (declared) and `expected`
(imported), and the direction of the mismatch. The agent owns the content; the system owns the
agreement check.

---

## The `errors[]` return is what makes unattended iteration possible

```
{ versionId, previewUrl, errors: [] }        // saved and renderable
{ versionId, previewUrl, errors: [ … ] }     // saved, not renderable
{ versionId: null, errors: [ … ] }           // rejected, nothing written
```

Three cases, and the distinction between the second and third is deliberate:

- **Hard failures reject the write.** Validator failures, a source that sucrase cannot parse, an import
  outside the allow-list. Nothing is persisted; there is no half-valid version row to reason about.
- **Soft failures persist but do not render.** The main case is decision 8: a block whose
  `registryDependencies` include an unpublished item. The draft is real and worth keeping; it just has
  nothing to resolve against yet. Studio says so rather than showing a broken frame.

Every error is structured, never a formatted string:

```
{
  code:    "TOKEN_DISCIPLINE" | "IMPORT_NOT_ALLOWED" | "NOT_SELF_CONTAINED"
         | "DEMO_MISSING" | "NAMING" | "COMPILE_FAILED"
         | "MANIFEST_MISMATCH" | "UNPUBLISHED_DEPENDENCY",
  message,                      // one sentence, addressed to the agent
  line?, column?,               // when the failure has a position in source
  found?, expected?,            // for discipline and manifest failures
  remedy?,                      // when there is a specific next action
}
```

`remedy` earns its place on exactly one failure: `IMPORT_NOT_ALLOWED` returns *"this needs a new peer
dependency → open a PR"*, because that is a case the agent genuinely cannot resolve by editing source.
Everywhere else, the position and the `found`/`expected` pair are the remedy.

Codes are enumerated in [01-validators.md](./01-validators.md).

---

## Reads the agent needs

Writing is one call; getting oriented takes a few more.

```
items.list                  what exists, and its status
items.get(name)             current head + published version, manifest
versions.get(id)            a specific version's source
categories.list             the 13 valid ids, with labels
tokens.list                 the semantic tokens available — the anti-slop reference
```

`categories.list` and `tokens.list` exist so the agent does not have to guess and then get rejected.
Validator #1 rejects raw palette utilities; an agent that can read the token list first has no reason to
emit one. **Every validator that can be paired with a read that prevents its own failure should be.**

---

## What the agent may not do

Enforced by the machine token, not by convention — see [admin/01-auth.md](../admin/01-auth.md).

- **Publish.** Decision 3 keeps a human at the PR. An agent that could publish would remove the last
  checkpoint in the system.
- **Mint preview tokens.**
- **Read the `user` table.**
- **Write files.** Decision 2. The rewritten `.claude/skills/add-component` and `add-block` skills target
  this API instead of the filesystem; until they are rewritten they contradict decision 2 and will
  produce files nothing reads.

---

## The skills have to be rewritten

`.claude/skills/add-component/SKILL.md` and `.claude/skills/add-block/SKILL.md` currently describe a
filesystem workflow: create `index.tsx` and `meta.ts`, register in
`apps/web/lib/registry/index.tsx`, add a `registry.json` entry, run the drift check. Every step of that
is either superseded by decision 2 or, in the drift check's case, deleted outright.

They are the agent's actual entry point, so leaving them stale is not a documentation debt — it is a
guarantee that the first agent to run after this ships will do the wrong thing.

### The contract the rewrite must satisfy

This is what a principal-level skill rewrite looks like: not "rewrite the steps," but "specify what
the agent is responsible for and what the system is responsible for."

**The agent is responsible for:**

1. Calling `studio_list_tokens` and `studio_list_categories` before authoring — so it knows the
   valid token set and the closed category set, and does not emit a class or category that will be
   rejected.
2. Reading the current version via `studio_get_item` before editing — so it has the existing
   `manifest`, `source`, and `demo_source` to base its edits on. No partial-update API exists; the
   agent is expected to compose the next full version.
3. Composing `source` and `demo_source` as two separate strings, not as one blob — they have
   different destinies (`source` ships, `demoSource` does not) and the system enforces the split.
4. Calling `studio_validate` for dry runs during iteration, and `studio_save_version` only when ready
   to persist.
5. Reading `errors[]` structurally. Positioned errors (`line`, `column`) and the `found` / `expected`
   pair are the remedy — `message` alone is not.
6. Distinguishing hard failures (exit code 1, no row written) from soft failures (exit code 2, row
   written but not renderable, e.g. `UNPUBLISHED_DEPENDENCY`).
7. Retrying on transport errors. `saveVersion` is **not** idempotent (every call inserts a new
   version row), so retries on transport failure must re-read the current state first to avoid
   stacking duplicate versions.

**The system is responsible for:**

1. Validating every constraint named in [agent/01-validators.md](./01-validators.md). The agent does
   not re-implement these checks client-side.
2. Returning `errors[]` with the shape documented in [the errors[] return section](#the-errors-return-is-what-makes-unattended-iteration-possible).
3. Rejecting writes that fail hard, and persisting soft failures with `errors[]` non-empty.
4. Caching the compiled JS and CSS on the version row, so the preview never re-runs the compiler.
5. Minting a `previewUrl` that the iframe can load without further coordination.

**Neither is responsible for:**

- Publishing. The skill does not describe a publish flow; the agent does not have a token that can
  reach `publish`. The human opens the PR from Studio.
- Drafts needing new npm dependencies. The skill describes validator #2's rejection as the normal
  case and points the agent at the PR path.

### What the skill rewrite is not

- **Not a transcript of successful calls.** The skill describes the contract; transcripts go in
  test fixtures or `examples/`. A skill that reads like a worked example ages badly.
- **Not a re-implementation of the validator chain.** If the skill says "ensure your source has no
  `@workspace/*` imports," it is duplicating validator #3. Delete the duplication and reference the
  validator.
- **Not a tutorial.** The skill is invoked by an agent that already understands React, Tailwind, and
  Base UI. It documents the shape of *this* system, not how to author a component in general.
