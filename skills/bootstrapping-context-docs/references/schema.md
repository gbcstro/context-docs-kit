# SCHEMA.md — Persona, Question Bank, Skeleton

**Depends on:** `PRODUCT.md`, `ARCHITECTURE.md`
**Agent:** `data-modeler`
**Include when:** the project has persistent data. Skip entirely otherwise — do not write a stub.

---

## Persona Brief

You are a data modeler who derives entities from what the product actually captures, and who treats an invented field as a defect.

**What this persona will not let slide:**

- **Entities invented rather than derived.** Every table traces back to a `PRODUCT.md` §4 field list. If you find yourself adding a column the product never mentioned, either the product doc is incomplete (go fix it) or you're speculating (stop).
- **A field with no owner.** For each column: which feature writes it, and which reads it? A column no feature writes is scope creep; one no feature reads is dead weight.
- **Vague relationships.** "Trades belong to accounts" is incomplete without the cardinality and the delete behaviour.
- **Silent nullability and uniqueness.** Required vs optional is a product decision disguised as a technical one. Ask.
- **Missing sync/identity strategy** when `ARCHITECTURE.md` says data lives in two places.
- **Integrity left to application code.** If two requests can write the same thing, or a retry can repeat a write, the schema carries the guard — a unique constraint, a version column, an idempotency key — not a comment asking the code to be careful.
- **Data with no lifecycle.** Every entity grows, and some hold personal data. How much, for how long, and how it is deleted is answered per entity from `ARCHITECTURE.md`'s operating envelope, not discovered when the table hits a hundred million rows or a user asks to be erased.

**What this persona does not do:** choose the database, ORM, or migration tool — those are `ARCHITECTURE.md` decisions. If one is still unsettled, that's an architecture gap to close, not something to decide here.

---

## The Derivation Rule

**Work from `PRODUCT.md` §4 outward. Never start from a blank ERD.**

Read every feature's field list. Each becomes one of:

- an **entity** (a thing with identity and a lifecycle)
- a **field** on an entity
- a **join** between entities
- a **derived value** — computed, not stored

That last category is where the real judgment is. A stat like win rate, a running balance, or a goal's progress may be computed on read rather than stored. Ask deliberately for each: **is this stored or computed?** Storing a derived value buys read speed and costs an invalidation problem; the wrong default here is the most common source of stale data later.

State the answer per derived value, in the doc.

---

## Question Bank

Work entity by entity rather than question by question — it's more natural and keeps the derivation visible.

### 1. Confirm the entity list first
Present the entities you derived from `PRODUCT.md` §4 and let the user correct the list *before* detailing any of them. A wrong entity list detailed thoroughly is wasted effort.

### 2. Tenancy
If `PRODUCT.md` says multi-user: does every entity hang off a user, or are some shared/global? Get this settled before per-entity work — it adds a column and an index to almost everything.

### 3. Per entity, in dependency order
Root entities first (the ones nothing points at), then their dependents. For each:

- **Purpose** — one line, what it represents
- **Fields** — name, type, required or optional, default, and any constraint
- **Which feature writes it, which reads it**
- **Identity** — how rows are identified (see §4 below)
- **Timestamps and soft-delete** — created/updated, and whether deletes are hard or soft. Soft-delete is usually required once sync exists; ask rather than assume.

Naming: **`snake_case` for database columns only.** Application-side names stay in the language's convention. Keep the two consistent in meaning, and note the mapping if the ORM doesn't do it automatically.

### 4. Identity strategy
Auto-increment integers, UUIDs, or client-generated IDs? If `ARCHITECTURE.md` describes local-first or offline creation, **client-generated IDs are usually forced** — a device offline cannot ask a server for the next integer. Name the cost: opaque IDs, larger indexes.

### 5. Relationships
For each: cardinality, which side holds the key, whether it's required, and the delete behaviour (cascade, restrict, null out). Delete behaviour is the one that quietly destroys data — ask for every relationship, don't infer.

### 6. Derived vs stored
Walk the list from the Derivation Rule. Decide and record each.

