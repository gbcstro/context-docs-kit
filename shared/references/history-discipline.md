# History Discipline: vN/CHECKLIST.md, vN/changelog/, and In-Version Changes

<!-- context-docs-kit:shared — canonical copy lives in shared/references/. Edit there, then `npm run sync`. -->

## The shape of `context/`

```
context/
  PRODUCT.md              present tense, current state only
  ARCHITECTURE.md
  SCHEMA.md
  DESIGN.md
  RULES.md
  agents/                 project personas (references/project-agents.md); rendered to host agent folders
  PROGRESS/
    v1/
      CHECKLIST.md        v1 scope + checklist + acceptance criteria
      changelog/          one file per day: task completions, session logs, why anything changed
        2026-03-14.md
        2026-02.md        monthly rollup of day files older than 30 days
      specs/              design specs (superpowers brainstorming, doc-coauthoring)
        2026-03-14-<topic>-design.md
      plans/              implementation plans (superpowers writing-plans)
        2026-03-15-<feature>.md
      sdd/                finished SDD / executing-plans ledgers
        2026-03-15-<feature>.md
    v2/                   written only when the user closes v1
```

`v<N>/` is the version's whole working record. Skills that would write elsewhere
by default — superpowers' `docs/superpowers/specs/` and `docs/superpowers/plans/`
— write here instead; `RULES.md` §2.1 makes that the user preference those
skills honor. Superpowers' SDD workspace (`.superpowers/sdd/<plan>/`) has a
hard-coded path, so it stays a git-ignored scratch directory; when a plan
finishes, its `progress.md` ledger is copied to `v<N>/sdd/<plan-basename>.md`.
No `docs/superpowers/` folder is ever created, and `.superpowers/` is never committed.

Three rules govern the whole folder:

1. **The docs say what is true. The changelog says why it changed and what was completed.** Never both.
2. **The first version is always `v1`**, and only the user decides when it ends.
3. **Always log when a task or conversation is done, and compact after 30 days.** Every completed task, feature, fix, or session milestone is recorded before declaring done. Day files older than 30 days are compacted into one monthly rollup file so the active log stays clean and context-efficient.

---

## `vN/CHECKLIST.md` — the version's scope and checklist

One file per project version. `v1/CHECKLIST.md` is written at the end of the first
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

### Rules for `vN/CHECKLIST.md`

- **Derived from the docs, never invented.** Every checklist item traces to a section of an approved doc, and that pointer is written down. An item with no source is a feature nobody agreed to.
- **Acceptance criteria are observable.** "Auth works" is not a criterion. "A user can register, verify by email, sign in, and the session survives an app restart" is four. Write what you would check, not what you would hope.
- **High-level, not a task list.** Items are shippable slices — the thing a user can do when it is done. Ten to twenty for a normal v1. If you are writing "add a column to the habits table", you have dropped an altitude too far.
- **A box is ticked with evidence** — the file, test, or route that satisfies the criterion — and only ever by proposing the tick to the user first.
- **§4 is the only place unsettled things live.** The docs themselves carry no open questions — every one is closed before its doc is approved, per `references/closing-questions.md`.
- **Only the user closes a version.** However complete it looks, the skill states the status and waits.
- **Never start at anything but v1.** On a first bootstrap, the file is `v1/CHECKLIST.md`, even if the project has shipped before. What shipped before was not tracked here.

---

## `vN/changelog/` — task completions, session logs, and in-version changes

A folder, created alongside `vN/CHECKLIST.md`. **One markdown file per day**,
named `YYYY-MM-DD.md` for the real current date: the first entry of the day
creates the file, later entries that day are appended to it. When the version
closes, the folder is frozen and never written to again — vN+1 gets its own.

```markdown
# <Project> — v1 — 2026-04-15

## Task: Stripe webhook signature verification
**Completed:** ...
**Why / Context:** ...
**Affects:** ...
```

The date lives in the file name and the `#` title, so entry headings carry only
the title.

`vN/changelog/` has two primary purposes:
1. **Documenting completed tasks & conversation sessions** — what was accomplished, why/context, and files or checklist items affected.
2. **Documenting in-version doc revisions & decision shifts** — why any decision changed in `context/*.md` without cluttering the present-tense doc.

**The Golden Rule: Always log when a conversation or task is done.** An AI agent or human contributor must never finish a task, implement a feature, resolve a bug, or end a work conversation without logging what was completed to today's file in `context/PROGRESS/v<current>/changelog/`.

### Entry Types

#### Type 1: In-Version Doc Revision Entry

Used whenever an architectural, product, schema, design, or rule decision changes inside the current version:

