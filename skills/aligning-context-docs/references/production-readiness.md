# Production Readiness: The Operating Envelope

<!-- context-docs-kit:shared — canonical copy lives in shared/references/. Edit there, then `npm run sync`. -->

**Bootstrap:** load this during the `ARCHITECTURE.md` pass, and again for the
Usage & Scale questions in `PRODUCT.md`, the Data Lifecycle section of
`SCHEMA.md`, and the Production Standards section of `RULES.md`.
**Aligning:** it is the lens for envelope drift — whether the code still fits the
numbers and failure rules the docs commit to. **Versioning:** a new version is the
moment the envelope most often moves; re-ask it in the scope grill (its question 4).

**What this is for.** "Will it hold up with real users, and can it grow?" is
usually answered with a mood. Here it is answered with closed decisions: how much
load, how much data, how much downtime, how much loss, what breaks first, what
happens when a dependency fails, how a bad change gets undone. Written down,
those are checkable. Unwritten, they are discovered in production.

**What this is not.** It is not a mandate to build for scale nobody asked for.
Most projects are best served by a boring monolith, one relational database and
managed hosting, and this method says so when the numbers say so. The goal is to
**know the envelope and the first thing that breaks**, not to pre-build the
second thing.

---

## The one idea: one-way doors and two-way doors

Every scaling decision has a reversal cost, and the kit already prices decisions
by reversal cost. Sort them the same way.

| | One-way door | Two-way door |
|---|---|---|
| Reversal cost | a data migration, a client break, a rewrite | a config change, a deploy, an afternoon |
| Examples | identity strategy, tenancy model, source of truth and consistency model, public API or wire contract, partition key, data residency, auth model, event/message schema | instance size, cache layer, CDN, read replica, a queue behind an existing interface, rate limits, an added index |
| Rule | **design for the horizon** — the load, data and availability the user says is plausible at the ceiling they gave | **defer, with a named trigger** — the measurable signal that says do it now |

This is the whole discipline. Spending effort on a two-way door early is waste.
Spending none on a one-way door is the month-nine rewrite. If you cannot tell
which kind a decision is, ask what reversing it would touch: data already
written, or clients already shipped, makes it one-way.

---

## Stakes: set the depth before asking anything

A weekend tool and a payments system do not get the same questions. Ask once, at
the doc-set proposal, in the user's terms:

> If this were down for an hour, lost a day of data, or leaked its data — who is
> hurt, and how badly?

