# PROJECT RULES

## Architecture
- Use Next.js App Router
- Use TypeScript everywhere
- Keep components reusable and small
- Keep business logic outside UI components
- Prefer server-safe patterns
- Avoid over-engineering

## UI Direction
Design style:
- dark premium finance UI
- iPhone-first responsive layout
- soft borders
- rounded cards
- clean spacing rhythm
- minimal visual noise

## Hallmark
Use Hallmark skill for:
- spacing consistency
- typography hierarchy
- responsive polish
- reusable UI patterns

Do not:
- redesign randomly
- introduce inconsistent layouts
- overuse gradients/shadows

## State Management
- Prefer local component state first
- Use lightweight global state only when necessary
- Use Supabase as backend source of truth

## Important
This web app is standalone.

The folder named "Loan Tracker" is the existing mobile app.
Use it only as reference for:
- design language
- UX flow
- terminology
- business concepts

Do NOT:
- connect databases together
- reuse Expo APIs
- copy React Native code directly