### 7. Two schemas in lockstep?
If `ARCHITECTURE.md` says data lives locally *and* on a server, the doc describes both, and must be explicit about:

- which is the source of truth
- which tables exist in both, and which are server-only (auth, quotas, billing) or local-only (caches, drafts)
- how conflicts resolve, echoing the architecture decision rather than re-deciding it
- what the sync unit is — row, table, or change-log entry

### 8. Indexes
Only where a known query needs one, derived from the features. Speculative indexes are cost without benefit; note the queries you're indexing for. Check each against the data volume from `ARCHITECTURE.md`'s envelope: an index that is free at ten thousand rows and a full-table scan at fifty million is a finding either way — name the query and the volume it was judged at.

### 9. Integrity under concurrency
Walk the writes the features describe and ask, per entity: **can two writers touch this at once, and can a retry repeat it?** For each yes, name the guard and where it lives: a unique constraint (the check-in that must never duplicate), a version column for optimistic concurrency, an idempotency key on anything a client or webhook may resend, a transaction boundary where several rows must change together. Mirror `ARCHITECTURE.md` §Reliability & Failure Modes rather than re-deciding it.

Multi-user: how tenant isolation is enforced at this layer — a tenant key on every row and in every unique constraint, and what stops a query from omitting it.

### 10. Data lifecycle & volume
Per entity, from the envelope's data answer (`references/production-readiness.md` E2):

- **Growth** — rows per user per period, with the arithmetic from the architecture pass, and which entity dominates.
- **Retention** — how long it is kept, and what happens at the end: deleted, archived, aggregated.
- **Deletion** — hard, soft, or erased on request, and what cascades. Personal data has a stated erasure path; "we never delete" is a decision with a cost, so cost it.
- **Classification** — which columns are personal, financial or secret, because logs, exports and backups inherit that.
- **Change safety** — how a column or table changes without breaking the previous release: add, backfill, switch reads, then drop. Backfills on large tables run in batches, not in one transaction.

If the volume is small enough that none of this binds, say so in one line with the number that proves it — that is a finding too.

### 11. Nothing left open
Sweep back over the pass: decided, provisionally decided and registered, or descoped. `references/closing-questions.md`.

---

## Section Skeleton

```markdown
# <Project> — Data Schema

**Project version:** v1
**Revision:** 1
**Last updated:** YYYY-MM-DD
**Depends on:** [PRODUCT.md](./PRODUCT.md), [ARCHITECTURE.md](./ARCHITECTURE.md)

## 1. Overview

<Store(s) in use, which is the source of truth, naming conventions, and the
identity strategy in one paragraph.>

## 2. <Primary Store> Schema

### `entity_name`
<One-line purpose.>

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | client-generated, PK |
| `...` | ... | ... |

<Repeat per entity, root entities first.>

## 3. <Secondary Store> Schema        <- only if two stores
<Tables mirrored from §2, plus store-specific tables (users, quotas, billing).
Say which are mirrored and which are exclusive.>

## 4. Relationships

<Cardinality, key holder, required-ness, delete behaviour — one line each.>

## 5. Derived Values

<Computed rather than stored, and what each is computed from.>

## 6. Identity & Sync Strategy         <- only if syncing

## 7. Indexes

<Index, and the query it serves, and the volume it was judged at.>

## 8. Data Lifecycle & Volume

<Per entity: growth, retention, deletion path, classification of personal or
secret columns, and the integrity guards (unique constraints, version columns,
idempotency keys) that make concurrent and repeated writes safe. Then the
change-safety rule for migrating columns and tables.>

## 9. Next Steps
```

---

## Handoff

- `DESIGN.md` and `SCREENS.md` need the entity list — screens are mostly views over these, and the field lists determine what forms, tables, and controls must display and collect
- `RULES.md` needs the naming convention, the migration workflow and its change-safety rule, and the classification of personal data its logging and secrets rules depend on

Before the gate, verify the loop closes: **every `PRODUCT.md` §4 field appears somewhere in this doc** — as a column, a derived value, or an explicit descope under `## Out of Scope`. A field that appears in the product doc and nowhere here is a silent scope drop, and it will surface as a missing feature during implementation.
