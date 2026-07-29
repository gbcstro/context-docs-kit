# RULES.md — Persona, Question Bank, Skeleton

**Depends on:** every other doc in the set
**Agent:** `engineering-standards`
**Include when:** always.

---

## Persona Brief

You are a staff engineer writing the conventions document, and you understand that this doc's first job is not style — it is **preventing the other four docs from drifting into fiction.**

**What this persona will not let slide:**

- **Omitting the AI-assistant rules section.** Write it first. See below.
- **Rules with no enforcement path.** A rule nobody checks is decoration. For each: is it a lint rule, a CI check, a review step, or a judgment call? Say which.
- **Aspirational testing standards.** "100% coverage" in a solo part-time project is a rule that will be broken in week two, after which every other rule in the doc loses authority. Write the standard the project will actually hold.
- **Style rules that a formatter already handles.** If Prettier or gofmt enforces it, the rule is "run the formatter" — not a paragraph about brace placement.
- **Secrets handling left implicit.** It gets a section, always, even for a solo hobby project.

**The core insight:** every other doc in the set describes decisions. This one describes **how those decisions stay true.** Its §2 is addressed to future AI assistants, not to the human author.

---

## Write §2 First

The AI-assistant rules section is the loop-closer. Bootstrap ends when this skill exits; §2 is what keeps the docs accurate on every change afterward.

Without it the failure is predictable and quiet: an assistant implements a feature, makes an architectural choice inline, never updates `ARCHITECTURE.md`, and three sessions later the docs describe a system that no longer exists. At that point they're worse than absent — they actively mislead.

Six rules earn their place. Adapt the wording; keep the substance:

1. **Read before writing.** Read the relevant `context/*.md` before implementing in that area, rather than assuming. Name which doc covers what.
2. **No undocumented architecture decisions.** Never introduce a library, service, or architectural approach that isn't in `ARCHITECTURE.md`/`SCHEMA.md` without flagging it and getting confirmation — *held to the same standard every existing choice was held to.* This sentence is what makes the rule stick: it's not bureaucracy, it's parity with how the doc was built.
3. **Keep the docs living, not frozen.** When an implementation decision changes or resolves something documented, update that doc **in the same change**. The docs are the source of truth and must never drift from what's actually decided.
4. **No speculative scope.** Don't add features beyond `PRODUCT.md` without checking first.
5. **Ask, don't guess.** When a requirement is ambiguous, ask rather than silently picking an interpretation.
6. **Wireframe before building UI** (only if `DESIGN.md` exists). Present an ASCII wireframe reflecting the visual system for approval before writing component code.

Add project-specific rules — but confirm each with the user; don't invent obligations they never agreed to.

---

## Question Bank

Most answers are already implied by the approved docs. **Read them and propose, rather than asking cold** — a question whose answer is sitting in `ARCHITECTURE.md` wastes the user's attention.

### 1. AI-assistant rules
Present the six above, adapted to this project, for confirmation. Ask what else has bitten them before that's worth encoding.

### 2. Code organization
Derived from `ARCHITECTURE.md` §3. State what belongs in each app/package and — more usefully — the rule for deciding where new code goes. "Needed by more than one app? It's a shared package."

### 3. Design principles
Which principles genuinely apply, and **where**. Generic SOLID recitation is noise; SOLID tied to this codebase's actual seams is useful:

> Open/Closed — the goal-metric calculators are structured so a new metric type can be added, one calculator per metric dispatched by type, without touching existing calculation code.

That's a rule someone can follow. Ask for the two or three places in *this* system where a principle has real purchase, and add the pragmatism caveat: applied where it adds clarity or testability, not as a checklist on every trivial function.

### 4. Language & style
Strictness settings, formatter, linter, and how they run (pre-commit, CI, both). Naming conventions per identifier kind — including which convention is reserved for database columns, echoing `SCHEMA.md`. Escape-hatch policy: is `any` banned, or allowed with a comment explaining why it's unavoidable?

### 5. Git workflow
Branching model, whether PRs are used (worth it even solo — it forces a self-review pass and keeps a clean diff-per-change history), commit message convention, and what must pass before merge.

### 6. Testing conventions
Concretize `ARCHITECTURE.md`'s testing posture into per-area expectations: what's unit tested, what's integration tested, what's manually verified, and what "done" requires. Be honest about scope; an accurate modest standard outperforms an aspirational one.

### 7. Environment & secrets
Is there a committed `.env.example` documenting every variable? Confirm the real `.env` is gitignored, and name what must never be committed or logged — API keys, database credentials, signing secrets.

### 8. Database migrations
Derived from `ARCHITECTURE.md` and `SCHEMA.md`. The tool per store, the rule that schema changes go through it rather than manual edits, and the lockstep rule: **a schema change isn't complete until `SCHEMA.md` reflects it.**

### 9. Ops runbook
Only if the project has infrastructure. Backups (what, where, how often), network exposure, deploy sequence, rollback. Resolves items other docs flagged as operational.

### 10. Open questions

---

## Section Skeleton

```markdown
# <Project> — Rules (Coding & Process Conventions)

**Status:** Draft v1
**Last updated:** YYYY-MM-DD
**Depends on:** [PRODUCT.md](./PRODUCT.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [SCHEMA.md](./SCHEMA.md), [DESIGN.md](./DESIGN.md)

## 1. Purpose

<This doc governs both how a human contributes and how an AI assistant behaves
in this repo. §2 is written as operating rules for the assistant; the rest
applies to anyone writing code here.>

## 2. AI Assistant Rules

<The six rules, adapted. Written as instructions, second person, imperative.>

## 3. Code Organization
## 4. Design Principles
## 5. Language & Style
## 6. Git Workflow
## 7. Testing Conventions
## 8. Environment & Secrets
## 9. Database Migrations
## 10. Ops Runbook            <- only if the project has infrastructure
## 11. Open Questions
## 12. Next Steps
```

The §1 framing matters: stating that the doc addresses both audiences, and that §2 is for the assistant, is what makes an agent reading it treat §2 as instructions rather than description.

---

## Handoff

This is the last doc in the chain. Its `## Next Steps` points at the wiring step, not another doc.

Then run `references/wiring.md` §3 — and note that this doc is the one that gets `@`-imported into the agent file, which is why its §2 is the section that actually executes. Everything else in the set is discoverable; §2 is unconditional.
