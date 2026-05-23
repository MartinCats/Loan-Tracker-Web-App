# WEB APP PLAN — Loan Tracker Web

## Product Name

Loan Tracker Web

---

## Goal

Build a standalone PWA web app for personal loan tracking.

The app should feel like a premium finance dashboard but remain simple, fast, and useful on iPhone 17.

---

## Relationship to Existing Mobile App

There is an existing mobile app project in another folder:

```txt
Loan Tracker
```

That app is the reference for:
- design language
- product philosophy
- business rules
- loan lifecycle
- dark premium style
- card hierarchy
- spacing rhythm
- terminology

But this web app is standalone.

Do not:
- connect to the mobile app
- share database
- create sync
- copy React Native code directly
- use Expo APIs

---

## Primary Target

Primary target:
- iPhone 17
- Safari
- PWA installed to Home Screen

Secondary targets:
- desktop browser
- tablet browser

The web app should be mobile-first and PWA-ready.

---

## Why Web App?

The web app is for users who want:
- browser-based access
- larger view if needed
- easy PWA installation
- dashboard overview
- loan management
- archive review
- backup/import/export tools

It is not a companion app.
It is its own standalone product.

---

## Core Product Experience

Open the app and instantly know:
- how much profit has been received
- how much active principal exists
- how much expected profit is pending
- who is overdue
- who is due today
- who is coming due soon

---

## Design Direction

Visual style:
- dark premium finance UI
- minimal
- high contrast
- soft card surfaces
- pastel finance accents
- rounded corners
- subtle borders
- large numbers
- calm layout

Reference vibe:
- mobile Loan Tracker app
- premium productivity apps
- finance dashboard
- iOS-inspired spacing

Avoid:
- clutter
- heavy analytics charts too early
- loud colors
- enterprise table-first feel on mobile
- copying generic admin templates

---

## PWA Direction

The app should eventually support:
- install to Home Screen
- app icon
- splash screen
- standalone display mode
- offline local usage
- local browser storage
- responsive app-like navigation

Phase 1 should prepare the structure for this, but does not need final production PWA polish.

---

## Recommended Tech Stack

Preferred:
- Next.js
- React
- TypeScript
- Tailwind CSS

Optional later:
- localStorage / IndexedDB
- Zustand
- Dexie
- PWA plugin
- chart library
- CSV/JSON export

---

## Suggested Pages

### Dashboard

Purpose:
- business overview
- active attention
- urgent loans

Should include:
- Lifetime Profit
- Expected Profit
- Principal Active
- Active Loans
- attention cards
- empty state

### Loans

Purpose:
- manage active loans

Should include:
- search
- filters
- sorting
- compact cards or table
- open detail

### Archive

Purpose:
- review closed loans

Should include:
- closed loans
- profit summary
- closed date
- read-only detail

### Settings

Purpose:
- app preferences
- backup/export/import
- language switch
- PWA info

---

## Navigation

Because iPhone 17 is the primary target, navigation should feel mobile-app-like.

Suggested:
- bottom navigation for mobile
- sidebar/top nav for desktop later
- consistent page headers
- safe touch targets

Initial tabs:
- Dashboard
- Loans
- Archive
- Settings

---

## Data Strategy

Phase 1:
- mock data only

Later:
- local browser storage
- no backend
- no auth
- no cloud sync

Potential storage progression:
1. mock data
2. localStorage
3. IndexedDB
4. optional export/import

Do not jump to backend.

---

## Build Phases

### Phase 1 — Foundation

Goal:
- set up project
- layout
- navigation
- design system
- placeholder pages
- PWA-ready direction

No real business logic yet.

### Phase 2 — Dashboard UI

Goal:
- build dashboard with mock data
- summary cards
- attention cards
- responsive mobile layout

### Phase 3 — Loans and Archive UI

Goal:
- active loans page
- archive page
- detail view mock

### Phase 4 — Local Data Layer

Goal:
- local browser storage
- domain types
- basic CRUD

### Phase 5 — Payment Logic

Goal:
- implement business rules
- receive payment
- unpaid interest
- credit balance
- profit updates

### Phase 6 — Backup / Restore

Goal:
- JSON export
- JSON restore
- CSV export if useful

### Phase 7 — PWA Polish

Goal:
- app manifest
- icon
- install behavior
- offline experience

### Phase 8 — Production Polish

Goal:
- responsive desktop refinement
- accessibility
- performance
- visual polish

---

## Hallmark Usage Plan

Use Hallmark especially for:
- first dashboard layout
- reusable card design
- landing-like visual quality
- spacing rhythm
- typography hierarchy
- responsive polish
- premium look

Hallmark should guide taste, not product logic.

Prompt style:

```txt
Use Hallmark to improve visual hierarchy, spacing, card design, and responsive polish.
Keep the app dark premium and mobile-first.
Do not change business logic.
```

---

## Success Criteria

The web app should feel:
- usable on iPhone
- premium
- focused
- readable
- fast
- standalone
- not like a generic admin panel

Phase 1 is successful when:
- project runs
- main layout exists
- navigation exists
- placeholder pages exist
- visual direction matches Loan Tracker mobile
- PWA direction is prepared
- no backend/auth/sync is introduced
