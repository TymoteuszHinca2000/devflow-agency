import type { BrowserContext } from '@playwright/test'
import { authTestEmail, authTestPassword, authTestStorageKey, authTestUrl } from './auth-config'

export type AuthScenario = 'signed-out' | 'signed-in' | 'rejected' | 'expired' | 'offline'
export const authTestUser = {
  id: '10000000-0000-4000-8000-000000000099',
  aud: 'authenticated',
  role: 'authenticated',
  email: authTestEmail,
  email_confirmed_at: '2026-01-01T00:00:00Z',
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: {},
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  identities: [],
}

export function createAuthTestSession(expired = false) {
  const expires = Math.floor(Date.now() / 1000) + (expired ? -3600 : 3600)
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const claims = Buffer.from(
    JSON.stringify({
      sub: authTestUser.id,
      aud: 'authenticated',
      role: 'authenticated',
      exp: expires,
      iat: expires - 3600,
      email: authTestEmail,
      session_id: '20000000-0000-4000-8000-000000000099',
    }),
  ).toString('base64url')
  return {
    access_token: `${header}.${claims}.test-only-invalid-signature`,
    refresh_token: 'test-only-refresh-token',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: expires,
    user: authTestUser,
  }
}

export async function installAuthFixture(context: BrowserContext, scenario: AuthScenario) {
  await context.addInitScript(
    ({ key, session, seed }) => {
      try {
        if (localStorage.getItem('devflow-e2e-auth-initialized')) return
        if (seed) localStorage.setItem(key, JSON.stringify(session))
        localStorage.setItem('devflow-e2e-auth-initialized', 'true')
      } catch {
        /* A storage-blocked browser still has to render public pages. */
      }
    },
    {
      key: authTestStorageKey,
      session: createAuthTestSession(scenario === 'expired'),
      seed: scenario !== 'signed-out',
    },
  )

  await context.route(`${authTestUrl}/**`, async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    if (scenario === 'offline') {
      await route.abort('failed')
      return
    }
    if (url.pathname === '/auth/v1/user') {
      await route.fulfill({
        status: scenario === 'rejected' ? 401 : 200,
        headers: {
          'x-supabase-api-version': '2024-01-01',
          'access-control-expose-headers': 'X-Supabase-Api-Version',
        },
        json:
          scenario === 'rejected'
            ? { code: 'bad_jwt', message: 'Test-only invalid identity' }
            : authTestUser,
      })
      return
    }
    if (url.pathname === '/auth/v1/token') {
      const body: unknown = request.postDataJSON()
      const credentials =
        typeof body === 'object' &&
        body !== null &&
        'email' in body &&
        'password' in body &&
        body.email === authTestEmail &&
        body.password === authTestPassword
      if (url.searchParams.get('grant_type') === 'refresh_token' || credentials) {
        await route.fulfill({ status: 200, json: createAuthTestSession() })
      } else {
        await route.fulfill({
          status: 400,
          headers: {
            'x-supabase-api-version': '2024-01-01',
            'access-control-expose-headers': 'X-Supabase-Api-Version',
          },
          json: { code: 'invalid_credentials', message: 'Test-only invalid credentials' },
        })
      }
      return
    }
    if (url.pathname === '/auth/v1/logout') {
      await route.fulfill({ status: 204 })
      return
    }
    // Unexpected application queries must fail; this is an isolated Auth contract, not a backend.
    await route.abort('blockedbyclient')
  })
}
