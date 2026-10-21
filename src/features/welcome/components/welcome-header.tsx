import { Menu } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Brand } from '@/components/shared/brand'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { WelcomeNavigation } from './welcome-navigation'

export function WelcomeHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const desktopNav = useRef<HTMLElement>(null)
  const mobileNav = useRef<HTMLElement>(null)
  const destination = useRef<string | null>(null)

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1001px)')
    function closeOnDesktop(event: MediaQueryListEvent) {
      if (event.matches) setMenuOpen(false)
    }
    desktop.addEventListener('change', closeOnDesktop)
    return () => desktop.removeEventListener('change', closeOnDesktop)
  }, [])

  return (
    <header className="site-header">
      <div className="site-header-inner page-width">
        <Brand />
        <span className="development-badge">
          <span className="status-dot" /> W budowie
        </span>
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="menu-toggle"
              aria-label="Otwórz nawigację"
            >
              <Menu size={22} aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent
            closeLabel="Zamknij nawigację"
            onOpenAutoFocus={(event) => {
              const firstLink = mobileNav.current?.querySelector<HTMLAnchorElement>('a')
              if (firstLink) {
                event.preventDefault()
                firstLink.focus({ preventScroll: true })
              }
            }}
            onCloseAutoFocus={(event) => {
              const target = destination.current
                ? document.getElementById(destination.current)
                : null
              destination.current = null
              if (target) {
                event.preventDefault()
                target.focus({ preventScroll: true })
                target.scrollIntoView({ block: 'start' })
              } else if (window.matchMedia('(min-width: 1001px)').matches) {
                event.preventDefault()
                desktopNav.current
                  ?.querySelector<HTMLAnchorElement>('a')
                  ?.focus({ preventScroll: true })
              }
            }}
          >
            <SheetHeader>
              <SheetTitle>Nawigacja</SheetTitle>
              <SheetDescription>Przejdź do sekcji lub wybierz motyw.</SheetDescription>
            </SheetHeader>
            <nav ref={mobileNav} className="mobile-navigation" aria-label="Nawigacja główna">
              <WelcomeNavigation
                onSectionNavigate={(id) => {
                  destination.current = id
                  setMenuOpen(false)
                }}
                onExternalNavigate={() => setMenuOpen(false)}
              />
            </nav>
          </SheetContent>
        </Sheet>
        <nav ref={desktopNav} aria-label="Nawigacja główna" className="header-nav">
          <WelcomeNavigation />
        </nav>
      </div>
    </header>
  )
}
