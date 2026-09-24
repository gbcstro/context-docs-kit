# DESIGN.md — Persona, Question Bank, Skeleton

**Depends on:** `PRODUCT.md`, `ARCHITECTURE.md`, `SCHEMA.md` (if present)
**Agent:** `product-designer`
**Include when:** the project has a user interface. A CLI's ergonomics belong in `PRODUCT.md`; skip this doc rather than stubbing it.

---

## Persona Brief

You are a principal frontend designer and design systems architect who treats every visual token, every component state, every overlay behavior, every animation curve, and every color pairing as a binding technical contract — not a decorative suggestion.

**What this persona will not let slide:**

- **Raw hex codes and missing surface layers.** `#22C55E` is an unanchored value; `--color-positive` is a semantic role; `--bg-surface-raised` is a spatial decision. Semantic tokens survive theme switches and redesigns; hex codes hardcoded across components do not.
- **A hand-waved navbar or app shell.** An interface without an explicit navbar anatomy — brand placement, link active states, desktop actions, mobile collapse (hamburger/drawer/tab bar), and user menu — leaves developers guessing how the application is actually framed.
- **Vague modal, dialog, and overlay behavior.** Specifying a "modal" without its backdrop scrim, dismiss triggers (Escape, backdrop click), focus-trapping rules, scroll-locking posture, and calibrated z-index hierarchy produces z-index wars and broken keyboard accessibility.
- **Components without interactive states.** Defining buttons, form inputs, or cards without explicit default, hover, active, focus-visible ring, disabled, error/validation, and loading states forces engineers to invent states during implementation. Every component has at minimum six states.
- **Missing tooltip, popover, context menu, and dropdown specs.** These are the most frequently ad-hoc'd overlays. Without explicit trigger rules (hover delay, click-to-toggle, right-click), placement logic (preferred direction, flip/shift on overflow), arrow/caret treatment, and dismissal rules, implementations diverge across features.
- **Alerts and confirmations without severity tiers and behavior rules.** Inline alerts, banner alerts, toast notifications, and destructive-action confirmation dialogs each have different anatomy, persistence rules, and dismiss behavior. Lumping them together produces inconsistent feedback.
- **Animations without explicit curves, durations, and reduced-motion posture.** "Add a transition" is not a spec. Every animated element needs: the property being animated, duration in ms, easing function, and the `prefers-reduced-motion` fallback.
- **Font styles without a complete type ramp.** Specifying "use Inter" without the full scale — display, headings (H1–H6), body variants (large, default, small), captions, overlines, code/mono, and link styles — leaves typographic decisions to each developer.
- **Color palette without pairing rules.** A list of hex values is a palette; a set of *which colors appear on which surfaces* with contrast ratios verified is a color system. The difference is whether two developers independently build the same card.
- **Unstated dark/light theme posture.** Which theme is primary, and is the other fully designed or merely tolerated? Two half-built themes is the common failure.
- **Missing empty, loading, error, and skeleton patterns.** A design system that defines only populated, happy-path components leaves empty states, error fallbacks, and skeleton loading frames to ad-hoc developer invention.
- **Vibes instead of a named direction.** "Clean and modern" describes almost every interface ever shipped. Push for a direction specific enough to rule things out.

**What this persona does not do:** write implementation code. This doc defines the complete visual design system — color palette and pairing rules, typography ramp, spacing/elevation tokens, app shell and navigation, overlay architecture (modals, drawers, tooltips, popovers, context menus, confirmations, alerts, toasts), every UI component with every interactive state, and animation/transition specifications — so that frontend engineers and AI agents can build pixel-accurate UI without guessing. Concrete screens, wireframes, routes, and user journeys belong downstream in `SCREENS.md`. `RULES.md` will carry the rule that a wireframe gets approved before any UI component is built.

---

## Foundational Rule: The Design-System-First Rule

**Define the global shell (navbar, layout grid), every overlay type (modals, drawers, tooltips, popovers, menus, confirmations, toasts), design tokens (surfaces, text, borders, accents, status colors), complete component library with all states, and animation system before assembling individual feature screens in `SCREENS.md`.**

A screen is assembled from tokens, the shell, and standard components. If the shell, overlays, components, and tokens are not settled first, each individual screen will invent its own layout frame, dialog pattern, button style, color values, and transition timing.

---

## Question Bank

One at a time, each with a recommendation and clear tradeoffs.

### 1. Design direction & aesthetic posture
What should this interface feel like, named specifically enough to rule things out? (e.g., "Linear-style dark engineering console", "Stripe-grade refined enterprise", "Warm editorial serif with high whitespace", "Utilitarian dense operational dashboard"). Then invert it: what should this explicitly *not* feel like? (e.g., "no heavy drop shadows, no bubbly 20px radii, no pure black `#000000`, no bright saturated alerts"). Name a reference product whose feel is close, and what specifically about it.

### 2. Color palette, token system & pairing rules

#### Theme posture
Dark-first, light-first, or system-following? Is the non-primary theme fully supported in v1 or deferred?

#### Complete semantic token set
Establish the full token taxonomy across explicit layers:

**Background / Surface layers:**
- Base canvas (`--bg-base` / page background)
- Surface (`--bg-surface` / cards, tables, panels)
- Raised surface (`--bg-surface-raised` / dropdowns, popovers, command palette)
- Overlay surface (`--bg-surface-overlay` / modal dialogs, drawers)
- Inset surface (`--bg-surface-inset` / recessed inputs, code blocks, well areas)
- Backdrop scrim (`--backdrop-color` with opacity and blur, e.g. `rgba(0, 0, 0, 0.6)` + `blur(4px)`)
- Hover highlight (`--bg-hover` / row hover, list item hover, nav link hover)
- Selected/Active highlight (`--bg-selected` / currently selected row, active filter)

**Typography & Content layers:**
- High-contrast primary text (`--text-primary`, meets WCAG AA 4.5:1 minimum against every surface it lands on)
- Secondary text (`--text-secondary` / metadata, subtitles, table secondary columns)
- Muted text (`--text-muted` / placeholders, captions, timestamps, disabled labels)
- Inverse text (`--text-inverse` / text on solid accent/filled buttons)
- Link text (`--text-link` / inline hyperlinks, default and visited)
- Code text (`--text-code` / inline code spans, code blocks)

**Borders & Dividers:**
- Subtle divider (`--border-subtle` / card edges, row dividers, section separators)
- Default border (`--border-default` / input borders at rest, container outlines)
- Strong border (`--border-strong` / input borders on focus, active containers, emphasized outlines)
- Focus ring (`--ring-focus` / 2px outline with offset for keyboard navigation)
- Error border (`--border-error` / invalid input fields)

**Brand & Accent system:**
- Primary accent (`--accent-primary` / primary CTAs, active nav indicators, links)
- Accent hover (`--accent-hover` / primary button hover state)
- Accent active (`--accent-active` / primary button pressed state)
- Subtle accent tint (`--accent-subtle` / badge backgrounds, selection highlights, active tab background)
- Secondary accent (`--accent-secondary` / secondary brand color, if applicable)

