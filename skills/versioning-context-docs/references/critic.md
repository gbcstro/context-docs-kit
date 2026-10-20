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
limits, thresholds, response-time targets (`p50`/`p95`/`p99` ms), SLO percentages,
TTL values, timeframes, library names, cloud/IaC service names, versions, field
names, metric targets.

The most damaging defect available. An invented specific reads as decided, nobody
revisits it, and every downstream doc inherits it. Quote it, locate it, and say
whether it should be **removed**, **confirmed with the user**, or **converted
into a registered provisional decision** per `references/closing-questions.md`.

A value that traces to a `PROGRESS_v<N>.md` §4 register entry is **not** an
invented specific — it is a provisional decision the user made. Check the
register before flagging.

### 2. Decisions recorded without their cost

A choice stated as fact with no tradeoff attached. "Uses local-first sync" versus
"local-first with last-write-wins, meaning conflicting edits from two devices
resolve by timestamp and the older edit is lost."

Consequential means expensive to reverse: repository approach, API protocol,
storage model, caching & invalidation strategy, queue broker, file storage
topology, webhook architecture, auth & multi-tenancy strategy, monetization,
identity strategy, containers/cloud/IaC hosting, and scaling model.

### 3. Contradictions with upstream docs & doc completeness

- **`PRODUCT.md` completeness:**
  - Does it establish the app's identity, positioning statement, core purpose, non-negotiable product tenets ("X over Y" trade-offs that rule things out), and domain mental model / ubiquitous language glossary (§1)?
  - Does it define concrete target segments, explicit anti-personas (who we are *not* building for), single- vs. multi-user tenancy, and user roles with an explicit capability/permission matrix (§2)?
  - Does it name a specific incumbent/status-quo habit, state differentiation as a *structural mechanism*, and define the repeatable core value loop (§3)?
  - Does it define the v1 scope posture, functional surface map (§4.1), and end-to-end user journeys from onboarding/first-value to core and retention flows (§4.2)?
  - Does *every* feature in §4 specify: (1) purpose & outcome, (2) user capabilities & actions, (3) business rules, calculations & state transitions, (4) enumerated captured & derived fields with types/constraints, and (5) edge cases, limits & empty/error states?
- **Downstream alignment:**
  - Does `ARCHITECTURE.md` cover every capability, platform, and touchpoint `PRODUCT.md` §4 & §6 implies (e.g., file uploads, webhooks, notifications, background jobs, payments, offline/real-time sync) without silently dropping infrastructure for one?
  - Does `SCHEMA.md` have a home for every `PRODUCT.md` §4 field, honor domain glossary terms (§1.4), and enforce tenancy/roles (§2.3)? **An unhomed field is a silent scope drop.**
  - Does `SCHEMA.md` assume an engine, ORM, migration tool, outbox/webhook table, or tenancy strategy `ARCHITECTURE.md` never names?
  - Does `DESIGN.md` define semantic tokens, typography scales, layout rules, and component states for every UI surface and component implied by `PRODUCT.md` §4, without raw hex or unstated states?
  - Does `RULES.md` reference docs outside the set, or omit a rule for a tool (ORM migrations, IaC, linter, test runner) the architecture depends on?
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

`ARCHITECTURE.md` only: is there a top-level section (§2) for the binding constraint
**and its resolution**? A constraint mentioned in passing, or a claim of no
binding constraint that is not stated explicitly, is a finding.

### 6. Architecture artifacts & system completeness

`ARCHITECTURE.md` only:
- The stack block (§1.1), the repo tree (§3.2), and the system diagram (§4.2) must all be present, and must match what the user actually approved in the presentation gate. A diagram redrawn during drafting is an invented specific in picture form.
- Check for unaddressed architectural mechanics where applicable: module dependency direction rules (§3.4), API envelope/pagination/rate-limiting (§6), DB connection pooling/migrations/conflict resolution (§7), cache TTLs and exact invalidation triggers (§8), queue retries/idempotency/DLQ (§9), file upload presigned vs. proxy flow and quotas (§10), webhook signature verification and deduplication (§11), auth token lifecycle and tenant isolation (§12), container/cloud/IaC state management (§13–14), and concrete target response times (`p50`/`p95`/`p99`), scaling triggers, RPO/RTO, and rollback mechanics (§14–15).

### 7. Worked examples missing

`RULES.md` only: every design principle in §4 carries the worked example the user
accepted. A principle stated in the abstract, with no example, is a finding — it
was either never converged on, or the example was dropped in drafting.

### 8. Doc contract violations

- Header present and correct: `**Project version:** vN`, `**Revision:** N`, `**Last updated:**`, `**Depends on:**` (absent only for `PRODUCT.md`)
- `Revision` is a bare integer, not `v3` — `v` is reserved for the project version
- Is the date the real current date, or does it look invented?
- **No `Open Questions` section**, and no `TBD`, `TODO`, `???`, `to be decided`, `to be determined`, `for now`, `not sure yet`, `probably`, or a bare `?` standing in for a value. Docs carry decisions, not holes.
- Every provisional-sounding decision in the doc has a matching §4 register entry, and every §4 entry names a doc section that actually states it
- `## Next Steps` present, naming the actual next doc in the confirmed set — or the wiring step, for the last doc
- `## Out of Scope for <version>` present where the doc type calls for it, titled with the real current version
- No empty or placeholder sections; no `TBD`, `TODO`, or `<fill this in>` in the body
- Section numbering contiguous after any dropped sections

### 9. Unfalsifiable content

Claims that cannot be checked or failed: product tenets that are empty platitudes
rather than "X over Y" trade-offs, differentiation with no named point of
comparison, success metrics with no threshold or window, performance claims
("fast API", "low latency", "highly scalable") without target response times
(`p50`/`p95`/`p99`), timeouts, or scaling triggers, a design direction
("clean and modern") that rules nothing out, or a rule with no enforcement path.

### 10. Handoff gaps

Does this doc give the next one what it needs? Missing platform, tenancy, or
touchpoints in `PRODUCT.md`, missing storage/ORM/migration/tenancy decision in
`ARCHITECTURE.md`, a missing entity list in `SCHEMA.md` — each blocks the pass
that follows.

---

## What not to do

- **Don't restyle.** Wording, tone and formatting preferences are not findings. The doc should sound like the user, not like you.
- **Don't demand content the user deliberately descoped.** Read `## Out of Scope` and the `PROGRESS_v<N>.md` §4 register before reporting anything missing — a registered provisional decision and an explicit descope are both correct, not gaps.
- **Don't propose scope.** A feature the doc does not mention is out of scope, not an omission — unless an upstream doc contradicts that.
- **Don't pad.** Six real findings beat twenty with fourteen nitpicks; padding buries the ones that matter.

## Output

Most severe first:

```
[SEVERITY] Section / line — the finding

  Quote or reference the exact problem.
  Why it matters: <concrete consequence downstream>
  Resolution: remove | confirm with user | close as a registered provisional decision | fix as <specific change>
```

**CRITICAL** — invented specific, constraint violation, upstream contradiction, silently dropped field, history narration about a decision, an unclosed question left in the doc.
**MAJOR** — uncosted consequential decision, missing contract section, unfalsifiable core claim, missing architecture artifact, principle without its worked example.
**MINOR** — numbering, handoff thinness.

End with exactly one of:

- `VERDICT: ready for gate` — nothing above MINOR remains
- `VERDICT: fix before gate — N critical, N major`

If you genuinely find nothing above MINOR, say so plainly. A clean verdict is
worth something — but reach it because the draft earned it, not because looking
harder was effort.
