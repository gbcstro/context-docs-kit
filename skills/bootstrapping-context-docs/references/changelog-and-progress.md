# History Discipline: CHANGE_LOG.md and PROGRESS/

## Why this exists

A context doc that narrates its own history stops being a record of current state and turns into a diff log wearing a doc's clothes. "Originally we used X, then switched to Y because Z" buries the one fact a reader needs — what's true now — under an account of how it got there. Every doc in the set is **present tense only**: it describes what is decided, not the sequence of decisions that got there.

History still matters. It just doesn't belong inline — it belongs in two dedicated places.

## The rule

**Every `context/*.md` doc describes the current state only.** No "previously", "used to be", "as of vN we changed", "originally", "we moved away from". If a decision changed, the doc reads after the edit exactly as if that had always been the decision — a reader opening it cold should never be able to tell it was revised.

Two things are not narration and stay exactly where they are:

- `## Open Questions` — noting something is undecided is status, not history.
- The header's `**Status:** Draft vN` and `**Last updated:**` — metadata, not prose.

## `context/CHANGE_LOG.md`

Lives at `context/CHANGE_LOG.md`, sibling to the other docs. One file for the whole set, entries in chronological order (oldest first).

Log an entry whenever a **substantive revision** lands in any doc — the kind that bumps `Draft vN` to `vN+1` (a changed decision, not a typo fix or a formatting pass).

```markdown
# Change Log

## YYYY-MM-DD — ARCHITECTURE.md v2
Switched from SQLite to Postgres. Sync arrived earlier than expected and
SQLite has no story for server-side merge. See ARCHITECTURE.md §4.

## YYYY-MM-DD — SCHEMA.md v2
Added `sync_conflicts` table to support the above.
```

Each entry: date, doc + new version, one to three sentences on what changed and why, and a section pointer if useful. This is where "the SQLite decision was reversed" lives — never in `ARCHITECTURE.md` itself.

Create the file the first time a substantive revision happens, not during initial bootstrap — a doc's first version isn't a revision of anything, so there's nothing to log yet.

## `context/PROGRESS/`

Lives at `context/PROGRESS/`, one file per full bootstrap pass: `PROGRESS_v1.md`, `PROGRESS_v2.md`, and so on. Never overwritten, never edited after being written.

Write `PROGRESS_v1.md` the first time the full doc set for this project is approved and `references/wiring.md` §3 (agent-file merge) completes. Write the next `PROGRESS_vN.md` the next time a **full bootstrap pass** completes — not on every doc edit, but when the doc set's scope has meaningfully moved: a doc added to the set (e.g. `DESIGN.md` once a UI arrives), a major reconciliation pass, or a deliberate re-bootstrap. A routine single-doc revision goes in `CHANGE_LOG.md` only; it does not earn a new snapshot.

Each snapshot is a scope summary, not a full diff:

```markdown
# Progress Snapshot v2 — YYYY-MM-DD

## Doc set
PRODUCT.md v3, ARCHITECTURE.md v2, SCHEMA.md v2, RULES.md v1
(DESIGN.md added this pass — v1)

## What changed since v1
- Sync feature added scope: SCHEMA.md gained conflict resolution, ARCHITECTURE.md
  moved from SQLite to Postgres (see CHANGE_LOG.md for the full entries)
- DESIGN.md bootstrapped for the first time now that the UI exists

## Current scope, one paragraph
<What the project is now, in the same present-tense register as the docs
themselves — this is the fastest way for a new session to get oriented
before opening the full doc set.>
```

`PROGRESS_vN.md` is the one place in `context/` explicitly allowed to talk about "since vN-1" — it is a snapshot of change, not a doc of record, and a later pass never grills against it the way it would against `PRODUCT.md` or `ARCHITECTURE.md`.

## How this interacts with the per-doc pass

- **Stage 3 (Draft)**, and any later edit to an existing doc: write present tense, no narration. A draft containing "previously" or "changed from" is a defect, same severity as an invented fact.
- **Stage 4 (Review):** `context-doc-critic` checks for history narration exactly as it checks for invented facts — flag and fix before the gate.
- **Stage 5 (Gate), on a revision (not a first draft):** once approved, append the `CHANGE_LOG.md` entry before moving to the next doc.
- **End of a full bootstrap pass**, right after `references/wiring.md` §3 completes: write the next `PROGRESS_vN.md`.
