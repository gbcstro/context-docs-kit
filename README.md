# context-docs-kit

A Claude Code plugin that builds a project's `context/` foundation docs — product, architecture, schema, design, rules — by **interviewing you** rather than filling in a template.

Every project should start with these docs. The problem is that generated docs and decided docs look identical and behave nothing alike: a template's gaps are invisible, while a grilled doc's gaps are written down under `## Open Questions`. This plugin exists to produce the second kind.

---

## What it actually does

One question at a time. A recommendation with every question. The realistic options and their costs for every consequential decision — and if you pick one without acknowledging its main downside, it says the downside once and asks you to confirm before recording it as settled.

When you don't know something, it parks the question instead of inventing a plausible answer. **This is the point.** An invented `$4.99/mo` reads as decided, nobody revisits it, and three docs downstream inherit it.

Docs are written one at a time in dependency order, each behind an approval gate. It resumes across sessions, and on a repo that already has code it reads the code first so you confirm what's there instead of restating it from memory.

## The four mechanisms

The doc set isn't five files — it's five files plus the machinery that keeps them honest:

| Mechanism | What it does |
|---|---|
| **Dependency chain** — `**Depends on:**` in each doc's header | Decisions flow downhill, so docs are written in an order where nothing depends on an unwritten doc |
| **`## Open Questions`** in every doc | The escape hatch that makes an honest doc possible without pretending to know everything |
| **`Status: Draft vN`** + **`## Next Steps`** | The set is self-sequencing and resumable by a session with no memory of this one |
| **Agent-file wiring** — docs map + `@context/RULES.md` import | Without it the folder is inert. Five excellent docs nobody opens change nothing |

The last one is the step most often skipped, and the one that decides whether any of this has an effect.

## The doc set is adaptive

`PRODUCT.md`, `ARCHITECTURE.md` and `RULES.md` always. `SCHEMA.md` only if something is persisted. `DESIGN.md` only if there's a user interface. Extra docs (`PROTOCOL.md`, `SECURITY.md`, `ML.md`) when the project warrants them.

A CLI tool with no persistence gets three docs, not five with two stubs — a stub doc is worse than a missing one, because it implies the concern was considered.

## Personas

Each doc has a dedicated agent with its own lens and its own list of things it won't let slide:

| Agent | Doc | Won't let slide |
|---|---|---|
| `product-strategist` | `PRODUCT.md` | Differentiation with no named competitor; feature names without field lists; success metrics you can't fail |
| `solutions-architect` | `ARCHITECTURE.md` | A stack proposed before the binding constraint is known; a vendor recorded without explicit confirmation |
| `data-modeler` | `SCHEMA.md` | Entities invented rather than derived from the product's field lists; unstated delete behaviour |
| `product-designer` | `DESIGN.md` | Per-screen detail before a complete screen inventory; raw hex instead of semantic tokens; missing empty states |
| `engineering-standards` | `RULES.md` | Omitting the AI-assistant rules section; rules with no enforcement path; aspirational testing standards |
| `context-doc-critic` | all | Reviews every draft before it reaches you — independently, because an author can't see its own blind spots |

**One structural note.** Subagents run in isolation and cannot ask you anything, so the interview always happens in the main conversation, wearing the persona. The agents handle the work around it: scanning the repo, drafting from your approved answers, and reviewing the draft. Five stages per doc, and only two involve you — the grilling and the approval gate.

## Install

### From this repo, for local development

```powershell
git clone https://github.com/<you>/context-docs-kit.git
cd context-docs-kit
.\scripts\sync-local.ps1
```

Junctions the skill into `~/.claude/skills/` so your edits are live with no re-sync, and copies the agents into `~/.claude/agents/`. Idempotent, and it will refuse to overwrite a real directory without `-Force`. Re-run after editing an agent definition; skill edits need nothing.

`.\scripts\sync-local.ps1 -Uninstall` reverses it.

### As a plugin

```
/plugin marketplace add <you>/context-docs-kit
/plugin install context-docs-kit
```

Restart Claude Code either way, then confirm `bootstrapping-context-docs` and the six agents are listed.

## Usage

In a project with no foundation docs:

```
> set up the context docs for this project
```

Or invoke it directly:

```
> /bootstrapping-context-docs
```

It scans, proposes a doc set for you to confirm, then starts on `PRODUCT.md`. You can stop after any doc and pick up later — the headers record where things stand.

On a repo that already has scattered docs (`.docs/prd.md`, `blueprint.md`, `ai-rules.md`), it maps them onto the target set and opens each decision pre-filled. It treats their content as **claims to verify, not facts to adopt** — inherited docs look authoritative and their assumptions are usually unexamined. Where a doc and the code disagree, the code is evidence and the doc is intent, and that gap is often the most useful thing the scan finds.

## Layout

```
.claude-plugin/plugin.json
skills/bootstrapping-context-docs/
  SKILL.md              process, gates, grilling and pros/cons discipline, red flags
  references/
    wiring.md           entry scan, brownfield reconcile, agent-file merge
    product.md          persona brief + question bank + skeleton, per doc
    architecture.md
    schema.md
    design.md
    rules.md
    optional-docs.md    dropping and adding docs, splicing into the chain
agents/                 five doc personas + the critic
scripts/sync-local.ps1
```

Reference files are loaded per pass, not up front — the `DESIGN.md` questions have no business being in context while you're still deciding what the product is.

## Why `RULES.md` is last and matters most

Its §2 is addressed to the AI, not to you: *read before writing*, *no undocumented architecture decisions*, *keep the docs living, not frozen*, *wireframe before building UI*.

Bootstrap ends when the skill exits. §2 is what stops the docs drifting on every change after that — and it's the one section that gets `@`-imported into your agent file, so it applies unconditionally rather than only when someone chooses to read it. That makes `RULES.md` the loop-closer, not the throwaway fifth file.

## License

MIT
