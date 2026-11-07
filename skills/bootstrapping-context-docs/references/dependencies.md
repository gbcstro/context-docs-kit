# Companion Skill Preflight

<!-- context-docs-kit:shared — canonical copy lives in shared/references/. Edit there, then `npm run sync`. -->

Every `RULES.md` this kit writes makes a set of companion skills mandatory (§2.1
Skill Usage, §2.2 Output Style). `npx skills add gbcstro/context-docs-kit`
**cannot** install them: the skills CLI copies `SKILL.md` folders and nothing
else — no dependency resolution, no install hooks. So the check happens here,
when a skill actually runs. Do it once, before the first question.

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

A companion is **present** if any of these holds:

- It appears in the skills list your host gave you, under its bare name or a
  plugin namespace (`superpowers:brainstorming`, `example-skills:webapp-testing`).
- `<dir>/<name>/SKILL.md` exists in any skills directory for this host and
  scope — `.agents/skills/`, `.claude/skills/`, `.gemini/skills/`, or their
  home-directory equivalents (`references/hosts.md` lists them).

Check silently. Do not narrate the search.

## 3. Offer the install — once, with consent

If nothing is missing, say nothing and continue.

If something is missing, send **one** message: the missing names, what each is
for in this pass, and the exact commands. Then ask once.

- **Scope matches this kit's install.** Loaded from a project directory
  (`<repo>/.agents/skills`, `<repo>/.claude/skills`) → project scope, no `-g`.
  Loaded from the home directory → add `-g`.
- **Target this host only.** Append `-a <agent> -y` to each `npx skills add`:
  `claude-code`, `codex`, `gemini-cli`, or `antigravity`. For `impeccable`,
  `--providers=` takes `claude`, `codex`, `gemini`, or `antigravity`.
- **Name the one-shot alternative** when the user would rather do it themselves
  outside this session: `npx context-docs-kit install` installs every missing
  companion for the chosen hosts.

> Four companion skills this project's rules route to are not installed:
> `grill-me` (runs the interview), `doc-coauthoring` (drafting), `webapp-testing`
> (UI evidence) and `caveman` (chat output style). I can install them now:
>
> ```
> npx skills add mattpocock/skills --skill grill-me -a claude-code -y
> npx skills add anthropics/skills --skill doc-coauthoring -a claude-code -y
> ...
> ```
>
> Install them? (Or run `npx context-docs-kit install` yourself later.)

**Never install without a yes.** These commands fetch third-party code onto the
user's machine; that is their decision, every time.

## 4. After the answer

- **Yes:** run each command separately. Report any that failed, with the error,
  and carry on — a failed companion degrades the pass, it does not block it.
  A skill installed mid-session is usually not loaded until the host restarts,
  so for the rest of this session **read the installed `SKILL.md` directly**
  when you need it.
- **No:** continue without them. Do not ask again this session. Each place a
  skill names a companion already says what to do without it.

Either way, the companions stay listed in `RULES.md` §2.1. That table is what
tells the next assistant which skill to reach for; whether it is installed on
one machine today does not change the project's rules.
