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
| `docker-compose.yml`, `terraform/`, `infrastructure/` | §4 system diagram and the Hosting, Deploy & Rollback section — services running that no component in the diagram represents |
| `.github/workflows/`, CI config | the Hosting, Deploy & Rollback section, and §2's constraint resolution if the constraint was a build-path one; the CI gates the doc says must pass |
| `.env.example`, secret names | external services nobody documented |
| ORM and migration tooling in use | the Database & Migrations section |
| outbound HTTP/RPC call sites, client wrappers, SDK usage | the Reliability & Failure Modes section — a call to a dependency the table never mentions, or one with no timeout |
| request handlers, job and queue code | the Operating Envelope — a synchronous call to a slow dependency on a hot path; in-process state in a handler the doc calls stateless; a job with no idempotency key where retries are stated |
| logging setup, health endpoint, metrics and alert config | the Observability section — is what the doc promises actually emitted, and still alerting? |
| auth middleware, query layer | the Authentication & Authorization section — is tenant scoping enforced where the doc says, or only in the UI? |

**The highest-value check in the whole scan:** a service in compose or a
dependency in the manifest that appears nowhere in the doc. That is an
architectural decision made inline — exactly what `RULES.md` §2 rule 2 exists to
prevent — and it is where the doc becomes actively misleading rather than merely
incomplete.

**Check the envelope against reality** (`references/production-readiness.md`). The
Operating Envelope is a set of numbers the design was judged against. Where real
measurements exist — traffic, table sizes, p95s, the cloud bill — compare them to
the doc. A ceiling that has been reached, a deferred two-way door whose trigger has
fired, or a stakes level that has risen (paying users arrived, personal data was
added) is a finding even when no line of code is wrong. Report it as MAJOR, with
the measurement as evidence, and let the user decide whether the doc or the design
moves.

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
| `PRODUCT.md` §4 field lists | every product field has a home: a column, a derived value, or an explicit descope |
| retention, deletion and cleanup jobs, erasure endpoints | the Data Lifecycle & Volume section — a retention rule nothing enforces, or personal data with no deletion path in code |
| unique constraints, version columns, idempotency-key handling | the stated integrity guards — a "never duplicates" claim with no constraint behind it |
| the newest migrations | change safety: a column dropped or renamed in one step, a long-locking migration on a large table |

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
| the design token file, theme config, CSS variables | the color palette, semantic token taxonomy, surface hierarchy, and pairing/contrast rules |
| font loading, type scale config, typography constants | the typography ramp (Display through Code), font families, weights, and line heights |
| spacing/padding/margin constants, radius values | the spacing scale, radius scale, and elevation/shadow tokens |
| navigation bar, header, sidebar, and layout frame components | the app shell architecture, navbar anatomy, sidebar (if any), and mobile collapse behavior |
| modal / dialog components, confirmation dialogs | the modal dialog spec (sizes, backdrop, focus trap, dismiss, animation) and confirmation/destructive dialog spec |
| drawer / sheet components | the slide-over drawer and bottom sheet specs |
| tooltip components or libraries | the tooltip spec (trigger delay, placement/flip, arrow, sizing, ARIA) |
| popover components | the popover spec (click-to-toggle, interactive content, focus, ARIA) |
| dropdown menu / action menu components | the dropdown menu spec (item anatomy, groups, submenus, keyboard nav, ARIA) |
| context menu / right-click handlers | the context menu spec (cursor-anchor, same anatomy as dropdown) |
| select / combobox / autocomplete components | the select menu and combobox spec (search, multi-select, ARIA) |
| date picker components | the date/calendar picker spec |
| command palette / spotlight / search modal | the command palette spec (Cmd+K, result groups, z-index) |
| toast / notification components | the toast spec (position, auto-dismiss, pause-on-hover, stacking, status variants, ARIA) |
| alert / banner components | the inline alert and banner notification spec (variants, dismiss rules) |
| z-index values across all files | the calibrated z-index scale (base through tooltip) |
| button components | button variants, sizes, and *all six+ states* (default, hover, active, focus-visible, disabled, loading) |
| form input / control components | input, textarea, select, checkbox, radio, toggle, slider, file upload — each with all states |
| card / container components | card variants (static, clickable, selected), surface treatment |
| badge / chip / tag / status components | status variants, removable chips, dot indicators |
| avatar components | sizes, fallback initials, status dot, avatar groups |
| table / data grid components | header, hover/selected rows, pagination, mobile card-stack, bulk selection |
| list / list item components | item anatomy, hover/active, dividers |
| tab / segmented control components | active indicator, states, scroll overflow, ARIA |
| breadcrumb components | separator, truncation, current page aria |
| pagination components | variant, active/disabled states |
| progress bar, spinner, stepper, skeleton components | all loading and progress variants |
| accordion / collapsible components | expand/collapse behavior, ARIA |
| empty state, error state, loading state patterns | standard component empty/loading/error styles and skeletons |
| CSS transitions, keyframe animations, motion libraries | the animation system (duration tokens, easing curves, per-component table, reduced-motion handling) |
| icon usage and library | icon set, default sizes, stroke weight, color inheritance |

