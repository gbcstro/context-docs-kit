# History Discipline: PROGRESS_vN.md, CHANGELOG_vN.md, and In-Version Changes

<!-- context-docs-kit:shared — canonical copy lives in shared/references/. Edit there, then `npm run sync`. -->

## The shape of `context/`

```
context/
  PRODUCT.md              present tense, current state only
  ARCHITECTURE.md
  SCHEMA.md
  DESIGN.md
  SCREENS.md
  RULES.md
  PROGRESS/
    PROGRESS_v1.md        v1 scope + checklist + acceptance criteria
    CHANGELOG_v1.md       why anything changed during v1
    PROGRESS_v2.md        written only when the user closes v1
    CHANGELOG_v2.md
```

Two rules govern the whole folder:

1. **The docs say what is true. The changelog says why it changed.** Never both.
2. **The first version is always `v1`**, and only the user decides when it ends.

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

## `CHANGELOG_vN.md` — why anything changed during version N

Created empty alongside `PROGRESS_vN.md`. Appended to for the life of that
version. When the version closes, it is never written to again — vN+1 gets its own.

```markdown
# <Project> — v1 Change Log

## 2026-04-02 — ARCHITECTURE.md rev 3, SCHEMA.md rev 2
**Changed:** the local store moved from SQLite to Postgres behind a small sync service.
**Why:** multi-device turned out to be a v1 requirement after the user testing round, and SQLite has no server-side merge story — conflict resolution would have been ours to write.
**Affects:** ARCHITECTURE.md §5 and §7, SCHEMA.md §3 (added `sync_conflicts`), PROGRESS_v1.md checklist item "Daily check-in" (offline behaviour AC added).

## 2026-04-09 — SCHEMA.md rev 3
**Changed:** `habit.target_frequency` is an integer count per week, not a weekday bitmask.
**Why:** the §4 provisional decision is settled — nobody asked for weekday-specific targets, so the simpler shape stands permanently.
**Affects:** SCHEMA.md §3.1, PROGRESS_v1.md §4 (question closed).
```

Every entry carries all four parts. **Affects** is the one that gets skipped and
the one that makes the file useful: it is how a later reader finds the blast
radius of a decision without re-deriving it.

---

## The In-Version Change Protocol

This is the procedure whenever something changes and the project version does
**not** move. It is the single most-violated rule in the whole kit, because
explaining a change inside the doc feels helpful in the moment.

1. **Rewrite the doc into the new decision.** Delete the old text. Do not annotate it, contrast it, or explain it. When you are done the doc reads as if it had always said this.
2. **Bump `**Revision:**` and `**Last updated:**`.** `**Project version:**` does not move.
3. **Append the entry to `CHANGELOG_v<current>.md`** — changed, why, affects. The reason lives here and nowhere else.
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
| `bootstrapping-context-docs` | `PROGRESS_v1.md` at the end of the pass; creates `CHANGELOG_v1.md` empty |
| `aligning-context-docs` | changelog entries and doc revisions via the protocol above; proposes checklist ticks |
| `versioning-context-docs` | closes `PROGRESS_vN.md`, opens `PROGRESS_v(N+1).md` and `CHANGELOG_v(N+1).md` |

A first draft is not a revision of anything, so **initial bootstrap logs nothing**
— `CHANGELOG_v1.md` starts empty and stays empty until the first change lands.
