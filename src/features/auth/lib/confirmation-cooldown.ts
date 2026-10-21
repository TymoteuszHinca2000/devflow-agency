const storageKey = 'devflow.auth.confirmation-cooldown'
export const confirmationCooldownMs = 60_000

export function readConfirmationDeadline(): number {
  try {
    const value = Number(sessionStorage.getItem(storageKey))
    const now = Date.now()
    return Number.isFinite(value) && value > now && value <= now + confirmationCooldownMs
      ? value
      : 0
  } catch {
    return 0
  }
}

/** UI convenience only; Supabase enforces the actual rate limits. No email or password is stored. */
export function saveConfirmationDeadline(): number {
  const deadline = Date.now() + confirmationCooldownMs
  try {
    sessionStorage.setItem(storageKey, String(deadline))
  } catch {
    /* Storage may be blocked. */
  }
  return deadline
}
