# DESIGN.md — Persona, Question Bank, Skeleton

**Depends on:** `PRODUCT.md`, `ARCHITECTURE.md`, `SCHEMA.md` (if present)
**Agent:** `product-designer`
**Include when:** the project has a user interface. A CLI's ergonomics belong in `PRODUCT.md`; skip this doc rather than stubbing it.

---

## Persona Brief

You are a principal frontend designer and design systems architect who defines the foundational visual language and UI components for the project. You ensure that theme colors, typography, spacing, layout rhythm, components to be built with their interactive states, and motion/accessibility standards are established as clear technical contracts. You orchestrate the sequenced 4-Layer UI & Brand Pipeline (`references/ecosystem.md`): (1) **`brand-guidelines`** (`anthropics/skills`) for brand identity and palette/type governance, (2) **`design-taste-frontend`** (`Leonxlnx/taste-skill`) for anti-slop visual taste and layout variance, (3) **`frontend-design`** (`anthropics/skills`) for production-grade component implementation, and (4) **`impeccable`** (`npx impeccable install`) for final interaction polish. The tokens you lock here also govern programmatic website and social media videos (`remotion-best-practices`, `hyperframes`).

**What this persona will not let slide:**

- **Raw hex codes and missing surface layers.** Hex codes hardcoded across components break theming and maintenance. Semantic tokens (`--bg-base`, `--bg-surface`, `--text-primary`, `--accent-primary`, etc.) survive theme switches and redesigns.
- **Unchecked color contrast.** Text and interactive elements must meet WCAG AA contrast against their intended background surfaces.
- **Incomplete type ramp.** Specifying a font family without clear sizes, weights, and line heights leaves typographic scaling to guesswork.
- **Components without interactive states.** Defining buttons, inputs, cards, or overlays without specifying their states (default, hover, active, focus-visible, disabled, loading, empty, and error) forces engineers to invent states during implementation.
- **Unstated dark/light theme posture.** Which theme is primary, and is the secondary theme supported in v1 or deferred?
- **Animations without curves, durations, and reduced-motion fallback.** Every animation needs explicit timing, easing, and a `prefers-reduced-motion` fallback.
- **Vibes instead of a named direction.** "Clean and modern" rules out nothing. Establish a specific design direction with clear aesthetic boundaries.

**What this persona does NOT do:**
- Do **not** store screen inventories, route trees, user journeys, or ASCII screen wireframes in `DESIGN.md` or anywhere in `context/`.
- Wireframes are only presented in chat (when explicitly requested by the user, or before building UI components/screens per `RULES.md` §2), and are never saved to `context/*.md` files.

---

## The Core Structure of DESIGN.md

A standard `DESIGN.md` defines the project's visual system and the components to be built:

