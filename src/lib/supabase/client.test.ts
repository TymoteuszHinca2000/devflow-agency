import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('Supabase browser client', () => {
  it('can be imported without configuration and reports the problem on first use', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', '')
    const { getSupabase } = await import('./client')
    expect(() => getSupabase()).toThrow('Nieprawidłowa konfiguracja Supabase.')
  })

  it('recovers after validation fails and reuses one client without making a request', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', '')
    const request = vi.fn()
    vi.stubGlobal('fetch', request)
    const { getSupabase } = await import('./client')
    expect(() => getSupabase()).toThrow('Nieprawidłowa konfiguracja Supabase.')

    vi.stubEnv('VITE_SUPABASE_URL', 'https://client-test.supabase.co')
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test-only-public-key')
    const client = getSupabase()
    expect(getSupabase()).toBe(client)
    expect(request).not.toHaveBeenCalled()
    await client.auth.stopAutoRefresh()
  })
})
