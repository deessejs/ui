---
title: Write-path validators — the only gate
date: 2026-07-30
status: decisions locked
---

# Write-path validators

**Constrained by:** decision 2 (the agent writes no files, so there is no PR between generated code and
stored state).

This is the most consequential document in the folder. With decision 2, **nothing stands between
generated code and stored state except these validators.** If one is missing, nothing catches the
failure — not review, not CI, not TypeScript.

Validators 1–3 are this project's anti-slop thesis relocated from CI to the write path. That relocation
is not a downgrade. It is enforcement moving *earlier*, which is what the thesis argues for: rules that
are enforced beat rules that are explained.

---

## The eight

### 1. Token discipline

Reject raw palette utilities (`bg-red-500`, `text-blue-600`, `border-slate-200`) and reject `dark:`
variants. Semantic tokens handle both modes; a `dark:` variant in this system is a sign the author
reached past the token layer.

Currently enforced by human review, which does not survive an agent-authored surface.

Pair it with `tokens.list` on the read side — an agent that can enumerate the available tokens has no
reason to emit a palette class. See [README.md](./README.md#reads-the-agent-needs).

```
code: TOKEN_DISCIPLINE
returns: line, column, found ("bg-red-500"), expected ("a semantic token, e.g. bg-destructive")
```

### 2. Import allow-list

Parse the imports in `source`. Anything outside the preview's import map is rejected.

The import map **is** the allow-list — that is what makes this validator mechanical rather than a
hand-maintained deny-list that drifts. See
[preview/01-transpile-and-imports.md](../preview/01-transpile-and-imports.md#the-import-map-is-the-allow-list).

```
code: IMPORT_NOT_ALLOWED
returns: line, found ("date-fns"), remedy ("this needs a new peer dependency → open a PR")
```

This is the one failure the agent cannot fix by editing source, which is why it is the one failure that
carries a `remedy`.

### 3. Self-containment

No `@workspace/*` import may appear in `source`. Post-collapse this is a hard rule rather than a
convention: the stored source is simultaneously the showcase's source and the consumer's source, and a
consumer has no `@workspace/*`.

Technically a special case of #2 — `@workspace/*` is not in the import map — but it deserves its own code
because the remedy is different. `@workspace/ui/lib/utils` means *use `@/lib/utils`*, not *open a PR*.

```
code: NOT_SELF_CONTAINED
returns: line, found ("@workspace/ui/lib/utils"), expected ("@/lib/utils")
```

### 4. `Demo` present and correctly named

`demo_source` must export exactly one component, and its name must be `<ComponentName>Demo`.

Presence is today's "no placeholder if missing" invariant: `ComponentEntry` declares
`Demo: React.ComponentType` as required, so a missing Demo is a TypeScript error at build time. In a
database world it must become a save-time error or the invariant silently dies.

**The naming half is new and it is not cosmetic.** All nine items follow `<Name>Demo` except the block,
which exports `EmptyStateBlockDemo`. That works today only because
`apps/web/lib/registry/index.tsx` imports it by hand. Publishing generates that registration
(see [publish/README.md](../publish/README.md)), and generated code cannot special-case one name it has
no way to know about.

```
code: DEMO_MISSING
returns: expected ("a single exported ButtonDemo"), found ("no export" | "ButtonPreview")
```

### 5. Naming

`ds-` prefix, kebab-case. `files[].target` uses the `@ui/` or `@components/` placeholder aliases, never
a bare path.

```
code: NAMING
returns: found, expected
```

### 6. Compile clean

sucrase parses `source` and `demo_source`. Tailwind `compile()` returns without throwing. No unresolved
specifier remains after import-map resolution.

The cheapest way to know the stored bytes are renderable is to render them. This validator is the reason
`compiled_js` and `compiled_css` can be cached on the version row with confidence — they were produced
during validation, not lazily on first view.

```
code: COMPILE_FAILED
returns: line, column, message (the transpiler's, verbatim)
```

### 7. Manifest agreement

Two independent checks, both of an agreement that is currently maintained by hand and would lose its
maintainer under decision 2:

- `manifest.dependencies[]` must equal the set of bare-module imports in `source`.
- `manifest.registryDependencies[]` must equal the set of `@/components/ui/ds-*` imports in `source`.

Measured on 2026-07-30: all nine items agree exactly — no under- or over-declaration, one
`registryDependencies` array in the whole repo. That agreement is a human artifact.

The `registryDependencies` half is load-bearing because of decision 8. The preview resolves
`@/components/ui/*` against **published** items; a missing manifest entry therefore becomes a *render
failure* rather than a validation error, and the agent has no way to diagnose it from `errors[]`. Catching
it here is the difference between a clear rejection and an unexplained blank frame.

```
code: MANIFEST_MISMATCH
returns: found (declared), expected (imported), and which direction the mismatch runs
```

### 8. Category in the closed set

`packages/registry/src/types.ts` defines 13 category ids — 7 component, 6 block. `category` must be one
of them, and a `component` may not carry a block category or vice versa.

```
code: NAMING   (reuses the code; the message names the closed set)
```

---

## Ordering

Validator numbers above are stable identifiers, not the run order. The run order is:

```
#5  naming            cheap, rejects typos before anything is parsed
#8  category          closed-set lookup
#1  token discipline  string scan, no parse needed
#2  imports           needs a parse; also produces the import set #7 consumes
#3  self-containment  reuses #2's parse
#7  manifest          consumes #2's import set — no second parse
#4  demo present
#6  compile clean     the expensive one, runs only on source already proven sane
```

Ordering is not a micro-optimisation. Validators #1–#5, #7 and #8 produce structured, positioned errors
an agent can act on. #6 produces a transpiler error, which is strictly worse feedback. Every failure that
can be caught before the compiler should be.

---

## Soft failures

One validator does not reject the write: an unpublished `registryDependency`. The draft is real and worth
keeping — it just cannot render yet.

```
code: UNPUBLISHED_DEPENDENCY
result: version row written, previewUrl returned, errors[] non-empty
```

This is the mechanical expression of decision 8's sequencing constraint. See
[99-frictions-and-costs.md](../99-frictions-and-costs.md).

---

## What still lives in CI, and why that is not redundant

Publishing opens a PR (decision 3) and the existing jobs run on it: `registry-validate`, `lint`,
`typecheck`, `build-showcase`, `contract`. They are not a second copy of the validators above — they
answer a question the write path structurally cannot:

**"Does this compile in a real consumer project?"** `contract-test.mjs` copies the generated files into a
scratch project, installs real npm dependencies, and type-checks. The write path validates against an
import map and a vendored dependency set. Those are different questions, and CI's is the one that matches
what a user experiences.

The write path is the gate for *storage*. CI remains the gate for *distribution*.

---

## The failure mode this document exists to prevent

Not "an agent writes a bad component." That is expected and cheap — the maintainer sees it and says so.

The failure mode is **an agent writes a component that passes every check because the check for that
thing was never written.** Validators 7 and 8 exist because that is exactly what happened to the drift
apparatus: it reported green while asserting on 3 items out of 9. See
[02-single-tree.md](../02-single-tree.md#why-the-duplication-has-to-go-now).

A validator that cannot fail is indistinguishable from a validator that passes. Every one of the eight
above needs a test that proves it rejects.