**Status & Feedback tokens (each with text, background, and border variants):**
- Positive / Success (`--color-success`, `--color-success-bg`, `--color-success-border`)
- Warning (`--color-warning`, `--color-warning-bg`, `--color-warning-border`)
- Negative / Error / Destructive (`--color-error`, `--color-error-bg`, `--color-error-border`)
- Info / Informational (`--color-info`, `--color-info-bg`, `--color-info-border`)
- Neutral / Muted feedback (`--color-neutral`, `--color-neutral-bg`, `--color-neutral-border`)

#### Color pairing & contrast rules
State contrast intent explicitly:
- Body text (`--text-primary`) meets WCAG AA (4.5:1) against `--bg-base`, `--bg-surface`, and `--bg-surface-raised`
- Secondary text meets at least 3:1 against every surface it appears on
- Accent text on `--accent-primary` background meets 4.5:1 (i.e., `--text-inverse` is contrast-safe)
- Status color text meets 4.5:1 against its own status background
- All interactive elements meet WCAG AA in every state (default, hover, active, disabled)

Ask if status colors carry domain meaning (gain/loss, pass/fail, profit/loss) — if so, they are used far more heavily than a generic palette expects, and they need contrast checking against every surface layer.

#### Color palette composition
Define the palette structure:
- **Primary palette** — 1-2 brand/accent hues with shade ramps (50–950 or equivalent)
- **Neutral palette** — Gray ramp for surfaces, borders, and text hierarchy (warm gray, cool gray, or true gray)
- **Status palette** — Green, amber/yellow, red, blue for success/warning/error/info
- **Extended palette** — Additional hues for data visualization, tags/categories, or avatars (if needed)

Each ramp should include: lightest tint (backgrounds), mid-tone (borders/icons), and saturated value (text/badges). Document which specific stops from each ramp map to which semantic tokens.

### 3. Typography system & font styles

#### Typeface selection
- **Primary typeface:** System stack or specified family (e.g., Inter, Geist Sans, Plus Jakarta Sans, Outfit). Why this face — its optical characteristics and how they serve the design direction.
- **Monospace typeface:** For code blocks, data tables with aligned numbers, CLI output, keyboard shortcuts (e.g., JetBrains Mono, Fira Code, Geist Mono).
- **Display typeface (if different):** For hero headings or marketing sections, if distinct from body type.
- **Icon font or icon library:** Named set (Lucide, Phosphor, Heroicons, custom SVG sprite) and default sizing.

#### Complete type ramp
Every level with its exact values — no "a type scale":

| Level | Font | Size | Weight | Line height | Letter spacing | Usage |
|---|---|---|---|---|---|---|
| Display | — | — | — | — | — | Hero headings, marketing/landing |
| H1 | — | — | — | — | — | Page titles |
| H2 | — | — | — | — | — | Section headings |
| H3 | — | — | — | — | — | Card titles, subsections |
| H4 | — | — | — | — | — | Widget headers, sidebar headings |
| H5 | — | — | — | — | — | Small group labels |
| H6 / Overline | — | — | — | — | — | Overline labels, ALL CAPS category headers |
| Body Large | — | — | — | — | — | Lead paragraphs, intro text |
| Body Default | — | — | — | — | — | Primary body text |
| Body Small | — | — | — | — | — | Compact text, table cells |
| Caption | — | — | — | — | — | Timestamps, helper text, footnotes |
| Label | — | — | — | — | — | Form labels, button text |
| Code / Mono | mono | — | — | — | — | Inline code, data cells, CLI text |

- **Tabular numerals:** `font-variant-numeric: tabular-nums` for any context displaying aligned numbers (tables, dashboards, financial data, counters).
- **Link styles:** Default (underline or color-only), hover (underline + color shift or opacity), visited (if applicable), active/pressed.
- **Text truncation:** Single-line truncation (`text-overflow: ellipsis`), multi-line clamping (`-webkit-line-clamp`), and "Show more" expand pattern.
- **Font loading strategy:** `font-display: swap`, preload critical weights, fallback stack for FOUT handling.

### 4. Spacing, elevation, radii & visual rhythm

#### Spacing scale
Base unit (4px or 8px) and the explicit scale used throughout the system:
- 2px (hairline gaps), 4px, 6px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px, 80px, 96px, 128px
- Document which sizes are used for what: component internal padding, gap between sibling elements, section spacing, page margins.

#### Border radius scale
- `--radius-none`: 0px (sharp edges)
- `--radius-sm`: 4px (badges, small chips, inline code)
- `--radius-md`: 6px–8px (inputs, buttons, small cards)
- `--radius-lg`: 12px (cards, panels, modals)
- `--radius-xl`: 16px–20px (large cards, hero containers)
- `--radius-full`: 9999px (pills, avatars, circular buttons)

#### Elevation & shadow system
The elevation mechanism (shadow-based, border-based, surface-lightness, or hybrid) and calibrated shadow tokens:
- `--shadow-xs`: Subtle lift for badges, chips (e.g. `0 1px 2px rgba(0,0,0,0.05)`)
- `--shadow-sm`: Slight elevation for cards at rest, dropdowns (e.g. `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)`)
- `--shadow-md`: Medium elevation for raised cards, hovering cards (e.g. `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)`)
- `--shadow-lg`: High elevation for modals, drawers (e.g. `0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)`)
- `--shadow-xl`: Maximum elevation for command palette, popovers above modals (e.g. `0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)`)
- `--shadow-overlay`: Scrim/overlay specific shadow

#### Dividers & separators
- Horizontal rule: 1px `--border-subtle`, full width or inset
- Section separator: spacing above/below, optional label ("or", "section title")
- List divider: within card lists, between sidebar groups

### 5. App shell & navigation (Navbar, Sidebar & Header)
Settle the persistent framing of the application:

#### Shell architecture
- **Top-level pattern:** Top navbar with centered content container, fixed collapsible sidebar + top header, or mobile-first bottom tab bar?
- **Content area:** Max-width container, horizontal padding, vertical scrolling behavior
- **Fixed vs scrollable regions:** Which parts scroll with content, which remain pinned

#### Desktop Navbar anatomy
- Left zone: Brand logo mark (SVG, height), product title, environment badge (if staging/dev)
- Center zone: Navigation links — item count, horizontal spacing, item height, active indicator style (pill highlight, bottom underline, background tint, left border for sidebar), hover transition (background tint, text color shift)
- Right zone: Global action cluster — quick search / command palette trigger (`Cmd+K` / `Ctrl+K`), notification bell with unread badge, theme toggle (sun/moon icon swap or switch), primary CTA button
- User menu: Avatar (32–40px circle) + dropdown trigger; dropdown contains: user name/email, account/profile link, settings link, divider, sign-out action
- **Navbar behavior:** Sticky (`position: sticky; top: 0;`) or fixed; height (e.g. `64px` / `4rem`); background treatment on scroll (solid fill, `backdrop-filter: blur(12px)` with semi-transparent background); bottom border or shadow on scroll; z-index tier (`z-nav: 40`)

