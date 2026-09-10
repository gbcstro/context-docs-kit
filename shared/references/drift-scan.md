# The Three-Way Drift Scan

<!-- context-docs-kit:shared — canonical copy lives in shared/references/. Edit there, then `npm run sync`. -->

For each doc in the set, hold three sources against each other:

- **the doc** — what was decided (intent)
- **the code** — what exists (evidence)
- **`PROGRESS_v<N>.md`** — what this version committed to (scope)

Read the doc, then read the code the table points at, then read the checklist
items whose `Source:` pointer names that doc. A finding is any place two of the
three disagree.

**Do not scan everything at once.** Go doc by doc in dependency order, the same
way the docs were written. A `SCHEMA.md` finding often dissolves once you have
looked at `ARCHITECTURE.md`, and finding it twice wastes the user's attention.

---

## PRODUCT.md

| Read | Compare against |
|---|---|
| the app's routes, screens, commands, CLI verbs | §4 feature list — is every shipped capability described? |
| feature flags, config toggles | features claimed as shipped that are actually gated off |
| pricing/billing code, payment SDK usage | §5 monetization |
| analytics events, metric collection | §7 success metrics — is anything actually measured? |
| the current checklist | does every §4 feature in scope for this version have an item? |

**What drift looks like here:** a feature in the product that the PRD never
mentions (usually scope that crept in), or a §4 feature with no code, no
checklist item and no register entry (usually scope that quietly died). Both
matter; the second is easier to miss.

Field lists are the highest-value part of §4, because `SCHEMA.md` derives from
them. A field renamed in code and not in the PRD propagates a wrong name into
every downstream doc.

---

## ARCHITECTURE.md

| Read | Compare against |
|---|---|
| `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `*.csproj` | §1 stack block — every dependency of consequence named, every named one present |
| lockfile diffs since the doc's `Last updated` | libraries added without a doc change |
| the real directory layout | §3 repo tree — is the approved tree still the tree on disk? |
| `docker-compose.yml`, `terraform/`, `infrastructure/` | §4 system diagram, §12 hosting — services running that no component in the diagram represents |
| `.github/workflows/`, CI config | §12 deploy path, and §2's constraint resolution if the constraint was a build-path one |
| `.env.example`, secret names | external services nobody documented |
| ORM and migration tooling in use | §8 |

**The highest-value check in the whole scan:** a service in compose or a
dependency in the manifest that appears nowhere in the doc. That is an
architectural decision made inline — exactly what `RULES.md` §2 rule 2 exists to
prevent — and it is where the doc becomes actively misleading rather than merely
incomplete.

**Also check §2, the binding constraint.** Constraints expire: a team grows, a
budget arrives, a Mac gets bought. A resolved constraint whose mechanism is still
described as necessary sends every future decision down a path nobody needs
anymore. Ask; do not assume it still binds.

**And check the artifacts.** §3's tree and §4's diagram were approved as pictures
at the bootstrap gate. A tree that no longer matches `ls` is drift with a
high blast radius, because it is the thing a new contributor trusts first.

---

## SCHEMA.md

| Read | Compare against |
|---|---|
| `prisma/schema.prisma`, `drizzle/`, `models/`, entity classes | the entity list — every table present in both |
| `migrations/`, `*.sql`, migration history | columns, types, nullability, defaults |
| index definitions | §on indexes |
| foreign keys and `onDelete` behaviour | stated delete behaviour — this is the one most often silently wrong |
| `PRODUCT.md` §4 field lists | every product field has a home: column, derived value, or parked question |

**What drift looks like here:** a migration applied that the doc never absorbed.
Check the migration directory against the doc's `Last updated` — anything newer
is unreviewed by definition.

Delete behaviour deserves its own pass. `onDelete: cascade` in code against
"soft delete, history retained" in the doc is a data-loss bug that reads as a
documentation nit.

If the project keeps two schemas in lockstep (local and server), check both, and
check that they still agree with each other.

---

## DESIGN.md

| Read | Compare against |
|---|---|
| route definitions, screen/page files | the complete screen inventory — every route has an entry |
| the design token file, theme config, CSS variables | the color and typography tokens |
| component directory | the component system section |
| navigation config, router layout | the navigation model, and whether every screen is reachable |

**What drift looks like here:** screens that exist and are not in the inventory —
usually added one at a time — and tokens that have quietly become raw hex values
in components. Check whether contrast commitments (WCAG AA, say) still hold for
the tokens as they are now, not as they were written.

---

## RULES.md

| Read | Compare against |
|---|---|
| `.eslintrc*`, `eslint.config.*`, `.prettierrc*`, `ruff.toml`, `tsconfig*.json` | §5 language & style — is the strictness the doc claims actually enabled? |
| `.github/workflows/`, `.husky/`, `lint-staged` | every rule's stated enforcement path — is the check that enforces it still there? |
| recent git history | §6 git workflow — branch naming and commit style in practice, not in aspiration |
| test files and coverage | §7 testing conventions — is the stated standard the standard being held? |
| `.gitignore`, tracked files | §8 secrets. **Report a tracked secret immediately and prominently, before anything else in the report.** |
| the migration commands actually used | §9 |
| the code at the seams §4's examples describe | do the worked examples still compile and still describe the real structure? |

**Two checks unique to this doc:**

**Enforcement paths that have gone.** A rule whose CI check was deleted is now
decoration, and the doc still claims it is enforced. That is worse than an
unenforced rule honestly labelled.

**Worked examples that have rotted.** §4's examples reference real files and real
structures. When the code moves, an example can end up describing a seam that no
longer exists — and an example that is wrong teaches the wrong thing more
effectively than no example at all. Re-render it against the current code and
show the user, or park the principle.

---

## PROGRESS_v<N>.md

| Read | Compare against |
|---|---|
| each item's acceptance criteria | the code and tests that would satisfy them |
| each item's `Source:` pointer | does that doc section still say what the item claims? |
| the docs' current state | does §1's doc-set table still list the right revisions? |
| unticked items | is anything already done? |
| ticked items | is anything **no longer** true — a regression, or a feature removed? |
| `§4` provisional decisions | is each still the decision in force in the doc it names? has the code settled one — or quietly departed from one? |

**A ticked item that has regressed is the most damaging state in the file**,
because it is the one nobody re-checks. If evidence for a ticked criterion has
disappeared, report it as CRITICAL.

**A §4 entry the code has silently departed from is the second.** The register
says the decision in force is X, the code does Y, and the doc still says X. That
is a decision made inline without going through the change protocol — report it
as CRITICAL, not as a stale register entry.

---

## Reporting order

Report by severity, not by doc:

**CRITICAL** — a doc asserts something the code contradicts; a tracked secret; a
ticked criterion that has regressed; a delete behaviour mismatch.

**MAJOR** — a library, service or entity in the code that no doc mentions; an
enforcement path that has disappeared; an architecture artifact that no longer
matches disk; a worked example that no longer compiles.

**MINOR** — stale wording; an unticked item that is met; numbering; a doc-set
table with outdated revisions; a §4 entry whose question is settled in practice
but not yet retired.

Any `## Open Questions` section, `TBD`, or `to be decided` surviving in a doc is
**MAJOR** — a hole left where a decision belongs, per
`references/closing-questions.md`.

Every finding carries its evidence — file and line, manifest entry, migration
name. A finding the user cannot verify in ten seconds is a finding they cannot
act on.
