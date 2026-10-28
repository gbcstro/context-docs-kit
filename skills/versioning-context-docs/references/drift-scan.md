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
| `README.md`, package metadata, landing copy | §1 product identity, positioning, core purpose, and domain glossary |
| auth middleware, RBAC guards, organization/tenancy scoping | §2.3 user roles & capability matrix |
| the app's routes, navigation surfaces, screens, CLI verbs | §4.1 functional surface map — does every key surface exist? |
| onboarding routes, first-run screens, core workflows | §4.2 end-to-end user journeys — does the actual user path match? |
| feature actions, validation schemas, calculations, state machines | §4.3+ feature specs — are capabilities, business rules, and state transitions implemented as specified? |
| inputs, forms, API payloads, serializers | §4.3+ field contracts — do captured data fields and derived values match? |
| feature flags, config toggles | features claimed as shipped that are actually gated off |
| pricing/billing code, payment SDKs, tier/quota limit checks | §5 monetization, tier entitlements & usage quotas |
| platform targets, offline/sync handlers, notification & export services | §6 platform, ergonomics & touchpoints |
| analytics events, telemetry, metric collection | §7 success metrics — is anything actually measured? |
| the current checklist | does every §4 feature in scope for this version have an item? |

**What drift looks like here:** a feature in the product that the PRD never
mentions (usually scope that crept in), or a §4 feature with no code, no
checklist item and no register entry (usually scope that quietly died). Both
matter; the second is easier to miss.

Domain vocabulary, user roles, and field lists are the highest-value parts of
`PRODUCT.md`. A domain concept or field renamed in code and not in the PRD
propagates a wrong name into `SCHEMA.md`, `ARCHITECTURE.md`, and every
downstream doc. Business rules or tier limits modified in code without an update
to §4 or §5 leave the product doc describing fantasy logic.

---

## ARCHITECTURE.md