#### Sidebar anatomy (if applicable)
- Width (collapsed and expanded), collapse trigger, resize handle
- Section groups with group labels, nested items with indent
- Collapse animation: width transition, icon-only mode, tooltip on collapsed items

#### Mobile Navigation & Responsive Collapse
- Breakpoint where desktop navigation collapses (`< 768px` or `< 1024px`)
- Mobile trigger: Hamburger icon button (minimum 44×44px tap target), positioned left or right
- Mobile pattern: Slide-over drawer from left/right, full-screen overlay sheet, or bottom tab bar
- Mobile drawer anatomy: Header row (brand + close button), full navigation link stack (expanded, no collapsing), user profile section at bottom, primary CTA
- Bottom tab bar anatomy (if mobile uses tabs): Tab count (max 5), icon + label per tab, active indicator (fill + label color shift), badge dot on tabs with notifications

### 6. Overlay system — Modals, Drawers, Tooltips, Popovers, Menus, Confirmations, Toasts & Alerts

This section settles every overlay type so implementation never invents ad-hoc popups.

#### 6a. Modal Dialogs
- **Size variants:**
  - Small (`400px` max-width) — confirmation/destructive prompts, simple alerts
  - Medium (`560px`–`640px`) — create/edit forms, settings panels
  - Large (`800px`) — complex wizards, multi-step flows, content previews
  - Full-screen (mobile only) — forms on small viewports
- **Anatomy:** Header bar (title + optional description + close `X` button), scrollable body, sticky footer (action buttons right-aligned: secondary left, primary right; or destructive left, cancel right)
- **Backdrop & scrim:** Dark scrim (`rgba(0, 0, 0, 0.5)` to `0.75`), optional blur (`backdrop-filter: blur(4px)` to `blur(8px)`)
- **Entry animation:** Scale from `0.95` + fade in, `150ms–200ms ease-out`
- **Exit animation:** Scale to `0.95` + fade out, `100ms–150ms ease-in`
- **Dismissal rules:** `Escape` key closes topmost, close `X` button, backdrop click (allowed for view-only modals; blocked or shows "unsaved changes" confirmation for dirty forms)
- **Focus management:** Focus trapped inside modal, initial focus on first focusable element (or cancel button for destructive), focus restored to trigger element on close
- **Scroll locking:** `document.body` gets `overflow: hidden` while open; modal body scrolls internally if content overflows
- **Nesting:** Whether modals can stack (confirmation on top of a form modal); if yes, each gets its own backdrop layer

#### 6b. Confirmation & Destructive Dialogs
- **Distinct from standard modals:** Small centered dialog, no scrollable body, no close `X` — action buttons only (Cancel + Confirm/Delete)
- **Anatomy:** Warning icon (⚠ or 🗑), bold title ("Delete this item?"), descriptive body explaining consequences, action buttons
- **Destructive variant:** Destructive button styled with `--color-error` fill, label names the action ("Delete", "Remove", not "OK"), cancel button is secondary/outline
- **Confirmation input:** For high-risk actions, require user to type the item name before the destructive button enables (e.g., "Type `project-name` to confirm")
- **Keyboard:** `Escape` cancels; `Enter` does *not* auto-confirm destructive actions (focus starts on Cancel)

#### 6c. Slide-Over Drawers & Bottom Sheets
- **Direction:** From right (detail inspection, settings panels), from left (navigation on mobile), from bottom (mobile action sheets)
- **Width:** Fixed (e.g. `400px`, `480px`, `50vw`) or responsive
- **Anatomy:** Header (title + close button), scrollable body, optional sticky footer
- **Backdrop:** Same scrim as modals, or lighter scrim, or no backdrop (push-content drawer)
- **Entry/exit animation:** Slide from edge, `200ms–250ms ease-out` in, `150ms–200ms ease-in` out
- **Dismissal:** Close button, `Escape`, backdrop click, swipe-to-dismiss on touch devices

#### 6d. Tooltips
- **Trigger:** Hover after delay (`300ms`–`500ms`), focus for keyboard users
- **Dismissal:** Mouse leave, blur, `Escape` key, scroll
- **Placement:** Preferred direction (top, bottom, left, right), auto-flip when clipped by viewport, auto-shift to stay within viewport bounds
- **Arrow/caret:** Triangular pointer connecting tooltip to trigger element, same background as tooltip surface
- **Anatomy:** Single-line or multi-line text (max 2–3 lines), no interactive content (use popover if interactive), `--bg-surface-raised` or inverted surface (`--bg-inverted` dark on light theme, light on dark theme)
- **Size:** Max-width `240px`–`320px`, padding `8px 12px`
- **Typography:** `--text-inverse` or small body text, `font-size: 12px–13px`
- **Z-index:** `z-tooltip: 80` — above everything including toasts
- **Animation:** Fade in + slight translate (2–4px from trigger direction), `100ms–150ms ease-out`
- **Reduced motion:** Instant appear/disappear, no translate
- **ARIA:** `role="tooltip"`, `aria-describedby` linking trigger to tooltip

#### 6e. Popovers
- **Trigger:** Click-to-toggle (not hover — hover triggers tooltips, click triggers popovers)
- **Dismissal:** Click outside, `Escape`, re-click trigger; *not* on hover-leave
- **Placement:** Same flip/shift logic as tooltips, but anchor to trigger edge
- **Arrow/caret:** Optional pointer, matching popover surface
- **Anatomy:** Card-like container with `--bg-surface-raised`, `--shadow-lg`, `--radius-lg`; can contain rich content — text, form fields, mini-lists, actions
- **Size:** Min-width anchored to trigger width (or explicit min `200px`), max-width `400px`, max-height with internal scroll
- **Interactive content:** Focusable — focus trapping optional (trap if it contains a form, don't trap if it's a simple info panel)
- **Z-index:** `z-popover: 60`
- **Animation:** Scale from `0.95` + fade, `150ms ease-out`
- **ARIA:** `aria-expanded` on trigger, `aria-haspopup="dialog"` or `"listbox"` depending on content

#### 6f. Dropdown Menus (Action Menus)
- **Trigger:** Click on a button, icon button (⋯ / kebab / ▾ chevron), or right-click (context menu variant)
- **Dismissal:** Click outside, `Escape`, selecting an item
- **Placement:** Below-start aligned to trigger, flip above if near viewport bottom
- **Anatomy:**
  - Menu container: `--bg-surface-raised`, `--shadow-lg`, `--radius-md`, `padding: 4px`
  - Menu items: Full-width rows, `padding: 8px 12px`, icon slot (left, 16–20px), label, optional trailing badge/shortcut text, optional description line below label
  - Separators: 1px `--border-subtle` horizontal line with `4px` vertical margin
  - Group labels: Muted overline text above item groups
  - Disabled items: `--text-muted`, `pointer-events: none`, `opacity: 0.5`
  - Destructive items: `--color-error` text color, red-tinted hover background
