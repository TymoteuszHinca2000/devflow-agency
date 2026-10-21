import { AuthApiError } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { getSupabase } from '@/lib/supabase/client'
import { verifiedTestUser } from '@/test/auth-user'
import {
  registerWithEmail,
  resendConfirmation,
  exchangeConfirmationCode,
} from './registration-service'

const getClient = vi.hoisted(() => vi.fn())
vi.mock('@/lib/supabase/client', () => ({ getSupabase: getClient }))
const signUp = vi.fn<ReturnType<typeof getSupabase>['auth']['signUp']>()
const resend = vi.fn<ReturnType<typeof getSupabase>['auth']['resend']>()
const exchange = vi.fn<ReturnType<typeof getSupabase>['auth']['exchangeCodeForSession']>()
const values = {
  displayName: 'Test Person',
  email: 'unit@example.test',
  password: 'test-only-password',
  confirmPassword: 'test-only-password',
}
beforeEach(() => {
  vi.clearAllMocks()
  getClient.mockReturnValue({ auth: { signUp, resend, exchangeCodeForSession: exchange } })
  signUp.mockResolvedValue({ data: { user: null, session: null }, error: null })
  resend.mockResolvedValue({ data: { user: null, session: null }, error: null })
  exchange.mockResolvedValue({
    data: {
      user: verifiedTestUser,
      session: {
        user: verifiedTestUser,
        access_token: 'test-only-token',
        refresh_token: 'test-only-refresh',
        expires_in: 3600,
        token_type: 'bearer',
      },
    },
    error: null,
  })
})

describe('registration services', () => {
  it('sends only account fields and display metadata; never a role or repeat password', async () => {
    await registerWithEmail(values, '/app/tasks')
    expect(signUp).toHaveBeenCalledWith({
      email: values.email,
      password: values.password,
      options: {
        data: { display_name: values.displayName },
        emailRedirectTo: `${window.location.origin}/auth/confirm?returnTo=%2Fapp%2Ftasks`,
      },
    })
  })
  it.each(['email_exists', 'user_already_exists'] as const)(
    'keeps an existing-account response neutral: %s',
    async (code) => {
      signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: new AuthApiError('private detail', 400, code),
      })
      await expect(registerWithEmail(values, '/app')).resolves.toBeUndefined()
    },
  )
  it('propagates rate limits instead of claiming that a message was sent', async () => {
    const error = new AuthApiError('private detail', 429, 'over_email_send_rate_limit')
    resend.mockResolvedValue({ data: { user: null, session: null }, error })
    await expect(resendConfirmation(values.email, '/app')).rejects.toBe(error)
  })
  it('requests only signup confirmation and applies safe redirect validation again', async () => {
    await resendConfirmation(values.email, 'https://evil.example/app')
    expect(resend).toHaveBeenCalledWith({
      type: 'signup',
      email: values.email,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm?returnTo=%2Fapp` },
    })
  })
  it('passes an explicit flow ID through to the SDK rather than borrowing another verifier', async () => {
    await exchangeConfirmationCode('test-only-code-12345', 'test-flow-123')
    expect(exchange).toHaveBeenCalledWith('test-only-code-12345', { flowId: 'test-flow-123' })
  })
})
