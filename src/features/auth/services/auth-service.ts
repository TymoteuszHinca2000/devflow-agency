import type { LoginValues } from '../validation/login-schema'

export async function signInWithEmail(values: LoginValues): Promise<void> {
  const { getSupabase } = await import('@/lib/supabase/client')
  const { error } = await getSupabase().auth.signInWithPassword(values)
  if (error) throw error
}

export async function signOut(): Promise<void> {
  const { getSupabase } = await import('@/lib/supabase/client')
  const { error } = await getSupabase().auth.signOut({ scope: 'local' })
  if (error) throw error
}
