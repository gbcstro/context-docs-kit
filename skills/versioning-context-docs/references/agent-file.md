# Agent-File Merge — make the docs actually get read

<!-- context-docs-kit:shared — canonical copy lives in shared/references/. Edit there, then `npm run sync`. -->

**An unwired `context/` folder is inert.** Excellent documents that no agent opens have zero effect on the project. This step is what closes the loop, and the work is not complete without it.

## Which file

`references/hosts.md` settles this. To restate the rule: **standardize on `AGENTS.md` across all coding tools.** When creating an agent file, always create `AGENTS.md` so that all coding tools (Claude Code, Codex, Gemini CLI, Antigravity, Cursor, Copilot, etc.) can use the exact same file instead of identifying each one like `CLAUDE.md`, `GEMINI.md`, etc.

| Present | Wire into |
|---|---|
| `AGENTS.md`, `.agents/AGENTS.md` | that file |
| none | create `AGENTS.md` |
| legacy tool file only (`CLAUDE.md` or `GEMINI.md`) | `AGENTS.md` (or the existing file if the project explicitly prefers keeping it) |
| several of the above | wire into `AGENTS.md`; say in one line that the legacy tool files were left alone |

In a monorepo with per-package agent files (e.g. `apps/web/AGENTS.md`), wire the **root** file only. Per-package files stay scoped to their package.

## What to merge in

Three pieces. **Merge — never overwrite.** Read the file, insert or update these sections, preserve everything else verbatim.

**A. Context Docs Map** — the discovery path. Without this an agent has no reason to open any doc.

```markdown
## Context Docs Map

The `context/` folder is the source of truth for this project. Read the relevant
doc(s) before working in that area:

| Doc | Covers |
|---|---|
| [`context/PRODUCT.md`](./context/PRODUCT.md) | Product identity, purpose, target users & roles, user journeys, feature specs & business rules, monetization, success metrics |
| [`context/ARCHITECTURE.md`](./context/ARCHITECTURE.md) | Tech stack, libraries, repo architecture, APIs, DB, caching, queues/workers, file storage, webhooks, auth, containers, cloud/IaC, response time targets & scaling |
| [`context/SCHEMA.md`](./context/SCHEMA.md) | Data model |
| [`context/DESIGN.md`](./context/DESIGN.md) | Theme colors, typography, layout/spacing, UI components to be built, motion & accessibility |
| [`context/RULES.md`](./context/RULES.md) | Coding conventions, git workflow, AI assistant rules |
| [`context/PROGRESS/`](./context/PROGRESS/) | `PROGRESS_v<N>.md` is current scope & checklist; `CHANGELOG_v<N>.md` logs task completions, sessions, and decision shifts (compacted after 30 days) |
```

Include only the docs that actually exist. The "Covers" column must describe *this* project's docs, not be copied boilerplate.

**B. Quick-Reference Key Facts** — the handful of facts that prevent an agent from having to open a doc for routine work. Derive from the approved docs; keep to 4–6 bullets.

```markdown
## Quick-Reference Key Facts

- **Current version:** v1 — scope and checklist in `context/PROGRESS/PROGRESS_v1.md`
- **Repo layout:** <apps and packages, one line each>
- **Frontend:** <framework, key libraries>
- **Backend:** <framework, API style, ORM, database, cache, queues>
- **Infra & IaC:** <containers, cloud host, IaC tool, file storage>
- **Defining constraint:** <the binding constraint from ARCHITECTURE.md §2>
```

The **defining constraint** bullet matters most — it is the fact that most often prevents a wrong suggestion, and the one an agent is least likely to infer. The **current version** bullet is what stops an agent inventing scope: it points at the file that says what this version is committed to.

**C. Team Skill Ecosystem & Media Routing** — maps the project's workstreams to the integrated ecosystem skills (see `references/ecosystem.md`) so every contributor's assistant invokes the right specialized skill chain and keeps the suite updated via `npx context-docs-kit update`:

