# PHASE 1 WEB PROMPT — Loan Tracker Web Foundation

## Read First

Read these files before planning:

- PROJECT_RULES.md
- BUSINESS_RULES.md
- WEB_APP_PLAN.md

Also inspect the installed Hallmark skill if available.

---

## Context

This project is:

```txt
Loan Tracker Web
```

It is a standalone PWA web app.

There is another project folder named:

```txt
Loan Tracker
```

That project is the existing mobile Expo app.

Use the mobile app as reference only.

Use it for:
- design language
- dark premium aesthetic
- card hierarchy
- spacing rhythm
- terminology
- loan lifecycle concepts
- UX direction

Do not:
- connect this web app to the mobile app
- share storage/database
- create sync logic
- copy React Native code directly
- use Expo APIs
- assume a shared backend exists

---

## Hallmark Requirement

Use Hallmark skill for:
- visual hierarchy
- spacing
- card composition
- typography rhythm
- responsive polish
- premium web layout quality

Hallmark should help the UI look polished from the start.

Do not let Hallmark:
- change business rules
- introduce backend/auth
- create sync
- over-design the product
- add unnecessary complexity

---

## Phase 1 Goal

Create the foundation for Loan Tracker Web.

This phase should produce:
- a runnable web app
- dark premium layout
- mobile-first PWA-ready direction
- navigation
- placeholder pages
- reusable UI foundation

No real database or business logic yet.

---

## Preferred Stack

Use:

- Next.js
- React
- TypeScript
- Tailwind CSS

If the project is not initialized yet:
- create a new Next.js app in the current folder
- use App Router
- use TypeScript
- use Tailwind CSS

---

## Phase 1 Requirements

### 1. App Shell

Create a responsive app shell.

Mobile-first:
- bottom navigation
- iPhone-friendly spacing
- touch-friendly controls
- dark background

Desktop later:
- centered content or adaptive layout
- no need for full desktop dashboard yet

### 2. Navigation

Create routes/pages:

- Dashboard
- Loans
- Archive
- Settings

Suggested paths:
- `/`
- `/loans`
- `/archive`
- `/settings`

### 3. Placeholder Pages

Create placeholder screens with premium visual direction.

Dashboard placeholder should show:
- page badge
- large title
- subtitle
- mock summary cards
- mock active loan card

Loans placeholder should show:
- page badge
- active loans title
- search/filter placeholder
- compact mock card/table preview

Archive placeholder should show:
- page badge
- closed loans title
- mock archive card

Settings placeholder should show:
- page badge
- app/data/about sections
- mock settings cards

### 4. Design System Foundation

Create reusable components if appropriate:

Suggested:
- AppShell
- BottomNav
- PageHeader
- StatCard
- LoanCard
- SectionHeader
- Pill / Badge
- Button

Create reusable style tokens/constants if useful.

Design rules:
- dark premium
- rounded cards
- soft borders
- pastel accents
- large numbers
- consistent spacing

### 5. PWA Preparation

Prepare for PWA direction.

Do not overdo it yet.

Nice to have:
- metadata
- viewport-friendly layout
- theme color
- app-like structure

Do not spend Phase 1 on full service worker unless already easy.

### 6. Mock Data Only

Use mock/static data only.

Do not:
- implement real database
- implement localStorage
- implement IndexedDB
- implement payment logic
- implement backup/restore

### 7. Standalone Requirement

The web app must be independent.

Do not import from the mobile app project.

Do not rely on the mobile app folder.

---

## Implementation Constraints

Do not:
- build backend
- add auth
- add cloud sync
- add notifications
- add complex charts
- over-engineer state management
- create huge files
- generate the entire future app

Keep Phase 1 focused.

---

## Suggested Folder Structure

Possible structure:

```txt
app/
  page.tsx
  loans/page.tsx
  archive/page.tsx
  settings/page.tsx
  layout.tsx
components/
  layout/
    AppShell.tsx
    BottomNav.tsx
  ui/
    PageHeader.tsx
    StatCard.tsx
    SectionHeader.tsx
    Pill.tsx
    Button.tsx
  loans/
    LoanCard.tsx
constants/
  navigation.ts
  theme.ts
lib/
  mockData.ts
types/
  loan.ts
```

Use judgment and keep it simple.

---

## Verification

After implementation, run:

```bash
npm run lint
npm run build
```

If this project uses different scripts, report what was run.

Also verify:
- app loads locally
- mobile viewport looks good
- navigation works
- no backend/auth/sync added
- no mobile app imports
- UI feels aligned with Loan Tracker mobile
- Hallmark polish is reflected in spacing/hierarchy

---

## Before Coding

Do not code immediately.

First respond with:

1. Implementation plan
2. Files to create/change
3. Design approach
4. Risks
5. Ask for approval

Wait for approval before implementing.

---

## Approval Phrase

After the plan is reviewed, wait for:

```txt
Approved. Implement Phase 1 Web only.
```
