# Kit Template Upgrade

<!-- context-docs-kit:shared — canonical copy lives in shared/references/. Edit there, then `npm run sync`. -->

A project bootstrapped by an older `context-docs-kit` has a `RULES.md` §2 written
to an older template. Code drift is the code moving away from the docs; this is
the **kit** moving away from the docs. It is checked first in every drift scan,
reported as its own group, and applied through the same In-Version Change
Protocol as any other fix.

## 1. Detect

Read `context/RULES.md` §2 and the agent file (`AGENTS.md`). The project is behind
the template when any of these holds:

- §2 has no `### 2.1 Skill Usage (Mandatory)` or no `### 2.2 Output Style: Caveman (Always On)`.
- §2.1 has no **Every work artifact lives in `context/`** table or no **Track every change in `context/`** paragraph.
- Either subsection exists but its text differs from the canonical block in §4
  below: a missing table row, a reworded scenario, no **Auto-invoke `grill-me`**
  paragraph.
- The eleven operating rules are not under `### 2.3 Operating Rules`.
- The agent file's `context-docs-kit:rules` marker block does not match
  `RULES.md` §2 (only on hosts without `@file` import; see `references/hosts.md`).

Compare text, not intent. §2.1 and §2.2 are a fixed contract, written verbatim;
any difference is drift, even one that reads as an improvement.

## 2. Report

Put it at the top of the drift report, before the code findings, under its own
heading, so it is never mistaken for a decision the project made:

> **Kit upgrade (context-docs-kit template)** — MAJOR
> `RULES.md` §2 predates §2.1 Skill Usage and §2.2 Output Style. Without them,
> assistants in this repo are never told which companion skill to use, that
> `grill-me` runs before new work, or how terse to be in chat. The fix inserts
> both subsections verbatim, moves the existing eleven rules under §2.3
> unchanged, and refreshes the rules block in `AGENTS.md`.

One finding covers the whole upgrade. Do not split it per subsection.

## 3. Apply — only on a yes

**Never auto-edit.** The upgrade is offered like every other finding
(`aligning-context-docs` Step 4), but it has only one sensible direction, so ask
a single yes/no rather than offering two directions.

On yes:

1. **Insert §2.1 and §2.2 verbatim**, from §4 below, directly under
   `## 2. AI Assistant Rules`. Replace any older or partial version of them.
2. **Put the existing rules under `### 2.3 Operating Rules`.** Move them as they
   are. Their wording was adapted to this project and approved; the upgrade does
   not re-adapt them. If one of the eleven is missing entirely, that is a
   separate finding, not part of this one.
3. **Bump `Revision` and `Last updated`** in `RULES.md`. `Project version` does not move.
4. **Log the reason in `context/PROGRESS/v<current>/changelog/`**, never in the doc:
   `context-docs-kit template upgrade: RULES.md §2 adds 2.1 Skill Usage and 2.2 Output Style; existing rules moved to 2.3 unchanged.`
5. **Refresh the agent file** (`aligning-context-docs` Step 7,
   `references/agent-file.md`): replace the text between the
   `context-docs-kit:rules` markers with the new §2. Never append a second copy.
6. **Run the companion preflight** (`references/dependencies.md`) if it has not
   run this session. §2.1 now names those skills.
7. **Migrate the layout** (§5) if the project still uses the old one.
8. **Stamp the kit version** (§6), last.

On no: change nothing, say once that the project stays on the older template,
and do not raise it again this session.

## 4. The canonical block

Insert exactly this, between `## 2. AI Assistant Rules` and the §2.3 rules:

