# context-docs-kit

Three Agent Skills that build a project's `context/` foundation docs — product, architecture, schema, design, rules — by **interviewing you** rather than filling in a template, then keep them true as the code moves.

Every project should start with these docs. The problem is that generated docs and decided docs look identical and behave nothing alike: a template is full of gaps nobody can see. A grilled doc has none — every question in it was closed before it was written. This kit exists to produce the second kind, and to stop the first kind quietly replacing it six weeks later.

Runs on **Claude Code, Codex, Gemini CLI and Antigravity**.

---

## Install

### Using `skills` (Recommended)

Install directly into your assistant via [`skills`](https://skills.sh):

```bash
# Install into the current project (.agents/skills/)
npx skills add gbcstro/context-docs-kit

# Or install globally across all projects on your machine
npx skills add gbcstro/context-docs-kit -g

# Install all skills non-interactively
npx skills add gbcstro/context-docs-kit --all
```

To update skills when new versions land:

```bash
npx skills update
```

<details>
<summary>Alternative: using context-docs-kit CLI</summary>

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
| `--ecosystem` | install the 6-pillar Startup & Company Skill Ecosystem alongside `context-docs-kit` |
| `--bundle <list>` | install a specific team preset (`full-team`, `product`/`growth`, `engineering`, `design`, `video`), category, or skill ID |
| `--link` | symlink instead of copy, for working on the kit itself |
| `--force` | replace files this tool did not install |
| `--dry-run` | print what would happen, write nothing |

`npx context-docs-kit list` shows what is installed where. `npx context-docs-kit uninstall` removes it — and only ever removes what it installed, tracked in a manifest at each install root, so a hand-written skill sitting in the same directory is never touched.

`npx context-docs-kit compact-changelog [--days 30]` compacts changelog entries older than 30 days into monthly rollups, keeping the active log clean.

`npx context-docs-kit update` updates `context-docs-kit` core skills, runs `npx skills update -y` across all upstream skill repositories, and refreshes `@latest` CLI integrations (`impeccable`, `@caveman-ai/cli`).

</details>

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

When you don't know something, it doesn't invent a plausible answer — and it doesn't leave a `TBD` either. **Both are holes; the second just looks honest.** An invented `$4.99/mo` reads as decided and three docs downstream inherit it. A "pricing TBD" is worse in a different way: `SCHEMA.md` still has to decide whether a price is a column, so it guesses, and nobody notices.

Instead the question gets *closed*. It finds the option that's **cheapest to reverse**, tells you what reversing it would actually cost, and asks you to accept it as the decision in force. The doc then reads like any other decision — "v1 is free, there is no billing" — and the fact that it's unsettled is registered in one place, `PROGRESS_v1.md` §4, with what would settle it and what changing it costs.

That's more work than parking a question, not less. The point is that the cost moves from a future reader, who can't pay it, to the conversation you're already having.

Docs are written one at a time in dependency order, each behind an approval gate. On a repo that already has code it reads the code first, so you confirm what's there instead of restating it from memory.

Two passes go further than a question:

**Architecture is presented, not described.** Before a word of `ARCHITECTURE.md` is written, you get the stack block, an ASCII repo tree and a system diagram with the binding constraint annotated where it bites — and you approve the picture. A paragraph gets nodded at; a diagram gets corrected. On an existing repo you get two: what's there, what's proposed, and every delta named.

**Principles are agreed on examples, not names.** Everyone says yes to "single responsibility" and nobody means the same thing. So `RULES.md` §4 runs a loop: a principle tied to a named seam in *your* codebase, then a worked example — a before/after in your real language and paths, showing the actual consequence — and you accept, adjust or reject **the example**. Adjust and it re-renders with your correction. Three rounds without agreement and the principle simply isn't written down; that absence is the decision. A principle with no accepted example never enters the doc.

## Versions, and why the docs stay readable

The set is versioned as a product, not as files:

```
context/
  PRODUCT.md  ARCHITECTURE.md  SCHEMA.md  DESIGN.md  RULES.md
  PROGRESS/
    PROGRESS_v1.md      v1's scope, checklist, acceptance criteria,
                        and the register of provisional decisions
    CHANGELOG_v1.md     completed tasks, session logs, and why anything
                        changed during v1 (compacted after 30 days)
```

**`PROGRESS_v1.md` is written from every approved doc** at the end of the bootstrap, and it is a commitment, not a summary: the shippable slices v1 owes, each with acceptance criteria you could actually check, each pointing at the doc section it came from. Boxes get ticked as work lands, with evidence — the file or test that satisfies the criterion. It is always `v1` on a first run, and **only you close it**.

**The docs never explain themselves.** When a decision changes and the version doesn't move, the doc is rewritten so it reads as if it had always said this — no "previously", no "we switched from X" — and the reason goes in `CHANGELOG_v1.md`, with a list of every doc the change touched. That list is what makes a decision's blast radius findable later, and it's why the docs stay readable: a doc arguing with its own history buries the one fact you opened it for.

**Always log on completion, compact after 30 days.** Whenever an AI assistant or contributor finishes a task, resolves a bug, or ends a conversation session, it logs what was completed to `CHANGELOG_v<current>.md` before declaring completion. To avoid bloating LLM context with old granular entries, entries older than 30 days are automatically compacted into concise monthly summary rollups.

Then the cascade, which is the part that usually gets skipped: a change is not finished until every doc downstream of it agrees. `aligning-context-docs` walks the `Depends on` chain and fixes them in the same pass.

## The mechanisms

| Mechanism | What it does |
|---|---|
| **Dependency chain** — `Depends on:` in each header | Decisions flow downhill, so docs are written in an order where nothing depends on an unwritten doc |
| **No open questions, anywhere** | Every question closes before its doc is drafted; what can't be settled becomes a registered provisional decision |
| **`Project version` + `Revision`** | Two separate axes: `v1` is the product, `Revision: 3` is the file. `v` never means both |
| **Agent-file wiring** — docs map + rules | Without it the folder is inert. Excellent docs nobody opens change nothing |
| **`PROGRESS_vN` + `CHANGELOG_vN`** | Docs stay present-tense; scope is committed with criteria; completed tasks & reasons stay findable; compacted after 30 days |

Agent-file wiring is the step most often skipped, and the one that decides whether any of this has an effect. The kit uses `@context/RULES.md` on hosts that support imports, and copies §2 verbatim between markers on hosts that don't — so the rules apply on Codex and Antigravity too, instead of sitting there as an inert line.

## The doc set is adaptive

`PRODUCT.md`, `ARCHITECTURE.md` and `RULES.md` always. `SCHEMA.md` only if something is persisted. `DESIGN.md` only if there's a user interface. Extra docs (`PROTOCOL.md`, `SECURITY.md`, `ML.md`) when the project warrants them.

A CLI tool with no persistence gets three docs, not five with two stubs — a stub doc is worse than a missing one, because it implies the concern was considered.

## Personas

Each doc has a lens and its own list of things it won't let slide:

| Persona | Doc | Won't let slide |
|---|---|---|
| `product-strategist` | `PRODUCT.md` | An app with no identity or purpose; differentiation with no named competitor; undefined user roles or anti-personas; missing value loop or user journeys; feature names without functional specs, business rules, and field lists; success metrics you can't fail |
| `solutions-architect` | `ARCHITECTURE.md` | A stack proposed before the binding constraint is known; unconfirmed libraries or cloud/IaC services; unstated API contracts, DB pooling/migrations, cache invalidation, worker retries/DLQ, file upload flows, webhook verification, auth/tenant isolation, or response-time/scaling targets; a system described only in prose |
| `data-modeler` | `SCHEMA.md` | Entities invented rather than derived from the product's field lists; unstated delete behaviour |
| `product-designer` | `DESIGN.md` | Raw hex instead of semantic tokens; unverified color contrast; incomplete type scale; components without all interactive states; overlays without contracts; animations without durations and reduced-motion posture |
| `engineering-standards` | `RULES.md` | Omitting the AI-assistant rules section; rules with no enforcement path; a principle with no worked example |
| `context-doc-critic` | all | Reviews every draft before it reaches you — independently, because an author can't see its own blind spots |

On Claude Code these run as subagents. Elsewhere the same personas run inline in the main conversation — the sequence doesn't change, and the review still happens in its own turn, because a writer checking a sentence as it writes it finds nothing.

**One structural note.** Subagents can't ask you anything, so the interview always happens in the main conversation. Five stages per doc, and only two involve you — the grilling and the approval gate.

## Why `RULES.md` matters most

Its §2 is addressed to the AI, not to you: *read before writing*, *no undocumented architecture decisions*, *keep the docs living, not frozen*, *no speculative scope beyond the current version's checklist*, *ask, don't guess*, *wireframe before building UI*, *reuse before creating*, *code like a senior engineer (pragmatic principles per scenario)*, *follow official documentation per language & framework*, *test and verify thoroughly*, and *always log completed tasks and conversations to the changelog (compacting entries older than 30 days)*.

Bootstrap ends when the skill exits. §2 is what stops the docs drifting on every change after that — and it's the one section that reaches your agent file unconditionally, rather than only when someone chooses to read it. That makes `RULES.md` the loop-closer, not the throwaway fifth file.

## Startup & Company Team Skill Ecosystem

`context-docs-kit` acts as the conductor and shared source of truth (`context/`) for an always-updated ecosystem of 18 external skills and CLI tools across 6 company pillars:

```bash
# Install context-docs-kit + all 18 startup/company ecosystem skills across all assistants
npx context-docs-kit install --target all --ecosystem

# Or install by team pod (--bundle)
npx context-docs-kit install --bundle full-team      # All 6 categories (18 integrations)
npx context-docs-kit install --bundle product        # Unified Product, Brand & Growth pod (same as --bundle growth)
npx context-docs-kit install --bundle engineering    # Dev workflow, Playwright QA, docs, brag, caveman
npx context-docs-kit install --bundle design         # 4-layer UI craft, brand, Remotion, QA
npx context-docs-kit install --bundle video          # Social media & website video production suite

# Always keep context-docs-kit + all upstream skills updated
npx context-docs-kit update
```

| Pillar | Integrated Skills & Tools | How `context-docs-kit` Orchestrates Them |
|---|---|---|
| **Documentation & Internal Comms** | `anthropics/skills@doc-coauthoring`, `anthropics/skills@internal-comms` | Co-authors `PRODUCT.md`, `ARCHITECTURE.md`, and RFCs; turns `CHANGELOG_vN.md` & `PROGRESS_vN.md` into 3P updates and release notes |
| **Dev Workflow & QA** | `obra/superpowers@using-superpowers`, `anthropics/skills@webapp-testing`, `anthropics/skills@skill-creator`, `DietrichGebert/ponytail`, `mattpocock/skills` (`grill-me`) | Single-question interrogation (`grill-me`), TDD execution (`using-superpowers`, `ponytail`), live Playwright browser verification (`webapp-testing`), and custom repo skills (`skill-creator`) |
| **UI Principles, Brand & Craft** | `anthropics/skills@brand-guidelines` -> `Leonxlnx/taste-skill@design-taste-frontend` -> `anthropics/skills@frontend-design` -> `npx impeccable install` | Sequenced 4-layer pipeline around `DESIGN.md` and `RULES.md` §2 Rule 6 |
| **Marketing, SEO & Brand (Unified with Product)** | `coreyhaines31/marketingskills`, `affaan-m/ECC` (`brand-discovery`) | Unified directly into `PRODUCT.md` and the `product`/`growth` pod: brand voice, positioning, CRO, copywriting, technical/programmatic SEO, and GTM launch playbooks |
| **Token Efficiency** | `npx @caveman-ai/cli@latest` + `compact-changelog` | High-signal low-token communication paired with present-tense docs and 30-day changelog compaction |
| **Video Generation, Social/Web Media & Brag** | `NousResearch/hermes-agent` (`brag`) -> `mattpocock/skills` (`writing-beats`) -> `remotion-dev/skills` (`remotion-best-practices`) / `heygen-com/hyperframes` | 4-step pipeline for social media reels (`16:9` / `9:16`), website hero walkthroughs, AI avatar explainers, and sprint brag docs |

### Creating Videos & Media for Social Media or Websites

When you ask your assistant to create a launch video, social media reel, or website hero demo, `RULES.md` §2 Rule 6 and `AGENTS.md` automatically run a 4-step pipeline:
1. **Harvest `context/` Truth:** Reads `PRODUCT.md` (brand voice, incumbent pain, differentiation, CRO hook), `DESIGN.md` (exact semantic color tokens, fonts, radii, motion curves), and `CHANGELOG_vN.md` / `PROGRESS_vN.md` (via `brag`).
2. **Beat-Sheet Gate (`writing-beats`):** Presents a 30–60s narrative Beat Sheet (*Hook -> Mechanism -> Live Proof -> CTA*) in chat for your approval before rendering.
3. **Render by Target Channel:** Uses `remotion-best-practices` + `design-taste-frontend` + `frontend-design` for programmatic React/UI videos (website embeds or `16:9` / `9:16` social reels), or `hyperframes` for HeyGen AI presenter/storyboard videos.
4. **Companion Copy (`marketingskills`):** Writes the matching X thread, LinkedIn post, or landing page copy aligned with the video beats.

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