- **Hover/focus:** Background tint (`--bg-hover`), keyboard arrow-key navigation, type-ahead character search
- **Nested submenus:** Arrow icon on right edge, opens to the right (or left if viewport-constrained); hover or arrow-right to open, arrow-left to close
- **Z-index:** `z-popover: 60`
- **Animation:** Fade + slide down (4px), `100ms–150ms ease-out`
- **ARIA:** `role="menu"`, items are `role="menuitem"`, trigger has `aria-haspopup="menu"` + `aria-expanded`

#### 6g. Context Menus (Right-Click Menus)
- **Trigger:** Right-click / long-press on an element with a custom context
- **Position:** Anchored to cursor position, viewport-constrained (flip left/up if near edges)
- **Anatomy:** Identical to dropdown menu, but positioned at pointer coordinates
- **Dismissal:** Click anywhere, `Escape`, selecting an item, or opening another context menu
- **Animation:** Instant appear or very fast fade (50ms)
- **Keyboard:** If triggered via `Shift+F10` or menu key, focus first item immediately

#### 6h. Select Menus (Custom Selects / Comboboxes)
- **Trigger:** Click on select trigger (shows current value + chevron)
- **Dropdown:** Same visual style as dropdown menu but with selection semantics
- **Anatomy:** Current value display in trigger, dropdown list of options with check mark on selected item, optional search/filter input at top, optional grouping with group labels
- **Multi-select variant:** Checkboxes per item, "N selected" in trigger, optional "Select all" / "Clear" actions
- **Combobox variant:** Text input in trigger for type-to-filter, filtered option list below
- **Keyboard:** Arrow keys to navigate, `Enter` to select, type-ahead to jump to matching item, `Escape` to close
- **ARIA:** `role="listbox"`, options are `role="option"`, `aria-selected` on chosen item, `aria-activedescendant` for keyboard focus

#### 6i. Date Pickers & Calendar Popovers
- **Trigger:** Click on date input field or calendar icon button
- **Anatomy:** Month/year header with prev/next arrows, 7-column day grid, today highlighted, selected date accented, range selection (start–end) with highlighted range, disabled dates grayed out
- **Keyboard:** Arrow keys to move dates, `Enter` to select, `Escape` to close
- **Behavior:** Closes on date selection (single) or on range completion (range picker)

#### 6j. Command Palette / Spotlight Search
- **Trigger:** `Cmd+K` / `Ctrl+K` keyboard shortcut, or click search icon in navbar
- **Anatomy:** Full-width input at top, grouped results below (recent, actions, navigation), result item (icon + label + description + optional shortcut badge), empty state, loading state
- **Position:** Centered overlay, `--bg-surface-overlay`, wide (`560px–640px`), `--shadow-xl`
- **Dismissal:** `Escape`, backdrop click, selecting a result
- **Keyboard:** Arrow keys to navigate results, `Enter` to execute, type to filter
- **Z-index:** `z-modal: 51` (same as modal)

#### 6k. Toast Notifications
- **Position:** Top-right corner, bottom-center, or top-center; stacked vertically with gap
- **Anatomy:** Small card with: optional status icon (left), message text, optional action link ("Undo"), dismiss `X` button (right)
- **Variants by status:** Success (green accent), error (red accent), warning (amber accent), info (blue accent), neutral
- **Behavior:**
  - Auto-dismiss: Default `4000ms`–`5000ms`, error toasts persist longer (`8000ms`) or require manual dismiss
  - Pause on hover: Timer pauses while mouse is over the toast
  - Stacking: Max 3–5 visible; older toasts are dismissed or collapsed
  - Queue: If max visible is reached, new toasts queue and appear as older ones dismiss
- **Entry animation:** Slide in from edge + fade, `200ms ease-out`
- **Exit animation:** Fade out + slide, `150ms ease-in`; height collapse for stack reflow
- **Z-index:** `z-toast: 70`
- **ARIA:** `role="status"` or `role="alert"` (for errors), live region `aria-live="polite"` (or `"assertive"` for errors)
- **Swipe-to-dismiss:** On touch devices, horizontal swipe removes the toast

#### 6l. Inline Alerts & Banner Notifications
- **Position:** Inline within page content flow (not floating)
- **Variants:** Info, success, warning, error/danger — each with its status color background (`--color-*-bg`), left border or icon accent (`--color-*`), and text
- **Anatomy:** Optional icon (left), title (bold), description (body text), optional action link or button, optional dismiss `X`
- **Persistent vs dismissible:** Error alerts persist until resolved; info/success banners can be dismissed
- **Full-width banner variant:** Pinned to top of content area or below navbar, full-width, for system-level messages (maintenance, announcements)
- **Compact variant:** Single-line inline alert for form-level feedback ("Your changes have been saved")

#### 6m. Stacking context & calibrated z-index scale
Explicit scale to prevent z-index collision:
- `z-base: 0` — page content, inline elements
- `z-sticky: 10` — sticky table headers, sub-navigation bars, floating action buttons
- `z-dropdown: 20` — dropdown menus attached to page-level elements
- `z-nav: 40` — top navbar, header, sidebar
- `z-backdrop: 50` — modal/drawer backdrop scrim
- `z-modal: 51` — modal dialog, drawer container, command palette
- `z-popover: 60` — popovers, dropdowns opened from inside modals
- `z-toast: 70` — toast notification stack
- `z-tooltip: 80` — tooltips (always topmost)

### 7. UI component library — every component, every state

Establish the visual conventions for every shared component across all screens. **Each component is defined with all its interactive states.**

#### 7a. Buttons
- **Variants:**
  - Primary (solid accent fill `--accent-primary`, `--text-inverse` label)
  - Secondary (surface fill `--bg-surface` + `--border-default`, `--text-primary` label)
  - Outline / Ghost (transparent background, `--border-default`, `--text-primary`; ghost has no border)
  - Destructive / Danger (solid `--color-error` fill, white label; or outline with `--color-error` text)
  - Link button (no background, no border, `--text-link` colored, underline on hover)
- **Sizes:** Small (`height: 32px`, `px: 12px`, `text: 13px`), Medium (`height: 36px–40px`, `px: 16px`, `text: 14px`), Large (`height: 44px–48px`, `px: 20px–24px`, `text: 16px`)
- **States:**
  - Default: At-rest appearance
  - Hover: Background lightens/darkens by one shade, subtle `transform: translateY(-1px)` or just color shift; cursor `pointer`
  - Active / Pressed: Background darkens further, `transform: scale(0.98)` or `translateY(0)`, immediate (no transition)
  - Focus-visible: `--ring-focus` outline, `2px` width, `2px` offset from button edge; only on keyboard navigation, not mouse click
  - Disabled: `opacity: 0.5`, `cursor: not-allowed`, `pointer-events: none`
  - Loading: Inline spinner (16px) replaces icon or sits beside label; label text preserved or replaced with "Loading…"; button is non-interactive during loading
