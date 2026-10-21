import { ArrowLeft, Compass } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="route-not-found">
      <span className="route-status-icon">
        <Compass size={34} aria-hidden="true" />
      </span>
      <p className="eyebrow">404 · NIEZNANY ADRES</p>
      <h1 id="route-title">Nie znaleźliśmy tej strony.</h1>
      <p className="route-description">
        Ten adres nie prowadzi do żadnej strony DevFlow. Sprawdź link lub wybierz miejsce, od
        którego chcesz zacząć.
      </p>
      <div className="route-actions">
        <Button asChild>
          <Link to="/">
            <ArrowLeft size={17} aria-hidden="true" />
            Strona główna
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/app">Przejdź do modułów</Link>
        </Button>
      </div>
    </div>
  )
}
