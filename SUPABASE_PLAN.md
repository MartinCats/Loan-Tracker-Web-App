# SUPABASE PLAN

## Goal

Use Supabase as the backend platform for Loan Tracker Web.

Supabase will provide:
- authentication
- database
- row-level security
- API layer
- realtime capability in the future

---

# Core Stack

Frontend:
- Next.js
- React
- TypeScript
- Tailwind CSS
- PWA

Backend Platform:
- Supabase Auth
- Supabase Postgres
- Supabase Row Level Security (RLS)

Deployment:
- Vercel

---

# Authentication Strategy

## Initial Auth Methods

Phase 1:
- email/password only

Possible future:
- Google login
- magic link
- Apple login

---

# Multi-user Rules

Each user:
- only sees their own loans
- only sees their own payment histories
- cannot access other user data

Use:
- user_id foreign keys
- Supabase RLS policies

---

# Initial Database Direction

## loans table

Expected fields:
- id
- user_id
- borrower_name
- principal
- interest_rate
- payment_cycle
- current_due_date
- accumulated_profit
- status
- created_at
- updated_at

---

## payment_histories table

Expected fields:
- id
- user_id
- loan_id
- type
- amount
- note
- created_at

---

# Security Rules

Never trust frontend-only filtering.

All user isolation must be enforced through:
- Supabase Auth
- Row Level Security policies

---

# PWA Direction

The web app should:
- work well on iPhone 17
- support install-to-home-screen
- feel app-like
- prioritize mobile touch UX

---

# Important

Do NOT:
- connect to the mobile Expo app
- share local SQLite storage
- build custom backend server initially
- over-engineer early

---

# Development Strategy

## Phase 1
- project foundation
- responsive shell
- auth-ready UI
- navigation
- PWA setup

## Phase 2
- Supabase auth
- protected routes
- database schema
- RLS policies

## Phase 3
- loan CRUD
- payment flow
- archive
- dashboard metrics

## Phase 4
- export/import
- analytics
- charts
- advanced business insights