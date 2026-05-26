create table if not exists public.lender_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  avatar_emoji text not null default '🧑',
  theme_color text not null default 'green',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lender_profiles_name_check check (length(trim(name)) > 0),
  constraint lender_profiles_avatar_emoji_check check (length(trim(avatar_emoji)) > 0),
  constraint lender_profiles_theme_color_check check (
    theme_color in ('green', 'gold', 'blue', 'rose')
  )
);

create table if not exists public.loans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lender_profile_id uuid references public.lender_profiles(id) on delete cascade,
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
add column if not exists lender_profile_id uuid references public.lender_profiles(id) on delete cascade;

alter table public.lender_profiles
add column if not exists avatar_emoji text not null default '🧑';

alter table public.lender_profiles
add column if not exists theme_color text not null default 'green';

update public.lender_profiles
set avatar_emoji = '🧑'
where avatar_emoji is null
  or length(trim(avatar_emoji)) = 0;

update public.lender_profiles
set theme_color = 'green'
where theme_color is null
  or theme_color not in ('green', 'gold', 'blue', 'rose');

alter table public.lender_profiles
drop constraint if exists lender_profiles_avatar_emoji_check;

alter table public.lender_profiles
add constraint lender_profiles_avatar_emoji_check check (length(trim(avatar_emoji)) > 0);

alter table public.lender_profiles
drop constraint if exists lender_profiles_theme_color_check;

alter table public.lender_profiles
add constraint lender_profiles_theme_color_check check (
  theme_color in ('green', 'gold', 'blue', 'rose')
);

alter table public.loans
drop constraint if exists loans_payment_cycle_check;

alter table public.loans
add constraint loans_payment_cycle_check check (
  payment_cycle in ('daily', 'weekly', 'biweekly', 'every_10_days', 'monthly')
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

insert into public.lender_profiles (user_id, name)
select auth_user.id, 'Default lender profile'
from auth.users as auth_user
where not exists (
  select 1
  from public.lender_profiles
  where lender_profiles.user_id = auth_user.id
);

update public.loans
set lender_profile_id = lender_profiles.id
from public.lender_profiles
where loans.lender_profile_id is null
  and lender_profiles.user_id = loans.user_id
  and lender_profiles.id = (
    select selected_profile.id
    from public.lender_profiles as selected_profile
    where selected_profile.user_id = loans.user_id
    order by selected_profile.created_at asc, selected_profile.id asc
    limit 1
  );

alter table public.loans
alter column lender_profile_id set not null;

create index if not exists lender_profiles_user_id_idx
on public.lender_profiles (user_id);

create index if not exists lender_profiles_user_id_created_at_idx
on public.lender_profiles (user_id, created_at);

create index if not exists loans_lender_profile_id_idx
on public.loans (lender_profile_id);

alter table public.lender_profiles enable row level security;

drop policy if exists "Users can select own lender profiles" on public.lender_profiles;
create policy "Users can select own lender profiles"
on public.lender_profiles
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can insert own lender profiles" on public.lender_profiles;
create policy "Users can insert own lender profiles"
on public.lender_profiles
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can update own lender profiles" on public.lender_profiles;
create policy "Users can update own lender profiles"
on public.lender_profiles
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can delete own lender profiles" on public.lender_profiles;
create policy "Users can delete own lender profiles"
on public.lender_profiles
for delete
to authenticated
using (user_id = auth.uid());

alter table public.loans enable row level security;

drop policy if exists "Users can select own loans" on public.loans;
create policy "Users can select own loans"
on public.loans
for select
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.lender_profiles
    where lender_profiles.id = loans.lender_profile_id
      and lender_profiles.user_id = auth.uid()
  )
);

drop policy if exists "Users can insert own loans" on public.loans;
create policy "Users can insert own loans"
on public.loans
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.lender_profiles
    where lender_profiles.id = loans.lender_profile_id
      and lender_profiles.user_id = auth.uid()
  )
);

drop policy if exists "Users can update own loans" on public.loans;
create policy "Users can update own loans"
on public.loans
for update
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.lender_profiles
    where lender_profiles.id = loans.lender_profile_id
      and lender_profiles.user_id = auth.uid()
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.lender_profiles
    where lender_profiles.id = loans.lender_profile_id
      and lender_profiles.user_id = auth.uid()
  )
);

drop policy if exists "Users can delete own loans" on public.loans;
create policy "Users can delete own loans"
on public.loans
for delete
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.lender_profiles
    where lender_profiles.id = loans.lender_profile_id
      and lender_profiles.user_id = auth.uid()
  )
);

drop trigger if exists set_lender_profiles_updated_at on public.lender_profiles;
create trigger set_lender_profiles_updated_at
before update on public.lender_profiles
for each row
execute function public.set_updated_at();

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
      'rescheduled',
      'loan_created',
      'loan_closed'
    )
  ),
  constraint payment_histories_amount_check check (amount >= 0)
);

alter table public.payment_histories
add column if not exists note text;

alter table public.payment_histories
drop constraint if exists payment_histories_type_check;

alter table public.payment_histories
add constraint payment_histories_type_check check (
  type in (
    'payment_received',
    'partial_payment',
    'overpayment',
    'reschedule',
    'rescheduled',
    'loan_created',
    'loan_closed'
  )
);

alter table public.payment_histories enable row level security;

drop policy if exists "Users can select own payment histories" on public.payment_histories;
create policy "Users can select own payment histories"
on public.payment_histories
for select
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.loans as owner_loan
    join public.lender_profiles as owner_profile
      on owner_profile.id = owner_loan.lender_profile_id
    where owner_loan.id = payment_histories.loan_id
      and owner_loan.user_id = auth.uid()
      and owner_profile.user_id = auth.uid()
  )
);

drop policy if exists "Users can insert own payment histories" on public.payment_histories;
create policy "Users can insert own payment histories"
on public.payment_histories
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.loans as owner_loan
    join public.lender_profiles as owner_profile
      on owner_profile.id = owner_loan.lender_profile_id
    where owner_loan.id = payment_histories.loan_id
      and owner_loan.user_id = auth.uid()
      and owner_profile.user_id = auth.uid()
  )
);

drop policy if exists "Users can update own payment histories" on public.payment_histories;
create policy "Users can update own payment histories"
on public.payment_histories
for update
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.loans as owner_loan
    join public.lender_profiles as owner_profile
      on owner_profile.id = owner_loan.lender_profile_id
    where owner_loan.id = payment_histories.loan_id
      and owner_loan.user_id = auth.uid()
      and owner_profile.user_id = auth.uid()
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.loans as owner_loan
    join public.lender_profiles as owner_profile
      on owner_profile.id = owner_loan.lender_profile_id
    where owner_loan.id = payment_histories.loan_id
      and owner_loan.user_id = auth.uid()
      and owner_profile.user_id = auth.uid()
  )
);

drop policy if exists "Users can delete own payment histories" on public.payment_histories;
create policy "Users can delete own payment histories"
on public.payment_histories
for delete
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.loans as owner_loan
    join public.lender_profiles as owner_profile
      on owner_profile.id = owner_loan.lender_profile_id
    where owner_loan.id = payment_histories.loan_id
      and owner_loan.user_id = auth.uid()
      and owner_profile.user_id = auth.uid()
  )
);
