# Companion Skill Preflight

<!-- context-docs-kit:shared — canonical copy lives in shared/references/. Edit there, then `npm run sync`. -->

Every `RULES.md` this kit writes makes a set of companion skills mandatory (§2.1
Skill Usage, §2.2 Output Style). `npx skills add gbcstro/context-docs-kit`
**cannot** install them: the skills CLI copies `SKILL.md` folders and nothing
else — no dependency resolution, no install hooks. So the check happens here,
when a skill actually runs. Do it before the first question, and check again
at the end of the pass.

## 1. The companions

| Skill (detect by this name) | Used for | Install command |
|---|---|---|
| `using-superpowers` (+ `brainstorming`, `systematic-debugging`, `test-driven-development`, `verification-before-completion`) | planning, debugging, TDD | `npx skills add obra/superpowers` |
| `ponytail` (+ `ponytail-review`, `ponytail-audit`) | writing and reviewing code | `npx skills add DietrichGebert/ponytail` |
| `grill-me` | Stage 2, the Grill | `npx skills add mattpocock/skills --skill grill-me` |
| `impeccable` | UI layer 4 | `npx impeccable install --providers=<provider> --scope=<project\|global>` |
| `design-taste-frontend` | UI layer 2 | `npx skills add Leonxlnx/taste-skill --skill design-taste-frontend` |
| `frontend-design` | UI layer 3 | `npx skills add anthropics/skills --skill frontend-design` |
| `brand-guidelines` | UI layer 1 | `npx skills add anthropics/skills --skill brand-guidelines` |
| `webapp-testing` | live web UI evidence | `npx skills add anthropics/skills --skill webapp-testing` |
| `doc-coauthoring` | Stage 3 drafting, specs, ADRs | `npx skills add anthropics/skills --skill doc-coauthoring` |
| `internal-comms` | release notes, status updates | `npx skills add anthropics/skills --skill internal-comms` |
| `skill-creator` | packaging repeatable workflows | `npx skills add anthropics/skills --skill skill-creator` |
| `caveman` | §2.2 output style | `npx skills add JuliusBrussee/caveman --skill caveman` |

## 2. Detect what is missing

A companion is **present** only if `<repo>/.agents/skills/<name>/SKILL.md`
exists (the project store). Anything else is **missing**, including a companion
your host already loads from a plugin (`superpowers:brainstorming`) or a
home-directory folder (`~/.claude/skills/`, `~/.agents/skills/`).

The project copy is the point: it is committed with the repo, pinned in
`skills-lock.json`, and reaches every teammate and CI run, whatever they have
installed globally. Leave the global or plugin copy alone; do not uninstall it.

Check silently. Do not narrate the search.

## 3. Install the missing ones — automatically, into the project

If nothing is missing, say nothing and continue.

Otherwise install every missing companion now, into the project, without asking. Run each command
**from the repo root**, separately:

```
npx skills add <source> [--skill <name>] -a <agent> -y
```

- **Project scope, always.** Never pass `-g`. The skills CLI writes the one real
  copy to `<repo>/.agents/skills/<name>/` and records it in `skills-lock.json`.
- **Symlink, never copy.** Never pass `--copy`. Hosts that read another
  directory (`.claude/skills/`, `.gemini/skills/`) get a symlink to the
  `.agents/skills/` copy, so one update reaches every host.
- **`-a <agent>`:** `claude-code`, `codex`, `gemini-cli`, or `antigravity`.
- **`impeccable`** has its own installer:
  `npx impeccable install --providers=<claude|codex|gemini|antigravity> --scope=project`.

Then send **one** short message: what was installed, where, and any command that
failed with its error. A failed companion degrades the pass; it does not block it.

## 4. After the install

- **Verify** each installed companion: `<repo>/.agents/skills/<name>/SKILL.md`
  exists, and for Claude Code or Gemini CLI, `.claude/skills/<name>` or
  `.gemini/skills/<name>` exists. On Windows without symlink permission the CLI
  may copy instead; that still works, say so in the message.
- A skill installed mid-session is usually not loaded until the host restarts,
  so for the rest of this session **read
  `<repo>/.agents/skills/<name>/SKILL.md` directly** when you need it.
- **Commit `.agents/skills/` and `skills-lock.json`** with the docs, unless the
  repo ignores them. A teammate restores them with
  `npx skills experimental_install`.
- **Check again at the end of the pass**, before the closing summary. Install
  anything still missing the same way. A bootstrap or align run never ends with
  a §2.1 companion absent from `.agents/skills/` without saying why.

The companions stay listed in `RULES.md` §2.1 either way. That table tells the
next assistant which skill to reach for.