Recommend a level from what `PRODUCT.md` already says (paying users, other
people's data, regulated domain, a team on call) and let the user correct it.

| Stakes | Means | Depth |
|---|---|---|
| **Low** | solo, internal or prototype; an outage annoys the author | E1, E2, E5, E6, E8, E9 and the one-way doors. Observability is logs and error reporting. No SLO. |
| **Moderate** | real users or revenue depend on it; a small team | the full bank. Targets for availability, durability and latency, alerting on user-visible symptoms, a rollback that has been used, backups that have been restored. |
| **High** | money, health, regulated or multi-tenant data, an on-call rotation | everything in Moderate, plus a threat model (`SECURITY.md`), `OPS.md`, a capacity plan, and load or failure tests as acceptance criteria. |

If the user cannot choose, **close it at the higher of the two candidates.**
Raising stakes later is a retrofit; dropping a requirement later is a deletion.
Register it in `PROGRESS_v<N>.md` §4 like any provisional decision.

Record the stakes in `ARCHITECTURE.md` §Operating Envelope. They are the reason
every later depth decision is what it is.

---

## The question bank

One at a time, each with a recommendation and its cost, like every other pass.
**Read `PRODUCT.md` §Usage & Scale Expectations first** and propose from it —
asking cold a question the product doc already answers erodes trust. On a repo
with real traffic, **read the measurements** (dashboards, database sizes, access
logs, cloud bills) and ask the user to confirm them. A measured number beats an
estimated one every time.

Stakes gate the depth: Low asks E1, E2, E5, E6, E8 and E9, reduces E7 to logs and
error reporting, and skips E3, E4 and E10; Moderate asks everything; High asks
everything and asks for evidence. Security (E8) is never skipped — secrets and
who-can-see-whose-data matter on a hobby project too.

### E1. Load shape
Users (registered and concurrent), request or job rate at peak, peak-to-average
ratio, read-to-write ratio, and what causes bursts (a launch, a cron, a batch
import, a marketing push). Get **now** and the **ceiling the user thinks is
plausible in twelve months.** Orders of magnitude are enough — tens, thousands,
millions.

### E2. Data volume and growth
Rows or bytes per entity per user per period, the entity that dominates, and how
long data must be kept. **Do the arithmetic out loud** and let the user correct
the inputs:

> 1,000 users × ~20 entries a day × 365 ≈ 7.3M `entry` rows a year. One Postgres
> node holds that comfortably for years, so no partitioning and no archive tier.
> Which input is wrong?

The arithmetic is derived, not invented — every input is the user's. That is the
difference between a capacity number and a guess.

### E3. Availability and durability
What an hour of downtime costs and to whom. How much data can be lost (**RPO**)
and how long recovery may take (**RTO**). Whether planned maintenance windows are
acceptable. Ask in plain language — "a day of lost data is survivable, an hour of
downtime is not" — and write what they said. **Never supply a number of nines.**
Name every single point of failure and record it as accepted or removed. Then:
what is backed up, where, how often, and **has a restore ever been run.** A backup
nobody has restored is a hope.

### E4. Latency
Which one to three user-visible interactions have a felt latency bar, the target
(the user's number), and **how it is measured** — where, over what window, at what
percentile. Background work is exempt unless a user waits on it.

### E5. The first bottleneck, and the seam
Given E1–E4, name the first component that breaks as load grows, at roughly what
multiple of the ceiling, and why: write throughput on the primary, a third-party
rate limit, a single worker, memory per request, one unindexed join. Present it
as reasoning for the user to correct. Then name the **seam** — the place cheap
relief gets added later (a cache in front of the read path, a queue behind the
request handler, a replica behind the repository interface). **Annotate the
bottleneck on the system diagram**; it is the second most valuable mark on it
after the binding constraint.

Also state the **ceiling**: the load beyond which the design is not claimed to
work. An honest upper bound is more useful than an implied infinite one.

### E6. Failure modes and concurrency
For each external dependency and each stateful component, three facts: what
happens when it is **slow**, **down**, and **wrong** — and what the user sees.
Then the rules that make those answers real:

- every network call has a timeout
- retries only on operations that are safe to repeat, with backoff and jitter, and a bound
- anything with a side effect that may be retried (a payment, an email, a webhook) has an **idempotency key**
- the system degrades (serves stale, queues, disables the feature) or fails fast; it does not hang
- concurrent writers: what must be atomic, and what the constraint is that enforces it (a unique index, a transaction, a version column) — ties to `SCHEMA.md`

Record as a table: dependency, failure, behaviour.

### E7. Observability
The minimum that answers "is it working, and if not, why": structured logs with a
request or correlation ID that survives service boundaries, error reporting, a
health endpoint, and one to three metrics tied to the success metrics or the E3/E4
targets. Alert on **user-visible symptoms** (error rate, latency, failed jobs),
not on causes (CPU). Who is told, by what channel, and who acts. Logs never carry
secrets or personal data.

### E8. Security baseline
The untrusted-input surfaces. The authentication **and authorization** model —
specifically who can see whose data, and whether that is enforced at the data
layer (row-level filter, tenant-scoped repository) or only in the UI. Where
secrets live. How dependencies are scanned. Which fields are personal data, how
long they are kept and how they are deleted. Any compliance regime. A real
threat model or regime is the trigger for adding `SECURITY.md` to the doc set (the bootstrap skill's optional-docs guidance).

### E9. Change safety
How a change reaches production and **how it is undone.** The CI gates that must
pass. The environments. The migration policy: **backward-compatible with the
previous release** (expand, then contract), no long locks on hot tables, forward-only
unless a down path has been exercised. Whether a staged rollout or a flag exists.
What "roll back" means in practice — usually redeploy the previous artifact — and
whether anyone has done it. Lands in `ARCHITECTURE.md` §Hosting, Deploy & Rollback
and `RULES.md` §Production Standards.

### E10. Cost
The monthly ceiling, what scales cost with load (per-request vendor fees, egress,
storage, per-seat pricing, model tokens), and cost per active user against
whatever pays for it. If there is no ceiling, say so and name what would trigger a
review.

---

## Closing it

Every number in the envelope is **the user's, or arithmetic on the user's.** A
"standard" figure — 99.9%, p95 under 200 ms, five nines, 10× headroom — that
nobody chose is an invented specific, and in this domain it is the most tempting
one. The critic treats it as CRITICAL.

When the user cannot give a number, close it per `references/closing-questions.md`
with the reversal direction decided by the door type:

| Door | Close at | Register |
|---|---|---|
| One-way | the more demanding plausible reading — design for the larger horizon | in §4, with what real traffic or data would settle it, and the cost of redoing it |
| Two-way | the smallest thing that works, with the trigger written into `## Out of Scope` | the trigger is the decision; register the threshold in §4 if the user could not pick one |

A deferral in the doc reads like any other decision, present tense:

> Read replicas are out of scope for v1. They are added when primary CPU stays
> above the user's stated threshold for a week or p95 read latency exceeds the
> target in §5.

---

## The YAGNI guard

A component enters `ARCHITECTURE.md` only when an envelope number or a failure
mode demands it, and **the doc says which one.** "We might need a queue at scale"
is not a reason. "At the 60 rps ceiling the user gave, the 3 s email call blocks
the request thread" is. If you catch yourself recommending a cache, a queue,
a second service or an orchestrator, finish this sentence first: *"at the ceiling
you gave, X breaks, because Y."* If you cannot, it does not go in.

The opposite failure is equally real: a one-way door left unexamined because "we'll
scale later." Tenancy added after launch touches every table. A public API
without a version is a break waiting to happen. Examine those now, briefly.

---

## The envelope card (presented at the Architecture gate)

Alongside the stack block, the tree and the diagram, present one more artifact,
because a paragraph about scale gets nodded at and a card with numbers gets
corrected. Figures below are illustrative; yours come from E1–E10.

```
Stakes         moderate     paying customers; an hour down costs a day of support
Load           now ~200 users, ~5 rps peak      ceiling (12 mo) ~5,000 users, ~60 rps
Data           ~2M rows/yr; `entry` dominates   kept 24 months, then deleted
Durability     lose at most 24 h; restore in 4 h   nightly snapshot, restore drilled
Latency        GET /today p95 < 300 ms          measured at the load balancer, 5-min window
First break    primary write connections, at ~15x the ceiling
Seam           repository interface -> add a replica for reads
Not scaled for >10x the ceiling; multi-region; per-tenant isolation
Deferred       read replica — primary CPU > 70% for a week
               cache — p95 read latency over target for 3 days
Cost           ~$X/month ceiling; the email vendor is the only per-request cost
```

Ask for approval of the card, not of the idea. Revise until it is right; the
approved card goes into `ARCHITECTURE.md` §Operating Envelope **verbatim**, like
the other artifacts.

On a **brownfield** repo, present what is measured today, then the card, and name
every delta.

---

## Where each answer lands

| Answer | Doc and section |
|---|---|
| E1 load, E3 expectations in the user's words, E4 targets | `PRODUCT.md` §Usage & Scale Expectations — the facts |
| Stakes, the card, E5 bottleneck and ceiling, E10 cost | `ARCHITECTURE.md` §Operating Envelope |
| E6 | `ARCHITECTURE.md` §Reliability & Failure Modes |
| E7 | `ARCHITECTURE.md` §Observability |
| E8 | `ARCHITECTURE.md` §Security Baseline; `SCHEMA.md` §Data Lifecycle & Volume for retention and deletion |
| E9 | `ARCHITECTURE.md` §Hosting, Deploy & Rollback; `RULES.md` §Production Standards |
| E2 | `SCHEMA.md` §Data Lifecycle & Volume |
| Every commitment v1 owes | `PROGRESS_v<N>.md` as a measurable acceptance criterion |

## Commitments become acceptance criteria

An envelope commitment that v1 owes is checkable or it is decoration. Write it
into `PROGRESS_v<N>.md` the way a feature is written: observable, with the method
named.

```markdown
- [ ] **Holds the stated load**
  - AC: GET /today p95 stays under the §Operating Envelope target at the ceiling load, against a seeded dataset of the stated size (`test/load/today.js`)
  - AC: killing the worker mid-job loses no job and runs none twice
  - AC: restoring last night's backup into a fresh instance succeeds and is written up in the runbook
  - Source: ARCHITECTURE.md §Operating Envelope, §Reliability & Failure Modes
```

At Low stakes this item may be two lines or absent. At High it is several items.
Either way the depth is the one the user chose, not the one you assumed.
