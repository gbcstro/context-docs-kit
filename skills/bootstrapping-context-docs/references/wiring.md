# Wiring: Entry Scan, Brownfield Reconcile, Agent-File Merge

Three jobs. The first two run before the PRODUCT pass; the third runs after the last doc is approved.

---

## 1. Entry Scan — where do we start?

Run these checks before asking the user anything.

```
context/*.md present?
  none            -> greenfield or brownfield-code path (§2)
  some            -> RESUME
  all in set      -> nothing to bootstrap. Which skill they want depends on why:
                       docs drifted from code  -> aligning-context-docs
                       this version is finished -> versioning-context-docs
                       one doc needs a section  -> just edit it
                     Say which you think it is, and why, then let them redirect you.
```

**To resume**, read every existing doc's header and parse:

- `**Project version:**` — which version the set describes. Cross-check against the highest `context/PROGRESS/PROGRESS_v*.md`; if they disagree, say so before continuing.
- `**Revision:**` — how many times that doc has been reworked
- `**Depends on:**` — its position in the chain
- `## Next Steps` — what the previous session said comes next
- `context/PROGRESS/PROGRESS_v*.md` §4 — provisional decisions already in force; carry them forward as decisions, and do not re-ask unless the user reopens one

A doc carrying the legacy `**Status:** Draft vN` header gets migrated per `references/doc-contract.md` — one line saying what you changed, no edit to the body.

Then start the per-doc pass at **the first doc in the set that has no file**. Treat existing approved docs as fixed input, not as drafts to revisit. If an existing doc contradicts something the user says now, surface the contradiction and ask which wins — never silently overwrite an approved doc.

Say where you're resuming from and why, in one line, before the first question.

---

## 2. Brownfield Reconcile — read before you ask

Two independent sources to mine: **the code** and **any pre-existing docs**.

### 2a. What the code already tells you

| Read | Yields |
|---|---|
| `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `*.csproj` | language, framework, libraries, scripts |
| `pnpm-workspace.yaml`, `turbo.json`, `nx.json`, workspace globs | monorepo layout and app boundaries |
| `prisma/schema.prisma`, `drizzle/`, `migrations/`, `*.sql` | existing entities — SCHEMA is partly already decided |
| `docker-compose.yml`, `infrastructure/`, `terraform/` | services, hosting shape, local dev topology |
| `.github/workflows/`, `.gitlab-ci.yml` | build/test/deploy pipeline, target platforms |
| `.env.example` | integrations and external dependencies |
| top-level folder layout | intended separation of concerns |

Anything answered here is a question you **do not ask**. You state it back for confirmation:

> Found in `package.json`: `fastify`, `@prisma/client`. Four migrations in `prisma/migrations/`.
> Recording the backend as Fastify + Prisma + Postgres — correct, or is something mid-migration?

### 2b. Pre-existing docs under other names

Look in `.docs/`, `docs/`, `doc/`, repo root, and any agent file. Common mappings:

| Found | Maps to |
|---|---|
| `prd.md`, `product.md`, `requirements.md`, `blueprint.md`, `spec.md` | `PRODUCT.md` |
| `architecture.md`, `design-doc.md`, `tech-design.md`, `adr/` | `ARCHITECTURE.md` |
| `schema.md`, `data-model.md`, `erd.md` | `SCHEMA.md` |
| `ui.md`, `design.md`, `style-guide.md`, `brand.md` | `DESIGN.md` |
| `screens.md`, `views.md`, `wireframes.md`, `routes.md`, `flows.md` | `SCREENS.md` |
| `ai-rules.md`, `conventions.md`, `contributing.md`, `standards.md` | `RULES.md` |

**Reconcile — never silently adopt.** Inherited docs are the highest-risk input in this whole process: they look authoritative, they were often written early, and their assumptions are unexamined. Treat their content as *claims to verify*, exactly as you'd treat a confident answer with no cost attached.

For each mapped doc:

1. Extract its actual decisions into a short list.
2. Cross-check them against what the code does. **Where a doc and the code disagree, the code is evidence and the doc is intent** — surface the gap explicitly; it is usually the most valuable thing you'll find.
3. Present the decisions for confirmation in batches by topic, one topic at a time. Flag anything stale, contradicted, or unsupported by the code.
4. Anything the old doc left vague gets **closed**, not copied across vague. Decide it, or take the cheapest-to-reverse reading and register it in `PROGRESS_v1.md` §4, or descope it. An inherited `TBD` copied into a new doc is the oldest way this set rots — `references/closing-questions.md`.

> `.docs/prd.md` lists "CSV import" as a v1 feature, but there's no parser anywhere in `apps/`
> and no CSV dependency in any manifest. Still v1, or has it slipped out of scope?

Do **not** delete or move the old docs as part of this. Propose it at the end, separately, once the new chain is approved and the user can see what replaced what.

### 2c. Ordering note

The scan is per-doc, run as stage 1 of each pass — the `solutions-architect` scans manifests and compose files; the `data-modeler` scans migrations. Don't front-load one giant scan of everything; each persona reads with its own lens and you'd only be holding facts you can't use yet.

---


## 3. Agent-File Merge — make the docs actually get read

**An unwired `context/` folder is inert.** Excellent documents that no agent opens have zero effect on the project. This step is what closes the loop, and the work is not complete without it.

The full procedure — which file, the three blocks to merge, and the import-vs-inline
split that differs by host — is in **`references/agent-file.md`**. Run it now, then
come back for §4.

Two things to carry in while you read it: the doc set you actually wrote (the map
table lists only docs that exist), and the binding constraint from
`ARCHITECTURE.md` §2 (it is the single most valuable Quick-Reference bullet).

---

## 4. Close the pass: PROGRESS_v1.md and CHANGELOG_v1.md

The last two files, in this order. Full spec in `references/history-discipline.md`.

**`context/PROGRESS/PROGRESS_v1.md`** — read every approved doc and derive the v1 scope: the shippable slices, each with acceptance criteria and a pointer to the doc section it came from, all unchecked. Then the explicit out-of-scope list, the §4 register of provisional decisions, and the exit criteria.

This is a gate like any other doc. Present it, take corrections, and get approval. It is the file that decides when v1 is done, so a checklist the user has not agreed to is worse than none.

Two failure modes to avoid:

- **Inventing items.** Every checklist item traces to an approved doc section, and the pointer is written down. An item with no source is scope nobody agreed to.
- **Dropping altitude.** Items are shippable slices, not tasks. "Habit CRUD" with three acceptance criteria, not "add a column to the habits table".

**`context/PROGRESS/CHANGELOG_v1.md`** — created with its title line and nothing else. A first draft is not a revision of anything, so there is nothing to log yet.

Always `v1`. Even if the project has shipped before, what shipped was never tracked here.

### Then hand off

Tell the user, in two lines, what the other two skills are for:

> Changes inside v1 — a decision reversed, a doc that no longer matches the
> code — go through `aligning-context-docs`, which rewrites the doc and puts the
> reason in `CHANGELOG_v1.md`. When every box in `PROGRESS_v1.md` is checked and
> you say v1 is done, `versioning-context-docs` closes it and opens v2.