| Read | Compare against |
|---|---|
| `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `*.csproj` | §1.1 stack block & §1.3 approved libraries registry — every dependency of consequence named, every named one present |
| lockfile diffs since the doc's `Last updated` | libraries added without a doc change |
| workspace configs (`pnpm-workspace.yaml`, `turbo.json`, `nx.json`), real directory layout, and internal imports | §3.1 repo strategy, §3.2 approved repo tree, §3.3 package placement rules, and §3.4 module dependency direction rules |
| runtime services, processes, and RPC/event wiring | §4.1 system design principles (CAP/PACELC/ACID vs. BASE), §4.2 system diagram, §4.3 component ownership boundaries, and §4.4 inter-component communication matrix |
| client routing, rendering mode, state stores, and build/bundle scripts | §5 client & frontend architecture |
| API route handlers, OpenAPI/GraphQL/tRPC/gRPC schemas, response envelopes, pagination, validation, rate limiters, and WebSockets/SSE | §6 API structure & backend architecture |
| DB client, connection pooler config, ORM, migration tooling, sync/conflict code, and full-text/vector search indexes | §7 database & data storage architecture |
| Redis/Valkey/Memcached/CDN/client caching code, key prefixes, TTLs, and mutation invalidation hooks | §8 caching architecture |
| queue brokers (BullMQ, SQS, RabbitMQ, Kafka, Inngest), pub/sub topics, worker concurrency, retries, DLQs, and cron schedules | §9 queues, pub/sub, background workers & event architecture |
| S3/R2/GCS/Supabase storage SDKs, presigned upload/download flows, MIME/size checks, media processing, quota enforcement, and CDN headers | §10 file storage, media processing & CDN architecture |
| inbound/outbound webhook routes, HMAC signature verification, event deduplication, third-party SDKs, and email/push/SMS dispatchers | §11 webhooks, third-party integrations & notification architecture |
| auth provider SDKs, JWT/session cookie config, refresh rotation, RBAC/ABAC/RLS guards, CORS/CSP/CSRF middleware, and `.env.example` | §12 authentication, authorization & security architecture |
| `Dockerfile*`, `docker-compose*.yml`, cloud compute manifests, VPC/ingress/load-balancer configs | §13 containers, cloud infrastructure & networking |
| `terraform/`, `*.tf`, `opentofu/`, `pulumi/`, `sst.config.*`, `cdk.json`, `fly.toml`, `render.yaml`, `.github/workflows/`, CI/CD & rollback scripts | §14 Infrastructure as Code (IaC), environments & CI/CD deployment architecture, plus §2's constraint resolution if build/infra-related |
| API/DB timeout settings, auto-scaling configs, replica/pooling setup, backup schedules, and load test thresholds | §15 target response times (`p50`/`p95`/`p99`), throughput budgets, scaling triggers, and HA/RPO/RTO targets |
| logger config, OpenTelemetry/Sentry setup, `/healthz` & `/readyz` routes, and test runner configs | §16 observability, error handling & testing architecture |

**The highest-value check in the whole scan:** a service in compose/IaC, a
queue/cache/storage client, or a dependency in the manifest that appears nowhere
in the doc. That is an architectural decision made inline — exactly what
`RULES.md` §2 rule 2 exists to prevent — and it is where the doc becomes
actively misleading rather than merely incomplete.

**Also check §2, the binding constraint.** Constraints expire: a team grows, a
budget arrives, a Mac gets bought. A resolved constraint whose mechanism is still
described as necessary sends every future decision down a path nobody needs
anymore. Ask; do not assume it still binds.

**And check the artifacts.** §3.2's tree and §4.2's diagram were approved as
pictures at the bootstrap gate. A tree that no longer matches `ls`, or a diagram
missing a new queue, cache, or storage bucket, is drift with a high blast radius,
because it is the thing a new contributor trusts first.

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
| the design token file, theme config, CSS variables | color palette ramps, semantic token taxonomy, surface hierarchy, and contrast/pairing rules |
| font loading, type scale config, typography constants | the typography ramp (Display through Code), font families, weights, and line heights |
| spacing/padding/margin constants, radius values | spacing scale, border radius scale, and elevation/shadow tokens |
| layout grid, responsive breakpoint config, container rules | responsive breakpoints, container max-widths, and layout grid system |
| navigation bar, header, sidebar, and layout frame components | app shell architecture, navbar anatomy, sidebar (if any), and mobile navigation behavior |
| UI components (buttons, inputs, cards, tables, badges, avatars) | component specs — variants, sizes, and interactive states (default, hover, active, focus-visible, disabled, loading) |
| modal, drawer, dropdown, tooltip, popover, toast, alert components | overlay system contracts (backdrop, dismiss, focus trap, stacking/z-index hierarchy) |
| empty state, error state, loading state patterns | standard component empty states, skeleton shimmer loader patterns, and error fallbacks |
| CSS transitions, keyframe animations, motion libraries | animation system (duration tokens, easing curves, per-component table, reduced-motion handling) |
| icon usage and library | icon set, default sizes, stroke weight, color inheritance |

**What drift looks like here:** raw hex values scattered in components instead of semantic tokens, broken WCAG AA contrast ratios, navbar components missing mobile collapse or active indicators, components with missing interactive or loading/error states, overlay implementations that bypass placement or z-index rules, dropdown menus without keyboard navigation or ARIA, toast notifications with inconsistent timing or positioning, and animation durations or easing that diverge from the token system.

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
| `RULES.md` §2 and `AGENTS.md` | **Ongoing-project upgrade check:** does §2 include the 11 rules (with 4-layer UI craft, Beat-Sheet Video/Media Gate, Playwright `webapp-testing`, and 30-day changelog compaction), and does `AGENTS.md` carry the `## Team Skill Ecosystem` routing table from `references/agent-file.md`? |

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

Any `Open Questions` section, `TBD`, or `to be decided` surviving in a doc is
**MAJOR** — a hole left where a decision belongs, per
`references/closing-questions.md`.

Every finding carries its evidence — file and line, manifest entry, migration
name. A finding the user cannot verify in ten seconds is a finding they cannot
act on.
