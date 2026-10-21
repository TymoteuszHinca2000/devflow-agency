import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthApiError } from '@supabase/supabase-js'
import { verifiedTestUser } from '@/test/auth-user'
import {
  changePassword,
  openPasswordRecovery,
  requestPasswordReset,
  resumePasswordRecovery,
} from './password-service'

const api = vi.hoisted(() => ({
  getUser: vi.fn(),
  getClaims: vi.fn(),
  signInWithPassword: vi.fn(),
  updateUser: vi.fn(),
  signOut: vi.fn(),
  exchangeCodeForSession: vi.fn(),
  resetPasswordForEmail: vi.fn(),
}))
vi.mock('@/lib/supabase/client', () => ({ getSupabase: () => ({ auth: api }) }))
vi.mock('@/lib/supabase/config', () => ({
  readSupabaseConfiguration: () => ({ url: 'https://auth.devflow.test' }),
}))
const user = { ...verifiedTestUser, last_sign_in_at: '2026-01-01T00:00:00Z' }
function claims() {
  return {
    sub: user.id,
    iss: 'https://auth.devflow.test/auth/v1',
    aud: 'authenticated',
    session_id: '20000000-0000-4000-8000-000000000099',
    exp: Math.floor(Date.now() / 1000) + 3600,
    amr: [{ method: 'recovery', timestamp: Math.floor(Date.now() / 1000) }],
  }
}
beforeEach(() => {
  vi.resetAllMocks()
  sessionStorage.clear()
  api.getClaims.mockResolvedValue({ data: { claims: claims() }, error: null })
  api.getUser.mockResolvedValue({ data: { user }, error: null })
  api.signInWithPassword.mockResolvedValue({ data: { user }, error: null })
  api.updateUser.mockResolvedValue({ data: { user }, error: null })
  api.signOut.mockResolvedValue({ error: null })
  api.exchangeCodeForSession.mockResolvedValue({
    data: { user, redirectType: 'recovery' },
    error: null,
  })
  api.resetPasswordForEmail.mockResolvedValue({ error: null })
})
describe('password operations', () => {
  it('requests a recovery link only for the fixed current-origin callback', async () => {
    await requestPasswordReset('test@example.test')
    expect(api.resetPasswordForEmail).toHaveBeenCalledWith('test@example.test', {
      redirectTo: `${window.location.origin}/auth/recovery`,
    })
  })
  it('verifies the current password before writing and revokes other sessions only', async () => {
    await changePassword(user.id, 'old password ', 'new password with spaces ')
    expect(api.signInWithPassword).toHaveBeenCalledWith({
      email: user.email,
      password: 'old password ',
    })
    expect(api.updateUser).toHaveBeenCalledWith({ password: 'new password with spaces ' })
    expect(api.signOut).toHaveBeenCalledWith({ scope: 'others' })
  })
  it('never updates after a rejected current password', async () => {
    api.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: new AuthApiError('private', 400, 'invalid_credentials'),
    })
    await expect(changePassword(user.id, 'wrong', 'new password')).rejects.toBeDefined()
    expect(api.updateUser).not.toHaveBeenCalled()
  })
  it('rejects account switches before attempting reauthentication', async () => {
    await expect(changePassword('different-user', 'old', 'new')).rejects.toThrow('identity-changed')
    expect(api.signInWithPassword).not.toHaveBeenCalled()
  })
  it('reports password success separately from revocation failure', async () => {
    api.signOut.mockRejectedValue(new Error('offline'))
    await expect(changePassword(user.id, 'old', 'new')).resolves.toEqual({
      otherSessionsRevoked: false,
    })
  })
  it('requires a recovery exchange rather than a signup callback', async () => {
    api.exchangeCodeForSession.mockResolvedValue({
      data: { user, redirectType: null },
      error: null,
    })
    await expect(openPasswordRecovery('code')).rejects.toThrow('wrong-recovery-flow')
    expect(api.updateUser).not.toHaveBeenCalled()
  })
  it('does not grant access after a failed exchange', async () => {
    api.exchangeCodeForSession.mockResolvedValue({ data: null, error: new Error('expired') })
    await expect(openPasswordRecovery('code')).rejects.toThrow('expired')
    expect(api.getUser).not.toHaveBeenCalled()
  })
  it('binds recovery to the verified identity, passes flow IDs and consumes access once', async () => {
    const access = await openPasswordRecovery('code', 'test-flow-id')
    expect(api.exchangeCodeForSession).toHaveBeenCalledWith('code', { flowId: 'test-flow-id' })
    expect(access.userId).toBe(user.id)
    await access.updatePassword('new password')
    await expect(access.updatePassword('another password')).rejects.toThrow('recovery-expired')
    expect(api.updateUser).toHaveBeenCalledTimes(1)
  })
  it('closes recovery after a later login, even for the same user', async () => {
    const access = await openPasswordRecovery('code')
    api.getClaims.mockResolvedValue({
      data: { claims: { ...claims(), session_id: '30000000-0000-4000-8000-000000000099' } },
      error: null,
    })
    await expect(access.updatePassword('new password')).rejects.toThrow('identity-changed')
    expect(api.updateUser).not.toHaveBeenCalled()
  })
  it('expires recovery after thirty minutes without extending it on reload', async () => {
    const now = Date.now()
    const clock = vi.spyOn(Date, 'now').mockReturnValue(now)
    try {
      const access = await openPasswordRecovery('code')
      clock.mockReturnValue(now + 1_800_001)
      await expect(access.updatePassword('new password')).rejects.toThrow('recovery-expired')
    } finally {
      clock.mockRestore()
    }
    expect(api.updateUser).not.toHaveBeenCalled()
  })
  it('resumes from verified recovery claims, then blocks resumption after successful completion', async () => {
    const access = await resumePasswordRecovery()
    expect(access?.userId).toBe(user.id)
    await access?.updatePassword('new password')
    await expect(resumePasswordRecovery()).resolves.toBeNull()
  })
  it('never trusts claims rejected by the SDK', async () => {
    api.getClaims.mockResolvedValue({
      data: null,
      error: new AuthApiError('bad signature', 401, 'bad_jwt'),
    })
    await expect(resumePasswordRecovery()).rejects.toBeDefined()
    expect(api.updateUser).not.toHaveBeenCalled()
  })
  it('does not resume from an ordinary password session or user metadata', async () => {
    api.getClaims.mockResolvedValue({
      data: {
        claims: {
          ...claims(),
          amr: [{ method: 'password', timestamp: Date.now() / 1000 }],
          user_metadata: { recovery: true },
        },
      },
      error: null,
    })
    await expect(resumePasswordRecovery()).resolves.toBeNull()
  })
})
