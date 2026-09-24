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
- **A design principle with no worked example.** A principle name is not a rule anyone can follow. §4 carries the example the user accepted, or the principle does not appear.

**The core insight:** every other doc in the set describes decisions. This one describes **how those decisions stay true.** Its §2 is addressed to future AI assistants, not to the human author.

---

## Write §2 First

The AI-assistant rules section is the loop-closer. Bootstrap ends when this skill exits; §2 is what keeps the docs accurate on every change afterward.

Without it the failure is predictable and quiet: an assistant implements a feature, makes an architectural choice inline, never updates `ARCHITECTURE.md`, and three sessions later the docs describe a system that no longer exists. At that point they're worse than absent — they actively mislead.

Six rules earn their place. Adapt the wording; keep the substance:

1. **Read before writing.** Read the relevant `context/*.md` before implementing in that area, rather than assuming. Name which doc covers what.
2. **No undocumented architecture decisions.** Never introduce a library, service, or architectural approach that isn't in `ARCHITECTURE.md`/`SCHEMA.md` without flagging it and getting confirmation — *held to the same standard every existing choice was held to.* This sentence is what makes the rule stick: it's not bureaucracy, it's parity with how the doc was built.
3. **Keep the docs living, not frozen.** When an implementation decision changes or resolves something documented, update that doc **in the same change**, bump its `Revision`, and cascade to any doc that depends on it. Present tense only: the doc reads as if the new decision had always been the decision. **The reason goes in `context/PROGRESS/CHANGELOG_v<current>.md`, never in the doc.** The docs are the source of truth and must never drift from what is actually decided.
4. **No speculative scope.** Don't add features beyond `PRODUCT.md`, or beyond the current version's checklist in `context/PROGRESS/PROGRESS_v<current>.md`, without checking first. The checklist is what this version is committed to; anything outside it is a conversation, not a task.
5. **Ask, don't guess.** When a requirement is ambiguous, ask rather than silently picking an interpretation.
6. **Wireframe before building UI** (only if `DESIGN.md` or `SCREENS.md` exists). Present an ASCII wireframe reflecting the visual system and screen layout for approval before writing component code.

Add project-specific rules — but confirm each with the user; don't invent obligations they never agreed to.

---

## The Worked-Example Loop

**A principle is agreed on its example, never on its name.**

Everyone says yes to "single responsibility". Almost nobody means the same thing
by it, and a `RULES.md` full of principle names is a doc that changes no
behaviour — a contributor reads "we follow SOLID", learns nothing about where the
seams are, and writes whatever they were going to write anyway.

So §4 is settled by a loop, not by a question. Run it for design principles, and
for any project-specific rule the user proposes.

### 1. Offer the families, don't recite them

Name the four or five principle families that plausibly bite **this** codebase,
drawn from the approved `ARCHITECTURE.md` and `SCHEMA.md`, and let the user pick.
Never walk through all of them.

> Given the shape of this codebase, four are worth settling and the rest are
> noise here:
>
> - **Functional core / imperative shell** — you have real maths in the streak
>   calculators and everything else is I/O
> - **Open/closed at the calculator seam** — metric types look like they will keep arriving
> - **Dependency direction** — whether `core/` may ever import from `db/`
> - **Error posture** — fail fast on programmer error vs. degrade for the user
>
> Which of these do you actually want written down, and is there one I've missed
> that has bitten you before?

### 2. Propose it against a named seam

Not "we follow open/closed" but "the calculator dispatch in `src/core/metrics/`
is the place open/closed pays for itself, because a new metric type is a file
rather than an edit". The seam comes from the approved architecture. If you
cannot name the seam, the principle probably does not apply here, and saying so
is a better answer than writing it down.

### 3. Render the worked example immediately

Same message as the proposal. In this project's real language, real naming, real
paths. Either shape works:

**A before/after:**

```ts
// today, and what the rule stops
export function calculate(metric: Metric, entries: Entry[]) {
  if (metric.type === 'streak') { ... }
  else if (metric.type === 'total') { ... }
  else if (metric.type === 'average') { ... }   // <- every new type edits this
}

// under the rule
// src/core/metrics/streak.ts
export const streak: Calculator = { type: 'streak', calculate(entries) { ... } };
// src/core/metrics/index.ts
export const calculators = [streak, total, average];   // <- a new type is one line
```

**Or a scenario, when the code does not exist yet:**

