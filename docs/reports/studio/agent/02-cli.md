---
title: CLI façade
date: 2026-07-30
status: decisions locked
---

# CLI

**Constrained by:** decision 4 (both a CLI and an MCP server over one core library).

The CLI is the **debuggable surface**. When the agent's behaviour makes no sense, this is what a human
runs to find out why. That is its job, and it shapes every design choice below.

---

## Why both, and not just MCP

MCP is the better interface for a model — schemas are self-describing and the transport is structured.
It is a poor interface for a human at 2am, because reproducing a failure means driving a stdio protocol
by hand.

The CLI covers three cases MCP cannot:

- **Reproduction.** A single shell command that produced a failure, pasteable into an issue.
- **Agents without MCP.** Not every agent runtime speaks it. A shell is universal.
- **Scripting.** Bulk operations, migrations, a `for` loop over nine items.

Both are façades over `@workspace/studio-core`. Neither owns logic.

---

## Commands

```
ds-studio list [--status draft|published|archived] [--json]
ds-studio get <name> [--version <n>] [--json]
ds-studio source <name> [--version <n>]
ds-studio save <name> --file <manifest.json>
ds-studio validate <name> --file <manifest.json>       # dry run, writes nothing
ds-studio versions <name> [--json]
ds-studio diff <name> <a> <b>
ds-studio preview <name> [--version <n>] [--open]
ds-studio categories [--json]
ds-studio tokens [--json]
ds-studio whoami
```

Two absences are enforced by the machine token, not by omitting the command:

- **No `ds-studio publish`.** Human-only, from Studio. See [admin/01-auth.md](../admin/01-auth.md).
- **No `ds-studio delete`.** Version rows are immutable and items archive rather than disappear.

### `validate` is the command that earns the CLI

`ds-studio validate` runs the full validator chain and writes nothing. An agent can iterate against it
without producing a version row per attempt, and a human can check a hand-edited file before handing it
over.

It is the same code path as `save` minus the insert, which is the only way it stays honest — a separate
validation implementation would drift from the one that actually gates writes.

---

## Input shape

`save` and `validate` take a JSON file rather than a wall of flags. The payload is a component: source
text, demo text, and a manifest. Passing multi-line TSX through shell arguments is a quoting exercise
with no upside.

```json
{
  "kind": "component",
  "category": "buttons",
  "title": "Icon Button",
  "description": "A square button that contains only an icon.",
  "variants": ["sm", "md", "lg"],
  "source": "\"use client\"\n\nimport …",
  "demoSource": "…",
  "manifest": {
    "dependencies": ["@base-ui/react@^1.6.0", "clsx", "tailwind-merge"],
    "registryDependencies": [],
    "files": [{ "target": "@ui/ds-icon-button.tsx" }]
  }
}
```

`--file -` reads stdin, so an agent that assembles the payload in memory does not have to touch the
filesystem — which keeps decision 2 intact even at the CLI boundary.

---

## Exit codes

```
0   success
1   validation rejected the write        (errors[] on stdout as JSON)
2   saved, but not renderable            (soft failure — unpublished dependency)
3   auth failure                          (missing, invalid, or revoked token)
4   transport failure                     (Studio unreachable)
```

Distinguishing 1 from 2 matters for scripting: exit 2 means the draft exists and the next action is to
publish something else first, not to edit the source. Distinguishing 3 from 4 matters because one is
fixed by re-authenticating and the other by waiting.

---

## Output

Human-readable by default, `--json` for machines. `errors[]` is emitted as JSON on **both** paths — the
structured error payload is the contract and reformatting it into prose for humans would mean two
representations of the same failure.

```
$ ds-studio save ds-icon-button --file draft.json
✗ rejected — 2 errors

  TOKEN_DISCIPLINE   ds-icon-button.tsx:14:22
    found     bg-slate-100
    expected  a semantic token, e.g. bg-muted

  MANIFEST_MISMATCH  dependencies
    imported  @base-ui/react, clsx, tailwind-merge
    declared  clsx, tailwind-merge
```

Positioned errors print as `file:line:column` so editors and agents can both jump to them.

---

## Configuration

```
STUDIO_URL       https://studio.deessejs.com
STUDIO_TOKEN     the machine token
```

Read from the environment, and from `.studio.json` in the repo root if present. The token never goes in
`.studio.json` — that file is checked in, the token is not.

`ds-studio whoami` reports which URL and which token identity are in effect, and nothing else. It exists
because "the agent is writing to the wrong place" is a failure that looks like every other failure until
you check.
