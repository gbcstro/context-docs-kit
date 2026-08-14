# Wiring: Entry Scan, Brownfield Reconcile, Agent-File Merge

Three jobs. The first two run before the PRODUCT pass; the third runs after the last doc is approved.

---

## 1. Entry Scan — where do we start?

Run these checks before asking the user anything.

```
context/*.md present?
  none            -> greenfield or brownfield-code path (§2)
  some            -> RESUME
  all in set      -> nothing to bootstrap; offer to revise a specific doc instead
```

**To resume**, read every existing doc's header and parse:

- `**Status:** Draft vN` — how settled it is
- `**Depends on:**` — its position in the chain
- `## Next Steps` — what the previous session said comes next
- `## Open Questions` — decisions already parked; carry them forward, do not re-ask unless the user reopens them

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
| `ai-rules.md`, `conventions.md`, `contributing.md`, `standards.md` | `RULES.md` |

**Reconcile — never silently adopt.** Inherited docs are the highest-risk input in this whole process: they look authoritative, they were often written early, and their assumptions are unexamined. Treat their content as *claims to verify*, exactly as you'd treat a confident answer with no cost attached.

For each mapped doc:

1. Extract its actual decisions into a short list.
2. Cross-check them against what the code does. **Where a doc and the code disagree, the code is evidence and the doc is intent** — surface the gap explicitly; it is usually the most valuable thing you'll find.
3. Present the decisions for confirmation in batches by topic, one topic at a time. Flag anything stale, contradicted, or unsupported by the code.
4. Anything the old doc left vague goes to `## Open Questions` — not into the new doc as if it were settled.

> `.docs/prd.md` lists "CSV import" as a v1 feature, but there's no parser anywhere in `apps/`
> and no CSV dependency in any manifest. Still v1, or has it slipped out of scope?

Do **not** delete or move the old docs as part of this. Propose it at the end, separately, once the new chain is approved and the user can see what replaced what.

### 2c. Ordering note

The scan is per-doc, run as stage 1 of each pass — the `solutions-architect` scans manifests and compose files; the `data-modeler` scans migrations. Don't front-load one giant scan of everything; each persona reads with its own lens and you'd only be holding facts you can't use yet.

---

## 3. Agent-File Merge — make the docs actually get read

**An unwired `context/` folder is inert.** Five excellent documents that no agent opens have zero effect on the project. This step is what closes the loop, and the work is not complete without it.

### Detect the convention

Check in this order and use what the repo already has; do not introduce a second convention alongside an existing one:

| Present | Wire into |
|---|---|
| `CLAUDE.md` | `CLAUDE.md` |
| `GEMINI.md` | `GEMINI.md` |
| `AGENTS.md`, `.agents/AGENTS.md` | that file |
| several of the above | the root-level one, and mention the others exist |
| none | create `CLAUDE.md`, or ask if the user works with a different assistant |

In a monorepo with per-package agent files (e.g. `apps/web/GEMINI.md`), wire the **root** file only. Per-package files stay scoped to their package.

### What to merge in

Three pieces. **Merge — never overwrite.** Read the file, insert or update these sections, preserve everything else verbatim.

**A. Context Docs Map** — the discovery path. Without this an agent has no reason to open any doc.

```markdown
## Context Docs Map

The `context/` folder is the source of truth for this project. Read the relevant
doc(s) before working in that area:

| Doc | Covers |
|---|---|
| [`context/PRODUCT.md`](./context/PRODUCT.md) | Features, monetization, success metrics — the what and why |
| [`context/ARCHITECTURE.md`](./context/ARCHITECTURE.md) | Tech stack, infra, hosting, build pipeline |
| [`context/SCHEMA.md`](./context/SCHEMA.md) | Data model |
| [`context/DESIGN.md`](./context/DESIGN.md) | UI/UX direction, navigation, visual system |
| [`context/RULES.md`](./context/RULES.md) | Coding conventions, git workflow, AI assistant rules |
```

Include only the docs that actually exist. The "Covers" column must describe *this* project's docs, not be copied boilerplate.

**B. Quick-Reference Key Facts** — the handful of facts that prevent an agent from having to open a doc for routine work. Derive from the approved docs; keep to 4–6 bullets.

```markdown
## Quick-Reference Key Facts

- **Monorepo layout:** <apps and packages, one line each>
- **Frontend:** <framework, key libraries>
- **Backend:** <framework, ORM, database>
- **Hosting:** <where it runs>
- **Defining constraint:** <the binding constraint from ARCHITECTURE.md>
```

The **defining constraint** bullet matters most — it's the fact that most often prevents a wrong suggestion, and the one an agent is least likely to infer.

**C. Rules import** — so conventions apply unconditionally rather than only when an agent chooses to read them:

```markdown
## Rules

@context/RULES.md
```

The `@` prefix loads the file into every conversation. Use it for `RULES.md` only. Do **not** `@`-import the other docs — they're large, situational, and the map table already makes them discoverable. Importing all five would burn context in every conversation to no benefit.

If the user declined the import during the doc-set discussion, include the map table and skip section C.

### After merging

State plainly what you changed:

> Wired into `GEMINI.md`: added Context Docs Map (3 docs), Quick-Reference Key Facts,
> and an `@context/RULES.md` import. Existing sections untouched.

Then confirm the set is complete, and note the one thing that keeps it alive: `RULES.md` contains the rules requiring future work to read these docs and update them when decisions change. Without that section the docs start drifting on the next change.

### 4. Write the PROGRESS snapshot

The last step of any full bootstrap pass — first-time bootstrap, or a later pass that meaningfully expanded the doc set — is writing the next `context/PROGRESS/PROGRESS_vN.md`: a scope summary of the doc set as it stands, per `references/changelog-and-progress.md`. A pass that only revised one existing doc does not get a new snapshot; log that in `context/CHANGE_LOG.md` instead.
