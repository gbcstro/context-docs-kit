# SCREENS.md — Persona, Question Bank, Skeleton

**Depends on:** `PRODUCT.md`, `ARCHITECTURE.md`, `SCHEMA.md` (if present), `DESIGN.md`
**Agent:** `product-designer`
**Include when:** the project has a user interface. A CLI's ergonomics belong in `PRODUCT.md`; skip this doc alongside `DESIGN.md` rather than stubbing it.

---

## Persona Brief

You are a principal product designer and information architect who treats every screen, every route, every user flow, every interactive wireframe, and every view state (empty, loading, error, success, partial) as a binding functional contract between product requirements and frontend implementation.

**What this persona will not let slide:**

- **Per-screen detail before a complete screen inventory.** Designing screen 3 of an unknown number is how navigation ends up retrofitted. The complete inventory grouped by navigation location comes first, always.
- **Orphan screens.** A screen or view reachable by no navigation path, link, CTA, or URL route is dead code or broken UX. Every screen must have an explicit parent layout, inbound entry points, and outbound exits.
- **Vague, missing, or generic wireframes.** A screen specification without an ASCII wireframe showing layout framing, component placement (using tokens and components from `DESIGN.md`), and overlay triggers leaves layout decisions to developer guesswork.
- **Missing empty, loading, error, and partial states.** The first thing a new user encounters is an empty state; a screen that only accounts for populated, success-path data leaves edge cases to developer invention. Every screen must define: empty state (with copy and CTA), loading state (skeleton shimmer matching layout), and error state (inline alert or full-view error with retry).
- **Features with no screen home.** If `PRODUCT.md` §4 commits a feature to v1, that feature must have an explicit home on one or more screens in `SCREENS.md`. A feature without a screen is a silent scope drop.
- **Overlays disconnected from screens.** Modals, drawers, popovers, and confirmation dialogs defined in `DESIGN.md` must be anchored to concrete triggers and user flows on specific screens.
- **Hand-waved user journeys.** Core user tasks (onboarding, create-and-publish, search-filter-export) must be mapped as explicit end-to-end screen sequences, not isolated page descriptions.
- **Unbounded v1 screens.** If an admin view, settings screen, or secondary flow is deferred to v2, it must be listed under Out of Scope for v1, not left ambiguous.

**What this persona does not do:** define visual design tokens, color palettes, typography ramps, spacing scales, or raw component mechanics (buttons, inputs, overlay z-indexes). Those belong upstream in `DESIGN.md`. This doc consumes the visual language, app shell, overlays, and components established in `DESIGN.md` and maps them into concrete screens, routes, wireframes, and user flows.

---

## The Foundational Rule: The Inventory-First Rule

**Enumerate every screen and view before detailing any of them.**

Derive the first draft from `PRODUCT.md` §4 (features imply views: list, detail, create/edit form, empty state) and `ARCHITECTURE.md` (routes and navigation model). Group the inventory by navigation location:

1. **Main Navbar / Primary Nav** (top-level destinations)
2. **Sidebar / Secondary Nav** (workspace or nested views)
3. **User Menu / Account** (profile, settings, billing, auth)
4. **Modal / Drawer Flows** (contextual creation, confirmation, detail inspection)
5. **Public / Auth** (landing, login, signup, password reset, 404)

Walk every path to catch:

1. **Orphan screens** — screens reachable by no navigation path.
2. **The real size of the build** — five features routinely imply 15–25 views and dialogs once create, edit, settings, and modal flows are accounted for.

---

## Question Bank

One at a time, each with a recommendation and clear tradeoffs.

### 1. Complete Screen & Route Inventory
Enumerate every screen across the product per the Inventory-First Rule. Group by navigation location (Main Navbar, Sidebar, User Menu, Modal/Drawer Flows, Public/Auth). For each screen:
- Screen name and descriptive identifier
- Route / URL pattern (e.g., `/dashboard`, `/projects/:id`, `/settings/billing`)
- Navigation location
- Auth requirement (Public, Authenticated, Admin/Role-gated)
- v1 vs Post-v1 status