**What drift looks like here:** raw hex values scattered in components instead of semantic tokens, broken WCAG AA contrast ratios, navbar components missing mobile collapse or active indicators, ad-hoc tooltip or popover implementations that bypass the spec'd placement and z-index rules, dropdown menus without keyboard navigation or ARIA, confirmation dialogs that don't match the destructive styling contract, toast notifications with inconsistent auto-dismiss timing or positioning, new button variants or form input states invented without updating the component spec, and animation durations or easing that diverge from the token system.

---

## SCREENS.md

| Read | Compare against |
|---|---|
| route definitions, router configuration, screen/page files | the complete screen inventory (§1.1) and route map — every route has an entry |
| navigation config, navbar/sidebar link lists | the navigation graph and hierarchy — every screen is reachable by a link, CTA, or explicit flow |
| screen / page layout components | the ASCII wireframes in §3 — layout framing, component placement, and CTA positions match |
| screen-level empty, loading, and error states | per-screen state specifications in §3 — every screen handles zero-data, skeleton loading, and fetch failure |
| modal, drawer, and dialog invocation sites | modal and drawer flows in §4 — every trigger connects to the specified overlay flow |
| user journey / flow implementations | the core user flows in §2 — step-by-step sequences match the documented flow |

**What drift looks like here:** screens that exist in the codebase but are not in the inventory (§1.1) — usually added ad-hoc one at a time — orphan routes with no navigation path leading to them, screens with missing empty or error handling, wireframes that depict layouts different from what was implemented, and modal/drawer flows triggered from screens without an entry in §4.

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
| the CI gates, lint rules and tests that enforce each Production Standards rule | §11 — a rule whose check has gone is decoration that still claims to be enforced |
| the code at the seams §4's examples describe | do the worked examples still compile and still describe the real structure? |

**Two checks unique to this doc:**

**Enforcement paths that have gone.** A rule whose CI check was deleted is now
decoration, and the doc still claims it is enforced. That is worse than an
unenforced rule honestly labelled.

**Worked examples that have rotted.** §4's examples reference real files and real
structures. When the code moves, an example can end up describing a seam that no
longer exists — and an example that is wrong teaches the wrong thing more
effectively than no example at all. Re-render it against the current code and
show the user, or drop the principle from the doc and register it in `PROGRESS_v<N>.md` §4.

---

## PROGRESS_v<N>.md

| Read | Compare against |
|---|---|
| each item's acceptance criteria | the code and tests that would satisfy them |
| each item's `Source:` pointer | does that doc section still say what the item claims? |
| the docs' current state | does §1's doc-set table still list the right revisions? |
| unticked items | is anything already done? |
| non-functional criteria (load, latency, restore, failure behaviour) | is the named measurement method still runnable — the load script, the drill — and when did it last run? |
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
ticked criterion that has regressed; a delete behaviour mismatch; authorization
enforced only in the UI where the doc says the data layer.

**MAJOR** — a library, service or entity in the code that no doc mentions; an
enforcement path that has disappeared; an architecture artifact that no longer
matches disk; a worked example that no longer compiles; the operating envelope
exceeded or a deferral trigger fired; a dependency call with no timeout where the
doc requires one.

**MINOR** — stale wording; an unticked item that is met; numbering; a doc-set
table with outdated revisions; a §4 entry whose question is settled in practice
but not yet retired.

Any `## Open Questions` section, `TBD`, or `to be decided` surviving in a doc is
**MAJOR** — a hole left where a decision belongs, per
`references/closing-questions.md`.

Every finding carries its evidence — file and line, manifest entry, migration
name. A finding the user cannot verify in ten seconds is a finding they cannot
act on.
