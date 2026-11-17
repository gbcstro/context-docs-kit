---
name: upgrading-context-docs
description: Use when the context-docs-kit skills were updated and an existing project's context/ docs should move to the newest kit template - the user asks what's new in the kit, asks to upgrade or migrate the context docs to the latest kit, or the project's agent file has an older context-docs-kit:version stamp (or none). It reports what changed since the project's kit version and applies each migration on a yes. Do not use to create docs that do not exist yet (use bootstrapping-context-docs), to fix drift between the docs and the code (use aligning-context-docs), or to close a version (use versioning-context-docs).
license: MIT
---

# Upgrading Context Docs

## Overview

The kit moves on. A project bootstrapped six months ago has a `RULES.md`, a
`context/PROGRESS/` layout and an agent file written to the template of that day.
Updating the skill changes nothing in the project by itself. This skill closes
that gap: it tells the user what the new kit brings, then moves the project onto
it, one approved step at a time.

**Core principle:** this is the kit moving, not the code or the decisions. It
never touches a decision the project made. It changes template text, layout and
wiring, and the project's own content is moved as it is.

## When to Use

- The user updated the kit and asks what's new, or how a project gets it
- The user asks to upgrade, migrate or refresh the context docs to the latest kit
- The agent file's `<!-- context-docs-kit:version X.Y.Z -->` stamp is older than the newest entry in `references/kit-changelog.md`, or missing
- `aligning-context-docs` found a kit-upgrade finding and the user wants the full walk

**Do NOT use for:** a project with no `context/` docs (`bootstrapping-context-docs`); docs that disagree with the code (`aligning-context-docs`); closing a version (`versioning-context-docs`).

## Before You Start

1. **`references/hosts.md`** — which host, and whether the agent file uses `@file` import or the inlined rules block.
2. **`references/kit-changelog.md`** — what each kit release changes in a project. This is the source for the report.
3. **`references/kit-upgrade.md`** — the exact template blocks, the layout migration and the stamp.
4. **`references/dependencies.md`** — the companion-skill preflight. Run it now, and again before the closing summary.

## Step 1 — Find where the project stands

Read the agent file (`AGENTS.md`, or the host's file per `references/hosts.md`)
for the stamp `<!-- context-docs-kit:version X.Y.Z -->`.

- **Stamp present:** every `kit-changelog.md` entry newer than X.Y.Z applies.
- **No stamp:** run the **Detect** checks of every entry, oldest first. An entry
  applies if any of its checks hits. Say that the project has no stamp.
- **Stamp equals the newest entry:** still run the newest entry's **Detect**
  checks, because a hand edit can undo an upgrade. If none hit, say the project is
  current and stop.

Also read the current version (highest open `context/PROGRESS/v*/CHECKLIST.md`,
or the flat `PROGRESS_v*.md` on the old layout). The changelog entry for this
upgrade goes there.

## Step 2 — Report what's new

One short report, before any change. For each applicable release, newest first:
its **New** lines, then the upgrade steps it would apply to *this* project. Leave
out steps whose **Detect** check does not hit.

> **context-docs-kit 2.1.0 → 2.2.0**
>
> New: per-version progress folders; superpowers specs and plans live in
> `context/`; companions installed into the repo; optional project personas.
>
> For this project:
> 1. Move `PROGRESS_v1.md` and `CHANGELOG_v1.md` into `v1/` (6 changelog entries split into day files).
> 2. Update `RULES.md` §2.1 to add the artifact-location table (Revision 4 → 5).
> 3. Install 5 missing companions into `.agents/skills/`.
> 4. Optional: propose project personas.
> 5. Stamp `AGENTS.md` with 2.2.0.

If the user only asked what's new, stop here and offer the upgrade.

## Step 3 — Apply, on a yes

Ask once for the whole list, and let the user drop items. **Never auto-edit.**
Apply in this order, because each step assumes the one before:

1. **Layout migration** — `references/kit-upgrade.md` §5, with `git mv` so history follows.
2. **`RULES.md` §2 template** — `references/kit-upgrade.md` §3–§4. The project's own rules move under §2.3 unchanged.
3. **Agent file** — refresh the `context-docs-kit:rules` block (`references/agent-file.md`). Merge; never overwrite other sections.
4. **Companions** — `references/dependencies.md`.
5. **Optional items** (project personas) — only those the user picked.
6. **Stamp** — `references/kit-upgrade.md` §6. Last, so a half-finished upgrade is never stamped as done.

Then **one changelog entry** in today's `context/PROGRESS/v<current>/changelog/YYYY-MM-DD.md`:

```markdown
## context-docs-kit upgrade 2.1.0 → 2.2.0

- **Changed:** <each step applied, one line each>
- **Why:** kit template upgrade; no project decision changed
- **Affects:** <every file touched>
```

Bump `Revision` and `Last updated` on each doc whose text changed. `Project version`
never moves.

## Step 4 — Say what you did, and what you did not

Close with what was applied, what the user declined, and anything that failed
(a companion install, a file that would not move). A declined step stays
declined this session; do not raise it again. Name it so the user knows the
project is not fully current.

## Red Flags — STOP

| Rationalization | Reality |
|---|---|
| "The new template words this rule better, I'll reword theirs" | The project's §2.3 rules were approved. Move them as they are. |
| "It's only template text, I'll apply it without asking" | Every step is offered first. The user may want to stay on the older template. |
| "No stamp, so I'll apply everything" | No stamp means run the **Detect** checks. Apply only what hits. |
| "I'll stamp first and finish the steps after" | The stamp goes last. A stamp claims the upgrade is complete. |
| "While I'm here, the docs also drifted from the code" | That is `aligning-context-docs`. Mention it, hand off, do not fix it here. |
| "One changelog entry per file is clearer" | One entry for the whole upgrade, listing every affected file. |

## Reference Index

| File | When |
|---|---|
| `references/hosts.md` | first |
| `references/kit-changelog.md` | steps 1 and 2 — what changed, and how to detect it |
| `references/kit-upgrade.md` | step 3 — template blocks, layout migration, stamp |
| `references/agent-file.md` | step 3, refreshing the agent file |
| `references/dependencies.md` | before the first step, and again at the end |
| `references/project-agents.md` | step 3, only if the user wants project personas |
| `references/history-discipline.md` | the changelog entry and Revision bumps |
| `references/ecosystem.md` | the agent file's Team Skill Ecosystem section, and each companion's source |
| `references/closing-questions.md` | when the user cannot decide on a step; close it, never leave a `TBD` |