```markdown
## Team Skill Ecosystem

Keep all team skills updated to their latest upstream versions with `npx context-docs-kit update`.

| Workstream | Active Skills & Tools | How to Chain |
|---|---|---|
| **Product, Brand & Growth (Unified)** | `grill-me`, `brand-discovery`, `brand-guidelines`, `marketingskills`, `doc-coauthoring`, `internal-comms` | Interrogate positioning & audience (`grill-me` + `brand-discovery`), define CRO/SEO/GTM in `PRODUCT.md` (`marketingskills`), co-author specs (`doc-coauthoring`), and publish 3P updates (`internal-comms`) |
| **Engineering & QA Workflow** | `using-superpowers`, `ponytail`, `webapp-testing`, `skill-creator`, `grill-me` | Plan & execute TDD slices (`using-superpowers` + `ponytail`), verify web UI in Playwright before ticking `PROGRESS_v<N>.md` (`webapp-testing`), package recurring workflows (`skill-creator`) |
| **UI, Brand & Frontend Craft** | `brand-guidelines` → `design-taste-frontend` → `frontend-design` → `impeccable` | Enforce `DESIGN.md` tokens & brand spine (`brand-guidelines`), run anti-slop pre-flight (`design-taste-frontend`), build components after chat wireframe gate (`frontend-design`), run final craft audit (`impeccable`) |
| **SocMed & Website Video / Media** | `brag` → `writing-beats` → `remotion-best-practices` / `hyperframes` → `marketingskills` | Read `PRODUCT.md` + `DESIGN.md` + `CHANGELOG_v<N>.md` (`brag`), gate a Beat Sheet in chat (`writing-beats`), render code video (`remotion-best-practices`) or AI presenter video (`hyperframes`), draft launch copy (`marketingskills`) |
| **Token Efficiency** | `@caveman-ai/cli@latest`, `compact-changelog` | High-signal low-token communication and 30-day changelog compaction (`npx context-docs-kit compact-changelog`) |
```

**D. The rules, so conventions apply unconditionally** rather than only when an agent chooses to read them.

Because `AGENTS.md` is shared across all coding tools, inlining `RULES.md` §2 between markers is the universal format that works across every tool (Claude Code, Codex, Gemini CLI, Antigravity, Cursor, etc.). Tools without `@file` import support (Codex, Antigravity) cannot resolve an `@context/RULES.md` line, whereas all tools read inlined markdown text between markers.

*Universal format (recommended for cross-tool compatibility, required without import support):*

```markdown
## Rules

<!-- context-docs-kit:rules:start -->
<RULES.md §2, verbatim>
<!-- context-docs-kit:rules:end -->
```

*Hosts with `@file` import support (Claude Code, Gemini CLI, when not sharing with tools lacking import support):*

```markdown
## Rules

@context/RULES.md
```

The markers are not decoration: `aligning-context-docs` refreshes what is between them when §2 changes, and without them it would append a second, contradicting copy.

Either way, only `RULES.md` reaches the agent file this way. Do **not** import or inline the other docs — they are large, situational, and the map table already makes them discoverable. Loading all five would burn context in every conversation to no benefit.

If the user has declined the rules wiring, include the map table and skip C.

## After merging

State plainly what you changed:

> Wired into `AGENTS.md`: added a Context Docs Map (4 docs), Quick-Reference Key
> Facts, and RULES §2 inlined between markers — Codex has no `@`-import, so a
> `@context/RULES.md` line would have done nothing. Existing sections untouched.

Then note the things that keep the set alive and code quality senior-level: `RULES.md` §2 requires future work to read these docs, search for reusable assets before creating new ones, code like senior engineers adhering to pragmatic principles and official framework documentation, test and verify thoroughly, always log completed tasks and conversations to the changelog (compacting entries older than 30 days), and update the docs when decisions change. Without that section, the docs start drifting on the next change and code quality degrades.

## Refreshing an already-wired file

When you are updating rather than wiring for the first time, **merge, never overwrite**, and touch only what moved:

- **`RULES.md` §2 changed** — with import support there is nothing to do; the import picks it up. Without it, replace the text **between** the `context-docs-kit:rules` markers. Never append a second copy. If the markers are missing on an import-less host, the rules were never wired: add the block and say so.
- **A key fact changed** — stack, layout, hosting, binding constraint, current version. Update those bullets and leave the rest.
- **The doc set changed** — a doc added or dropped. Update the map table.
- **Ongoing project missing the `## Team Skill Ecosystem` section or updated `RULES.md` §2** — when running `aligning-context-docs` on a project wired by an earlier version of `context-docs-kit`, merge in **C. Team Skill Ecosystem & Media Routing** and refresh `RULES.md` §2 (between the `context-docs-kit:rules` markers) so the project immediately gains the 6-pillar skill routing and 4-step video/media pipeline.

Everything outside those blocks is the user's, including sections that look like they overlap. Preserve them verbatim.