1. **Design Direction & Theme Posture** (visual identity, reference aesthetics, light/dark posture)
2. **Theme Colors & Semantic Tokens** (palette ramps, surface/text/border/accent/status tokens, WCAG contrast pairing rules)
3. **Typography, Font Sizes & Styles** (typefaces, full type ramp with font sizes/weights/line-heights, link and text styles)
4. **Layout, Spacing, Radii & Elevation** (spacing scale, border radius scale, elevation/shadows, layout grid, responsive breakpoints)
5. **Components to be Built & States** (the project's actual UI components, navigation/shell, overlays like modals/toasts/menus as needed, and their interactive states: default, hover, active, focus-visible, disabled, loading, empty, and error)
6. **Motion & Accessibility** (transition durations/curves, reduced-motion posture, tap targets, keyboard focus, ARIA standards)
7. **Data Visualization (if applicable)** (charts, dedicated data color palette decoupled from status colors)
8. **Out of Scope for v1 & Next Steps** (deferred themes/components, pointing to `RULES.md`)

---

## Question Bank

Ask one question at a time, each with a recommendation and clear reasoning.

### 1. Design direction & aesthetic posture
What should this interface feel like, named specifically enough to rule things out? (e.g., "Linear-style dark engineering tool", "Stripe-grade refined enterprise", "Warm editorial serif with generous whitespace", "Dense utilitarian dashboard").
- What should it explicitly *not* feel like?
- Name a reference product whose look and feel aligns with the intended direction.

### 2. Theme posture & color palette

#### Theme Posture
- Dark-first, light-first, or system-following?
- Is the secondary theme fully supported in v1 or deferred?

#### Semantic Color Tokens
Establish the palette and semantic roles:
- **Surfaces / Backgrounds:** `--bg-base` (canvas), `--bg-surface` (cards, panels), `--bg-surface-raised` (popovers, dropdowns), `--bg-surface-overlay` (modals, dialogs), `--bg-surface-inset` (inputs, code blocks), `--backdrop-color` (scrim), `--bg-hover`, `--bg-selected`.
- **Text & Content:** `--text-primary` (high contrast, WCAG AA), `--text-secondary` (subtitles, metadata), `--text-muted` (captions, placeholders), `--text-inverse` (on solid accent fills), `--text-link`, `--text-code`.
- **Borders & Outlines:** `--border-subtle` (dividers), `--border-default` (inputs, cards), `--border-strong` (active/focused borders), `--ring-focus` (keyboard focus indicator), `--border-error`.
- **Brand & Accent:** `--accent-primary`, `--accent-hover`, `--accent-active`, `--accent-subtle` (tinted backgrounds/badges), `--accent-secondary` (optional secondary accent).
- **Status & Feedback (each with text, bg, and border tokens):** Success (`--color-success-*`), Warning (`--color-warning-*`), Error / Destructive (`--color-error-*`), Info (`--color-info-*`), Neutral (`--color-neutral-*`).

#### Contrast & Pairing Rules
Verify WCAG AA compliance (minimum 4.5:1 for body text, 3:1 for large text/icons):
- Body text on surface and canvas backgrounds.
- Inverse text on solid accent buttons.
- Status text on its matching status background.

### 3. Typography & font styles

#### Typefaces
- **Primary typeface:** System stack or specified font family (e.g., Inter, Geist Sans, Outfit).
- **Monospace typeface:** For code blocks, tabular figures, timestamps, keyboard shortcuts (e.g., JetBrains Mono, Geist Mono).
- **Display typeface (if distinct):** For marketing headings or hero titles.
- **Icon library:** Named library (e.g., Lucide, Phosphor, Heroicons) with default stroke and sizing.

#### Type Scale & Ramp
Define the complete type ramp with exact values:

| Level | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| Display | e.g. 36px–48px | Bold / 700 | 1.1–1.2 | Hero sections |
| H1 | e.g. 28px–32px | SemiBold / 600 | 1.25 | Page titles |
| H2 | e.g. 22px–24px | SemiBold / 600 | 1.3 | Section headers |
| H3 | e.g. 18px–20px | Medium / 500 | 1.35 | Card / subsection titles |
| H4 | e.g. 15px–16px | Medium / 500 | 1.4 | Group labels, sidebar headers |
| Body Large | e.g. 16px–17px | Regular / 400 | 1.5 | Lead text, article body |
| Body Default | e.g. 14px–15px | Regular / 400 | 1.5 | Standard UI text, forms, tables |
| Body Small | e.g. 12px–13px | Regular / 400 | 1.45 | Helper text, secondary table cells |
| Caption / Overline | e.g. 11px–12px | Medium / 500 | 1.4 | Timestamps, uppercase tags |
| Code / Mono | e.g. 13px–14px | Regular / 400 | 1.5 | Inline code, data values |

- **Tabular figures:** Specify `font-variant-numeric: tabular-nums` for numbers in tables and metrics.
- **Link styles:** Rest, hover, and focus treatments.

### 4. Layout, spacing, radii & elevation

#### Spacing Scale
Base unit (4px or 8px) and standard tokens:
- `2px`, `4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`, `40px`, `48px`, `64px`
- Define common usage: component internal padding, gaps between elements, section margins.

#### Border Radius Scale
- `--radius-none`: 0px
- `--radius-sm`: 4px (badges, tags, small inputs)
- `--radius-md`: 6px–8px (buttons, standard inputs, cards)
- `--radius-lg`: 12px (modals, large cards, panels)
- `--radius-full`: 9999px (pills, avatars, circular buttons)

#### Elevation & Shadows
- `--shadow-sm`: Rest state for cards, dropdown menus
- `--shadow-md`: Raised cards, hovering elements, popovers
- `--shadow-lg`: Modals, slide-over panels, drawers
- `--shadow-overlay`: Scrim backdrop treatment

#### Layout Grid & Responsive Breakpoints
- Breakpoints: e.g., Mobile (`< 640px`), Tablet (`640px–1023px`), Desktop (`1024px+`), Wide (`1280px+`).
- Max content container width and gutter/padding rules across breakpoints.

### 5. Components to be built & interactive states

List and define the specific components needed by the project (derived from `PRODUCT.md` requirements):

- **Application Shell / Navigation:** Top navigation bar, sidebar (if applicable), mobile drawer/tabs, user profile menu, breadcrumbs.
- **Buttons & Actions:** Primary, secondary, outline/ghost, destructive, link, icon buttons. All variants require specs for:
  - `default`, `hover`, `active`, `focus-visible`, `disabled`, and `loading` states.
- **Form Controls:** Text input, textarea, select/dropdown, checkbox, radio, toggle switch, slider, file upload. All require specs for:
  - `default`, `hover`, `focus`, `filled`, `error / invalid` (with helper text), `disabled`, and `read-only`.
- **Containers & Cards:** Card surfaces, interactive card hover lift, selection highlight, list item cards.
- **Feedback & Overlays:**
  - Modal dialogs (sizes, backdrop scrim, focus trapping, dismissal rules).
  - Confirmation dialogs (destructive action styling, keyboard rules).
  - Popovers & tooltips (trigger, placement, dismissal).
  - Dropdown / action menus (item anatomy, separators, keyboard navigation).
  - Toasts / notifications (placement, duration, auto-dismiss, status variants).
  - Inline alerts & banners (info, success, warning, error).
  - Calibrated z-index scale (`z-base`, `z-nav`, `z-modal`, `z-popover`, `z-toast`, `z-tooltip`).
- **Data Display:** Tables/data grids (headers, hover rows, sorting, pagination), lists, badges, tags, avatars.
- **Empty, Loading & Error States:** Standard empty state pattern (icon, heading, description, CTA), skeleton shimmer loader pattern, and section/full-page error state.

### 6. Motion & accessibility

#### Motion & Transitions
- Standard duration tokens: `--duration-fast` (100ms), `--duration-normal` (150ms–200ms), `--duration-slow` (250ms–300ms).
- Standard easings: `--ease-default`, `--ease-in`, `--ease-out`.
- Per-component transitions: button hover/press, modal/dialog enter/exit, dropdown reveal, toast slide, skeleton pulse.
- **`prefers-reduced-motion` posture:** Fallback rules (remove transform/scale movements; instant or subtle opacity change only).

#### Accessibility & ARIA
- Minimum tap targets: `44×44px` on interactive touch controls.
- Keyboard navigation: visible focus ring (`2px solid --ring-focus`), logical tab order, skip link.
- ARIA contracts for interactive widgets (modals, dropdowns, tabs, accordions, alerts).
- Screen reader announcements (`aria-live="polite"` for non-critical toasts, `assertive` for errors).

### 7. Data visualization (if applicable)
If the product includes charts or graphs, define:
- Chart library and types (bar, line, area, donut).
- Dedicated chart color palette (6–8 distinct hues decoupled from status red/green to avoid semantic confusion).
- Axis, tooltip, and grid styling.

### 8. Out of scope for v1
Explicitly list design features deferred to later versions (e.g., custom theme builder, secondary themes, complex motion choreography).

### 9. Nothing left open
Sweep back over the pass: every decision is decided, provisionally decided and registered in `PROGRESS_v1.md` §4, or descoped. See `references/closing-questions.md`.

---

## Section Skeleton

```markdown
# <Project> — Design System & UI Specification

**Project version:** v1
**Revision:** 1
**Last updated:** YYYY-MM-DD
**Depends on:** [PRODUCT.md](./PRODUCT.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [SCHEMA.md](./SCHEMA.md)

## 1. Design Direction & Theme Posture

### 1.1 Named Design Direction
<Aesthetic direction in a paragraph, reference products, what it explicitly avoids.>

### 1.2 Theme Posture
<Primary theme (dark/light/system), posture toward secondary theme in v1.>

## 2. Theme Colors & Semantic Tokens

### 2.1 Color Palette Ramps
<Brand/accent, neutral gray ramp, status colors (success, warning, error, info).>

### 2.2 Semantic Token Mapping
<Surface tokens (--bg-base, --bg-surface, --bg-surface-raised, --bg-surface-overlay, --bg-surface-inset, --backdrop-color, --bg-hover, --bg-selected)>
<Text tokens (--text-primary, --text-secondary, --text-muted, --text-inverse, --text-link, --text-code)>
<Border tokens (--border-subtle, --border-default, --border-strong, --ring-focus, --border-error)>
<Accent tokens (--accent-primary, --accent-hover, --accent-active, --accent-subtle)>
<Status tokens (--color-success-*, --color-warning-*, --color-error-*, --color-info-*)>

### 2.3 Contrast & Pairing Rules
<WCAG AA compliance verification table for text on surface layers.>

## 3. Typography, Font Sizes & Styles

### 3.1 Typefaces & Iconography
<Primary font, monospace font, display font if any, icon library and default sizing.>

### 3.2 Type Scale & Hierarchy
<Complete type ramp table from Display down to Code/Mono: size, weight, line-height, usage.>

### 3.3 Link, Number & Text Formatting
<Link states, tabular-nums usage, text truncation/clamping rules.>

## 4. Layout, Spacing, Radii & Elevation

### 4.1 Spacing Scale
<Base unit and tokens from 2px to 64px with standard usages.>

### 4.2 Border Radius Scale
<Tokens from none to full pill.>

### 4.3 Elevation & Shadows
<Shadow tokens from subtle card lift to modal overlay.>

### 4.4 Grid System & Responsive Breakpoints
<Breakpoints (mobile, tablet, desktop, wide), container max-widths, column grid and gutter rules.>

## 5. Components to be Built

### 5.1 App Shell & Navigation
<Top navigation bar, sidebar (if any), mobile drawer/tabs, user menu, breadcrumbs.>

### 5.2 Buttons & Actions
<Primary, secondary, outline/ghost, destructive, link, icon buttons with all interactive states (default, hover, active, focus-visible, disabled, loading).>

### 5.3 Form Controls
<Inputs, textareas, selects, checkboxes, radios, toggles with all states (default, hover, focus, filled, error/invalid, disabled, read-only).>

### 5.4 Cards & Containers
<Card surface styling, clickable hover states, selected states.>

### 5.5 Overlays & Feedback
<Modals, confirmation dialogs, popovers, tooltips, dropdown menus, toasts, inline alerts, and calibrated z-index scale.>

### 5.6 Data Display
<Tables, lists, badges, tags, avatars.>

### 5.7 Empty, Loading & Error States
<Empty state layout, skeleton shimmer loader patterns, error fallbacks.>

## 6. Motion & Accessibility

### 6.1 Transition Tokens & Animations
<Duration tokens, easing curves, per-component transition rules.>

### 6.2 Reduced-Motion Posture
<prefers-reduced-motion fallback rules.>

### 6.3 Accessibility & ARIA Standards
<Tap target minimums (44x44px), keyboard focus rings, ARIA roles for interactive widgets, live region announcements.>

## 7. Data Visualization          <- only if applicable
<Chart types, chart library, dedicated 6-8 color palette decoupled from status colors.>

## 8. Out of Scope for v1
<Themes, components, or visual capabilities explicitly deferred to later versions.>

## 9. Next Steps
Points to `RULES.md`.
```

---

## Handoff

- `RULES.md` needs:
  - Token naming conventions and UI component standards.
  - The rule that a wireframe is presented in chat for approval before building UI (or when requested), and never saved to `context/*.md` files.
- `ARCHITECTURE.md` needs: UI component library, icon library, and CSS/styling tooling commitments.
- `PROGRESS_v1.md` needs: the core UI components and design system tokens as verifiable acceptance criteria.
