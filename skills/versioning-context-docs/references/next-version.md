# Grilling for the Next Version's Scope

The closure is done. Now decide what the next version is, with the same
discipline bootstrap used: one question at a time, a recommendation with each,
real costs on consequential choices, and park what is undecided.

**The failure this prevents:** vN+1 becomes "everything we didn't finish plus
everything anyone mentioned". A version defined that way is uncloseable on the
day it opens, and once one version fails to close, none of them mean anything.

---

## Start from the carried items

They are already scope, and they are the only part of the next version that is
not a fresh decision. Lead with them, because they constrain everything else.

> Two carry over: offline sync and CSV export. Sync is the one with real
> architectural weight — it needs a server, a conflict story, and probably auth.
> Before we add anything: is v2 mainly about making sync real, or is sync one
> item among several?

If a carried item is large enough to define the version, say so. A version with
one hard thing and three small ones is honest. A version with four hard things
is a plan that will not survive contact.

---

## Question bank

Dependencies before dependents, as always. Stop when the version has a shape.

### 1. What is this version for, in one sentence?

Not a feature list — the thing that is different when it ships. "v2 makes the app
usable on two devices" tells you what belongs and what does not. "v2 adds sync,
export, and a settings screen" tells you nothing, and cannot adjudicate the next
scope argument.

Push for the sentence. It is the cheapest scope-control mechanism available.

### 2. What forces the timing?

A deadline, a demo, an App Store review window, a user waiting. Or nothing —
which is a legitimate answer and worth writing down, because it changes how much
belongs in the version.

A version with a hard date and no scope discipline ends with the date winning
and the checklist abandoned. Ask now.

### 3. Does anything about the constraint change?

Re-ask `ARCHITECTURE.md` §2's binding constraint directly. Constraints expire —
a Mac arrives, a budget appears, a second engineer joins, a compliance
requirement lands. A resolved constraint still being designed around is a real
cost, and a *new* constraint that nobody has noticed will invalidate half the
scope you are about to agree.

> Last version's constraint was no Mac, solved with EAS Build. Still true, or has
> that changed? And is there anything new that can't be traded away this time —
> the sync work usually drags a hosting cost and a data-residency question with it.

### 4. What is in, one item at a time?

For each candidate, get to a **shippable slice** with **acceptance criteria**,
the same altitude as v1's checklist. If the user cannot say what would prove it
works, it is not ready to be scope — park it as an open question.

Apply the pros/cons discipline to anything consequential. A new version is where
vendors get chosen, and a vendor recorded without confirmation poisons the docs
just as thoroughly as it did in bootstrap.

### 5. What is explicitly out?

Ask directly, and write it down. The out-of-scope list is what stops the same
argument recurring three times, and it is the section a future reader uses to
tell "we decided against it" from "we forgot".

Anything dropped at closure goes here, with its reason.

### 6. What has to be true for this to close?

The exit criteria. Usually "every item met and the user says so", but ask whether
anything else gates it — a deploy, a migration run against real data, someone
else's review. Write down what you learn.

### 7. Open questions

Sweep for anything undecided. Carry forward any v1 question that is still open
and still relevant; drop the ones the closure answered.

---

## Then check the docs

Three questions once scope is agreed:

1. **Does any doc need real content changes?** Those go through a full gated pass, and are logged in `CHANGELOG_v<N+1>.md`.
2. **Does the doc set change?** New scope sometimes adds a doc — a `DESIGN.md` when a UI arrives, a `SECURITY.md` when the data gets sensitive. Splice it into the chain per the bootstrap skill's `references/optional-docs.md`.
3. **Do `RULES.md` §4's worked examples still describe real seams?** New architecture moves seams. An example describing a structure the new version replaces teaches the wrong thing.

---

## What good looks like

> **v2 — two devices.**
>
> One sentence: the same habit data is correct on a phone and a tablet.
> Timing: no hard date; the constraint is still one part-time engineer.
> New constraint: data stays in the EU, so hosting is narrowed before we pick.
>
> Seven items — offline sync and export carried, plus accounts, a sync service,
> conflict surfacing, a device list, and a migration path for existing local data.
> Explicitly out: web client, sharing, notifications.
> Closes when: all seven met, and the migration has been run against a real
> v1 database.

Every part of that is checkable, and the one sentence at the top decides every
scope argument the version will have.
