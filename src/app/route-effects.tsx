import { useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router'

export function RouteEffects() {
  const { pathname, hash } = useLocation()
  const previousPath = useRef<string | null>(null)

  useLayoutEffect(() => {
    const main = document.querySelector<HTMLElement>('main')
    const heading = main?.querySelector('h1')?.textContent?.trim()
    document.title =
      pathname === '/'
        ? 'DevFlow Agency — Twoja agencja. Jeden flow.'
        : `${heading ?? 'DevFlow Agency'} — DevFlow Agency`

    const firstVisit = previousPath.current === null
    const pathChanged = previousPath.current !== pathname
    previousPath.current = pathname
    if (!pathChanged || (firstVisit && !hash)) return

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
  }, [pathname, hash])

  return null
}
