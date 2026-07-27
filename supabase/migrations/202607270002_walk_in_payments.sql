-- Walk-ins are owned by an alley and do not use a member's weekly allowance.
create type public.payment_method as enum ('cash', 'card');
create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');

alter table public.reservations alter column membership_id drop not null;
alter table public.reservations add column if not exists created_by_owner_id uuid references public.profiles(id);
alter table public.reservations add column if not exists guest_name text;
alter table public.reservations add column if not exists guest_phone text;

create table public.reservation_payments (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null unique references public.reservations(id) on delete cascade,
  alley_id uuid not null references public.bowling_alleys(id) on delete cascade,
  method public.payment_method not null,
  status public.payment_status not null default 'pending',
  amount_cents integer not null check (amount_cents >= 0),
  stripe_payment_intent_id text unique,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

alter table public.reservation_payments enable row level security;
create policy "owners manage their reservation payments" on public.reservation_payments for all using (
  exists (select 1 from public.bowling_alleys a where a.id = alley_id and a.owner_id = auth.uid())
) with check (
  exists (select 1 from public.bowling_alleys a where a.id = alley_id and a.owner_id = auth.uid())
);

create or replace function public.create_walk_in_reservation(
  p_lane_id uuid,
  p_starts_at timestamptz,
  p_duration_hours numeric,
  p_guest_name text,
  p_guest_phone text,
  p_payment_method public.payment_method,
  p_amount_cents integer
) returns public.reservations
language plpgsql security definer set search_path = public
as $$
declare v_lane public.lanes; v_reservation public.reservations; v_ends_at timestamptz;
begin
  select l.* into v_lane from public.lanes l join public.bowling_alleys a on a.id = l.alley_id
  where l.id = p_lane_id and l.status = 'available' and a.owner_id = auth.uid();
  if not found then raise exception 'Only the owner can create a walk-in reservation for an available lane'; end if;
  if p_duration_hours <= 0 then raise exception 'Reservation duration must be positive'; end if;
  v_ends_at := p_starts_at + make_interval(secs => (p_duration_hours * 3600)::integer);
  if exists (select 1 from public.reservations where lane_id = p_lane_id and status <> 'cancelled' and starts_at < v_ends_at and ends_at > p_starts_at) then raise exception 'Lane is already booked for that time'; end if;
  insert into public.reservations (lane_id, starts_at, ends_at, duration_hours, created_by_owner_id, guest_name, guest_phone)
  values (p_lane_id, p_starts_at, v_ends_at, p_duration_hours, auth.uid(), p_guest_name, p_guest_phone) returning * into v_reservation;
  insert into public.reservation_payments (reservation_id, alley_id, method, status, amount_cents, paid_at)
  values (v_reservation.id, v_lane.alley_id, p_payment_method, case when p_payment_method = 'cash' then 'paid'::public.payment_status else 'pending'::public.payment_status end, p_amount_cents, case when p_payment_method = 'cash' then now() else null end);
  return v_reservation;
end;
$$;

grant execute on function public.create_walk_in_reservation(uuid, timestamptz, numeric, text, text, public.payment_method, integer) to authenticated;
