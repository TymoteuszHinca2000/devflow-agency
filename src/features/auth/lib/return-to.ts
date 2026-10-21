/** Only normalized application routes can be post-login destinations. */
export function getSafeReturnTo(value: string | null): string {
  if (
    !value ||
    value.includes('\\') ||
    Array.from(value).some((character) => character.charCodeAt(0) <= 32)
  )
    return '/app'
  try {
    const url = new URL(value, 'https://devflow.invalid')
    if (
      url.origin !== 'https://devflow.invalid' ||
      (url.pathname !== '/app' && !url.pathname.startsWith('/app/'))
    )
      return '/app'
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return '/app'
  }
}
