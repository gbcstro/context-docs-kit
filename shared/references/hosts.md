# Host Adaptation

<!-- context-docs-kit:shared — canonical copy lives in shared/references/. Edit there, then `npm run sync`. -->

This skill runs on any host that implements the open Agent Skills standard. The
process is identical everywhere; three things differ. **Resolve them before the
first question**, because two of them change what you write into the user's repo.

## Capability table

| Host | Agent file | `@file` import | Named persona subagents |
|---|---|---|---|
| Claude Code | `AGENTS.md` | yes | when installed by the plugin or `npx context-docs-kit install`; otherwise brief a general-purpose subagent |
| Codex | `AGENTS.md` | **no** | when installed by `npx context-docs-kit install --target codex` (TOML in `.codex/agents/`); otherwise brief a generic subagent (`default`/`worker`) |
| Gemini CLI | `AGENTS.md` | yes | no |
| Antigravity | `AGENTS.md` | **no** | no |

## How to tell which host you are on

Do not ask the user. Detect it, and only ask if detection is genuinely ambiguous.

1. **Where was this skill loaded from?** `~/.claude/skills` → Claude Code. `~/.agents/skills` or `<repo>/.agents/skills` → Codex or Antigravity. `~/.gemini/skills` or `.gemini/skills` → Gemini CLI. `~/.gemini/config/skills` → Antigravity.
2. **Can you dispatch a subagent, and which kind?** Three answers, in order of preference:
   - **Named** — `product-strategist`, `context-doc-critic` and the rest are in your list of dispatchable agents. Use them.
   - **Generic only** — you can dispatch a general-purpose subagent, but the named ones are absent. This is the normal state after `npx skills add` or a plugin install on Codex, neither of which installs custom agents. Use the **briefed** column below.
   - **None** — no tool dispatches a subagent. Run the stages inline.
3. **Are there legacy tool-specific files?** A pre-existing `CLAUDE.md` or `GEMINI.md` provides a hint if the install location is ambiguous, but the standard agent file to use and create is always `AGENTS.md`.

If you cannot tell, ask once — one question, with the four options — and record the answer for the rest of the session.

## Degradation 1 — no persona subagents

The per-doc pass has five stages, three of which are written as subagent
dispatches. Every persona definition ships inside this skill as
`agents/<name>.md`, so a missing named agent never means a missing persona.

| Stage | Named subagents | Generic subagent (briefed) | No subagents |
|---|---|---|---|
| 1 Scan | dispatch the persona agent | dispatch a general-purpose subagent briefed from `agents/<persona>.md` | read the repo yourself, wearing the persona from `references/<doc>.md` |
| 2 Grill | main conversation | main conversation | unchanged — this was never a subagent |
| 3 Draft | dispatch the persona agent | briefed general-purpose subagent | write the doc yourself from approved answers only |
| 4 Review | dispatch `context-doc-critic` | general-purpose subagent briefed from `agents/context-doc-critic.md` | **a separate turn**, adversarial, against `references/critic.md` |
| 5 Gate | the user | the user | unchanged |

**Briefing a general-purpose subagent.** Read `agents/<name>.md` from this
skill's folder. Its prompt is: the file's body (everything after the
frontmatter) as the subagent's standing instructions, then the task exactly as
you would have given the named agent — mode, paths, approved answers, date.
Carry the frontmatter's `tools:` line over as an instruction ("you may only
read, glob and grep" for the critic; add "and write `<path>`" for a drafting
persona), since a general-purpose agent has every tool by default and the
critic's independence depends on it never editing.

Without any subagents, **run the stages inline in the main conversation** and
change nothing else about the sequence.

**Stage 4 is the one that degrades badly if you are careless.** Its whole value
is that a different reader checks the draft. Inline, that becomes a deliberate
act: finish the draft, stop, then re-open the file cold and run
`references/critic.md` against it as if someone else wrote it. Never fold the
review into the drafting turn — a writer checking its own sentence as it writes
it finds nothing.

## Degradation 2 — no `@file` import

On Claude Code and Gemini CLI, `RULES.md` §2 can be pulled into every conversation
with a one-line import. On Codex and Antigravity there is no import, so an
`@context/RULES.md` line is inert text and the rules silently never apply.

Because `AGENTS.md` is shared across all coding tools, **inlining §2 between markers is
the universal approach** so that every tool (Codex, Antigravity, Claude Code, Gemini CLI,
Cursor, etc.) receives the rules unconditionally:

**Without import support (and universal format across all coding tools):**

```markdown
## Rules

<!-- context-docs-kit:rules:start -->
<RULES.md §2, copied verbatim>
<!-- context-docs-kit:rules:end -->
```

**With import support (only when targeting hosts with `@file` import support exclusively):**

```markdown
## Rules

@context/RULES.md
```

Copy §2 and only §2. The rest of `RULES.md` stays discoverable through the
Context Docs Map; inlining the whole file burns context in every conversation.

When the markers already exist, replace what is between them. Never append.

## Degradation 3 — the agent file's name

Always use `AGENTS.md`. **When created, create only `AGENTS.md` to be used by all coding tools**
instead of identifying each one like `CLAUDE.md`, `GEMINI.md`, etc. In a monorepo with per-package
agent files, wire the **root** file only.

If the repo already has `AGENTS.md`, wire into it. If the repo has several files (such as a legacy
`CLAUDE.md` and an `AGENTS.md`), wire into `AGENTS.md` and say in one line that the others exist and
were left alone.
