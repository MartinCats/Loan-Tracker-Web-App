# BUSINESS RULES

## Core Concept
This app tracks personal loans and recurring interest payments.

## Multi-user
Each authenticated user only sees their own loans and payment histories.

Use Supabase Row Level Security (RLS).

## Loan States

### Active
Loan is still collecting payments.

### Closed
Loan is completed and archived.

Archived loans are read-only except delete.

## Dashboard Metrics

### Lifetime Profit
Accumulated profit from all active + archived loans.

### Expected Profit
Potential future profit from active loans only.

### Principal Active
Total principal currently active.

### Active Loans
Count of active loans only.

## Payment Rules
- Partial payments are allowed
- Overpayments are prevented
- Reschedule changes due date only
- Closing a loan archives it

## UX Rules
The app should feel:
- fast
- simple
- premium
- readable
- mobile friendly

Primary target:
iPhone 17 PWA experience.
