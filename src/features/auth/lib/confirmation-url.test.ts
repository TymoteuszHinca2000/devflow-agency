import { describe, expect, it } from 'vitest'
import { getConfirmationUrl, readConfirmationCallback } from './confirmation-url'

const code = 'test-only-confirmation-code-12345'

describe('confirmation links', () => {
  it('keeps recovery and signup purposes separate and rejects duplicate type markers', () => {
    expect(readConfirmationCallback(`?code=${code}&type=recovery`, '', 'recovery').status).toBe(
      'ready',
    )
    expect(readConfirmationCallback(`?code=${code}&type=signup`, '', 'recovery').status).toBe(
      'invalid',
    )
    expect(
      readConfirmationCallback(`?code=${code}&type=recovery&type=signup`, '', 'recovery').status,
    ).toBe('invalid')
  })
  it('builds the callback on the app origin and only carries a safe application target', () => {
    const result = new URL(
      getConfirmationUrl('https://devflow.example', '/app/tasks?view=list#work'),
    )
    expect(result.origin + result.pathname).toBe('https://devflow.example/auth/confirm')
    expect(result.searchParams.get('returnTo')).toBe('/app/tasks?view=list#work')
    expect(
      new URL(getConfirmationUrl('https://devflow.example', '//evil.example/app')).searchParams.get(
        'returnTo',
      ),
    ).toBe('/app')
  })
  it('accepts an explicit PKCE flow identifier and normalizes the destination', () => {
    expect(
      readConfirmationCallback(
        `?code=${code}&sb_flow_id=valid-flow-123&returnTo=%2Fapp%2Ftasks`,
        '',
      ),
    ).toEqual({ status: 'ready', code, flowId: 'valid-flow-123', returnTo: '/app/tasks' })
  })
  it('supports the SDK default verifier without an explicit flow ID', () => {
    expect(readConfirmationCallback(`?code=${code}`, '')).toEqual({
      status: 'ready',
      code,
      returnTo: '/app',
    })
  })
  it.each([
    '',
    '?code=short',
    `?code=${code}&code=${code}`,
    `?code=${code}&sb_flow_id=bad`,
    `?code=${code}&sb_flow_id=flow12345&sb_flow_id=flow67890`,
    `?code=${code}&type=recovery`,
    `?code=${code}&access_token=untrusted`,
    `?code=${code}&token_hash=untrusted`,
    `?code=${code}&error=access_denied`,
    `?code=${'x'.repeat(1025)}`,
  ])(
    'rejects missing, ambiguous or unsupported credentials without retaining them: %s',
    (search) => {
      expect(readConfirmationCallback(search, '')).toEqual({ status: 'invalid', returnTo: '/app' })
    },
  )
  it.each([
    '#access_token=untrusted',
    '#refresh_token=untrusted',
    '#error_description=private-detail',
    `#code=${code}`,
  ])('rejects implicit credentials and raw error fragments: %s', (hash) => {
    expect(readConfirmationCallback(`?code=${code}`, hash)).toEqual({
      status: 'invalid',
      returnTo: '/app',
    })
  })
})
