import { getSafeReturnTo } from './return-to'

export function getConfirmationUrl(origin: string, returnTo: string | null): string {
  const url = new URL('/auth/confirm', origin)
  url.searchParams.set('returnTo', getSafeReturnTo(returnTo))
  return url.href
}

export type ConfirmationCallback =
  | { status: 'ready'; code: string; flowId?: string; returnTo: string }
  | { status: 'invalid'; returnTo: string }

/** Accept PKCE only. Never ingest access tokens, recovery tokens or server descriptions. */
export function readConfirmationCallback(
  search: string,
  hash: string,
  purpose: 'signup' | 'recovery' = 'signup',
): ConfirmationCallback {
  const query = new URLSearchParams(search)
  const fragment = new URLSearchParams(hash.slice(1))
  const returnTo = getSafeReturnTo(query.get('returnTo'))
  const invalid: ConfirmationCallback = { status: 'invalid', returnTo }
  if (
    [
      'error',
      'error_code',
      'error_description',
      'access_token',
      'refresh_token',
      'token_hash',
    ].some((key) => query.has(key) || fragment.has(key)) ||
    fragment.has('code') ||
    (query.has('type') && (query.getAll('type').length !== 1 || query.get('type') !== purpose))
  )
    return invalid
  const code = query.get('code')
  const flowId = query.get('sb_flow_id')
  if (!code || query.getAll('code').length !== 1 || !/^[a-zA-Z0-9_-]{16,1024}$/.test(code))
    return invalid
  if (
    query.getAll('sb_flow_id').length > 1 ||
    (flowId !== null && !/^[a-zA-Z0-9_-]{8,64}$/.test(flowId))
  )
    return invalid
  return { status: 'ready', code, returnTo, ...(flowId ? { flowId } : {}) }
}
