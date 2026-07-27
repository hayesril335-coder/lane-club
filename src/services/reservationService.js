import { supabase } from '../lib/supabaseClient'

function requireSupabase() {
  if (!supabase) throw new Error('Backend is not configured. Add Supabase values to .env.local.')
  return supabase
}

export async function createReservation({ membershipId, laneId, startsAt, durationHours }) {
  return requireSupabase().rpc('create_reservation', {
    p_membership_id: membershipId,
    p_lane_id: laneId,
    p_starts_at: startsAt,
    p_duration_hours: durationHours,
  })
}

export async function getWeeklyHours(membershipId, weekStart) {
  return requireSupabase()
    .from('weekly_membership_usage')
    .select('*')
    .eq('membership_id', membershipId)
    .eq('week_start', weekStart)
    .maybeSingle()
}

// Cash is marked paid by the database. Card payments remain pending until a
// connected Stripe Terminal reader confirms the payment intent.
export async function createWalkInReservation({ laneId, startsAt, durationHours, guestName, guestPhone, paymentMethod, amountCents }) {
  return requireSupabase().rpc('create_walk_in_reservation', {
    p_lane_id: laneId,
    p_starts_at: startsAt,
    p_duration_hours: durationHours,
    p_guest_name: guestName,
    p_guest_phone: guestPhone,
    p_payment_method: paymentMethod,
    p_amount_cents: amountCents,
  })
}
