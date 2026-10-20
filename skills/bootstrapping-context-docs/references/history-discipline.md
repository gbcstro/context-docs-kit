# History Discipline: PROGRESS_vN.md, CHANGELOG_vN.md, and In-Version Changes

<!-- context-docs-kit:shared — canonical copy lives in shared/references/. Edit there, then `npm run sync`. -->

## The shape of `context/`

```
context/
  PRODUCT.md              present tense, current state only
  ARCHITECTURE.md
  SCHEMA.md
  DESIGN.md
  RULES.md
  PROGRESS/
    PROGRESS_v1.md        v1 scope + checklist + acceptance criteria
    CHANGELOG_v1.md       task completions, session logs, and why anything changed during v1
    PROGRESS_v2.md        written only when the user closes v1
    CHANGELOG_v2.md
```

Three rules govern the whole folder:

1. **The docs say what is true. The changelog says why it changed and what was completed.** Never both.
2. **The first version is always `v1`**, and only the user decides when it ends.
3. **Always log when a task or conversation is done, and compact after 30 days.** Every completed task, feature, fix, or session milestone is recorded before declaring done. Entries older than 30 days are compacted into monthly summary rollups so the active log stays clean and context-efficient.

---

## `PROGRESS_vN.md` — the version's scope and checklist

One file per project version. `PROGRESS_v1.md` is written at the end of the first
bootstrap pass, after the agent file is wired. It is **not** a snapshot of what
happened; it is the scope the version is committed to, with the acceptance
criteria that decide when it is met.

It is a **living file** for the whole life of the version: boxes get ticked as
work lands. It is frozen only when the user closes the version.

```markdown
# <Project> — v1

**Status:** open
**Opened:** 2026-03-14
**Last updated:** 2026-03-14

## 1. Doc set at v1

| Doc | Revision | What it currently says |
|---|---|---|
| PRODUCT.md | 1 | Habit tracker for solo users; streaks and a daily view; free, no accounts |
| ARCHITECTURE.md | 1 | Expo + SQLite, local-first, no backend in v1 |
| SCHEMA.md | 1 | Four entities: habit, entry, streak_cache, setting |
| RULES.md | 1 | Functional core / imperative shell; unit tests on the core only |

## 2. v1 scope checklist

- [ ] **Habit CRUD**
  - AC: a habit can be created with a name and a target frequency
  - AC: editing a habit does not alter its historical entries
  - AC: archiving hides it from the today view and keeps its history
  - Source: PRODUCT.md §4.1, SCHEMA.md §3.1
- [ ] **Daily check-in**
  - AC: tapping a habit on the today view records an entry dated today
  - AC: tapping again the same day removes it, and no duplicate entry can exist
  - Source: PRODUCT.md §4.2, SCHEMA.md §3.2
- [ ] **Streak display**
  - AC: the streak shown equals consecutive days meeting the target, computed from entries
  - AC: a missed day resets it to zero on the next render, with no manual reset
  - Source: PRODUCT.md §4.3, ARCHITECTURE.md §5

## 3. Explicitly out of v1

- Cloud sync and multi-device — deferred until the local model is proven
- Accounts and auth — nothing to sync yet
- Reminders and notifications — needs a push story the local-first design has not paid for

## 4. Provisional decisions

Each is **in force** — the docs state it as a decision and the code is built
against it. Listed here because new information could change it.

- **Target frequency shape** — *in force:* an integer count per week.
  *Settled by:* whether anyone asks for specific weekdays once people are using it.
  *Reversal cost:* a column type change plus a data migration; the weekday variant
  also needs a second UI surface v1 does not have.
  *Recorded in:* SCHEMA.md §3.1.

## 5. Exit criteria

v1 is done when every box in §2 is checked with evidence, every §4 entry is
settled or explicitly carried, and the user says v1 is done. Nothing here closes
on its own.
```

### Rules for `PROGRESS_vN.md`

