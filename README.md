# context-docs-kit

Three Agent Skills that build a project's `context/` foundation docs — product, architecture, schema, design, rules — by **interviewing you** rather than filling in a template, then keep them true as the code moves.

Every project should start with these docs. The problem is that generated docs and decided docs look identical and behave nothing alike: a template's gaps are invisible, while a grilled doc's gaps are written down under `## Open Questions`. This kit exists to produce the second kind, and to stop the first kind quietly replacing it six weeks later.

Runs on **Claude Code, Codex, Gemini CLI and Antigravity**.

---

## Install

```bash
npx context-docs-kit install
```

Installs for Claude Code by default. Pick a different assistant, or several:

```bash
npx context-docs-kit install --target codex
npx context-docs-kit install --target claude,gemini
npx context-docs-kit install --target all
```

| Flag | Effect |
|---|---|
| `--target <list>` | `claude`, `codex`, `gemini`, `antigravity`, or `all` (default: `claude`) |
| `--project` | install into this repo instead of your home directory, so the team shares it |
| `--link` | symlink instead of copy, for working on the kit itself |
| `--force` | replace files this tool did not install |
| `--dry-run` | print what would happen, write nothing |

`npx context-docs-kit list` shows what is installed where. `npx context-docs-kit uninstall` removes it — and only ever removes what it installed, tracked in a manifest at each install root, so a hand-written skill sitting in the same directory is never touched.

Restart your assistant afterwards.

<details>
<summary>Where the files go</summary>

| Host | User install | Project install (`--project`) |
|---|---|---|
| Claude Code | `~/.claude/skills` + `~/.claude/agents` | `.claude/skills` + `.claude/agents` |
| Codex | `~/.agents/skills` | `.agents/skills` |
| Gemini CLI | `~/.gemini/skills` | `.gemini/skills` |
| Antigravity | `~/.gemini/config/skills` | `.agents/skills` |

Codex and Antigravity share `.agents/skills` at project scope, so that install happens once and counts for both.

</details>

<details>
<summary>As a Claude Code plugin instead</summary>

```
/plugin marketplace add gbcstro/context-docs-kit
/plugin install context-docs-kit
```

</details>

## Usage

In a project with no foundation docs:

```
> set up the context docs for this project
```

It scans, proposes a doc set for you to confirm, then starts on `PRODUCT.md`. You can stop after any doc and pick up later — the headers record where things stand.

Later, when things have moved:

```
> the docs don't match the code any more
> I want to change the storage decision
> v1 is done, let's start v2
```

## The three skills

| Skill | Runs when |
|---|---|
| **`bootstrapping-context-docs`** | there are no foundation docs yet, or the set is partial |
| **`aligning-context-docs`** | the docs and the code have drifted, or a decision changes inside the current version |
| **`versioning-context-docs`** | a version is finished and the next one opens |

Each has one job and one trigger, so your assistant picks the right one without being told.

## What it actually does

One question at a time. A recommendation with every question. The realistic options and their costs for every consequential decision — and if you pick one without acknowledging its main downside, it says the downside once and asks you to confirm before recording it as settled.

When you don't know something, it parks the question instead of inventing a plausible answer. **This is the point.** An invented `$4.99/mo` reads as decided, nobody revisits it, and three docs downstream inherit it.

Docs are written one at a time in dependency order, each behind an approval gate. On a repo that already has code it reads the code first, so you confirm what's there instead of restating it from memory.

Two passes go further than a question:

**Architecture is presented, not described.** Before a word of `ARCHITECTURE.md` is written, you get the stack block, an ASCII repo tree and a system diagram with the binding constraint annotated where it bites — and you approve the picture. A paragraph gets nodded at; a diagram gets corrected. On an existing repo you get two: what's there, what's proposed, and every delta named.

**Principles are agreed on examples, not names.** Everyone says yes to "single responsibility" and nobody means the same thing. So `RULES.md` §4 runs a loop: a principle tied to a named seam in *your* codebase, then a worked example — a before/after in your real language and paths, showing the actual consequence — and you accept, adjust or reject **the example**. Adjust and it re-renders with your correction. Three rounds without agreement and it's parked as an open question. A principle with no accepted example never enters the doc.

## Versions, and why the docs stay readable

The set is versioned as a product, not as files:

```
context/
  PRODUCT.md  ARCHITECTURE.md  SCHEMA.md  DESIGN.md  RULES.md
  PROGRESS/
    PROGRESS_v1.md      v1's scope, checklist and acceptance criteria
    CHANGELOG_v1.md     why anything changed during v1
```

**`PROGRESS_v1.md` is written from every approved doc** at the end of the bootstrap, and it is a commitment, not a summary: the shippable slices v1 owes, each with acceptance criteria you could actually check, each pointing at the doc section it came from. Boxes get ticked as work lands, with evidence — the file or test that satisfies the criterion. It is always `v1` on a first run, and **only you close it**.

