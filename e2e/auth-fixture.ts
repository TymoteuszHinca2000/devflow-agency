import type { BrowserContext } from '@playwright/test'
import { createHash } from 'node:crypto'
import {
  authTestConfirmationCode,
  authTestEmail,
  authTestPassword,
  authTestStorageKey,
  authTestUrl,
} from './auth-config'

export type AuthScenario =
  'signed-out' | 'signed-in' | 'rejected' | 'expired' | 'offline' | 'signup-limited' | 'unconfirmed'
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
  let challenge: string | undefined
  let consumed = false
  const apiHeaders = {
    'x-supabase-api-version': '2024-01-01',
    'access-control-expose-headers': 'X-Supabase-Api-Version',
  }
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
      seed: ['signed-in', 'rejected', 'expired', 'offline'].includes(scenario),
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
    if (url.pathname === '/auth/v1/signup' || url.pathname === '/auth/v1/resend') {
      if (scenario === 'signup-limited') {
        await route.fulfill({
          status: 429,
          headers: apiHeaders,
          json: {
            code: 'over_email_send_rate_limit',
            message: 'Test-only private rate limit detail',
          },
        })
        return
      }
      const body: unknown = request.postDataJSON()
      if (
        typeof body === 'object' &&
        body !== null &&
        'code_challenge' in body &&
        typeof body.code_challenge === 'string'
      )
        challenge = body.code_challenge
      consumed = false
      await route.fulfill({
        status: 200,
        json: url.pathname.endsWith('/signup') ? { ...authTestUser, email_confirmed_at: null } : {},
      })
      return
    }
    if (url.pathname === '/auth/v1/token') {
      const body: unknown = request.postDataJSON()
      if (url.searchParams.get('grant_type') === 'pkce') {
        const valid =
          typeof body === 'object' &&
          body !== null &&
          'auth_code' in body &&
          body.auth_code === authTestConfirmationCode &&
          'code_verifier' in body &&
          typeof body.code_verifier === 'string' &&
          createHash('sha256').update(body.code_verifier).digest('base64url') === challenge &&
          !consumed
        if (valid) {
          consumed = true
          await route.fulfill({ status: 200, json: createAuthTestSession() })
        } else
          await route.fulfill({
            status: 400,
            headers: apiHeaders,
            json: { code: 'flow_state_expired', message: 'Test-only expired code detail' },
          })
        return
      }
      if (scenario === 'unconfirmed') {
        await route.fulfill({
          status: 400,
          headers: apiHeaders,
          json: { code: 'email_not_confirmed', message: 'Test-only unconfirmed email detail' },
        })
        return
      }
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
