# Startup & Company Team Skill Ecosystem

<!-- context-docs-kit:shared — canonical copy lives in shared/references/. Edit there, then `npm run sync`. -->

`context-docs-kit` pairs its core foundation-doc discipline (`bootstrapping-context-docs`, `aligning-context-docs`, `versioning-context-docs`) with an always-updated ecosystem of 18 external skills and CLI tools across 6 company pillars. Together they turn `context/` from a solo developer's folder into an operating system for a full startup or company team across **Product & Growth (Unified)**, **Engineering & QA**, **Design & Brand**, **Internal Comms**, and **Social Media / Website Video Production**.

---

## 1. The Six Ecosystem Pillars

### A. Documentation & Internal Comms
| Skill / Tool | Upstream Command | Role in `context-docs-kit` |
|---|---|---|
| **`doc-coauthoring`** | `npx skills add anthropics/skills@doc-coauthoring` | Structured collaborative co-authoring when drafting or refining `PRODUCT.md`, `ARCHITECTURE.md`, RFCs, ADRs, and technical specs with stakeholders. |
| **`internal-comms`** | `npx skills add anthropics/skills@internal-comms` | Converts `CHANGELOG_v<N>.md` entries, `PROGRESS_v<N>.md` milestone ticks, and drift reports into 3P updates (Progress, Plans, Problems), company newsletters, executive status updates, and incident reports. |

### B. Dev Workflow, Testing & Interrogation
| Skill / Tool | Upstream Command | Role in `context-docs-kit` |
|---|---|---|
| **`using-superpowers`** | `npx skills add obra/superpowers@using-superpowers` | Enforces disciplined engineering execution: micro-step implementation plans, strict TDD (red-green-refactor), and root-cause debugging against `PROGRESS_v<N>.md` checklist slices. |
| **`webapp-testing`** | `npx skills add anthropics/skills@webapp-testing` | Drives live Playwright browser verification of web UI surfaces. Required by `RULES.md` §2 Rule 10 and `aligning-context-docs` Step 6 to supply concrete browser evidence before ticking web acceptance criteria. |
| **`skill-creator`** | `npx skills add anthropics/skills@skill-creator` | Encapsulates recurring project workflows, migration runbooks, or domain conventions discovered in `RULES.md` into project-scoped skills under `.agents/skills/`. |
| **`ponytail`** | `npx skills add DietrichGebert/ponytail` | Orchestrates developer workflow and context continuity across multi-step implementation sessions. |
| **`grill-me`** | `npx skills add https://github.com/mattpocock/skills --skill grill-me` | Powers Stage 2 (The Grill) across every doc pass: walks each branch of the decision tree one question at a time until shared understanding is locked. |

### C. UI Principles, Brand & Frontend Craft (Sequenced 4-Layer Pipeline)
| Layer & Skill | Upstream Command | Role in `context-docs-kit` |
|---|---|---|
| **1. `brand-guidelines`** | `npx skills add anthropics/skills@brand-guidelines` | Governs brand identity, palette consistency, typographic voice, and visual rules across `PRODUCT.md`, `DESIGN.md`, and video/social media assets. |
| **2. `design-taste-frontend`** | `npx skills add Leonxlnx/taste-skill@design-taste-frontend` | Anti-slop frontend design taste calibration; blocks generic AI layouts and enforces intentional visual hierarchy, motion, and pre-flight audits for `DESIGN.md` and UI implementation. |
| **3. `frontend-design`** | `npx skills add anthropics/skills@frontend-design` | Production-grade frontend interface construction adhering to `DESIGN.md` semantic tokens, type ramps, and all 8 interactive states after the chat wireframe gate. |
| **4. `impeccable`** | `npx impeccable install` | Final UI/UX craft verification, micro-interaction polish, and component audit passes before shipping frontend slices. |

### D. Marketing, SEO & Brand Discovery (Unified with Product in `PRODUCT.md`)
Because brand identity, positioning, SEO, and growth live directly on the product, **Product & Growth use the exact same skill stack** and record their decisions in `PRODUCT.md` (with visual tokens in `DESIGN.md`):

| Skill / Tool | Upstream Command | Role in `context-docs-kit` |
|---|---|---|
| **`brand-discovery`** | `npx skills add https://github.com/affaan-m/ECC --skill brand-discovery` | Extracts brand positioning, audience psychology, anti-personas, competitive differentiation, and brand voice during `PRODUCT.md` (§1–§3) and `DESIGN.md` (§1) interrogation. |
| **`marketingskills`** | `npx skills add coreyhaines31/marketingskills` | Powers `PRODUCT.md` (§5 monetization/packaging/CRO, §6 SEO, landing page & GTM touchpoints): conversion rate optimization, copywriting, technical & programmatic SEO, pricing strategy, and launch playbooks. |

### E. Token Saving & Context Efficiency
| Skill / Tool | Upstream Command | Role in `context-docs-kit` |
|---|---|---|
| **`@caveman-ai/cli`** | `npx @caveman-ai/cli@latest` | Cuts LLM output and context token burn via high-signal, zero-fluff communication, working alongside present-tense docs and `npx context-docs-kit compact-changelog --days 30` to keep long-running team repos fast and economical. |