> A new metric type arrives — "best week". Under this rule a contributor adds
> `src/core/metrics/best-week.ts`, registers it in `index.ts`, and writes one
> test file. They touch no existing calculator, and nothing in `app/` changes.
> Without it they add a fourth branch to `calculate()` and every existing
> calculator's tests are in the blast radius.

The example must show the **consequence**, not just the shape. "A new type is one
line" is what the user is agreeing to.

### 4. Ask about the example, not the principle

> Is that the tradeoff you want — a file per metric type, in exchange for never
> editing existing calculation code?

Never "does open/closed sound good?" The abstraction is easy to accept and
tells you nothing.

### 5. Loop on adjustment

If the user adjusts or rejects, **re-render the example with their correction**
and ask again. This is the part that gets skipped, and skipping it means
recording a principle the user has agreed to a different version of.

> "Registering in an index file is annoying — can it just be the filename?"
>
> Then it looks like this instead: `src/core/metrics/*.ts` each default-export a
> `Calculator`, and `index.ts` globs the directory. A new type is a file and
> nothing else. Cost: the registry is implicit, so a typo'd filename fails at
> runtime rather than at compile time. That version?

### 6. Cap at three rounds

If three rounds have not converged, stop. The principle does not go in the doc —
that absence is the decision. Register it in `PROGRESS_v<N>.md` §4 with what was
tried and where the disagreement sits, and move to the next principle.
A principle nobody can pin down is not one the project will follow, and grinding
on it costs more than it returns.

### 7. Record the principle with its example

The accepted example goes into `RULES.md` §4 **with** the principle. A principle
with no accepted worked example does not enter the doc. It goes to the
`PROGRESS_v<N>.md` §4 register, or it goes nowhere.

That is what makes §4 the section a contributor can act on: it does not say what
the project believes, it shows what the project does.

---

## Question Bank

Most answers are already implied by the approved docs. **Read them and propose, rather than asking cold** — a question whose answer is sitting in `ARCHITECTURE.md` wastes the user's attention.

### 1. AI-assistant rules
Present the six above, adapted to this project, for confirmation. Ask what else has bitten them before that's worth encoding.

### 2. Code organization
Derived from `ARCHITECTURE.md` §3. State what belongs in each app/package and — more usefully — the rule for deciding where new code goes. "Needed by more than one app? It's a shared package."

### 3. Design principles
**Run the worked-example loop above.** This is not a question with an answer; it is the loop, once per principle the user selects.

Two or three principles with accepted examples beat eight with none. Add the pragmatism caveat to the section: applied where it adds clarity or testability, not as a checklist on every trivial function.

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

### 10. Nothing left open
Sweep back over the pass: decided, provisionally decided and registered, or descoped. `references/closing-questions.md`. A rule nobody could settle is not written down vaguely — it is left out, and that absence is the decision.

---

## Section Skeleton

```markdown
# <Project> — Rules (Coding & Process Conventions)

**Project version:** v1
**Revision:** 1
**Last updated:** YYYY-MM-DD
**Depends on:** [PRODUCT.md](./PRODUCT.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [SCHEMA.md](./SCHEMA.md), [DESIGN.md](./DESIGN.md), [SCREENS.md](./SCREENS.md)

## 1. Purpose

<This doc governs both how a human contributes and how an AI assistant behaves
in this repo. §2 is written as operating rules for the assistant; the rest
applies to anyone writing code here.>

## 2. AI Assistant Rules

<The six rules, adapted. Written as instructions, second person, imperative.>

## 3. Code Organization
## 4. Design Principles

<Each accepted principle, the seam it applies to, and the worked example the
user accepted. No principle appears without its example.>

## 5. Language & Style
## 6. Git Workflow
## 7. Testing Conventions
## 8. Environment & Secrets
## 9. Database Migrations
## 10. Ops Runbook            <- only if the project has infrastructure
## 12. Next Steps
```

The §1 framing matters: stating that the doc addresses both audiences, and that §2 is for the assistant, is what makes an agent reading it treat §2 as instructions rather than description.

---

## Handoff

This is the last doc in the chain. Its `## Next Steps` points at the wiring step, not another doc.

Then run `references/wiring.md` §3. This is the doc whose §2 reaches the agent file — as an `@`-import on hosts that support one, or copied verbatim between markers on hosts that do not (`references/hosts.md`). Either way §2 is the part that actually executes. Everything else in the set is discoverable; §2 is unconditional.

`PROGRESS_v1.md` comes after the wiring, and it needs one thing from here: the testing posture, because "done" in an acceptance criterion means whatever §7 says it means.
