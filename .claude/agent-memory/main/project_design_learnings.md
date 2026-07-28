---
name: project-design-learnings
description: Purpose of this repo — a knowledge base for building an anti-slop design system with AI agents
metadata:
  type: project
---

This repo (`design/`) is a **knowledge base**, not an application. Goal: assemble a real
design system so AI coding agents stop producing generic UI. Research notes live under
`learnings/<topic>/`, written in English.

Started 2026-07-28 with `learnings/tailwind/` and `learnings/shadcn/` — token systems,
agent rules, CLI/registry distribution, plus two applied synthesis docs
(`tailwind/04-constraining-the-scale.md`, `shadcn/05-anti-slop-playbook.md`).

**Why:** the user builds UI with agents and the output is coherent per-screen but drifts
across screens. The working thesis, developed jointly: prompting cannot fix this because
it decays across context, so the fix must be *enforced* (theme namespaces deleted at the
compiler level) and *fetchable* (system distributed as a registry, not re-explained).

**How to apply:** when adding to this repo, follow the established doc shape — source URL
and verification date at the top, vendor-documented facts separated from our own judgment,
applied synthesis docs explicitly labelled as opinion. Research current state before
writing; the notes carry version numbers and will go stale. No implementation code has
been written yet — this is still the research phase. See [[user-profile]] and
[[feedback-concrete-over-theory]].
