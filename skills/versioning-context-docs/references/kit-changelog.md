# Kit Changelog

<!-- context-docs-kit:shared — canonical copy lives in shared/references/. Edit there, then `npm run sync`. -->

What each `context-docs-kit` release changes **in a project that uses it**, newest
first. This is the source for the "what's new" report in `upgrading-context-docs`.
Kit-internal changes (installer, tests, README) are left out.

A project records the kit version it was last written or upgraded by in its agent
file: `<!-- context-docs-kit:version X.Y.Z -->` (`references/agent-file.md`). No
stamp means the project predates 2.2.0.

Every entry has the same three parts:

- **New** — what the project gains, in one line each.
- **Upgrade** — what `upgrading-context-docs` changes in the project, and where the
  exact steps live. Each step is offered, never applied silently.
- **Detect** — how to tell, from the files, that a project still needs it. Use
  this instead of the stamp when the stamp is missing.

Always add a new entry at the top, and keep its version equal to `package.json`.

---

## 2.2.0

**New**

- `upgrading-context-docs`: one skill that shows what's new in the kit and moves a project onto the current template.
- A kit version stamp in the agent file, so the next upgrade knows where the project stands.
- Companion skills are installed into the project's `.agents/skills/` even when you already have them globally or through a plugin, so every teammate and CI run gets the same set.
- Per-version progress folders: `context/PROGRESS/v<N>/` holds `CHECKLIST.md`, `changelog/` (one file per day), `specs/`, `plans/` and `sdd/`.
- `RULES.md` §2.1 says every work artifact lives in `context/`: superpowers specs and plans go to `v<N>/specs/` and `v<N>/plans/`, never `docs/superpowers/`.
- ADVISE mode: the architecture and rules passes propose a default for each area, with its cost, before grilling.
- Project personas (optional): up to five reviewers built from your approved docs, in `context/agents/`.

**Upgrade**

1. Layout migration, if the project still uses flat `PROGRESS_v<N>.md` / `CHANGELOG_v<N>.md` or `docs/superpowers/`: `references/kit-upgrade.md` §5.
2. `RULES.md` §2.1 text, which now carries the artifact-location table: `references/kit-upgrade.md` §3–§4.
3. Companion skills into `.agents/skills/`: `references/dependencies.md`.
4. Project personas, only if the user wants them: `references/project-agents.md`.
5. Write the stamp: `references/kit-upgrade.md` §6.

**Detect**

- No `context-docs-kit:version` stamp in the agent file.
- `context/PROGRESS/PROGRESS_v*.md`, `context/PROGRESS/CHANGELOG_v*.md` or `docs/superpowers/` exists.
- `RULES.md` §2.1 has no **Every work artifact lives in `context/`** table.
- A §2.1 companion is missing from `<repo>/.agents/skills/`.

---

## 2.1.0

**New**

- `RULES.md` §2.1 Skill Usage: which companion skill to use for each kind of work, and `grill-me` runs before any new feature or design.
- `RULES.md` §2.2 Output Style: caveman mode for chat output.
- The project's own rules move to §2.3, unchanged.

**Upgrade**

1. Insert §2.1 and §2.2, move the rules to §2.3, refresh `AGENTS.md`: `references/kit-upgrade.md` §3–§4.

**Detect**

- `RULES.md` §2 has no `### 2.1 Skill Usage (Mandatory)` or no `### 2.2 Output Style: Caveman (Always On)`.

---

## Before 2.1.0

The baseline: `PRODUCT.md`, `ARCHITECTURE.md`, `SCHEMA.md`, `DESIGN.md`,
`RULES.md` with the doc-contract header, and `context/PROGRESS/`. A project from
this era gets every upgrade above, oldest first.
