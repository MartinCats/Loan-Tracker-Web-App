# PROJECT RULES — Loan Tracker Web

## Project Identity

This project is **Loan Tracker Web**.

It is a **standalone PWA web app** for personal loan tracking, designed primarily for use on **iPhone 17 Safari / Add to Home Screen**, while still supporting larger screens later.

There is another project folder named:

```txt
Loan Tracker
```

That project is the existing **mobile Expo app**.

Use the mobile app as a reference only for:
- business direction
- design language
- dark premium finance mood
- card hierarchy
- spacing rhythm
- terminology
- loan lifecycle concepts
- interaction philosophy

Do **not** connect this web app to the mobile app.

---

## Hard Boundaries

Do not:
- connect to the mobile app
- share database/storage with the mobile app
- create sync logic
- build backend
- add authentication
- add cloud storage
- use Expo APIs
- copy React Native code directly
- assume the web app and mobile app will share runtime code

This web app must be independently usable.

---

## Product Philosophy

The app should answer quickly:

> “Who owes money, when, and how much profit has this lending activity made?”

The user should be able to open the app and immediately understand:
- active principal
- lifetime profit
- expected profit
- active borrowers
- who is overdue
- who is due soon

---

## Primary Device Target

Primary target:
- iPhone 17
- Safari
- PWA installed to Home Screen

Secondary target:
- desktop browser
- tablet browser

Design mobile-first. Desktop support should improve layout but should not drive the initial design.

---

## Technical Direction

Preferred stack:
- Next.js
- React
- TypeScript
- Tailwind CSS
- PWA-ready architecture
- local-first storage

For Phase 1:
- no real database yet
- no backend
- no auth
- no cloud sync
- placeholder/mock data only

---

## Architecture Rules

Keep layers separated:

```txt
UI
↓
State / hooks
↓
Services / business logic
↓
Storage layer
```

Rules:
- UI must not contain business calculation formulas.
- UI must not directly manage persistence logic.
- Business logic should live in service/helper files.
- Storage logic should be isolated.
- Reusable UI should be componentized.
- Avoid over-engineering early.

---

## Coding Rules

Use:
- TypeScript
- explicit types for domain models
- readable component names
- reusable primitives for cards, buttons, sections, badges

Avoid:
- `any` unless absolutely necessary
- duplicated business logic
- large components with mixed responsibilities
- inline magic numbers everywhere
- random one-off styles

---

## UI Rules

Design direction:
- dark premium finance UI
- minimal
- calm
- clear hierarchy
- large readable numbers
- soft borders
- rounded cards
- subtle glow
- pastel financial accents
- iOS-like polish

Avoid:
- noisy colors
- cluttered dashboards
- heavy shadows
- crypto dashboard energy
- over-animated UI
- overly dense desktop-first tables on mobile

---

## Hallmark Usage

Hallmark should be used to improve:
- spacing consistency
- visual hierarchy
- typography rhythm
- responsive layout
- card design
- dashboard polish
- landing/page composition
- UI taste

Hallmark should **not** be used to:
- change business rules
- invent backend architecture
- add unnecessary animations
- redesign without respecting the existing mobile app direction
- create inconsistent styles

When using Hallmark, prefer prompts such as:

```txt
Use Hallmark to improve spacing, hierarchy, visual polish, and responsive layout only.
Do not change business logic.
Do not redesign the product direction.
```

---

## PWA Rules

The web app should be PWA-friendly from the beginning.

Prepare for:
- Add to Home Screen
- mobile viewport
- app-like navigation
- offline-first mindset
- touch-friendly UI
- safe-area awareness
- bottom navigation if appropriate

Do not rely on browser desktop-only interactions.

---

## Git Workflow Rules

Before each new phase:
1. make sure current work is committed
2. create or use a feature branch when the change is large
3. keep commit messages clear

Suggested commit style:

```txt
Build web app foundation
Add dashboard mock UI
Implement local loan storage
Polish PWA layout
```

---

## Phase Rules

For every phase, before coding:
1. explain implementation plan
2. list files to create/change
3. identify risks
4. wait for approval

Do not generate the entire app at once.

Build phase-by-phase.

---

## Quality Checklist

Every phase should consider:
- TypeScript correctness
- mobile Safari layout
- responsive behavior
- accessibility basics
- readable empty states
- no unnecessary dependencies
- no business logic inside UI
- no broken navigation
- no placeholder text left unintentionally

---

## Current Priority

Phase 1 priority is **foundation only**:
- create app structure
- create layout
- establish design system
- create placeholder pages
- make it feel visually aligned with the mobile app
- prepare for PWA direction

No real loan logic yet.
