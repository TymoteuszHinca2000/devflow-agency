import { getSupabase } from '@/lib/supabase/client'
import { readSupabaseConfiguration } from '@/lib/supabase/config'
import { completeRecovery, readRecoveryProof, wasRecoveryCompleted } from '../lib/recovery-proof'

export interface PasswordResult {
  otherSessionsRevoked: boolean
}
export interface RecoveryAccess {
  userId: string
  updatePassword: (password: string) => Promise<PasswordResult>
}

export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await getSupabase().auth.resetPasswordForEmail(email, {
    redirectTo: new URL('/auth/recovery', window.location.origin).href,
  })
  if (error) throw error
}

async function savePassword(password: string): Promise<PasswordResult> {
  const client = getSupabase()
  const { error } = await client.auth.updateUser({ password })
  if (error) throw error
  // A failed revocation must never make a successful password change look unsuccessful.
  try {
    const result = await client.auth.signOut({ scope: 'others' })
    return { otherSessionsRevoked: !result.error }
  } catch {
    return { otherSessionsRevoked: false }
  }
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  password: string,
): Promise<PasswordResult> {
  const client = getSupabase()
  const verified = await client.auth.getUser()
  if (verified.error) throw verified.error
  if (verified.data.user.id !== userId || !verified.data.user.email)
    throw new Error('identity-changed')
  // Verify the current password even when the project's optional current_password policy is off.
  const signedIn = await client.auth.signInWithPassword({
    email: verified.data.user.email,
    password: currentPassword,
  })
  if (signedIn.error) throw signedIn.error
  if (signedIn.data.user.id !== userId) throw new Error('identity-changed')
  return savePassword(password)
}

async function verifiedRecoveryProof() {
  const client = getSupabase()
  const claims = await client.auth.getClaims()
  if (claims.error) throw claims.error
  const issuer = new URL('/auth/v1', readSupabaseConfiguration(import.meta.env).url).href
  const proof = readRecoveryProof(claims.data?.claims, issuer)
  if (!proof || wasRecoveryCompleted(proof.sessionId)) return null
  const verified = await client.auth.getUser()
  if (verified.error) throw verified.error
  if (verified.data.user.id !== proof.userId) throw new Error('identity-changed')
  return proof
}

/** Reconstruct only from a verified, recent recovery session; never from a URL/storage flag. */
export async function resumePasswordRecovery(): Promise<RecoveryAccess | null> {
  const proof = await verifiedRecoveryProof()
  if (!proof) return null
  let consumed = false
  return {
    userId: proof.userId,
    async updatePassword(password) {
      if (consumed || Date.now() >= proof.expiresAt) throw new Error('recovery-expired')
      const current = await verifiedRecoveryProof()
      if (!current || current.sessionId !== proof.sessionId || current.userId !== proof.userId)
        throw new Error('identity-changed')
      const result = await savePassword(password)
      consumed = true
      completeRecovery(proof.sessionId)
      return result
    },
  }
}

export async function openPasswordRecovery(code: string, flowId?: string): Promise<RecoveryAccess> {
  const client = getSupabase()
  const { data, error } = await client.auth.exchangeCodeForSession(
    code,
    flowId ? { flowId } : undefined,
  )
  if (error) throw error
  if (!('redirectType' in data) || data.redirectType !== 'recovery')
    throw new Error('wrong-recovery-flow')
  const access = await resumePasswordRecovery()
  if (!access || access.userId !== data.user.id) throw new Error('identity-changed')
  return access
}