**The docs never explain themselves.** When a decision changes and the version doesn't move, the doc is rewritten so it reads as if it had always said this — no "previously", no "we switched from X" — and the reason goes in `CHANGELOG_v1.md`, with a list of every doc the change touched. That list is what makes a decision's blast radius findable later, and it's why the docs stay readable: a doc arguing with its own history buries the one fact you opened it for.

Then the cascade, which is the part that usually gets skipped: a change is not finished until every doc downstream of it agrees. `aligning-context-docs` walks the `Depends on` chain and fixes them in the same pass.

## The mechanisms

| Mechanism | What it does |
|---|---|
| **Dependency chain** — `Depends on:` in each header | Decisions flow downhill, so docs are written in an order where nothing depends on an unwritten doc |
| **`## Open Questions`** in every doc | The escape hatch that makes an honest doc possible without pretending to know everything |
| **`Project version` + `Revision`** | Two separate axes: `v1` is the product, `Revision: 3` is the file. `v` never means both |
| **Agent-file wiring** — docs map + rules | Without it the folder is inert. Excellent docs nobody opens change nothing |
| **`PROGRESS_vN` + `CHANGELOG_vN`** | Docs stay present-tense; scope is committed with criteria; reasons stay findable |

Agent-file wiring is the step most often skipped, and the one that decides whether any of this has an effect. The kit uses `@context/RULES.md` on hosts that support imports, and copies §2 verbatim between markers on hosts that don't — so the rules apply on Codex and Antigravity too, instead of sitting there as an inert line.

## The doc set is adaptive

`PRODUCT.md`, `ARCHITECTURE.md` and `RULES.md` always. `SCHEMA.md` only if something is persisted. `DESIGN.md` only if there's a user interface. Extra docs (`PROTOCOL.md`, `SECURITY.md`, `ML.md`) when the project warrants them.

A CLI tool with no persistence gets three docs, not five with two stubs — a stub doc is worse than a missing one, because it implies the concern was considered.

## Personas

Each doc has a lens and its own list of things it won't let slide:

| Persona | Doc | Won't let slide |
|---|---|---|
| `product-strategist` | `PRODUCT.md` | Differentiation with no named competitor; feature names without field lists; success metrics you can't fail |
| `solutions-architect` | `ARCHITECTURE.md` | A stack proposed before the binding constraint is known; a vendor recorded without confirmation; a system described only in prose |
| `data-modeler` | `SCHEMA.md` | Entities invented rather than derived from the product's field lists; unstated delete behaviour |
| `product-designer` | `DESIGN.md` | Per-screen detail before a complete screen inventory; raw hex instead of semantic tokens; missing empty states |
| `engineering-standards` | `RULES.md` | Omitting the AI-assistant rules section; rules with no enforcement path; a principle with no worked example |
| `context-doc-critic` | all | Reviews every draft before it reaches you — independently, because an author can't see its own blind spots |

On Claude Code these run as subagents. Elsewhere the same personas run inline in the main conversation — the sequence doesn't change, and the review still happens in its own turn, because a writer checking a sentence as it writes it finds nothing.

**One structural note.** Subagents can't ask you anything, so the interview always happens in the main conversation. Five stages per doc, and only two involve you — the grilling and the approval gate.

## Why `RULES.md` matters most

Its §2 is addressed to the AI, not to you: *read before writing*, *no undocumented architecture decisions*, *keep the docs living, not frozen*, *no speculative scope beyond the current version's checklist*, *ask, don't guess*, *wireframe before building UI*.

Bootstrap ends when the skill exits. §2 is what stops the docs drifting on every change after that — and it's the one section that reaches your agent file unconditionally, rather than only when someone chooses to read it. That makes `RULES.md` the loop-closer, not the throwaway fifth file.

## Layout

```
bin/cli.mjs                    install / uninstall / list
src/                           targets, installer, manifest, shared-reference sync
shared/references/             canonical copies of everything more than one skill needs
skills/
  bootstrapping-context-docs/  process, gates, grilling, architecture gate, worked-example loop
  aligning-context-docs/       three-way drift scan, in-version change protocol, cascade
  versioning-context-docs/     close a version, account for every item, open the next
agents/                        five doc personas + the critic (Claude Code)
.claude-plugin/                plugin + marketplace manifests
```

Reference files are loaded per pass, not up front — the `DESIGN.md` questions have no business being in context while you're still deciding what the product is.

Shared references live once in `shared/references/` and are copied into each skill by `npm run sync`; `npm test` fails if a copy has drifted.

## Development

```bash
git clone https://github.com/gbcstro/context-docs-kit.git
cd context-docs-kit
npx . install --link          # symlink the skills so edits are live
npm test                      # installer behaviour + shared-reference drift
```

`--link` symlinks the skill directories back to the repo, so editing `SKILL.md` needs no re-sync. Agent files are always copied — re-run after editing one.

## License

MIT
