create extension if not exists "pgcrypto";

create type public.user_role as enum ('member', 'owner', 'admin');
create type public.membership_status as enum ('active', 'paused', 'cancelled', 'past_due');
create type public.reservation_status as enum ('confirmed', 'checked_in', 'cancelled');
create type public.lane_status as enum ('available', 'maintenance', 'disabled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  role public.user_role not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'member')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table public.bowling_alleys (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  address_line_1 text not null,
  city text not null,
  state text not null,
  phone text,
  website text,
  timezone text not null default 'America/Los_Angeles',
  membership_price_cents integer not null check (membership_price_cents > 0),
  owner_subscription_status public.membership_status not null default 'active',
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lanes (
  id uuid primary key default gen_random_uuid(),
  alley_id uuid not null references public.bowling_alleys(id) on delete cascade,
  lane_number integer not null check (lane_number > 0),
  display_name text,
  status public.lane_status not null default 'available',
  created_at timestamptz not null default now(),
  unique (alley_id, lane_number)
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles(id) on delete cascade,
  alley_id uuid not null references public.bowling_alleys(id) on delete cascade,
  status public.membership_status not null default 'active',
  monthly_price_cents integer not null check (monthly_price_cents > 0),
  stripe_customer_id text,
  stripe_subscription_id text unique,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (member_id, alley_id)
);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  membership_id uuid not null references public.memberships(id) on delete cascade,
  lane_id uuid not null references public.lanes(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  duration_hours numeric(3,1) not null check (duration_hours > 0 and duration_hours <= 4),
  status public.reservation_status not null default 'confirmed',
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index reservations_lane_schedule_idx on public.reservations(lane_id, starts_at, ends_at) where status <> 'cancelled';
create index reservations_membership_schedule_idx on public.reservations(membership_id, starts_at) where status <> 'cancelled';

create view public.weekly_membership_usage with (security_invoker = true) as
select
  membership_id,
  date_trunc('week', starts_at at time zone 'America/Los_Angeles')::date as week_start,
  coalesce(sum(duration_hours) filter (where status <> 'cancelled'), 0) as hours_used
from public.reservations
group by membership_id, date_trunc('week', starts_at at time zone 'America/Los_Angeles')::date;

create or replace function public.create_reservation(
  p_membership_id uuid,
  p_lane_id uuid,
  p_starts_at timestamptz,
  p_duration_hours numeric
) returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_membership public.memberships;
  v_lane public.lanes;
  v_ends_at timestamptz := p_starts_at + make_interval(secs => (p_duration_hours * 3600)::integer);
  v_used_hours numeric := 0;
  v_reservation public.reservations;
begin
  select * into v_membership from public.memberships where id = p_membership_id and member_id = auth.uid();
  if not found or v_membership.status <> 'active' then raise exception 'Active membership required'; end if;
  if p_duration_hours <= 0 or p_duration_hours > 4 then raise exception 'Reservation duration must be between 0 and 4 hours'; end if;

  select * into v_lane from public.lanes where id = p_lane_id and alley_id = v_membership.alley_id and status = 'available';
  if not found then raise exception 'Selected lane is unavailable'; end if;

  select coalesce(sum(duration_hours), 0) into v_used_hours
  from public.reservations
  where membership_id = p_membership_id
    and status <> 'cancelled'
    and date_trunc('week', starts_at at time zone 'America/Los_Angeles') = date_trunc('week', p_starts_at at time zone 'America/Los_Angeles');
  if v_used_hours + p_duration_hours > 4 then raise exception 'Weekly reservation limit of 4 hours exceeded'; end if;

  if exists (
    select 1 from public.reservations
    where lane_id = p_lane_id and status <> 'cancelled'
      and starts_at < v_ends_at and ends_at > p_starts_at
  ) then raise exception 'Lane is already booked for that time'; end if;

  insert into public.reservations(membership_id, lane_id, starts_at, ends_at, duration_hours)
  values (p_membership_id, p_lane_id, p_starts_at, v_ends_at, p_duration_hours)
  returning * into v_reservation;
  return v_reservation;
end;
$$;

alter table public.profiles enable row level security;
alter table public.bowling_alleys enable row level security;
alter table public.lanes enable row level security;
alter table public.memberships enable row level security;
alter table public.reservations enable row level security;

create policy "profiles read own" on public.profiles for select using (id = auth.uid());
create policy "profiles update own" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "alleys public read" on public.bowling_alleys for select using (true);
create policy "owners manage their alleys" on public.bowling_alleys for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "lanes public read" on public.lanes for select using (true);
create policy "owners manage lanes" on public.lanes for all using (exists (select 1 from public.bowling_alleys a where a.id = alley_id and a.owner_id = auth.uid())) with check (exists (select 1 from public.bowling_alleys a where a.id = alley_id and a.owner_id = auth.uid()));
create policy "members view own memberships" on public.memberships for select using (member_id = auth.uid());
create policy "members view own reservations" on public.reservations for select using (exists (select 1 from public.memberships m where m.id = membership_id and m.member_id = auth.uid()));

grant execute on function public.create_reservation(uuid, uuid, timestamptz, numeric) to authenticated;
