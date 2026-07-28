---
name: feedback-concrete-over-theory
description: Ground design discussion in real, current tooling — no abstract theory, no stale defaults
metadata:
  type: feedback
---

Keep design discussion anchored in real, verifiable tooling — never pure theory, and
never a general design lecture detached from the stack.

**Why:** the user's stated goal is a working system, not education. They explicitly
asked for "concret mais pas orienté uniquement théorie" and named shadcn/Tailwind as
the constraint that must be preserved in any answer. They also corrected an outdated
framing (raw Tailwind color classes) that no longer reflects how the stack works —
stale assumptions cost credibility here.

**How to apply:** research current state before asserting it (the `fresh` CLI is the
tool for this). Cite versions and dates. Separate what is vendor-documented from what
is our own judgment, and label the latter. When recommending a practice, show the
command or the CSS, not the principle alone.
