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
