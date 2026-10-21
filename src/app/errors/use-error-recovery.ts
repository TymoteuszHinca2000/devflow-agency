import { useLayoutEffect } from 'react'
import { updatePageTitle } from '@/app/page-title'

export function useErrorRecovery(reset: () => void, pathname = window.location.pathname) {
  useLayoutEffect(() => {
    document.title = 'Wystąpił problem — DevFlow Agency'
    document.querySelector<HTMLElement>('main')?.focus()
  }, [])

  return function retry() {
    reset()
    // Recovery replaces the fallback; focus the newly committed page.
    window.requestAnimationFrame(() => {
      if (!document.querySelector('[data-page-error]')) {
        updatePageTitle(pathname)
      }
      document.querySelector<HTMLElement>('main')?.focus()
    })
  }
}
