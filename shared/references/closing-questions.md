# Closing Questions: No Doc Ships With a Hole In It

<!-- context-docs-kit:shared — canonical copy lives in shared/references/. Edit there, then `npm run sync`. -->

**Every `context/*.md` doc is a set of decisions. There is no `## Open Questions`
section in any of them, and no doc is approved while a question inside it is
still open.**

An unanswered question left in a doc looks like honesty and behaves like a hole.
Downstream docs get written against it, code gets written against it, and because
it is *labelled* as unknown, nobody treats it as urgent. Six weeks later three
docs depend on a blank.

So a question does not get parked. It gets **closed**, one of three ways, before
the doc is drafted.

---

## The three closures

### 1. Decided

The normal path. The user picks, knowing the cost, and the doc states the
decision in present tense like every other line in it.

### 2. Provisionally decided

Used when the user genuinely cannot settle it yet — the information does not
exist, or the answer depends on something that has not happened.

**Do not stop at "we don't know". Convert it into a decision:**

1. Name the option that is **cheapest to reverse**, not the one that is best if the guess is right.
2. State what it costs to change later, concretely.
3. Get the user to accept it as the decision **in force** — not as a placeholder, as the thing the code will be built against until it changes.
4. Write it into the doc as a plain decision. **No hedging language in the doc**: no "TBD", no "probably", no "for now", no "to be decided". The doc reads exactly like a settled one, because operationally it is settled.
5. Register it in `context/PROGRESS/PROGRESS_v<N>.md` §4, with the decision in force, what would settle it, and the reversal cost.

```
> "I have no idea what to charge yet."

  Then let's not leave a blank in PRODUCT.md — a blank there
  means SCHEMA.md can't decide whether a price is a column or
  a config value, and it'll guess.

  Cheapest-to-reverse option: v1 is free, no billing code at
  all, no price anywhere in the schema. Reversing that later
  costs adding a billing integration and one migration — real
  work, but nothing you'd have to undo.

  The alternative, building the tier structure now against a
  price you'd change, costs a migration AND rewriting the
  pricing UI.

  So: v1 is free, and PRODUCT.md says so plainly. I'll register
  it as provisional — settled once you have real usage data.
  Good?
```

The doc then says *"v1 is free. There is no billing."* — not *"pricing TBD"*.

### 3. Descoped

Used when the question cannot be closed and nothing sensible can be decided
provisionally. Then the thing the question is *about* leaves the current version
and goes under `## Out of Scope for v<N>`, with the reason.

That is also a decision, and often the right one: a feature nobody can specify is
a feature nobody can build.

---

## What this is not

**It is not permission to invent.** An invented specific is still the worst
defect in the kit. Two things separate a provisional decision from an invented
one, and both are required:

| | Provisional decision | Invented specific |
|---|---|---|
| The user chose it | yes, explicitly | no |
| They knew it was unsettled | yes, you said so | no |
| It is registered with a reversal cost | yes | no |
| It was picked for reversibility | yes | no — picked for plausibility |

Writing `$4.99/mo` into a doc because it sounds reasonable is the failure this
kit exists to prevent, and nothing here softens that. `v1 is free` written after
the exchange above is a decision the user made.

**It is not a licence to rush the grill.** Closing takes more work than parking,
not less. Parking is one sentence; closing means finding the reversible option,
pricing the reversal, and getting agreement. That is the point — the cost moves
from the future reader to the present conversation, where it is far cheaper.

---

## The register: `PROGRESS_v<N>.md` §4

One place, for the whole doc set, for everything still unsettled. The docs stay
clean; the debt stays visible.

```markdown
## 4. Provisional decisions

Each of these is **in force** — the docs state them as decisions and the code is
built against them. They are listed here because new information could change
them.

- **Pricing** — *in force:* v1 is free, no billing code, no price in the schema.
  *Settled by:* real usage data from the first cohort.
  *Reversal cost:* a billing integration and one migration. Nothing to undo.
  *Recorded in:* PRODUCT.md §5.

- **Target frequency shape** — *in force:* an integer count per week.
  *Settled by:* watching whether anyone asks for specific weekdays.
  *Reversal cost:* a column type change plus a data migration; the weekday
  variant also needs a second UI surface v1 does not have.
  *Recorded in:* SCHEMA.md §3.1, DESIGN.md §5.
```

Every entry names where the decision lives, so a reader can go straight from the
register to the doc that states it.

An entry leaves the register in exactly one way: the question gets settled, the
doc is updated through the In-Version Change Protocol, and the entry is deleted
with the reason logged in `CHANGELOG_v<N>.md`. Entries are never edited into
vagueness and never silently dropped.

---

## At the gate

Before presenting any doc for approval, check it:

- No `## Open Questions` section.
- No `TBD`, `TODO`, `???`, `<fill this in>`, `to be decided`, `to be determined`, `for now`, `not sure yet`, `probably`, or a bare `?` standing in for a value.
- Every provisional decision in the doc has a matching register entry.

A hit on any of these is a doc that is not ready, at the same severity as an
invented fact. Close the question, then present.

## At version rollover

`versioning-context-docs` reads the register as part of closing a version. Each
entry is settled, carried forward with its decision still in force, or descoped.
Nothing carries silently — the same accounting every checklist item gets.
