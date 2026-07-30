---
title: MCP façade
date: 2026-07-30
status: decisions locked
---

# MCP server

**Constrained by:** decision 4 (both a CLI and an MCP server over one core library), decision 1 (the
agent runs locally).

The **schemas are the contract**. They are what a model reads to decide what is possible, so they carry
more weight here than in a normal API surface: a poorly described tool is not a documentation problem,
it is a behaviour problem.

---

## Transport

stdio, local process. The agent runs on the maintainer's machine (decision 1), so there is no remote MCP
server, no OAuth flow, no hosted transport. The server holds `STUDIO_URL` and `STUDIO_TOKEN` from the
environment and speaks oRPC to Studio.

```
agent  ──stdio──▶  ds-studio-mcp  ──HTTPS/oRPC──▶  studio.deessejs.com
```

One consequence worth knowing: **interactively-authenticated MCP servers are absent in headless runs.**
If a Studio operation ever needs to happen from CI or a cron job, it goes through the CLI, not through
MCP.

---

## Tools

| Tool | Maps to |
|---|---|
| `studio_list_items` | `items.list` |
| `studio_get_item` | `items.get` |
| `studio_get_source` | `versions.get` |
| `studio_validate` | validator chain, no write |
| `studio_save_version` | `saveVersion` |
| `studio_list_versions` | `versions.list` |
| `studio_diff_versions` | `versions.diff` |
| `studio_preview_url` | the version's stable preview URL |
| `studio_list_categories` | the 13 closed-set ids, with labels |
| `studio_list_tokens` | the semantic tokens available |

No `studio_publish`. No `studio_delete`. Both denied by the machine token, not merely omitted from the
tool list — an agent that constructs the call by hand still gets rejected. See
[admin/01-auth.md](../admin/01-auth.md).

---

## The two tools that prevent failures rather than reporting them

`studio_list_tokens` and `studio_list_categories` exist because of a pattern in
[01-validators.md](./01-validators.md): every validator that can be paired with a read that prevents its
own failure should be.

Validator #1 rejects raw palette utilities. An agent that has enumerated the semantic tokens has no
reason to emit `bg-slate-100`. Validator #8 rejects categories outside the closed set of 13. An agent
that has read the list cannot invent a fourteenth.

Their descriptions should say so explicitly — *"call this before authoring; raw palette utilities are
rejected at save time"* — because a tool description is the only place a model reliably reads a
precondition.

---

## Schema design

Three rules, all learned from the failure modes this system is built around.

**Describe the constraint in the description, not just the type.** `category: string` with an enum is
correct and insufficient. `category: string — one of the 13 ids from studio_list_categories; component
categories and block categories are not interchangeable` is what changes behaviour.

**Make `source` and `demoSource` separate parameters, never one blob.** They have different destinies:
`source` ships to consumers, `demoSource` never does. Collapsing them into one field would put the
separation back into a parsing step, and a parsing step is a thing that can be wrong.

**Return `errors[]` verbatim.** The structured payload from
[README.md](./README.md#the-errors-return-is-what-makes-unattended-iteration-possible) goes back to the
model as-is — `code`, `message`, `line`, `column`, `found`, `expected`, `remedy`. No prose summary. A
model given `found: "bg-slate-100"` and `expected: "a semantic token, e.g. bg-muted"` fixes the line; a
model given *"validation failed"* retries blindly.

---

## `studio_save_version` is not idempotent, deliberately

Every call inserts a new immutable version row. A retried call produces a second version, not an
overwrite.

This is the right trade. The alternative — a client-supplied idempotency key — would mean the agent has
to decide whether two attempts are "the same save", and getting that wrong silently drops work. Extra
version rows cost kilobytes and are trivially readable as what they are: an agent iterating.

The tool description should state it, so a model retrying after a transport error knows what it created.

---

## Tool descriptions carry the rules

The `.claude/skills/add-component` and `add-block` skills currently describe a filesystem workflow that
decision 2 obsoletes. Rewriting them to target this API is necessary — see
[README.md](./README.md#the-skills-have-to-be-rewritten) — but the tool descriptions are the more durable
place for the rules.

A skill is read when it is invoked. A tool description is read every time the tool is considered. Rules
that must not be missed — semantic tokens only, no `dark:` variants, self-contained source, `<Name>Demo` —
belong in both, and the tool description is the copy that survives an agent that skipped the skill.

---

## Sources

- https://ui.shadcn.com/docs/mcp — shadcn's own MCP surface, for naming and shape precedent, verified 2026-07-30
