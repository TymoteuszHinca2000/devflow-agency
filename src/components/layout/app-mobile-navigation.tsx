import { ArrowLeft, Menu } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { AppNavigation } from './app-navigation'

export function AppMobileNavigation({ sidebarRef }: { sidebarRef: RefObject<HTMLElement | null> }) {
  const [open, setOpen] = useState(false)
  const navigationRef = useRef<HTMLElement>(null)
  const navigated = useRef(false)

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1001px)')
    function closeOnDesktop(event: MediaQueryListEvent) {
      if (event.matches) setOpen(false)
    }
    desktop.addEventListener('change', closeOnDesktop)
    return () => desktop.removeEventListener('change', closeOnDesktop)
  }, [])

  function closeAfterNavigation() {
    navigated.current = true
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="app-menu-toggle min-[1001px]:hidden"
          aria-label="Otwórz menu aplikacji"
        >
          <Menu size={21} aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="app-menu-sheet"
        closeLabel="Zamknij menu aplikacji"
        onOpenAutoFocus={(event) => {
          const first =
            navigationRef.current?.querySelector<HTMLAnchorElement>('a[aria-current="page"]') ??
            navigationRef.current?.querySelector<HTMLAnchorElement>('a')
          if (first) {
            event.preventDefault()
            first.focus()
          }
        }}
        onCloseAutoFocus={(event) => {
          if (navigated.current) {
            event.preventDefault()
            document.getElementById('main-content')?.focus({ preventScroll: true })
            navigated.current = false
          } else if (window.matchMedia('(min-width: 1001px)').matches) {
            event.preventDefault()
            const current =
              sidebarRef.current?.querySelector<HTMLAnchorElement>('a[aria-current="page"]') ??
              sidebarRef.current?.querySelector<HTMLAnchorElement>('.app-nav-link')
            current?.focus({ preventScroll: true })
          }
        }}
      >
        <SheetHeader>
          <SheetTitle>Menu aplikacji</SheetTitle>
          <SheetDescription>Wybierz obszar DevFlow. Moduły są w trakcie rozwoju.</SheetDescription>
        </SheetHeader>
        <AppNavigation navRef={navigationRef} onNavigate={closeAfterNavigation} />
        <Link
          to="/"
          className="app-menu-home"
          onClick={(event) => {
            if (
              event.button === 0 &&
              !event.ctrlKey &&
              !event.metaKey &&
              !event.shiftKey &&
              !event.altKey
            )
              closeAfterNavigation()
          }}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Powrót na stronę główną
        </Link>
      </SheetContent>
    </Sheet>
  )
}
