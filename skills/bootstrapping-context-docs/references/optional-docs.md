# Optional Docs — When the Core Set Doesn't Fit

Load this during the doc-set proposal, when the project has a concern the core five don't cover, or when one of the five clearly doesn't apply.

---

## Dropping a Core Doc

Dropping is the common case, not the exception. A stub doc is worse than a missing one: it implies the concern was considered, and nobody opens it again.

| Doc | Drop when | Where its content goes instead |
|---|---|---|
| `SCHEMA.md` | no persistent data — a pure CLI filter, a stateless transformer | config-file shape into `ARCHITECTURE.md` |
| `DESIGN.md` | no GUI — CLI, library, daemon | CLI ergonomics / public API surface into `PRODUCT.md` |

`PRODUCT.md`, `ARCHITECTURE.md`, and `RULES.md` are never dropped. Even a single-file script has a purpose, a stack, and conventions — those docs get short, not skipped.

**When you drop one, say so and say why.** "No `SCHEMA.md` — nothing is persisted beyond the config file, which I'll cover in `ARCHITECTURE.md`. Correct?" Silent omission looks like an oversight.

---

## Adding a Doc

Add only when the concern is (a) substantial enough that it would dominate a host doc, and (b) referenced independently. Both conditions — a section that's merely long still belongs in its host.

| Doc | Add when | Depends on |
|---|---|---|
| `PROTOCOL.md` | a public API or wire format others build against — its contract needs versioning independent of internals | PRODUCT, ARCHITECTURE, SCHEMA |
| `OPS.md` | non-trivial infrastructure: multiple environments, on-call, SLOs. Otherwise a `RULES.md` section suffices | ARCHITECTURE |
| `SECURITY.md` | a real threat model, compliance regime, or untrusted-input surface | ARCHITECTURE, SCHEMA |
| `ML.md` | models are part of the product: training data, evaluation, drift, retraining | PRODUCT, ARCHITECTURE, SCHEMA |
| `INTEGRATIONS.md` | several third-party systems each with its own auth, rate limits, and failure modes | ARCHITECTURE |
| `CONTENT.md` | editorial or i18n concerns are a product surface, not just strings | PRODUCT, DESIGN |

Prefer a section in an existing doc. The core five cover most projects, and each added doc is another file that can drift.

---

## Splicing Into the Chain

An added doc is only real once it's positioned. Three things must happen:

1. **Set its `Depends on:`** to the docs whose decisions it inherits, and write it **after** all of them. Never insert a doc that depends on one not yet written.
2. **Update the upstream doc's `## Next Steps`** to name it, so a future session resuming the set finds it. A doc nothing points to gets skipped on resume — this is the failure mode of added docs.
3. **Add it to the Context Docs Map** in the agent file during the wiring pass (`references/wiring.md` §3), with a "Covers" description specific to this project.

Confirm the full ordered set with the user before starting, including added docs, so the sequence is agreed once rather than renegotiated mid-run.

---

## Renaming

If the user prefers different filenames (`PRD.md`, `TECH.md`, `CONVENTIONS.md`), that's fine — the mechanisms carry, the names don't. Keep the set internally consistent: `Depends on:` links, `Next Steps` references, and the map table must all use the chosen names.

**One exception worth arguing for:** if the repo already has files under other names (`.docs/prd.md`), moving to a single `context/` folder with consistent naming is usually worth the churn, because the map table and the `@`-import both assume one predictable location. Make the case once; if the user prefers to keep the existing layout, adapt and move on.
