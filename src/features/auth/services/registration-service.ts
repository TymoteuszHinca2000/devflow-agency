import { isAuthError } from '@supabase/supabase-js'
import { getConfirmationUrl } from '../lib/confirmation-url'
import type { RegistrationValues } from '../validation/registration-schema'

export async function registerWithEmail(
  values: RegistrationValues,
  returnTo: string,
): Promise<void> {
  const { getSupabase } = await import('@/lib/supabase/client')
  const { error } = await getSupabase().auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: { display_name: values.displayName },
      emailRedirectTo: getConfirmationUrl(window.location.origin, returnTo),
    },
  })
  // Keep the UI neutral for existing accounts, including older server error variants.
  if (
    error &&
    !(isAuthError(error) && ['user_already_exists', 'email_exists'].includes(error.code ?? ''))
  )
    throw error
}

export async function resendConfirmation(email: string, returnTo: string): Promise<void> {
  const { getSupabase } = await import('@/lib/supabase/client')
  const { error } = await getSupabase().auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: getConfirmationUrl(window.location.origin, returnTo) },
  })
  if (error) throw error
}

export async function exchangeConfirmationCode(code: string, flowId?: string): Promise<void> {
  const { getSupabase } = await import('@/lib/supabase/client')
  const { error } = await getSupabase().auth.exchangeCodeForSession(
    code,
    flowId ? { flowId } : undefined,
  )
  if (error) throw error
}
