# Project Personas

<!-- context-docs-kit:shared — canonical copy lives in shared/references/. Edit there, then `npm run sync`. -->

The kit's six personas draft the docs. Once the docs exist, the project needs
its own reviewers and specialists: someone who knows *this* domain's rules,
*this* stack's conventions, *this* schema's tenancy model. This file covers how
to propose them, write them, install them for each host, and keep them current.

## 1. When

- **`bootstrapping-context-docs`:** Closing the Pass step 4, after `v1/CHECKLIST.md`
  is approved. Every doc is approved by then, so personas can only cite decided facts.
- **`aligning-context-docs`:** Step 7. A persona that cites a doc section that
  changed is refreshed in the same pass (§6).
- **On request:** the user asks for a new project agent.

## 2. Propose — derived from the approved docs

Read the approved docs and propose **at most five** personas. Each one must be
justified by something the docs actually contain. A persona with no doc
section behind it is invented scope.

| Persona | Propose when | Built from |
|---|---|---|
| `<domain>-expert` | `PRODUCT.md` §4 has real business rules, calculations or state machines | `PRODUCT.md` §1.4 glossary, §4 rules and edge cases |
| `<stack>-reviewer` | always, once `RULES.md` exists | `ARCHITECTURE.md` §1, §3; `RULES.md` §3–§7 |
| `schema-guardian` | `SCHEMA.md` exists | `SCHEMA.md` entities, tenancy, migration rules; `RULES.md` §9 |
| `design-reviewer` | `DESIGN.md` exists | `DESIGN.md` tokens, components, states, accessibility |
| `security-reviewer` | `ARCHITECTURE.md` covers auth, payments, uploads, webhooks or PII | `ARCHITECTURE.md` §10–§12; `PRODUCT.md` §2.3 roles |
| `context-keeper` | always | `RULES.md` §2; `references/history-discipline.md` — checks that changes are tracked in `context/` |

Name `<domain>` and `<stack>` from the docs' own words: `ledger-expert`,
`nextjs-reviewer`. Never `generic-reviewer`.

Present the list in **one** message: name, one line on what it checks, and the
doc sections it is built from. Ask which to create. The user may rename, drop,
or add one; an added persona still needs doc sections to stand on, or it is
closed per `references/closing-questions.md`.

## 3. Write — one canonical file per persona

Write each to `context/agents/<name>.md`. This is the source of truth, it is
committed, and it lives with the docs it depends on.

```markdown
---
name: <name>
description: <one sentence: what it reviews or does, and when to dispatch it. Hosts route on this line, so name the trigger: "Use after any change to src/billing/ or a migration".>
tools: Read, Glob, Grep
model: inherit
---

You are the <role> for <Project>. <Two lines: what you protect and why it matters here.>

## Sources — read these first, every time
- `context/<DOC>.md` §<n> — <what it gives you>
- ...

## Checks
1. <Concrete check> — source: `<DOC>.md` §<n>
2. ...

## Boundaries
- Read-only: report findings, never edit.
- Never open or quote secrets (`.env*`, `*.pem`, `*.key`, credential files).
- Out of scope: <what other personas cover>.

## Output
Findings most severe first: `[CRITICAL|MAJOR|MINOR] path:line — finding — source §`.
End with `VERDICT: pass` or `VERDICT: fix — N critical, N major`.
```

**Rules for the body:**

- **Point, don't copy.** Sources and checks cite doc sections; they do not restate
  values. "Every money amount is integer minor units — `SCHEMA.md` §3.2" is a
  check. Copying the currency list into the persona creates a second copy
  that will drift from the doc.
- **Every check traces to a section.** No check without a `source:`. A check
  you cannot source is an invented rule.
- **Read-only by default.** A persona gets `Write` or `Edit` only if the user
  asks for a builder, and its description then says which paths it may write.
- **No duplicate of a kit persona or companion skill.** `context-doc-critic`
  reviews docs; `ponytail-review` reviews code generally. A project persona
  checks what only this project's docs know.

Gate it like a doc: show the user the first persona in full and the rest as
their name, description and checks. Write the files once approved.

## 4. Install — render to each host

The canonical file is never loaded directly by a host. Render it on every host
the project uses (`references/hosts.md`):

| Host | Write | Format |
|---|---|---|
| Claude Code | `.claude/agents/<name>.md` | the canonical file, with `<!-- generated from context/agents/<name>.md; edit that file -->` as the first body line after the frontmatter |
| Codex | `.codex/agents/<name>.toml` | `name`, `description`, and `developer_instructions` holding the body. A Codex agent inherits every tool, so start `developer_instructions` with "You are read-only: never create, edit, or delete a file." for a read-only persona |
| Gemini CLI, Antigravity | nothing | no named subagents. The agent file lists the personas; brief a general-purpose subagent from the canonical file, or adopt it inline |

Commit the rendered files with the canonical ones. Never edit a rendered file
by hand; the next refresh overwrites it.

## 5. Wire into the agent file

Add a **Project Agents** table to the agent file, after the Context Docs Map
(`references/agent-file.md`):

```markdown
## Project Agents

Defined in `context/agents/`. Dispatch the matching one before declaring work done:

| Agent | Dispatch when |
|---|---|
| `ledger-expert` | a change touches posting, balances or reconciliation |
| `context-keeper` | before ending any task — checks the change is tracked in `context/` |
```

## 6. Keep them current

A persona is a dependent of the doc sections it cites, the same way `SCHEMA.md`
depends on `ARCHITECTURE.md`.

- When `aligning-context-docs` changes a doc section, grep `context/agents/` for
  that section. Every persona citing it is re-read; a check that no longer holds
  is rewritten, and the host copies are re-rendered in the same pass.
- A persona whose sources were all removed is deleted, along with its host copies
  and its agent-file row.
- Log persona changes in the same changelog entry as the doc change that caused
  them. The persona files carry no history of their own.