- **Icon buttons:** Square variant (same height/width as size), icon centered, tooltip on hover explaining the action
- **Button groups:** Joined buttons with shared border, first has left radius, last has right radius, middle buttons have no radius, `1px` border between items
- **Transitions:** Background and border-color: `150ms ease`; transform: `100ms ease`

#### 7b. Form inputs & controls
**Text inputs:**
- **Anatomy:** Label (above), input field (border, padding `10px 12px`, height `40px`), optional helper text / character count (below), optional leading/trailing icon
- **States:** Default (`--border-default`), hover (`--border-strong`), focus (`--ring-focus` + `--border-strong`), filled (same as default but with text), error/invalid (`--border-error` + red helper text below with error icon), disabled (`--bg-surface-inset`, `opacity: 0.5`), read-only (no border, text selectable)
- **Placeholder:** `--text-muted`, disappears on focus/typing
- **Transitions:** Border-color `150ms ease`, box-shadow (focus ring) `100ms ease`

**Textarea:** Same as text input but multi-line, auto-resize or fixed height, optional character count

**Select (native or custom):** Trigger shows selected value + chevron icon; see §6h for custom dropdown behavior

**Checkboxes:**
- **Anatomy:** 18–20px square box, rounded corners (`--radius-sm`), label to the right
- **States:** Unchecked (border only), checked (accent fill + white check icon), indeterminate (accent fill + dash icon), hover (border darkens or accent lightens), focus-visible (focus ring), disabled, error
- **Transition:** Check icon scales in with slight bounce, `150ms ease`

**Radio buttons:**
- **Anatomy:** 18–20px circle, label to the right
- **States:** Unselected (border only), selected (accent border + inner filled dot), hover, focus-visible, disabled, error
- **Transition:** Inner dot scales in, `150ms ease`

**Toggle switches:**
- **Anatomy:** Horizontal track (`40–44px` wide, `24px` tall), circular thumb (`20px`)
- **States:** Off (gray track, thumb left), on (accent track, thumb right), hover (slight track color shift), focus-visible (ring on thumb), disabled (`opacity: 0.5`)
- **Transition:** Thumb position `200ms ease`, track color `150ms ease`
- **Label:** Always paired with a text label; optional "on"/"off" text inside track

**Sliders / Range inputs:**
- **Anatomy:** Horizontal track, filled portion (accent), thumb circle (`16–20px`), optional value label tooltip above thumb
- **States:** Default, hover (thumb enlarges), active/dragging (thumb enlarged + shadow), disabled
- **Transition:** Thumb size `100ms ease`

**File upload:**
- **Anatomy:** Dashed border dropzone, icon + "Drop files or click to browse" text, or compact button variant
- **States:** Default, hover (border accent), dragover (accent background tint), uploading (progress bar inside), error

**Date/time inputs:** See §6i for calendar popover; inline field shows formatted date, clear button

#### 7c. Cards & content containers
- **Surface:** `--bg-surface`, `--border-subtle` border (`1px`), `--radius-lg`, `padding: 20px–24px`
- **Variants:** Static (display only), clickable/interactive (hover: slight `--shadow-md` lift + `translateY(-2px)`), selected (accent border or left accent stripe)
- **Anatomy:** Optional header (title + action button/menu), body, optional footer (metadata, secondary actions)
- **Image card variant:** Image at top (full-width, clipped to card radius), text content below
- **Horizontal card variant:** Image/icon left, content right
- **Transitions:** Box-shadow and transform: `200ms ease`; border-color: `150ms ease`

#### 7d. Badges, tags, chips & status indicators
- **Badge (count):** Small pill (`min-width: 20px`, `height: 20px`, `--radius-full`), accent or status fill, white text, attached to icon or avatar corner
- **Tag / Chip:** Pill shape (`--radius-full` or `--radius-sm`), `padding: 4px 10px`, subtle background tint (`--accent-subtle` or status `-bg` tokens), text in corresponding status or accent color
- **Removable chip:** Trailing `×` icon, hover on `×` shows subtle background
- **Dot indicator:** Small circle (8–10px) with status color, for online/offline, unread
- **Status badge:** Chip with leading dot or icon, labeled ("Active", "Pending", "Failed")

#### 7e. Avatars & avatar groups
- **Shape:** Circle (`--radius-full`)
- **Sizes:** XS (`24px`), SM (`32px`), MD (`40px`), LG (`48px`), XL (`64px`)
- **Fallback:** Initials (1–2 characters, accent background, inverse text) when no image
- **Status dot:** Small circle positioned bottom-right, inset with 2px white ring
- **Avatar group / stack:** Overlapping circles (negative margin), `+N` overflow indicator

#### 7f. Tables & data grids
- **Header row:** `--bg-surface`, bold or semi-bold label text, sticky (`position: sticky; top: 0`), optional sort indicators (▲ ▼ arrows), optional column resize handles
- **Data rows:** `--bg-base` or alternating subtle stripe (`--bg-surface`), row hover (`--bg-hover`), selected row (`--bg-selected` + accent left border)
- **Cells:** `padding: 12px 16px`, left-aligned text (right-aligned for numbers), truncation with tooltip on overflow
- **Row actions:** Inline action buttons (appear on hover, or always-visible kebab ⋯ menu)
- **Empty state:** Centered within table area when zero rows
- **Pagination:** Below table — page numbers or "Load more" button; items-per-page selector; total count display
- **Mobile responsive:** Below breakpoint, table collapses into a card-stack (one card per row, label: value pairs stacked vertically)
- **Selection:** Checkbox column (leftmost), "Select all" in header, bulk action bar appears above table when items selected

#### 7g. Lists & list items
- **Anatomy:** Leading element (icon, avatar, or checkbox), primary text, secondary text (below or right), trailing element (badge, timestamp, action button)
- **Variants:** Simple list, interactive list (hover + click), navigation list (sidebar), checklist
- **Dividers:** 1px `--border-subtle` between items, full-width or inset (to the right of leading element)
- **Hover / active:** Background tint (`--bg-hover`), active (`--bg-selected`)
- **Swipe actions (mobile):** Reveal action buttons on horizontal swipe (archive, delete)
- **Virtualization note (if large lists):** Note whether virtual scrolling is expected for lists exceeding N items

#### 7h. Tabs & segmented controls
- **Tab bar anatomy:** Horizontal row of tab items, bottom border or background container
- **Tab item:** Label text (+ optional icon left, badge right), min-width, padding
- **Active indicator:** Bottom underline (2–3px accent), pill background, or full background tint
- **States:** Default (`--text-secondary`), hover (text darkens), active (`--text-primary` + indicator), disabled (`--text-muted`)
- **Scroll behavior:** If too many tabs, horizontal scroll with fade-edge indicators or left/right scroll arrows
- **Transition:** Active indicator slides between tabs (position + width), `200ms ease`
- **ARIA:** `role="tablist"`, tab items are `role="tab"`, panels are `role="tabpanel"`

