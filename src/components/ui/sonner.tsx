import { CircleCheck, Info, OctagonX, TriangleAlert, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Toaster as Sonner } from 'sonner'
import { useTheme } from '@/lib/theme/theme-context'

export function Toaster() {
  const { preference } = useTheme()
  const regionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const region = regionRef.current
    if (!region) return
    let previousFocus: HTMLElement | null = null

    function rememberFocus(event: FocusEvent) {
      if (event.relatedTarget instanceof HTMLElement && !region?.contains(event.relatedTarget)) {
        previousFocus = event.relatedTarget
      }
    }

    function returnFocus(event: KeyboardEvent) {
      if (event.key !== 'Escape' || !previousFocus?.isConnected) return
      event.preventDefault()
      const target = previousFocus
      // Let Sonner collapse the stack and resume its timers before leaving it.
      window.setTimeout(() => {
        if (target.isConnected) target.focus({ preventScroll: true })
      }, 0)
    }

    region.addEventListener('focusin', rememberFocus)
    region.addEventListener('keydown', returnFocus)
    return () => {
      region.removeEventListener('focusin', rememberFocus)
      region.removeEventListener('keydown', returnFocus)
    }
  }, [])

  return (
    <Sonner
      ref={regionRef}
      theme={preference}
      className="devflow-toaster"
      customAriaLabel="Powiadomienia (Alt+T)"
      position="bottom-right"
      visibleToasts={3}
      closeButton
      gap={12}
      offset={24}
      mobileOffset={{
        left: 'max(16px, env(safe-area-inset-left))',
        right: 'max(16px, env(safe-area-inset-right))',
        bottom: 'max(16px, env(safe-area-inset-bottom))',
      }}
      toastOptions={{ unstyled: true, closeButtonAriaLabel: 'Zamknij powiadomienie' }}
      icons={{
        success: <CircleCheck size={20} aria-hidden="true" />,
        info: <Info size={20} aria-hidden="true" />,
        warning: <TriangleAlert size={20} aria-hidden="true" />,
        error: <OctagonX size={20} aria-hidden="true" />,
        close: <X size={18} aria-hidden="true" />,
      }}
    />
  )
}