```markdown
## ARCHITECTURE.md rev 3, SCHEMA.md rev 2
**Changed:** the local store moved from SQLite to Postgres behind a small sync service.
**Why:** multi-device turned out to be a v1 requirement after the user testing round, and SQLite has no server-side merge story — conflict resolution would have been ours to write.
**Affects:** ARCHITECTURE.md §5 and §7, SCHEMA.md §3 (added `sync_conflicts`), v1/CHECKLIST.md checklist item "Daily check-in" (offline behaviour AC added).
```

#### Type 2: Task & Conversation Completion Entry

Used whenever a coding task, feature, bug fix, refactor, or substantive conversation session concludes:

```markdown
## Task: Stripe webhook signature verification
**Completed:** Implemented Stripe webhook endpoint with signature checking, raw body parsing, and event routing.
**Why / Context:** Payment events were failing signature verification in staging environments.
**Affects:** `src/api/webhooks/stripe.ts`, `test/webhooks.test.ts`, v1/CHECKLIST.md checklist item "Billing".
```

Every entry carries all parts. **Affects** is the one that gets skipped and
the one that makes the file useful: it is how a later reader finds the blast
radius of a decision or task without re-deriving it.

---

## The 30-Day Compaction Protocol

As AI agents log every task, session, and doc revision, `vN/changelog/` fills
with day files. Loading weeks of granular entries burns context tokens and
degrades model attention, so the folder has two zones:

1. **Active (last 30 days):** the day files, `YYYY-MM-DD.md`, in full detail.
2. **Compacted (> 30 days):** one rollup per month, `YYYY-MM.md`, holding a
   single bullet per entry. Its day files are deleted.

```markdown
# <Project> — v1 — 2026-03 (Compacted)

- **2026-03-14 – 2026-03-25 (Habit CRUD & Check-in):** Built habit CRUD, daily check-in toggle, streak computation core. Why: core v1 checklist scope. Affects: `src/core/`, `src/db/schema.ts`, v1/CHECKLIST.md.
- **2026-03-28 (ARCHITECTURE.md rev 2):** Switched local DB driver to better-sqlite3 for synchronous IPC. Why: Expo build performance. Affects: ARCHITECTURE.md §3.
```

### How to compact day files older than 30 days

When an AI agent logs a new entry, runs `aligning-context-docs`, or closes a version with `versioning-context-docs`:
1. **Find day files dated > 30 days ago** relative to today's date.
2. **Group them by month** (`YYYY-MM`).
3. **Condense each entry** into one bullet: date, title, core change, rationale, blast radius.
4. **Append the bullets** to `YYYY-MM.md`, creating it if missing.
5. **Delete the compacted day files.** Day files <= 30 days old stay untouched.

---

## The In-Version Change Protocol

This is the procedure whenever something changes and the project version does
**not** move. It is the single most-violated rule in the whole kit, because
explaining a change inside the doc feels helpful in the moment.

1. **Rewrite the doc into the new decision.** Delete the old text. Do not annotate it, contrast it, or explain it. When you are done the doc reads as if it had always said this.
2. **Bump `**Revision:**` and `**Last updated:**`.** `**Project version:**` does not move.
3. **Append the entry to today's `v<current>/changelog/YYYY-MM-DD.md`** — changed, why, affects. The reason lives here and nowhere else. Compact any day files older than 30 days.
4. **Cascade before you finish.** Walk the `Depends on:` chain downhill from the doc you changed. Every dependent doc that now disagrees gets fixed in the same pass, each with its own revision bump; one changelog entry can cover them all. A change is not complete while a downstream doc contradicts it.
5. **Re-check `v<current>/CHECKLIST.md`.** If the change altered a scope item, its acceptance criteria, or a §4 provisional decision, update it and say so in the entry's **Affects**. A provisional decision that has just been settled leaves §4 in this same pass.
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
  there. The reason you switched goes in v1/changelog/ so it
  stays findable.

  Before I write it: Postgres means you need the compose stack
  running for local dev, where SQLite needed nothing. Accept?
```

---

## Where each skill touches this

| Skill | Writes |
|---|---|
| `bootstrapping-context-docs` | `v1/CHECKLIST.md` at the end of the pass; creates the empty `v1/changelog/`, `specs/`, `plans/` and `sdd/` folders (each with a `.gitkeep`) |
| `aligning-context-docs` | changelog entries, task logs, doc revisions, and 30-day compaction; proposes checklist ticks |
| `versioning-context-docs` | runs 30-day compaction on `vN/changelog/` before freeze; opens `v(N+1)/CHECKLIST.md` and the empty `v(N+1)/changelog/`, `specs/`, `plans/`, `sdd/` |
| AI Assistant / Contributor | always logs to today's changelog file when a task or conversation is done, compacting day files older than 30 days; writes specs, plans and SDD ledgers into `v<current>/` |

A first draft is not a revision of anything, so **initial bootstrap logs no changes**
— `v1/changelog/` starts empty and gets its first day file when the first task or change lands.