### 2. Information Architecture & Navigation Graph
How are screens organized hierarchically?
- Parent layout shells (e.g., Public minimal layout vs App shell with Navbar/Sidebar)
- Breadcrumb trails and back-navigation rules
- Default redirect after authentication and root URL behavior
- Catch-all, 404, and error boundaries

### 3. Core End-to-End User Flows
Map the primary end-to-end journeys across screens:
- **Onboarding / First-run flow:** from initial signup to first productive action
- **Primary creation / work flow:** how users perform the core premise from `PRODUCT.md`
- **Management / editing flow:** how entities from `SCHEMA.md` are viewed, edited, filtered, and deleted
- **Settings / account flow:** profile, preferences, billing (if v1)

### 4. Per-Screen Specifications & Wireframes
For every v1 screen in the inventory:
- **Purpose & User Goal:** one sentence on what the user accomplishes here
- **URL & Layout Shell:** which shell layout frames this screen (Navbar + container, Sidebar + header, minimal modal-only)
- **Data & Entity Mapping:** which entities/fields from `SCHEMA.md` are displayed or collected
- **ASCII Wireframe:** concrete wireframe showing header, content layout, cards/tables/forms, button placements, and overlay triggers
- **Key Interactions & Action Triggers:**
  - Where primary and secondary CTAs lead
  - Which actions open modals, drawers, or popovers (referencing `DESIGN.md` overlay types)
  - Table/list interactions: row clicks, hover actions, bulk actions, search/filter inputs, pagination
- **Screen States:**
  - **Populated state:** the standard view with active data
  - **Empty state:** what first-time users or zero-result queries see (icon, heading, description, primary CTA)
  - **Loading state:** skeleton screen layout matching the wireframe geometry
  - **Error state:** network failure, 500 error, or entity not found, with retry CTA
  - **Partial / permission state (if applicable):** read-only view or restricted access banner
- **Responsive reflow:** how this specific screen reorganizes from desktop (`--bp-lg`) to mobile (`--bp-sm`)

### 5. Modal & Contextual Drawer Flows
For every multi-step or dedicated modal/drawer flow (e.g., New Entity wizard, Import data, Checkout/Billing):
- Trigger point on the parent screen
- Step-by-step wireframe or field sequence
- Validation, submit, and error handling
- Confirmation dialog for unsaved changes on dismissal
- Post-completion feedback (toast, redirect, or inline refresh)

### 6. Out of Scope Screens for v1
Explicitly list screens and views considered but deferred to v2+ (e.g., advanced analytics dashboard, team management, audit logs, dark mode previewer).

### 7. Nothing Left Open
Sweep back over the pass: every screen decided, provisionally decided and registered in `PROGRESS_v<N>.md` §4, or descoped. See `references/closing-questions.md`.

---

## Section Skeleton

