# Agent-File Merge — make the docs actually get read

<!-- context-docs-kit:shared — canonical copy lives in shared/references/. Edit there, then `npm run sync`. -->

**An unwired `context/` folder is inert.** Excellent documents that no agent opens have zero effect on the project. This step is what closes the loop, and the work is not complete without it.

## Which file

`references/hosts.md` settles this. To restate the rule: **use the agent file the repo already has**, and do not introduce a second convention alongside an existing one.

| Present | Wire into |
|---|---|
| `CLAUDE.md` | `CLAUDE.md` |
| `GEMINI.md` | `GEMINI.md` |
| `AGENTS.md`, `.agents/AGENTS.md` | that file |
| several of the above | the one belonging to the detected host; say in one line that the others exist and were left alone |
| none | create the file matching the detected host — `CLAUDE.md`, `AGENTS.md`, or `GEMINI.md` |

In a monorepo with per-package agent files (e.g. `apps/web/GEMINI.md`), wire the **root** file only. Per-package files stay scoped to their package.

## What to merge in

Three pieces. **Merge — never overwrite.** Read the file, insert or update these sections, preserve everything else verbatim.

**A. Context Docs Map** — the discovery path. Without this an agent has no reason to open any doc.

```markdown
## Context Docs Map

The `context/` folder is the source of truth for this project. Read the relevant
doc(s) before working in that area:

| Doc | Covers |
|---|---|
| [`context/PRODUCT.md`](./context/PRODUCT.md) | Features, monetization, success metrics — the what and why |
| [`context/ARCHITECTURE.md`](./context/ARCHITECTURE.md) | Tech stack, repo layout, system diagram, infra, build pipeline |
| [`context/SCHEMA.md`](./context/SCHEMA.md) | Data model |
| [`context/DESIGN.md`](./context/DESIGN.md) | UI/UX direction, navigation, visual system |
| [`context/RULES.md`](./context/RULES.md) | Coding conventions, git workflow, AI assistant rules |
| [`context/PROGRESS/`](./context/PROGRESS/) | `PROGRESS_v<N>.md` is the current version's scope and checklist; `CHANGELOG_v<N>.md` records why anything changed during it |
```

Include only the docs that actually exist. The "Covers" column must describe *this* project's docs, not be copied boilerplate.

**B. Quick-Reference Key Facts** — the handful of facts that prevent an agent from having to open a doc for routine work. Derive from the approved docs; keep to 4–6 bullets.

```markdown
## Quick-Reference Key Facts

- **Current version:** v1 — scope and checklist in `context/PROGRESS/PROGRESS_v1.md`
- **Repo layout:** <apps and packages, one line each>
- **Frontend:** <framework, key libraries>
- **Backend:** <framework, ORM, database>
- **Hosting:** <where it runs>
- **Defining constraint:** <the binding constraint from ARCHITECTURE.md §2>
```

The **defining constraint** bullet matters most — it is the fact that most often prevents a wrong suggestion, and the one an agent is least likely to infer. The **current version** bullet is what stops an agent inventing scope: it points at the file that says what this version is committed to.

**C. The rules, so conventions apply unconditionally** rather than only when an agent chooses to read them.

This is the one piece that differs by host. Check `references/hosts.md` and use the right form — the wrong one is inert text, and the rules then silently never apply.

*Hosts with `@file` import support (Claude Code, Gemini CLI):*

```markdown
## Rules

@context/RULES.md
```

*Hosts without it (Codex, Antigravity)* — copy `RULES.md` §2, and only §2, between markers:

```markdown
## Rules

<!-- context-docs-kit:rules:start -->
<RULES.md §2, verbatim>
<!-- context-docs-kit:rules:end -->
```

The markers are not decoration: `aligning-context-docs` refreshes what is between them when §2 changes, and without them it would append a second, contradicting copy.

Either way, only `RULES.md` reaches the agent file this way. Do **not** import or inline the other docs — they are large, situational, and the map table already makes them discoverable. Loading all five would burn context in every conversation to no benefit.

If the user has declined the rules wiring, include the map table and skip C.

## After merging

State plainly what you changed:

> Wired into `AGENTS.md`: added a Context Docs Map (4 docs), Quick-Reference Key
> Facts, and RULES §2 inlined between markers — Codex has no `@`-import, so a
> `@context/RULES.md` line would have done nothing. Existing sections untouched.

Then note the one thing that keeps the set alive: `RULES.md` §2 requires future work to read these docs and update them when decisions change. Without that section, the docs start drifting on the next change.

## Refreshing an already-wired file

When you are updating rather than wiring for the first time, **merge, never overwrite**, and touch only what moved:

- **`RULES.md` §2 changed** — with import support there is nothing to do; the import picks it up. Without it, replace the text **between** the `context-docs-kit:rules` markers. Never append a second copy. If the markers are missing on an import-less host, the rules were never wired: add the block and say so.
- **A key fact changed** — stack, layout, hosting, binding constraint, current version. Update those bullets and leave the rest.
- **The doc set changed** — a doc added or dropped. Update the map table.

Everything outside those blocks is the user's, including sections that look like they overlap. Preserve them verbatim.
