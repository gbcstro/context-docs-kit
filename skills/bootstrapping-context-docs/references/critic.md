# The Critic Checklist

<!-- context-docs-kit:shared — canonical copy lives in shared/references/. Edit there, then `npm run sync`. -->

The review stage. On a host with subagents this is `context-doc-critic`; without
them it is you, in **a separate turn**, re-opening the draft cold.

That separation is the whole mechanism. A writer checking a sentence as it writes
it finds nothing — the blind spot that produced the draft is still loaded. Finish
the draft, stop, then read the file as if someone else wrote it and you have been
asked to find what is wrong with it before the user sees it.

**Read-only.** Produce findings. The decision about what to fix and what to park
comes after, in the main conversation.

## What you need in front of you

The draft, the approved answers it was built from, and every doc already approved
upstream in the `Depends on:` chain. A finding about a contradiction is worthless
if you did not open the doc being contradicted.

---

## Hunt, in priority order

### 1. Invented specifics — the highest-severity class

Any concrete value that does not trace to an approved answer: numbers, prices,
limits, thresholds, timeframes, library names, service names, versions, field
names, metric targets.

The most damaging defect available. An invented specific reads as decided, nobody
revisits it, and every downstream doc inherits it. Quote it, locate it, and say
whether it should be **removed**, **parked in Open Questions**, or **confirmed
with the user**.

### 2. Decisions recorded without their cost

A choice stated as fact with no tradeoff attached. "Uses local-first sync" versus
"local-first with last-write-wins, meaning conflicting edits from two devices
resolve by timestamp and the older edit is lost."

Consequential means expensive to reverse: storage model, vendor, auth strategy,
monetization, identity strategy, hosting.

### 3. Contradictions with upstream docs

- Does `SCHEMA.md` have a home for every `PRODUCT.md` §4 field? **An unhomed field is a silent scope drop.**
- Does `SCHEMA.md` assume an engine, ORM, or migration tool `ARCHITECTURE.md` never names?
- Does `DESIGN.md` have a screen for every feature, and is every screen reachable by a navigation path?
- Does `RULES.md` reference docs outside the set, or omit a rule for a tool the architecture depends on?
- Does anything contradict the binding constraint? That is the most serious contradiction possible.

### 4. History narration — the present-tense violation

Grep the draft for the banned phrases in `references/history-discipline.md`:
`previously`, `used to`, `we switched`, `changed from`, `as of v`, `originally`,
`no longer`, `instead of the`, `migrated from`, `formerly`, `moved away from`,
`we now`.

Every hit about a *decision* is a defect at the same severity as an invented fact,
and belongs in `CHANGELOG_v<current>.md` instead. Hits about *runtime behaviour*
("once the token expires the session is no longer valid") are fine.

### 5. Missing constraint treatment

`ARCHITECTURE.md` only: is there a top-level section for the binding constraint
**and its resolution**? A constraint mentioned in passing, or a claim of no
binding constraint that is not stated explicitly, is a finding.

### 6. Architecture artifacts missing or unapproved

`ARCHITECTURE.md` only: the stack block, the repo tree, and the system diagram
must all be present, and must match what the user actually approved in the
presentation gate. A diagram redrawn during drafting is an invented specific in
picture form.

### 7. Worked examples missing

`RULES.md` only: every design principle in §4 carries the worked example the user
accepted. A principle stated in the abstract, with no example, is a finding — it
was either never converged on, or the example was dropped in drafting.

### 8. Doc contract violations

- Header present and correct: `**Project version:** vN`, `**Revision:** N`, `**Last updated:**`, `**Depends on:**` (absent only for `PRODUCT.md`)
- `Revision` is a bare integer, not `v3` — `v` is reserved for the project version
- Is the date the real current date, or does it look invented?
- `## Open Questions` present, even if it says none are open
- `## Next Steps` present, naming the actual next doc in the confirmed set — or the wiring step, for the last doc
- `## Out of Scope for <version>` present where the doc type calls for it, titled with the real current version
- No empty or placeholder sections; no `TBD`, `TODO`, or `<fill this in>` in the body
- Section numbering contiguous after any dropped sections

### 9. Unfalsifiable content

Claims that cannot be checked or failed: differentiation with no named point of
comparison, success metrics with no threshold or window, a design direction
("clean and modern") that rules nothing out, a rule with no enforcement path.

### 10. Handoff gaps

Does this doc give the next one what it needs? A missing platform in
`PRODUCT.md`, a missing storage decision in `ARCHITECTURE.md`, a missing entity
list in `SCHEMA.md` — each blocks the pass that follows.

---

## What not to do

- **Don't restyle.** Wording, tone and formatting preferences are not findings. The doc should sound like the user, not like you.
- **Don't demand content the user deliberately deferred.** A properly parked open question is correct, not a gap. Read `## Open Questions` before reporting anything missing.
- **Don't propose scope.** A feature the doc does not mention is out of scope, not an omission — unless an upstream doc contradicts that.
- **Don't pad.** Six real findings beat twenty with fourteen nitpicks; padding buries the ones that matter.

## Output

Most severe first:

```
[SEVERITY] Section / line — the finding

  Quote or reference the exact problem.
  Why it matters: <concrete consequence downstream>
  Resolution: remove | park in Open Questions | confirm with user | fix as <specific change>
```

**CRITICAL** — invented specific, constraint violation, upstream contradiction, silently dropped field, history narration about a decision.
**MAJOR** — uncosted consequential decision, missing contract section, unfalsifiable core claim, missing architecture artifact, principle without its worked example.
**MINOR** — numbering, handoff thinness.

End with exactly one of:

- `VERDICT: ready for gate` — nothing above MINOR remains
- `VERDICT: fix before gate — N critical, N major`

If you genuinely find nothing above MINOR, say so plainly. A clean verdict is
worth something — but reach it because the draft earned it, not because looking
harder was effort.