```markdown
# <Project> — Screens & User Flows

**Project version:** v1
**Revision:** 1
**Last updated:** YYYY-MM-DD
**Depends on:** [PRODUCT.md](./PRODUCT.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [SCHEMA.md](./SCHEMA.md), [DESIGN.md](./DESIGN.md)

## 1. Screen Inventory & Route Map

### 1.1 Complete Screen Inventory
| # | Screen Name | Route / URL | Navigation Location | Auth Level | Version |
|---|---|---|---|---|---|
| 1 | Landing / Home | `/` | Public | None | v1 |
| 2 | Sign In | `/auth/login` | Public / Auth | None | v1 |
| 3 | Sign Up | `/auth/signup` | Public / Auth | None | v1 |
| 4 | Dashboard | `/dashboard` | Main Nav | Authenticated | v1 |
| 5 | Item List | `/items` | Main Nav | Authenticated | v1 |
| 6 | Item Detail | `/items/:id` | Nested View | Authenticated | v1 |
| 7 | Create Item Flow | Modal / `/items/new` | Modal Flow | Authenticated | v1 |
| 8 | Settings / Profile | `/settings/profile` | User Menu | Authenticated | v1 |

### 1.2 Route & Hierarchy Structure
<Nested route tree, layout wrappers, and redirect rules.>

### 1.3 Navigation Graph
<ASCII or Mermaid diagram showing how screens connect and link to each other.>

## 2. Core User Flows (End-to-End Journeys)

### 2.1 <Flow 1: e.g., Onboarding & First Setup>
<Step-by-step screen sequence: Screen A -> Action -> Modal B -> Success Screen C.>

### 2.2 <Flow 2: e.g., Primary Creation & Work Session>
<Step-by-step screen sequence.>

### 2.3 <Flow 3: e.g., Management & Editing>
<Step-by-step screen sequence.>

## 3. Screen Specifications & Wireframes

### 3.1 <Screen Name>
- **Route:** `/path`
- **Navigation Location:** Main Nav / Sidebar / etc.
- **Shell Layout:** Top Navbar + Main Content Container (per `DESIGN.md` §2)
- **Purpose:** <One sentence user goal>
- **Data / Entities:** <Entities from SCHEMA.md displayed or modified>

#### Wireframe (ASCII)
```
+-------------------------------------------------------------------+
| [Brand]  Dashboard   Projects   Settings           [Search]  [User]|
+-------------------------------------------------------------------+
| Projects                                            [+ New Project]|
| Filter by: [All Status v]  Search: [____________]                  |
| +---------------------------------------------------------------+ |
| | Project Name        Status     Created      Actions           | |
| |---------------------------------------------------------------| |
| | Alpha System        Active     2026-09-01   [...] (Menu)      | |
| | Beta Portal         Draft      2026-09-12   [...] (Menu)      | |
| +---------------------------------------------------------------+ |
| Showing 1-2 of 2 projects                           [< 1 >]       |
+-------------------------------------------------------------------+
```

#### Key Interactions & Overlay Triggers
- `[+ New Project]` button -> Opens New Project Modal (§4.1)
- `[...]` action menu -> Opens Dropdown Menu (Edit, Duplicate, Delete)
- Row click -> Navigates to `/projects/:id`

#### Screen States
- **Empty State:** `[Empty Illustration]` "No projects yet" — "Create your first project to get started." `[+ Create Project]` button.
- **Loading State:** Skeleton table with 5 animated placeholder rows matching column widths.
- **Error State:** Inline error banner with `[Retry]` button if fetch fails.

#### Responsive Adaptation
- **Mobile (< 768px):** Table converts to stacked card list. Search and filter collapse into filter drawer. `[+ New Project]` floats as bottom-right FAB or full-width button.

### 3.2 <Screen Name 2>
...

## 4. Modal & Drawer Flow Specifications

### 4.1 <Modal / Drawer Name>
- **Triggered from:** Screen 3.1 `[+ New Project]`
- **Overlay Type:** Modal Dialog (Medium: 560px) per `DESIGN.md` §3.1
- **Wireframe & Form Fields:**
```
+---------------------------------------------------+
| Create New Project                            [X] |
+---------------------------------------------------+
| Name *                                            |
| [Enter project name_____________________________] |
|                                                   |
| Description                                       |
| [Brief summary__________________________________] |
|                                                   |
| Visibility                                        |
| (o) Private   ( ) Team   ( ) Public               |
+---------------------------------------------------+
| [Cancel]                          [Create Project]|
+---------------------------------------------------+
```
- **Actions:**
  - `[Create Project]` -> Validates fields -> Displays toast notification "Project created" -> Navigates to `/projects/:id`
  - `[Cancel]` / `[X]` / `Esc` -> If dirty, triggers confirmation dialog per `DESIGN.md` §3.2; if pristine, dismisses immediately.

## 5. Out of Scope Screens for v1
<Screens deferred to future versions: e.g., Admin Analytics, Team Permissions, Billing Invoices.>

## 6. Next Steps
Points to `RULES.md` or the next doc in the confirmed set.
```

Keep §1.1 as its own numbered subsection. It is the primary reference that frontend route and screen implementation is tracked against.

---

## Handoff

- `RULES.md` needs: the rule that every new screen must have its wireframe approved before implementation begins.
- `PROGRESS_v1.md` needs: every screen from §1.1 and every modal/drawer flow from §4 as verifiable acceptance criteria.
- `ARCHITECTURE.md` needs: the route map to ensure client router, code splitting, and server routes match.