- **Derived from the docs, never invented.** Every checklist item traces to a section of an approved doc, and that pointer is written down. An item with no source is a feature nobody agreed to.
- **Acceptance criteria are observable.** "Auth works" is not a criterion. "A user can register, verify by email, sign in, and the session survives an app restart" is four. Write what you would check, not what you would hope.
- **High-level, not a task list.** Items are shippable slices — the thing a user can do when it is done. Ten to twenty for a normal v1. If you are writing "add a column to the habits table", you have dropped an altitude too far.
- **A box is ticked with evidence** — the file, test, or route that satisfies the criterion — and only ever by proposing the tick to the user first.
- **§4 is the only place unsettled things live.** The docs themselves carry no open questions — every one is closed before its doc is approved, per `references/closing-questions.md`.
- **Only the user closes a version.** However complete it looks, the skill states the status and waits.
- **Never start at anything but v1.** On a first bootstrap, the file is `PROGRESS_v1.md`, even if the project has shipped before. What shipped before was not tracked here.

---

## `CHANGELOG_vN.md` — task completions, session logs, and in-version changes

Created alongside `PROGRESS_vN.md`. Appended to for the life of that version.
When the version closes, it is frozen and never written to again — vN+1 gets its own.

`CHANGELOG_vN.md` has two primary purposes:
1. **Documenting completed tasks & conversation sessions** — what was accomplished, why/context, and files or checklist items affected.
2. **Documenting in-version doc revisions & decision shifts** — why any decision changed in `context/*.md` without cluttering the present-tense doc.

**The Golden Rule: Always log when a conversation or task is done.** An AI agent or human contributor must never finish a task, implement a feature, resolve a bug, or end a work conversation without logging what was completed to `context/PROGRESS/CHANGELOG_v<current>.md`.

### Entry Types

#### Type 1: In-Version Doc Revision Entry

Used whenever an architectural, product, schema, design, or rule decision changes inside the current version:

```markdown
## 2026-04-02 — ARCHITECTURE.md rev 3, SCHEMA.md rev 2
**Changed:** the local store moved from SQLite to Postgres behind a small sync service.
**Why:** multi-device turned out to be a v1 requirement after the user testing round, and SQLite has no server-side merge story — conflict resolution would have been ours to write.
**Affects:** ARCHITECTURE.md §5 and §7, SCHEMA.md §3 (added `sync_conflicts`), PROGRESS_v1.md checklist item "Daily check-in" (offline behaviour AC added).
```

#### Type 2: Task & Conversation Completion Entry

Used whenever a coding task, feature, bug fix, refactor, or substantive conversation session concludes:

```markdown
## 2026-04-15 — Task: Stripe webhook signature verification
**Completed:** Implemented Stripe webhook endpoint with signature checking, raw body parsing, and event routing.
**Why / Context:** Payment events were failing signature verification in staging environments.
**Affects:** `src/api/webhooks/stripe.ts`, `test/webhooks.test.ts`, PROGRESS_v1.md checklist item "Billing".
```

Every entry carries all parts. **Affects** is the one that gets skipped and
the one that makes the file useful: it is how a later reader finds the blast
radius of a decision or task without re-deriving it.

---

## The 30-Day Compaction Protocol

As AI agents log every task, session, and doc revision, `CHANGELOG_vN.md` grows.
If left uncompacted, loading weeks of granular daily entries burns unnecessary context tokens
and degrades model attention.

To keep the changelog performant and clear, entries follow a **dual-zone structure**:
1. **Active Log (Last 30 Days):** Full granular detail (date, title, Completed/Changed, Why, Affects).
2. **Compacted History (> 30 days):** Entries older than 30 days rolled up into concise monthly bullet summaries.

```markdown
# <Project> — v1 Change Log

## Active Log (Last 30 Days)

## 2026-04-15 — Task: Stripe webhook signature verification
**Completed:** Implemented Stripe webhook endpoint with signature checking, raw body parsing, and event routing.
**Why / Context:** Payment events were failing signature verification in staging.
**Affects:** `src/api/webhooks/stripe.ts`, `test/webhooks.test.ts`.

---

## Compacted History (> 30 days)

### 2026-03 (Compacted)
- **2026-03-14 – 2026-03-25 (Habit CRUD & Check-in):** Built habit CRUD, daily check-in toggle, streak computation core. Why: core v1 checklist scope. Affects: `src/core/`, `src/db/schema.ts`, PROGRESS_v1.md.
- **2026-03-28 (ARCHITECTURE.md rev 2):** Switched local DB driver to better-sqlite3 for synchronous IPC. Why: Expo build performance. Affects: ARCHITECTURE.md §3.
```

