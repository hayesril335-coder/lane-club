import { supabase } from '../lib/supabaseClient'

function requireSupabase() {
  if (!supabase) throw new Error('Backend is not configured. Add Supabase values to .env.local.')
  return supabase
}

export async function signUp({ email, password, fullName, role = 'member' }) {
  const client = requireSupabase()
  return client.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role } },
  })
}

export async function signIn({ email, password }) {
  return requireSupabase().auth.signInWithPassword({ email, password })
}

export async function signOut() {
  return requireSupabase().auth.signOut()
}

export async function signInWithGoogle() {
  return requireSupabase().auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  })
}
