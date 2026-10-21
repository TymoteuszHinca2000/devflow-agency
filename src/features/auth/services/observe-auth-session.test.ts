import { AuthApiError, AuthRetryableFetchError } from '@supabase/supabase-js'
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { getSupabase } from '@/lib/supabase/client'
import { observeAuthSession } from './observe-auth-session'
import type { AuthState } from '../session/auth-state'

const getClientMock = vi.hoisted(() => vi.fn())
vi.mock('@/lib/supabase/client', () => ({ getSupabase: getClientMock }))

const user: User = {
  id: '10000000-0000-4000-8000-000000000001',
  aud: 'authenticated',
  email: 'unit@example.test',
  app_metadata: {},
  user_metadata: {},
  created_at: '2026-01-01T00:00:00Z',
}
const session: Session = {
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  token_type: 'bearer',
  expires_in: 3600,
  user,
}

describe('Auth session verification', () => {
  let listener: (event: AuthChangeEvent, session: Session | null) => void
  let changes: AuthState[]
  let dispose: (() => void) | undefined
  const unsubscribe = vi.fn()
  const getUser = vi.fn<ReturnType<typeof getSupabase>['auth']['getUser']>()
  const signOut = vi.fn<ReturnType<typeof getSupabase>['auth']['signOut']>()

  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    changes = []
    getUser.mockResolvedValue({ data: { user }, error: null })
    signOut.mockResolvedValue({ error: null })
    getClientMock.mockImplementation(() => ({
      auth: {
        onAuthStateChange: (callback: typeof listener) => {
          listener = callback
          return { data: { subscription: { unsubscribe } } }
        },
        getUser,
        signOut,
      },
    }))
    dispose = undefined
  })
  afterEach(() => {
    dispose?.()
    vi.useRealTimers()
  })
  function start() {
    dispose = observeAuthSession((state) => changes.push(state))
  }

  it('accepts an empty initial session without contacting Auth HTTP', () => {
    start()
    listener('INITIAL_SESSION', null)
    expect(changes.at(-1)).toEqual({ status: 'signed-out', expired: false })
    expect(getUser).not.toHaveBeenCalled()
  })
  it('verifies a stored identity outside the synchronous listener before granting access', async () => {
    start()
    listener('INITIAL_SESSION', session)
    expect(changes.at(-1)).toEqual({ status: 'loading' })
    expect(getUser).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(0)
    expect(getUser).toHaveBeenCalledWith(session.access_token)
    expect(changes.at(-1)).toEqual({ status: 'signed-in', user })
  })
  it('ignores an earlier successful response after the user signs out', async () => {
    let resolve: (value: Awaited<ReturnType<typeof getUser>>) => void = () => {
      throw new Error('Request not started')
    }
    getUser.mockReturnValue(
      new Promise((complete) => {
        resolve = complete
      }),
    )
    start()
    listener('SIGNED_IN', session)
    await vi.advanceTimersByTimeAsync(0)
    listener('SIGNED_OUT', null)
    resolve({ data: { user }, error: null })
    await vi.advanceTimersByTimeAsync(0)
    expect(changes.at(-1)).toEqual({ status: 'signed-out', expired: false })
  })
  it('keeps the same verified account mounted while its token is refreshed', async () => {
    start()
    listener('INITIAL_SESSION', session)
    await vi.advanceTimersByTimeAsync(0)
    expect(changes.at(-1)).toEqual({ status: 'signed-in', user })
    let complete: (value: Awaited<ReturnType<typeof getUser>>) => void = () => {
      throw new Error('Request not started')
    }
    getUser.mockReturnValueOnce(
      new Promise((resolve) => {
        complete = resolve
      }),
    )
    const count = changes.length
    listener('TOKEN_REFRESHED', { ...session, access_token: 'renewed-test-token' })
    await vi.advanceTimersByTimeAsync(0)
    expect(changes).toHaveLength(count)
    complete({ data: { user }, error: null })
    await vi.advanceTimersByTimeAsync(0)
    expect(changes.at(-1)).toEqual({ status: 'signed-in', user })
  })
  it('ignores a stale verification when another account signs in', async () => {
    let first: (value: Awaited<ReturnType<typeof getUser>>) => void = () => {
      throw new Error('Request not started')
    }
    getUser.mockReturnValueOnce(
      new Promise((complete) => {
        first = complete
      }),
    )
    start()
    listener('SIGNED_IN', session)
    await vi.advanceTimersByTimeAsync(0)
    const other = { ...user, id: '10000000-0000-4000-8000-000000000002' }
    getUser.mockResolvedValueOnce({ data: { user: other }, error: null })
    listener('SIGNED_IN', { ...session, user: other, access_token: 'other-test-token' })
    await vi.advanceTimersByTimeAsync(0)
    first({ data: { user }, error: null })
    await vi.advanceTimersByTimeAsync(0)
    expect(changes.at(-1)).toEqual({ status: 'signed-in', user: other })
  })
  it('rejects invalid credentials and asks the SDK to remove the local session', async () => {
    getUser.mockResolvedValue({
      data: { user: null },
      error: new AuthApiError('untrusted private server detail', 401, 'bad_jwt'),
    })
    start()
    listener('INITIAL_SESSION', session)
    await vi.advanceTimersByTimeAsync(0)
    expect(changes.at(-1)).toEqual({ status: 'signed-out', expired: true })
    expect(signOut).toHaveBeenCalledWith({ scope: 'local' })
    expect(JSON.stringify(changes)).not.toContain('private server detail')
  })
  it('rejects an identity whose ID differs from the stored session user', async () => {
    getUser.mockResolvedValue({
      data: { user: { ...user, id: 'forged-other-identity' } },
      error: null,
    })
    start()
    listener('INITIAL_SESSION', session)
    await vi.advanceTimersByTimeAsync(0)
    expect(changes.at(-1)?.status).toBe('signed-out')
  })
  it('fails closed on a network error without treating it as a successful logout', async () => {
    getUser.mockResolvedValue({
      data: { user: null },
      error: new AuthRetryableFetchError('network', 0),
    })
    start()
    listener('INITIAL_SESSION', session)
    await vi.advanceTimersByTimeAsync(0)
    expect(changes.at(-1)?.status).toBe('error')
    expect(signOut).not.toHaveBeenCalled()
  })
  it('limits waiting and ignores the result of a timed-out request', async () => {
    let resolve: (value: Awaited<ReturnType<typeof getUser>>) => void = () => {
      throw new Error('Request not started')
    }
    getUser.mockReturnValue(
      new Promise((complete) => {
        resolve = complete
      }),
    )
    start()
    listener('INITIAL_SESSION', session)
    await vi.advanceTimersByTimeAsync(15_000)
    expect(changes.at(-1)?.status).toBe('error')
    resolve({ data: { user }, error: null })
    await vi.advanceTimersByTimeAsync(0)
    expect(changes.at(-1)?.status).toBe('error')
  })
  it('unsubscribes and ignores in-flight results after disposal', async () => {
    start()
    listener('SIGNED_IN', session)
    dispose?.()
    const count = changes.length
    await vi.runAllTimersAsync()
    expect(unsubscribe).toHaveBeenCalledOnce()
    expect(changes).toHaveLength(count)
    expect(getUser).not.toHaveBeenCalled()
  })
  it('bounds initialization if the SDK never emits an initial state', async () => {
    start()
    await vi.advanceTimersByTimeAsync(15_000)
    expect(changes.at(-1)?.status).toBe('error')
  })
  it('keeps missing configuration inside state instead of throwing at render time', () => {
    getClientMock.mockImplementation(() => {
      throw new Error('private configuration')
    })
    start()
    expect(changes.at(-1)?.status).toBe('error')
    expect(JSON.stringify(changes)).not.toContain('private configuration')
  })
})