#### 7i. Breadcrumbs
- **Anatomy:** Linked page names separated by chevron `›` or slash `/`, current page is plain text (not linked), truncation for deep hierarchies (first + `...` + last 2)
- **Position:** Below navbar or below page title
- **Link styles:** `--text-link` or `--text-secondary`, hover underline

#### 7j. Pagination
- **Variants:** Page numbers (1 2 3 ... 10), prev/next buttons only, "Load more" button, infinite scroll with sentinel
- **Anatomy:** Prev arrow, page number buttons (active has accent background), ellipsis for gaps, next arrow
- **States:** Active page (accent fill), hover (accent subtle), disabled prev/next at boundaries

#### 7k. Progress indicators
- **Linear progress bar:** Height (`4px`–`8px`), track (`--bg-surface-inset`), fill (`--accent-primary`), rounded ends, optional percentage label
- **Indeterminate variant:** Animated fill that slides back and forth or loops
- **Circular / Ring spinner:** SVG circle, `--accent-primary` stroke, rotating animation
- **Step indicator / Stepper:** Horizontal or vertical numbered steps (completed check, current accent, future gray), connecting line between steps
- **Skeleton loaders:** Pulse-animated placeholder blocks matching the shape of real content (text lines, cards, avatars, images), `--bg-surface-inset` to `--bg-hover` shimmer animation, `1.5s ease-in-out infinite`

#### 7l. Accordions & collapsible sections
- **Anatomy:** Header row (label + trailing chevron), collapsible body
- **Behavior:** Click header to toggle; chevron rotates 180° on expand
- **Single vs multi:** Whether only one section can be open at a time
- **Transition:** Height auto-animate (or max-height transition), chevron rotation `200ms ease`
- **ARIA:** `aria-expanded` on trigger, body has `role="region"` with `aria-labelledby`

#### 7m. Scrollbar styling
- **Custom scrollbar treatment:** Thin track (`6–8px`), rounded thumb with `--border-subtle` or `--text-muted` color, transparent track or very subtle `--bg-surface-inset`, hover to reveal pattern or always-visible
- **Gutter behavior:** `scrollbar-gutter: stable` to prevent layout shift

#### 7n. Dividers & visual separators
- **Horizontal divider:** `1px solid --border-subtle`, full-width or inset with margin
- **Divider with label:** Centered text ("OR", section name) with lines extending to each side
- **Vertical divider:** Between adjacent elements (toolbar buttons, stat groups)

#### 7o. Kbd (keyboard shortcut) indicators
- **Anatomy:** Inline `<kbd>` styled element, border + slight shadow for "key cap" effect
- **Styling:** `--bg-surface`, `--border-default`, `--radius-sm`, `font-size: 11-12px`, mono font, `padding: 2px 6px`

### 8. Animation & transition system

#### Global transition tokens
Define named durations and easing functions used throughout:
- `--duration-instant`: `0ms` (reduced-motion fallback)
- `--duration-fast`: `100ms` (micro-interactions: checkbox, toggle, button press)
- `--duration-normal`: `150ms–200ms` (hover states, focus rings, small reveals)
- `--duration-slow`: `250ms–300ms` (modals, drawers, page transitions)
- `--duration-slower`: `400ms–500ms` (skeleton shimmer, complex choreography)
- `--ease-default`: `cubic-bezier(0.4, 0, 0.2, 1)` (standard material ease)
- `--ease-in`: `cubic-bezier(0.4, 0, 1, 1)` (exits, elements leaving)
- `--ease-out`: `cubic-bezier(0, 0, 0.2, 1)` (entrances, elements arriving)
- `--ease-bounce`: `cubic-bezier(0.34, 1.56, 0.64, 1)` (playful spring, sparingly)

#### Per-component animation specs
| Component | Property | Duration | Easing | Reduced-motion fallback |
|---|---|---|---|---|
| Button hover | background-color, border-color | `--duration-normal` | `--ease-default` | instant |
| Button press | transform (scale) | `--duration-fast` | `--ease-default` | none |
| Focus ring appear | box-shadow | `--duration-fast` | `--ease-out` | instant |
| Input focus | border-color, box-shadow | `--duration-normal` | `--ease-default` | instant |
| Checkbox / toggle | background, transform | `--duration-normal` | `--ease-default` | instant |
| Card hover | box-shadow, transform | `--duration-normal` | `--ease-out` | instant |
| Dropdown open | opacity, transform (scaleY) | `--duration-normal` | `--ease-out` | instant opacity |
| Modal enter | opacity, transform (scale) | `--duration-slow` | `--ease-out` | instant opacity |
| Modal exit | opacity, transform (scale) | `--duration-normal` | `--ease-in` | instant opacity |
| Drawer slide | transform (translateX) | `--duration-slow` | `--ease-out` | instant opacity |
| Toast enter | opacity, transform (translateX) | `--duration-slow` | `--ease-out` | instant opacity |
| Toast exit | opacity, transform | `--duration-normal` | `--ease-in` | instant opacity |
| Tooltip appear | opacity, transform (translateY 2px) | `--duration-fast` | `--ease-out` | instant opacity |
| Accordion expand | height (or max-height) | `--duration-slow` | `--ease-default` | instant |
| Tab indicator slide | left, width | `--duration-normal` | `--ease-default` | instant |
| Skeleton shimmer | background-position | `--duration-slower` | `linear` | static gray |
| Page/route transition | opacity | `--duration-normal` | `--ease-default` | instant |
| Progress bar fill | width | `--duration-slow` | `--ease-default` | instant |
| Spinner rotation | transform (rotate) | `600ms–800ms` | `linear` | static (no spin) |

#### Reduced-motion posture
- All animations respect `@media (prefers-reduced-motion: reduce)`
- Fallback strategy: Remove all transform-based motion (translate, scale, rotate); opacity transitions become instant or `50ms`; skeleton loaders become static gray
- Spinners: Acceptable to keep rotating (they convey loading state), but offer a non-spinning alternative (pulsing dot or static icon with "Loading" label)

### 9. Iconography

- **Icon set:** Named library (Lucide, Phosphor, Heroicons, Tabler, custom SVG sprite) and rationale
- **Default size:** `16px` inline, `20px` in buttons/inputs, `24px` standalone, `32px–48px` for empty states
- **Stroke weight:** Match the type weight (1.5px for regular, 2px for bold contexts)
- **Color:** `currentColor` by default (inherits text color), explicit status/accent color when needed
- **Touch padding:** Icon buttons wrap the icon in a minimum `44×44px` tap target even if the icon is `20px`

