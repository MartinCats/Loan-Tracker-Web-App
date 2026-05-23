# BUSINESS RULES — Personal Loan Tracker

## Core Concept

This app tracks **personal loans** and recurring interest payments.

The core use case:

> The user lends money to borrowers and wants to track due dates, received interest, unpaid interest, credit balance, active principal, and lifetime profit.

---

## Product Scope

This web app is standalone.

It follows the same business concepts as the existing mobile app, but it does not sync with it.

---

## Loan Type

Initial supported loan type:

```txt
Interest-only loan
```

Behavior:
- borrower pays interest each cycle
- principal remains unchanged while loan is active
- principal is paid when closing the loan

---

## Loan Status

### Active

A loan currently being tracked.

Active loans can:
- receive payment
- be rescheduled
- be closed
- be deleted if created by mistake

### Closed / Archived

A loan that has been fully paid and moved to archive.

Archived loans:
- are read-only
- keep timeline/history
- keep accumulated profit
- can be deleted only with strong confirmation

---

## One Active Loan Rule

One borrower can have only one active loan.

Rule:

```txt
1 borrower = 1 active loan
```

A borrower may have archived/closed loans in history, but should not have multiple active loans at the same time.

---

## Loan Fields

A loan should contain:

- id
- borrower name
- principal
- interest rate
- payment cycle
- current due date
- unpaid interest
- credit balance
- accumulated profit
- status
- created date
- updated date
- closed date, if closed

---

## Payment Cycle

Supported cycles:

```txt
monthly
every 10 days
```

Future cycles can be added later if needed.

---

## Due Date Logic

### Monthly Cycle

Default behavior:
- next due date keeps the same day of the month

Example:

```txt
May 10 → Jun 10
```

Month-end behavior:
- if the due date is at the end of a month and the next month has fewer days, use the last valid day

Example:

```txt
Jan 31 → Feb 28 / Feb 29
```

### Every 10 Days

Behavior:

```txt
current due date + 10 days
```

---

## Fixed Billing Cycle Rule

If borrower pays early, the next due date is based on the original due date cycle, not the payment date.

Example:

```txt
Due date: May 10
Paid early: May 5
Next due: Jun 10
```

Do not set next due to Jun 5.

---

## Expected Interest

Expected interest is based on:

```txt
principal * interestRate / 100
```

Example:

```txt
principal = 10,000
interestRate = 10
expected interest = 1,000
```

---

## Amount Due

Amount due should consider:
- expected current interest
- unpaid interest
- credit balance

Conceptually:

```txt
amount due = expected interest + unpaid interest - credit balance
```

Amount due should not go below 0.

---

## Partial Payment

If borrower pays less than the amount due:

Example:

```txt
Expected due: 1,000
Paid: 600
Remaining unpaid interest: 400
```

Behavior:
- remaining amount becomes unpaid interest
- due date does not advance
- cycle is not considered fully paid

---

## Full Payment

If borrower pays exactly the amount due:

Behavior:
- cycle is considered paid
- unpaid interest becomes 0
- credit balance becomes 0, unless previous credit logic applies
- next due date advances based on current due date cycle

---

## Overpayment

If borrower pays more than amount due:

Example:

```txt
Due: 1,400
Paid: 2,000
Credit balance: 600
```

Behavior:
- extra amount becomes credit balance
- next cycle can use this credit automatically
- cycle advances if current amount due is fully covered

---

## Credit Balance

Credit balance represents extra money already paid by borrower.

It should reduce future amount due.

---

## Profit Logic

### Accumulated Profit

Accumulated profit counts only actual received interest.

It should not count:
- expected future interest
- unpaid interest
- principal repayment

### Lifetime Profit

Lifetime profit is the sum of accumulated profit across:
- active loans
- archived/closed loans

This should remain visible even when all active loans are closed.

### Expected Profit

Expected profit is projected profit from active loans only.

It should not include archived loans.

---

## Close Loan Logic

To close a loan, borrower must fully pay:
- principal
- current interest
- unpaid interest

Credit balance should be considered.

After closing:
- loan status becomes closed/archived
- closed date is stored
- active actions are disabled
- loan appears in archive

---

## Reschedule Logic

Reschedule changes only the current due date.

It should not change:
- principal
- interest rate
- unpaid interest
- credit balance
- accumulated profit
- payment history

A reschedule event should appear in timeline.

---

## Delete Logic

Delete is different from close.

### Delete

Use when loan was created by mistake.

Behavior:
- requires confirmation
- deletes payment histories first
- then deletes loan
- destructive action

### Close Loan

Use when loan was actually completed.

Behavior:
- preserves history
- moves loan to archive
- contributes to lifetime profit

---

## Dashboard Rules

Dashboard is for business overview and attention.

It should show:
- Lifetime Profit
- Expected Profit
- Principal Active
- Active Loans
- urgent active loans
- overdue loans
- due today loans
- upcoming loans

If there are no active loans:
- Dashboard should still show lifetime profit
- Empty state should not make the business look like it has no history

---

## Loans Page Rules

Loans page is for active loan management.

It should support:
- search borrower
- filters
- sorting
- compact active loan cards
- open detail

It is not primarily an analytics page.

---

## Archive Page Rules

Archive is for closed loan history.

It should show:
- borrower
- closed date
- principal
- profit
- read-only detail

Archived loans should not show active actions.

---

## Timeline Rules

Timeline should show:
- payment received
- partial payment
- overpayment
- reschedule
- close loan
- delete is usually not shown because the loan is removed

Timeline items should be read-only unless a future phase adds detail modals.

---

## Backup Rules

Export backup should preserve:
- loans
- payment histories
- timestamps
- status
- profit data

Restore backup should replace local data, not merge, unless explicitly changed in a future phase.

---

## Localization Rules

Support:
- English
- Thai

Business values must not change based on language.

Only display labels, dates, and formatting should change.

Currency display should use:

```txt
฿
```

for all languages unless changed later.

---

## Important

Money-related logic must be predictable, auditable, and not hidden in UI components.

Business rules should live in service/helper layers, not inside presentation components.
