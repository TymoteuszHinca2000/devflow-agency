import { useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { updatePageTitle } from './page-title'
import type { AuthState } from '@/features/auth/session/auth-state'

export function RouteEffects({ sessionStatus }: { sessionStatus?: AuthState['status'] }) {
  const { pathname, hash } = useLocation()
  const previousPath = useRef<string | null>(null)
  const previousStatus = useRef<string | null>(null)
  const hasNavigated = useRef(false)

  useLayoutEffect(() => {
    const main = document.querySelector<HTMLElement>('main')
    if (!document.querySelector('[data-page-error]')) updatePageTitle(pathname)

    const firstVisit = previousPath.current === null
    const pathChanged = previousPath.current !== pathname
    if (pathChanged && previousPath.current !== null) hasNavigated.current = true
    const sessionCompleted =
      pathname.startsWith('/app') &&
      sessionStatus === 'signed-in' &&
      previousStatus.current !== sessionStatus &&
      (hasNavigated.current || Boolean(hash))
    previousPath.current = pathname
    previousStatus.current = sessionStatus ?? null
    if ((!pathChanged && !sessionCompleted) || (firstVisit && !hash)) return

    let anchorId = hash.slice(1)
    try {
      anchorId = decodeURIComponent(anchorId)
    } catch {
      // A malformed fragment should not prevent the page from rendering.
    }
    const anchor = anchorId ? document.getElementById(anchorId) : null
    const target = anchor ?? main
    target?.focus({ preventScroll: true })
    if (anchor) anchor.scrollIntoView({ block: 'start' })
    else window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash, sessionStatus])

  return null
}
