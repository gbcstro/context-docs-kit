# Host Adaptation

<!-- context-docs-kit:shared — canonical copy lives in shared/references/. Edit there, then `npm run sync`. -->

This skill runs on any host that implements the open Agent Skills standard. The
process is identical everywhere; three things differ. **Resolve them before the
first question**, because two of them change what you write into the user's repo.

## Capability table

| Host | Agent file | `@file` import | Named persona subagents |
|---|---|---|---|
| Claude Code | `CLAUDE.md` | yes | yes |
| Codex | `AGENTS.md` | **no** | no |
| Gemini CLI | `GEMINI.md` | yes | no |
| Antigravity | `AGENTS.md` | **no** | no |

## How to tell which host you are on

Do not ask the user. Detect it, and only ask if detection is genuinely ambiguous.

1. **Which agent file does the repo already have?** `CLAUDE.md`, `GEMINI.md`, `AGENTS.md`. Use what is there; never introduce a second convention alongside an existing one.
2. **Where was this skill loaded from?** `~/.claude/skills` → Claude Code. `~/.agents/skills` or `<repo>/.agents/skills` → Codex or Antigravity. `~/.gemini/skills` or `.gemini/skills` → Gemini CLI. `~/.gemini/config/skills` → Antigravity.
3. **Can you dispatch a named subagent?** If you have no tool that dispatches one, you do not have them, regardless of host.

If the repo has no agent file and you cannot tell, ask once — one question, with the four options — and record the answer for the rest of the session.

## Degradation 1 — no persona subagents

The per-doc pass has five stages, three of which are written as subagent
dispatches. Without subagents, **run them inline in the main conversation** and
change nothing else about the sequence.

| Stage | With subagents | Without |
|---|---|---|
| 1 Scan | dispatch the persona agent | read the repo yourself, wearing the persona from `references/<doc>.md` |
| 2 Grill | main conversation | unchanged — this was never a subagent |
| 3 Draft | dispatch the persona agent | write the doc yourself from approved answers only |
| 4 Review | dispatch `context-doc-critic` | **a separate turn**, adversarial, against `references/critic.md` |
| 5 Gate | the user | unchanged |

**Stage 4 is the one that degrades badly if you are careless.** Its whole value
is that a different reader checks the draft. Inline, that becomes a deliberate
act: finish the draft, stop, then re-open the file cold and run
`references/critic.md` against it as if someone else wrote it. Never fold the
review into the drafting turn — a writer checking its own sentence as it writes
it finds nothing.

## Degradation 2 — no `@file` import

On Claude Code and Gemini CLI, `RULES.md` §2 is pulled into every conversation
with a one-line import. On Codex and Antigravity there is no import, so an
`@context/RULES.md` line is inert text and the rules silently never apply.

**With import support:**

```markdown
## Rules

@context/RULES.md
```

**Without import support** — inline §2 verbatim, between markers so
`aligning-context-docs` can refresh it in place instead of appending a second copy:

```markdown
## Rules

<!-- context-docs-kit:rules:start -->
<RULES.md §2, copied verbatim>
<!-- context-docs-kit:rules:end -->
```

Copy §2 and only §2. The rest of `RULES.md` stays discoverable through the
Context Docs Map; inlining the whole file burns context in every conversation.

When the markers already exist, replace what is between them. Never append.

## Degradation 3 — the agent file's name

Use the file the repo already has. If there is none, create the one that matches
the detected host from the table above. In a monorepo with per-package agent
files, wire the **root** file only.

If the repo has several (a `CLAUDE.md` and an `AGENTS.md`, say), wire the one
belonging to the detected host, and say in one line that the others exist and
were left alone.