### F. Video Generation, Social/Website Media & Brag Docs
| Skill / Tool | Upstream Command | Role in `context-docs-kit` |
|---|---|---|
| **`brag`** | `npx skills add https://github.com/NousResearch/hermes-agent --skill brag` | Synthesizes completed `PROGRESS_v<N>.md` acceptance criteria and `CHANGELOG_v<N>.md` logs into engineering brag documents, sprint review summaries, and social proof for launches. |
| **`writing-beats`** | `npx skills add https://github.com/mattpocock/skills --skill writing-beats` | Powers the **Beat-Sheet Gate**: scripts social media reels, website hero demos, and technical explainers into tight narrative beats before rendering. |
| **`remotion-best-practices`** | `npx skills add https://github.com/remotion-dev/skills --skill remotion-best-practices` | Builds programmatic React/Remotion launch videos, animated UI walkthroughs, and social media reels (`16:9` and `9:16`) directly from `DESIGN.md` tokens and `PRODUCT.md` specs. |
| **`hyperframes`** | `npx skills add heygen-com/hyperframes` | Produces AI-driven video presentations, HeyGen avatar explainers, and hyperframe storyboards for social media and website onboarding flows. |

---

## 2. How to Generate Video & Media for Social Media or Websites

Whenever a user asks to generate a video, reel, teaser, or animated walkthrough for **social media** (X/Twitter, LinkedIn, Reels, TikTok, Shorts, Product Hunt) or **websites** (Hero animation, feature demo, onboarding explainer), execute this **4-Step Media Pipeline**:

1. **Step 1 — Harvest `context/` Truth Automatically (Never Re-Ask Known Facts):**
   - Read `context/PRODUCT.md` for Brand Voice (`brand-discovery`), Named Incumbent Pain (§3.1), Structural Differentiation (§3.2), Core Value Loop (§3.3), and CRO/GTM hooks (`marketingskills`).
   - Read `context/DESIGN.md` for exact Brand Palette tokens (`--bg-base`, `--accent-primary`), Typography (`Display`, `Body`, `Mono`), Radii, and Motion curves (`brand-guidelines` + `design-taste-frontend`).
   - Read `context/PROGRESS/PROGRESS_v<N>.md` and `CHANGELOG_v<N>.md` via **`brag`** if the media highlights a shipped feature, sprint milestone, or version release.
2. **Step 2 — Present the Beat-Sheet Gate in Chat (`writing-beats`):**
   - Before writing video code or triggering renders, use **`writing-beats`** to present a concise 30–60s Beat Sheet in chat (*Beat 1: Hook / Incumbent Pain -> Beat 2: Structural Mechanism -> Beat 3: Live UI Proof -> Beat 4: Primary CTA*, with visual + audio per beat) and get user approval. Never save beat sheets inside `context/*.md`.
3. **Step 3 — Render by Target Channel:**
   - **Website Hero / Interactive Product Walkthrough:** Chain `writing-beats` -> `remotion-best-practices` + `design-taste-frontend` + `frontend-design` to build a React/Remotion composition (or `@remotion/player` embed) importing the repo's real `DESIGN.md` tokens and UI components.
   - **Social Media Launch / "What We Shipped" Reel (`16:9` for X/LinkedIn, `9:16` for Reels/Shorts/TikTok):** Chain `brag` -> `writing-beats` -> `remotion-best-practices` + `brand-guidelines` for kinetic typography + animated UI motion clips.
   - **AI Presenter / Storyboard Explainer:** Chain `writing-beats` -> `hyperframes` + `brand-guidelines`.
4. **Step 4 — Draft Companion Social / Web Copy (`marketingskills` + `internal-comms`):**
   - Pair the video output with the launch X thread, LinkedIn post, landing page headline, or internal 3P release note aligned to the exact same beats.

---

## 3. Installing & Keeping Everything Always Updated

External skills are **never frozen as static copies** inside `context-docs-kit`. Instead, `context-docs-kit` installs and updates them live from their upstream GitHub repositories and `@latest` npm packages.

```bash
# Install context-docs-kit + all 18 ecosystem integrations across all assistants
npx context-docs-kit install --target all --ecosystem

# Install into the project repository (.agents/skills, .claude/skills) for the whole team
npx context-docs-kit install --target all --ecosystem --project

# Or install by unified team pod (--bundle)
npx context-docs-kit install --bundle full-team      # All 6 categories (18 integrations)
npx context-docs-kit install --bundle product        # Unified Product, Brand & Growth pod (same as --bundle growth)
npx context-docs-kit install --bundle engineering    # Dev workflow, QA, docs, brag, caveman
npx context-docs-kit install --bundle design         # 4-layer UI craft, brand, Remotion, QA
npx context-docs-kit install --bundle video          # Social media & website video production suite

# Keep context-docs-kit + all 16 upstream skill repos + @latest CLIs always updated
npx context-docs-kit update
```