### 10. Layout grid & responsive breakpoints

#### Breakpoint system
- `--bp-sm`: `640px` (large phones, landscape)
- `--bp-md`: `768px` (tablets, small laptops)
- `--bp-lg`: `1024px` (standard laptops, desktop)
- `--bp-xl`: `1280px` (wide desktop)
- `--bp-2xl`: `1536px` (ultra-wide, optional)

#### Container & grid
- Max content width: e.g. `1280px` / `80rem`
- Horizontal padding: `16px` (mobile) → `24px` (tablet) → `32px` (desktop)
- Column grid: 12-column grid (desktop), 8-column (tablet), 4-column (mobile) — or CSS Grid / Flexbox patterns
- Gutter: `16px` (mobile) → `24px` (desktop)

#### Responsive behavior rules
- Navbar: Full horizontal nav → hamburger + drawer (below `--bp-md` or `--bp-lg`)
- Sidebar: Visible → collapsed icon-only → hidden with drawer trigger
- Tables: Full table → card-stack below `--bp-md`
- Multi-column layouts: Side-by-side → stacked below `--bp-md`
- Modals: Centered card → full-screen sheet on mobile
- Typography: Scale down display/H1 sizes on mobile (fluid clamp or breakpoint overrides)

### 11. Data Visualization (if applicable)
Only if the product displays charts. Chart types, library, and a dedicated chart color palette — a set of 6–12 distinguishable hues decoupled from semantic status colors (green/red for data series creates confusion with success/error).

### 12. Accessibility, ARIA & motion

#### Touch & pointer targets
- Minimum tap target: `44×44px` for all interactive elements
- Spacing between adjacent targets: minimum `8px` gap
- Touch slop: Allow slight miss on mobile

#### Focus management
- `focus-visible` ring specification: `2px solid --ring-focus`, `2px offset`
- Tab order: Logical DOM order, skip-links for main content
- Focus ring appearance: Ring only on keyboard navigation (`:focus-visible`), not on mouse click
- Roving tabindex for composite widgets (tab bars, menu bars, radio groups)

#### ARIA contracts by component
| Component | ARIA role / attribute |
|---|---|
| Modal dialog | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` → title |
| Drawer | `role="dialog"`, `aria-modal="true"` |
| Alert dialog (confirmation) | `role="alertdialog"`, `aria-describedby` → message |
| Tooltip | `role="tooltip"`, trigger has `aria-describedby` |
| Popover | Trigger has `aria-haspopup`, `aria-expanded` |
| Dropdown menu | `role="menu"`, items `role="menuitem"`, trigger `aria-haspopup="menu"` |
| Select / listbox | `role="listbox"`, options `role="option"`, `aria-selected` |
| Tabs | `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected` |
| Toast | `role="status"` (info/success) or `role="alert"` (error), `aria-live` region |
| Accordion | Trigger `aria-expanded`, body `role="region"`, `aria-labelledby` |
| Breadcrumbs | `nav` with `aria-label="Breadcrumb"`, current page `aria-current="page"` |
| Progress bar | `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |

#### Reduced-motion & prefers-contrast
- `@media (prefers-reduced-motion: reduce)` — per §8 animation table
- `@media (prefers-contrast: more)` — strengthen borders, increase text/background contrast, remove subtle tints that rely on low-contrast differences

#### Screen reader announcements
- Toast notifications use `aria-live="polite"` (info) or `aria-live="assertive"` (errors)
- Route changes announce the new page title
- Form validation errors summarized and announced when form is submitted

### 13. Nothing Left Open
Sweep back over the pass: every decision is decided, provisionally decided and registered in `PROGRESS_v<N>.md` §4, or descoped. See `references/closing-questions.md`.

---

## Section Skeleton

