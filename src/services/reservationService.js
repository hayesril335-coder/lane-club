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
