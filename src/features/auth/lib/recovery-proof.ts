import { z } from 'zod'

export const recoveryWindowMs = 30 * 60_000
const claimsSchema = z.object({
  sub: z.uuid(),
  session_id: z.uuid(),
  iss: z.string(),
  aud: z.union([z.string(), z.array(z.string())]),
  exp: z.number().int(),
  amr: z.array(z.object({ method: z.string(), timestamp: z.number().int() })),
})
export interface RecoveryProof {
  userId: string
  sessionId: string
  expiresAt: number
}

/** Call only with claims already verified by auth.getClaims(), never decoded local storage. */
export function readRecoveryProof(
  claims: unknown,
  issuer: string,
  now = Date.now(),
): RecoveryProof | null {
  const parsed = claimsSchema.safeParse(claims)
  if (!parsed.success) return null
  const value = parsed.data
  if (
    value.iss !== issuer ||
    !(Array.isArray(value.aud)
      ? value.aud.includes('authenticated')
      : value.aud === 'authenticated') ||
    value.exp * 1000 <= now
  )
    return null
  const times = value.amr
    .filter((entry) => entry.method === 'recovery' && entry.timestamp * 1000 <= now + 60_000)
    .map((entry) => entry.timestamp * 1000)
  const recoveredAt = Math.max(...times)
  const expiresAt = Math.min(value.exp * 1000, recoveredAt + recoveryWindowMs)
  return expiresAt > now ? { userId: value.sub, sessionId: value.session_id, expiresAt } : null
}

const completedKey = 'devflow.auth.completed-recovery'
export function wasRecoveryCompleted(sessionId: string): boolean {
  try {
    return sessionStorage.getItem(completedKey) === sessionId
  } catch {
    return false
  }
}
export function completeRecovery(sessionId: string): void {
  // Completion only blocks this tab's UI. It never grants access or stores a credential.
  try {
    sessionStorage.setItem(completedKey, sessionId)
  } catch {
    /* Storage may be blocked. */
  }
}