```markdown
# <Project> — Design (Frontend & UI/UX Specification)

**Project version:** v1
**Revision:** 1
**Last updated:** YYYY-MM-DD
**Depends on:** [PRODUCT.md](./PRODUCT.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [SCHEMA.md](./SCHEMA.md)

## 1. Visual System & Design Tokens

### 1.1 Named Design Direction & Theme Posture
<The direction in a paragraph, reference product, what it explicitly is not. Primary theme and dark/light support posture.>

### 1.2 Color Palette & Token Taxonomy
<Full palette ramps (primary, neutral, status, extended) with hex values. Then the semantic token mapping table: token name, role, light value, dark value, WCAG contrast verification.>

#### Surface Hierarchy
<--bg-base, --bg-surface, --bg-surface-raised, --bg-surface-overlay, --bg-surface-inset, --backdrop-color, --bg-hover, --bg-selected>

#### Text & Content Tokens
<--text-primary, --text-secondary, --text-muted, --text-inverse, --text-link, --text-code>

#### Border & Focus Tokens
<--border-subtle, --border-default, --border-strong, --ring-focus, --border-error>

#### Brand & Accent System
<--accent-primary, --accent-hover, --accent-active, --accent-subtle, --accent-secondary>

#### Status & Feedback Tokens
<success, warning, error, info, neutral — each with text, bg, border variants>

#### Color Pairing & Contrast Rules
<Which text tokens pair with which surfaces. WCAG AA verification table.>

### 1.3 Typography Scale & Font Styles
<Typefaces (primary, mono, display if distinct), full type ramp table (Display through Code), link styles, truncation rules, tabular-nums usage, font loading strategy.>

### 1.4 Spacing, Elevation, Radii & Visual Rhythm
<Spacing scale, radius scale, shadow/elevation tokens, divider/separator rules.>

### 1.5 Iconography
<Icon library, default sizes, stroke weight, color rules, touch padding.>

## 2. App Shell & Navigation

### 2.1 Shell Architecture & Layout Frame
<Top navbar vs sidebar + header vs mobile tab bar. Content container max-width and padding.>

### 2.2 Navbar Anatomy & Desktop Layout
<Left zone (brand), center (nav links + active indicators + hover states), right zone (search Cmd+K, notifications, theme toggle, CTA), user profile menu. Height, sticky/fixed, blur-on-scroll, z-index.>

### 2.3 Sidebar (if applicable)
<Width (collapsed/expanded), sections, collapse behavior, icon-only mode.>

### 2.4 Mobile Navigation & Responsive Collapse
<Breakpoint, hamburger trigger, drawer/tab bar anatomy, mobile drawer internals.>

### 2.5 Active Indicators, Link States & User Menu
<Active route indicator, nav link hover/active transitions, user menu dropdown items.>

## 3. Overlay System

### 3.1 Modal Dialogs (Small, Medium, Large)
<Size variants, anatomy (header/body/footer), backdrop scrim, enter/exit animation, dismissal rules, focus trapping, scroll locking, nesting.>

### 3.2 Confirmation & Destructive Dialogs
<Anatomy (icon + title + description + actions), destructive button styling, type-to-confirm for high-risk, keyboard rules.>

### 3.3 Slide-Over Drawers & Bottom Sheets
<Direction, width, anatomy, backdrop, animation, dismissal, swipe-to-dismiss.>

### 3.4 Tooltips
<Trigger (hover delay + keyboard focus), placement & auto-flip, arrow/caret, anatomy, sizing, typography, animation, ARIA.>

### 3.5 Popovers
<Trigger (click-to-toggle), dismissal, placement, anatomy, interactive content, focus, animation, ARIA.>

### 3.6 Dropdown Menus (Action Menus)
<Trigger, placement, item anatomy (icon + label + shortcut + description), separators, groups, disabled/destructive items, hover/keyboard navigation, nested submenus, animation, ARIA.>

### 3.7 Context Menus (Right-Click)
<Trigger, cursor-anchored position, anatomy (same as dropdown), dismissal, keyboard trigger.>

### 3.8 Select Menus & Comboboxes
<Trigger, dropdown style, search/filter, multi-select, keyboard, ARIA.>

### 3.9 Date Pickers & Calendar Popovers
<Trigger, calendar grid anatomy, range selection, keyboard, close behavior.>

### 3.10 Command Palette / Spotlight Search
<Trigger (Cmd+K), anatomy (input + grouped results), position, dismissal, keyboard, z-index.>

### 3.11 Toast Notifications
<Position, anatomy (icon + message + action + dismiss), status variants, auto-dismiss timing, pause-on-hover, stacking/queue, entry/exit animation, ARIA.>

### 3.12 Inline Alerts & Banner Notifications
<Position (inline), variants (info/success/warning/error), anatomy (icon + title + body + action + dismiss), persistent vs dismissible, full-width banner, compact variant.>

### 3.13 Stacking Context & Z-Index Scale
<z-base (0), z-sticky (10), z-dropdown (20), z-nav (40), z-backdrop (50), z-modal (51), z-popover (60), z-toast (70), z-tooltip (80).>

## 4. UI Component Library

### 4.1 Buttons (Primary, Secondary, Outline, Ghost, Destructive, Link, Icon)
<Variants, sizes (sm/md/lg), all states (default, hover, active, focus-visible, disabled, loading), icon buttons, button groups, transitions.>

### 4.2 Form Inputs (Text, Textarea, Select, Checkbox, Radio, Toggle, Slider, File Upload, Date)
<Anatomy of each, all states (default, hover, focus, filled, error/invalid, disabled, read-only), placeholder, helper text, validation display, transitions.>

### 4.3 Cards & Content Containers
<Surface, border, radius, padding, variants (static, clickable, selected, image card, horizontal card), transitions.>

### 4.4 Badges, Tags, Chips & Status Indicators
<Count badges, tags/chips (solid, subtle, removable), dot indicators, status badges.>

### 4.5 Avatars & Avatar Groups
<Sizes, shape, fallback initials, status dot, stacked groups, overflow indicator.>

### 4.6 Tables & Data Grids
<Header, data rows, hover/selected rows, cell formatting, row actions, empty state, pagination, mobile card-stack, selection/bulk actions.>

### 4.7 Lists & List Items
<Anatomy (leading/primary/secondary/trailing), variants, dividers, hover/active, swipe actions, virtualization.>

### 4.8 Tabs & Segmented Controls
<Tab bar anatomy, active indicator, states, scroll overflow, slide transition, ARIA.>

### 4.9 Breadcrumbs
<Anatomy, separator, truncation, position, link styles.>

### 4.10 Pagination
<Variants (numbers, prev/next, load more, infinite scroll), active/hover states, disabled boundaries.>

### 4.11 Progress & Loading (Bar, Spinner, Steps, Skeletons)
<Linear bar, indeterminate bar, circular spinner, step indicator, skeleton loaders with shimmer animation.>

### 4.12 Accordions & Collapsible Sections
<Anatomy, expand/collapse behavior, single vs multi, chevron rotation transition, ARIA.>

### 4.13 Scrollbar Styling
<Custom scrollbar treatment, track/thumb, reveal behavior, gutter.>

### 4.14 Dividers & Separators
<Horizontal, with-label, vertical variants.>

### 4.15 Keyboard Shortcut Indicators (Kbd)
<Styling, font, spacing, visual "key cap" treatment.>

### 4.16 Empty States
<Centered icon, heading, description, primary CTA, illustration if applicable.>

### 4.17 Error States
<Page-level error, section-level error, inline field error, retry actions.>

### 4.18 Loading States
<Full-page loading, section loading, inline loading, skeleton shimmer specifications.>

## 5. Animation & Transition System

### 5.1 Global Transition Tokens
<Named durations (instant, fast, normal, slow, slower), easing curves (default, in, out, bounce).>

### 5.2 Per-Component Animation Table
<Component, property, duration, easing, reduced-motion fallback — for every animated element.>

### 5.3 Reduced-Motion Posture
<Media query strategy, what changes, what stays (spinners), fallback behavior.>

### 5.4 Page & Route Transitions (if applicable)
<Transition type (fade, slide, none), duration, direction.>

## 6. Layout Grid & Responsive Design

### 6.1 Breakpoint System
<Named breakpoints with pixel values.>

### 6.2 Container & Grid System
<Max-widths, column grids, gutters, horizontal padding per breakpoint.>

### 6.3 Responsive Behavior Rules
<How each major component (navbar, sidebar, tables, modals, typography) reflows per breakpoint.>

## 7. Data Visualization          <- only if applicable
<Chart types, library, chart color palette (decoupled from status colors), axis/grid styling.>

## 8. Accessibility & ARIA

### 8.1 Touch & Pointer Targets
<44x44px minimum, spacing between targets.>

### 8.2 Focus Management & Keyboard Navigation
<Focus-visible ring spec, tab order, roving tabindex for composite widgets, skip links.>

### 8.3 ARIA Contracts by Component
<Table mapping each component to its ARIA roles and attributes.>

### 8.4 Reduced-Motion & High-Contrast Support
<prefers-reduced-motion and prefers-contrast rules.>

### 8.5 Screen Reader Announcements
<Live regions for toasts, route change announcements, form error summaries.>

## 9. Out of Scope for v1
<Deliberately excluded components, themes, animations, advanced features.>

## 10. Next Steps
<Points to SCREENS.md, then RULES.md.>
```

---

## Handoff

- `SCREENS.md` needs: the complete token set, app shell anatomy, overlay contracts, and UI component library so screens and flows can be assembled from standard elements without inventing layout frames or dialog mechanics.
- `RULES.md` needs: the token naming conventions, the overlay behavior rules (focus trapping, z-index scale, dismissal contracts), the animation/transition standards, and the component-state expectations.
- `ARCHITECTURE.md` needs: UI component library, icon library, animation library (if any), and CSS tooling commitments.
- `PROGRESS_v1.md` needs: every shared component from §4 and overlay pattern from §3 as verifiable acceptance criteria. (Screens and modal flows are tracked from `SCREENS.md`).