```markdown
### 2.1 Skill Usage (Mandatory)

Invoke the matching skill from `.agents/skills/` **before** acting:

| Scenario | Skills |
|---|---|
| Task start, planning, debugging, TDD | `using-superpowers` (brainstorming, systematic-debugging, test-driven-development, verification-before-completion) |
| Writing, fixing, refactoring, reviewing code | `ponytail` (`ponytail-review`, `ponytail-audit` for reviews) |
| New feature, vague requirement, plan, or design | `grill-me` (auto-invoked — see below) |
| UI, design, frontend | `impeccable` first, then `design-taste-frontend`, `frontend-design`, `brand-guidelines` |
| Verifying live web UI | `webapp-testing` |
| Specs, RFCs, ADRs | `doc-coauthoring` |
| Release notes, status updates | `internal-comms` |
| Context docs drift or version close | `aligning-context-docs`, `versioning-context-docs` |
| New repeatable workflow | `skill-creator` |

**Auto-invoke `grill-me`.** Before starting any new feature, plan, or design or architecture decision, and whenever a requirement is ambiguous, run `grill-me` without being asked: one question at a time until every branch is resolved, then act. Skip it only for trivial, fully specified changes (typo, rename, a bug with a known fix).

**Every work artifact lives in `context/`.** All planning, execution and change records for the current version go under `context/PROGRESS/v<current>/`. This overrides every skill's default location, including superpowers:

| Artifact | Path | Overrides |
|---|---|---|
| Design / spec (`brainstorming`, `doc-coauthoring`) | `context/PROGRESS/v<current>/specs/YYYY-MM-DD-<topic>-design.md` | `docs/superpowers/specs/` |
| Implementation plan (`writing-plans`) | `context/PROGRESS/v<current>/plans/YYYY-MM-DD-<feature>.md` | `docs/superpowers/plans/` |
| SDD / executing-plans ledger | `context/PROGRESS/v<current>/sdd/<plan-basename>.md` | committed copy of `.superpowers/sdd/<plan>/progress.md` |
| Change log | `context/PROGRESS/v<current>/changelog/YYYY-MM-DD.md` | any other changelog |

Never create `docs/superpowers/`. `.superpowers/` (SDD workspaces, brainstorm mockups) is scratch only: keep it in `.gitignore`, and when a plan finishes, copy its `progress.md` ledger to the `sdd/` path above. A subagent dispatched by any skill gets these paths in its brief.

**Track every change in `context/`.** No code, doc, or decision change ends without its record: the doc it changes is updated in present tense, and the reason and result are appended to today's changelog file. Untracked work is unfinished work.

### 2.2 Output Style: Caveman (Always On)

AI chat output uses `caveman` mode: terse, no filler, technical terms exact, code blocks and quoted errors unchanged. Exceptions: security warnings, irreversible-action confirmations, clarification requests. Committed docs, code comments, and commit messages stay in normal prose.
```

## 5. Layout migration

Older projects keep flat files in `context/PROGRESS/` and let superpowers write
to `docs/superpowers/`. Detect any of: `context/PROGRESS/PROGRESS_v<N>.md`,
`context/PROGRESS/CHANGELOG_v<N>.md`, `docs/superpowers/specs/`,
`docs/superpowers/plans/`. Report it inside the same kit-upgrade finding and
apply it on the same yes, using `git mv` so history follows:

1. `PROGRESS_v<N>.md` → `v<N>/CHECKLIST.md`, for every N.
2. `CHANGELOG_v<N>.md` → split into `v<N>/changelog/`: each `## YYYY-MM-DD — <title>`
   entry goes to `YYYY-MM-DD.md` under `## <title>`; each `### YYYY-MM (Compacted)`
   section goes to `YYYY-MM.md`. Delete the old file once every entry is placed.
3. `docs/superpowers/specs/*` → `context/PROGRESS/v<current>/specs/`, and
   `docs/superpowers/plans/*` → `context/PROGRESS/v<current>/plans/`. Remove
   `docs/superpowers/` when empty.
4. Create any missing `changelog/`, `specs/`, `plans/`, `sdd/` folder with a
   `.gitkeep`, and add `.superpowers/` to `.gitignore`.
5. Update every path in `RULES.md`, the agent file, and other docs that named
   the old files. Log one changelog entry for the whole migration.

## 6. Stamp the kit version

After every other upgrade step is applied, write the kit version into the agent
file, directly under its `# ` title, replacing any older stamp:

```markdown
<!-- context-docs-kit:version 2.2.0 -->
```

The version is the newest entry in `references/kit-changelog.md`. Stamp last:
the stamp claims the project is on that template, so a partial upgrade is never
stamped. `bootstrapping-context-docs` writes the stamp when it creates the agent
file.
