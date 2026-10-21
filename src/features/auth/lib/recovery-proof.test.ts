import { describe, expect, it } from 'vitest'
import { readRecoveryProof } from './recovery-proof'
const now = 1_800_000_000_000
const issuer = 'https://auth.devflow.test/auth/v1'
const claims = {
  sub: '10000000-0000-4000-8000-000000000099',
  session_id: '20000000-0000-4000-8000-000000000099',
  iss: issuer,
  aud: 'authenticated',
  exp: now / 1000 + 3600,
  amr: [{ method: 'recovery', timestamp: now / 1000 - 120 }],
}
describe('verified recovery proof boundaries', () => {
  it('binds access to the session and original recovery time, not the time of reload', () => {
    expect(readRecoveryProof(claims, issuer, now)).toEqual({
      userId: claims.sub,
      sessionId: claims.session_id,
      expiresAt: now - 120_000 + 1_800_000,
    })
    expect(readRecoveryProof(claims, issuer, now + 1_700_000)).toBeNull()
  })
  it('rejects incorrect issuer, audience, expiry, missing proof and future recovery timestamps', () => {
    for (const value of [
      null,
      { ...claims, iss: 'https://other.test/auth/v1' },
      { ...claims, aud: 'anon' },
      { ...claims, exp: now / 1000 - 1 },
      { ...claims, amr: [] },
      { ...claims, amr: [{ method: 'password', timestamp: now / 1000 }] },
      { ...claims, amr: [{ method: 'recovery', timestamp: now / 1000 + 120 }] },
    ])
      expect(readRecoveryProof(value, issuer, now)).toBeNull()
  })
})
