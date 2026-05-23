create table if not exists public.loans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  borrower_name text not null,
  principal numeric not null,
  interest_rate numeric not null,
  payment_cycle text not null,
  current_due_date date not null,
  accumulated_profit numeric not null default 0,
  unpaid_interest numeric not null default 0,
  credit_balance numeric not null default 0,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint loans_status_check check (status in ('active', 'closed')),
  constraint loans_payment_cycle_check check (
    payment_cycle in ('daily', 'weekly', 'biweekly', 'every_10_days', 'monthly')
  ),
  constraint loans_principal_check check (principal >= 0),
  constraint loans_interest_rate_check check (interest_rate >= 0),
  constraint loans_accumulated_profit_check check (accumulated_profit >= 0),
  constraint loans_unpaid_interest_check check (unpaid_interest >= 0),
  constraint loans_credit_balance_check check (credit_balance >= 0)
);

alter table public.loans
add column if not exists unpaid_interest numeric not null default 0;

alter table public.loans
add column if not exists credit_balance numeric not null default 0;

alter table public.loans
drop constraint if exists loans_payment_cycle_check;

alter table public.loans
add constraint loans_payment_cycle_check check (
  payment_cycle in ('daily', 'weekly', 'biweekly', 'every_10_days', 'monthly')
);

alter table public.loans enable row level security;

drop policy if exists "Users can select own loans" on public.loans;
create policy "Users can select own loans"
on public.loans
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can insert own loans" on public.loans;
create policy "Users can insert own loans"
on public.loans
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can update own loans" on public.loans;
create policy "Users can update own loans"
on public.loans
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can delete own loans" on public.loans;
create policy "Users can delete own loans"
on public.loans
for delete
to authenticated
using (user_id = auth.uid());

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_loans_updated_at on public.loans;
create trigger set_loans_updated_at
before update on public.loans
for each row
execute function public.set_updated_at();

create table if not exists public.payment_histories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  loan_id uuid not null references public.loans(id) on delete cascade,
  type text not null,
  amount numeric not null default 0,
  note text,
  created_at timestamptz not null default now(),
  constraint payment_histories_type_check check (
    type in (
      'payment_received',
      'partial_payment',
      'overpayment',
      'reschedule',
      'loan_closed'
    )
  ),
  constraint payment_histories_amount_check check (amount >= 0)
);

alter table public.payment_histories enable row level security;

drop policy if exists "Users can select own payment histories" on public.payment_histories;
create policy "Users can select own payment histories"
on public.payment_histories
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can insert own payment histories" on public.payment_histories;
create policy "Users can insert own payment histories"
on public.payment_histories
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can update own payment histories" on public.payment_histories;
create policy "Users can update own payment histories"
on public.payment_histories
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can delete own payment histories" on public.payment_histories;
create policy "Users can delete own payment histories"
on public.payment_histories
for delete
to authenticated
using (user_id = auth.uid());