### How to Compact Entries Older Than 30 Days

When an AI agent logs a new entry, runs `aligning-context-docs`, or closes a version with `versioning-context-docs`:
1. **Identify entries dated > 30 days ago** relative to today's date.
2. **Group them by month** (`YYYY-MM`).
3. **Condense each entry** into a single bullet summarizing the date, task/doc title, core change, rationale, and blast radius (affected files or checklist items).
4. **Move the condensed bullets** under `### YYYY-MM (Compacted)` in `## Compacted History (> 30 days)`. If that month section already exists, merge the new bullets into it.
5. **Remove the granular entries** from the Active Log section.
6. **Retain entries <= 30 days old** in full granular detail.

Alternatively, run the automated CLI compaction tool:
```bash
npx context-docs-kit compact-changelog --days 30
```

---

## The In-Version Change Protocol

This is the procedure whenever something changes and the project version does
**not** move. It is the single most-violated rule in the whole kit, because
explaining a change inside the doc feels helpful in the moment.

1. **Rewrite the doc into the new decision.** Delete the old text. Do not annotate it, contrast it, or explain it. When you are done the doc reads as if it had always said this.
2. **Bump `**Revision:**` and `**Last updated:**`.** `**Project version:**` does not move.
3. **Append the entry to `CHANGELOG_v<current>.md`** — changed, why, affects. The reason lives here and nowhere else. Check for and compact any entries older than 30 days.
4. **Cascade before you finish.** Walk the `Depends on:` chain downhill from the doc you changed. Every dependent doc that now disagrees gets fixed in the same pass, each with its own revision bump; one changelog entry can cover them all. A change is not complete while a downstream doc contradicts it.
5. **Re-check `PROGRESS_v<current>.md`.** If the change altered a scope item, its acceptance criteria, or a §4 provisional decision, update it and say so in the entry's **Affects**. A provisional decision that has just been settled leaves §4 in this same pass.
6. **Run the banned-phrase check** over every `context/*.md` before declaring the change done.

### The banned-phrase check

Grep the docs — not `PROGRESS/` — for these. Every hit is a defect at the same
severity as an invented fact, and every hit belongs in the changelog instead:

```
previously        used to           we switched       changed from
as of v           originally        no longer         instead of the
migrated from     formerly          moved away from   we now
```

`no longer` and `we now` catch the subtle form, which is the common one: *"the
API no longer returns the full object"* is a sentence about the past wearing a
present-tense costume. The doc should simply say what the API returns.

One exception, and it is narrow: prose describing **runtime behaviour** may use
these words about the system's own state — "once the token expires the session is
no longer valid" is a fact about the product, not about the doc's history. If the
sentence is about a *decision*, it is banned; if it is about *behaviour*, it is fine.

### What this looks like in practice

```
> "Actually, use Postgres, not SQLite."

  Understood — that changes ARCHITECTURE.md §5 and cascades into
  SCHEMA.md §3.

  ARCHITECTURE.md will read "The store is Postgres, running in
  the compose stack" — no mention of SQLite, as if it were never
  there. The reason you switched goes in CHANGELOG_v1.md so it
  stays findable.

  Before I write it: Postgres means you need the compose stack
  running for local dev, where SQLite needed nothing. Accept?
```

---

## Where each skill touches this

| Skill | Writes |
|---|---|
| `bootstrapping-context-docs` | `PROGRESS_v1.md` at the end of the pass; initializes `CHANGELOG_v1.md` with active and compacted sections |
| `aligning-context-docs` | changelog entries, task logs, doc revisions, and 30-day compaction; proposes checklist ticks |
| `versioning-context-docs` | runs 30-day compaction on `CHANGELOG_vN.md` before freeze; opens `PROGRESS_v(N+1).md` and `CHANGELOG_v(N+1).md` |
| AI Assistant / Contributor | always logs when a task or conversation is done, compacting entries older than 30 days |

A first draft is not a revision of anything, so **initial bootstrap logs no changes**
— `CHANGELOG_v1.md` starts with empty active/compacted sections and receives its first entry when the first task or change lands.
